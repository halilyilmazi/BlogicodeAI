/**
 * Tek API adresi — tüm HTML sayfaları bunu kullanır.
 *
 * Öncelik:
 * 1) Sayfadan ÖNCE: <script>window.BLOGICODE_API_BASE='https://.../api';</script>
 * 2) localStorage.BLOGICODE_API_BASE (tarayıcı konsolu: localStorage.setItem('BLOGICODE_API_BASE','http://127.0.0.1:3000/api'))
 * 3) Otomatik: yerelde 127.0.0.1:3000/api, canlıda https://blogicode-ai.vercel.app/api
 */
(function () {
    var w = window;
    if (w.BLOGICODE_API_BASE) return;

    try {
        var ls = w.localStorage && w.localStorage.getItem('BLOGICODE_API_BASE');
        if (ls && ls.indexOf('http') === 0) {
            w.BLOGICODE_API_BASE = ls.replace(/\/$/, '');
            return;
        }
    } catch (e) { /* file:// veya gizli mod */ }

    var loc = w.location;
    var host = (loc.hostname || '').toLowerCase();
    var port = String(loc.port || '');

    var LOCAL_API = 'http://127.0.0.1:3000/api';
    /** Canlı REST API tabanı (Vercel); arayüz özel domainde olsa bile istekler buraya gider */
    var PRODUCTION_API_BASE = 'https://blogicode-ai.vercel.app/api';

    // Express aynı makinede hem site hem API (port 3000)
    if (port === '3000' && (host === 'localhost' || host === '127.0.0.1')) {
        w.BLOGICODE_API_BASE = loc.origin.replace(/\/$/, '') + '/api';
        return;
    }

    var isLocal =
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '' ||
        host === '0.0.0.0' ||
        loc.protocol === 'file:';

    if (!isLocal) {
        w.BLOGICODE_API_BASE = PRODUCTION_API_BASE.replace(/\/$/, '');
        return;
    }

    w.BLOGICODE_API_BASE = LOCAL_API;
})();
