using System.Security.Claims;
using Asp.Versioning;
using B1ngo.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace B1ngo.Web.Controllers.V1;

[ApiVersion(1)]
[Route("api/v{version:apiVersion}/auth")]
[Produces("application/json")]
[Tags("Auth")]
[ApiController]
public class AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager)
    : ControllerBase
{
    [HttpPost("register")]
    [EndpointName("Register")]
    [EndpointSummary("Register a new account")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!HasXhrHeader())
        {
            return BadRequest(new ErrorResponse("InvalidRequest", "Missing required header."));
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            DisplayName = request.DisplayName,
        };

        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return BadRequest(
                new ErrorResponse(
                    "RegistrationFailed",
                    "Registration failed. Check your input and try again.",
                    result.Errors.Select(e => e.Description).ToList()
                )
            );
        }

        await signInManager.SignInAsync(user, isPersistent: true);

        return Ok(new AuthResponse(user.Id, user.Email, user.DisplayName));
    }

    [HttpPost("login")]
    [EndpointName("Login")]
    [EndpointSummary("Login with email and password")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!HasXhrHeader())
        {
            return BadRequest(new ErrorResponse("InvalidRequest", "Missing required header."));
        }

        var result = await signInManager.PasswordSignInAsync(
            request.Email,
            request.Password,
            isPersistent: true,
            lockoutOnFailure: false
        );

        if (!result.Succeeded)
        {
            return Unauthorized(new ErrorResponse("LoginFailed", "Invalid email or password."));
        }

        var user = await userManager.FindByEmailAsync(request.Email);

        return Ok(new AuthResponse(user!.Id, user.Email!, user.DisplayName));
    }

    [HttpPost("logout")]
    [Authorize]
    [EndpointName("Logout")]
    [EndpointSummary("Logout and clear auth cookie")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout()
    {
        await signInManager.SignOutAsync();
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    [EndpointName("GetCurrentUser")]
    [EndpointSummary("Get current authenticated user info")]
    [ProducesResponseType<MeResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Me()
    {
        var user = await userManager.GetUserAsync(User);

        if (user is null)
        {
            return Unauthorized();
        }

        var roles = await userManager.GetRolesAsync(user);

        return Ok(new MeResponse(user.Id, user.Email!, user.DisplayName, roles.ToArray()));
    }

    [HttpGet("external-login/{provider}")]
    [EndpointName("ExternalLogin")]
    [EndpointSummary("Initiate OAuth login flow")]
    [ProducesResponseType(StatusCodes.Status302Found)]
    [EnableRateLimiting("auth")]
    public IActionResult ExternalLogin(string provider)
    {
        var callbackUrl = Url.Action(nameof(ExternalLoginCallback), "Auth", null, Request.Scheme);
        var properties = signInManager.ConfigureExternalAuthenticationProperties(provider, callbackUrl);
        return Challenge(properties, provider);
    }

    [HttpGet("external-login-callback")]
    [EndpointName("ExternalLoginCallback")]
    [EndpointSummary("Handle OAuth callback")]
    [ProducesResponseType(StatusCodes.Status302Found)]
    public async Task<IActionResult> ExternalLoginCallback()
    {
        var info = await signInManager.GetExternalLoginInfoAsync();

        if (info is null)
        {
            return Redirect("/?auth=error");
        }

        var signInResult = await signInManager.ExternalLoginSignInAsync(
            info.LoginProvider,
            info.ProviderKey,
            isPersistent: true
        );

        if (signInResult.Succeeded)
        {
            return Redirect("/?auth=success");
        }

        var email = info.Principal.FindFirstValue(ClaimTypes.Email);
        var displayName =
            info.Principal.FindFirstValue(ClaimTypes.Name)
            ?? info.Principal.FindFirstValue(ClaimTypes.GivenName)
            ?? "Player";

        if (string.IsNullOrEmpty(email))
        {
            return Redirect("/?auth=error");
        }

        var existingUser = await userManager.FindByEmailAsync(email);

        if (existingUser is not null)
        {
            await userManager.AddLoginAsync(existingUser, info);
            await signInManager.SignInAsync(existingUser, isPersistent: true);
            return Redirect("/?auth=success");
        }

        var newUser = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            DisplayName = displayName,
        };

        var createResult = await userManager.CreateAsync(newUser);

        if (!createResult.Succeeded)
        {
            return Redirect("/?auth=error");
        }

        await userManager.AddLoginAsync(newUser, info);
        await signInManager.SignInAsync(newUser, isPersistent: true);

        return Redirect("/?auth=success");
    }

    private bool HasXhrHeader() =>
        Request.Headers.TryGetValue("X-Requested-With", out var value) && value == "XMLHttpRequest";
}

public sealed record RegisterRequest(string Email, string Password, string DisplayName);

public sealed record LoginRequest(string Email, string Password);

public sealed record AuthResponse(Guid UserId, string Email, string DisplayName);

public sealed record MeResponse(Guid UserId, string Email, string DisplayName, string[] Roles);
