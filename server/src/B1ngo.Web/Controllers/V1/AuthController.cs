using System.Security.Claims;
using Asp.Versioning;
using B1ngo.Application.Common.Ports;
using B1ngo.Infrastructure.Identity;
using B1ngo.Web.Contracts.V1;
using B1ngo.Web.Filters;
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
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IPlayerTokenStore playerTokenStore
) : ControllerBase
{
    [HttpPost("register")]
    [RequireXhr]
    [EndpointName("Register")]
    [EndpointSummary("Register a new account")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
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
        await LinkPlayerTokenIfPresent(user.Id);

        return Ok(new AuthResponse(user.Id, user.Email, user.DisplayName));
    }

    [HttpPost("login")]
    [RequireXhr]
    [EndpointName("Login")]
    [EndpointSummary("Login with email and password")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status401Unauthorized)]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
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
        await LinkPlayerTokenIfPresent(user!.Id);

        return Ok(new AuthResponse(user.Id, user.Email!, user.DisplayName));
    }

    [HttpPost("logout")]
    [RequireXhr]
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
    [EndpointName("GetCurrentUser")]
    [EndpointSummary("Get current authenticated user info")]
    [EndpointDescription(
        "Returns the current user's profile if authenticated, or 204 No Content if anonymous. "
            + "Used as a session probe on app startup."
    )]
    [ProducesResponseType<MeResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Me()
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            return NoContent();
        }

        var user = await userManager.GetUserAsync(User);

        if (user is null)
        {
            return NoContent();
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
            var existingExternalUser = await userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
            if (existingExternalUser is not null)
            {
                await LinkPlayerTokenIfPresent(existingExternalUser.Id);
            }

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
            await LinkPlayerTokenIfPresent(existingUser.Id);
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
        await LinkPlayerTokenIfPresent(newUser.Id);

        return Redirect("/?auth=success");
    }

    private async Task LinkPlayerTokenIfPresent(Guid userId)
    {
        if (
            Request.Cookies.TryGetValue("PlayerToken", out var tokenStr) && Guid.TryParse(tokenStr, out var playerToken)
        )
        {
            await playerTokenStore.LinkTokenToUserAsync(playerToken, userId);
        }
    }
}
