# Blogicode.API

Node.js ile yazılmış `Halil-Yılmaz/backend` ile **aynı MongoDB veritabanını** ve benzer **REST yollarını** kullanan ASP.NET Core 8 örneği. Klasör yapısı ders örneğindeki gibi: **Controllers**, **Services**, **DTOs**, **Entities**, **Data**, **Helpers**, **Filters**, **Migrations**.

## Gereksinimler

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

## Çalıştırma

```bash
cd Blogicode.API
# appsettings.json → MongoDb:ConnectionString ve DatabaseName (Atlas URI kullanabilirsin)
dotnet run
```

Varsayılan URL: `http://localhost:5299` — `GET /api/health`

## Yapılandırma

### MongoDB (User Secrets gerekmez)

1. `appsettings.Development.example.json` dosyasını kopyala, adını **`appsettings.Development.json`** yap (veya mevcut `appsettings.Development.json` içinde düzenle).
2. `MongoDb:ConnectionString` satırındaki `BURAYA_MONGODB_URI_YAPISTIR` metnini sil; yerine `Halil-Yılmaz/backend/.env` içindeki **`MONGODB_URI=`** değerinin tamamını yapıştır (tek satır, tırnak yok).
3. `dotnet run` varsayılan olarak **Development** ortamında çalışır; bu dosyadaki ayarlar `appsettings.json` üzerine yazar.

`appsettings.Development.json` repoda **`.gitignore`** ile dışarıda tutulur; böylece Atlas şifren GitHub’a gitmez.

| Ayar | Açıklama |
|------|-----------|
| `MongoDb:ConnectionString` | Örn. Atlas `mongodb+srv://...` |
| `MongoDb:DatabaseName` | Mongoose ile aynı DB adı (örn. `blogicode`) |
| `Gemini:ApiKey` | İsteğe bağlı; boşsa chatbot yerel yanıt döner |

## Vercel notu

Vercel varsayılan olarak Node sunar; bu API için **Azure App Service**, **Railway**, **Render** veya **Docker** daha uygundur.

## Çözüm dosyası

`Blogicode.API.sln` — Visual Studio / Rider ile açılır.
