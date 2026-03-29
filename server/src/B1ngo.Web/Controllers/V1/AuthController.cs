using System.Net;
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
    IPlayerTokenStore playerTokenStore,
    IEmailSender emailSender,
    IConfiguration configuration
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
            if (result.Errors.Any(e => e.Code is "DuplicateEmail" or "DuplicateUserName"))
            {
                return Conflict(new ErrorResponse("DuplicateEmail", "An account with this email already exists."));
            }

            var details = result.Errors.Select(e => e.Description).ToList();
            return BadRequest(new ErrorResponse("RegistrationFailed", string.Join(" ", details), details));
        }

        await signInManager.SignInAsync(user, isPersistent: true);
        await LinkPlayerTokenIfPresent(user.Id, HttpContext.RequestAborted);

        var roles = await userManager.GetRolesAsync(user);
        return Ok(new AuthResponse(user.Id, user.Email, user.DisplayName, roles.ToArray()));
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
            lockoutOnFailure: true
        );

        if (result.IsLockedOut)
        {
            return Unauthorized(new ErrorResponse("AccountLocked", "Account temporarily locked. Try again later."));
        }

        if (!result.Succeeded)
        {
            return Unauthorized(new ErrorResponse("LoginFailed", "Invalid email or password."));
        }

        var user = await userManager.FindByEmailAsync(request.Email);
        await LinkPlayerTokenIfPresent(user!.Id, HttpContext.RequestAborted);

        var roles = await userManager.GetRolesAsync(user);
        return Ok(new AuthResponse(user.Id, user.Email!, user.DisplayName, roles.ToArray()));
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
    [AllowAnonymous]
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
    [EnableRateLimiting("auth")]
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
                await LinkPlayerTokenIfPresent(existingExternalUser.Id, HttpContext.RequestAborted);
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
            var providerEmailVerified = info.Principal.FindFirstValue("email_verified");

            if (!existingUser.EmailConfirmed || providerEmailVerified is not "true")
            {
                return Redirect("/?auth=email-conflict");
            }

            await userManager.AddLoginAsync(existingUser, info);
            await signInManager.SignInAsync(existingUser, isPersistent: true);
            await LinkPlayerTokenIfPresent(existingUser.Id, HttpContext.RequestAborted);
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
        await LinkPlayerTokenIfPresent(newUser.Id, HttpContext.RequestAborted);

        return Redirect("/?auth=success");
    }

    [HttpPost("forgot-password")]
    [RequireXhr]
    [EnableRateLimiting("auth")]
    [EndpointName("ForgotPassword")]
    [EndpointSummary("Request a password reset email")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);

        if (user is null)
        {
            return Ok();
        }

        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var baseUrl = configuration["Email:ResetPassword:BaseUrl"];
        var encodedToken = WebUtility.UrlEncode(token);
        var encodedEmail = WebUtility.UrlEncode(request.Email);
        var resetLink = $"{baseUrl}/auth/reset-password?token={encodedToken}&email={encodedEmail}";

        await emailSender.SendAsync(
            request.Email,
            "Reset your B1ngo password",
            $"""
            <p>We received a request to reset your password.</p>
            <p><a href="{resetLink}">Reset password</a></p>
            <p>This link expires in 60 minutes. If you didn't request this, ignore this email.</p>
            """,
            HttpContext.RequestAborted
        );

        return Ok();
    }

    [HttpPost("reset-password")]
    [RequireXhr]
    [EnableRateLimiting("auth")]
    [EndpointName("ResetPassword")]
    [EndpointSummary("Reset password with token from email")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType<ErrorResponse>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);

        if (user is not null)
        {
            var result = await userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);

            if (result.Succeeded)
            {
                return Ok();
            }
        }

        return BadRequest(new ErrorResponse("ResetFailed", "Unable to reset password."));
    }

    private async Task LinkPlayerTokenIfPresent(Guid userId, CancellationToken ct)
    {
        if (
            Request.Cookies.TryGetValue("PlayerToken", out var tokenStr) && Guid.TryParse(tokenStr, out var playerToken)
        )
        {
            await playerTokenStore.LinkTokenToUserAsync(playerToken, userId, ct);
        }
    }
}
