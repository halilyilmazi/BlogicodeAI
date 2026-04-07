using Microsoft.AspNetCore.Mvc;

namespace Blogicode.API.Controllers;

/// <summary>
/// Provides a simple liveness probe for the API.
/// </summary>
[ApiController]
[Route("api")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Returns a 200 OK response confirming the API is running.
    /// </summary>
    /// <returns>200 with <c>ok: true</c> and a status message.</returns>
    [HttpGet("health")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Health() =>
        Ok(new { ok = true, mesaj = "BlogicodeAI API çalışıyor." });
}
