/**
 * BlogicodeAI API tabanı — tek merkezden yönetim.
 *
 * Özelleştirmek için bu dosyadan ÖNCE (aynı sayfada) şunu kullanın:
 *   <script>window.BLOGICODE_API_BASE = 'https://senin-api.com/api';</script>
 *   <script src="config.js"></script>
 *
 * Yerel geliştirme: backend varsayılan http://localhost:3000
 * Canlı: https://blogicode-ai.vercel.app/api
 */
(function () {
    var w = window;
    if (w.BLOGICODE_API_BASE) return;

    var hostname = w.location.hostname || '';
    var port = String(w.location.port || '');
    var isLocal =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        hostname === '';

    var productionApi = 'https://blogicode-ai.vercel.app/api';
    var localApi = 'http://127.0.0.1:3000/api';

    // Backend hem API hem frontend'i 3000 portunda sunuyorsa aynı origin kullan (CORS/port karmaşası olmaz)
    if (isLocal && port === '3000') {
        w.BLOGICODE_API_BASE = w.location.origin + '/api';
        return;
    }

    w.BLOGICODE_API_BASE = isLocal ? localApi : productionApi;
})();
