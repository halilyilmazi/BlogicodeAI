using Blogicode.API.DTOs;
using Blogicode.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Blogicode.API.Controllers;

/// <summary>
/// Handles user registration and login.
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    /// <summary>
    /// Registers a new user account.
    /// </summary>
    /// <param name="body">Registration details: first name, last name, email, and password.</param>
    /// <returns>201 with the created user object, 409 if the email is already taken, or 400 on validation failure.</returns>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest body)
    {
        var (ok, err, user) = await _auth.RegisterAsync(body);
        if (!ok)
        {
            if (err == "Bu email adresi zaten kullanımda.")
                return Conflict(new { message = err });
            return BadRequest(new { message = err });
        }
        return StatusCode(201, new { message = "Kullanıcı başarıyla oluşturuldu", user });
    }

    /// <summary>
    /// Authenticates a user and returns a session token.
    /// </summary>
    /// <param name="body">Login credentials: email and password.</param>
    /// <returns>200 with a token and user object, or 401 if credentials are invalid.</returns>
    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest body)
    {
        var (ok, user) = await _auth.LoginAsync(body);
        if (!ok)
            return Unauthorized(new { message = "Hatalı email veya şifre." });
        return Ok(new { message = "Giriş başarılı", token = "blogicodeai-jwt-token-777", user });
    }
}
