using Microsoft.AspNetCore.Mvc;

namespace Blogicode.API.Controllers;

[ApiController]
[Route("api")]
public class HealthController : ControllerBase
{
    [HttpGet("health")]
    public IActionResult Health() =>
        Ok(new { ok = true, mesaj = "BlogicodeAI API çalışıyor." });
}
