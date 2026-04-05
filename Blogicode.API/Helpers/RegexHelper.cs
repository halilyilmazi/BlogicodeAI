namespace Blogicode.API.Helpers;

public static class RegexHelper
{
    public static string EscapeRegex(string s) =>
        System.Text.RegularExpressions.Regex.Escape(s);
}
