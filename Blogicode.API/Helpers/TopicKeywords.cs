namespace Blogicode.API.Helpers;

/// <summary>Node.js backend ile aynı konu anahtar kelimeleri.</summary>
public static class TopicKeywords
{
    public static readonly IReadOnlyDictionary<string, string[]> Map =
        new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
        {
            ["yapay-zeka"] = new[] { "yapay zeka", "machine learning", "derin öğrenme", "deep learning", "chatgpt", "llm", "nlp", "tensorflow", "pytorch" },
            ["yazilim"] = new[] { "yazılım", "yazilim", "programlama", "developer", "kod", "coding", "javascript", "python", "java", "frontend", "backend" },
            ["bulut"] = new[] { "bulut", "cloud", "aws", "azure", "gcp", "saas", "serverless" },
            ["siber-guvenlik"] = new[] { "siber", "güvenlik", "security", "pentest", "malware", "şifreleme", "encryption", "zero trust" },
            ["veri-bilimi"] = new[] { "veri bilimi", "data science", "analitik", "big data", "etl", "pandas", "numpy" },
            ["blockchain"] = new[] { "blockchain", "kripto", "bitcoin", "ethereum", "web3", "nft", "defi" },
            ["mobil"] = new[] { "mobil", "android", "ios", "swift", "kotlin", "flutter", "react native" },
            ["devops"] = new[] { "devops", "docker", "kubernetes", "k8s", "ci/cd", "jenkins", "gitops", "terraform" },
            ["ag-teknolojileri"] = new[] { "ağ", "network", "tcp", "routing", "switch", "vlan", "cisco" },
            ["veritabani"] = new[] { "veritabanı", "veritabani", "database", "sql", "mongodb", "postgresql", "redis", "nosql" },
            ["robotik"] = new[] { "robotik", "robot", "ros", "cobot", "endüstriyel robot", "iot", "arduino", "servo", "otomasyon" }
        };

    public static bool IsKnownTopic(string topic) => Map.ContainsKey(topic);
}
