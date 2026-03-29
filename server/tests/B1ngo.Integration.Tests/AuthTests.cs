using System.Net;
using System.Net.Http.Json;
using B1ngo.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace B1ngo.Integration.Tests;

[Collection("Integration")]
public class AuthTests(B1ngoApiFactory factory) : IntegrationTestBase(factory)
{
    private const string AuthBase = "/api/v1/auth";

    private static HttpRequestMessage CreateAuthRequest(HttpMethod method, string url, object? body = null)
    {
        var request = new HttpRequestMessage(method, url);
        request.Headers.Add("X-Requested-With", "XMLHttpRequest");

        if (body is not null)
        {
            request.Content = JsonContent.Create(body);
        }

        return request;
    }

    // --- Register ---

    [Fact]
    public async Task Register_WithValidData_Returns200AndSetsAuthCookie()
    {
        using var client = Factory.CreateClient();
        var request = CreateAuthRequest(
            HttpMethod.Post,
            $"{AuthBase}/register",
            new
            {
                email = $"test-{Guid.NewGuid()}@example.com",
                password = "Password1",
                displayName = "TestUser",
            }
        );

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(response.Headers.Contains("Set-Cookie"));

        var body = await Deserialize<AuthApiResponse>(response);
        Assert.Equal("TestUser", body.DisplayName);
        Assert.NotEqual(Guid.Empty, body.UserId);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_Returns400()
    {
        var email = $"dup-{Guid.NewGuid()}@example.com";
        using var client = Factory.CreateClient();

        var first = CreateAuthRequest(
            HttpMethod.Post,
            $"{AuthBase}/register",
            new
            {
                email,
                password = "Password1",
                displayName = "User1",
            }
        );
        var firstResponse = await client.SendAsync(first);
        firstResponse.EnsureSuccessStatusCode();

        using var client2 = Factory.CreateClient();
        var second = CreateAuthRequest(
            HttpMethod.Post,
            $"{AuthBase}/register",
            new
            {
                email,
                password = "Password1",
                displayName = "User2",
            }
        );
        var secondResponse = await client2.SendAsync(second);

        Assert.Equal(HttpStatusCode.Conflict, secondResponse.StatusCode);
    }

    [Fact]
    public async Task Register_WithoutXhrHeader_Returns400()
    {
        using var client = Factory.CreateClient();
        var response = await client.PostAsJsonAsync(
            $"{AuthBase}/register",
            new
            {
                email = "test@example.com",
                password = "Password1",
                displayName = "Test",
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // --- Login ---

    [Fact]
    public async Task Login_WithValidCredentials_Returns200()
    {
        var email = $"login-{Guid.NewGuid()}@example.com";
        using var client = Factory.CreateClient();

        var register = CreateAuthRequest(
            HttpMethod.Post,
            $"{AuthBase}/register",
            new
            {
                email,
                password = "Password1",
                displayName = "LoginUser",
            }
        );
        (await client.SendAsync(register)).EnsureSuccessStatusCode();

        using var client2 = Factory.CreateClient();
        var login = CreateAuthRequest(HttpMethod.Post, $"{AuthBase}/login", new { email, password = "Password1" });
        var response = await client2.SendAsync(login);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await Deserialize<AuthApiResponse>(response);
        Assert.Equal("LoginUser", body.DisplayName);
    }

    [Fact]
    public async Task Login_WithWrongPassword_Returns401WithGenericMessage()
    {
        var email = $"wrong-{Guid.NewGuid()}@example.com";
        using var client = Factory.CreateClient();

        var register = CreateAuthRequest(
            HttpMethod.Post,
            $"{AuthBase}/register",
            new
            {
                email,
                password = "Password1",
                displayName = "User",
            }
        );
        (await client.SendAsync(register)).EnsureSuccessStatusCode();

        using var client2 = Factory.CreateClient();
        var login = CreateAuthRequest(HttpMethod.Post, $"{AuthBase}/login", new { email, password = "WrongPassword1" });
        var response = await client2.SendAsync(login);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        var body = await Deserialize<ErrorApiResponse>(response);
        Assert.Equal("Invalid email or password.", body.Message);
    }

    [Fact]
    public async Task Login_WithNonExistentEmail_Returns401WithGenericMessage()
    {
        using var client = Factory.CreateClient();
        var login = CreateAuthRequest(
            HttpMethod.Post,
            $"{AuthBase}/login",
            new { email = "nonexistent@example.com", password = "Password1" }
        );
        var response = await client.SendAsync(login);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        var body = await Deserialize<ErrorApiResponse>(response);
        Assert.Equal("Invalid email or password.", body.Message);
    }

    [Fact]
    public async Task Login_WithoutXhrHeader_Returns400()
    {
        using var client = Factory.CreateClient();
        var response = await client.PostAsJsonAsync(
            $"{AuthBase}/login",
            new { email = "test@example.com", password = "Password1" }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // --- Me ---

    [Fact]
    public async Task Me_WhenAuthenticated_ReturnsUserInfo()
    {
        var email = $"me-{Guid.NewGuid()}@example.com";
        using var client = Factory.CreateClient(new() { HandleCookies = true });

        var register = CreateAuthRequest(
            HttpMethod.Post,
            $"{AuthBase}/register",
            new
            {
                email,
                password = "Password1",
                displayName = "MeUser",
            }
        );
        (await client.SendAsync(register)).EnsureSuccessStatusCode();

        var meResponse = await client.GetAsync($"{AuthBase}/me");

        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);

        var body = await Deserialize<MeApiResponse>(meResponse);
        Assert.Equal(email, body.Email);
        Assert.Equal("MeUser", body.DisplayName);
        Assert.NotNull(body.Roles);
    }

    [Fact]
    public async Task Me_WhenNotAuthenticated_Returns204()
    {
        using var client = Factory.CreateClient();
        var response = await client.GetAsync($"{AuthBase}/me");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    // --- Logout ---

    [Fact]
    public async Task Logout_WhenAuthenticated_Returns204AndInvalidatesCookie()
    {
        var email = $"logout-{Guid.NewGuid()}@example.com";
        using var client = Factory.CreateClient(new() { HandleCookies = true });

        var register = CreateAuthRequest(
            HttpMethod.Post,
            $"{AuthBase}/register",
            new
            {
                email,
                password = "Password1",
                displayName = "LogoutUser",
            }
        );
        (await client.SendAsync(register)).EnsureSuccessStatusCode();

        var logout = CreateAuthRequest(HttpMethod.Post, $"{AuthBase}/logout");
        var logoutResponse = await client.SendAsync(logout);
        Assert.Equal(HttpStatusCode.NoContent, logoutResponse.StatusCode);

        var meResponse = await client.GetAsync($"{AuthBase}/me");
        Assert.Equal(HttpStatusCode.NoContent, meResponse.StatusCode);
    }

    // --- Register then Login then Me flow ---

    [Fact]
    public async Task FullFlow_RegisterLoginMe_Works()
    {
        var email = $"flow-{Guid.NewGuid()}@example.com";
        using var client = Factory.CreateClient(new() { HandleCookies = true });

        var register = CreateAuthRequest(
            HttpMethod.Post,
            $"{AuthBase}/register",
            new
            {
                email,
                password = "Password1",
                displayName = "FlowUser",
            }
        );
        (await client.SendAsync(register)).EnsureSuccessStatusCode();

        var logout = CreateAuthRequest(HttpMethod.Post, $"{AuthBase}/logout");
        await client.SendAsync(logout);

        var login = CreateAuthRequest(HttpMethod.Post, $"{AuthBase}/login", new { email, password = "Password1" });
        (await client.SendAsync(login)).EnsureSuccessStatusCode();

        var meResponse = await client.GetAsync($"{AuthBase}/me");
        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);

        var body = await Deserialize<MeApiResponse>(meResponse);
        Assert.Equal("FlowUser", body.DisplayName);
    }

    // --- Coexistence: game endpoints still work ---

    [Fact]
    public async Task GameEndpoints_StillWorkWithPlayerToken_AfterIdentityAdded()
    {
        var room = await CreateRoom();
        var joined = await JoinRoom(room.JoinCode);
        var startResponse = await StartGame(room.RoomId, room.PlayerToken);

        Assert.Equal(HttpStatusCode.OK, startResponse.StatusCode);

        var stateResponse = await GetRoomState(room.RoomId, joined.PlayerToken);
        Assert.Equal(HttpStatusCode.OK, stateResponse.StatusCode);
    }

    // --- Cookie coexistence ---

    [Fact]
    public async Task IdentityCookieAndPlayerTokenCookie_CoexistWithoutInterference()
    {
        var email = $"coexist-{Guid.NewGuid()}@example.com";
        using var client = Factory.CreateClient(new() { HandleCookies = true });

        var register = CreateAuthRequest(
            HttpMethod.Post,
            $"{AuthBase}/register",
            new
            {
                email,
                password = "Password1",
                displayName = "CoexistUser",
            }
        );
        (await client.SendAsync(register)).EnsureSuccessStatusCode();

        var createRoomResponse = await client.PostAsJsonAsync(
            "/api/v1/rooms",
            new
            {
                hostDisplayName = "CoexistUser",
                matrixSize = 3,
                season = TestSeason,
                grandPrixName = TestGrandPrixName,
                sessionType = "Race",
            }
        );
        createRoomResponse.EnsureSuccessStatusCode();

        var meResponse = await client.GetAsync($"{AuthBase}/me");
        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);
    }

    // --- Forgot Password ---

    [Fact]
    public async Task ForgotPassword_KnownEmail_Returns200()
    {
        var email = $"forgot-{Guid.NewGuid()}@example.com";
        using var client = Factory.CreateClient();

        var register = CreateAuthRequest(
            HttpMethod.Post,
            $"{AuthBase}/register",
            new
            {
                email,
                password = "Password1",
                displayName = "User",
            }
        );
        (await client.SendAsync(register)).EnsureSuccessStatusCode();

        using var client2 = Factory.CreateClient();
        var forgot = CreateAuthRequest(HttpMethod.Post, $"{AuthBase}/forgot-password", new { email });
        var response = await client2.SendAsync(forgot);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ForgotPassword_UnknownEmail_Returns200()
    {
        using var client = Factory.CreateClient();
        var forgot = CreateAuthRequest(
            HttpMethod.Post,
            $"{AuthBase}/forgot-password",
            new { email = "unknown@example.com" }
        );
        var response = await client.SendAsync(forgot);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ForgotPassword_WithoutXhrHeader_Returns400()
    {
        using var client = Factory.CreateClient();
        var response = await client.PostAsJsonAsync($"{AuthBase}/forgot-password", new { email = "test@example.com" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // --- Reset Password ---

    [Fact]
    public async Task ResetPassword_ValidToken_Returns200AndNewPasswordWorks()
    {
        var email = $"reset-{Guid.NewGuid()}@example.com";
        using var client = Factory.CreateClient();

        var register = CreateAuthRequest(
            HttpMethod.Post,
            $"{AuthBase}/register",
            new
            {
                email,
                password = "Password1",
                displayName = "User",
            }
        );
        (await client.SendAsync(register)).EnsureSuccessStatusCode();

        using var scope = Factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var user = await userManager.FindByEmailAsync(email);
        var token = await userManager.GeneratePasswordResetTokenAsync(user!);

        using var client2 = Factory.CreateClient();
        var reset = CreateAuthRequest(
            HttpMethod.Post,
            $"{AuthBase}/reset-password",
            new
            {
                email,
                token,
                newPassword = "NewPassword1",
            }
        );
        var resetResponse = await client2.SendAsync(reset);
        Assert.Equal(HttpStatusCode.OK, resetResponse.StatusCode);

        using var client3 = Factory.CreateClient();
        var login = CreateAuthRequest(HttpMethod.Post, $"{AuthBase}/login", new { email, password = "NewPassword1" });
        var loginResponse = await client3.SendAsync(login);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
    }

    [Fact]
    public async Task ResetPassword_InvalidToken_Returns400()
    {
        var email = $"reset-bad-{Guid.NewGuid()}@example.com";
        using var client = Factory.CreateClient();

        var register = CreateAuthRequest(
            HttpMethod.Post,
            $"{AuthBase}/register",
            new
            {
                email,
                password = "Password1",
                displayName = "User",
            }
        );
        (await client.SendAsync(register)).EnsureSuccessStatusCode();

        using var client2 = Factory.CreateClient();
        var reset = CreateAuthRequest(
            HttpMethod.Post,
            $"{AuthBase}/reset-password",
            new
            {
                email,
                token = "invalid-token",
                newPassword = "NewPassword1",
            }
        );
        var response = await client2.SendAsync(reset);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ResetPassword_WeakPassword_Returns400()
    {
        var email = $"reset-weak-{Guid.NewGuid()}@example.com";
        using var client = Factory.CreateClient();

        var register = CreateAuthRequest(
            HttpMethod.Post,
            $"{AuthBase}/register",
            new
            {
                email,
                password = "Password1",
                displayName = "User",
            }
        );
        (await client.SendAsync(register)).EnsureSuccessStatusCode();

        using var scope = Factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var user = await userManager.FindByEmailAsync(email);
        var token = await userManager.GeneratePasswordResetTokenAsync(user!);

        using var client2 = Factory.CreateClient();
        var reset = CreateAuthRequest(
            HttpMethod.Post,
            $"{AuthBase}/reset-password",
            new
            {
                email,
                token,
                newPassword = "short",
            }
        );
        var response = await client2.SendAsync(reset);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // --- Response DTOs ---

    private record AuthApiResponse(Guid UserId, string Email, string DisplayName, string[] Roles);

    private record MeApiResponse(Guid UserId, string Email, string DisplayName, string[] Roles);

    private record ErrorApiResponse(string Code, string Message);
}
