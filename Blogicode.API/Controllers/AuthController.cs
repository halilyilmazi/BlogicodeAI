using Blogicode.API.DTOs;
using Blogicode.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Blogicode.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("register")]
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

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest body)
    {
        var (ok, user) = await _auth.LoginAsync(body);
        if (!ok)
            return Unauthorized(new { message = "Hatalı email veya şifre." });
        return Ok(new { message = "Giriş başarılı", token = "blogicodeai-jwt-token-777", user });
    }
}
