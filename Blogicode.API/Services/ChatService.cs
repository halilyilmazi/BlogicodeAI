using System.Net.Http.Json;
using System.Text.Json;
using Blogicode.API.DTOs;

namespace Blogicode.API.Services;

public class ChatService : IChatService
{
    private readonly IHttpClientFactory _httpFactory;
    private readonly IConfiguration _cfg;

    public ChatService(IHttpClientFactory httpFactory, IConfiguration cfg)
    {
        _httpFactory = httpFactory;
        _cfg = cfg;
    }

    public async Task<(string reply, string source, string? hint)> ChatAsync(ChatRequest req)
    {
        var msg = req.Message?.Trim() ?? "";
        if (string.IsNullOrEmpty(msg))
            return ("Lütfen bir mesaj yazın.", "fallback", null);

        var key = _cfg["Gemini:ApiKey"]?.Trim();
        var model = string.IsNullOrWhiteSpace(_cfg["Gemini:Model"]) ? "gemini-1.5-flash" : _cfg["Gemini:Model"]!.Trim();

        if (string.IsNullOrEmpty(key))
            return (LocalFallback(msg), "fallback", "GEMINI_API_KEY tanımlı değil; yerel mod.");

        try
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={Uri.EscapeDataString(key)}";
            object body;

            if (req.History == null || req.History.Count == 0)
            {
                body = new { contents = new[] { new { parts = new[] { new { text = msg } } } } };
            }
            else
            {
                var contents = new List<object>();
                foreach (var h in req.History.TakeLast(24))
                {
                    if (string.IsNullOrWhiteSpace(h.Text)) continue;
                    var role = h.Role == "model" ? "model" : "user";
                    contents.Add(new { role, parts = new[] { new { text = h.Text! } } });
                }
                contents.Add(new { role = "user", parts = new[] { new { text = msg } } });
                body = new { contents };
            }

            var client = _httpFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(60);
            var resp = await client.PostAsJsonAsync(url, body);
            var json = await resp.Content.ReadAsStringAsync();
            if (!resp.IsSuccessStatusCode)
                return (LocalFallback(msg), "fallback", "Gemini hata; yerel mod.");

            using var doc = JsonDocument.Parse(json);
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();
            if (string.IsNullOrWhiteSpace(text))
                return (LocalFallback(msg), "fallback", null);
            return (text.Trim(), "gemini", null);
        }
        catch
        {
            return (LocalFallback(msg), "fallback", "Gemini yanıt veremedi; yerel mod.");
        }
    }

    private static string LocalFallback(string userText)
    {
        if (userText.Contains("merhaba", StringComparison.OrdinalIgnoreCase) ||
            userText.Contains("selam", StringComparison.OrdinalIgnoreCase))
            return "Merhaba! Blogicode.API (.NET) asistanıyım. Gemini:ApiKey ile tam yanıt alabilirsin.";
        return $"Mesajını aldım: «{userText[..Math.Min(userText.Length, 120)]}». Detaylı cevap için appsettings veya ortamda Gemini anahtarı tanımla.";
    }
}
