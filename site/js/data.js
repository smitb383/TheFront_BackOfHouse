// ============================================
// THE FRONT NYC — Data Layer
// ============================================
// Provides Supabase-backed storage with localStorage fallback.
// Replace SUPABASE_URL and SUPABASE_ANON_KEY with your values.

var SUPABASE_URL = 'https://ygptkypwptsrnkwwqiox.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncHRreXB3cHRzcm5rd3dxaW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTE4NTQsImV4cCI6MjA5MDQ2Nzg1NH0.UWnRGzOxQr39Eh8nA37Peo_BOwrn_kOwbk3X0hnQyZc';

var _supabase = null;
var _supabaseReady = false;

function initSupabase() {
  if (_supabase) return _supabase;
  if (!SUPABASE_ANON_KEY || !window.supabase) {
    console.warn('[data] Supabase not configured — using localStorage only');
    return null;
  }
  try {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    _supabaseReady = true;
    console.log('[data] Supabase connected');
    return _supabase;
  } catch (e) {
    console.error('[data] Supabase init failed:', e);
    return null;
  }
}

// ── Key-Value Store (for text fields, settings, etc.) ──

function getKV(key) {
  // Always return localStorage value immediately for fast UI
  var local = null;
  try { local = JSON.parse(localStorage.getItem(key)); } catch (e) {}

  // Also fetch from Supabase in background and update if different
  var sb = initSupabase();
  if (sb) {
    sb.from('kv_store').select('value').eq('key', key).single().then(function(res) {
      if (res.data && res.data.value !== undefined) {
        var remote = res.data.value;
        var localStr = JSON.stringify(local);
        var remoteStr = JSON.stringify(remote);
        if (localStr !== remoteStr) {
          localStorage.setItem(key, JSON.stringify(remote));
          // Trigger a re-render if the page is showing this data
          window.dispatchEvent(new CustomEvent('kv-updated', { detail: { key: key, value: remote } }));
        }
      }
    });
  }

  return local;
}

function setKV(key, value) {
  localStorage.setItem(key, JSON.stringify(value));

  var sb = initSupabase();
  if (sb) {
    sb.from('kv_store').upsert({ key: key, value: value }, { onConflict: 'key' }).then(function(res) {
      if (res.error) console.error('[data] setKV error:', key, res.error);
    });
  }
}

// ── Table Operations (for structured data: vendors, tasks, budgets, etc.) ──

function getTable(table, filters) {
  // Return localStorage cache immediately
  var cacheKey = '_table_' + table;
  var local = null;
  try { local = JSON.parse(localStorage.getItem(cacheKey)); } catch (e) {}

  var sb = initSupabase();
  if (sb) {
    var query = sb.from(table).select('*');
    if (filters) {
      Object.keys(filters).forEach(function(k) {
        query = query.eq(k, filters[k]);
      });
    }
    query.order('created_at', { ascending: true }).then(function(res) {
      if (res.data) {
        localStorage.setItem(cacheKey, JSON.stringify(res.data));
        window.dispatchEvent(new CustomEvent('table-updated', { detail: { table: table, data: res.data } }));
      }
    });
  }

  return local || [];
}

function upsertRow(table, row) {
  // Update localStorage cache
  var cacheKey = '_table_' + table;
  var cache = [];
  try { cache = JSON.parse(localStorage.getItem(cacheKey)) || []; } catch (e) {}
  var idx = cache.findIndex(function(r) { return r.id === row.id; });
  if (idx >= 0) cache[idx] = Object.assign(cache[idx], row);
  else cache.push(row);
  localStorage.setItem(cacheKey, JSON.stringify(cache));

  var sb = initSupabase();
  if (sb) {
    sb.from(table).upsert(row, { onConflict: 'id' }).then(function(res) {
      if (res.error) console.error('[data] upsert error:', table, res.error);
    });
  }
}

function deleteRow(table, id) {
  var cacheKey = '_table_' + table;
  var cache = [];
  try { cache = JSON.parse(localStorage.getItem(cacheKey)) || []; } catch (e) {}
  cache = cache.filter(function(r) { return r.id !== id; });
  localStorage.setItem(cacheKey, JSON.stringify(cache));

  var sb = initSupabase();
  if (sb) {
    sb.from(table).delete().eq('id', id).then(function(res) {
      if (res.error) console.error('[data] delete error:', table, res.error);
    });
  }
}

// ── Batch Operations ──

function upsertRows(table, rows) {
  var cacheKey = '_table_' + table;
  var cache = [];
  try { cache = JSON.parse(localStorage.getItem(cacheKey)) || []; } catch (e) {}

  rows.forEach(function(row) {
    var idx = cache.findIndex(function(r) { return r.id === row.id; });
    if (idx >= 0) cache[idx] = Object.assign(cache[idx], row);
    else cache.push(row);
  });
  localStorage.setItem(cacheKey, JSON.stringify(cache));

  var sb = initSupabase();
  if (sb) {
    sb.from(table).upsert(rows, { onConflict: 'id' }).then(function(res) {
      if (res.error) console.error('[data] batch upsert error:', table, res.error);
    });
  }
}

// ── Real-time Subscriptions ──
// Call this after page load to get live updates when the other founder edits

var _subscriptions = {};

function subscribeToTable(table, callback) {
  var sb = initSupabase();
  if (!sb) return;
  if (_subscriptions[table]) return; // already subscribed

  var channel = sb.channel('table-' + table)
    .on('postgres_changes', { event: '*', schema: 'public', table: table }, function(payload) {
      console.log('[realtime]', table, payload.eventType);
      // Refresh local cache
      getTable(table);
      if (callback) callback(payload);
    })
    .subscribe();

  _subscriptions[table] = channel;
}

function subscribeToKV(callback) {
  var sb = initSupabase();
  if (!sb) return;
  if (_subscriptions['kv_store']) return;

  var channel = sb.channel('kv-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kv_store' }, function(payload) {
      if (payload.new && payload.new.key) {
        localStorage.setItem(payload.new.key, JSON.stringify(payload.new.value));
        if (callback) callback(payload.new.key, payload.new.value);
      }
    })
    .subscribe();

  _subscriptions['kv_store'] = channel;
}

// ── Compatibility Layer ──
// These match the old localStorage API so existing code works with minimal changes

function getData(key) {
  return getKV(key);
}

function saveData(key, value) {
  setKV(key, value);
}

// ── Init on load ──
window.addEventListener('DOMContentLoaded', function() {
  initSupabase();
});
