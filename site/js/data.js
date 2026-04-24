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

// Strip base64 photos from vendor arrays to prevent localStorage bloat.
// Photos should be URLs (Supabase Storage), not inline data.
var VENDOR_KEYS = ['popup_vendors_v1', 'front_vendors_v1'];
function _stripBase64Photos(key, val) {
  if (VENDOR_KEYS.indexOf(key) < 0) return val;
  var arr = typeof val === 'string' ? JSON.parse(val) : val;
  if (!Array.isArray(arr)) return val;
  arr.forEach(function(v) {
    if (v.photos && Array.isArray(v.photos)) {
      v.photos = v.photos.filter(function(p) { return p && !p.startsWith('data:'); });
    }
  });
  return arr;
}

function _safeSetItem(key, value) {
  var str = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    _origSetItem.call(localStorage, key, str);
    return true;
  } catch(e) {
    console.warn('[data] localStorage full writing ' + key + ', clearing and retrying');
    // Clear this key and any snapshot keys to make room
    try { localStorage.removeItem(key); } catch(e2) {}
    // Also clear any visual image caches which can be large
    try { localStorage.removeItem('popup_visual_imgs_v1'); } catch(e2) {}
    try {
      _origSetItem.call(localStorage, key, str);
      return true;
    } catch(e2) {
      console.error('[data] Still cannot write ' + key + ' after clearing, skipping');
      return false;
    }
  }
}

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
      var val = row.value;

      // Strip base64 photos before writing to localStorage
      if (VENDOR_KEYS.indexOf(row.key) >= 0) {
        val = _stripBase64Photos(row.key, val);
      }

      // For mergeable keys, merge with any existing local data instead of overwriting
      if (MERGEABLE_KEYS.indexOf(row.key) >= 0) {
        var existing = _origGetItem.call(localStorage, row.key);
        if (existing) {
          // Strip base64 from local too before merging
          var localClean = _stripBase64Photos(row.key, existing);
          var merged = _mergeKey(row.key, JSON.stringify(localClean), val);
          if (_safeSetItem(row.key, merged)) {
            pulledKeys.push(row.key);
            count++;
          }
          return;
        }
      }

      // Store value in localStorage
      var str = typeof val === 'string' ? val : JSON.stringify(val);
      if (_safeSetItem(row.key, str)) {
        pulledKeys.push(row.key);
        count++;
      }
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
    var SNAPSHOT_KEYS = ['tracker_data_v1', 'pl_data_v1', 'front_bp_v1', 'popup_vendors_v1', 'front_vendors_v1'];
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

// Track locally-edited vendor IDs so realtime doesn't overwrite them before sync
var _localEditedIds = {};  // key -> Set of vendor ids edited locally
var _localEditClearTimers = {};

function _markLocalEdit(key, vendorId) {
  if (!_localEditedIds[key]) _localEditedIds[key] = {};
  _localEditedIds[key][vendorId] = Date.now();
  // Clear after 5 seconds (enough time for Supabase roundtrip)
  if (_localEditClearTimers[key + '_' + vendorId]) clearTimeout(_localEditClearTimers[key + '_' + vendorId]);
  _localEditClearTimers[key + '_' + vendorId] = setTimeout(function() {
    if (_localEditedIds[key]) delete _localEditedIds[key][vendorId];
  }, 5000);
}

localStorage.setItem = function(key, value) {
  // For vendor keys, strip any base64 photos before saving to localStorage
  var cleanValue = value;
  if (VENDOR_KEYS.indexOf(key) >= 0) {
    try {
      var cleaned = _stripBase64Photos(key, value);
      cleanValue = typeof cleaned === 'string' ? cleaned : JSON.stringify(cleaned);
      // Track which vendor IDs were edited by comparing with previous
      var prev = _origGetItem.call(localStorage, key);
      if (prev) {
        var prevArr = JSON.parse(prev);
        var newArr = typeof cleaned === 'string' ? JSON.parse(cleaned) : cleaned;
        if (Array.isArray(prevArr) && Array.isArray(newArr)) {
          var prevMap = {};
          prevArr.forEach(function(v) { if (v && v.id) prevMap[v.id] = JSON.stringify(v); });
          newArr.forEach(function(v) {
            if (v && v.id && prevMap[v.id] && prevMap[v.id] !== JSON.stringify(v)) {
              _markLocalEdit(key, v.id);
            }
            if (v && v.id && !prevMap[v.id]) {
              _markLocalEdit(key, v.id);
            }
          });
        }
      }
    } catch(e) { /* use original */ }
  }

  // Write to real localStorage with quota safety
  _safeSetItem(key, cleanValue);

  // Skip local-only keys
  if (LOCAL_ONLY_KEYS.indexOf(key) >= 0) return;
  if (key.charAt(0) === '_') return; // internal keys

  // Queue write to Supabase (send cleaned value)
  _writeQueue[key] = cleanValue;
  if (_writeTimer) clearTimeout(_writeTimer);
  _writeTimer = setTimeout(_flushWrites, 300); // reduced from 500ms for faster sync
};

// ── Merge logic for array-based keys (vendors, etc.) ──
// Instead of last-write-wins, merge by item id so neither founder's additions get lost.
var MERGEABLE_KEYS = ['popup_vendors_v1', 'front_vendors_v1', 'popup_inv_new_v1'];

