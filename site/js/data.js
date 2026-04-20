// ============================================
// THE FRONT NYC — Data Layer
// ============================================
// Intercepts localStorage so existing app.js code automatically
// syncs with Supabase. On load, pulls all data from Supabase
// into localStorage so the app renders with shared data.

var SUPABASE_URL = 'https://ygptkypwptsrnkwwqiox.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncHRreXB3cHRzcm5rd3dxaW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTE4NTQsImV4cCI6MjA5MDQ2Nzg1NH0.UWnRGzOxQr39Eh8nA37Peo_BOwrn_kOwbk3X0hnQyZc';

var _sb = null;
var _sbReady = false;
// Expose readiness so other modules (tracker.js etc.) can avoid acting on stale local data
window._sbReady = false;
window._sbPullDone = false;

// Keys that should NOT be synced to Supabase (local-only)
var LOCAL_ONLY_KEYS = ['_boh_auth', 'ws_theme', 'loglevel'];

function _initSB() {
  if (_sb) return _sb;
  if (!window.supabase) return null;
  try {
    _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    _sbReady = true;
    window._sbReady = true;
    console.log('[data] Supabase connected');
    return _sb;
  } catch (e) {
    console.error('[data] Supabase init failed:', e);
    return null;
  }
}

// ── On page load: pull ALL kv_store rows into localStorage ──
// This is the key bridge: Supabase is the source of truth,
// localStorage is just a fast local cache that app.js reads from.

function _pullAllData() {
  var sb = _initSB();
  if (!sb) { console.warn('[data] No Supabase, using localStorage only'); return Promise.resolve(); }

  return sb.from('kv_store').select('key,value').then(function(res) {
    if (res.error) {
      console.error('[data] Pull failed:', res.error);
      return;
    }
    var count = 0;
    var pulledKeys = [];
    (res.data || []).forEach(function(row) {
      // Store value as JSON string in localStorage (matching what app.js expects)
      var val = row.value;
      if (typeof val === 'string') {
        _origSetItem.call(localStorage, row.key, val);
      } else {
        _origSetItem.call(localStorage, row.key, JSON.stringify(val));
      }
      pulledKeys.push(row.key);
      count++;
    });
    console.log('[data] Pulled ' + count + ' keys from Supabase');
    // Notify any listeners that all keys are fresh from server
    pulledKeys.forEach(function(k) {
      window.dispatchEvent(new CustomEvent('kv-updated', { detail: { key: k, source: 'pull' } }));
    });
  });
}

// ── Intercept localStorage.setItem to sync writes to Supabase ──

var _origSetItem = localStorage.setItem;
var _origGetItem = localStorage.getItem;

// Debounce writes to Supabase (batch rapid edits)
var _writeQueue = {};
var _writeTimer = null;

function _flushWrites() {
  var sb = _initSB();
  if (!sb) return;

  var rows = [];
  Object.keys(_writeQueue).forEach(function(key) {
    var raw = _writeQueue[key];
    // Try to parse as JSON for JSONB column, fallback to string
    var val;
    try { val = JSON.parse(raw); } catch(e) { val = raw; }
    rows.push({ key: key, value: val });
  });
  _writeQueue = {};

  if (rows.length === 0) return;

  sb.from('kv_store').upsert(rows, { onConflict: 'key' }).then(function(res) {
    if (res.error) { console.error('[data] Sync error:', res.error.message); return; }
    // Daily snapshot: for any critical key we just wrote, mirror to a dated snapshot row.
    // Caps automatically because the key includes YYYY-MM-DD (one snapshot per day, max).
    var SNAPSHOT_KEYS = ['tracker_data_v1', 'pl_data_v1', 'front_bp_v1'];
    var today = new Date().toISOString().slice(0, 10);
    var snapRows = [];
    rows.forEach(function(r) {
      if (SNAPSHOT_KEYS.indexOf(r.key) >= 0) {
        snapRows.push({ key: r.key + '__snap_' + today, value: r.value });
      }
    });
    if (snapRows.length) {
      sb.from('kv_store').upsert(snapRows, { onConflict: 'key' }).then(function(sres) {
        if (sres.error) console.warn('[data] Snapshot write failed:', sres.error.message);
      });
    }
  });
}

localStorage.setItem = function(key, value) {
  // Always write to real localStorage immediately (app.js reads it)
  _origSetItem.call(localStorage, key, value);

  // Skip local-only keys
  if (LOCAL_ONLY_KEYS.indexOf(key) >= 0) return;
  if (key.charAt(0) === '_') return; // internal keys

  // Queue write to Supabase
  _writeQueue[key] = value;
  if (_writeTimer) clearTimeout(_writeTimer);
  _writeTimer = setTimeout(_flushWrites, 500); // batch writes every 500ms
};

// ── Real-time: listen for changes from the other founder ──

function _startRealtime() {
  var sb = _initSB();
  if (!sb) return;

  sb.channel('kv-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kv_store' }, function(payload) {
      if (payload.new && payload.new.key) {
        var key = payload.new.key;
        // Ignore snapshot rows — they're just backups, not live data
        if (key.indexOf('__snap_') >= 0) return;
        var val = payload.new.value;
        var str = typeof val === 'string' ? val : JSON.stringify(val);
        // Update localStorage without triggering another sync
        _origSetItem.call(localStorage, key, str);
        console.log('[realtime] Updated:', key);
        // Notify listeners (tracker, brand, etc.) that this key changed remotely
        window.dispatchEvent(new CustomEvent('kv-updated', { detail: { key: key, source: 'realtime' } }));
      }
    })
    .subscribe();
}

// ── Boot sequence ──
// 1. Init Supabase
// 2. Pull all data from Supabase into localStorage
// 3. Start realtime listener
// 4. App.js will then read from localStorage as usual

// ── Supabase Storage helpers for vendor photos ──
var PHOTO_BUCKET = 'vendor-photos';

function uploadVendorPhoto(file, vendorId) {
  var sb = _initSB();
  if (!sb) return Promise.reject(new Error('Supabase not available'));
  var ext = file.name ? file.name.split('.').pop() : 'jpg';
  var path = vendorId + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
  return sb.storage.from(PHOTO_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false
  }).then(function(res) {
    if (res.error) throw res.error;
    var urlRes = sb.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    return urlRes.data.publicUrl;
  });
}

function deleteVendorPhoto(url) {
  var sb = _initSB();
  if (!sb) return Promise.resolve();
  // Extract path from public URL
  var marker = '/object/public/' + PHOTO_BUCKET + '/';
  var idx = url.indexOf(marker);
  if (idx === -1) return Promise.resolve(); // base64 or unknown format, skip
  var path = decodeURIComponent(url.slice(idx + marker.length));
  return sb.storage.from(PHOTO_BUCKET).remove([path]).then(function(res) {
    if (res.error) console.warn('[storage] delete error:', res.error);
  });
}

// Expose globally
window.uploadVendorPhoto = uploadVendorPhoto;
window.deleteVendorPhoto = deleteVendorPhoto;

(function() {
  _initSB();
  _pullAllData().then(function() {
    window._sbPullDone = true;
    _startRealtime();
    // Dispatch event so app.js can re-render if needed
    window.dispatchEvent(new Event('supabase-ready'));
  });
})();
