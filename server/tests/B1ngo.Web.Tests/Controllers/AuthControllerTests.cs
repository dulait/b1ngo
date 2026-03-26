using B1ngo.Application.Common.Ports;
using B1ngo.Infrastructure.Identity;
using B1ngo.Web.Contracts.V1;
using B1ngo.Web.Controllers.V1;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;

namespace B1ngo.Web.Tests.Controllers;

public class AuthControllerTests
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IPlayerTokenStore _playerTokenStore;
    private readonly AuthController _sut;

    public AuthControllerTests()
    {
        _userManager = MockUserManager();
        _signInManager = MockSignInManager(_userManager);
        _playerTokenStore = Substitute.For<IPlayerTokenStore>();
        _sut = new AuthController(_userManager, _signInManager, _playerTokenStore);
        SetupHttpContext(withXhrHeader: true);
    }

    // --- Register ---

    [Fact]
    public async Task Register_Success_Returns200WithAuthResponse()
    {
        _userManager.CreateAsync(Arg.Any<ApplicationUser>(), Arg.Any<string>()).Returns(IdentityResult.Success);

        var result = await _sut.Register(new RegisterRequest("test@example.com", "Password1", "TestUser"));

        var ok = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<AuthResponse>(ok.Value);
        Assert.Equal("test@example.com", response.Email);
        Assert.Equal("TestUser", response.DisplayName);
        await _signInManager.Received(1).SignInAsync(Arg.Any<ApplicationUser>(), isPersistent: true);
    }

    [Fact]
    public async Task Register_DuplicateEmail_Returns400()
    {
        _userManager
            .CreateAsync(Arg.Any<ApplicationUser>(), Arg.Any<string>())
            .Returns(
                IdentityResult.Failed(
                    new IdentityError { Code = "DuplicateEmail", Description = "Email already taken." }
                )
            );

        var result = await _sut.Register(new RegisterRequest("dup@example.com", "Password1", "User"));

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<ErrorResponse>(bad.Value);
        Assert.Equal("RegistrationFailed", response.Code);
    }

    [Fact]
    public async Task Register_MissingXhrHeader_Returns400()
    {
        SetupHttpContext(withXhrHeader: false);

        var result = await _sut.Register(new RegisterRequest("test@example.com", "Password1", "User"));

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<ErrorResponse>(bad.Value);
        Assert.Equal("InvalidRequest", response.Code);
    }

    // --- Login ---

    [Fact]
    public async Task Login_Success_Returns200WithAuthResponse()
    {
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = "login@example.com",
            DisplayName = "LoginUser",
        };

        _signInManager
            .PasswordSignInAsync("login@example.com", "Password1", true, false)
            .Returns(Microsoft.AspNetCore.Identity.SignInResult.Success);
        _userManager.FindByEmailAsync("login@example.com").Returns(user);

        var result = await _sut.Login(new LoginRequest("login@example.com", "Password1"));

        var ok = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<AuthResponse>(ok.Value);
        Assert.Equal("login@example.com", response.Email);
        Assert.Equal("LoginUser", response.DisplayName);
    }

    [Fact]
    public async Task Login_WrongPassword_Returns401WithGenericMessage()
    {
        _signInManager
            .PasswordSignInAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<bool>())
            .Returns(Microsoft.AspNetCore.Identity.SignInResult.Failed);

        var result = await _sut.Login(new LoginRequest("test@example.com", "WrongPassword"));

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        var response = Assert.IsType<ErrorResponse>(unauthorized.Value);
        Assert.Equal("Invalid email or password.", response.Message);
    }

    [Fact]
    public async Task Login_NonexistentEmail_Returns401WithSameGenericMessage()
    {
        _signInManager
            .PasswordSignInAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<bool>())
            .Returns(Microsoft.AspNetCore.Identity.SignInResult.Failed);

        var result = await _sut.Login(new LoginRequest("nonexistent@example.com", "Password1"));

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        var response = Assert.IsType<ErrorResponse>(unauthorized.Value);
        Assert.Equal("Invalid email or password.", response.Message);
    }

    [Fact]
    public async Task Login_MissingXhrHeader_Returns400()
    {
        SetupHttpContext(withXhrHeader: false);

        var result = await _sut.Login(new LoginRequest("test@example.com", "Password1"));

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<ErrorResponse>(bad.Value);
        Assert.Equal("InvalidRequest", response.Code);
    }

    // --- Logout ---

    [Fact]
    public async Task Logout_Success_Returns204()
    {
        var result = await _sut.Logout();

        Assert.IsType<NoContentResult>(result);
        await _signInManager.Received(1).SignOutAsync();
    }

    // --- Me ---

    [Fact]
    public async Task Me_Authenticated_Returns200WithUserInfoAndRoles()
    {
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = "me@example.com",
            DisplayName = "MeUser",
        };

        SetupAuthenticatedUser();
        _userManager.GetUserAsync(Arg.Any<System.Security.Claims.ClaimsPrincipal>()).Returns(user);
        _userManager.GetRolesAsync(user).Returns(new List<string> { "Admin" });

        var result = await _sut.Me();

        var ok = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<MeResponse>(ok.Value);
        Assert.Equal("me@example.com", response.Email);
        Assert.Equal("MeUser", response.DisplayName);
        Assert.Contains("Admin", response.Roles);
    }

    [Fact]
    public async Task Me_Anonymous_Returns204()
    {
        var result = await _sut.Me();

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Me_AuthenticatedButUserNotFound_Returns204()
    {
        SetupAuthenticatedUser();
        _userManager.GetUserAsync(Arg.Any<System.Security.Claims.ClaimsPrincipal>()).Returns((ApplicationUser?)null);

        var result = await _sut.Me();

        Assert.IsType<NoContentResult>(result);
    }

    // --- Helpers ---

    private void SetupAuthenticatedUser()
    {
        var claims = new[]
        {
            new System.Security.Claims.Claim(
                System.Security.Claims.ClaimTypes.NameIdentifier,
                Guid.NewGuid().ToString()
            ),
        };
        var identity = new System.Security.Claims.ClaimsIdentity(claims, "TestAuth");
        _sut.ControllerContext.HttpContext.User = new System.Security.Claims.ClaimsPrincipal(identity);
    }

    private void SetupHttpContext(bool withXhrHeader)
    {
        var httpContext = new DefaultHttpContext();

        if (withXhrHeader)
        {
            httpContext.Request.Headers["X-Requested-With"] = "XMLHttpRequest";
        }

        _sut.ControllerContext = new ControllerContext { HttpContext = httpContext };
    }

    private static UserManager<ApplicationUser> MockUserManager()
    {
        var store = Substitute.For<IUserStore<ApplicationUser>>();
        return Substitute.For<UserManager<ApplicationUser>>(store, null, null, null, null, null, null, null, null);
    }

    private static SignInManager<ApplicationUser> MockSignInManager(UserManager<ApplicationUser> userManager)
    {
        var contextAccessor = Substitute.For<IHttpContextAccessor>();
        var claimsFactory = Substitute.For<IUserClaimsPrincipalFactory<ApplicationUser>>();
        return Substitute.For<SignInManager<ApplicationUser>>(
            userManager,
            contextAccessor,
            claimsFactory,
            null,
            null,
            null,
            null
        );
    }
}