function _mergeArrayById(localArr, remoteArr, key) {
  if (!Array.isArray(localArr) || !Array.isArray(remoteArr)) return remoteArr;
  var remoteMap = {};
  remoteArr.forEach(function(item) { if (item && item.id) remoteMap[item.id] = item; });
  var localMap = {};
  localArr.forEach(function(item) { if (item && item.id) localMap[item.id] = item; });
  var localEdits = _localEditedIds[key] || {};

  // Build merged list: use remote order as base
  var merged = remoteArr.map(function(item) {
    // If this vendor was recently edited locally, keep LOCAL version (it hasn't synced yet)
    if (item && item.id && localEdits[item.id] && localMap[item.id]) {
      return localMap[item.id];
    }
    return item;
  });
  // Add any local-only items (new vendors not yet in remote)
  localArr.forEach(function(item) {
    if (item && item.id && !remoteMap[item.id]) {
      merged.push(item);
    }
  });
  return merged;
}

function _mergeInvNew(local, remote) {
  if (!local || !remote) return remote || local;
  if (!local.vendors || !remote.vendors) return remote || local;
  var vendorMap = {};
  remote.vendors.forEach(function(v) { vendorMap[v.vendorId] = JSON.parse(JSON.stringify(v)); });
  local.vendors.forEach(function(v) {
    if (vendorMap[v.vendorId]) {
      // Merge items by id
      vendorMap[v.vendorId].items = _mergeArrayById(v.items || [], vendorMap[v.vendorId].items || []);
      vendorMap[v.vendorId].name = v.name || vendorMap[v.vendorId].name;
    } else {
      vendorMap[v.vendorId] = v;
    }
  });
  return { vendors: Object.values(vendorMap) };
}

function _mergeKey(key, localStr, remoteVal) {
  if (MERGEABLE_KEYS.indexOf(key) < 0) return remoteVal;
  try {
    var local = JSON.parse(localStr);
    var remote = typeof remoteVal === 'string' ? JSON.parse(remoteVal) : remoteVal;
    if (key === 'popup_inv_new_v1') return _mergeInvNew(local, remote);
    if (Array.isArray(local) && Array.isArray(remote)) return _mergeArrayById(local, remote, key);
  } catch(e) {}
  return remoteVal;
}

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

        // Strip base64 photos from vendor data
        if (VENDOR_KEYS.indexOf(key) >= 0) {
          val = _stripBase64Photos(key, val);
        }

        // For mergeable keys, merge to preserve local-only additions, but remote wins for edits
        if (MERGEABLE_KEYS.indexOf(key) >= 0) {
          var localStr = _origGetItem.call(localStorage, key);
          if (localStr) {
            var localClean = _stripBase64Photos(key, localStr);
            var merged = _mergeKey(key, JSON.stringify(localClean), val);
            var mergedStr = JSON.stringify(merged);
            _safeSetItem(key, mergedStr);
            // Do NOT push back to Supabase — accept remote as truth to avoid sync loops
            console.log('[realtime] Merged:', key);
            window.dispatchEvent(new CustomEvent('kv-updated', { detail: { key: key, source: 'realtime' } }));
            return;
          }
        }

        var str = typeof val === 'string' ? val : JSON.stringify(val);
        _safeSetItem(key, str);
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

// ── Migrate base64 vendor photos to Supabase Storage ──
function _migrateBase64Photos() {
  var sb = _initSB();
  if (!sb) return Promise.resolve();
  var keys = ['popup_vendors_v1', 'front_vendors_v1'];
  var migrated = 0;
  var promises = keys.map(function(key) {
    var raw = _origGetItem.call(localStorage, key);
    if (!raw) return Promise.resolve();
    var vendors;
    try { vendors = JSON.parse(raw); } catch(e) { return Promise.resolve(); }
    if (!Array.isArray(vendors)) return Promise.resolve();

    var photoPromises = [];
    vendors.forEach(function(v) {
      if (!v.photos || !Array.isArray(v.photos)) return;
      v.photos.forEach(function(photo, pi) {
        if (!photo || !photo.startsWith('data:')) return;
        // Convert base64 to blob and upload
        var p = fetch(photo).then(function(r) { return r.blob(); }).then(function(blob) {
          var path = (v.id || 'unknown') + '/migrated-' + pi + '-' + Date.now() + '.jpg';
          return sb.storage.from(PHOTO_BUCKET).upload(path, blob, {
            cacheControl: '3600', upsert: false
          }).then(function(res) {
            if (res.error) { console.warn('[migrate] upload failed:', res.error); return; }
            var urlRes = sb.storage.from(PHOTO_BUCKET).getPublicUrl(path);
            v.photos[pi] = urlRes.data.publicUrl;
            migrated++;
          });
        }).catch(function(err) { console.warn('[migrate] photo error:', err); });
        photoPromises.push(p);
      });
    });

    return Promise.all(photoPromises).then(function() {
      if (migrated > 0) {
        var updated = JSON.stringify(vendors);
        _origSetItem.call(localStorage, key, updated);
        // Sync to Supabase
        _writeQueue[key] = updated;
        if (_writeTimer) clearTimeout(_writeTimer);
        _writeTimer = setTimeout(_flushWrites, 500);
        console.log('[migrate] Migrated ' + migrated + ' base64 photos to Storage for ' + key);
      }
    });
  });
  return Promise.all(promises);
}

(function() {
  _initSB();
  _pullAllData().then(function() {
    window._sbPullDone = true;
    _startRealtime();
    window.dispatchEvent(new Event('supabase-ready'));
    // Run photo migration after data is loaded
    setTimeout(function() { _migrateBase64Photos(); }, 2000);
  });
})();
