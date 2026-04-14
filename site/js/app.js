
// ── Theme toggle ─────────────────────────────────────────────────
function toggleTheme() {
  var isLight = document.body.classList.toggle('light-mode');
  localStorage.setItem('ws_theme', isLight ? 'light' : 'dark');
  updateThemeBtn();
}
function updateThemeBtn() {
  var isLight = document.body.classList.contains('light-mode');
  var label = isLight ? '◑ Dark' : '◐ Light';
  ['theme-toggle-btn', 'theme-toggle-btn-fog'].forEach(function(id) {
    var btn = document.getElementById(id);
    if (btn) btn.textContent = label;
  });
}
(function initTheme() {
  if (localStorage.getItem('ws_theme') === 'light') {
    document.body.classList.add('light-mode');
  }
  // Delay btn update until DOM ready
  document.addEventListener('DOMContentLoaded', updateThemeBtn);
  updateThemeBtn();
})();

// ─── DATA ───────────────────────────────
const SYNTH_SYSTEM = {
  'front-questions': `You are a sharp advisor for The Front — a concept-driven collective retail space in NYC for emerging designers and experimental creatives. It features rotating merchandise, bespoke interiors, and community events. The founder has done short-term pop-up events as proof of concept and is now working on a business plan, seeking funding, and looking for a space. Read their planning session answers and write a 3-paragraph synthesis: (1) what the answers reveal about where The Front is strong and where gaps remain, (2) the most important thing to figure out or decide right now, (3) one or two specific reframes for moving forward. Be direct, reference what they wrote, no generic advice.`,
  'front-reflect': `You are a sharp advisor for The Front — a NYC collective space for emerging designers. The founder has done pop-up events and is in business planning stage. Read their reflection answers and write a 3-paragraph synthesis: (1) what the answers reveal about their mindset, fears, and readiness, (2) patterns or blindspots worth naming, (3) one reframe for how to think about their situation differently. Be warm but honest. Reference what they actually wrote.`,
  'front-action': `You are a direct execution coach for The Front — a NYC collective space for emerging designers. Read their weekly action check-in and write a 2-paragraph synthesis: (1) what the answers show about their actual momentum and any avoidance patterns, (2) one clear, direct recommendation for what to do differently next week. Be specific and honest. Reference what they wrote.`,
  'front-balance': `You are a thoughtful advisor for The Front founder. Read their wellbeing check-in and write a 2-paragraph synthesis: (1) what their answers honestly reveal about their current energy and sustainability, (2) one useful perspective shift — not toxic positivity, just clarity. Be warm and specific.`,
  'fog-questions': `You are a sharp advisor for Heft Gallery — a London Fog tea concentrate, barista-first with eventual DTC ambitions. The founder has pop-up event proof and is now building toward first wholesale accounts. Read their planning session answers and write a 3-paragraph synthesis: (1) what the answers reveal about Heft Gallery's strengths and real gaps, (2) the most important thing to do next, (3) one specific reframe for the barista-first strategy. Be direct, reference what they wrote.`,
  'fog-reflect': `You are a sharp advisor for Heft Gallery — a London Fog tea concentrate. The founder has event proof and is building toward a real product business. Read their reflection answers and write a 3-paragraph synthesis: (1) what the answers reveal about their mindset and direction, (2) any patterns or hesitations worth naming, (3) one reframe. Be honest and specific.`,
  'fog-action': `You are a direct execution coach for Heft Gallery. Read their weekly action check-in and write a 2-paragraph synthesis: (1) what the answers show about their momentum on Heft Gallery, (2) one clear recommendation for next week. Be specific. Reference what they wrote.`,
  'fog-balance': `You are a thoughtful advisor for the Heft Gallery founder. Read their wellbeing check-in and write a 2-paragraph synthesis: (1) honest read of their energy and pace, (2) one useful perspective. Be warm but direct.`
};

const archiveFilters = { front: 'all', fog: 'all' };

function getArchive(project) {
  try { return JSON.parse(localStorage.getItem('ws_' + project + '_v1') || '[]'); } catch { return []; }
}
function saveArchive(project, data) {
  localStorage.setItem('ws_' + project + '_v1', JSON.stringify(data));
}

// ─── GROUPED NAV ──────────────────────
const GROUP_TABS = {
  front: {
    today:   [
      { tab:'roadmap', icon:'🗺', label:'Roadmap' },
    ],
    build:   [
      { tab:'tracker',     icon:'🎯', label:'Tracker'     },
      { tab:'questions',   icon:'🏛', label:'Planning'    },
      { tab:'bizplan',     icon:'📋', label:'Bus. Plan'   },
      { tab:'financials',  icon:'💰', label:'Financials'  },
      { tab:'spaces',      icon:'🏛', label:'Spaces'      },
      { tab:'contacts',    icon:'📇', label:'Contacts'    },
    ],
    operate: [
      { tab:'vendors',     icon:'🤝', label:'Vendors'     },
      { tab:'programming', icon:'📅', label:'Programming' },
      { tab:'partnerships',icon:'🌐', label:'Partnerships'},
    ],
    popup: [
      { tab:'popup',       icon:'🏮', label:'334 Broome'  },
    ],
    develop: [
      { tab:'story',       icon:'✍️', label:'Story'       },
      { tab:'references',  icon:'🖼', label:'References'  },
      { tab:'ideas',       icon:'💡', label:'Ideas'       },
    ],
    reflect: [
      { tab:'reflect',     icon:'🪞', label:'Reflect'     },
      { tab:'action',      icon:'⚡', label:'Action'      },
      { tab:'balance',     icon:'⚖️', label:'Balance'     },
      { tab:'archive',     icon:'📁', label:'Archive'     },
    ],
  },
  fog: {}
};

let activeGroup = { front: 'today' };

// ─── POP-UP SUB-TABS ──────────────────
function showPopupTab(name, btn) {
  if (name === 'schedule') { setTimeout(renderPopupSchedule, 20); }
  document.querySelectorAll('.popup-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.popup-tab').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('popup-panel-' + name);
  if (panel) panel.classList.add('active');
  btn.classList.add('active');
}

function showFinTab(name, btn) {
  document.querySelectorAll('.fin-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#front-financials .popup-tab').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('fin-panel-' + name);
  if (panel) panel.classList.add('active');
  btn.classList.add('active');
}

// ─── BUDGET SYSTEM ────────────────────
const BUDGET_CATS = [
  { id:'operations', label:'Operations',   color:'#a8c4d4' },
  { id:'interior',   label:'Interior',     color:'#c9a8d4' },
  { id:'fabrication',label:'Fabrication',  color:'#d4b896' },
  { id:'marketing',  label:'Marketing',    color:'#e2c97e' },
  { id:'supplies',   label:'Supplies',     color:'#88c98a' },
  { id:'legal',      label:'Legal',        color:'#d4a8a8' },
  { id:'events',     label:'Events',       color:'#82bfbb'  },
  { id:'buffer',     label:'Buffer',       color:'#8899aa' },
];

const budgetCollapsed = { upfront: new Set(), monthly: new Set(), popup: new Set() };

const BUDGET_DEFAULTS = {
  upfront: [
    { item:'Rent deposit',           note:'First + last + security (~3 mo)', amt:0, cat:'operations' },
    { item:'Build-out / renovation', note:'Flooring, walls, lighting',        amt:0, cat:'interior'   },
    { item:'Display fixtures',       note:'Racks, pedestals, tables',         amt:0, cat:'interior'   },
    { item:'Vinyl / window signage', note:'Interior graphics',                amt:0, cat:'fabrication' },
    { item:'Exterior street sign',   note:'Blade/awning, NYC DOB permit req', amt:0, cat:'fabrication' },
    { item:'Shopping bags',          note:'Branded — qty × unit cost',        amt:0, cat:'supplies'   },
    { item:'Hang tags / price tags', note:'Branded tags for vendors',         amt:0, cat:'supplies'   },
    { item:'Tissue / packaging',     note:'Branded tissue, boxes, ribbon',    amt:0, cat:'supplies'   },
    { item:'POS hardware',           note:'Square terminal, iPad, reader',    amt:0, cat:'operations' },
    { item:'Website setup',          note:'Domain, Shopify/Squarespace',      amt:0, cat:'marketing'  },
    { item:'Opening event',          note:'Catering, invitations, florals',   amt:0, cat:'events'     },
    { item:'LLC formation + legal',  note:'NY LLC ~$200 + attorney',          amt:0, cat:'legal'      },
    { item:'Permits & licenses',     note:'NYC DCA, signage permits, COO',    amt:0, cat:'legal'      },
    { item:'3-month reserve',        note:'Operating buffer — critical',      amt:0, cat:'buffer'     },
    { item:'Contingency (10–15%)',   note:'Always needed',                    amt:0, cat:'buffer'     },
  ],
  monthly: [
    { item:'Rent',                   note:'Base lease',                       amt:0, cat:'operations' },
    { item:'Utilities',              note:'Electric, gas, internet',          amt:0, cat:'operations' },
    { item:'Insurance',              note:'General liability ~$100–200/mo',   amt:0, cat:'legal'      },
    { item:'Your draw / pay',        note:'Pay yourself',                     amt:0, cat:'operations' },
    { item:'POS / software',         note:'Square, Shopify, accounting',      amt:0, cat:'operations' },
    { item:'Marketing / content',    note:'Print, paid social, photography',  amt:0, cat:'marketing'  },
    { item:'Supplies replenishment', note:'Bags, tags, tissue — ongoing',     amt:0, cat:'supplies'   },
    { item:'Event costs',            note:'Per-event spend averaged monthly', amt:0, cat:'events'     },
    { item:'Misc / buffer',          note:'Unexpected — always comes up',     amt:0, cat:'buffer'     },
  ],
  popup: [
    { item:'Space / gallery fee',    note:'What 334 Broome charges',          amt:0, cat:'operations' },
    { item:'Install / build-out',    note:'Fixtures, paint, lighting tweaks', amt:0, cat:'interior'   },
    { item:'Signage',                note:'Vinyl, window cling, printed',     amt:0, cat:'fabrication' },
    { item:'Shopping bags',          note:'Branded — qty × unit cost',        amt:0, cat:'supplies'   },
    { item:'Hang tags / price tags', note:'Branded for all vendors',          amt:0, cat:'supplies'   },
    { item:'Tissue / packaging',     note:'Branded tissue, boxes',            amt:0, cat:'supplies'   },
    { item:'Opening event',          note:'Drinks, invitations, florals',     amt:0, cat:'events'     },
    { item:'Marketing / promotion',  note:'Flyers, paid posts, photographer', amt:0, cat:'marketing'  },
    { item:'POS (if needed)',        note:'Square reader, setup',             amt:0, cat:'operations' },
    { item:'Strike / removal',       note:'Labor, disposal',                  amt:0, cat:'operations' },
    { item:'Contingency (10%)',      note:'Always something',                 amt:0, cat:'buffer'     },
  ],
};

function getBudget(type) {
  try {
    const raw = localStorage.getItem('budget_' + type + '_v1');
    if (raw) return JSON.parse(raw);
  } catch {}
  const defaults = (BUDGET_DEFAULTS[type] || []).map((d, i) => ({ ...d, id: Date.now() + i }));
  saveBudgetData(type, defaults);
  return defaults;
}
function saveBudgetData(type, rows) {
  localStorage.setItem('budget_' + type + '_v1', JSON.stringify(rows));
}
function saveBudget(type) {
  const ids = { upfront:'fin-saved-upfront', monthly:'fin-saved-monthly', popup:'popup-saved-bud' };
  const el = document.getElementById(ids[type]);
  if (el) { el.style.opacity = '1'; setTimeout(() => el.style.opacity = '0', 1800); }
}

function toggleBudgetCat(type, catId) {
  const col = budgetCollapsed[type];
  if (!col) return;
  if (col.has(catId)) col.delete(catId);
  else col.add(catId);
  renderBudget(type);
}

function addBudgetRow(type, catId) {
  const rows = getBudget(type);
  const targetCat = catId || 'operations';
  rows.push({ id: Date.now(), item:'', note:'', amt:0, cat: targetCat });
  saveBudgetData(type, rows);
  if (budgetCollapsed[type]) budgetCollapsed[type].delete(targetCat);
  renderBudget(type);
  setTimeout(() => {
    const group = document.getElementById('bgroup-' + type + '-' + targetCat);
    if (group) {
      const inputs = group.querySelectorAll('.budget-item-input');
      if (inputs.length) inputs[inputs.length - 1].focus();
    }
  }, 40);
}

function updateBudgetField(type, id, field, value) {
  const rows = getBudget(type);
  const row = rows.find(r => r.id === id);
  if (row) {
    row[field] = field === 'amt' ? (parseFloat(value) || 0) : value;
    saveBudgetData(type, rows);
    updateCatSubtotal(type, row.cat);
  }
  renderPie(type);
  updateBudgetTotal(type);
}

function updateCatSubtotal(type, catId) {
  const rows = getBudget(type);
  const subtotal = rows.filter(r => r.cat === catId).reduce((s,r) => s + (parseFloat(r.amt)||0), 0);
  const el = document.getElementById('bcat-sub-' + type + '-' + catId);
  if (el) el.textContent = subtotal > 0 ? '$' + subtotal.toLocaleString() : '';
}

function deleteBudgetRow(type, id) {
  saveBudgetData(type, getBudget(type).filter(r => r.id !== id));
  renderBudget(type);
}

function updateBudgetTotal(type) {
  const rows = getBudget(type);
  const total = rows.reduce((s, r) => s + (parseFloat(r.amt) || 0), 0);
  const suffix = type === 'monthly' ? ' / mo' : '';
  const el = document.getElementById('budget-total-' + type);
  if (el) el.textContent = 'Total: $' + total.toLocaleString() + suffix;
}

function renderBudget(type) {
  const rows = getBudget(type);
  const container = document.getElementById('budget-rows-' + type);
  if (!container) return;
  const collapsed = budgetCollapsed[type] || new Set();

  const catsUsed = BUDGET_CATS.filter(cat => rows.some(r => r.cat === cat.id));

  container.innerHTML = catsUsed.map(cat => {
    const catRows = rows.filter(r => r.cat === cat.id);
    const subtotal = catRows.reduce((s,r) => s + (parseFloat(r.amt)||0), 0);
    const isCollapsed = collapsed.has(cat.id);
    const bg = cat.color + '18';
    const border = cat.color + '35';

    const rowsHtml = catRows.map(row => `
      <div class="budget-row" id="brow-${type}-${row.id}">
        <div class="budget-row-inner">
          <input class="budget-item-input" value="${esc(row.item)}" placeholder="Line item…"
            oninput="updateBudgetField('${type}',${row.id},'item',this.value)">
          <input class="budget-note-input" value="${esc(row.note)}" placeholder="Notes…"
            oninput="updateBudgetField('${type}',${row.id},'note',this.value)">
        </div>
        <input class="budget-amt-input" type="number" value="${row.amt || ''}" placeholder="0"
          oninput="updateBudgetField('${type}',${row.id},'amt',this.value)">
        <button class="budget-del-btn" onclick="deleteBudgetRow('${type}',${row.id})">✕</button>
      </div>`).join('');

    return `
      <div class="bcat-group" id="bgroup-${type}-${cat.id}" style="border-color:${border}">
        <div class="bcat-header" onclick="toggleBudgetCat('${type}','${cat.id}')"
          style="background:${bg}">
          <span class="bcat-dot" style="background:${cat.color}"></span>
          <span class="bcat-name" style="color:${cat.color}">${cat.label}</span>
          <span class="bcat-count">${catRows.length} item${catRows.length !== 1 ? 's' : ''}</span>
          <span class="bcat-subtotal" id="bcat-sub-${type}-${cat.id}">${subtotal > 0 ? '$' + subtotal.toLocaleString() : ''}</span>
          <button class="bcat-add-btn" title="Add item"
            onclick="event.stopPropagation();addBudgetRow('${type}','${cat.id}')">+</button>
          <span class="bcat-chevron" style="color:${cat.color}">${isCollapsed ? '▸' : '▾'}</span>
        </div>
        <div class="bcat-body${isCollapsed ? ' collapsed' : ''}">
          ${rowsHtml}
        </div>
      </div>`;
  }).join('');

  container.insertAdjacentHTML('beforeend', `
    <div class="budget-new-cat-row">
      Add to:
      ${BUDGET_CATS.map(cat =>
        `<button class="bcat-new-btn" style="background:${cat.color}18;color:${cat.color};border-color:${cat.color}30"
          onclick="addBudgetRow('${type}','${cat.id}')">${cat.label}</button>`
      ).join('')}
    </div>`);

  updateBudgetTotal(type);
  renderPie(type);
}

function renderPie(type) {
  const canvas = document.getElementById('pie-' + type);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const rows = getBudget(type);
  const totals = {};
  BUDGET_CATS.forEach(c => { totals[c.id] = 0; });
  rows.forEach(r => { totals[r.cat] = (totals[r.cat] || 0) + (parseFloat(r.amt) || 0); });
  const grand = Object.values(totals).reduce((a,b) => a+b, 0);
  const slices = BUDGET_CATS.map(c => ({ cat:c, val:totals[c.id] })).filter(s => s.val > 0);
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  if (!grand) {
    ctx.fillStyle = '#ffffff10';
    ctx.beginPath(); ctx.arc(W/2, H/2, W/2 - 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffffff25'; ctx.font = '9px DM Mono, monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('enter amounts', W/2, H/2);
    const leg = document.getElementById('pie-legend-' + type);
    if (leg) leg.innerHTML = '';
    return;
  }
  let angle = -Math.PI / 2;
  const cx = W/2, cy = H/2, r = W/2 - 6;
  slices.forEach(s => {
    const sweep = (s.val / grand) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + sweep); ctx.closePath();
    ctx.fillStyle = s.cat.color; ctx.fill();
    ctx.strokeStyle = '#0c0c0f'; ctx.lineWidth = 2; ctx.stroke();
    angle += sweep;
  });
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.52, 0, Math.PI * 2);
  ctx.fillStyle = '#0c0c0f'; ctx.fill();
  ctx.fillStyle = '#e8e2d6';
  ctx.font = 'bold 12px DM Mono, monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('$' + grand.toLocaleString(), cx, cy);
  const legendEl = document.getElementById('pie-legend-' + type);
  if (legendEl) {
    legendEl.innerHTML = slices.map(s => {
      const pct = Math.round((s.val / grand) * 100);
      return `<div class="pie-legend-row">
        <div class="pie-legend-swatch" style="background:${s.cat.color}"></div>
        ${s.cat.label}
        <span class="pie-legend-pct">${pct}% &nbsp;$${s.val.toLocaleString()}</span>
      </div>`;
    }).join('');
  }
}

function initBudgets() {
  ['upfront','monthly','popup'].forEach(type => renderBudget(type));
}

// ─── NAVIGATION ───────────────────────
function goTo(dest) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + dest).classList.add('active');
  window.scrollTo(0, 0);
}

function showGroup(project, group, btn) {
  if (project === 'fog') return; // fog uses its own tab system
  activeGroup[project] = group;
  // update group buttons
  const nav = document.getElementById(project + '-nav');
  nav.querySelectorAll('.group-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // render sub-bar
  const subBar = document.getElementById(project + '-subbar');
  const tabs = (GROUP_TABS[project] || {})[group] || [];
  if (tabs.length === 0) {
    subBar.innerHTML = '';
    // show today view
    showView(project, 'today');
    return;
  }
  subBar.innerHTML = tabs.map((t,i) =>
    `<button class="tab${i===0?' active':''}" data-tab="${t.tab}" onclick="showTab('${project}','${t.tab}',this)">
      <span class="tab-icon">${t.icon}</span>${t.label}
    </button>`
  ).join('');
  // show first tab in group
  showView(project, tabs[0].tab);
}


// ═══ MARKETING ════════════════════════════════════════════════════
var mktActiveTab = 'overview';
var mktSchedActiveFilter = 'all';
var mktTypeFilters = { instagram: 'all', press: 'all', email: 'all', physical: 'all' };

var MKT_CHANNELS = ['instagram','tiktok','press','email','physical'];
var MKT_CHANNEL_COLORS = { instagram: '#a8c4d4', tiktok: '#f0a8c4', press: '#e2c97e', email: '#88c98a', physical: '#c4a8d4' };
var MKT_TYPES = {
  instagram: ['post','story','reel','collab'],
  press:     ['magazine','blog','newsletter','podcast'],
  email:     ['blast','personal','followup'],
  physical:  ['flyer','poster','partner','event'],
  tiktok:    ['video','duet','trend','collab']
};
var MKT_DEFAULT_TASKS = {
  instagram: [
    { title: 'Save the date announcement post', type: 'post', week: 'pre' },
    { title: 'Vendor spotlight — Verconiik', type: 'post', week: '1' },
    { title: 'Behind-the-scenes install stories', type: 'story', week: 'pre' },
    { title: 'Opening night reel', type: 'reel', week: '1' },
    { title: 'Day 2 stories walkthrough', type: 'story', week: '1' },
    { title: 'Vendor spotlight — Harlot Hands', type: 'post', week: '2' },
    { title: 'Mid-run highlights reel', type: 'reel', week: '2' },
    { title: 'Closing weekend post', type: 'post', week: '4' }
  ],
  press: [
    { title: 'Hint Mag — pitch event preview', type: 'magazine', week: 'pre' },
    { title: 'Time Out NY — listings submission', type: 'blog', week: 'pre' },
    { title: 'Parsons newsletter feature', type: 'newsletter', week: 'pre' },
    { title: 'Local design blog outreach', type: 'blog', week: '1' },
    { title: 'i-D online — follow-up pitch', type: 'magazine', week: '2' }
  ],
  email: [
    { title: 'Save the date — full list', type: 'blast', week: 'pre' },
    { title: 'Personal invites — close network', type: 'personal', week: 'pre' },
    { title: 'Opening week reminder', type: 'blast', week: '1' },
    { title: 'Week 2 update + new vendor spotlight', type: 'blast', week: '2' },
    { title: 'Closing weekend — last chance', type: 'blast', week: '4' }
  ],
  tiktok: [
    { title: 'Announcing the pop-up — behind the scenes', type: 'video', week: 'pre' },
    { title: 'Meet the vendors series — Verconiik', type: 'video', week: '1' },
    { title: 'Day-in-the-life at 334 Broome', type: 'video', week: '1' },
    { title: 'Vendor spotlight — Harlot Hands', type: 'video', week: '2' },
    { title: 'Styling session with in-house pieces', type: 'video', week: '2' },
    { title: 'Closing weekend GRWM', type: 'trend', week: '4' }
  ],
  physical: [
    { title: 'Flyer drop — LES cafes + galleries', type: 'flyer', week: 'pre' },
    { title: 'Poster — Parsons + SVA boards', type: 'poster', week: 'pre' },
    { title: 'SoHo / Nolita flyer sweep', type: 'flyer', week: 'pre' },
    { title: 'Partner placement — local boutique', type: 'partner', week: '1' }
  ]
};

function getMktTasks() {
  try { return JSON.parse(localStorage.getItem('mkt_tasks_v1') || 'null'); } catch(e) { return null; }
}
function saveMktTasks(data) {
  localStorage.setItem('mkt_tasks_v1', JSON.stringify(data));
}
function initMktTasks() {
  var existing = getMktTasks();
  if (existing) return existing;
  var data = {};
  MKT_CHANNELS.forEach(function(ch) {
    data[ch] = MKT_DEFAULT_TASKS[ch].map(function(t, i) {
      return { id: ch + '_' + i, title: t.title, type: t.type, week: t.week, done: false };
    });
  });
  saveMktTasks(data);
  return data;
}

function mktShowSocial(platform, btn) {
  document.querySelectorAll('.mkt-social-panel').forEach(function(p){ p.style.display = 'none'; });
  var panel = document.getElementById('mkt-social-' + platform);
  if (panel) panel.style.display = '';
  document.querySelectorAll('.mkt-social-tab').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  mktTypeFilters[platform] = mktTypeFilters[platform] || 'all';
  mktRenderChannel(platform);
}

function mktShowTab(name, btn) {
  mktActiveTab = name;
  document.querySelectorAll('.mkt-tab').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.mkt-panel').forEach(function(p){ p.style.display = 'none'; });
  var panel = document.getElementById('mkt-panel-' + name);
  if (panel) panel.style.display = '';
  if (name === 'overview') mktRenderOverview();
  else if (name === 'schedule') mktRenderSchedule();
  else if (name === 'socials') {
    mktRenderChannel('instagram');
    mktRenderChannel('tiktok');
  }
  else mktRenderChannel(name);
}

function mktShowTabByName(name) {
  var tabs = document.querySelectorAll('.mkt-tab');
  var channels = ['overview','instagram','press','email','physical','schedule'];
  var idx = channels.indexOf(name);
  mktShowTab(name, tabs[idx] || null);
}

function mktRenderOverview() {
  var data = initMktTasks();
  // socials card = instagram + tiktok combined
  var igTasks = data['instagram'] || [];
  var ttTasks = data['tiktok'] || [];
  var socialTasks = igTasks.concat(ttTasks);
  var socialDone = socialTasks.filter(function(t){ return t.done; }).length;
  var socialTotal = socialTasks.length;
  var socialPct = socialTotal > 0 ? Math.round(socialDone / socialTotal * 100) : 0;
  var sStatEl = document.getElementById('mkt-stat-socials');
  var sProgEl = document.getElementById('mkt-prog-socials');
  if (sStatEl) sStatEl.textContent = socialDone + ' / ' + socialTotal + ' done';
  if (sProgEl) sProgEl.style.width = socialPct + '%';

  ['press','email','physical'].forEach(function(ch) {
    var tasks = data[ch] || [];
    var done = tasks.filter(function(t){ return t.done; }).length;
    var total = tasks.length;
    var pct = total > 0 ? Math.round(done / total * 100) : 0;
    var statEl = document.getElementById('mkt-stat-' + ch);
    var progEl = document.getElementById('mkt-prog-' + ch);
    if (statEl) statEl.textContent = done + ' / ' + total + ' done';
    if (progEl) progEl.style.width = pct + '%';
  });
  // restore bp fields
  loadBPData();
}

function mktRenderChannel(ch) {
  var data = initMktTasks();
  var tasks = data[ch] || [];
  var filter = mktTypeFilters[ch] || 'all';
  var filtered = filter === 'all' ? tasks : tasks.filter(function(t){ return t.type === filter; });
  var listEl = document.getElementById('mkt-tasks-' + ch);
  if (!listEl) return;

  var WEEKS = ['pre','1','2','3','4'];
  var WEEK_LABELS = { pre: 'Pre-launch', '1': 'Week 1', '2': 'Week 2', '3': 'Week 3', '4': 'Week 4' };
  var types = MKT_TYPES[ch] || [];

  var html = '';
  WEEKS.forEach(function(w) {
    var wTasks = filtered.filter(function(t){ return (t.week||'pre') === w; });
    if (!wTasks.length) return;
    html += '<div class="mkt-week-label">' + WEEK_LABELS[w] + '<span>' + wTasks.filter(function(t){return t.done;}).length + '/' + wTasks.length + '</span></div>';
    wTasks.forEach(function(task) {
      var typeOpts = types.map(function(tp) {
        return '<option value="' + tp + '"' + (task.type === tp ? ' selected' : '') + '>' + tp + '</option>';
      }).join('');
      var weekOpts = WEEKS.map(function(wk) {
        return '<option value="' + wk + '"' + (task.week === wk ? ' selected' : '') + '>' + (WEEK_LABELS[wk]) + '</option>';
      }).join('');
      html += '<div class="mkt-task-row' + (task.done ? ' done' : '') + '" id="mkt-row-' + task.id + '">' +
        '<div class="mkt-task-check' + (task.done ? ' checked' : '') + '" data-ch="' + ch + '" data-id="' + task.id + '" onclick="mktToggle(this.dataset.ch,this.dataset.id)"></div>' +
        '<input class="mkt-task-title" value="' + esc(task.title) + '" placeholder="Task…"' +
          ' data-ch="' + ch + '" data-id="' + task.id + '" data-field="title" onchange="mktUpdateTask(this.dataset.ch,this.dataset.id,this.dataset.field,this.value)">' +
        '<select class="mkt-task-type-sel" data-ch="' + ch + '" data-id="' + task.id + '" data-field="type" onchange="mktUpdateTask(this.dataset.ch,this.dataset.id,this.dataset.field,this.value)">' + typeOpts + '</select>' +
        '<select class="mkt-task-week-sel" data-ch="' + ch + '" data-id="' + task.id + '" data-field="week" onchange="mktUpdateTask(this.dataset.ch,this.dataset.id,this.dataset.field,this.value)">' + weekOpts + '</select>' +
        '<button class="mkt-task-del" data-ch="' + ch + '" data-id="' + task.id + '" onclick="mktDeleteTask(this.dataset.ch,this.dataset.id)">✕</button>' +
      '</div>';
    });
  });

  // ungrouped (no matching week)
  var ungrouped = filtered.filter(function(t){ return !WEEKS.includes(t.week||'pre'); });
  ungrouped.forEach(function(task) {
    var typeOpts = types.map(function(tp) {
      return '<option value="' + tp + '"' + (task.type === tp ? ' selected' : '') + '>' + tp + '</option>';
    }).join('');
    html += '<div class="mkt-task-row' + (task.done ? ' done' : '') + '">' +
      '<div class="mkt-task-check' + (task.done ? ' checked' : '') + '" data-ch="' + ch + '" data-id="' + task.id + '" onclick="mktToggle(this.dataset.ch,this.dataset.id)"></div>' +
      '<input class="mkt-task-title" value="' + esc(task.title) + '" placeholder="Task…" data-ch="' + ch + '" data-id="' + task.id + '" data-field="title" onchange="mktUpdateTask(this.dataset.ch,this.dataset.id,this.dataset.field,this.value)">' +
      '<select class="mkt-task-type-sel" data-ch="' + ch + '" data-id="' + task.id + '" data-field="type" onchange="mktUpdateTask(this.dataset.ch,this.dataset.id,this.dataset.field,this.value)">' + typeOpts + '</select>' +
      '<button class="mkt-task-del" data-ch="' + ch + '" data-id="' + task.id + '" onclick="mktDeleteTask(this.dataset.ch,this.dataset.id)">✕</button>' +
    '</div>';
  });

  if (!html) html = '<div class="mkt-empty">No tasks yet — click + Add.</div>';
  listEl.innerHTML = html;
  loadBPData();
}

function mktFilterType(ch, type, btn) {
  mktTypeFilters[ch] = type;
  var panel = document.getElementById('mkt-panel-' + ch);
  if (panel) panel.querySelectorAll('.mkt-type-pill').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  mktRenderChannel(ch);
}

function mktToggle(ch, id) {
  var data = initMktTasks();
  var task = (data[ch]||[]).find(function(t){ return t.id === id; });
  if (task) { task.done = !task.done; saveMktTasks(data); mktRenderChannel(ch); }
}

function mktUpdateTask(ch, id, field, value) {
  var data = initMktTasks();
  var task = (data[ch]||[]).find(function(t){ return t.id === id; });
  if (task) { task[field] = value; saveMktTasks(data); }
  if (field === 'type' || field === 'week') mktRenderChannel(ch);
}

function mktDeleteTask(ch, id) {
  var data = initMktTasks();
  data[ch] = (data[ch]||[]).filter(function(t){ return t.id !== id; });
  saveMktTasks(data);
  mktRenderChannel(ch);
}

function mktAddTask(ch) {
  var data = initMktTasks();
  var tasks = data[ch] || [];
  var types = MKT_TYPES[ch] || ['other'];
  var newId = ch + '_' + Date.now();
  tasks.push({ id: newId, title: '', type: types[0], week: 'pre', done: false });
  data[ch] = tasks;
  saveMktTasks(data);
  mktRenderChannel(ch);
}

function mktSchedFilter(filter, btn) {
  mktSchedActiveFilter = filter;
  document.querySelectorAll('.mkt-sched-filters .mkt-type-pill').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  mktRenderSchedule();
}

function mktRenderSchedule() {
  var data = initMktTasks();
  var boardEl = document.getElementById('mkt-schedule-board');
  if (!boardEl) return;

  var WEEKS = ['pre','1','2','3','4'];
  var WEEK_LABELS = { pre: 'Pre-launch', '1': 'Week 1', '2': 'Week 2', '3': 'Week 3', '4': 'Week 4' };
  var channels = mktSchedActiveFilter === 'all' ? MKT_CHANNELS : [mktSchedActiveFilter];

  var html = '';
  WEEKS.forEach(function(w) {
    var items = [];
    channels.forEach(function(ch) {
      (data[ch]||[]).forEach(function(t) {
        if ((t.week||'pre') === w) items.push({ ch: ch, task: t });
      });
    });
    if (!items.length) return;
    var doneCount = items.filter(function(i){ return i.task.done; }).length;
    html += '<div class="mkt-week-block"><div class="mkt-week-label">' + WEEK_LABELS[w] +
      '<span>' + doneCount + '/' + items.length + ' done</span></div>';
    items.forEach(function(item) {
      var col = MKT_CHANNEL_COLORS[item.ch] || '#888';
      html += '<div class="mkt-sched-item" style="background:' + (item.task.done ? 'transparent' : 'var(--surface2)') + ';opacity:' + (item.task.done ? '0.4' : '1') + '">' +
        '<div class="mkt-sched-dot" style="background:' + col + '"></div>' +
        '<span class="mkt-sched-channel">' + item.ch + '</span>' +
        '<span class="mkt-sched-text">' + esc(item.task.title || '(untitled)') + '</span>' +
        '<span class="mkt-sched-week-tag">' + (item.task.type || '') + '</span>' +
      '</div>';
    });
    html += '</div>';
  });

  if (!html) html = '<div class="mkt-empty">No tasks scheduled yet. Add tasks in each channel tab.</div>';
  boardEl.innerHTML = html;
}


// ═══ VIOLETS ════════════════════════════════════════════════════

var VI_PHASES = [
  { id: 'sketch',      label: 'Sketching',       color: '#a8c4d4' },
  { id: 'experiment',  label: 'Experimentation',  color: '#e2c97e' },
  { id: 'pattern',     label: 'Patterning',       color: '#c4a8d4' },
  { id: 'source',      label: 'Sourcing',         color: '#88c98a' },
  { id: 'production',  label: 'Production',       color: '#d4a8b8' },
  { id: 'finish',      label: 'Finishing',        color: '#a8d4bc' },
  { id: 'photo',       label: 'Photography',      color: '#f0c888' },
  { id: 'launch',      label: 'Launch',           color: '#e2c97e' }
];

var VI_CONTACT_TYPES = ['supplier','manufacturer','distributor','stockist','press','other'];
var viContactFilter = 'all';

function getViolets(key) {
  try { return JSON.parse(localStorage.getItem('vi_' + key + '_v1') || 'null'); } catch(e) { return null; }
}
function saveViolets(key, data) { localStorage.setItem('vi_' + key + '_v1', JSON.stringify(data)); }

function viTab(name, btn) {
  document.querySelectorAll('#fog-nav .tab').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  document.querySelectorAll('#page-fog .ws-view').forEach(function(v){ v.classList.remove('active'); });
  var panel = document.getElementById('vi-' + name);
  if (panel) panel.classList.add('active');
  if (name === 'materials') { viRenderMaterials(); viRenderLabor(); viRecalc(); }
  if (name === 'production') { viRenderProdTasks(); loadBPData(); }
  if (name === 'contacts') viRenderContacts();
  if (name === 'schedule') { setTimeout(function(){ viRenderCalendar(); }, 20); }
  if (name === 'ideation') { viRenderPieces(); viRenderLinks(); loadBPData(); }
}

// ── Pieces ────────────────────────────────────────────────────
function getViPieces() { return getViolets('pieces') || []; }
function viRenderPieces() {
  var pieces = getViPieces();
  var el = document.getElementById('vi-pieces-list');
  if (!el) return;
  el.innerHTML = pieces.map(function(p, i) {
    return '<div class="vi-piece-row">' +
      '<input class="vi-piece-input" value="' + esc(p) + '" placeholder="e.g. draped linen top…" data-idx="' + i + '" onchange="viUpdatePiece(+this.dataset.idx,this.value)">' +
      '<button class="vi-row-del" data-idx="' + i + '" onclick="viDeletePiece(+this.dataset.idx)">✕</button>' +
    '</div>';
  }).join('');
}
function viAddPiece() { var p=getViPieces(); p.push(''); saveViolets('pieces',p); viRenderPieces(); }
function viUpdatePiece(i,v) { var p=getViPieces(); p[i]=v; saveViolets('pieces',p); }
function viDeletePiece(i) { var p=getViPieces(); p.splice(i,1); saveViolets('pieces',p); viRenderPieces(); }

// ── Links ─────────────────────────────────────────────────────
function getViLinks() { return getViolets('links') || []; }
function viRenderLinks() {
  var links = getViLinks();
  var el = document.getElementById('vi-links-list');
  if (!el) return;
  el.innerHTML = links.map(function(lk, i) {
    return '<div class="vi-link-row">' +
      '<input class="vi-link-label" value="' + esc(lk.label||'') + '" placeholder="Label" data-idx="' + i + '" data-field="label" onchange="viUpdateLink(+this.dataset.idx,this.dataset.field,this.value)">' +
      '<input class="vi-link-url" value="' + esc(lk.url||'') + '" placeholder="https://…" data-idx="' + i + '" data-field="url" onchange="viUpdateLink(+this.dataset.idx,this.dataset.field,this.value)">' +
      (lk.url ? '<a class="vi-link-open" href="' + esc(lk.url) + '" target="_blank">↗</a>' : '') +
      '<button class="vi-row-del" onclick="viDeleteLink(' + i + ')">✕</button>' +
    '</div>';
  }).join('');
}
function viAddLink() { var l=getViLinks(); l.push({label:'',url:''}); saveViolets('links',l); viRenderLinks(); }
function viUpdateLink(i,f,v) { var l=getViLinks(); if(l[i]) l[i][f]=v; saveViolets('links',l); if(f==='url') viRenderLinks(); }
function viDeleteLink(i) { var l=getViLinks(); l.splice(i,1); saveViolets('links',l); viRenderLinks(); }

// ── Materials ─────────────────────────────────────────────────
function getViMaterials() { return getViolets('materials') || []; }
function viRenderMaterials() {
  var mats = getViMaterials();
  var tbody = document.getElementById('vi-mat-rows');
  if (!tbody) return;
  var UNITS = ['yd','m','kg','g','lb','oz','pc','roll','spool','other'];
  tbody.innerHTML = mats.map(function(mat, i) {
    var sub = (parseFloat(mat.price)||0) * (parseFloat(mat.qty)||0);
    var unitOpts = UNITS.map(function(u){ return '<option value="'+u+'"'+(mat.unit===u?' selected':'')+'>'+u+'</option>'; }).join('');
    return '<tr>' +
      '<td><input class="vi-mat-input" value="' + esc(mat.name||'') + '" placeholder="Fabric, thread…" data-idx="' + i + '" data-field="name" onchange="viUpdateMat(+this.dataset.idx,this.dataset.field,this.value)"></td>' +
      '<td><input class="vi-mat-url" value="' + esc(mat.url||'') + '" placeholder="Supplier link…" data-idx="' + i + '" data-field="url" onchange="viUpdateMat(+this.dataset.idx,this.dataset.field,this.value)">' +
        (mat.url ? '<a href="' + esc(mat.url) + '" target="_blank" class="vi-link-open">↗</a>' : '') + '</td>' +
      '<td><input class="vi-mat-num" type="number" min="0" value="' + (mat.price||'') + '" placeholder="0" data-idx="' + i + '" data-field="price" onchange="viUpdateMat(+this.dataset.idx,this.dataset.field,this.value)"></td>' +
      '<td><input class="vi-mat-num" type="number" min="0" value="' + (mat.qty||'') + '" placeholder="0" data-idx="' + i + '" data-field="qty" onchange="viUpdateMat(+this.dataset.idx,this.dataset.field,this.value)"></td>' +
      '<td><select class="vi-mat-unit" data-idx="' + i + '" data-field="unit" onchange="viUpdateMat(+this.dataset.idx,this.dataset.field,this.value)">' + unitOpts + '</select></td>' +
      '<td class="vi-mat-subtotal">$' + sub.toFixed(2) + '</td>' +
      '<td><button class="vi-row-del" data-idx="' + i + '" onclick="viDeleteMat(+this.dataset.idx)">✕</button></td>' +
    '</tr>';
  }).join('');
}
function viAddMaterial() { var m=getViMaterials(); m.push({name:'',url:'',price:0,qty:0,unit:'yd'}); saveViolets('materials',m); viRenderMaterials(); viRecalc(); }
function viUpdateMat(i,f,v) { var m=getViMaterials(); if(m[i]){ m[i][f]=v; saveViolets('materials',m); } viRenderMaterials(); viRecalc(); }
function viDeleteMat(i) { var m=getViMaterials(); m.splice(i,1); saveViolets('materials',m); viRenderMaterials(); viRecalc(); }

// ── Labor ─────────────────────────────────────────────────────
function getViLabor() { return getViolets('labor') || []; }
function viRenderLabor() {
  var labor = getViLabor();
  var el = document.getElementById('vi-labor-rows');
  if (!el) return;
  el.innerHTML = labor.map(function(lk, i) {
    return '<div class="vi-labor-row">' +
      '<input class="vi-labor-desc" value="' + esc(lk.desc||'') + '" placeholder="e.g. hand-stitching, alterations, finishing…" data-idx="' + i + '" data-field="desc" onchange="viUpdateLabor(+this.dataset.idx,this.dataset.field,this.value)">' +
      '<span style="font-family:DM Mono,monospace;font-size:9px;color:var(--muted)">$</span>' +
      '<input class="vi-labor-cost" type="number" min="0" value="' + (lk.cost||'') + '" placeholder="0" data-idx="' + i + '" data-field="cost" onchange="viUpdateLabor(+this.dataset.idx,this.dataset.field,this.value)">' +
      '<button class="vi-row-del" data-idx="' + i + '" onclick="viDeleteLabor(+this.dataset.idx)">✕</button>' +
    '</div>';
  }).join('');
}
function viAddLabor() { var l=getViLabor(); l.push({desc:'',cost:0}); saveViolets('labor',l); viRenderLabor(); viRecalc(); }
function viUpdateLabor(i,f,v) { var l=getViLabor(); if(l[i]){ l[i][f]=v; saveViolets('labor',l); } viRenderLabor(); viRecalc(); }
function viDeleteLabor(i) { var l=getViLabor(); l.splice(i,1); saveViolets('labor',l); viRenderLabor(); viRecalc(); }

function viRecalc() {
  var mats = getViMaterials();
  var labor = getViLabor();
  var totalMat = mats.reduce(function(s,m){ return s + (parseFloat(m.price)||0)*(parseFloat(m.qty)||0); }, 0);
  var totalLabor = labor.reduce(function(s,l){ return s + (parseFloat(l.cost)||0); }, 0);
  var pieces = getViPieces().filter(function(p){ return p.trim(); }).length || 1;
  var costPer = (totalMat + totalLabor) / pieces;
  var retail = parseFloat(document.querySelector('[data-key="vi-retail-target"]')?.value) || 0;
  var margin = retail > 0 ? Math.round((retail - costPer) / retail * 100) : null;
  var set = function(id, val) { var el = document.getElementById(id); if(el) el.textContent = val; };
  set('vi-total-mat', '$' + totalMat.toFixed(2));
  set('vi-total-labor', '$' + totalLabor.toFixed(2));
  set('vi-cost-per-piece', '$' + costPer.toFixed(2));
  set('vi-margin', margin !== null ? margin + '%' : '—');
}

// ── Production tasks ──────────────────────────────────────────
function getViProdTasks() { return getViolets('prod_tasks') || []; }
function viRenderProdTasks() {
  var tasks = getViProdTasks();
  var el = document.getElementById('vi-prod-tasks');
  if (!el) return;
  el.innerHTML = tasks.length ? tasks.map(function(t, i) {
    return '<div class="vi-prod-task-row">' +
      '<div class="vi-task-check' + (t.done ? ' done' : '') + '" data-idx="' + i + '" onclick="viToggleProdTask(+this.dataset.idx)"></div>' +
      '<input class="vi-task-text' + (t.done ? ' done' : '') + '" value="' + esc(t.text||'') + '" placeholder="Task…" data-idx="' + i + '" onchange="viUpdateProdTask(+this.dataset.idx,this.value)">' +
      '<button class="vi-row-del" data-idx="' + i + '" onclick="viDeleteProdTask(+this.dataset.idx)">✕</button>' +
    '</div>';
  }).join('') : '<div style="color:var(--muted);font-family:DM Mono,monospace;font-size:9px;padding:12px 0">No tasks yet.</div>';
}
function viAddProdTask() { var t=getViProdTasks(); t.push({text:'',done:false}); saveViolets('prod_tasks',t); viRenderProdTasks(); }
function viUpdateProdTask(i,v) { var t=getViProdTasks(); if(t[i]) t[i].text=v; saveViolets('prod_tasks',t); }
function viToggleProdTask(i) { var t=getViProdTasks(); if(t[i]) t[i].done=!t[i].done; saveViolets('prod_tasks',t); viRenderProdTasks(); }
function viDeleteProdTask(i) { var t=getViProdTasks(); t.splice(i,1); saveViolets('prod_tasks',t); viRenderProdTasks(); }

// ── Contacts ──────────────────────────────────────────────────
function getViContacts() { return getViolets('contacts') || []; }
function viFilterContacts(type, btn) {
  viContactFilter = type;
  document.querySelectorAll('.vi-filter-pill').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  viRenderContacts();
}
function viRenderContacts() {
  var contacts = getViContacts();
  var filtered = viContactFilter === 'all' ? contacts : contacts.filter(function(ct){ return ct.type === viContactFilter; });
  var el = document.getElementById('vi-contact-list');
  if (!el) return;
  if (!filtered.length) { el.innerHTML = '<div style="color:var(--muted);font-family:DM Mono,monospace;font-size:9px;padding:20px 0;text-align:center">No contacts yet.</div>'; return; }
  var typeOpts = VI_CONTACT_TYPES.map(function(t){ return '<option value="'+t+'">' + t + '</option>'; }).join('');
  el.innerHTML = filtered.map(function(ct) {
    var tOpts = VI_CONTACT_TYPES.map(function(t){ return '<option value="'+t+'"'+(ct.type===t?' selected':'')+'>'+t+'</option>'; }).join('');
    return '<div class="vi-contact-card" id="vi-ct-' + ct.id + '">' +
      '<div class="vi-contact-top">' +
        '<input class="vi-contact-name" value="' + esc(ct.name||'') + '" placeholder="Name / company" data-cid="' + ct.id + '" data-field="name" onchange="viUpdateContact(this.dataset.cid,this.dataset.field,this.value)">' +
        '<select class="vi-contact-type" data-cid="' + ct.id + '" data-field="type" onchange="viUpdateContact(this.dataset.cid,this.dataset.field,this.value)">' + tOpts + '</select>' +
        '<button class="vi-row-del" data-cid="' + ct.id + '" onclick="viDeleteContact(this.dataset.cid)">✕</button>' +
      '</div>' +
      '<div class="vi-contact-fields">' +
        '<input class="vi-contact-field" value="' + esc(ct.email||'') + '" placeholder="Email" data-cid="' + ct.id + '" data-field="email" onchange="viUpdateContact(this.dataset.cid,this.dataset.field,this.value)">' +
        '<input class="vi-contact-field" value="' + esc(ct.phone||'') + '" placeholder="Phone / IG / site" data-cid="' + ct.id + '" data-field="phone" onchange="viUpdateContact(this.dataset.cid,this.dataset.field,this.value)">' +
        '<input class="vi-contact-field" value="' + esc(ct.location||'') + '" placeholder="Location / city" data-cid="' + ct.id + '" data-field="location" onchange="viUpdateContact(this.dataset.cid,this.dataset.field,this.value)">' +
        '<input class="vi-contact-field" value="' + esc(ct.moq||'') + '" placeholder="MOQ / lead time" data-cid="' + ct.id + '" data-field="moq" onchange="viUpdateContact(this.dataset.cid,this.dataset.field,this.value)">' +
      '</div>' +
      '<textarea class="vi-contact-notes" rows="2" placeholder="Notes, status, last contact…" data-cid="' + ct.id + '" data-field="notes" onchange="viUpdateContact(this.dataset.cid,this.dataset.field,this.value)">' + esc(ct.notes||'') + '</textarea>' +
    '</div>';
  }).join('');
}
function viAddContact() {
  var contacts = getViContacts();
  contacts.push({ id: 'ct_' + Date.now(), name: '', type: 'supplier', email: '', phone: '', location: '', moq: '', notes: '' });
  saveViolets('contacts', contacts);
  viRenderContacts();
}
function viUpdateContact(id, field, value) {
  var contacts = getViContacts();
  var ct = contacts.find(function(c){ return c.id === id; });
  if (ct) { ct[field] = value; saveViolets('contacts', contacts); }
  if (field === 'type') viRenderContacts();
}
function viDeleteContact(id) {
  saveViolets('contacts', getViContacts().filter(function(c){ return c.id !== id; }));
  viRenderContacts();
}

function initViolets() {
  viRenderPieces();
  viRenderLinks();
  loadBPData();
}






// ═══ 334 BROOME OVERVIEW / DASHBOARD ════════════════════════════
function getOvWeekItems() {
  try { return JSON.parse(localStorage.getItem('ov_week_v1') || '[]'); } catch(e) { return []; }
}
function saveOvWeekItems(d) { localStorage.setItem('ov_week_v1', JSON.stringify(d)); }

function ovRenderWeek() {
  var items = getOvWeekItems();
  var el = document.getElementById('ov-week-list');
  if (!el) return;
  if (!items.length) {
    el.innerHTML = '<div style="font-family:DM Mono,monospace;font-size:9px;color:var(--muted);padding:4px 0">Nothing added yet — what needs to happen before this opens?</div>';
    return;
  }
  el.innerHTML = items.map(function(item, i) {
    return '<div class="ov-week-item">' +
      '<div class="ov-week-check' + (item.done ? ' done' : '') + '" data-idx="' + i + '" onclick="ovCheckWeek(+this.dataset.idx)"></div>' +
      '<input class="ov-week-input' + (item.done ? ' done' : '') + '" value="' + esc(item.text || '') + '" placeholder="What needs to happen this week…" data-idx="' + i + '" onchange="ovUpdateWeek(+this.dataset.idx, this.value)">' +
      '<button class="ov-week-del" data-idx="' + i + '" onclick="ovDelWeek(+this.dataset.idx)">✕</button>' +
    '</div>';
  }).join('');
}

function ovAddWeekItem() {
  var items = getOvWeekItems();
  items.push({ text: '', done: false });
  saveOvWeekItems(items);
  ovRenderWeek();
  // Focus the new input
  setTimeout(function() {
    var inputs = document.querySelectorAll('.ov-week-input');
    if (inputs.length) inputs[inputs.length - 1].focus();
  }, 30);
}
function ovCheckWeek(i) {
  var items = getOvWeekItems();
  if (items[i]) { items[i].done = !items[i].done; saveOvWeekItems(items); ovRenderWeek(); }
}
function ovUpdateWeek(i, val) {
  var items = getOvWeekItems();
  if (items[i]) { items[i].text = val; saveOvWeekItems(items); }
}
function ovDelWeek(i) {
  var items = getOvWeekItems();
  items.splice(i, 1);
  saveOvWeekItems(items);
  ovRenderWeek();
}

function ovUpdateStats() {
  // Vendors
  try {
    var vendors = JSON.parse(localStorage.getItem('popup_vendors_v1') || '[]');
    var confirmed = vendors.filter(function(v){ return v.status === 'signed'; }).length;
    var total = vendors.length;
    var el = document.getElementById('ov-vendor-count');
    if (el) el.textContent = confirmed + ' / ' + total;
  } catch(e) {}

  // Resources
  try {
    var resItems = JSON.parse(localStorage.getItem('res_items_v1') || '[]');
    var resDone = resItems.filter(function(r){ return r.status === 'received'; }).length;
    var el = document.getElementById('ov-res-count');
    if (el) el.textContent = resDone + ' / ' + resItems.length;
  } catch(e) {}

  // Events
  try {
    var events = JSON.parse(localStorage.getItem('ev_events_v1') || '[]');
    var el = document.getElementById('ov-event-count');
    if (el) el.textContent = events.length;
  } catch(e) {}

  // Marketing tasks
  try {
    var mktData = JSON.parse(localStorage.getItem('mkt_tasks_v1') || '{}');
    var allTasks = [];
    ['instagram','tiktok','press','email','physical'].forEach(function(ch) {
      if (mktData[ch]) allTasks = allTasks.concat(mktData[ch]);
    });
    var mktDone = allTasks.filter(function(t){ return t.done; }).length;
    var el = document.getElementById('ov-mkt-count');
    if (el) el.textContent = mktDone + ' / ' + allTasks.length;
  } catch(e) {}
}

function initOverview() {
  ovRenderWeek();
  ovUpdateStats();
  loadBPData();
}



// ═══ BRAND ANALYZE / REWORD / EXPORT ═════════════════════════════

async function brandReword(sectionKey, btn) {
  var panelEl = document.getElementById('brand-reword-' + sectionKey);
  if (!panelEl) return;
  btn.disabled = true; btn.textContent = 'Rewriting…';
  panelEl.style.display = 'block';
  panelEl.innerHTML = '<div class="csh-ai-loading"><div class="csh-ai-dots"><span></span><span></span><span></span></div>Reading your answers and suggesting rewrites…</div>';

  var d = getBPData();
  var BRAND_FIELDS = {
    concept: {
      keys: ['brand-one-sentence','brand-problem','brand-not'],
      labels: {'brand-one-sentence':'One-sentence definition','brand-problem':'Problem it solves','brand-not':'What it is NOT'}
    },
    audience: {
      keys: ['brand-audience-designer','brand-audience-customer'],
      labels: {'brand-audience-designer':'The designer/vendor','brand-audience-customer':'The customer'}
    },
    position: {
      keys: ['brand-three-words','brand-competitive','brand-success'],
      labels: {'brand-three-words':'3 defining words','brand-competitive':'Competitive awareness','brand-success':'Success in 2 years'}
    },
    model: {
      keys: ['brand-revenue-streams','brand-vendor-selection'],
      labels: {'brand-revenue-streams':'Revenue streams','brand-vendor-selection':'Vendor selection'}
    },
    visref: {
      keys: ['vis-references','vis-feeling'],
      labels: {'vis-references':'Visual references','vis-feeling':'Feeling of the system'}
    },
    visapply: {
      keys: ['vis-signage','vis-packaging','vis-digital','vis-avoid'],
      labels: {'vis-signage':'Signage','vis-packaging':'Packaging','vis-digital':'Digital','vis-avoid':'What to avoid'}
    }
  };

  var section = BRAND_FIELDS[sectionKey];
  if (!section) { panelEl.innerHTML = '<div class="csh-ai-body"><p class="csh-ai-warn">Unknown section.</p></div>'; btn.disabled=false; btn.textContent='✦ Suggest rewrites'; return; }

  var content = section.keys.map(function(k){
    return (section.labels[k]||k) + ':\n' + (d[k]||'(not filled in)');
  }).join('\n\n');

  var system = 'You are rewriting brand identity copy for The Front — a living curatorial space in downtown Manhattan that treats retail as an experimental format driven by concept, for showcasing work, exploring visual craft, and building creative community. That sentence is the anchor. Everything else should be held to it. Your rewrites should be: specific without being precious, direct without being blunt, curatorial without being cold. Cut hedging language. Compress. Find the sentence that says it in a way that only The Front could say it — not a boutique, not a gallery, not a market. The voice knows what it is. It doesn\'t need to explain. Format your response as JSON with an array called "rewrites", each item having "field" (the field name), "original" (the original text, shortened to 80 chars), and "suggestions" (array of 1-2 rewrite strings). Return ONLY valid JSON.';

  try {
    var res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        system: system,
        messages: [{ role: 'user', content: 'Here are my draft answers:\n\n' + content + '\n\nSuggest rewrites.' }]
      })
    });
    var data = await res.json();
    var text = (data.content && data.content[0] && data.content[0].text) || '';
    text = text.replace(/^```json\s*/,'').replace(/```\s*$/,'').trim();
    var parsed = JSON.parse(text);
    var rewrites = parsed.rewrites || [];

    var html = '<div class="csh-ai-result">';
    html += '<div class="csh-ai-score-bar"><span class="csh-ai-score-label">Suggested rewrites — click any to copy</span></div>';
    html += '<div class="csh-ai-body">';
    rewrites.forEach(function(rw) {
      html += '<div style="margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid var(--faint)">';
      html += '<div style="font-family:DM Mono,monospace;font-size:7px;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);margin-bottom:8px">' + esc(rw.field) + '</div>';
      (rw.suggestions || []).forEach(function(s, i) {
        html += '<div class="brand-reword-option" onclick="brandCopyReword(this)" title="Click to copy" style="cursor:pointer;background:var(--surface2);border:1px solid var(--border);border-radius:3px;padding:10px 12px;margin-bottom:6px;font-family:Cormorant Garamond,serif;font-size:15px;line-height:1.6;color:var(--text);transition:border-color 0.13s">' +
          esc(s) +
        '</div>';
      });
      html += '</div>';
    });
    html += '</div>';
    html += '<button class="csh-ai-dismiss" onclick="cshDismiss(this)">Dismiss ✕</button>';
    html += '</div>';
    panelEl.innerHTML = html;
    btn.disabled = false; btn.textContent = '✦ Rewrite again';
  } catch(err) {
    panelEl.innerHTML = '<div class="csh-ai-body"><p class="csh-ai-warn">Error: ' + (err.message||'unknown') + '</p><button class="csh-ai-dismiss" onclick="cshDismiss(this)">Dismiss ✕</button></div>';
    btn.disabled = false; btn.textContent = '✦ Try again';
  }
}

function brandCopyReword(el) {
  navigator.clipboard.writeText(el.textContent).catch(function(){});
  el.style.borderColor = '#a8c4d4';
  el.style.color = '#a8c4d4';
  setTimeout(function(){ el.style.borderColor = 'var(--border)'; el.style.color = 'var(--text)'; }, 1200);
  showToast('Copied ✓');
}

function openDocExportBrand(type) {
  var d = getBPData();
  var isVis = type === 'visual-identity';
  var title = isVis ? 'Visual Identity — The Front' : 'Brand Identity — The Front';

  var html = '<!DOCTYPE html><html><head><meta charset=UTF-8><title>' + title + '</title><style>' +
    'body{font-family:Georgia,serif;max-width:680px;margin:40px auto;padding:0 24px;color:#1a1a18;line-height:1.6}' +
    'h1{font-size:28px;font-weight:400;margin-bottom:4px}' +
    '.meta{font-size:11px;color:#888;font-family:monospace;margin-bottom:36px}' +
    'h2{font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#999;font-family:monospace;margin:32px 0 16px;padding-bottom:6px;border-bottom:1px solid #eee}' +
    '.qa{margin-bottom:20px}.q{font-size:11px;font-family:monospace;color:#888;margin-bottom:6px;letter-spacing:0.06em}' +
    '.a{font-size:15px;color:#1a1a18}.empty{font-size:13px;color:#ccc;font-style:italic}' +
    '</style></head><body>';

  html += '<h1>' + title + '</h1>';
  html += '<div class="meta">The Front · Exported ' + new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}) + '</div>';

  function qa(label, key) {
    var val = d[key] || '';
    return '<div class="qa"><div class="q">' + label + '</div>' +
      (val ? '<div class="a">' + val.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>') + '</div>'
           : '<div class="empty">Not yet filled in.</div>') + '</div>';
  }
  function sec(title, content) {
    return '<h2>' + title + '</h2>' + content;
  }

  if (!isVis) {
    html += sec('The Concept',
      qa('In one sentence, what is The Front?','brand-one-sentence') +
      qa('What problem does it solve — and for who?','brand-problem') +
      qa('What is The Front NOT?','brand-not')
    );
    html += sec('The Audience',
      qa('The designer / vendor','brand-audience-designer') +
      qa('The customer','brand-audience-customer')
    );
    html += sec('The Position',
      qa('3 words that define The Front','brand-three-words') +
      qa('Competitive awareness','brand-competitive') +
      qa('What success looks like in 2 years','brand-success')
    );
    html += sec('Business Model',
      qa('Revenue streams','brand-revenue-streams') +
      qa('How vendors are selected','brand-vendor-selection')
    );
  } else {
    html += sec('References & Direction',
      qa('Visual references','vis-references') +
      qa('The feeling','vis-feeling')
    );
    html += sec('Color', qa('Color notes','vis-color-notes'));
    html += sec('Typography',
      qa('Display typeface','vis-font-display') +
      qa('Body typeface','vis-font-body') +
      qa('Type rules','vis-type-notes')
    );
    html += sec('Applications',
      qa('Signage','vis-signage') +
      qa('Packaging','vis-packaging') +
      qa('Digital','vis-digital') +
      qa('What to avoid','vis-avoid')
    );
  }

  html += '</body></html>';
  var blob = new Blob([html], {type:'text/html'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (isVis ? 'visual-identity' : 'brand-identity') + '-the-front.html';
  a.click();
}


// ═══ BRAND IDENTITY DEFAULT ANSWERS ═════════════════════════════
function seedBrandDefaults() {
  var d = getBPData();
  var defaults = {
    'brand-one-sentence': "The Front is a living curatorial space that treats retail as an experimental format driven by concept — for showcasing work, exploring visual craft, and building creative community.",
    'brand-problem': "Most spaces that sell things have already decided what they are. The Front hasn't — and that's the point. For designers: a context that holds work seriously without the institutional distance of a gallery or the flattening effect of a market. For customers: something that rewards attention. You don't browse The Front the way you browse a store. You read it.",
    'brand-not': "Not a boutique with a rotating stock. Not a gallery with a price list. Not a pop-up market with better branding. Not a community space that happens to sell things. The retail is the experiment — not the point.",
    'brand-audience-designer': "Designers and makers whose work exists at the edge of a category — fashion that thinks like sculpture, objects that behave like proposals, jewelry that has a position. Based in downtown Manhattan. Likely Parsons-connected or adjacent. Serious about their practice, not yet fully legible to the commercial world.",
    'brand-audience-customer': "People who come downtown with intention. Design-literate, culturally engaged, skeptical of trend. They buy slowly and specifically. They want to know what something is before they decide whether to own it. The kind of person who reads the wall text.",
    'brand-three-words': "Curatorial. Alive. Conceptual.",
    'brand-competitive': "The gallery: takes the work seriously but keeps it behind glass. The boutique: makes work accessible but strips it of context. The pop-up market: gives visibility but no point of view. The Front refuses all three and borrows selectively from each — the seriousness of a gallery, the accessibility of a shop, the energy of something temporary even when it isn't.",
    'brand-success': "A space that designers want to be invited into — not applied to. A room that changes often enough that people come back to see what's different. A model that proves concept-driven retail is viable, not just interesting. In two years: a known address, a recognizable curatorial voice, and programming that the community treats as part of their calendar.",
    'brand-revenue-streams': "Consignment and vendor commission — primary. Participation fees for the run. Event and programming revenue. In-house editorial objects: zines, prints, limited editions that belong to The Front specifically. Longer term: workshops, residencies, brand collaborations that fit the curation.",
    'brand-vendor-selection': "Curatorial, not transactional. The question is always: does this work belong in the same room as everything else here? Invitation and open application, both. Rotating — no permanent fixtures. The churn is the point."
  };
  Object.keys(defaults).forEach(function(k) {
    if (!d[k] || !d[k].trim()) {
      d[k] = defaults[k];
    }
  });
  localStorage.setItem('bp_data_v1', JSON.stringify(d));
}

// ═══ BRAND / VISUAL IDENTITY ═════════════════════════════════════

// Color swatches
function getVisSwatches(type) {
  try { return JSON.parse(localStorage.getItem('vis_swatches_'+type+'_v1') || 'null'); } catch(e) { return null; }
}
function saveVisSwatches(type, d) { localStorage.setItem('vis_swatches_'+type+'_v1', JSON.stringify(d)); }
function initVisSwatches(type) {
  var d = getVisSwatches(type);
  if (d) return d;
  var defaults = type === 'primary'
    ? [{ hex: '#f5f2ed', name: 'Off-white' }, { hex: '#1a1a18', name: 'Near-black' }, { hex: '#c8bfb0', name: 'Stone' }]
    : [{ hex: '#a8c4d4', name: 'Fog blue' }];
  saveVisSwatches(type, defaults);
  return defaults;
}

function visRenderSwatches(type) {
  var swatches = initVisSwatches(type);
  var el = document.getElementById('vis-'+type+'-swatches');
  if (!el) return;
  el.innerHTML = swatches.map(function(sw, i) {
    return '<div class="vis-swatch">' +
      '<input type="color" class="vis-swatch-dot" value="'+sw.hex+'" data-type="'+type+'" data-idx="'+i+'" data-field="hex" oninput="visUpdateSwatch(this)" style="background:'+sw.hex+'">' +
      '<input class="vis-swatch-hex" value="'+sw.hex+'" data-type="'+type+'" data-idx="'+i+'" data-field="hex" oninput="visUpdateSwatch(this)" maxlength="7">' +
      '<input class="vis-swatch-name" value="'+esc(sw.name||'')+'" placeholder="Name…" data-type="'+type+'" data-idx="'+i+'" data-field="name" oninput="visUpdateSwatch(this)">' +
      '<button class="vis-swatch-del" data-type="'+type+'" data-idx="'+i+'" onclick="visDeleteSwatch(this.dataset.type,+this.dataset.idx)">✕</button>' +
    '</div>';
  }).join('');
}

function visUpdateSwatch(el) {
  var type=el.dataset.type, idx=+el.dataset.idx, field=el.dataset.field;
  var swatches=initVisSwatches(type);
  if(swatches[idx]) {
    swatches[idx][field] = el.value;
    saveVisSwatches(type, swatches);
    // Update the color dot if hex changed
    if(field==='hex') {
      var row = el.closest('.vis-swatch');
      var dot = row && row.querySelector('input[type=color]');
      var hexInput = row && row.querySelector('.vis-swatch-hex');
      if(dot) dot.style.background = el.value;
      if(hexInput && field==='hex') hexInput.value = el.value;
    }
  }
}
function visDeleteSwatch(type, idx) {
  var swatches=initVisSwatches(type);
  swatches.splice(idx, 1);
  saveVisSwatches(type, swatches);
  visRenderSwatches(type);
}
function visAddSwatch(type) {
  var swatches=initVisSwatches(type);
  swatches.push({ hex:'#888888', name:'' });
  saveVisSwatches(type, swatches);
  visRenderSwatches(type);
}

// Visual identity links (reuse vi-links pattern)
function getVisLinks() {
  try { return JSON.parse(localStorage.getItem('vis_links_v1') || '[]'); } catch(e){ return []; }
}
function saveVisLinks(d) { localStorage.setItem('vis_links_v1', JSON.stringify(d)); }
function visRenderLinks() {
  var links = getVisLinks();
  var el = document.getElementById('vis-links-list');
  if (!el) return;
  el.innerHTML = links.map(function(lk, i) {
    return '<div class="vi-link-row">' +
      '<input class="vi-link-label" value="'+esc(lk.label||'')+'" placeholder="Label" data-idx="'+i+'" data-field="label" oninput="visUpdateLink(this)">' +
      '<input class="vi-link-url" value="'+esc(lk.url||'')+'" placeholder="https://…" data-idx="'+i+'" data-field="url" oninput="visUpdateLink(this)">' +
      (lk.url ? '<a class="vi-link-open" href="'+esc(lk.url)+'" target="_blank">↗</a>' : '') +
      '<button class="vi-row-del" data-idx="'+i+'" onclick="visDeleteLink(+this.dataset.idx)">✕</button>' +
    '</div>';
  }).join('');
}
function visUpdateLink(el) {
  var links=getVisLinks(); var idx=+el.dataset.idx; var field=el.dataset.field;
  if(links[idx]) { links[idx][field]=el.value; saveVisLinks(links); }
  if(field==='url') visRenderLinks();
}
function visDeleteLink(idx) {
  var links=getVisLinks(); links.splice(idx,1); saveVisLinks(links); visRenderLinks();
}
function visAddLink() {
  var links=getVisLinks(); links.push({label:'',url:''}); saveVisLinks(links); visRenderLinks();
}

function initBrandTabs() {
  seedBrandDefaults();
  visRenderSwatches('primary');
  visRenderSwatches('accent');
  visRenderLinks();
  loadBPData();
}

// ═══ RESOURCES / PROCUREMENT ═════════════════════════════════════
var RES_CATS = ['space','signage','marketing','fixtures','packaging','tech','staffing','operations','other'];
var RES_STATUSES = ['needed','sourcing','ordered','received'];
var RES_STATUS_COLORS = { needed:'#e07070', sourcing:'#e2c97e', ordered:'#a8c4d4', received:'#88c98a' };
var resActiveFilter = 'all';

function getResItems() {
  try { return JSON.parse(localStorage.getItem('res_items_v1') || 'null'); } catch(e) { return null; }
}
function saveResItems(d) { localStorage.setItem('res_items_v1', JSON.stringify(d)); }

function resDefaultItems() {
  return [
    { id:'r1',  name:'Exterior signage',             cat:'signage',   status:'needed',   cost:200,  source:'Print shop / Wrapify / Etsy vinyl',   who:'',          deadline:'',  notes:'Vinyl lettering on window, condensed serif font, simple wordmark only' },
    { id:'r2',  name:'Interior price cards',          cat:'signage',   status:'needed',   cost:30,   source:'Print at home or local print shop',    who:'',          deadline:'',  notes:'Small folded card behind each piece — name, price, material, vendor' },
    { id:'r3',  name:'Garment racks (×2)',            cat:'fixtures',  status:'needed',   cost:0,    source:'Owned — bring from studio',            who:'',          deadline:'',  notes:'Already own these' },
    { id:'r4',  name:'Floating shelves / pedestals',  cat:'fixtures',  status:'needed',   cost:150,  source:'Build or source raw wood',             who:'',          deadline:'',  notes:'3–4 units at varying heights for objects + accessories' },
    { id:'r5',  name:'Checkout desk',                 cat:'fixtures',  status:'needed',   cost:0,    source:'Owned or borrow',                      who:'',          deadline:'',  notes:'Small table works fine, keep it minimal' },
    { id:'r6',  name:'Opening flyers (print run)',    cat:'marketing', status:'needed',   cost:80,   source:'Canva → Mixam or local printer',       who:'',          deadline:'',  notes:'200–300 flyers, postcard size, for LES/SoHo/Nolita drops' },
    { id:'r7',  name:'Launch social graphics',        cat:'marketing', status:'needed',   cost:0,    source:'Canva / Figma — make in-house',        who:'',          deadline:'',  notes:'Save-the-date, vendor spotlights, countdown assets' },
    { id:'r8',  name:'Press release',                 cat:'marketing', status:'needed',   cost:0,    source:'Write in-house',                       who:'',          deadline:'',  notes:'200-word pitch + image for Hint, Time Out, local blogs' },
    { id:'r9',  name:'Square POS reader',             cat:'tech',      status:'needed',   cost:0,    source:'Square.com — free reader',             who:'',          deadline:'',  notes:'Plus a stand if using iPad' },
    { id:'r10', name:'iPad / phone for checkout',     cat:'tech',      status:'needed',   cost:0,    source:'Use own device',                       who:'',          deadline:'',  notes:'' },
    { id:'r11', name:'Tissue paper + bags',           cat:'packaging', status:'needed',   cost:50,   source:'Uline, Paper Mart, or local wholesale', who:'',         deadline:'',  notes:'Branded stamp on plain kraft bags is low-cost and clean' },
    { id:'r12', name:'Hang tags / maker cards',       cat:'packaging', status:'needed',   cost:40,   source:'Print at home or Moo.com',             who:'',          deadline:'',  notes:'Per-vendor cards with their handle + brief bio' },
    { id:'r13', name:'Insurance (event/space)',        cat:'space',     status:'needed',   cost:120,  source:'Next Insurance or landlord rider',     who:'',          deadline:'',  notes:'Confirm if 334 Broome requires liability coverage' },
    { id:'r14', name:'Cleaning supplies',             cat:'space',     status:'needed',   cost:30,   source:'Hardware store',                       who:'',          deadline:'',  notes:'Pre-install clean, weekly sweep during run' },
    { id:'r15', name:'Extension cords / power strips', cat:'space',    status:'needed',   cost:25,   source:'Hardware store or owned',              who:'',          deadline:'',  notes:'For lighting, iPad charger, any event AV' },
    { id:'r16', name:'Opening night drinks / snacks', cat:'other',     status:'needed',   cost:150,  source:'Trader Joe\'s / Costco / donated',     who:'',          deadline:'',  notes:'Wine + sparkling water + simple snacks for 40–60 people' },
    { id:'r17', name:'Photographer — opening night',  cat:'staffing',  status:'needed',   cost:0,    source:'Friend or trade with vendor',          who:'',          deadline:'',  notes:'Need someone dedicated to shooting the space and crowd' },
  ];
}

function initResItems() {
  var d = getResItems();
  if (!d) { d = resDefaultItems(); saveResItems(d); }
  return d;
}

function resFilter(cat, btn) {
  resActiveFilter = cat;
  document.querySelectorAll('.res-filter-pill').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  resRender();
}

function resRender() {
  // Remember which cards are open before re-render
  var openIds = [];
  document.querySelectorAll('.res-item.open').forEach(function(el){ openIds.push(el.id.replace('res-item-','')); });
  var items = initResItems();
  var filtered = resActiveFilter === 'all' ? items : items.filter(function(i){ return i.cat === resActiveFilter; });

  // Summary always uses all items
  var totalCost = items.reduce(function(s,i){ return s + (parseFloat(i.cost)||0); }, 0);
  var doneCount = items.filter(function(i){ return i.status === 'received'; }).length;
  var pendingCount = items.length - doneCount;
  var set = function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
  set('res-total', items.length);
  set('res-done', doneCount);
  set('res-pending', pendingCount);
  set('res-cost', '$' + totalCost.toFixed(0));

  var el = document.getElementById('res-item-list');
  if (!el) return;

  var catOpts = RES_CATS.map(function(c){ return '<option value="'+c+'">'+c+'</option>'; }).join('');
  var statOpts = RES_STATUSES.map(function(s){ return '<option value="'+s+'">'+s+'</option>'; }).join('');

  var grouped = {};
  RES_CATS.forEach(function(c){ grouped[c] = []; });
  filtered.forEach(function(item){ if(grouped[item.cat]) grouped[item.cat].push(item); });

  var html = '';
  RES_CATS.forEach(function(cat) {
    var catItems = grouped[cat];
    if (!catItems || !catItems.length) return;
    html += '<div class="res-group-label" style="font-family:DM Mono,monospace;font-size:7px;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);padding:10px 0 5px;border-bottom:1px solid var(--faint);margin-bottom:6px">' + cat + '</div>';
    catItems.forEach(function(item) {
      var isDone = item.status === 'received';
      var statColor = RES_STATUS_COLORS[item.status] || 'var(--muted)';
      var cOpts = RES_CATS.map(function(c){ return '<option value="'+c+'"'+(item.cat===c?' selected':'')+'>'+c+'</option>'; }).join('');
      var sOpts = RES_STATUSES.map(function(s){ return '<option value="'+s+'"'+(item.status===s?' selected':'')+'>'+s+'</option>'; }).join('');

      html += '<div class="res-item'+(isDone?' done':'')+'" id="res-item-'+item.id+'">' +
        '<div class="res-item-top" data-resid="'+item.id+'" onclick="resToggle(this.dataset.resid)">' +
          '<div class="res-check'+(isDone?' done':'')+'" data-resid="'+item.id+'" onclick="resCheckToggle(event,this.dataset.resid)"></div>' +
          '<div class="res-item-name'+(isDone?' done':'')+'">'+esc(item.name||'Unnamed')+'</div>' +
          '<div class="res-cat-badge">'+esc(item.cat)+'</div>' +
          '<div class="res-cost-badge">'+(item.cost>0?'$'+item.cost:'free')+'</div>' +
          '<span class="res-chevron" style="color:'+statColor+'">›</span>' +
        '</div>' +
        '<div class="res-item-body">' +
          '<div class="res-body-grid">' +
            '<div class="res-field"><div class="res-field-label">Item name</div><input class="res-input" value="'+esc(item.name||'')+'" placeholder="What do you need?" data-resid="'+item.id+'" data-field="name" oninput="resUpdate(this)"></div>' +
            '<div class="res-field"><div class="res-field-label">Category</div><select class="res-select" data-resid="'+item.id+'" data-field="cat" onchange="resUpdate(this)">'+cOpts+'</select></div>' +
            '<div class="res-field"><div class="res-field-label">Status</div><select class="res-status-sel" data-resid="'+item.id+'" data-field="status" onchange="resUpdate(this)" style="border-color:'+statColor+'22;color:'+statColor+'">'+sOpts+'</select></div>' +
            '<div class="res-field"><div class="res-field-label">Est. cost ($)</div><input class="res-input" type="number" min="0" value="'+(item.cost||'')+'" placeholder="0" data-resid="'+item.id+'" data-field="cost" oninput="resUpdate(this)"></div>' +
            '<div class="res-field"><div class="res-field-label">Where to get it</div><input class="res-input" value="'+esc(item.source||'')+'" placeholder="Vendor, store, make it…" data-resid="'+item.id+'" data-field="source" oninput="resUpdate(this)"></div>' +
            '<div class="res-field"><div class="res-field-label">Who\'s responsible</div><input class="res-input" value="'+esc(item.who||'')+'" placeholder="Your name, volunteer, vendor…" data-resid="'+item.id+'" data-field="who" oninput="resUpdate(this)"></div>' +
            '<div class="res-field"><div class="res-field-label">Deadline / needed by</div><input class="res-input" type="date" value="'+esc(item.deadline||'')+'" data-resid="'+item.id+'" data-field="deadline" onchange="resUpdate(this)"></div>' +
            '<div class="res-field res-full"><div class="res-field-label">Notes</div><textarea class="res-notes-input" rows="2" placeholder="Details, constraints, alternatives…" data-resid="'+item.id+'" data-field="notes" oninput="resUpdate(this)">'+esc(item.notes||'')+'</textarea></div>' +
          '</div>' +
          '<button class="res-delete-btn" data-resid="'+item.id+'" onclick="resDelete(event,this.dataset.resid)">Delete item</button>' +
        '</div>' +
      '</div>';
    });
  });

  if (!html) html = '<div style="color:var(--muted);font-family:DM Mono,monospace;font-size:9px;padding:20px 0;text-align:center">No items in this category.</div>';
  el.innerHTML = html;
  // Restore open state
  openIds.forEach(function(id){ var card=document.getElementById('res-item-'+id); if(card) card.classList.add('open'); });
}

function resToggle(id) {
  var el = document.getElementById('res-item-'+id);
  if (el) el.classList.toggle('open');
}
function resCheckToggle(e, id) {
  e.stopPropagation();
  var items = initResItems();
  var item = items.find(function(i){ return i.id===id; });
  if (!item) return;
  item.status = item.status === 'received' ? 'needed' : 'received';
  saveResItems(items);
  // Update in place — don't re-render
  var cardEl = document.getElementById('res-item-'+id);
  if (cardEl) {
    var isDone = item.status === 'received';
    cardEl.classList.toggle('done', isDone);
    var chk = cardEl.querySelector('.res-check');
    if (chk) chk.classList.toggle('done', isDone);
    var nameEl = cardEl.querySelector('.res-item-name');
    if (nameEl) nameEl.classList.toggle('done', isDone);
    var col = RES_STATUS_COLORS[item.status] || 'var(--muted)';
    var chev = cardEl.querySelector('.res-chevron');
    if (chev) chev.style.color = col;
    var sel = cardEl.querySelector('.res-status-sel');
    if (sel) { sel.value = item.status; sel.style.color = col; }
  }
  // Update summary counts
  var totalCost = items.reduce(function(s,i){ return s+(parseFloat(i.cost)||0); }, 0);
  var doneCount = items.filter(function(i){ return i.status==='received'; }).length;
  var set = function(sid,v){ var sel=document.getElementById(sid); if(sel) sel.textContent=v; };
  set('res-total',items.length); set('res-done',doneCount);
  set('res-pending',items.length-doneCount); set('res-cost','$'+totalCost.toFixed(0));
}
function resUpdate(el) {
  var id=el.dataset.resid, field=el.dataset.field, val=field==='cost'?parseFloat(el.value)||0:el.value;
  var items=initResItems();
  var item=items.find(function(i){ return i.id===id; });
  if(item){ item[field]=val; saveResItems(items); }
  // Always just update summary counts — never re-render (would collapse open card)
  var totalCost=items.reduce(function(s,i){return s+(parseFloat(i.cost)||0);},0);
  var doneCount=items.filter(function(i){return i.status==='received';}).length;
  var set=function(sid,v){var sel=document.getElementById(sid);if(sel)sel.textContent=v;};
  set('res-total',items.length); set('res-done',doneCount);
  set('res-pending',items.length-doneCount); set('res-cost','$'+totalCost.toFixed(0));
  // If name changed, update the visible title in-place
  if(field==='name'){
    var nameEl=document.querySelector('#res-item-'+id+' .res-item-name');
    if(nameEl) nameEl.textContent=val||'Unnamed';
  }
  // If status changed, update color + check state in-place
  if(field==='status'){
    var cardEl=document.getElementById('res-item-'+id);
    if(cardEl){
      var isDone=val==='received';
      cardEl.classList.toggle('done',isDone);
      var chk=cardEl.querySelector('.res-check');
      if(chk) chk.classList.toggle('done',isDone);
      var chev=cardEl.querySelector('.res-chevron');
      var col=RES_STATUS_COLORS[val]||'var(--muted)';
      if(chev) chev.style.color=col;
      var sel=cardEl.querySelector('.res-status-sel');
      if(sel) sel.style.borderColor=col+'22'; sel && (sel.style.color=col);
      var catBadge=cardEl.querySelector('.res-cat-badge');
    }
  }
  // If cat changed, update badge in-place
  if(field==='cat'){
    var catBadgeEl=document.querySelector('#res-item-'+id+' .res-cat-badge');
    if(catBadgeEl) catBadgeEl.textContent=val;
  }
}
function resDelete(e, id) {
  e.stopPropagation();
  if (!confirm('Delete this item? This cannot be undone.')) return;
  // Remember open cards except the deleted one
  var openIds = [];
  document.querySelectorAll('.res-item.open').forEach(function(el){
    var elId = el.id.replace('res-item-','');
    if (elId !== id) openIds.push(elId);
  });
  saveResItems(initResItems().filter(function(i){ return i.id!==id; }));
  resRender();
  openIds.forEach(function(oid){ var card=document.getElementById('res-item-'+oid); if(card) card.classList.add('open'); });
}
function resAddItem() {
  var items=initResItems();
  var newItem={ id:'r_'+Date.now(), name:'', cat: resActiveFilter==='all'?'other':resActiveFilter, status:'needed', cost:0, source:'', who:'', deadline:'', notes:'' };
  items.push(newItem);
  saveResItems(items);
  resRender();
  setTimeout(function(){ resToggle(newItem.id); }, 40);
}
function initResources() { resRender(); }


// ═══ EVENTS PROGRAMMING ══════════════════════════════════════════
var EV_TYPES = [
  { id:'opening',   label:'Opening',    color:'#a8c4d4' },
  { id:'workshop',  label:'Workshop',   color:'#e2c97e' },
  { id:'talk',      label:'Artist talk',color:'#88c98a' },
  { id:'closing',   label:'Closing',    color:'#c4a8d4' },
  { id:'popin',     label:'Pop-in',     color:'#d4a8b8' },
  { id:'community', label:'Community',  color:'#f0c888' },
  { id:'other',     label:'Other',      color:'#a8d4bc' },
];

function getEvEvents() {
  try { return JSON.parse(localStorage.getItem('ev_events_v1') || 'null'); } catch(e) { return null; }
}
function saveEvEvents(d) { localStorage.setItem('ev_events_v1', JSON.stringify(d)); }

function evDefaultEvents() {
  return [
    { id:'ev1', title:'Opening Night', type:'opening', date:'', time:'6–9pm', location:'334 Broome St', capacity:'', rsvp:false, collaborator:'', notes:'Launch the space. Invite vendors, press, personal network. Wine, music, brief remarks from curator.' },
    { id:'ev2', title:'Vendor Spotlight — Open Studio', type:'talk', date:'', time:'4–7pm', location:'334 Broome St', capacity:'20', rsvp:false, collaborator:'', notes:'One vendor hosts a brief studio session — showing their process, taking questions. Rotates each week.' },
    { id:'ev3', title:'Workshop: Natural Dyeing', type:'workshop', date:'', time:'2–5pm', location:'334 Broome St', capacity:'12', rsvp:true, collaborator:'', notes:'Hands-on session. Charge a small material fee. Ties to the textile/fashion focus of the space.' },
    { id:'ev4', title:'Community Mending Circle', type:'community', date:'', time:'3–6pm', location:'334 Broome St', capacity:'', rsvp:false, collaborator:'', notes:'Bring your damaged clothes. Communal repair session — needles, thread, conversation. Free.' },
    { id:'ev5', title:'Closing Celebration', type:'closing', date:'', time:'6–9pm', location:'334 Broome St', capacity:'', rsvp:false, collaborator:'', notes:'Final night. Reflect on the run, celebrate vendors. Document everything.' },
  ];
}

function initEvEvents() {
  var d = getEvEvents();
  if (!d) { d = evDefaultEvents(); saveEvEvents(d); }
  return d;
}

function evTypeColor(typeId) {
  return (EV_TYPES.find(function(t){ return t.id===typeId; })||{}).color || '#888';
}
function evTypeLabel(typeId) {
  return (EV_TYPES.find(function(t){ return t.id===typeId; })||{}).label || typeId;
}

function evRenderList() {
  var events = initEvEvents();
  var el = document.getElementById('ev-event-list');
  if (!el) return;
  if (!events.length) { el.innerHTML = '<div style="color:var(--muted);font-family:DM Mono,monospace;font-size:9px;padding:16px 0">No events yet — click + Add event.</div>'; return; }

  var typeOpts = EV_TYPES.map(function(t){ return '<option value="'+t.id+'">'+t.label+'</option>'; }).join('');

  el.innerHTML = events.map(function(ev) {
    var col = evTypeColor(ev.type);
    var tOpts = EV_TYPES.map(function(t){ return '<option value="'+t.id+'"'+(ev.type===t.id?' selected':'')+'>'+t.label+'</option>'; }).join('');
    return '<div class="ev-card" id="ev-card-'+ev.id+'">' +
      '<div class="ev-card-top" data-evid="'+ev.id+'" onclick="evToggleCard(this.dataset.evid)">' +
        '<div class="ev-card-color" style="background:'+col+'"></div>' +
        '<div class="ev-card-main">' +
          '<div class="ev-card-title">'+(ev.title||'Untitled event')+'</div>' +
          '<div class="ev-card-meta">' +
            (ev.date ? '<span>'+esc(ev.date)+'</span>' : '') +
            (ev.time ? '<span>'+esc(ev.time)+'</span>' : '') +
            (ev.location ? '<span>'+esc(ev.location)+'</span>' : '') +
          '</div>' +
        '</div>' +
        '<span class="ev-card-type" style="background:'+col+'22;color:'+col+';border-color:'+col+'44">'+evTypeLabel(ev.type)+'</span>' +
        '<span class="ev-card-chevron">›</span>' +
        '<button class="ev-card-del" data-evid="'+ev.id+'" onclick="evDeleteEvent(this.dataset.evid,event)">✕</button>' +
      '</div>' +
      '<div class="ev-card-body">' +
        '<div class="ev-body-grid">' +
          '<div class="ev-field"><div class="ev-field-label">Event name</div><input class="ev-input" value="'+esc(ev.title||'')+'" placeholder="Opening Night…" data-evid="'+ev.id+'" data-field="title" onchange="evUpdate(this)"></div>' +
          '<div class="ev-field"><div class="ev-field-label">Type</div><select class="ev-select" data-evid="'+ev.id+'" data-field="type" onchange="evUpdate(this)">'+tOpts+'</select></div>' +
          '<div class="ev-field"><div class="ev-field-label">Date</div><input class="ev-input" type="date" value="'+esc(ev.date||'')+'" data-evid="'+ev.id+'" data-field="date" onchange="evUpdate(this)"></div>' +
          '<div class="ev-field"><div class="ev-field-label">Time</div><input class="ev-input" value="'+esc(ev.time||'')+'" placeholder="6–9pm" data-evid="'+ev.id+'" data-field="time" onchange="evUpdate(this)"></div>' +
          '<div class="ev-field"><div class="ev-field-label">Location</div><input class="ev-input" value="'+esc(ev.location||'')+'" placeholder="334 Broome St" data-evid="'+ev.id+'" data-field="location" onchange="evUpdate(this)"></div>' +
          '<div class="ev-field"><div class="ev-field-label">Capacity</div><input class="ev-input" value="'+esc(ev.capacity||'')+'" placeholder="Open / 20 max…" data-evid="'+ev.id+'" data-field="capacity" onchange="evUpdate(this)"></div>' +
          '<div class="ev-field"><div class="ev-field-label">Collaborator / host</div><input class="ev-input" value="'+esc(ev.collaborator||'')+'" placeholder="Vendor name, guest artist…" data-evid="'+ev.id+'" data-field="collaborator" onchange="evUpdate(this)"></div>' +
          '<div class="ev-field ev-full-row"><div class="ev-field-label">Notes / description</div><textarea class="ev-notes" rows="2" placeholder="What happens, how to prep, what to bring…" data-evid="'+ev.id+'" data-field="notes" oninput="evUpdate(this)">'+esc(ev.notes||'')+'</textarea></div>' +
          '<div class="ev-field"><label class="ev-rsvp-tag"><input type="checkbox" '+(ev.rsvp?'checked':'')+' data-evid="'+ev.id+'" data-field="rsvp" onchange="evUpdate(this)"> RSVP required</label></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
  loadBPData();
}

function evToggleCard(id) {
  var card = document.getElementById('ev-card-'+id);
  if (card) card.classList.toggle('open');
}

function evUpdate(el) {
  var id = el.dataset.evid;
  var field = el.dataset.field;
  var val = el.type === 'checkbox' ? el.checked : el.value;
  var events = initEvEvents();
  var ev = events.find(function(e){ return e.id===id; });
  if (ev) { ev[field] = val; saveEvEvents(events); }
  if (field === 'type' || field === 'title') evRenderList();
}

function evAddEvent() {
  var events = initEvEvents();
  var newEv = { id:'ev_'+Date.now(), title:'', type:'other', date:'', time:'', location:'334 Broome St', capacity:'', rsvp:false, collaborator:'', notes:'' };
  events.push(newEv);
  saveEvEvents(events);
  evRenderList();
  // Auto-open the new card
  setTimeout(function(){ evToggleCard(newEv.id); }, 30);
}

function evDeleteEvent(id, e) {
  if (e) e.stopPropagation();
  saveEvEvents(initEvEvents().filter(function(ev){ return ev.id!==id; }));
  evRenderList();
}

function initEvents() { evRenderList(); }

// ═══ CHASHAMA AI ANALYSIS ════════════════════════════════════════

var CSH_SECTION_CONFIG = {
  vision: {
    label: 'Vision & Business Overview',
    keys: ['csh-mission','csh-formed','csh-bizplan'],
    questions: [
      'Mission Statement: What you envision with your own physical storefront and where you see your business in 5 years',
      'Business formed date',
      'Business plan: model, revenue streams, target customer, competitive landscape'
    ]
  },
  storefront: {
    label: 'Storefront Design & Setup',
    keys: ['csh-design','csh-experience'],
    questions: [
      'How will you design your storefront? Branding, signage, product displays, setup timeline',
      'Prior market / trade show / pop-up experience'
    ]
  },
  community: {
    label: 'Community Outreach',
    keys: ['csh-outreach'],
    questions: [
      'Monthly community outreach proposal (required 1x/month): workshops, events, internships, past experience'
    ]
  },
  products: {
    label: 'Products & Sourcing',
    keys: ['csh-sourcing'],
    questions: [
      'Do you produce the products you sell, or source from other makers? Where are products sourced from?',
      'Product categories and price point range'
    ]
  },
  financials: {
    label: 'Financials',
    keys: ['csh-customers','csh-revenue','csh-records','csh-budget-note','csh-pl-note'],
    questions: [
      'Monthly customer count estimate',
      'Average estimated monthly revenue',
      'How you manage financial records',
      'Budget forecast (opening costs + 6-month operating budget)',
      'Profit & Loss statement'
    ]
  }
};

function cshGetFieldValue(key) {
  var el = document.querySelector('[data-key="' + key + '"]');
  if (!el) return '';
  if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return el.value || '';
  return el.textContent || '';
}

function cshBuildSectionContent(sectionKey) {
  var config = CSH_SECTION_CONFIG[sectionKey];
  if (!config) return '';
  var lines = [];
  config.keys.forEach(function(key, i) {
    var q = config.questions[i] || key;
    var val = cshGetFieldValue(key);
    lines.push('QUESTION: ' + q);
    lines.push('ANSWER: ' + (val.trim() || '(blank — not yet answered)'));
    lines.push('');
  });
  return lines.join('\n');
}

function cshBuildFullContent() {
  var parts = [];
  Object.keys(CSH_SECTION_CONFIG).forEach(function(sectionKey) {
    var config = CSH_SECTION_CONFIG[sectionKey];
    parts.push('=== ' + config.label.toUpperCase() + ' ===');
    parts.push(cshBuildSectionContent(sectionKey));
  });
  return parts.join('\n');
}

function cshScoreColor(score) {
  if (score >= 80) return '#82bfbb';
  if (score >= 55) return '#e2c97e';
  return '#e07070';
}

function cshRenderResult(panelEl, btnEl, data) {
  var score = data.score || 0;
  var col = cshScoreColor(score);
  var strengthsHtml = (data.strengths || []).map(function(s){ return '<li>' + s + '</li>'; }).join('');
  var gapsHtml = (data.gaps || []).map(function(g){ return '<li class="csh-ai-warn">' + g + '</li>'; }).join('');
  var suggestionsHtml = (data.suggestions || []).map(function(s){ return '<li>' + s + '</li>'; }).join('');

  panelEl.innerHTML =
    '<div class="csh-ai-result">' +
      '<div class="csh-ai-score-bar">' +
        '<span class="csh-ai-score-label">Clarity score</span>' +
        '<span class="csh-ai-score-num" style="color:' + col + '">' + score + '/100</span>' +
        '<div class="csh-ai-score-track"><div class="csh-ai-score-fill" style="width:' + score + '%;background:' + col + '"></div></div>' +
      '</div>' +
      '<div class="csh-ai-body">' +
        (data.summary ? '<p style="margin-bottom:12px;color:var(--muted)">' + data.summary + '</p>' : '') +
        (strengthsHtml ? '<h4>✓ What\'s working</h4><ul>' + strengthsHtml + '</ul>' : '') +
        (gapsHtml ? '<h4 style="color:var(--action,#e07070)">⚠ Gaps & unclear areas</h4><ul>' + gapsHtml + '</ul>' : '') +
        (suggestionsHtml ? '<h4 style="color:#82bfbb">→ Suggestions</h4><ul>' + suggestionsHtml + '</ul>' : '') +
      '</div>' +
      '<button class="csh-ai-dismiss" onclick="cshDismiss(this)">Dismiss ✕</button>' +
    '</div>';
  panelEl.style.display = 'block';
  if (btnEl) { btnEl.disabled = false; btnEl.textContent = '✦ Re-analyze'; }
}

function cshDismiss(btn) {
  var panel = btn.closest('.csh-ai-panel');
  if (panel) panel.style.display = 'none';
}

async function cshAnalyze(sectionKey, btn) {
  var panelId = 'csh-ai-' + sectionKey;
  var panelEl = document.getElementById(panelId);
  if (!panelEl) return;

  btn.disabled = true;
  btn.textContent = 'Analyzing…';
  panelEl.style.display = 'block';
  panelEl.innerHTML = '<div class="csh-ai-loading"><div class="csh-ai-dots"><span></span><span></span><span></span></div> Reviewing your answers…</div>';

  var content = sectionKey === 'full' ? cshBuildFullContent() : cshBuildSectionContent(sectionKey);
  var sectionLabel = sectionKey === 'full' ? 'the full ChaShaMa application' : (CSH_SECTION_CONFIG[sectionKey] || {}).label || sectionKey;

  var systemPrompt = 'You are an experienced grant writer and retail program advisor helping a founder apply to ChaShaMa, a NYC storefront program at 21 Greenwich Ave. ' +
    'Your job is to critically review the applicant\'s answers and give honest, specific, actionable feedback. ' +
    'Be direct but constructive. Identify what is compelling, what is vague or missing, and what would strengthen the application. ' +
    'ChaShaMa values: community engagement, creative/independent businesses, clear vision, financial viability, NYC roots. ' +
    'Return ONLY valid JSON with this exact structure (no markdown, no extra text): ' +
    '{"score": <0-100 integer>, "summary": "<1-2 sentence overall read>", "strengths": ["<item>", ...], "gaps": ["<item>", ...], "suggestions": ["<item>", ...]}';

  var userPrompt = 'Review my answers for ' + sectionLabel + ' in the ChaShaMa application:\n\n' + content +
    '\n\nGive me a clarity/strength score (0-100), identify what is working, what is unclear or missing, and give 2-4 concrete suggestions to strengthen each answer. Be specific — call out exact phrases that are vague or strong.';

  try {
    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    var data = await response.json();
    var text = (data.content && data.content[0] && data.content[0].text) || '';

    // Strip any markdown code fences
    text = text.replace(/^```json\s*/,'').replace(/```\s*$/,'').trim();
    var parsed = JSON.parse(text);
    cshRenderResult(panelEl, btn, parsed);

  } catch(err) {
    panelEl.innerHTML = '<div class="csh-ai-body"><p class="csh-ai-warn">Error: ' + (err.message || 'unknown') + '</p>' +
      '<p style="font-family:DM Mono,monospace;font-size:8px;color:var(--muted);margin-top:6px">Check your API key (⚙ AI Key) and that billing is active at console.anthropic.com.</p>' +
      '<button class="csh-ai-dismiss" onclick="cshDismiss(this)">Dismiss ✕</button></div>';
    if (btn) { btn.disabled = false; btn.textContent = '✦ Try again'; }
  }
}


// ═══ CHASHAMA STOREFRONT GENERATOR ══════════════════════════════
async function csfGenerate(btn) {
  var panelEl = document.getElementById('csf-ai-result');
  if (!panelEl) return;
  btn.disabled = true; btn.textContent = 'Generating…';
  panelEl.style.display = 'block';
  panelEl.innerHTML = '<div class="csh-ai-loading"><div class="csh-ai-dots"><span></span><span></span><span></span></div> Writing your storefront answer…</div>';

  var keys = ['csf-aesthetic','csf-flow','csf-displays','csf-signage','csf-branding','csf-checkout','csf-furniture','csf-setup','csf-rotation','csf-experience-stmt'];
  var labels = ['Overall aesthetic','Customer flow','Product displays','Signage','Branding identity','Checkout experience','Furniture & fixtures','Setup timeline','Rotation/changes','Intended customer feeling'];
  var content = keys.map(function(k,i){
    var el = document.querySelector('[data-key="'+k+'"]');
    var val = el ? (el.value||el.textContent||'').trim() : '';
    return labels[i]+': '+(val||'(not answered)');
  }).join('\n');

  var system = 'You are a skilled grant writer helping a founder apply to ChaShaMa, a NYC retail storefront program. Write a polished, specific, compelling answer to the question "How will you design your storefront?" using the notes provided. The answer should be 200-300 words, written in first person, specific about materials/layout/experience, and feel like it comes from someone who has thought this through carefully. Do not be generic. Return only the answer text — no preamble, no headers.';
  var user = 'Here are my notes on the storefront design:\n\n'+content+'\n\nWrite my answer to: "How will you design your storefront? Describe branding, signage, product displays — what will be inside, how long will setup take, etc."';

  try {
    var res = await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:system,messages:[{role:'user',content:user}]})});
    var data = await res.json();
    var text = (data.content&&data.content[0]&&data.content[0].text)||'';
    panelEl.innerHTML =
      '<div class="csh-ai-result">' +
        '<div class="csh-ai-score-bar" style="justify-content:space-between">' +
          '<span class="csh-ai-score-label">Generated answer — copy to Proposal tab</span>' +
          '<button class="csh-ai-dismiss" style="border:none;padding:0" onclick="csfCopyAnswer()">Copy ✦</button>' +
        '</div>' +
        '<div class="csh-ai-body"><p id="csf-generated-text" style="white-space:pre-wrap;line-height:1.75;color:var(--text)">'+escHtml(text)+'</p></div>' +
        '<button class="csh-ai-dismiss" onclick="cshDismiss(this)">Dismiss ✕</button>' +
      '</div>';
    btn.disabled = false; btn.textContent = '✦ Regenerate';
  } catch(err) {
    panelEl.innerHTML = '<div class="csh-ai-body"><p class="csh-ai-warn">Error: '+(err.message||'unknown')+'</p><button class="csh-ai-dismiss" onclick="cshDismiss(this)">Dismiss ✕</button></div>';
    btn.disabled = false; btn.textContent = '✦ Try again';
  }
}

function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function csfCopyAnswer() {
  var el = document.getElementById('csf-generated-text');
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).catch(function(){});
  var el2 = document.querySelector('[data-key="csh-design"]');
  if (el2) el2.value = el.textContent;
  showToast('Copied to clipboard + pasted into Proposal tab ✓');
}

// ═══ CHASHAMA BUDGET ════════════════════════════════════════════
var CSHB_OPEN_CATS = ['Fixtures','Signage','Inventory','Equipment','Marketing','Build-out','Legal/Admin','Deposits','Other'];
var CSHB_MON_CATS  = ['Rent/Fees','Utilities','Payroll','Marketing','Supplies','Inventory','Insurance','Software','Other'];

function getCshbData(type) {
  try { return JSON.parse(localStorage.getItem('cshb_'+type+'_v1')||'null'); } catch(e){return null;}
}
function saveCshbData(type,d){ localStorage.setItem('cshb_'+type+'_v1',JSON.stringify(d)); }

function cshbDefaultRows(type) {
  if(type==='open') return [
    {id:'o1',item:'Fixtures & shelving',cat:'Fixtures',cost:800,notes:'Build + source'},
    {id:'o2',item:'Signage (exterior + interior)',cat:'Signage',cost:300,notes:'Vinyl + printed cards'},
    {id:'o3',item:'Opening inventory (consignment deposit)',cat:'Inventory',cost:500,notes:''},
    {id:'o4',item:'Marketing (launch campaign)',cat:'Marketing',cost:200,notes:'Print + digital'},
    {id:'o5',item:'POS + equipment',cat:'Equipment',cost:150,notes:'Square reader, iPad stand'},
    {id:'o6',item:'Cleaning + minor repairs',cat:'Build-out',cost:100,notes:''},
  ];
  return [
    {id:'m1',item:'ChaShaMa program fee / rent',cat:'Rent/Fees',cost:0,notes:'Confirm with program'},
    {id:'m2',item:'Utilities',cat:'Utilities',cost:80,notes:'Est.'},
    {id:'m3',item:'Marketing (ongoing)',cat:'Marketing',cost:150,notes:'Social, print'},
    {id:'m4',item:'Supplies (bags, tissue, tags)',cat:'Supplies',cost:60,notes:''},
    {id:'m5',item:'Inventory refresh',cat:'Inventory',cost:200,notes:'New vendor onboarding'},
    {id:'m6',item:'Software (POS, accounting)',cat:'Software',cost:30,notes:''},
  ];
}

function initCshbData(type) {
  var d = getCshbData(type);
  if (!d) { d = cshbDefaultRows(type); saveCshbData(type,d); }
  return d;
}

function cshbRender(type) {
  var rows = initCshbData(type);
  var tbodyId = 'cshb-'+type+'-rows';
  var tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  var cats = type==='open' ? CSHB_OPEN_CATS : CSHB_MON_CATS;
  var html = rows.map(function(row){
    var catOpts = cats.map(function(c){ return '<option value="'+c+'"'+(row.cat===c?' selected':'')+'>'+c+'</option>'; }).join('');
    return '<tr id="cshbr-'+row.id+'">' +
      '<td><input class="cshb-input" value="'+esc(row.item||'')+'" placeholder="Item…" data-type="'+type+'" data-id="'+row.id+'" data-field="item" onchange="cshbUpdate(this)"></td>' +
      '<td><select class="cshb-cat-sel" data-type="'+type+'" data-id="'+row.id+'" data-field="cat" onchange="cshbUpdate(this)">'+catOpts+'</select></td>' +
      '<td style="text-align:right"><input class="cshb-num" type="number" min="0" value="'+(row.cost||'')+'" placeholder="0" data-type="'+type+'" data-id="'+row.id+'" data-field="cost" oninput="cshbUpdate(this)"></td>' +
      '<td><input class="cshb-note-input" value="'+esc(row.notes||'')+'" placeholder="Notes…" data-type="'+type+'" data-id="'+row.id+'" data-field="notes" onchange="cshbUpdate(this)"></td>' +
      '<td><button class="vi-row-del" data-type="'+type+'" data-id="'+row.id+'" onclick="cshbDelete(this)">✕</button></td>' +
    '</tr>';
  }).join('');
  var total = rows.reduce(function(s,r){return s+(parseFloat(r.cost)||0);},0);
  html += '<tr class="cshb-total-row"><td colspan="2">Total</td><td style="text-align:right;font-family:DM Mono,monospace;font-size:10px">$'+total.toFixed(0)+'</td><td colspan="2"></td></tr>';
  tbody.innerHTML = html;
  cshbRecalc();
}

function cshbUpdate(el) {
  var type=el.dataset.type, id=el.dataset.id, field=el.dataset.field, val=el.value;
  var rows=initCshbData(type);
  var row=rows.find(function(r){return r.id===id;});
  if(row){row[field]=field==='cost'?parseFloat(val)||0:val; saveCshbData(type,rows);}
  cshbRender(type);
}
function cshbDelete(el) {
  var type=el.dataset.type, id=el.dataset.id;
  var rows=initCshbData(type).filter(function(r){return r.id!==id;});
  saveCshbData(type,rows); cshbRender(type);
}
function cshbAddRow(type) {
  var rows=initCshbData(type);
  rows.push({id:type+'_'+Date.now(),item:'',cat:(type==='open'?CSHB_OPEN_CATS:CSHB_MON_CATS)[0],cost:0,notes:''});
  saveCshbData(type,rows); cshbRender(type);
}
function cshbRecalc() {
  var openRows=initCshbData('open'), monRows=initCshbData('monthly');
  var totalOpen=openRows.reduce(function(s,r){return s+(parseFloat(r.cost)||0);},0);
  var totalMon=monRows.reduce(function(s,r){return s+(parseFloat(r.cost)||0);},0);
  var total6=(totalOpen+totalMon*6);
  var rev=parseFloat((document.getElementById('cshb-revenue-input')||{}).value)||0;
  var set=function(id,v){var el=document.getElementById(id);if(el)el.textContent=v;};
  set('cshb-total-open','$'+totalOpen.toFixed(0));
  set('cshb-total-monthly','$'+totalMon.toFixed(0));
  set('cshb-total-6mo','$'+total6.toFixed(0));
  if(rev>0){
    var mo=1; var cum=-totalOpen;
    while(cum<0&&mo<=60){cum+=rev-totalMon;mo++;}
    set('cshb-breakeven',cum>=0?'Month '+mo:'> 5 yrs');
  } else {
    set('cshb-breakeven','—');
  }
  // Persist revenue
  if(document.getElementById('cshb-revenue-input')) {
    localStorage.setItem('cshb_rev_v1', document.getElementById('cshb-revenue-input').value||'');
  }
}
function initCshBudget() {
  cshbRender('open'); cshbRender('monthly');
  var rev=localStorage.getItem('cshb_rev_v1')||'';
  var ri=document.getElementById('cshb-revenue-input');
  if(ri&&rev) ri.value=rev;
  cshbRecalc(); loadBPData();
}

async function cshbGenerateNarrative(btn) {
  var panelEl=document.getElementById('cshb-ai-result');
  if(!panelEl)return;
  btn.disabled=true; btn.textContent='Generating…';
  panelEl.style.display='block';
  panelEl.innerHTML='<div class="csh-ai-loading"><div class="csh-ai-dots"><span></span><span></span><span></span></div>Writing budget summary…</div>';
  var openRows=initCshbData('open'), monRows=initCshbData('monthly');
  var totalOpen=openRows.reduce(function(s,r){return s+(parseFloat(r.cost)||0);},0);
  var totalMon=monRows.reduce(function(s,r){return s+(parseFloat(r.cost)||0);},0);
  var ri=document.getElementById('cshb-revenue-input');
  var rev=ri?parseFloat(ri.value)||0:0;
  var content='Opening costs total: $'+totalOpen+'\n'
    +'Opening line items:\n'+openRows.map(function(r){return '- '+r.item+' ('+r.cat+'): $'+r.cost+(r.notes?' — '+r.notes:'');}).join('\n')
    +'\n\nMonthly operating: $'+totalMon+'\n'
    +'Monthly line items:\n'+monRows.map(function(r){return '- '+r.item+' ('+r.cat+'): $'+r.cost+(r.notes?' — '+r.notes:'');}).join('\n')
    +'\n\nEstimated monthly revenue: $'+rev;
  var system='You are a grant writer. Write a clear, professional budget narrative (150-200 words) for a ChaShaMa storefront application. Explain the key costs, show financial awareness, and demonstrate viability. First person, confident, specific. No headers, just clean paragraphs.';
  try {
    var res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:600,system:system,messages:[{role:'user',content:'Here are my budget figures:\n\n'+content+'\n\nWrite a budget narrative for my ChaShaMa application.'}]})});
    var data=await res.json();
    var text=(data.content&&data.content[0]&&data.content[0].text)||'';
    panelEl.innerHTML='<div class="csh-ai-result"><div class="csh-ai-score-bar"><span class="csh-ai-score-label">Budget narrative</span><button class="csh-ai-dismiss" style="border:none;padding:0" onclick="navigator.clipboard.writeText(document.getElementById(\'cshb-gen-text\').textContent)">Copy ✦</button></div><div class="csh-ai-body"><p id="cshb-gen-text" style="white-space:pre-wrap;line-height:1.75;color:var(--text)">'+escHtml(text)+'</p></div><button class="csh-ai-dismiss" onclick="cshDismiss(this)">Dismiss ✕</button></div>';
    btn.disabled=false; btn.textContent='✦ Regenerate';
  } catch(err) {
    panelEl.innerHTML='<div class="csh-ai-body"><p class="csh-ai-warn">Error: '+(err.message||'unknown')+'</p><button class="csh-ai-dismiss" onclick="cshDismiss(this)">Dismiss ✕</button></div>';
    btn.disabled=false; btn.textContent='✦ Try again';
  }
}

// ═══ CHASHAMA P&L ════════════════════════════════════════════════
var CSHPL_OFFSET = 0;

function cshplMonthKey(offset) {
  var d=new Date(); d.setDate(1); d.setMonth(d.getMonth()+offset);
  return d.getFullYear()+'-'+(d.getMonth()+1);
}
function cshplMonthLabel(offset) {
  var d=new Date(); d.setDate(1); d.setMonth(d.getMonth()+offset);
  var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
  return MONTHS[d.getMonth()]+' '+d.getFullYear();
}
function getCshplData(key){try{return JSON.parse(localStorage.getItem('cshpl_'+key)||'null');}catch(e){return null;}}
function saveCshplData(key,d){localStorage.setItem('cshpl_'+key,JSON.stringify(d));}

function cshplDefaultRows(type, mk) {
  if(type==='rev') return [
    {id:mk+'r1',label:'Product sales (vendor commission)',amt:0},
    {id:mk+'r2',label:'Direct sales (in-house product)',amt:0},
    {id:mk+'r3',label:'Event / workshop income',amt:0},
  ];
  return [
    {id:mk+'e1',label:'Rent / program fee',amt:0},
    {id:mk+'e2',label:'Supplies & packaging',amt:0},
    {id:mk+'e3',label:'Marketing',amt:0},
    {id:mk+'e4',label:'Utilities',amt:0},
    {id:mk+'e5',label:'Other',amt:0},
  ];
}
function initCshplRows(type) {
  var mk=cshplMonthKey(CSHPL_OFFSET);
  var d=getCshplData(mk+'_'+type);
  if(!d){d=cshplDefaultRows(type,mk);saveCshplData(mk+'_'+type,d);}
  return d;
}

function cshplRender() {
  var mk=cshplMonthKey(CSHPL_OFFSET);
  var lbl=document.getElementById('cshpl-month-label');
  if(lbl) lbl.textContent=cshplMonthLabel(CSHPL_OFFSET);
  ['rev','exp'].forEach(function(type){
    var rows=initCshplRows(type);
    var containerId='cshpl-'+type+'-rows';
    var el=document.getElementById(containerId);
    if(!el)return;
    el.innerHTML=rows.map(function(row){
      return '<div class="cshpl-row" id="cshplr-'+row.id+'">'+
        '<input class="cshpl-row-label" value="'+esc(row.label||'')+'" placeholder="Line item…" data-mk="'+mk+'" data-type="'+type+'" data-id="'+row.id+'" data-field="label" onchange="cshplUpdate(this)">'+
        '<span style="font-family:DM Mono,monospace;font-size:9px;color:var(--muted)">$</span>'+
        '<input class="cshpl-row-amt" type="number" min="0" value="'+(row.amt||'')+'" placeholder="0" data-mk="'+mk+'" data-type="'+type+'" data-id="'+row.id+'" data-field="amt" oninput="cshplUpdate(this)">'+
        '<button class="vi-row-del" data-mk="'+mk+'" data-type="'+type+'" data-id="'+row.id+'" onclick="cshplDelete(this)">✕</button>'+
      '</div>';
    }).join('');
  });
  cshplRecalc();
  cshplRenderHistory();
}

function cshplUpdate(el){
  var mk=el.dataset.mk,type=el.dataset.type,id=el.dataset.id,field=el.dataset.field,val=el.value;
  var rows=initCshplRows(type);
  var row=rows.find(function(r){return r.id===id;});
  if(row){row[field]=field==='amt'?parseFloat(val)||0:val;saveCshplData(mk+'_'+type,rows);}
  cshplRecalc(); cshplRenderHistory();
}
function cshplDelete(el){
  var mk=el.dataset.mk,type=el.dataset.type,id=el.dataset.id;
  var rows=initCshplRows(type).filter(function(r){return r.id!==id;});
  saveCshplData(mk+'_'+type,rows); cshplRender();
}
function cshplAddRow(type){
  var mk=cshplMonthKey(CSHPL_OFFSET);
  var rows=initCshplRows(type);
  rows.push({id:mk+type+'_'+Date.now(),label:'',amt:0});
  saveCshplData(mk+'_'+type,rows); cshplRender();
}
function cshplRecalc(){
  var rev=initCshplRows('rev').reduce(function(s,r){return s+(parseFloat(r.amt)||0);},0);
  var exp=initCshplRows('exp').reduce(function(s,r){return s+(parseFloat(r.amt)||0);},0);
  var net=rev-exp;
  var margin=rev>0?Math.round(net/rev*100):null;
  var set=function(id,v){var el=document.getElementById(id);if(el)el.textContent=v;};
  set('cshpl-total-rev','$'+rev.toFixed(0));
  set('cshpl-total-exp','$'+exp.toFixed(0));
  var netEl=document.getElementById('cshpl-net');
  if(netEl){netEl.textContent=(net>=0?'+':'')+net.toFixed(0);netEl.style.color=net>=0?'#88c98a':'#e07070';}
  set('cshpl-margin',margin!==null?margin+'%':'—');
}
function cshplRenderHistory(){
  var el=document.getElementById('cshpl-history-chart');
  if(!el)return;
  var MONTHS_S=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var maxVal=0;
  var months=[];
  for(var i=-5;i<=0;i++){
    var d=new Date();d.setDate(1);d.setMonth(d.getMonth()+i);
    var mk=d.getFullYear()+'-'+(d.getMonth()+1);
    var revD=getCshplData(mk+'_rev');
    var expD=getCshplData(mk+'_exp');
    var rev=revD?revD.reduce(function(s,r){return s+(parseFloat(r.amt)||0);},0):0;
    var exp=expD?expD.reduce(function(s,r){return s+(parseFloat(r.amt)||0);},0):0;
    maxVal=Math.max(maxVal,rev,exp);
    months.push({label:MONTHS_S[d.getMonth()],rev:rev,exp:exp});
  }
  if(maxVal===0){el.innerHTML='<div style="font-family:DM Mono,monospace;font-size:9px;color:var(--muted);padding:16px 0">No data yet — enter figures for each month to see history.</div>';return;}
  el.innerHTML='<div class="cshb-section-title" style="margin-bottom:10px">Revenue vs Expenses — last 6 months</div>'+
    months.map(function(m){
      var rPct=maxVal>0?Math.round(m.rev/maxVal*100):0;
      var ePct=maxVal>0?Math.round(m.exp/maxVal*100):0;
      return '<div class="cshpl-history-row">'+
        '<span>'+m.label+'</span>'+
        '<div><div class="cshpl-bar-wrap"><div class="cshpl-bar-rev" style="width:'+rPct+'%"></div></div><div class="cshpl-bar-wrap"><div class="cshpl-bar-exp" style="width:'+ePct+'%"></div></div></div>'+
        '<span style="color:#88c98a">$'+m.rev.toFixed(0)+'</span>'+
        '<span style="color:#e07070">$'+m.exp.toFixed(0)+'</span>'+
      '</div>';
    }).join('');
}
function cshplNavMonth(dir){CSHPL_OFFSET+=dir;cshplRender();}
function cshplGoToday(){CSHPL_OFFSET=0;cshplRender();}
function initCshPL(){cshplRender();}

async function cshplGenerateNarrative(btn){
  var panelEl=document.getElementById('cshpl-ai-result');
  if(!panelEl)return;
  btn.disabled=true;btn.textContent='Generating…';
  panelEl.style.display='block';
  panelEl.innerHTML='<div class="csh-ai-loading"><div class="csh-ai-dots"><span></span><span></span><span></span></div>Writing P&L summary…</div>';
  var rev=initCshplRows('rev'),exp=initCshplRows('exp');
  var totalRev=rev.reduce(function(s,r){return s+(parseFloat(r.amt)||0);},0);
  var totalExp=exp.reduce(function(s,r){return s+(parseFloat(r.amt)||0);},0);
  var content='Month: '+cshplMonthLabel(CSHPL_OFFSET)+'\n\nRevenue:\n'+rev.map(function(r){return '- '+r.label+': $'+r.amt;}).join('\n')+'\nTotal revenue: $'+totalRev+'\n\nExpenses:\n'+exp.map(function(r){return '- '+r.label+': $'+r.amt;}).join('\n')+'\nTotal expenses: $'+totalExp+'\nNet: $'+(totalRev-totalExp);
  var system='You are a grant writer. Write a clear, professional P&L narrative (120-160 words) for a ChaShaMa storefront application. Explain the financials honestly, show awareness of the numbers, and frame things constructively whether profitable or not. First person, specific. No headers.';
  try{
    var res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:500,system:system,messages:[{role:'user',content:'My P&L:\n\n'+content+'\n\nWrite a P&L narrative for my ChaShaMa application.'}]})});
    var data=await res.json();
    var text=(data.content&&data.content[0]&&data.content[0].text)||'';
    panelEl.innerHTML='<div class="csh-ai-result"><div class="csh-ai-score-bar"><span class="csh-ai-score-label">P&L narrative</span><button class="csh-ai-dismiss" style="border:none;padding:0" onclick="navigator.clipboard.writeText(document.getElementById(\'cshpl-gen-text\').textContent)">Copy ✦</button></div><div class="csh-ai-body"><p id="cshpl-gen-text" style="white-space:pre-wrap;line-height:1.75;color:var(--text)">'+escHtml(text)+'</p></div><button class="csh-ai-dismiss" onclick="cshDismiss(this)">Dismiss ✕</button></div>';
    btn.disabled=false;btn.textContent='✦ Regenerate';
  }catch(err){
    panelEl.innerHTML='<div class="csh-ai-body"><p class="csh-ai-warn">Error: '+(err.message||'unknown')+'</p><button class="csh-ai-dismiss" onclick="cshDismiss(this)">Dismiss ✕</button></div>';
    btn.disabled=false;btn.textContent='✦ Try again';
  }
}

function showToast(msg){var t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2800);}


// ═══ CHASHAMA ════════════════════════════════════════════════════
function cshProgress() {
  var fields = document.querySelectorAll('#front-chashama-proposal .csh-watch');
  var filled = 0;
  fields.forEach(function(f) {
    var val = f.value !== undefined ? f.value : f.textContent;
    if (val && val.trim().length > 0) filled++;
  });
  var pct = fields.length ? Math.round(filled / fields.length * 100) : 0;
  var fillEl = document.getElementById('csh-fill');
  var pctEl  = document.getElementById('csh-pct');
  if (fillEl) fillEl.style.width = pct + '%';
  if (pctEl)  pctEl.textContent  = pct + '%';
}

function cshSaveCheck(el) {
  var key = el.dataset.key;
  if (!key) return;
  var bpData = getBPData();
  bpData[key] = el.checked ? '1' : '';
  localStorage.setItem('bp_data_v1', JSON.stringify(bpData));
}

function cshHandleFile(slot, input) {
  if (!input.files || !input.files[0]) return;
  var name = input.files[0].name;
  var labelEl = document.getElementById('csh-label-' + slot);
  var dropEl  = document.getElementById('csh-drop-' + slot);
  if (labelEl) labelEl.textContent = '📄 ' + name;
  if (dropEl)  dropEl.classList.add('has-file');
  var bpData = getBPData();
  bpData['csh-file-' + slot] = name;
  localStorage.setItem('bp_data_v1', JSON.stringify(bpData));
}

function initChaShaMa() {
  // Restore checkboxes
  var bpData = getBPData();
  document.querySelectorAll('#front-chashama-proposal input[type="checkbox"][data-key]').forEach(function(cb) {
    cb.checked = bpData[cb.dataset.key] === '1';
  });
  // Restore file labels
  ['budget','pl'].forEach(function(slot) {
    var name = bpData['csh-file-' + slot];
    if (name) {
      var labelEl = document.getElementById('csh-label-' + slot);
      var dropEl  = document.getElementById('csh-drop-' + slot);
      if (labelEl) labelEl.textContent = '📄 ' + name;
      if (dropEl)  dropEl.classList.add('has-file');
    }
  });
  cshProgress();
}

function initMarketing() {
  initMktTasks();
}

function showTab(project, tab, btn) {
  const ws = document.getElementById('page-' + project);
  ws.querySelectorAll('.sub-bar .tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  showView(project, tab);
  if (tab === 'archive') renderArchive(project);
  if (tab === 'popup-revenue') setTimeout(function(){ initRevProj(); renderRevProj(); }, 20);
  if (tab === 'popup-pl') setTimeout(function(){ initPLData(); renderPL(); }, 20);
  if (tab === 'popup-inventory') setTimeout(function(){ initPLData(); renderInventory(); }, 20);
  if (tab === 'schedule') setTimeout(function(){ if(typeof initTracker==='function') initTracker(); if(typeof renderTracker==='function') renderTracker(); }, 20);
  if (tab === 'popup-marketing') setTimeout(function(){ mktShowTab('overview', document.querySelector('#front-popup-marketing .mkt-tab')); }, 20);
  if (tab === 'chashama-proposal') setTimeout(function(){ loadBPData(); initChaShaMa(); }, 20);
  if (tab === 'popup-events') setTimeout(function(){ initEvents(); loadBPData(); }, 20);
  if (tab === 'popup-resources') setTimeout(function(){ initResources(); }, 20);
  if (tab === 'brand-identity') setTimeout(function(){ seedBrandDefaults(); loadBPData(); }, 20);
  if (tab === 'visual-identity') setTimeout(function(){ initBrandTabs(); }, 20);
  if (tab === 'popup') setTimeout(function(){ initOverview(); }, 20);
  if (tab === 'chashama-storefront') setTimeout(function(){ loadBPData(); }, 20);
  if (tab === 'chashama-budget') setTimeout(function(){ initCshBudget(); }, 20);
  if (tab === 'chashama-pl') setTimeout(function(){ initCshPL(); }, 20);
}



// ═══ REVENUE PROJECTION ══════════════════════════════════════════
var revData = null;

function getRevData() {
  if (revData) return revData;
  try { revData = JSON.parse(localStorage.getItem('popup_rev_proj_v1') || 'null'); } catch(e) {}
  if (!revData) {
    revData = {
      weeks: 4,
      vendors: [
        { id: 1, name: 'Verconiik', split: 30, items: [
          { id: 1, name: 'Piece A', price: 150, weeks: [0,0,0,0] },
          { id: 2, name: 'Piece B', price: 250, weeks: [0,0,0,0] }
        ]},
        { id: 2, name: 'Harlot Hands', split: 30, items: [
          { id: 1, name: 'Necklace', price: 300, weeks: [0,0,0,0] }
        ]},
        { id: 3, name: 'In-House', split: 100, items: [
          { id: 1, name: 'Set', price: 400, weeks: [0,0,0,0] }
        ]}
      ]
    };
  }
  return revData;
}

function saveRevData() {
  localStorage.setItem('popup_rev_proj_v1', JSON.stringify(revData));
}

function revSetWeeks(n) {
  n = Math.max(1, Math.min(12, parseInt(n) || 4));
  revData.weeks = n;
  revData.vendors.forEach(function(v) {
    v.items.forEach(function(item) {
      while (item.weeks.length < n) item.weeks.push(0);
      item.weeks = item.weeks.slice(0, n);
    });
  });
  saveRevData();
  renderRevProj();
}

function revMyShare(price, vendorSplit) {
  var pct = parseInt(vendorSplit) || 30;
  return price * (pct / 100);
}

function revAddVendor() {
  var d = getRevData();
  var maxId = d.vendors.reduce(function(m,v){ return Math.max(m,v.id); }, 0);
  d.vendors.push({ id: maxId+1, name: '', split: 30, items: [] });
  saveRevData();
  renderRevProj();
}

function revDelVendor(vid) {
  var d = getRevData();
  d.vendors = d.vendors.filter(function(v){ return v.id !== vid; });
  saveRevData();
  renderRevProj();
}

function revAddItem(vid) {
  var d = getRevData();
  var v = d.vendors.find(function(x){ return x.id === vid; });
  if (!v) return;
  var maxId = v.items.reduce(function(m,i){ return Math.max(m,i.id); }, 0);
  v.items.push({ id: maxId+1, name: '', price: 0, category: '', weeks: Array(d.weeks).fill(0) });
  saveRevData();
  renderRevProj();
}

function revDelItem(vid, iid) {
  var d = getRevData();
  var v = d.vendors.find(function(x){ return x.id === vid; });
  if (v) v.items = v.items.filter(function(i){ return i.id !== iid; });
  saveRevData();
  renderRevProj();
}

function revUpdate(vid, iid, field, value) {
  var d = getRevData();
  var v = d.vendors.find(function(x){ return x.id === vid; });
  if (!v) return;
  if (field === 'vendorName') { v.name = value; saveRevData(); return; }
  if (field === 'vendorSplit') { v.split = parseInt(value) || 30; saveRevData(); revUpdateSummary(); return; }
  var item = v.items.find(function(i){ return i.id === iid; });
  if (!item) return;
  if (field === 'name')  { item.name = value; }
  if (field === 'price') { item.price = parseFloat(value) || 0; }
  if (field.charAt(0) === 'w') {
    var wi = parseInt(field.slice(1));
    item.weeks[wi] = parseInt(value) || 0;
  }
  saveRevData();
  revUpdateSummary();
}


function revUpdateSummary() {
  var d = getRevData();
  var totalGross = 0, totalNet = 0, totalVendor = 0;
  var weekGross = Array(d.weeks).fill(0);
  var weekNet   = Array(d.weeks).fill(0);

  d.vendors.forEach(function(v) {
    v.items.forEach(function(item) {
      item.weeks.forEach(function(units, wi) {
        var gross = parseInt(units) || 0;
        var net   = gross * ((parseInt(v.split) || 30) / 100);
        totalGross  += gross;
        totalNet    += net;
        totalVendor += (gross - net);
        weekGross[wi] += gross;
        weekNet[wi]   += net;
      });
    });
  });

  // update per-item net cells
  d.vendors.forEach(function(v) {
    v.items.forEach(function(item) {
      var u = item.weeks.reduce(function(s,x){ return s+(parseInt(x)||0); }, 0);
      var net = u * ((parseInt(v.split) || 30) / 100);
      var el = document.getElementById('rev-net-' + v.id + '-' + item.id);
      if (el) el.textContent = '$' + net.toLocaleString();
    });
    // update vendor totals
    var vGross = 0, vNet = 0;
    v.items.forEach(function(item) {
      var u = item.weeks.reduce(function(s,x){ return s+(parseInt(x)||0); }, 0);
      vGross += u;
      vNet   += u * ((parseInt(v.split) || 30) / 100);
    });
    var tot = document.getElementById('rev-vtotals-' + v.id);
    if (tot) tot.innerHTML =
      '<span>Gross: <strong>$' + vGross.toLocaleString() + '</strong></span>' +
      '<span>Your take: <strong class="rev-net-highlight">$' + vNet.toLocaleString() + '</strong></span>' +
      '<span>Vendor payout: <strong>$' + (vGross - vNet).toLocaleString() + '</strong></span>';
  });

  var sumEl = document.getElementById('rev-proj-summary');
  if (sumEl) {
    sumEl.innerHTML =
      '<div class="rev-summary-card"><div class="rev-summary-label">Total Gross Sales</div><div class="rev-summary-val blue">$' + totalGross.toLocaleString() + '</div></div>' +
      '<div class="rev-summary-card"><div class="rev-summary-label">Your Net Revenue</div><div class="rev-summary-val green">$' + totalNet.toLocaleString() + '</div></div>' +
      '<div class="rev-summary-card"><div class="rev-summary-label">Vendor Payouts</div><div class="rev-summary-val">$' + totalVendor.toLocaleString() + '</div></div>' +
      '<div class="rev-summary-card"><div class="rev-summary-label">Your Margin</div><div class="rev-summary-val ' + (totalGross > 0 ? 'green' : '') + '">' + (totalGross > 0 ? Math.round(totalNet / totalGross * 100) : 0) + '%</div></div>';
  }
  revDrawChart(weekGross, weekNet, d.weeks);
}

function renderRevProj() {
  var d = getRevData();
  var el = document.getElementById('rev-proj-vendors');
  if (!el) return;

  var html = '';
  d.vendors.forEach(function(v) {
    var weeksHead = '';
    for (var wi = 0; wi < d.weeks; wi++) {
      weeksHead += '<th class="num" style="min-width:70px">Price Wk ' + (wi+1) + '</th>';
    }

    var rows = '';
    v.items.forEach(function(item) {
      var weekCells = '';
      for (var wi = 0; wi < d.weeks; wi++) {
        var units = item.weeks[wi] || 0;
        weekCells += '<td><span style="font-family:DM Mono,monospace;font-size:9px;color:var(--muted)">$</span>' +
          '<input class="rev-week-input" type="number" min="0" value="' + units + '" placeholder="0"' +
          ' data-vid="' + v.id + '" data-iid="' + item.id + '" data-field="w' + wi + '" data-role="rev-field"></td>';
      }
      var totalRevenue = item.weeks.reduce(function(s,x){ return s+(parseInt(x)||0); }, 0);
      var net = totalRevenue * ((parseInt(v.split) || 30) / 100);
      rows += '<tr>' +
        '<td><input class="rev-item-input" value="' + esc(item.name) + '" placeholder="Item name"' +
          ' data-vid="' + v.id + '" data-iid="' + item.id + '" data-field="name" data-role="rev-field"></td>' +
        '<td><select class="rev-split-select" data-vid="' + v.id + '" data-iid="' + item.id + '" data-field="category" data-role="rev-field">' +
          '<option value="">— cat —</option>' +
          '<option value="Clothing"' + (item.category === "Clothing" ? ' selected' : '') + '>Clothing</option>' +
          '<option value="Accessories"' + (item.category === "Accessories" ? ' selected' : '') + '>Accessories</option>' +
          '<option value="Jewelry"' + (item.category === "Jewelry" ? ' selected' : '') + '>Jewelry</option>' +
          '<option value="Objects"' + (item.category === "Objects" ? ' selected' : '') + '>Objects</option>' +
          '<option value="Art / Print"' + (item.category === "Art / Print" ? ' selected' : '') + '>Art / Print</option>' +
          '<option value="Other"' + (item.category === "Other" ? ' selected' : '') + '>Other</option>' +
        '</select></td>' +
        '<td style="white-space:nowrap"><span style="color:var(--muted);font-family:DM Mono,monospace;font-size:10px;margin-right:2px">$</span>' +
          '<input class="rev-price-input" type="number" min="0" value="' + item.price + '" placeholder="0"' +
          ' data-vid="' + v.id + '" data-iid="' + item.id + '" data-field="price" data-role="rev-field"></td>' +

        weekCells +
        '<td class="rev-net-cell" id="rev-net-' + v.id + '-' + item.id + '">$' + net.toLocaleString() + '</td>' +
        '<td><button class="rev-item-del" data-vid="' + v.id + '" data-iid="' + item.id + '" data-role="rev-del-item">&#10005;</button></td>' +
      '</tr>';
    });

    var vGross = 0, vNet = 0;
    v.items.forEach(function(item) {
      var u = item.weeks.reduce(function(s,x){ return s+(parseInt(x)||0); }, 0);
      vGross += item.price * u;
      vNet   += revMyShare(item.price, item.split) * u;
    });

    html += '<div class="rev-vendor-block" id="rev-vblock-' + v.id + '">' +
      '<div class="rev-vendor-header">' +
        '<input class="rev-vendor-name" value="' + esc(v.name) + '" placeholder="Vendor name"' +
          ' data-vid="' + v.id + '" data-field="vendorName" data-role="rev-field">' +
        '<div style="display:flex;align-items:center;gap:5px;margin-left:auto">' +
          '<span style="font-family:DM Mono,monospace;font-size:9px;color:var(--muted);letter-spacing:0.08em">your split</span>' +
          '<input type="number" min="0" max="100" class="rev-price-input" value="' + (parseInt(v.split) || 30) + '"' +
            ' data-vid="' + v.id + '" data-field="vendorSplit" data-role="rev-field"' +
            ' style="width:40px;text-align:center">' +
          '<span style="font-family:DM Mono,monospace;font-size:9px;color:var(--muted)">%</span>' +
        '</div>' +
        '<button class="rev-vendor-del" data-vid="' + v.id + '" data-role="rev-del-vendor" style="margin-left:10px">&#10005;</button>' +
      '</div>' +
      '<div style="overflow-x:auto">' +
      '<table class="rev-item-table">' +
        '<thead><tr><th>Item</th><th>Category</th><th class="num">Unit $</th>' + weeksHead + '<th class="num">Your net</th><th></th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table></div>' +
      '<button class="rev-add-item-btn" data-vid="' + v.id + '" data-role="rev-add-item">+ Add item</button>' +
      '<div class="rev-vendor-totals" id="rev-vtotals-' + v.id + '">' +
        '<span>Gross: <strong>$' + vGross.toLocaleString() + '</strong></span>' +
        '<span>Your take: <strong class="rev-net-highlight">$' + vNet.toLocaleString() + '</strong></span>' +
        '<span>Vendor payout: <strong>$' + (vGross - vNet).toLocaleString() + '</strong></span>' +
      '</div>' +
    '</div>';
  });

  el.innerHTML = html;

  // sync weeks input
  var wi = document.getElementById('rev-weeks-input');
  if (wi) wi.value = d.weeks;

  revUpdateSummary();
}


function revDrawChart(weekGross, weekNet, numWeeks) {
  var canvas = document.getElementById('rev-proj-chart');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var W = canvas.offsetWidth || 600;
  var H = 180;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  var maxVal = Math.max.apply(null, weekGross.concat([1]));
  var pad = { top: 20, bottom: 36, left: 56, right: 16 };
  var chartW = W - pad.left - pad.right;
  var chartH = H - pad.top - pad.bottom;
  var barW = Math.max(8, Math.floor(chartW / numWeeks * 0.3));
  var groupW = chartW / numWeeks;

  var isDark = !document.body.classList.contains('light-mode');
  var textColor  = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)';
  var gridColor  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';

  // grid lines + y labels
  [0.25, 0.5, 0.75, 1].forEach(function(f) {
    var y = pad.top + chartH * (1 - f);
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillStyle = textColor;
    ctx.font = '9px DM Mono, monospace';
    ctx.textAlign = 'right';
    var label = maxVal * f >= 1000 ? '$' + Math.round(maxVal * f / 1000) + 'k' : '$' + Math.round(maxVal * f);
    ctx.fillText(label, pad.left - 4, y + 3);
  });

  // bars
  for (var wi = 0; wi < numWeeks; wi++) {
    var cx = pad.left + groupW * wi + groupW / 2;
    var grossH = maxVal > 0 ? (weekGross[wi] / maxVal) * chartH : 0;
    var netH   = maxVal > 0 ? (weekNet[wi]   / maxVal) * chartH : 0;
    var grossY = pad.top + chartH - grossH;
    var netY   = pad.top + chartH - netH;

    ctx.fillStyle = isDark ? 'rgba(168,196,212,0.2)' : 'rgba(168,196,212,0.3)';
    ctx.fillRect(cx - barW - 2, grossY, barW, grossH);

    ctx.fillStyle = isDark ? 'rgba(136,201,138,0.7)' : 'rgba(136,201,138,0.85)';
    ctx.fillRect(cx + 2, netY, barW, netH);

    ctx.fillStyle = textColor;
    ctx.font = '9px DM Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Wk ' + (wi + 1), cx, H - 10);
  }

  // legend
  ctx.fillStyle = isDark ? 'rgba(168,196,212,0.4)' : 'rgba(168,196,212,0.6)';
  ctx.fillRect(pad.left, 5, 10, 8);
  ctx.fillStyle = textColor;
  ctx.font = '9px DM Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('Gross', pad.left + 14, 12);

  ctx.fillStyle = isDark ? 'rgba(136,201,138,0.7)' : 'rgba(136,201,138,0.85)';
  ctx.fillRect(pad.left + 62, 5, 10, 8);
  ctx.fillStyle = textColor;
  ctx.fillText('Your net', pad.left + 76, 12);
}


// ── Rev tab switching ────────────────────────────────────────
function revShowTab(name, btn) {
  ['catalog','log','metrics'].forEach(function(t) {
    var p = document.getElementById('rev-panel-' + t);
    var b = document.getElementById('rev-tab-' + t);
    if (p) p.style.display = t === name ? '' : 'none';
    if (b) b.classList.toggle('active', t === name);
  });
  if (name === 'log')     revRenderLog();
  if (name === 'metrics') revRenderMetrics();
}

// ── Sales log data ───────────────────────────────────────────
function getSalesLog() {
  try { return JSON.parse(localStorage.getItem('popup_sales_log_v1') || '[]'); } catch(e) { return []; }
}
function saveSalesLog(log) {
  localStorage.setItem('popup_sales_log_v1', JSON.stringify(log));
}

// ── Log UI state ─────────────────────────────────────────────
var revLogState = { week: 1, day: 'Sat', itemKey: null, qty: 1 };


function revDeleteSale(id) {
  var log = getSalesLog().filter(function(e){ return e.id !== id; });
  saveSalesLog(log);
  revRenderLog();
}

function revLogSale() {
  if (!revLogState.itemKey) return;
  var parts = revLogState.itemKey.split('__');
  var vid = parseInt(parts[0]), iid = parseInt(parts[1]);
  var d = getRevData();
  var v = d.vendors.find(function(x){ return x.id === vid; });
  var item = v && v.items.find(function(i){ return i.id === iid; });
  if (!item) return;
  var log = getSalesLog();
  log.push({
    id: Date.now(),
    week: revLogState.week,
    day: revLogState.day,
    vid: vid,
    iid: iid,
    vendorName: v.name || 'Vendor',
    itemName: item.name,
    category: revLogState.itemCategory || item.category || 'Other',
    price: item.price,
    split: parseInt(item.split) || 30,
    qty: revLogState.qty || 1
  });
  saveSalesLog(log);
  revLogState.itemKey = null;
  revLogState.qty = 1;
  document.querySelectorAll('.rev-log-item-card').forEach(function(x){ x.classList.remove('active'); });
  var box = document.getElementById('rev-log-confirm');
  if (box) box.style.display = 'none';
  revRenderLog();
}

function revBuildLogUI() {
  var WEEKS = [1,2,3,4];
  var DAYS  = ['Thu','Fri','Sat','Sun','Mon','Tue','Wed'];

  // Week pills
  var wr = document.getElementById('rev-log-week-row');
  if (wr) {
    wr.innerHTML = '<span class="rev-log-section-label">Week</span>' +
      WEEKS.map(function(w) {
        return '<button class="rev-log-pill' + (revLogState.week === w ? ' active' : '') + '" onclick="revSetLogWeek(' + w + ',this)">' + w + '</button>';
      }).join('');
  }

  // Day pills
  var dr = document.getElementById('rev-log-day-row');
  if (dr) {
    dr.innerHTML = '<span class="rev-log-section-label">Day</span>' +
      DAYS.map(function(d) {
        return '<button class="rev-log-pill' + (revLogState.day === d ? ' active' : '') + '" data-day="' + d + '" onclick="revSetLogDay(this.dataset.day,this)">' + d + '</button>';
      }).join('');
  }

  // Item grid
  var d = getRevData();
  var ig = document.getElementById('rev-log-item-grid');
  if (ig) {
    var cards = '';
    d.vendors.forEach(function(v) {
      v.items.forEach(function(item) {
        if (!item.name) return;
        var key = v.id + '__' + item.id;
        var active = revLogState.itemKey === key ? ' active' : '';
        cards += '<div class="rev-log-item-card' + active + '" data-key="' + key + '" data-name="' + esc(item.name) + '" data-price="' + item.price + '" data-split="' + (parseInt(item.split)||30) + '" data-cat="' + esc(item.category||'Other') + '" onclick="revSetLogItem(this.dataset.key,this,this.dataset.name,+this.dataset.price,+this.dataset.split,this.dataset.cat)">' +
          '<span class="rev-log-item-vendor">' + esc(v.name || 'Vendor') + '</span>' +
          esc(item.name) +
          '<div class="rev-log-item-price">$' + item.price.toLocaleString() + ' &nbsp;·&nbsp; ' + (parseInt(item.split)||30) + '% yours</div>' +
        '</div>';
      });
    });
    ig.innerHTML = cards || '<div style="color:var(--muted);font-family:DM Mono,monospace;font-size:9px;padding:8px 0">Add items in the Catalog tab first.</div>';
  }

  revUpdateConfirm();
}

function revSetLogWeek(w, btn) {
  revLogState.week = w;
  document.querySelectorAll('#rev-log-week-row .rev-log-pill').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
}

function revSetLogDay(d, btn) {
  revLogState.day = d;
  document.querySelectorAll('#rev-log-day-row .rev-log-pill').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
}

function revSetLogItem(key, el, name, price, split, cat) {
  revLogState.itemKey = key;
  revLogState.itemName = name;
  revLogState.itemPrice = price;
  revLogState.itemSplit = split;
  revLogState.itemCategory = cat || 'Other';
  document.querySelectorAll('.rev-log-item-card').forEach(function(c){ c.classList.remove('active'); });
  if (el) el.classList.add('active');
  revUpdateConfirm();
}

function revAdjQty(delta) {
  revLogState.qty = Math.max(1, (revLogState.qty || 1) + delta);
  var el = document.getElementById('rev-log-qty-val');
  if (el) el.textContent = revLogState.qty;
  revUpdateConfirm();
}

function revUpdateConfirm() {
  var box = document.getElementById('rev-log-confirm');
  var lbl = document.getElementById('rev-log-confirm-label');
  if (!box) return;
  if (!revLogState.itemKey) { box.style.display = 'none'; return; }
  box.style.display = 'flex';
  var gross = revLogState.itemPrice * revLogState.qty;
  var net   = gross * revLogState.itemSplit / 100;
  if (lbl) lbl.innerHTML =
    '<strong>' + esc(revLogState.itemName) + '</strong>' +
    '<span style="font-family:DM Mono,monospace;font-size:10px;color:var(--muted);margin-left:10px">$' + gross.toLocaleString() + ' gross &nbsp;·&nbsp; <span style="color:#88c98a">$' + net.toLocaleString() + ' yours</span></span>';
  var qv = document.getElementById('rev-log-qty-val');
  if (qv) qv.textContent = revLogState.qty;
}

function revRenderLog() {
  revBuildLogUI();
  var list = document.getElementById('rev-log-list');
  if (!list) return;
  var log = getSalesLog();
  if (!log.length) {
    list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);font-family:Cormorant Garamond,serif;font-style:italic;font-size:14px">No sales logged yet.</div>';
    return;
  }
  // group by week
  var byWeek = {};
  log.forEach(function(e) {
    if (!byWeek[e.week]) byWeek[e.week] = [];
    byWeek[e.week].push(e);
  });
  var html = '';
  [1,2,3,4].forEach(function(w) {
    if (!byWeek[w] || !byWeek[w].length) return;
    var wGross = 0, wNet = 0;
    byWeek[w].forEach(function(e) {
      wGross += e.price * e.qty;
      wNet   += (e.price * (parseInt(e.split)||30) / 100) * e.qty;
    });
    html += '<div style="margin-bottom:24px">';
    html += '<div style="font-family:DM Mono,monospace;font-size:8px;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);padding:8px 0 6px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between">' +
      '<span>Week ' + w + '</span>' +
      '<span style="color:#a8c4d4">Gross $' + wGross.toLocaleString() + ' &nbsp;·&nbsp; <span style="color:#88c98a">Your net $' + wNet.toLocaleString() + '</span></span>' +
    '</div>';
    byWeek[w].forEach(function(e) {
      var gross = e.price * e.qty;
      var net   = (e.price * (parseInt(e.split)||30) / 100) * e.qty;
      html += '<div class="rev-log-entry">' +
        '<span class="rev-log-tag">' + e.day + '</span>' +
        '<span class="rev-log-item-name">' + esc(e.itemName) + (e.qty > 1 ? ' <span style="font-family:DM Mono,monospace;font-size:9px;color:var(--muted)">×' + e.qty + '</span>' : '') + '</span>' +
        '<span style="font-family:DM Mono,monospace;font-size:9px;color:var(--muted)">' + esc(e.vendorName) + '</span>' +
        '<span class="rev-log-gross">$' + gross.toLocaleString() + '</span>' +
        '<span class="rev-log-net">$' + net.toLocaleString() + '</span>' +
        '<button class="rev-log-del" onclick="revDeleteSale(' + e.id + ')">✕</button>' +
      '</div>';
    });
    html += '</div>';
  });
  list.innerHTML = html;
}

function revRenderMetrics() {
  var log = getSalesLog();
  var d   = getRevData();

  // totals
  var totalGross = 0, totalNet = 0;
  log.forEach(function(e) {
    totalGross += e.price * e.qty;
    totalNet   += (e.price * (parseInt(e.split)||30) / 100) * e.qty;
  });
  var sumEl = document.getElementById('rev-proj-summary');
  if (sumEl) {
    var margin = totalGross > 0 ? Math.round(totalNet / totalGross * 100) : 0;
    sumEl.innerHTML =
      '<div class="rev-summary-card"><div class="rev-summary-label">Total Gross</div><div class="rev-summary-val blue">$' + totalGross.toLocaleString() + '</div></div>' +
      '<div class="rev-summary-card"><div class="rev-summary-label">Your Net</div><div class="rev-summary-val green">$' + totalNet.toLocaleString() + '</div></div>' +
      '<div class="rev-summary-card"><div class="rev-summary-label">Units Sold</div><div class="rev-summary-val">' + log.reduce(function(s,e){return s+e.qty;},0) + '</div></div>' +
      '<div class="rev-summary-card"><div class="rev-summary-label">Your Margin</div><div class="rev-summary-val ' + (margin>0?'green':'') + '">' + margin + '%</div></div>';
  }

  // by week chart
  var weekGross = [0,0,0,0], weekNet = [0,0,0,0];
  log.forEach(function(e) {
    var wi = (e.week||1) - 1;
    if (wi >= 0 && wi < 4) {
      weekGross[wi] += e.price * e.qty;
      weekNet[wi]   += (e.price * (parseInt(e.split)||30) / 100) * e.qty;
    }
  });
  revDrawBarChart('rev-chart-weeks', weekGross, weekNet, ['Wk 1','Wk 2','Wk 3','Wk 4']);

  // by day chart
  var DAYS = ['Thu','Fri','Sat','Sun','Mon','Tue','Wed'];
  var dayGross = {}, dayNet = {};
  DAYS.forEach(function(d){ dayGross[d]=0; dayNet[d]=0; });
  log.forEach(function(e) {
    if (dayGross[e.day] !== undefined) {
      dayGross[e.day] += e.price * e.qty;
      dayNet[e.day]   += (e.price * (parseInt(e.split)||30) / 100) * e.qty;
    }
  });
  var activeDays = DAYS.filter(function(d){ return dayGross[d] > 0; });
  if (!activeDays.length) activeDays = DAYS;
  revDrawBarChart('rev-chart-days',
    activeDays.map(function(d){ return dayGross[d]; }),
    activeDays.map(function(d){ return dayNet[d]; }),
    activeDays);

  // top items
  var itemTotals = {};
  log.forEach(function(e) {
    var k = e.vid + '__' + e.iid;
    if (!itemTotals[k]) itemTotals[k] = { name: e.itemName, vendor: e.vendorName, net: 0, qty: 0 };
    itemTotals[k].net += (e.price * (parseInt(e.split)||30) / 100) * e.qty;
    itemTotals[k].qty += e.qty;
  });
  var sorted = Object.values(itemTotals).sort(function(a,b){ return b.net - a.net; });
  var maxNet = sorted.length ? sorted[0].net : 1;
  var tiEl = document.getElementById('rev-top-items');
  if (tiEl) {
    tiEl.innerHTML = sorted.length ? sorted.map(function(x) {
      var pct = maxNet > 0 ? Math.round(x.net / maxNet * 100) : 0;
      return '<div class="rev-rank-row">' +
        '<div class="rev-rank-name">' + esc(x.name) + '</div>' +
        '<div class="rev-rank-bar-wrap"><div class="rev-rank-bar" style="width:' + pct + '%"></div></div>' +
        '<div class="rev-rank-val">$' + x.net.toLocaleString() + '</div>' +
      '</div>';
    }).join('') : '<div style="color:var(--muted);font-family:DM Mono,monospace;font-size:9px;padding:12px 0">No sales yet.</div>';
  }

  // by category
  var catTotals = {};
  log.forEach(function(e) {
    var cat = e.category || 'Other';
    if (!catTotals[cat]) catTotals[cat] = { net: 0, gross: 0, qty: 0 };
    catTotals[cat].gross += e.price * e.qty;
    catTotals[cat].net   += (e.price * (parseInt(e.split)||30) / 100) * e.qty;
    catTotals[cat].qty   += e.qty;
  });
  var csorted = Object.entries(catTotals).sort(function(a,b){ return b[1].net - a[1].net; });
  var maxCNet = csorted.length ? csorted[0][1].net : 1;
  var bcEl = document.getElementById('rev-by-category');
  if (bcEl) {
    bcEl.innerHTML = csorted.length ? csorted.map(function(kv) {
      var pct = maxCNet > 0 ? Math.round(kv[1].net / maxCNet * 100) : 0;
      return '<div class="rev-rank-row">' +
        '<div class="rev-rank-name">' + esc(kv[0]) + '</div>' +
        '<span style="font-family:DM Mono,monospace;font-size:8px;color:var(--muted)">' + kv[1].qty + ' sold</span>' +
        '<div class="rev-rank-bar-wrap"><div class="rev-rank-bar" style="width:' + pct + '%"></div></div>' +
        '<div class="rev-rank-val">$' + kv[1].net.toLocaleString() + '</div>' +
      '</div>';
    }).join('') : '<div style="color:var(--muted);font-family:DM Mono,monospace;font-size:9px;padding:12px 0">No sales yet.</div>';
  }

  // category stacked by week chart
  var CATS_ORDER = ['Clothing','Accessories','Jewelry','Objects','Art / Print','Other'];
  var CAT_COLORS = ['#a8c4d4','#88c98a','#e2c97e','#c4a8d4','#d4a8b8','#888'];
  var catWeekData = {};
  CATS_ORDER.forEach(function(cat) { catWeekData[cat] = [0,0,0,0]; });
  log.forEach(function(e) {
    var cat = e.category || 'Other';
    var wi = (e.week||1) - 1;
    if (!catWeekData[cat]) catWeekData[cat] = [0,0,0,0];
    if (wi >= 0 && wi < 4) catWeekData[cat][wi] += e.price * e.qty;
  });
  var activeCats = CATS_ORDER.filter(function(cat) {
    return catWeekData[cat] && catWeekData[cat].some(function(v){ return v > 0; });
  });
  revDrawCatChart('rev-chart-cats', catWeekData, activeCats, CAT_COLORS);

  // by vendor
  var vendorTotals = {};
  log.forEach(function(e) {
    if (!vendorTotals[e.vendorName]) vendorTotals[e.vendorName] = { net: 0, qty: 0 };
    vendorTotals[e.vendorName].net += (e.price * (parseInt(e.split)||30) / 100) * e.qty;
    vendorTotals[e.vendorName].qty += e.qty;
  });
  var vsorted = Object.entries(vendorTotals).sort(function(a,b){ return b[1].net - a[1].net; });
  var maxVNet = vsorted.length ? vsorted[0][1].net : 1;
  var bvEl = document.getElementById('rev-by-vendor');
  if (bvEl) {
    bvEl.innerHTML = vsorted.length ? vsorted.map(function(kv) {
      var pct = maxVNet > 0 ? Math.round(kv[1].net / maxVNet * 100) : 0;
      return '<div class="rev-rank-row">' +
        '<div class="rev-rank-name">' + esc(kv[0]) + '</div>' +
        '<div class="rev-rank-bar-wrap"><div class="rev-rank-bar" style="width:' + pct + '%"></div></div>' +
        '<div class="rev-rank-val">$' + kv[1].net.toLocaleString() + '</div>' +
      '</div>';
    }).join('') : '<div style="color:var(--muted);font-family:DM Mono,monospace;font-size:9px;padding:12px 0">No sales yet.</div>';
  }
}


function revDrawCatChart(canvasId, catWeekData, activeCats, colors) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var W = canvas.offsetWidth || 300;
  var H = 160;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  var n = 4;
  var pad = { top: 16, bottom: 28, left: 44, right: 8 };
  var chartW = W - pad.left - pad.right;
  var chartH = H - pad.top - pad.bottom;
  var groupW = chartW / n;
  var barW = Math.max(10, Math.floor(groupW * 0.5));
  var isDark = !document.body.classList.contains('light-mode');
  var textColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)';
  var gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';

  // get week totals for y scale
  var weekTotals = [0,0,0,0];
  activeCats.forEach(function(cat) {
    catWeekData[cat].forEach(function(v, wi) { weekTotals[wi] += v; });
  });
  var maxVal = Math.max.apply(null, weekTotals.concat([1]));

  // grid
  [0.5, 1].forEach(function(f) {
    var y = pad.top + chartH * (1 - f);
    ctx.strokeStyle = gridColor; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillStyle = textColor; ctx.font = '8px DM Mono, monospace'; ctx.textAlign = 'right';
    var lbl = maxVal * f >= 1000 ? '$' + Math.round(maxVal*f/1000)+'k' : '$'+Math.round(maxVal*f);
    ctx.fillText(lbl, pad.left - 3, y + 3);
  });

  // stacked bars
  var CATS_ORDER = ['Clothing','Accessories','Jewelry','Objects','Art / Print','Other'];
  var colors_map = {'Clothing':'#a8c4d4','Accessories':'#88c98a','Jewelry':'#e2c97e','Objects':'#c4a8d4','Art / Print':'#d4a8b8','Other':'#888'};
  for (var wi = 0; wi < n; wi++) {
    var cx = pad.left + groupW * wi + groupW / 2;
    var stackY = pad.top + chartH;
    activeCats.forEach(function(cat) {
      var val = catWeekData[cat][wi] || 0;
      if (!val) return;
      var bH = (val / maxVal) * chartH;
      stackY -= bH;
      var col = colors_map[cat] || '#888';
      ctx.fillStyle = isDark ? col + 'bb' : col + 'cc';
      ctx.fillRect(cx - barW/2, stackY, barW, bH);
    });
    ctx.fillStyle = textColor; ctx.font = '8px DM Mono, monospace'; ctx.textAlign = 'center';
    ctx.fillText('Wk ' + (wi+1), cx, H - 8);
  }

  // legend
  var lx = pad.left;
  activeCats.slice(0,4).forEach(function(cat) {
    var col = colors_map[cat] || '#888';
    ctx.fillStyle = isDark ? col + 'bb' : col + 'cc';
    ctx.fillRect(lx, 5, 8, 8);
    ctx.fillStyle = textColor; ctx.font = '7px DM Mono, monospace'; ctx.textAlign = 'left';
    ctx.fillText(cat.length > 8 ? cat.slice(0,8) : cat, lx + 11, 12);
    lx += Math.max(50, cat.length * 5 + 16);
  });
}

function revDrawBarChart(canvasId, grossArr, netArr, labels) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var W = canvas.offsetWidth || 300;
  var H = 160;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  var n = labels.length;
  var maxVal = Math.max.apply(null, grossArr.concat([1]));
  var pad = { top: 16, bottom: 28, left: 44, right: 8 };
  var chartW = W - pad.left - pad.right;
  var chartH = H - pad.top - pad.bottom;
  var groupW = chartW / n;
  var barW = Math.max(6, Math.floor(groupW * 0.28));
  var isDark = !document.body.classList.contains('light-mode');
  var textColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)';
  var gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';

  [0.5, 1].forEach(function(f) {
    var y = pad.top + chartH * (1 - f);
    ctx.strokeStyle = gridColor; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillStyle = textColor; ctx.font = '8px DM Mono, monospace'; ctx.textAlign = 'right';
    var lbl = maxVal * f >= 1000 ? '$' + Math.round(maxVal*f/1000)+'k' : '$'+Math.round(maxVal*f);
    ctx.fillText(lbl, pad.left - 3, y + 3);
  });

  for (var i = 0; i < n; i++) {
    var cx = pad.left + groupW * i + groupW / 2;
    var gH = maxVal > 0 ? (grossArr[i] / maxVal) * chartH : 0;
    var nH = maxVal > 0 ? (netArr[i]   / maxVal) * chartH : 0;
    ctx.fillStyle = isDark ? 'rgba(168,196,212,0.2)' : 'rgba(168,196,212,0.3)';
    ctx.fillRect(cx - barW - 1, pad.top + chartH - gH, barW, gH);
    ctx.fillStyle = isDark ? 'rgba(136,201,138,0.75)' : 'rgba(136,201,138,0.9)';
    ctx.fillRect(cx + 1, pad.top + chartH - nH, barW, nH);
    ctx.fillStyle = textColor; ctx.font = '8px DM Mono, monospace'; ctx.textAlign = 'center';
    ctx.fillText(labels[i], cx, H - 8);
  }
}

function initRevProj() {
  revData = null;
  getRevData();
  revShowTab('catalog', document.getElementById('rev-tab-catalog'));
  // bind document-level delegation once
  if (!document._revBound) {
    document._revBound = true;
    document.addEventListener('input', function(e) {
      var t = e.target;
      if (t.dataset.role !== 'rev-field') return;
      revUpdate(parseInt(t.dataset.vid), t.dataset.iid ? parseInt(t.dataset.iid) : null, t.dataset.field, t.value);
    });
    document.addEventListener('change', function(e) {
      var t = e.target;
      if (t.dataset.role !== 'rev-field') return;
      revUpdate(parseInt(t.dataset.vid), t.dataset.iid ? parseInt(t.dataset.iid) : null, t.dataset.field, t.value);
    });
    document.addEventListener('click', function(e) {
      var t = e.target;
      if (t.dataset.role === 'rev-del-item')   revDelItem(parseInt(t.dataset.vid), parseInt(t.dataset.iid));
      if (t.dataset.role === 'rev-del-vendor') revDelVendor(parseInt(t.dataset.vid));
      if (t.dataset.role === 'rev-add-item')   revAddItem(parseInt(t.dataset.vid));
      if (t.dataset.role === 'rev-add-vendor') revAddVendor();
    });
  }
}

// ═══ FRONT SPLIT NAV ═════════════════════════════════════════════
var _frontSide = 'popup';
function switchFrontSide(side, btn) {
  document.querySelectorAll('.front-side-bar').forEach(function(b){ b.classList.remove('active'); });
  document.querySelectorAll('.front-split-btn').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  var bar = document.getElementById('front-' + side + '-bar');
  if (bar) bar.classList.add('active');
  // If entering Brand section, default to 334 Pop Up Brand
  if (side === 'retail') {
    switchBrand('popup', document.getElementById('brand-sw-popup'));
    return;
  }
  var firstTab = bar ? bar.querySelector('.tab') : null;
  if (firstTab) {
    var tabName = firstTab.dataset.tab;
    showTab('front', tabName, firstTab);
  }
}
function switchBrand(brand, btn) {
  document.querySelectorAll('.brand-switch-btn').forEach(function(b){ b.classList.remove('active'); });
  document.querySelectorAll('.brand-sub-bar').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  var bar = document.getElementById('brand-bar-' + brand);
  if (bar) bar.classList.add('active');
  var firstTab = bar ? bar.querySelector('.tab') : null;
  if (firstTab) {
    var tabName = firstTab.dataset.tab;
    showTab('front', tabName, firstTab);
  }
}

function showView(project, tab) {
  const ws = document.getElementById('page-' + project);
  if (!ws) return;
  ws.querySelectorAll('.ws-view').forEach(v => v.classList.remove('active'));
  const view = document.getElementById(project + '-' + tab);
  if (view) view.classList.add('active');
}

function jumpTo(project, tab, group) {
  // find and click the right group button
  const nav = document.getElementById(project + '-nav');
  const groupBtn = Array.from(nav.querySelectorAll('.group-btn')).find(b => b.dataset.group === group);
  if (groupBtn) showGroup(project, group, groupBtn);
  // then activate correct sub-tab
  setTimeout(() => {
    const subBar = document.getElementById(project + '-subbar');
    const tabBtn = subBar ? Array.from(subBar.querySelectorAll('.tab')).find(b => b.dataset.tab === tab) : null;
    if (tabBtn) showTab(project, tab, tabBtn);
    else showView(project, tab);
  }, 10);
}

// ─── TODAY TAB ────────────────────────
function getTodayData(project) {
  try { return JSON.parse(localStorage.getItem('today_' + project + '_v1') || '{}'); } catch { return {}; }
}
function saveTodayData(project, d) { localStorage.setItem('today_' + project + '_v1', JSON.stringify(d)); }
function saveTodayField(project, key, value) {
  const d = getTodayData(project); d[key] = value; saveTodayData(project, d);
}

function getTasks(project) {
  try { return JSON.parse(localStorage.getItem('tasks_' + project + '_v1') || '[]'); } catch { return []; }
}
function saveTasks(project, d) { localStorage.setItem('tasks_' + project + '_v1', JSON.stringify(d)); }

function getBlockers(project) {
  try { return JSON.parse(localStorage.getItem('blockers_' + project + '_v1') || '[]'); } catch { return []; }
}
function saveBlockers(project, d) { localStorage.setItem('blockers_' + project + '_v1', JSON.stringify(d)); }

function addTask(project) {
  const tasks = getTasks(project);
  const id = Date.now();
  tasks.push({ id, text: '', done: false });
  saveTasks(project, tasks);
  renderTasks(project);
  setTimeout(() => document.getElementById('task-' + id)?.focus(), 30);
}

function renderTasks(project) {
  const list = document.getElementById(project + '-task-list');
  const count = document.getElementById(project + '-task-count');
  if (!list) return;
  const tasks = getTasks(project);
  const done = tasks.filter(t => t.done).length;
  if (count) count.textContent = done + '/' + tasks.length + ' done';
  list.innerHTML = tasks.map(t => `
    <div class="task-item${t.done?' done':''}" id="titem-${t.id}">
      <button class="task-check" onclick="toggleTask('${project}',${t.id})">${t.done?'✓':''}</button>
      <textarea class="task-text" id="task-${t.id}" placeholder="Add a task…" oninput="updateTask('${project}',${t.id},this.value);autoResize(this)">${esc(t.text)}</textarea>
      <button class="task-del" onclick="deleteTask('${project}',${t.id})">✕</button>
    </div>`).join('');
  list.querySelectorAll('.task-text').forEach(autoResize);
}

function toggleTask(project, id) {
  const tasks = getTasks(project);
  const t = tasks.find(x => x.id === id);
  if (t) { t.done = !t.done; saveTasks(project, tasks); renderTasks(project); }
}
function updateTask(project, id, value) {
  const tasks = getTasks(project);
  const t = tasks.find(x => x.id === id);
  if (t) { t.text = value; saveTasks(project, tasks); }
}
function deleteTask(project, id) { saveTasks(project, getTasks(project).filter(t => t.id !== id)); renderTasks(project); }
function clearDoneTasks(project) { saveTasks(project, getTasks(project).filter(t => !t.done)); renderTasks(project); }

function addBlocker(project) {
  const blockers = getBlockers(project);
  const id = Date.now();
  blockers.push({ id, text: '' });
  saveBlockers(project, blockers);
  renderBlockers(project);
  setTimeout(() => document.getElementById('blocker-' + id)?.focus(), 30);
}
function renderBlockers(project) {
  const container = document.getElementById(project + '-blocker-list');
  if (!container) return;
  const blockers = getBlockers(project);
  container.innerHTML = blockers.map(b => `
    <div class="blocker-item">
      <div class="blocker-dot"></div>
      <textarea class="blocker-input" id="blocker-${b.id}" placeholder="What's in the way?" oninput="updateBlocker('${project}',${b.id},this.value);autoResize(this)">${esc(b.text)}</textarea>
      <button class="task-del" onclick="deleteBlocker('${project}',${b.id})">✕</button>
    </div>`).join('');
  container.querySelectorAll('.blocker-input').forEach(autoResize);
}
function updateBlocker(project, id, value) {
  const bs = getBlockers(project); const b = bs.find(x => x.id === id);
  if (b) { b.text = value; saveBlockers(project, bs); }
}
function deleteBlocker(project, id) { saveBlockers(project, getBlockers(project).filter(b => b.id !== id)); renderBlockers(project); }

function autoResize(ta) { ta.style.height = 'auto'; ta.style.height = Math.max(24, ta.scrollHeight) + 'px'; }


// ─── FOCUS ARCHIVE ────────────────────
function getFocusLog(project) {
  try { return JSON.parse(localStorage.getItem('focus_log_' + project + '_v1') || '[]'); } catch { return []; }
}
function saveFocusLog(project, log) {
  localStorage.setItem('focus_log_' + project + '_v1', JSON.stringify(log));
}

function todayDateKey() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

// Called on init: if the stored focus is from a previous day, archive it
function archiveFocusIfNewDay(project) {
  const data    = getTodayData(project);
  const lastKey = data.focusDate;
  const todayKey = todayDateKey();

  if (lastKey && lastKey !== todayKey && data.focus && data.focus.trim()) {
    // Archive the old focus
    const log = getFocusLog(project);
    // Only add if not already logged for that date
    if (!log.find(e => e.date === lastKey)) {
      log.unshift({ date: lastKey, text: data.focus.trim() });
      // Keep last 90 days
      saveFocusLog(project, log.slice(0, 90));
    }
    // Clear today's focus for the new day
    data.focus = '';
    data.focusDate = todayKey;
    saveTodayData(project, data);
    const el = document.getElementById(project + '-focus');
    if (el) el.value = '';
  } else if (!lastKey) {
    // First time — stamp today
    data.focusDate = todayKey;
    saveTodayData(project, data);
  }
}

// Override saveTodayField to also stamp the date when saving focus
const _origSaveTodayField = saveTodayField;
saveTodayField = function(project, key, value) {
  _origSaveTodayField(project, key, value);
  if (key === 'focus') {
    const d = getTodayData(project);
    d.focusDate = todayDateKey();
    saveTodayData(project, d);
  }
};

function renderFocusHistory(project) {
  const panel = document.getElementById('focus-history-' + project);
  if (!panel) return;
  const log = getFocusLog(project);
  if (!log.length) {
    panel.innerHTML = '<div class="focus-history-empty">No past focuses yet — check back tomorrow.</div>';
    return;
  }
  panel.innerHTML = log.map(function(e) {
    const d  = new Date(e.date + 'T12:00:00');
    const label = d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
    return '<div class="focus-history-item">' +
      '<span class="focus-history-date">' + label + '</span>' +
      '<span class="focus-history-text">' + e.text.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</span>' +
      '</div>';
  }).join('');
}

function toggleFocusHistory(project) {
  const panel  = document.getElementById('focus-history-' + project);
  const chev   = document.getElementById('focus-chev-' + project);
  const isOpen = panel.classList.contains('open');
  if (!isOpen) renderFocusHistory(project);
  panel.classList.toggle('open', !isOpen);
  if (chev) chev.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
}

function initFocusArchive() {
  ['front', 'fog'].forEach(function(p) {
    archiveFocusIfNewDay(p);
  });
}

function setTodayDate() {
  const d = new Date().toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
  ['front','fog'].forEach(p => {
    const el = document.getElementById('today-date-' + p);
    if (el) el.textContent = d;
    const focusEl = document.getElementById(p + '-focus');
    const saved = getTodayData(p).focus;
    if (focusEl && saved) focusEl.value = saved;
  });
}

// ─── PROJECT TRACKER ──────────────────

// Cat colors for calendar chips
const TRACKER_CATS = [
  { value:'build',   label:'Build / plan',    dot:'cat-dot-build',   color:'#a8c4d4' },
  { value:'legal',   label:'Legal',            dot:'cat-dot-legal',   color:'#d4a8a8' },
  { value:'money',   label:'Money / funding',  dot:'cat-dot-money',   color:'#88c98a' },
  { value:'space',   label:'Space / venue',    dot:'cat-dot-space',   color:'#c9a8d4' },
  { value:'brand',   label:'Brand / story',    dot:'cat-dot-brand',   color:'#e2c97e' },
  { value:'people',  label:'People / vendors', dot:'cat-dot-people',  color:'#82bfbb'  },
  { value:'product', label:'Product',          dot:'cat-dot-product', color:'#d4b896' },
  { value:'other',   label:'Other',            dot:'cat-dot-other',   color:'#8899aa' },
];
const BOARD_COLS   = ['todo','inprogress','blocked','done'];
const STATUS_LABELS = { todo:'To Do', inprogress:'In Progress', blocked:'Blocked', done:'Done' };

// State
let trackerView   = 'board';     // board | month | week | day
let trackerFilter = 'all';       // all | front | popup
let calCursor     = new Date();  // drives month/week/day navigation
let editingTask   = null;        // { project, id } currently in modal

// ─ data helpers ───────────────────────
function getMilestones(project) {
  try { return JSON.parse(localStorage.getItem('tracker_' + project + '_v1') || '[]'); } catch { return []; }
}
function saveMilestones(project, d) { localStorage.setItem('tracker_' + project + '_v1', JSON.stringify(d)); }

function getAllTasks() {
  const projects = trackerFilter === 'all'   ? ['front','popup']
                 : trackerFilter === 'front' ? ['front']
                 : ['popup'];
  return projects.flatMap(p => getMilestones(p).map(m => ({ ...m, project: p })));
}

function catColor(catVal) {
  return (TRACKER_CATS.find(c => c.value === catVal) || TRACKER_CATS[0]).color;
}
function catDot(catVal) {
  return (TRACKER_CATS.find(c => c.value === catVal) || TRACKER_CATS[0]).dot;
}

// ─ date utils ─────────────────────────
function isoDate(d) { return d.toISOString().slice(0,10); }
function sameDay(a, b) { return isoDate(a) === isoDate(b); }
function today0() { const t = new Date(); t.setHours(0,0,0,0); return t; }

function formatDueLabel(dateStr) {
  if (!dateStr) return '';
  const today = today0();
  const d = new Date(dateStr + 'T00:00:00');
  const diff = Math.round((d - today) / 86400000);
  if (diff < 0)   return Math.abs(diff) + 'd overdue';
  if (diff === 0) return 'due today';
  if (diff === 1) return 'due tomorrow';
  if (diff <= 7)  return 'due in ' + diff + 'd';
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric' });
}
function dueClass(dateStr, done) {
  if (done || !dateStr) return 'fine';
  const diff = Math.round((new Date(dateStr+'T00:00:00') - today0()) / 86400000);
  if (diff < 0)  return 'overdue';
  if (diff <= 7) return 'is-today';
  return 'fine';
}

// ─ view / filter switching ────────────
function setTrackerView(view, btn) {
  if (view === 'schedule') {
    document.querySelectorAll('[id^="tr-view-"]').forEach(function(v) { v.style.display = 'none'; });
    document.querySelectorAll('.tr-view-tab').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    document.getElementById('tr-view-schedule').style.display = 'block';
    document.getElementById('tr-cal-nav').style.display = 'none';
    setTimeout(renderPopupSchedule, 20);
    return;
  }
  trackerView = view;
  document.querySelectorAll('.tr-view-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tr-view-board').style.display = view === 'board' ? '' : 'none';
  document.getElementById('tr-view-month').style.display = view === 'month' ? '' : 'none';
  document.getElementById('tr-view-week').style.display  = view === 'week'  ? '' : 'none';
  document.getElementById('tr-view-day').style.display   = view === 'day'   ? '' : 'none';
  const nav = document.getElementById('tr-cal-nav');
  if (nav) nav.style.display = view === 'board' ? 'none' : 'flex';
  calCursor = today0();
  refreshTracker();
}

function setTrackerFilter(filter, btn) {
  trackerFilter = filter;
  document.querySelectorAll('.tr-filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  refreshTracker();
}

function calNav(dir) {
  if (trackerView === 'month') {
    calCursor = new Date(calCursor.getFullYear(), calCursor.getMonth() + dir, 1);
  } else if (trackerView === 'week') {
    calCursor = new Date(calCursor); calCursor.setDate(calCursor.getDate() + dir * 7);
  } else if (trackerView === 'day') {
    calCursor = new Date(calCursor); calCursor.setDate(calCursor.getDate() + dir);
  }
  refreshTracker();
}
function calToday() { calCursor = today0(); refreshTracker(); }

function refreshTracker() {
  if (trackerView === 'board') {
    renderBoardFiltered();
  } else if (trackerView === 'month') {
    renderCalMonth();
  } else if (trackerView === 'week') {
    renderCalWeek();
  } else if (trackerView === 'day') {
    renderCalDay();
  }
}

// ─ BOARD VIEW ─────────────────────────
function addMilestone(project)           { addMilestoneToCol(project, 'todo'); }
function addTrackerItem()                { addMilestoneToCol(trackerFilter === 'popup' ? 'popup' : 'front', 'todo'); }

function addMilestoneToCol(project, status) {
  const items = getMilestones(project);
  const id = Date.now();
  const due = new Date(); due.setDate(due.getDate() + 14);
  items.push({ id, title:'', notes:'', cat:'build', due: isoDate(due), done: status==='done', status });
  saveMilestones(project, items);
  openTaskModal(project, id);
}

function toggleCard(id) {
  const card = document.getElementById('mcard-' + id);
  if (card) card.classList.toggle('expanded');
}


// ─── COLUMN COLLAPSE ──────────────────
const collapsedCols = new Set();

function toggleColCollapse(headerEl) {
  const col = headerEl.closest('.board-col');
  if (!col) return;
  const status = col.dataset.status;
  if (col.classList.contains('collapsed')) {
    col.classList.remove('collapsed');
    collapsedCols.delete(status);
  } else {
    col.classList.add('collapsed');
    collapsedCols.add(status);
  }
}


function autoGrowTitle(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

// Run on board render to size existing titles
function initTitleHeights() {
  document.querySelectorAll('.m-card-title-input').forEach(function(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  });
}

function renderBoardFiltered() {
  // merge projects for board legend + counts but keep separate stores
  const projects = trackerFilter === 'popup' ? ['popup']
                 : trackerFilter === 'front' ? ['front']
                 : ['front','popup'];

  // Legend
  const legend = document.getElementById('tracker-legend');
  if (legend) legend.innerHTML = TRACKER_CATS.map(c =>
    `<div class="cat-legend-item"><div class="cat-legend-dot ${c.dot}"></div>${c.label}</div>`
  ).join('');

  BOARD_COLS.forEach(status => {
    const col   = document.getElementById('front-col-' + status);
    const count = document.getElementById('col-count-front-' + status);
    if (!col) return;

    const colItems = projects
      .flatMap(p => getMilestones(p).map(m => ({ ...m, _project: p })))
      .filter(m => (m.status || 'todo') === status)
      .sort((a,b) => {
        if (!a.due && !b.due) return 0;
        if (!a.due) return 1; if (!b.due) return -1;
        return new Date(a.due) - new Date(b.due);
      });

    if (count) count.textContent = colItems.length;
    if (!colItems.length) { col.innerHTML = ''; return; }

    const otherCols = BOARD_COLS.filter(s => s !== status);
    col.innerHTML = colItems.map(m => {
      const cat      = TRACKER_CATS.find(c => c.value === m.cat) || TRACKER_CATS[0];
      const dc       = dueClass(m.due, status === 'done');
      const dueLabel = m.due ? formatDueLabel(m.due) : '';
      const proj     = m._project;
      const projBadge = trackerFilter === 'all'
        ? `<span style="font-size:7px;font-family:DM Mono,monospace;letter-spacing:0.08em;text-transform:uppercase;opacity:0.6;margin-left:auto;padding-left:6px;color:${proj==='popup'?'#a8c4d4':'var(--front)'}">${proj==='popup'?'334 Broome':'The Front'}</span>`
        : '';
      const moveButtons = otherCols.map(s =>
        `<button class="m-move-btn${s==='done'?' done-btn':''}" onclick="event.stopPropagation();moveMilestone('${proj}',${m.id},'${s}')">${STATUS_LABELS[s]}</button>`
      ).join('');

      return `<div class="m-card${status==='done'?' done-card':''}" id="mcard-${m.id}" onclick="toggleCard(${m.id})">
        <button class="m-card-quick-del" onclick="event.stopPropagation();deleteMilestone('${proj}',${m.id})" title="Delete task">✕</button>
        <div class="m-card-top">
          <div class="m-card-cat-dot ${cat.dot}" style="margin-top:3px;flex-shrink:0"></div>
          <textarea class="m-card-title-input" id="mt-${m.id}" placeholder="What needs to happen…"
            onclick="event.stopPropagation()"
            oninput="autoGrowTitle(this);updateMilestone('${proj}',${m.id},'title',this.value)"
            style="${status==='done'?'text-decoration:line-through;opacity:0.5':''}"
            rows="1">${esc(m.title)}</textarea>
          ${projBadge}
        </div>
        ${dueLabel?`<div class="m-card-due ${dc}">${dueLabel}</div>`:''}
        <div class="m-card-detail">
          <div class="m-card-detail-grid">
            <div class="m-detail-field">
              <label>Category</label>
              <select class="m-detail-select" onclick="event.stopPropagation()" onchange="updateMilestone('${proj}',${m.id},'cat',this.value)">
                ${TRACKER_CATS.map(c=>`<option value="${c.value}"${m.cat===c.value?' selected':''}>${c.label}</option>`).join('')}
              </select>
            </div>
            <div class="m-detail-field">
              <label>Due date</label>
              <input class="m-detail-input" type="date" value="${esc(m.due)}" onclick="event.stopPropagation()"
                onchange="updateMilestone('${proj}',${m.id},'due',this.value)">
            </div>
            <div class="m-detail-field" style="grid-column:1/-1">
              <label>Notes</label>
              <textarea class="m-detail-notes" onclick="event.stopPropagation()"
                oninput="updateMilestone('${proj}',${m.id},'notes',this.value)"
                placeholder="Details, dependencies, context…">${esc(m.notes)}</textarea>
            </div>
          </div>
          <div class="m-card-actions" onclick="event.stopPropagation()">
            <span style="font-size:8px;color:var(--muted);letter-spacing:0.1em;text-transform:uppercase;margin-right:4px">Move →</span>
            ${moveButtons}
            <button class="m-del-btn" onclick="deleteMilestone('${proj}',${m.id})">✕</button>
          </div>
        </div>
      </div>`;
    }).join('');
  });
  renderWeekDue('front');
  setTimeout(initTitleHeights, 0);
}

function renderBoard(project) { renderBoardFiltered(); }

function moveMilestone(project, id, newStatus) {
  const items = getMilestones(project);
  const m = items.find(x => x.id === id);
  if (m) { m.status = newStatus; m.done = newStatus === 'done'; saveMilestones(project, items); renderBoardFiltered(); }
}
function updateMilestone(project, id, field, value) {
  const items = getMilestones(project);
  const m = items.find(x => x.id === id);
  if (m) { m[field] = value; saveMilestones(project, items); }
  renderBoardFiltered();
  renderWeekDue('front');
}
function deleteMilestone(project, id) {
  saveMilestones(project, getMilestones(project).filter(m => m.id !== id));
  renderBoardFiltered();
  showToast('Task deleted', 'var(--muted)');
}

// ─ TASK EDIT MODAL ────────────────────
function openTaskModal(project, id) {
  const items = getMilestones(project);
  const m = items.find(x => x.id === id);
  if (!m) return;
  editingTask = { project, id };

  const isNew = !m.title;
  const html = `<div class="task-modal-overlay" id="task-modal-overlay" onclick="if(event.target===this)closeTaskModal(false)">
    <div class="task-modal">
      <div class="task-modal-title">${isNew ? 'New task' : 'Edit task'}</div>
      <div class="task-modal-field">
        <label>Title</label>
        <input class="task-modal-input" id="tmi-title" value="${esc(m.title)}" placeholder="What needs to happen…" autofocus>
      </div>
      <div class="task-modal-row">
        <div class="task-modal-field">
          <label>Project</label>
          <select class="task-modal-select" id="tmi-project">
            <option value="front" ${project==='front'?'selected':''}>The Front</option>
            <option value="popup" ${project==='popup'?'selected':''}>334 Broome</option>
          </select>
        </div>
        <div class="task-modal-field">
          <label>Status</label>
          <select class="task-modal-select" id="tmi-status">
            ${BOARD_COLS.map(s=>`<option value="${s}"${(m.status||'todo')===s?' selected':''}>${STATUS_LABELS[s]}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="task-modal-row">
        <div class="task-modal-field">
          <label>Category</label>
          <select class="task-modal-select" id="tmi-cat">
            ${TRACKER_CATS.map(c=>`<option value="${c.value}"${m.cat===c.value?' selected':''}>${c.label}</option>`).join('')}
          </select>
        </div>
        <div class="task-modal-field">
          <label>Due date</label>
          <input class="task-modal-input" type="date" id="tmi-due" value="${esc(m.due)}">
        </div>
      </div>
      <div class="task-modal-field">
        <label>Notes</label>
        <textarea class="task-modal-textarea" id="tmi-notes" placeholder="Details, context, dependencies…">${esc(m.notes)}</textarea>
      </div>
      <div class="task-modal-actions">
        ${!isNew?`<button class="task-modal-delete" onclick="deleteTaskFromModal()">Delete</button>`:''}
        <button class="task-modal-cancel" onclick="closeTaskModal(false)">Cancel</button>
        <button class="task-modal-save" onclick="saveTaskModal()">Save</button>
      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  setTimeout(() => document.getElementById('tmi-title')?.focus(), 50);
}

function saveTaskModal() {
  if (!editingTask) return;
  const { project: oldProject, id } = editingTask;
  const newProject = document.getElementById('tmi-project').value;
  const title  = document.getElementById('tmi-title').value;
  const status = document.getElementById('tmi-status').value;
  const cat    = document.getElementById('tmi-cat').value;
  const due    = document.getElementById('tmi-due').value;
  const notes  = document.getElementById('tmi-notes').value;

  // If project changed, move the task
  if (newProject !== oldProject) {
    const oldItems = getMilestones(oldProject).filter(m => m.id !== id);
    saveMilestones(oldProject, oldItems);
    const newItems = getMilestones(newProject);
    newItems.push({ id, title, status, cat, due, notes, done: status==='done' });
    saveMilestones(newProject, newItems);
  } else {
    const items = getMilestones(oldProject);
    const m = items.find(x => x.id === id);
    if (m) { m.title = title; m.status = status; m.cat = cat; m.due = due; m.notes = notes; m.done = status==='done'; }
    saveMilestones(oldProject, items);
  }
  closeTaskModal(true);
}

function deleteTaskFromModal() {
  if (!editingTask) return;
  if (!confirm('Delete this task?')) return;
  const { project, id } = editingTask;
  saveMilestones(project, getMilestones(project).filter(m => m.id !== id));
  closeTaskModal(true);
}

function closeTaskModal(refresh) {
  const overlay = document.getElementById('task-modal-overlay');
  if (overlay) overlay.remove();
  editingTask = null;
  if (refresh) refreshTracker();
}

// ─ MONTH CALENDAR ─────────────────────
function renderCalMonth() {
  const container = document.getElementById('tr-cal-month');
  if (!container) return;

  const label = document.getElementById('tr-cal-label');
  if (label) label.textContent = calCursor.toLocaleDateString('en-US',{month:'long',year:'numeric'});

  const year = calCursor.getFullYear(), month = calCursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const today = today0();

  const tasks = getAllTasks();

  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let html = `<div class="cal-month-grid">
    ${DAYS.map(d=>`<div class="cal-dow">${d}</div>`).join('')}`;

  // blank cells before 1st
  for (let i=0; i<startDow; i++) {
    html += `<div class="cal-day other-month"></div>`;
  }

  for (let day=1; day<=daysInMonth; day++) {
    const d = new Date(year, month, day);
    const ds = isoDate(d);
    const isToday = sameDay(d, today);
    const dayTasks = tasks.filter(m => m.due === ds);
    const maxShow = 3;
    const extra = dayTasks.length - maxShow;

    html += `<div class="cal-day${isToday?' today':''}">
      <div class="cal-day-num">${day}</div>
      ${dayTasks.slice(0,maxShow).map(m => {
        const col = catColor(m.cat);
        const done = m.status === 'done';
        return `<div class="cal-task-chip${done?' done-chip':''}"
          style="background:${col}18;color:${col};border-left-color:${col}"
          onclick="openTaskModal('${m.project}',${m.id})" title="${esc(m.title)}"
          >${esc(m.title)||'(untitled)'}</div>`;
      }).join('')}
      ${extra > 0 ? `<div class="cal-more">+${extra} more</div>` : ''}
    </div>`;
  }

  // trailing blanks to complete 7-column grid
  const totalCells = startDow + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;
  for (let i=0; i<trailing; i++) html += `<div class="cal-day other-month"></div>`;

  html += `</div>`;
  container.innerHTML = html;
}

// ─ WEEK CALENDAR ──────────────────────
function renderCalWeek() {
  const container = document.getElementById('tr-cal-week');
  if (!container) return;

  // Find Monday of the week containing calCursor
  const dow = calCursor.getDay(); // 0=Sun
  const monday = new Date(calCursor);
  monday.setDate(calCursor.getDate() - ((dow + 6) % 7));

  const label = document.getElementById('tr-cal-label');
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
  if (label) {
    const fmt = d => d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
    label.textContent = fmt(monday) + ' – ' + fmt(sunday);
  }

  const today = today0();
  const tasks  = getAllTasks();
  const DAYS   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  let html = `<div class="cal-week-grid">`;
  for (let i=0; i<7; i++) {
    const d   = new Date(monday); d.setDate(monday.getDate() + i);
    const ds  = isoDate(d);
    const isToday = sameDay(d, today);
    const dayTasks = tasks.filter(m => m.due === ds);

    html += `<div class="cal-week-col${isToday?' today':''}">
      <div class="cal-week-col-header">
        <div class="cal-week-dow">${DAYS[i]}</div>
        <div class="cal-week-date">${d.getDate()}</div>
      </div>
      <div class="cal-week-tasks">
        ${dayTasks.map(m => {
          const col  = catColor(m.cat);
          const done = m.status === 'done';
          return `<div class="cal-task-chip${done?' done-chip':''}"
            style="background:${col}18;color:${col};border-left-color:${col};white-space:normal;line-height:1.3"
            onclick="openTaskModal('${m.project}',${m.id})"
            >${esc(m.title)||'(untitled)'}</div>`;
        }).join('')}
      </div>
    </div>`;
  }
  html += `</div>`;
  container.innerHTML = html;
}

// ─ DAY CALENDAR ───────────────────────
function renderCalDay() {
  const container = document.getElementById('tr-cal-day');
  if (!container) return;

  const today = today0();
  const label = document.getElementById('tr-cal-label');
  if (label) label.textContent = calCursor.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});

  const ds = isoDate(calCursor);
  const tasks = getAllTasks().filter(m => m.due === ds)
    .sort((a,b) => { const order = ['todo','inprogress','blocked','done']; return order.indexOf(a.status)-order.indexOf(b.status); });

  if (!tasks.length) {
    container.innerHTML = `<div class="cal-day-view">
      <div class="cal-day-empty">No tasks due on this day.</div>
      <button class="add-milestone-btn" style="margin-top:12px" onclick="addTaskOnDay('${ds}')">+ Add task for this day</button>
    </div>`;
    return;
  }

  let html = `<div class="cal-day-view">`;
  tasks.forEach(m => {
    const col  = catColor(m.cat);
    const cat  = TRACKER_CATS.find(c=>c.value===m.cat)||TRACKER_CATS[0];
    const done = m.status === 'done';
    const projLabel = m.project === 'popup' ? '334 Broome' : 'The Front';
    const projCls   = m.project === 'popup' ? 'project-badge-popup' : 'project-badge-front';
    html += `<div class="cal-day-task${done?' done-task':''}"
      style="background:${col}12;border-left-color:${col}"
      onclick="openTaskModal('${m.project}',${m.id})">
      <div>
        <div class="cal-day-task-title">${esc(m.title)||'(untitled)'}</div>
        <div class="cal-day-task-meta">
          <span style="color:${col}">${cat.label}</span>
          <span class="${projCls}">${projLabel}</span>
          <span style="color:var(--muted)">${STATUS_LABELS[m.status||'todo']}</span>
        </div>
      </div>
    </div>`;
  });
  html += `<button class="add-milestone-btn" style="margin-top:16px" onclick="addTaskOnDay('${ds}')">+ Add task for this day</button>`;
  html += `</div>`;
  container.innerHTML = html;
}

function addTaskOnDay(ds) {
  const project = trackerFilter === 'popup' ? 'popup' : 'front';
  const items = getMilestones(project);
  const id = Date.now();
  items.push({ id, title:'', notes:'', cat:'build', due: ds, done:false, status:'todo' });
  saveMilestones(project, items);
  openTaskModal(project, id);
}

// ─ WEEKLY OVERVIEW (Today tab) ──────
function renderWeekDue(project) {
  const container = document.getElementById(project + '-week-due');
  if (!container) return;
  const today = today0();
  const cutoff = new Date(today); cutoff.setDate(today.getDate() + 7);
  const items = getMilestones(project)
    .filter(m => m.status !== 'done' && !m.done && m.due)
    .filter(m => new Date(m.due + 'T00:00:00') <= cutoff)
    .sort((a,b) => new Date(a.due) - new Date(b.due));
  if (!items.length) { container.innerHTML = '<div class="week-empty">Nothing due in the next 7 days.</div>'; return; }
  container.innerHTML = '<div class="week-due-list">' +
    items.map(m => {
      const diff = Math.round((new Date(m.due+'T00:00:00') - today) / 86400000);
      const cls  = diff < 0 ? 'overdue' : diff === 0 ? 'is-today' : 'upcoming';
      return `<div class="week-due-item" onclick="jumpTo('front','tracker','build')">
        <span class="week-due-date ${cls}">${formatDueLabel(m.due)}</span>
        <span class="week-due-title">${esc(m.title)||'(untitled)'}</span>
      </div>`;
    }).join('') + '</div>';
}


// ─── VENDORS ──────────────────────────
const VENDOR_DISCIPLINES = ['Clothing','Accessories','Jewelry','Ceramics','Textiles','Objects','Art / Print','Other'];
let vendorCatFilter  = 'all';
let vendorViewMode   = 'list';   // 'list' | 'gallery'

function getVendors() {
  try { return JSON.parse(localStorage.getItem('front_vendors_v1') || '[]'); } catch { return []; }
}
function saveVendors(v) { localStorage.setItem('front_vendors_v1', JSON.stringify(v)); }

function setVendorView(mode, btn, store) {
  if (store === 'front') {
    vendorViewMode = mode;
    document.querySelectorAll('#vview-list-btn, #vview-gallery-btn').forEach(b => b.classList.remove('active'));
    renderVendors();
  } else {
    popupVendorViewMode = mode;
    document.querySelectorAll('#pvview-list-btn, #pvview-gallery-btn').forEach(b => b.classList.remove('active'));
    renderPopupVendors();
  }
  btn.classList.add('active');
}

function addVendor() {
  const vendors = getVendors();
  const id = Date.now();
  vendors.push({ id, name:'', discipline:'Clothing', status:'prospect', email:'', instagram:'', website:'', commissionRate:'', notes:'', cyclesParticipated:'', priceRange:'', photos:[] });
  saveVendors(vendors);
  renderVendors();
  setTimeout(() => {
    const card = document.getElementById('vcard-' + id);
    if (card) { card.classList.add('open'); card.querySelector('input')?.focus(); card.scrollIntoView({ behavior:'smooth', block:'center' }); }
  }, 50);
}

function filterVendorCat(cat, btn) {
  vendorCatFilter = cat;
  document.querySelectorAll('#vendor-cat-tabs .vendor-cat-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderVendors();
}

function compressImage(file, maxSize, quality) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function pickVendorPhotos(id, store) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.onchange = async () => {
    const files = Array.from(input.files);
    const getF  = store === 'popup' ? getPopupVendors  : getVendors;
    const saveF = store === 'popup' ? savePopupVendors : saveVendors;
    const vendors = getF();
    const v = vendors.find(x => x.id === id);
    if (!v) return;
    if (!v.photos) v.photos = [];
    const slots = 9 - v.photos.length;
    if (slots <= 0) { alert('Max 9 photos per vendor'); return; }
    const toProcess = files.slice(0, slots);
    showToast('Compressing ' + toProcess.length + ' photo' + (toProcess.length > 1 ? 's' : '') + '…', '#8899aa');
    try {
      for (const file of toProcess) {
        const compressed = await compressImage(file, 600, 0.75);
        v.photos.push(compressed);
      }
      saveF(vendors);
    } catch(e) {
      if (e.name === 'QuotaExceededError' || (e.message && e.message.includes('quota'))) {
        alert('Storage full even after compression. Try deleting some vendors or exporting + clearing data.');
        return;
      }
    }
    if (store === 'popup') renderPopupVendors(); else renderVendors();
    showToast('Photos added ✓', '#88c98a');
  };
  input.click();
}

function removeVendorPhoto(id, idx, store) {
  const getF  = store === 'popup' ? getPopupVendors  : getVendors;
  const saveF = store === 'popup' ? savePopupVendors : saveVendors;
  const vendors = getF();
  const v = vendors.find(x => x.id === id);
  if (v && v.photos) { v.photos.splice(idx, 1); saveF(vendors); }
  if (store === 'popup') renderPopupVendors(); else renderVendors();
}

async function handleVendorDrop(event, id, store) {
  const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  if (!files.length) return;
  const getF  = store === 'popup' ? getPopupVendors  : getVendors;
  const saveF = store === 'popup' ? savePopupVendors : saveVendors;
  const vendors = getF();
  const v = vendors.find(x => x.id === id);
  if (!v) return;
  if (!v.photos) v.photos = [];
  const slots = 9 - v.photos.length;
  if (slots <= 0) { alert('Max 9 photos per vendor'); return; }
  const toProcess = files.slice(0, slots);
  showToast('Compressing ' + toProcess.length + ' photo' + (toProcess.length > 1 ? 's' : '') + '…', '#8899aa');
  try {
    for (const file of toProcess) {
      const compressed = await compressImage(file, 600, 0.75);
      v.photos.push(compressed);
    }
    saveF(vendors);
  } catch(e) {
    if (e.name === 'QuotaExceededError' || (e.message && e.message.includes('quota'))) {
      alert('Storage full. Try deleting some vendors or exporting + clearing data.');
      return;
    }
  }
  if (store === 'popup') renderPopupVendors(); else renderVendors();
  // Re-open the card after re-render
  const pfx = store === 'popup' ? 'pv' : 'v';
  document.getElementById(pfx + 'card-' + id)?.classList.add('open');
  showToast('Photos added ✓', '#88c98a');
}

function buildVendorCard(v, store) {
  const pfx   = store === 'popup' ? 'pv' : 'v';
  const updFn = store === 'popup' ? 'updatePopupVendorField' : 'updateVendorField';
  const delFn = store === 'popup' ? 'deletePopupVendor'      : 'deleteVendor';
  const togFn = store === 'popup' ? 'togglePopupVendor'      : 'toggleVendor';
  const toastColor = store === 'popup' ? '#a8c4d4' : '#c9a8d4';
  const photos = v.photos || [];
  const statusLabel = v.status === 'signed' ? (store === 'popup' ? 'confirmed' : 'signed') : v.status;
  const heroPhoto = photos[0] || '';

  const allPhotoSlots = photos.map((src, idx) => `
    <div class="vendor-photo-slot">
      <img src="${esc(src)}" alt="">
      <button class="vendor-photo-remove" onclick="event.stopPropagation();removeVendorPhoto(${v.id},${idx},'${store}')">✕</button>
    </div>`).join('');

  const igDisplay = v.instagram ? (v.instagram.startsWith('@') ? v.instagram : '@' + v.instagram) : '';

  const commissionField = store === 'popup'
    ? `<div class="vendor-field"><label>Participation fee</label><input value="${esc(v.fee||v.commissionRate||'')}" placeholder="e.g. $200 for the full run" oninput="${updFn}(${v.id},'fee',this.value)"></div>`
    : `<div class="vendor-field"><label>Commission / fee</label><input value="${esc(v.commissionRate)}" placeholder="e.g. 30% + $200/cycle" oninput="${updFn}(${v.id},'commissionRate',this.value)"></div>
       <div class="vendor-field"><label>Cycles</label><input value="${esc(v.cyclesParticipated)}" placeholder="e.g. Spring 2024" oninput="${updFn}(${v.id},'cyclesParticipated',this.value)"></div>`;

  return `
    <div class="vendor-card" id="${pfx}card-${v.id}">
      <div class="vendor-row" onclick="${togFn}(${v.id})">
        <div class="vendor-row-img"
          ondragover="event.preventDefault();event.stopPropagation();this.classList.add('dragover')"
          ondragleave="this.classList.remove('dragover')"
          ondrop="event.preventDefault();event.stopPropagation();this.classList.remove('dragover');handleVendorDrop(event,${v.id},'${store}')">
          ${heroPhoto
            ? `<img src="${esc(heroPhoto)}" alt="${esc(v.name)}">`
            : `<div class="vendor-row-img-empty" onclick="event.stopPropagation();pickVendorPhotos(${v.id},'${store}')">+</div>`}
        </div>
        <div class="vendor-row-info">
          <div class="vendor-row-name">${esc(v.name) || '<span style="color:var(--muted);font-style:italic">Unnamed</span>'}</div>
          <div class="vendor-row-meta">
            <span class="vendor-status status-${v.status}">${statusLabel}</span>
            ${v.priceRange ? `<span class="vendor-row-price">${esc(v.priceRange)}</span>` : ''}
          </div>
          ${igDisplay ? `<div class="vendor-row-ig"><a href="https://instagram.com/${esc((v.instagram||'').replace('@',''))}" target="_blank" onclick="event.stopPropagation()">${esc(igDisplay)}</a></div>` : ''}
        </div>
      </div>
      <div class="vendor-body">
        <div class="vendor-expand-grid">
          <div class="vendor-expand-images">
            <div class="vendor-hero-zone" id="${pfx}hero-${v.id}"
              ondragover="event.preventDefault();this.classList.add('dragover')"
              ondragleave="this.classList.remove('dragover')"
              ondrop="event.preventDefault();this.classList.remove('dragover');handleVendorDrop(event,${v.id},'${store}')">
              ${heroPhoto
                ? `<img src="${esc(heroPhoto)}" alt="${esc(v.name)}">`
                : `<div class="vendor-hero-placeholder">
                     <div class="vendor-hero-placeholder-icon">+</div>
                     <div class="vendor-hero-placeholder-text">
                       Drag & drop images<br>
                       or <span onclick="event.stopPropagation();pickVendorPhotos(${v.id},'${store}')">browse files</span>
                     </div>
                   </div>`}
            </div>
            ${photos.length > 1 ? `<div class="vendor-photos-grid">${allPhotoSlots}</div>` : ''}
            <button class="vendor-photo-upload-btn" onclick="event.stopPropagation();pickVendorPhotos(${v.id},'${store}')">+ Add photos</button>
          </div>
          <div class="vendor-expand-fields">
            <div class="vendor-field"><label>Name</label><input value="${esc(v.name)}" placeholder="Designer / brand name" oninput="${updFn}(${v.id},'name',this.value)"></div>
            <div class="vendor-field"><label>Discipline</label>
              <select onchange="${updFn}(${v.id},'discipline',this.value)">
                ${VENDOR_DISCIPLINES.map(d=>`<option value="${d}"${(v.discipline||'Other')===d?' selected':''}>${d}</option>`).join('')}
              </select>
            </div>
            <div class="vendor-field"><label>Price range</label><input value="${esc(v.priceRange||'')}" placeholder="e.g. $50 – $300" oninput="${updFn}(${v.id},'priceRange',this.value)"></div>
            <div class="vendor-field"><label>Status</label>
              <select onchange="${updFn}(${v.id},'status',this.value)">
                <option value="prospect"${v.status==='prospect'?' selected':''}>Prospect</option>
                <option value="reached"${v.status==='reached'?' selected':''}>Reached out</option>
                <option value="signed"${v.status==='signed'?' selected':''}>${store==='popup'?'Confirmed':'Signed'}</option>
                <option value="past"${v.status==='past'?' selected':''}>Past</option>
              </select>
            </div>
            <div class="vendor-field"><label>Contact name</label><input value="${esc(v.contactName||'')}" placeholder="Primary contact" oninput="${updFn}(${v.id},'contactName',this.value)"></div>
            <div class="vendor-field"><label>Email</label><input value="${esc(v.email)}" placeholder="email@…" oninput="${updFn}(${v.id},'email',this.value)"></div>
            <div class="vendor-field"><label>Instagram</label><input value="${esc(v.instagram)}" placeholder="@handle" oninput="${updFn}(${v.id},'instagram',this.value)"></div>
            <div class="vendor-field"><label>Website</label><input value="${esc(v.website)}" placeholder="https://…" oninput="${updFn}(${v.id},'website',this.value)"></div>
            ${commissionField}
            <div class="vendor-field full"><label>Notes</label><textarea placeholder="How you met, what they make, relevant context…" oninput="${updFn}(${v.id},'notes',this.value)">${esc(v.notes)}</textarea></div>
            <div class="vendor-actions">
              <button class="vendor-save-btn" onclick="event.stopPropagation();showToast('Saved ✓','${toastColor}')">Save ✓</button>
              <button class="vendor-delete-btn" onclick="event.stopPropagation();${delFn}(${v.id})">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function buildGallery(vendors, store) {
  // group vendors by discipline
  const groups = {};
  VENDOR_DISCIPLINES.forEach(d => { groups[d] = []; });
  vendors.forEach(v => {
    const d = v.discipline || 'Other';
    if (!groups[d]) groups[d] = [];
    const photos = v.photos || [];
    photos.forEach(url => {
      groups[d].push({ url, name: v.name || '(unnamed)', discipline: d, id: v.id, store });
    });
  });
  const renderedGroups = VENDOR_DISCIPLINES.filter(d => groups[d] && groups[d].length);
  if (!renderedGroups.length) {
    return `<div class="vgallery-empty">No photos yet — open a vendor card and add work photos.</div>`;
  }
  return renderedGroups.map(discipline => `
    <div class="vgallery-group">
      <div class="vgallery-group-header">${discipline}</div>
      <div class="vendor-gallery">${groups[discipline].map(item => `
        <div class="vgallery-item" onclick="${store==='popup'?'togglePopupVendor':'toggleVendor'}(${item.id})">
          <img src="${esc(item.url)}" alt="${esc(item.name)}" loading="lazy" onerror="this.closest('.vgallery-item').style.display='none'">
          <div class="vgallery-caption">
            <div class="vgallery-name">${esc(item.name)}</div>
          </div>
        </div>`).join('')}
      </div>
    </div>`).join('');
}

function renderVendors() {
  const list = document.getElementById('vendor-list');
  if (!list) return;
  const statusFilter = document.getElementById('vendor-status-filter')?.value || 'all';
  let vendors = getVendors();
  if (statusFilter !== 'all') vendors = vendors.filter(v => v.status === statusFilter);
  if (vendorCatFilter !== 'all') vendors = vendors.filter(v => (v.discipline || 'Other') === vendorCatFilter);

  if (!vendors.length) {
    list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);font-size:11px;font-family:\'Cormorant Garamond\',serif;font-style:italic">No vendors yet — click \"+ Add vendor\" to start.</div>';
    return;
  }

  if (vendorViewMode === 'gallery') {
    list.innerHTML = buildGallery(vendors, 'front');
    return;
  }

  const groups = {};
  VENDOR_DISCIPLINES.forEach(d => { groups[d] = []; });
  vendors.forEach(v => {
    const d = v.discipline || 'Other';
    if (!groups[d]) groups[d] = [];
    groups[d].push(v);
  });
  VENDOR_DISCIPLINES.forEach(d => { if (groups[d]) groups[d].sort((a,b) => (a.name||'').localeCompare(b.name||'')); });

  const showHeaders = vendorCatFilter === 'all';
  const renderedGroups = VENDOR_DISCIPLINES.filter(d => groups[d] && groups[d].length);

  list.innerHTML = renderedGroups.map(discipline => {
    const slug = discipline.replace(/[^a-z0-9]/gi,'_');
    const collapsed = frontVendorCollapsed[slug] ? 'collapsed' : '';
    const cards = groups[discipline].map(v => buildVendorCard(v, 'front')).join('');
    const header = showHeaders ? `<div class="vendor-group-header" onclick="toggleFrontVendorGroup('${slug}',this)">
        <span class="vendor-group-label">${discipline}</span>
        <span class="vendor-group-count">${groups[discipline].length}</span>
        <span class="vendor-group-chevron">›</span>
      </div>` : '';
    const tableHeader = `<div class="vendor-table-header">
      <div></div>
      <div>Vendor name</div>
      <div>Price</div>
      <div>Status</div>
      <div>Instagram</div>
      <div></div>
    </div>`;
    const maxH = collapsed ? '0' : '9999px';
    return `<div class="vendor-group ${collapsed}" id="fvgroup-${slug}">
      ${header}
      <div class="vendor-group-cards" style="max-height:${maxH}">${tableHeader}${cards}</div>
    </div>`;
  }).join('');
}

function toggleVendor(id) { document.getElementById('vcard-' + id)?.classList.toggle('open'); }
function updateVendorField(id, field, value) {
  const vendors = getVendors();
  const v = vendors.find(x => x.id === id);
  if (v) { v[field] = value; saveVendors(vendors); }
  if (field === 'status' || field === 'discipline') renderVendors();
}
function deleteVendor(id) {
  if (!confirm('Delete this vendor?')) return;
  saveVendors(getVendors().filter(v => v.id !== id));
  renderVendors();
}

// ─── POPUP VENDORS (334 Broome — separate store) ──────────────────
let popupVendorCatFilter  = 'all';
let popupVendorViewMode   = 'list';

function getPopupVendors() {
  try { return JSON.parse(localStorage.getItem('popup_vendors_v1') || '[]'); } catch { return []; }
}
function savePopupVendors(v) { localStorage.setItem('popup_vendors_v1', JSON.stringify(v)); }

function addPopupVendor() {
  const vendors = getPopupVendors();
  const id = Date.now();
  vendors.push({ id, name:'', discipline:'Clothing', status:'prospect', email:'', instagram:'', website:'', fee:'', notes:'', priceRange:'', photos:[] });
  savePopupVendors(vendors);
  renderPopupVendors();
  setTimeout(() => {
    const card = document.getElementById('pvcard-' + id);
    if (card) { card.classList.add('open'); card.querySelector('input')?.focus(); card.scrollIntoView({ behavior:'smooth', block:'center' }); }
  }, 50);
}

function filterPopupVendorCat(cat, btn) {
  popupVendorCatFilter = cat;
  document.querySelectorAll('#pvendor-cat-tabs .vendor-cat-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderPopupVendors();
}

function renderPopupVendors() {
  const list = document.getElementById('popup-vendor-list');
  if (!list) return;
  const statusFilter = document.getElementById('pvendor-status-filter')?.value || 'all';
  let vendors = getPopupVendors();
  if (statusFilter !== 'all') vendors = vendors.filter(v => v.status === statusFilter);
  if (popupVendorCatFilter !== 'all') vendors = vendors.filter(v => (v.discipline || 'Other') === popupVendorCatFilter);

  if (!vendors.length) {
    list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);font-size:11px;font-family:\'Cormorant Garamond\',serif;font-style:italic">No vendors yet — click \"+ Add vendor\" to start.</div>';
    return;
  }

  if (popupVendorViewMode === 'gallery') {
    list.innerHTML = buildGallery(vendors, 'popup');
    return;
  }

  const groups = {};
  VENDOR_DISCIPLINES.forEach(d => { groups[d] = []; });
  vendors.forEach(v => {
    const d = v.discipline || 'Other';
    if (!groups[d]) groups[d] = [];
    groups[d].push(v);
  });
  VENDOR_DISCIPLINES.forEach(d => { if (groups[d]) groups[d].sort((a,b) => (a.name||'').localeCompare(b.name||'')); });

  const showHeaders = popupVendorCatFilter === 'all';
  const renderedGroups = VENDOR_DISCIPLINES.filter(d => groups[d] && groups[d].length);

  list.innerHTML = renderedGroups.map(discipline => {
    const slug = discipline.replace(/[^a-z0-9]/gi,'_');
    const collapsed = popupVendorCollapsed[slug] ? 'collapsed' : '';
    const cards = groups[discipline].map(v => buildVendorCard(v, 'popup')).join('');
    const header = showHeaders ? `<div class="vendor-group-header" onclick="togglePopupVendorGroup('${slug}',this)">
        <span class="vendor-group-label">${discipline}</span>
        <span class="vendor-group-count">${groups[discipline].length}</span>
        <span class="vendor-group-chevron">›</span>
      </div>` : '';
    const tableHeader = `<div class="vendor-table-header">
      <div></div>
      <div>Vendor name</div>
      <div>Price</div>
      <div>Status</div>
      <div>Instagram</div>
      <div></div>
    </div>`;
    const maxH = collapsed ? '0' : '9999px';
    return `<div class="vendor-group ${collapsed}" id="pvgroup-${slug}">
      ${header}
      <div class="vendor-group-cards" style="max-height:${maxH}">${tableHeader}${cards}</div>
    </div>`;
  }).join('');
}


// ── Vendor group collapse ─────────────────────────────────────
var popupVendorCollapsed = {};
var frontVendorCollapsed = {};

function togglePopupVendorGroup(slug, headerEl) {
  popupVendorCollapsed[slug] = !popupVendorCollapsed[slug];
  var group = document.getElementById('pvgroup-' + slug);
  var cards = group && group.querySelector('.vendor-group-cards');
  if (!group) return;
  if (popupVendorCollapsed[slug]) {
    group.classList.add('collapsed');
    if (cards) cards.style.maxHeight = '0';
  } else {
    group.classList.remove('collapsed');
    if (cards) cards.style.maxHeight = '9999px';
  }
}

function toggleFrontVendorGroup(slug, headerEl) {
  frontVendorCollapsed[slug] = !frontVendorCollapsed[slug];
  var group = document.getElementById('fvgroup-' + slug);
  var cards = group && group.querySelector('.vendor-group-cards');
  if (!group) return;
  if (frontVendorCollapsed[slug]) {
    group.classList.add('collapsed');
    if (cards) cards.style.maxHeight = '0';
  } else {
    group.classList.remove('collapsed');
    if (cards) cards.style.maxHeight = '9999px';
  }
}

function togglePopupVendor(id) { document.getElementById('pvcard-' + id)?.classList.toggle('open'); }
function updatePopupVendorField(id, field, value) {
  const vendors = getPopupVendors();
  const v = vendors.find(x => x.id === id);
  if (v) { v[field] = value; savePopupVendors(vendors); }
  if (field === 'status' || field === 'discipline') renderPopupVendors();
}
function deletePopupVendor(id) {
  if (!confirm('Delete this vendor?')) return;
  savePopupVendors(getPopupVendors().filter(v => v.id !== id));
  renderPopupVendors();
}

function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }


// ─── REFERENCES ───────────────────────


// ─── WEEK DUE COLLAPSE ────────────────
const weekDueOpen = { front: true, fog: true };

function toggleWeekDue(project) {
  weekDueOpen[project] = !weekDueOpen[project];
  const body     = document.getElementById(project + '-week-due-body');
  const chevron  = document.getElementById(project + '-week-due-chevron');
  const open     = weekDueOpen[project];
  if (body) {
    body.style.maxHeight = open ? body.scrollHeight + 'px' : '0';
    body.style.maxHeight = open ? '600px' : '0';
  }
  if (chevron) {
    chevron.style.transform = open ? 'rotate(90deg)' : 'rotate(0deg)';
  }
}

// Init: set open state on page load
function initWeekDueCollapse() {
  ['front','fog'].forEach(function(p) {
    const body = document.getElementById(p + '-week-due-body');
    const chevron = document.getElementById(p + '-week-due-chevron');
    if (body) body.style.maxHeight = '600px';
    if (chevron) chevron.style.transform = 'rotate(90deg)';
  });
}

function initToday() {
  initFocusArchive();
  ['front','fog'].forEach(p => { renderTasks(p); renderBlockers(p); renderWeekDue(p); });
  initWeekDueCollapse();
  renderBoardFiltered();
  setTodayDate();
  ['front','fog'].forEach(p => {
    const subBar = document.getElementById(p + '-subbar');
    if (subBar) subBar.innerHTML = '';
  });
}
initToday();



// ─── FORM LOGIC ────────────────────────
function handleInput(ta, project) {
  const item = ta.closest('.item');
  item.classList.toggle('answered', ta.value.trim().length > 0);
  ta.style.height = 'auto';
  ta.style.height = Math.max(62, ta.scrollHeight) + 'px';
  // find which form this belongs to
  const form = ta.closest('[id^="form-"]');
  if (form) {
    const parts = form.id.replace('form-', '').split('-');
    updateProgress(parts[0], parts.slice(1).join('-'));
  }
}

function updateProgress(project, tab) {
  const form = document.getElementById('form-' + project + '-' + tab);
  if (!form) return;
  const total = form.querySelectorAll('.item').length;
  const answered = form.querySelectorAll('.item.answered').length;
  const pct = total ? Math.round((answered / total) * 100) : 0;
  const bar = document.getElementById('bar-' + project + '-' + tab);
  const count = document.getElementById('count-' + project + '-' + tab);
  if (bar) bar.style.width = pct + '%';
  if (count) count.textContent = answered + ' / ' + total;
}

function clearForm(project, tab) {
  const form = document.getElementById('form-' + project + '-' + tab);
  if (!form) return;
  form.querySelectorAll('.item-input').forEach(ta => { ta.value = ''; ta.style.height = '62px'; });
  form.querySelectorAll('.item').forEach(i => i.classList.remove('answered'));
  const panel = document.getElementById('synthesis-' + project + '-' + tab);
  if (panel) {
    panel.classList.remove('visible');
    panel.querySelector('.synthesis-body').innerHTML = '<div class="synthesis-loading"><div class="pulse"><span></span><span></span><span></span></div><span>Generating your synthesis…</span></div>';
  }
  updateProgress(project, tab);
}

// ─── SUBMIT & SYNTHESIZE ───────────────
async function submitSession(project, tab) {
  const form = document.getElementById('form-' + project + '-' + tab);
  const btn = document.getElementById('btn-' + project + '-' + tab);
  if (!form || !btn) return;

  // collect answers
  const answers = {};
  form.querySelectorAll('.item[data-id]').forEach(item => {
    const id = item.getAttribute('data-id');
    const ta = item.querySelector('.item-input');
    answers[id] = ta ? ta.value.trim() : '';
  });

  const answeredPairs = Object.entries(answers).filter(([,v]) => v);
  if (!answeredPairs.length) { showToast('Answer at least one question first', '#e0845a'); return; }

  // save entry
  const entry = { id: Date.now(), project, tab, timestamp: new Date().toISOString(), answers, synthesis: null };
  const archive = getArchive(project);
  archive.unshift(entry);
  saveArchive(project, archive);

  // show synthesis panel
  const panel = document.getElementById('synthesis-' + project + '-' + tab);
  if (panel) {
    panel.classList.add('visible');
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  btn.disabled = true;
  btn.textContent = 'Generating synthesis…';

  try {
    const qa = answeredPairs.map(([id, val]) => {
      const item = form.querySelector('[data-id="' + id + '"]');
      const label = item ? item.querySelector('.item-label').textContent : id;
      return 'Q: ' + label + '\nA: ' + val;
    }).join('\n\n');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYNTH_SYSTEM[project + '-' + tab] || 'You are a sharp business advisor. Read these founder answers and write a concise 2-3 paragraph synthesis of what they reveal and how to move forward.',
        messages: [{ role: 'user', content: "Here are the founder's session answers:\n\n" + qa + "\n\nWrite your synthesis now." }]
      })
    });

    const data = await res.json();
    const text = data.content.map(b => b.type === 'text' ? b.text : '').join('').trim();

    // update archive entry
    const updated = getArchive(project);
    const idx = updated.findIndex(e => e.id === entry.id);
    if (idx !== -1) { updated[idx].synthesis = text; saveArchive(project, updated); }

    if (panel) {
      panel.querySelector('.synthesis-body').innerHTML =
        '<div class="synthesis-content">' +
        text.split(/\n\n+/).map(p => '<p>' + p.replace(/\n/g,'<br>') + '</p>').join('') +
        '</div>';
    }
  } catch(e) {
    if (panel) {
      panel.querySelector('.synthesis-body').innerHTML =
        '<div class="synthesis-content" style="color:var(--muted);font-style:italic;font-family:\'Cormorant Garamond\',serif;font-size:15px;">Synthesis unavailable right now — your session is saved in Archive.</div>';
    }
  }

  btn.disabled = false;
  btn.textContent = 'Archive & Synthesize →';
  const color = project === 'front' ? 'var(--front)' : 'var(--fog)';
  showToast('Session archived ✓', color);
  clearForm(project, tab);
}

// ─── ARCHIVE ──────────────────────────
function filterArchive(project, filter, btn) {
  archiveFilters[project] = filter;
  const container = document.getElementById('page-' + project);
  container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderArchive(project);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

const TAB_LABELS = { questions: 'Planning', reflect: 'Reflect', action: 'Action', balance: 'Balance' };

function renderArchive(project) {
  const list = document.getElementById('archive-list-' + project);
  const countEl = document.getElementById('archive-count-' + project);
  const filter = archiveFilters[project] || 'all';
  let entries = getArchive(project);
  if (filter !== 'all') entries = entries.filter(e => e.tab === filter);
  countEl.textContent = entries.length + ' session' + (entries.length !== 1 ? 's' : '');

  if (!entries.length) {
    list.innerHTML = '<div class="archive-empty"><span class="archive-empty-icon">◌</span>No sessions yet. Complete any tab and archive it.</div>';
    return;
  }

  const accentColor = project === 'front' ? 'var(--front)' : 'var(--fog)';

  list.innerHTML = entries.map(entry => {
    const tabLabel = TAB_LABELS[entry.tab] || entry.tab;
    const badgeClass = entry.tab === 'questions' ? 'eb-questions-' + project : 'eb-' + entry.tab;
    const answered = Object.values(entry.answers).filter(v => v).length;
    const total = Object.keys(entry.answers).length;

    const synthBlock = entry.synthesis
      ? `<div class="entry-synthesis-block">
           <div class="entry-synthesis-label">Session Synthesis</div>
           <div class="entry-synthesis-text">${entry.synthesis.split(/\n\n+/).map(p=>'<p>'+p+'</p>').join('')}</div>
         </div>`
      : '';

    // group answers into display pairs
    const qas = Object.entries(entry.answers)
      .filter(([,v]) => v)
      .map(([id, val]) => `<div class="entry-qa"><div class="entry-q">${id}</div><div class="entry-a ea-${project}">${val}</div></div>`)
      .join('');

    return `<div class="entry-card" id="card-${entry.id}">
      <div class="entry-card-header" onclick="toggleCard('${entry.id}')">
        <div class="entry-left">
          <span class="entry-badge ${badgeClass}">${tabLabel}</span>
          <span class="entry-date">${formatDate(entry.timestamp)}</span>
        </div>
        <div class="entry-right">
          <span class="entry-count">${answered}/${total}</span>
          <span class="entry-chevron">▼</span>
        </div>
      </div>
      <div class="entry-body">${synthBlock}<div class="entry-section"><div class="entry-section-title">Your answers</div>${qas}</div></div>
    </div>`;
  }).join('');
}

// ─── BUSINESS PLAN ────────────────────
function showBP(id, btn) {
  document.querySelectorAll('.bp-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bp-pill').forEach(b => b.classList.remove('active'));
  document.getElementById('bp-' + id).classList.add('active');
  btn.classList.add('active');
}

function autosaveBP(el) {
  const key = el.dataset.key;
  if (!key) return;
  const data = getBPData();
  data[key] = el.value;
  localStorage.setItem('front_bp_v1', JSON.stringify(data));
}

function autosaveRevRow(el) {
  const key = el.dataset.key;
  if (!key) return;
  const data = getBPData();
  data[key] = el.value;
  localStorage.setItem('front_bp_v1', JSON.stringify(data));
}

function getBPData() {
  try { return JSON.parse(localStorage.getItem('front_bp_v1') || '{}'); } catch { return {}; }
}

function saveBPAll() {
  // already autosaving — just flash confirmation
  ['bp-saved-check','bp-saved-check-par','bp-saved-check-gt','bp-saved-check-inv','fin-saved-check','story-saved-check'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2000); }
  });
  showToast('Saved ✓', '#d4b896');
}

function updateRevTotal(type) {
  const container = document.getElementById('rev-rows-' + type) || document.getElementById('rev-rows-gen');
  if (!container) return;
  const inputs = container.querySelectorAll('input[type="number"]');
  const total = Array.from(inputs).reduce((s, i) => s + (parseFloat(i.value) || 0), 0);
  const label = type === 'costs' ? 'Total monthly costs' : 'Estimated monthly total';
  const el = document.getElementById('rev-total-' + type);
  if (el) el.textContent = label + ': $' + total.toLocaleString();
}

function loadBPData() {
  const data = getBPData();
  document.querySelectorAll('.bp-field[data-key]').forEach(el => {
    if (data[el.dataset.key] !== undefined) el.value = data[el.dataset.key];
  });
  document.querySelectorAll('.funding-notes-input[data-key]').forEach(el => {
    if (data[el.dataset.key] !== undefined) el.value = data[el.dataset.key];
  });
  document.querySelectorAll('.field-input[data-key]').forEach(el => {
    if (data[el.dataset.key] !== undefined) el.value = data[el.dataset.key];
  });
  // all rev row inputs
  document.querySelectorAll('input[data-key]').forEach(inp => {
    if (data[inp.dataset.key] !== undefined) inp.value = data[inp.dataset.key];
  });
  // recalculate all totals
  ['gen','costs','upfront','popup','popup-rev'].forEach(type => updateRevTotal(type));
}

function seedTrackerIfEmpty() {
  const existing = getMilestones('front');
  if (existing.length > 0) return; // don't overwrite if they've already added items
  // Next Thursday from today
  const today = new Date();
  const daysUntilThursday = (4 - today.getDay() + 7) % 7 || 7;
  const nextThursday = new Date(today);
  nextThursday.setDate(today.getDate() + daysUntilThursday);
  const thu = nextThursday.toISOString().slice(0,10);

  // June 1 for popup items
  const jun1 = '2025-06-01';
  const may15 = '2025-05-15';
  const may25 = '2025-05-25';
  const may30 = '2025-05-30';

  const seeds = [
    { id: Date.now()+1,  title: 'Complete general business plan (all sections)', notes: 'Executive summary, model, revenue, market, operations', cat: 'build', due: thu, done: false },
    { id: Date.now()+2,  title: 'Complete Parsons grant version of business plan', notes: 'Align with Parsons alumni pipeline + program framing', cat: 'build', due: thu, done: false },
    { id: Date.now()+3,  title: 'Build out financials — upfront cost estimate', notes: 'Fill in every line in the Financials tab', cat: 'money', due: thu, done: false },
    { id: Date.now()+4,  title: 'Build revenue model + break-even analysis', notes: 'Map commission restructure and monthly numbers', cat: 'money', due: thu, done: false },
    { id: Date.now()+5,  title: 'Confirm vendor lineup for 334 Broome pop-up', notes: 'At least 3–4 confirmed by this date', cat: 'people', due: may15, done: false },
    { id: Date.now()+6,  title: 'Finalize 334 Broome space terms / agreement', notes: 'Get anything in writing', cat: 'legal', due: may15, done: false },
    { id: Date.now()+7,  title: 'Order bags, tags, tissue paper for pop-up', notes: 'Lead time is usually 2–3 weeks minimum', cat: 'brand', due: may15, done: false },
    { id: Date.now()+8,  title: 'Design + order signage for pop-up', notes: 'Vinyl, window graphics — need install lead time', cat: 'brand', due: may25, done: false },
    { id: Date.now()+9,  title: 'Pop-up marketing push — posts, invites, press outreach', notes: 'Start at least 2–3 weeks before opening', cat: 'brand', due: may25, done: false },
    { id: Date.now()+10, title: 'Install / build-out at 334 Broome', notes: '', cat: 'space', due: may30, done: false },
    { id: Date.now()+11, title: '334 Broome opening event', notes: 'Invites, drinks, photographer', cat: 'build', due: jun1, done: false },
    { id: Date.now()+12, title: 'Form LLC + get EIN', notes: 'NY LLC filing ~$200 via DOS', cat: 'legal', due: '2025-04-30', done: false },
    { id: Date.now()+13, title: 'Research Parsons grant application portal + deadline', notes: 'Contact alumni affairs office', cat: 'money', due: thu, done: false },
  ];
  saveMilestones('front', seeds);
}


// ─── REFERENCES ───────────────────────
function getRefData() {
  try { return JSON.parse(localStorage.getItem('front_refs_v1') || '{"mood":[],"spatial":[],"designers":[]}'); } catch { return {mood:[],spatial:[],designers:[]}; }
}
function saveRefData(d) { localStorage.setItem('front_refs_v1', JSON.stringify(d)); }






function showRefBoard(board, btn) {
  document.querySelectorAll('.ref-board').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.ref-board-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('refboard-' + board).classList.add('active');
  btn.classList.add('active');
}

function addRef(board) {
  const input = document.getElementById('ref-url-' + board);
  const url = input.value.trim();
  if (!url) return;
  const data = getRefData();
  data[board].push({ id: Date.now(), url, note: '' });
  saveRefData(data);
  input.value = '';
  renderRefs(board);
}

function renderRefs(board) {
  const data = getRefData();
  const items = data[board] || [];
  const grid = document.getElementById('ref-grid-' + board);
  const empty = document.getElementById('ref-empty-' + board);
  if (!items.length) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  grid.innerHTML = items.map(item => `
    <div class="ref-item" id="ritem-${item.id}">
      <img class="ref-img" src="${esc(item.url)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" alt="">
      <div class="ref-img-placeholder" style="display:none">Image unavailable</div>
      <div class="ref-item-body">
        <div class="ref-item-url">${esc(item.url)}</div>
        <textarea class="ref-item-note" placeholder="What are you pulling from this?" oninput="updateRefNote('${board}',${item.id},this.value)">${esc(item.note)}</textarea>
        <button class="ref-item-del" onclick="deleteRef('${board}',${item.id})">✕ remove</button>
      </div>
    </div>`).join('');
}

function updateRefNote(board, id, value) {
  const data = getRefData();
  const item = (data[board] || []).find(x => x.id === id);
  if (item) { item.note = value; saveRefData(data); }
}
function deleteRef(board, id) {
  const data = getRefData();
  data[board] = (data[board] || []).filter(x => x.id !== id);
  saveRefData(data);
  renderRefs(board);
}
function loadRefs() { ['mood','spatial','designers'].forEach(b => renderRefs(b)); loadArticles(); }


// ─── ARTICLES & LINKS ──────────────────
function getArticles() {
  try { return JSON.parse(localStorage.getItem('front_articles_v1') || '[]'); } catch { return []; }
}
function saveArticles(arr) { localStorage.setItem('front_articles_v1', JSON.stringify(arr)); }

function getDomain(url) {
  try { return new URL(url).hostname.replace('www.',''); } catch { return url; }
}

function addArticle() {
  const input = document.getElementById('ref-url-articles');
  const url = (input.value || '').trim();
  if (!url) return;
  const arts = getArticles();
  arts.unshift({ id: Date.now(), url: url, title: '', note: '' });
  saveArticles(arts);
  input.value = '';
  renderArticles();
}

function updateArticleField(id, field, value) {
  const arts = getArticles();
  const a = arts.find(x => x.id === id);
  if (a) { a[field] = value; saveArticles(arts); }
}

function deleteArticle(id) {
  saveArticles(getArticles().filter(x => x.id !== id));
  renderArticles();
}

function renderArticles() {
  const arts   = getArticles();
  const grid   = document.getElementById('article-grid');
  const empty  = document.getElementById('article-empty');
  if (!grid) return;
  if (!arts.length) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  grid.innerHTML = arts.map(function(a) {
    const domain  = getDomain(a.url);
    const favicon = 'https://www.google.com/s2/favicons?sz=32&domain=' + encodeURIComponent(domain);
    const safeUrl = esc(a.url);
    const safeTitle = esc(a.title);
    const safeNote  = esc(a.note);

    return '<div class="article-card" id="acard-' + a.id + '">' +
      '<div class="article-card-thumb">' +
        '<div class="article-card-thumb-placeholder">' +
          '<img class="article-card-favicon" src="' + favicon + '" alt="">' +
          '<span class="article-card-domain">' + esc(domain) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="article-card-body">' +
        '<textarea class="article-card-title-input" placeholder="Add a title…" rows="1"' +
          ' oninput="updateArticleField(' + a.id + ',"title",this.value)">' + safeTitle + '</textarea>' +
        '<textarea class="article-card-note" placeholder="Why is this relevant? What does it connect to…" rows="2"' +
          ' oninput="updateArticleField(' + a.id + ',"note",this.value)">' + safeNote + '</textarea>' +
        '<a class="article-card-link" href="' + safeUrl + '" target="_blank" rel="noopener">' + esc(domain) + ' ↗</a>' +
      '</div>' +
      '<div class="article-card-actions">' +
        '<button class="article-del-btn" onclick="deleteArticle(' + a.id + ')">✕ remove</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function loadArticles() { renderArticles(); }

// ─── PROGRAMMING ──────────────────────
function getProgData() {
  try { return JSON.parse(localStorage.getItem('front_prog_v1') || '[]'); } catch { return []; }
}
function saveProgData(d) { localStorage.setItem('front_prog_v1', JSON.stringify(d)); }

function addProgramming() {
  const data = getProgData();
  const id = Date.now();
  data.unshift({ id, title: '', phase: 'idea', dateRange: '', theme: '', designers: '', events: '', notes: '' });
  saveProgData(data);
  renderProgramming();
  setTimeout(() => { document.getElementById('prog-' + id)?.classList.add('open'); }, 50);
}

function renderProgramming() {
  const list = document.getElementById('prog-list');
  const data = getProgData();
  if (!data.length) { list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);font-size:11px;font-family:\'Cormorant Garamond\',serif;font-style:italic">No programming added yet.</div>'; return; }
  list.innerHTML = data.map(p => `
    <div class="prog-item" id="prog-${p.id}">
      <div class="prog-item-header" onclick="this.closest('.prog-item').classList.toggle('open')">
        <span class="prog-phase phase-${p.phase}">${p.phase}</span>
        <span class="prog-title">${p.title || '(untitled cycle)'}</span>
        <span class="prog-date">${p.dateRange || ''}</span>
      </div>
      <div class="prog-body">
        <div class="vendor-field"><label>Cycle / event title</label><input value="${esc(p.title)}" placeholder="e.g. Material Futures" oninput="updateProgField(${p.id},'title',this.value)"></div>
        <div class="vendor-field"><label>Status</label>
          <select onchange="updateProgField(${p.id},'phase',this.value)">
            <option value="idea" ${p.phase==='idea'?'selected':''}>Idea</option>
            <option value="upcoming" ${p.phase==='upcoming'?'selected':''}>Upcoming</option>
            <option value="past" ${p.phase==='past'?'selected':''}>Past</option>
          </select>
        </div>
        <div class="vendor-field"><label>Dates / timeframe</label><input value="${esc(p.dateRange)}" placeholder="e.g. March–April 2025" oninput="updateProgField(${p.id},'dateRange',this.value)"></div>
        <div class="vendor-field"><label>Participating designers</label><input value="${esc(p.designers)}" placeholder="Names or TBD" oninput="updateProgField(${p.id},'designers',this.value)"></div>
        <div class="vendor-field full"><label>Theme / concept</label><textarea oninput="updateProgField(${p.id},'theme',this.value)" placeholder="The conceptual anchor for this cycle…">${esc(p.theme)}</textarea></div>
        <div class="vendor-field full"><label>Events within this cycle</label><textarea oninput="updateProgField(${p.id},'events',this.value)" placeholder="Opening, workshop, closing event, talk…">${esc(p.events)}</textarea></div>
        <div class="vendor-field full"><label>Notes</label><textarea oninput="updateProgField(${p.id},'notes',this.value)" placeholder="Learnings, outcomes, press mentions, what to repeat…">${esc(p.notes)}</textarea></div>
        <div class="vendor-actions"><button class="vendor-save-btn" style="background:#a8c4d4" onclick="showToast('Saved ✓','#a8c4d4')">Save ✓</button><button class="vendor-delete-btn" onclick="deleteProg(${p.id})">Delete</button></div>
      </div>
    </div>`).join('');
}

function updateProgField(id, field, value) {
  const data = getProgData();
  const p = data.find(x => x.id === id);
  if (p) { p[field] = value; saveProgData(data); }
  if (field === 'phase' || field === 'title') renderProgramming();
}
function deleteProg(id) {
  if (!confirm('Delete this programming entry?')) return;
  saveProgData(getProgData().filter(p => p.id !== id));
  renderProgramming();
}

// ─── PARTNERSHIPS ─────────────────────
function getPartnerData() {
  try { return JSON.parse(localStorage.getItem('front_partners_v1') || '{"schools":[],"press":[],"brands":[],"orgs":[]}'); }
  catch { return {schools:[],press:[],brands:[],orgs:[]}; }
}
function savePartnerData(d) { localStorage.setItem('front_partners_v1', JSON.stringify(d)); }

function addPartner(section) {
  const data = getPartnerData();
  const id = Date.now();
  data[section].push({ id, name: '', contact: '', email: '', status: '', notes: '' });
  savePartnerData(data);
  renderPartners();
}

function renderPartners() {
  const data = getPartnerData();
  ['schools','press','brands','orgs'].forEach(section => {
    const container = document.getElementById('partners-' + section);
    if (!container) return;
    container.innerHTML = data[section].map(p => `
      <div class="partner-item" id="partner-${p.id}">
        <div class="partner-header">
          <input class="partner-name-input" value="${esc(p.name)}" placeholder="Organisation / name" oninput="updatePartnerField('${section}',${p.id},'name',this.value)">
          <span class="partner-cat">${section}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
          <div class="vendor-field"><label>Contact person</label><input value="${esc(p.contact)}" placeholder="Name / title" oninput="updatePartnerField('${section}',${p.id},'contact',this.value)"></div>
          <div class="vendor-field"><label>Email</label><input value="${esc(p.email)}" placeholder="email@…" oninput="updatePartnerField('${section}',${p.id},'email',this.value)"></div>
          <div class="vendor-field"><label>Status</label><input value="${esc(p.status)}" placeholder="Reached out / In conversation / Confirmed…" oninput="updatePartnerField('${section}',${p.id},'status',this.value)"></div>
          <div class="vendor-field"><label>Notes</label><input value="${esc(p.notes)}" placeholder="Context, next step…" oninput="updatePartnerField('${section}',${p.id},'notes',this.value)"></div>
        </div>
        <div style="margin-top:8px"><button class="vendor-delete-btn" onclick="deletePartner('${section}',${p.id})">Remove</button></div>
      </div>`).join('') || '';
  });
}

function updatePartnerField(section, id, field, value) {
  const data = getPartnerData();
  const p = (data[section] || []).find(x => x.id === id);
  if (p) { p[field] = value; savePartnerData(data); }
}
function deletePartner(section, id) {
  const data = getPartnerData();
  data[section] = (data[section] || []).filter(x => x.id !== id);
  savePartnerData(data);
  renderPartners();
}

// ─── IDEAS ────────────────────────────
function getIdeas() {
  try { return JSON.parse(localStorage.getItem('front_ideas_v1') || '[]'); } catch { return []; }
}
function saveIdeas(d) { localStorage.setItem('front_ideas_v1', JSON.stringify(d)); }

function addIdea() {
  const ideas = getIdeas();
  const id = Date.now();
  ideas.push({ id, text: '' });
  saveIdeas(ideas);
  renderIdeas();
  setTimeout(() => { document.getElementById('idea-' + id)?.focus(); }, 50);
}

function renderIdeas() {
  const list = document.getElementById('ideas-list');
  const ideas = getIdeas();
  list.innerHTML = ideas.map(i => `
    <div class="idea-item">
      <div class="idea-dot"></div>
      <textarea class="idea-input" id="idea-${i.id}" placeholder="What's the idea?" oninput="updateIdea(${i.id},this.value)">${esc(i.text)}</textarea>
      <button class="idea-del" onclick="deleteIdea(${i.id})">✕</button>
    </div>`).join('');
  // auto-resize
  list.querySelectorAll('.idea-input').forEach(ta => { ta.style.height='auto'; ta.style.height=Math.max(28,ta.scrollHeight)+'px'; });
}

function updateIdea(id, value) {
  const ideas = getIdeas();
  const i = ideas.find(x => x.id === id);
  if (i) { i.text = value; saveIdeas(ideas); }
}
function deleteIdea(id) { saveIdeas(getIdeas().filter(x => x.id !== id)); renderIdeas(); }

// ─── INIT ALL NEW TABS ─────────────────
function initNewTabs() {
  seedTrackerIfEmpty();
  loadBPData();
  renderVendors();
  loadRefs();
  renderProgramming();
  renderPartners();
  renderIdeas();
  initBudgets();
  renderPopupVendors();
}
initNewTabs();

// Re-init after Supabase data is pulled (data.js dispatches this event)
window.addEventListener('supabase-ready', function() {
  console.log('[app] Supabase data ready, re-rendering...');
  initNewTabs();
});

// ─── TOAST ────────────────────────────

// ═══ ROADMAP ═════════════════════════════════════════════════════

const ROADMAP_TASKS = {
  'front-w1': [
    {
      id:'fw1-1', day:'Mon', due:'End of Day 1', tag:'space',
      text:'Tour at least 3 spaces — log each one in the Spaces tab immediately after',
      detail: {
        why: 'You cannot make a budget, a design concept, or a mission statement without knowing what size and character of space is realistic. This is the single most grounding action of Week 1.',
        steps: [
          'Book tours in advance — contact brokers or landlords Sunday night before Week 1 starts',
          'Bring your phone for photos, a tape measure, and a notebook',
          'For each space: note ceiling height, natural light (what time of day?), foot traffic you observe, condition of walls/floors, loading/delivery access',
          'Log it in Spaces tab right after each tour while it is fresh — don\'t batch them at the end of the day',
          'Pull neighbourhood context in Spaces tab (the AI button) to get transit, nearby retail, and scene analysis'
        ]
      }
    },
    {
      id:'fw1-2', day:'Mon–Tue', due:'End of Day 2', tag:'space',
      text:'Complete Spaces tab for every space toured: rent, contact, pros/cons, neighbourhood context',
      detail: {
        why: 'A half-logged space lead is useless when you\'re trying to compare options under pressure in Week 2.',
        steps: [
          'For each space: fill in monthly rent, sq ft, broker/landlord contact, date toured',
          'Write 3 pros and 3 cons — be specific, not vague (not "good vibe", but "north-facing windows, diffuse light all day")',
          'Click "Pull neighbourhood context" to get the AI analysis for each address',
          'Note: what would it take for you to say yes to this space?'
        ]
      }
    },
    {
      id:'fw1-3', day:'Tue', due:'End of Day 2', tag:'brand',
      text:'Brand values exercise: write 10 words that describe The Front. Cross out 5. The 5 left are your values.',
      detail: {
        why: 'Your mission statement, your voice, your programming concept, your vendor criteria — all of it flows from knowing what you actually stand for. You cannot write a mission without this.',
        steps: [
          'Set a 10-minute timer. Write 10 words: what should The Front BE? (eg: rigorous, generous, unexpected, intimate, specific, emergent...)',
          'Cross out the 5 that are most generic or that any gallery/store could claim',
          'Look at the 5 that remain — write one sentence: "The Front is ___" using those words',
          'Now write what The Front is NOT — what would feel like a betrayal of the concept?',
          'Post these 5 words somewhere visible at your desk. They are your filter for every decision.'
        ]
      }
    },
    {
      id:'fw1-4', day:'Tue', due:'End of Day 2', tag:'brand',
      text:'Write what The Front is NOT — what you would never want someone to say about it',
      detail: {
        why: 'Knowing what to reject is often clearer than knowing what to pursue. Anti-values sharpen identity faster than aspirational language.',
        steps: [
          'Write 5 sentences starting with "The Front is not..." (eg: not a vintage market, not a pop-up fair, not a gallery that ignores commerce)',
          'Write 3 things a visitor should never feel when they walk in',
          'If someone described The Front as ___, you would be disappointed — fill in that blank 3 times',
          'Pin these next to your values. They protect the concept from mission creep.'
        ]
      }
    },
    {
      id:'fw1-5', day:'Wed', due:'End of Day 3', tag:'brand',
      text:'Pull references: 10 max for spatial, 10 max for mood. Hard stop — no more after this.',
      detail: {
        why: 'Unlimited inspiration is paralysis dressed as productivity. The constraint is the point — it forces you to curate rather than collect.',
        steps: [
          'Set a 90-minute block. Not more.',
          'Spatial references: spaces that have the physical quality you want — not necessarily retail. Can be residential, gallery, studio, restaurant.',
          'Mood references: images that carry the feeling, not the format. Could be a film still, a painting, a garment detail.',
          'For each reference you save, write one sentence about WHY — what specific quality are you pulling from it?',
          'At the end of Wednesday: close the tabs. The references tab is locked.'
        ]
      }
    },
    {
      id:'fw1-6', day:'Wed', due:'End of Day 3', tag:'brand',
      text:'Identify 3 spaces you genuinely admire — study their model, not their aesthetic',
      detail: {
        why: 'Understanding how comparable spaces actually work (economics, community, programming) is more useful at this stage than knowing how they look.',
        steps: [
          'Pick 3: could be The Hole, Printed Matter, Dover Street Market, a studio collective, anything that has the spirit you want',
          'For each: how do they make money? What is their vendor/artist relationship model? How do they programme?',
          'What do people say about them online — what do visitors value about going there?',
          'What would you do differently? What can you learn from their mistakes or their constraints?'
        ]
      }
    },
    {
      id:'fw1-7', day:'Thu', due:'End of Day 4', tag:'money',
      text:'Find 2–3 fabricators or build-out contractors in NYC — names and contact only, no quotes yet',
      detail: {
        why: 'You need names before you need numbers. Build-out is your biggest variable cost and the one most founders underestimate.',
        steps: [
          'Ask: who have other small retail spaces, galleries, or restaurants in NYC used for build-out?',
          'Search: NYC retail fixture fabricator, NYC millwork contractor, NYC gallery buildout',
          'Look at spaces you admire and ask who built their fixtures — Instagram DMs work fine for this',
          'You just need: name, contact, and whether they work at small-space scale. Quotes come in Week 2.'
        ]
      }
    },
    {
      id:'fw1-8', day:'Thu–Fri', due:'End of Week 1', tag:'money',
      text:'Draft rough monthly cost range from spaces toured — populate the Financials tab',
      detail: {
        why: 'You need a number range to work backwards from. Every other financial decision — commission model, vendor fees, grant ask — depends on knowing your rent + ops baseline.',
        steps: [
          'Open Financials tab. For each space: enter the monthly rent you saw.',
          'Add estimated monthly ops: utilities (~$300–600), insurance (~$200–400), internet, basic supplies',
          'What is your minimum viable monthly revenue to break even at the lowest-rent space?',
          'What is it at the highest? That gap tells you how much the space choice matters.',
          'This is a rough range, not a final budget. You refine it in Week 2.'
        ]
      }
    },
    {
      id:'fw1-9', day:'Fri', due:'End of Week 1 — HARD STOP', tag:'stop',
      text:'STOP. Close all inspiration tabs. Lock references. Week 2 is synthesis only.',
      detail: {
        why: 'The single biggest risk to your timeline is infinite research. Every additional reference after this point dilutes what you already have. You have enough.',
        steps: [
          'Close every Pinterest board, Instagram saved folder, and browser tab of references',
          'If something new catches your eye next week: write the name down, do not click into it',
          'You have 10 spatial references and 10 mood references. That is your material. Work with it.',
          'Week 2 rule: no new inspiration. Only making decisions from what you already collected.'
        ]
      }
    },
  ],

  'front-w2': [
    {
      id:'fw2-1', day:'Mon', due:'End of Day 1', tag:'brand',
      text:'Write a first draft mission statement — 2 sentences max. Print it and tape it up.',
      detail: {
        why: 'A draft is not a commitment — it is a stake in the ground. You cannot test, refine, or communicate your concept until you have said it once.',
        steps: [
          'Formula to start: "The Front is a ___ for ___. It exists because ___."',
          'Fill in the blanks with the most specific language you can. Avoid "platform", "community", "space for creativity".',
          'Read it aloud. Does it sound like something only you could say, or something anyone could say?',
          'Print it. Tape it above your desk. You will edit it later — for now it just needs to exist.'
        ]
      }
    },
    {
      id:'fw2-2', day:'Mon–Tue', due:'End of Day 2', tag:'brand',
      text:'Test the mission statement: read it to 2 people. What do they think you are describing?',
      detail: {
        why: 'You live inside your idea. Other people tell you what actually lands.',
        steps: [
          'Pick 2 people: one who knows your world (design, retail), one who does not',
          'Read them your mission statement cold — no context, no preamble',
          'Ask: what do you think this is? Who do you imagine going there? What does it feel like?',
          'The gap between their answer and your intention is exactly what to fix in the language',
          'Do not explain or defend — just listen and write down what they say'
        ]
      }
    },
    {
      id:'fw2-3', day:'Tue', due:'End of Day 2', tag:'brand',
      text:'Draft brand voice: 3 adjectives for how The Front speaks. Write one sample Instagram caption.',
      detail: {
        why: 'Voice is how your mission becomes tangible to people who have never been in the space. It is also a filter for all future copywriting.',
        steps: [
          'Three adjectives: not personality traits — communication qualities. (eg: precise, warm, a little strange)',
          'What does The Front never sound like? (eg: hype, corporate, over-explained)',
          'Write one caption for a fictional product or event — 2–3 sentences',
          'Read it back against your adjectives. Does it match? Adjust the voice or the caption until they align.',
          'Post the 3 adjectives in the Story tab under Brand Voice.'
        ]
      }
    },
    {
      id:'fw2-4', day:'Wed', due:'End of Day 3', tag:'space',
      text:'Shortlist spaces to top 3. Write one specific deal-breaker and one non-negotiable for each.',
      detail: {
        why: 'You cannot pursue 6 spaces in parallel with integrity. Narrowing forces you to know what actually matters.',
        steps: [
          'Review your Spaces tab. Which 3 are you most drawn to — gut first, logic second.',
          'For each of the top 3: what is the one thing that could make you say no? (deal-breaker)',
          'For each: what is the one thing that would make you say yes immediately? (non-negotiable)',
          'If you could only tour one more time before deciding, which would it be and why?',
          'Note: you do not need to decide this week. You need to know the criteria.'
        ]
      }
    },
    {
      id:'fw2-5', day:'Wed–Thu', due:'End of Day 4', tag:'money',
      text:'Contact fabricators — get 3 ballpark estimates for your build concept',
      detail: {
        why: 'Build-out cost is the number founders get wrong most often. A ballpark now prevents a shock later.',
        steps: [
          'Reach out to the 2–3 fabricators you identified in Week 1',
          'Send a brief: rough sq ft, what you need (display fixtures, walls, lighting), your aesthetic reference',
          'Ask for a ballpark range — not a formal quote. You want: "for something like this, we usually see $X–$Y"',
          'Also get a sense of timeline: how long does build-out take at this scale?',
          'Enter the range into your Financials tab startup costs'
        ]
      }
    },
    {
      id:'fw2-6', day:'Thu', due:'End of Day 4', tag:'money',
      text:'Build out Financials tab: startup costs, monthly ops, break-even analysis',
      detail: {
        why: 'The numbers make the concept real. Until you have done this, every other decision is floating.',
        steps: [
          'Startup costs: first + last month rent deposit, build-out range, fixtures, signage, insurance, legal',
          'Monthly ops: rent, utilities, insurance, internet, marketing, any staff or stipends',
          'Revenue model: how many designers, at what fee/commission, to cover monthly ops?',
          'Break-even: at your lowest realistic scenario, how long until revenue covers costs?',
          'This feeds directly into the Parsons grant ask — what specifically does the funding unlock?'
        ]
      }
    },
    {
      id:'fw2-7', day:'Thu', due:'End of Day 4', tag:'people',
      text:'Map your designer/vendor community — who you know, who you need, who to invite first',
      detail: {
        why: 'The Front without designers is a concept. With designers it is a business. Community development starts now.',
        steps: [
          'Write every emerging designer or maker you already know or follow — no filter, just list',
          'Star the ones whose work genuinely fits the concept',
          'Identify the gaps: what mediums or disciplines are missing?',
          'Who are the 5 you would most want for the launch cycle? These are your first outreach targets in Week 3.',
          'Add anyone relevant to the Vendors tab now so you have their info in one place'
        ]
      }
    },
    {
      id:'fw2-8', day:'Fri', due:'End of Week 2', tag:'brand',
      text:'Draft first 3 months of programming: themes, events, activation ideas',
      detail: {
        why: 'Programming is what differentiates The Front from a shop. It is also your grant narrative, your press story, and your designer recruitment pitch.',
        steps: [
          'Month 1 theme: what is the opening statement? What does it say about what The Front is?',
          'Month 2–3: how does it evolve? What changes and what stays?',
          'For each month: one anchor event idea (talk, workshop, opening, collaboration)',
          'Who from your designer list fits each cycle?',
          'Enter this in the Programming tab — even rough notes are better than nothing'
        ]
      }
    },
    {
      id:'fw2-9', day:'Fri', due:'End of Week 2', tag:'ops',
      text:'Fill in Business Plan tab: concept, model, audience, differentiation',
      detail: {
        why: 'The business plan sections inform each other — writing them forces clarity on things you may have been avoiding.',
        steps: [
          'Concept: what is The Front in one paragraph? Use your refined mission statement as the spine.',
          'Model: how does money flow? Vendor fees, commission, events, potential retail of in-house product?',
          'Audience: who specifically? Not "design-lovers" — what does your ideal visitor do, care about, read?',
          'Differentiation: name 3 comparable spaces and say specifically how The Front is different from each'
        ]
      }
    },
  ],

  'front-w3': [
    {
      id:'fw3-1', day:'Mon', due:'End of Day 1', tag:'brand',
      text:'Finalise mission statement — one version, written not typed. This is the real one.',
      detail: {
        why: 'A finalised mission statement is a commitment device. It ends the loop of refinement and starts the loop of execution.',
        steps: [
          'Take your Week 2 draft. Read it one more time against your values and anti-values.',
          'Make one final edit — not ten. Trust what you have built up to this point.',
          'Write it by hand. Something about the physical act of writing it changes how it lands.',
          'Post it in the Story tab. This is now the version you quote to everyone.'
        ]
      }
    },
    {
      id:'fw3-2', day:'Mon–Tue', due:'End of Day 2', tag:'brand',
      text:'Write the Brand Story — origin, vision, the gap you are filling (Story tab)',
      detail: {
        why: 'The brand story is what makes people want to be part of it. It is your grant application opening, your press pitch, your DM to designers.',
        steps: [
          'Origin: why does The Front exist? What did you see missing in NYC? What personal experience drove this?',
          'Vision: what does the world look like if The Front succeeds? Be specific — not "a better design community" but "designers who could not afford a gallery have a sustained platform and income"',
          'The gap: what exists now that fails the people The Front is for? Name it directly.',
          'Write it in first person. 3–4 paragraphs. Post it in Story tab.'
        ]
      }
    },
    {
      id:'fw3-3', day:'Tue', due:'End of Day 2', tag:'space',
      text:'Make the space decision: sign, open negotiations, or move to backup with clear criteria',
      detail: {
        why: 'There is no perfect space. The cost of waiting is always higher than the cost of deciding with imperfect information.',
        steps: [
          'Review your top 3 shortlist from Week 2 against your budget and deal-breakers',
          'If one is clearly right: initiate lease negotiations or letter of intent',
          'If none feel right: what specifically is missing? Is it fixable (negotiable terms) or not (wrong neighbourhood)?',
          'If you are stuck: set a decision deadline of end of day Tuesday and honour it',
          'Whatever you decide: write it down with your reasoning. This is a record of your process, not just an outcome.'
        ]
      }
    },
    {
      id:'fw3-4', day:'Wed', due:'End of Day 3', tag:'brand',
      text:'Translate references into a design brief — one page: what the space should feel like',
      detail: {
        why: 'References are only useful if you can extract principles from them. A brief turns inspiration into instruction.',
        steps: [
          'Look at your 10 spatial references. What do they have in common? List 5 qualities (light, material, scale, density, mood)',
          'Look at your 10 mood references. What emotion or state do they produce? List 3.',
          'Write one page: "The Front should feel like ___. It should not feel like ___. The key spatial qualities are ___."',
          'This brief is what you give to fabricators, collaborators, and yourself when making any physical decision.'
        ]
      }
    },
    {
      id:'fw3-5', day:'Wed–Thu', due:'End of Day 4', tag:'money',
      text:'Complete Parsons grant sections — ask, impact, traction, vision in 3 years',
      detail: {
        why: 'Grant funding removes commercial pressure during the critical early phase. The Parsons application is your most immediate capital opportunity.',
        steps: [
          'Grant ask: specific dollar amount, specific use of funds (rent deposit, build-out contribution, designer stipend)',
          'Impact: who benefits and how? Name the specific designers and the specific gap being addressed',
          'Traction: what have you done already? Pop-ups, community, press, relationships — anything that proves this is real',
          'Vision in 3 years: concrete, not aspirational. Revenue, number of designers supported, expansion, replication.',
          'All of this is in the Business Plan tab under Parsons — fill it in section by section'
        ]
      }
    },
    {
      id:'fw3-6', day:'Thu', due:'End of Day 4', tag:'people',
      text:'Identify and reach out to 5 designers for the launch cycle — personal, specific messages',
      detail: {
        why: 'Your opening roster is your first public statement about what The Front is. Choose intentionally.',
        steps: [
          'From your Week 2 community map, pick your top 5 — diversity of medium and background matters',
          'Write a personal message to each: specific to their work, honest about where you are in the process, clear about what you are asking',
          'Do not send a form email. Each message should contain one thing that is only true of that person.',
          'Be clear: this is an invitation to be part of the launch cycle, here is what it involves, here is the timeline'
        ]
      }
    },
    {
      id:'fw3-7', day:'Thu', due:'End of Day 4', tag:'money',
      text:'Define your commission/fee model and write it down clearly',
      detail: {
        why: 'Designers will ask. Having a clear, fair, written answer signals professionalism and builds trust immediately.',
        steps: [
          'Options: flat monthly fee, commission on sales, hybrid (small fee + lower commission)',
          'Research comparable models: what do other collective spaces charge?',
          'Calculate: at your projected footfall and average sale, what commission rate covers your monthly ops?',
          'Write it as a simple one-pager: what designers pay, what they get, what The Front takes, what they keep',
          'Post it in the Business Plan tab under Model'
        ]
      }
    },
    {
      id:'fw3-8', day:'Fri', due:'End of Week 3 — THE DATE', tag:'ops',
      text:'Set a public launch target date. Tell someone. Write it on the wall.',
      detail: {
        why: 'A launch date that nobody knows about is not a launch date. Accountability comes from making the commitment public.',
        steps: [
          'Pick a realistic date: 8–12 weeks from now is reasonable for a soft launch if space is confirmed',
          'Post it somewhere physical — on the wall, in your calendar, as your phone wallpaper',
          'Tell one person whose opinion you respect: "I am opening on ___"',
          'Work backwards: what has to be true 4 weeks before that date? 2 weeks? 1 week?',
          'Enter it in the Tracker tab as your master milestone'
        ]
      }
    },
  ],

  'popup-w1': [
    {
      id:'pw1-1', day:'Mon', due:'End of Day 1', tag:'people',
      text:'Audit vendor list completely — confirmed, pending, still needed, and any gaps in the lineup',
      detail: {
        why: 'You cannot plan the space, the logistics, or the marketing until you know exactly who is in.',
        steps: [
          'Go through every vendor in the Vendors tab — mark each as confirmed, pending, or maybe',
          'For pending: what is blocking confirmation? Chase those today.',
          'Look at the confirmed list: what is missing? A certain aesthetic, medium, or price point?',
          'Set a deadline for pending vendors: if not confirmed by Wednesday, the spot opens up'
        ]
      }
    },
    {
      id:'pw1-2', day:'Mon–Tue', due:'End of Day 2', tag:'people',
      text:'Send confirmation emails to all confirmed vendors with dates, logistics, and expectations',
      detail: {
        why: 'Verbal confirmations fall apart. A written confirmation with details prevents last-minute chaos.',
        steps: [
          'What to include: exact dates and hours, set-up time, what they are responsible for bringing, how sales work',
          'What you will provide: the space, any shared infrastructure, foot traffic',
          'Ask them to confirm in writing by a specific date',
          'Create a simple shared reference doc or message thread for all vendors to access logistics'
        ]
      }
    },
    {
      id:'pw1-3', day:'Tue', due:'End of Day 2', tag:'brand',
      text:'Define the concept and theme of the 334 Broome pop-up — what is the story of this event?',
      detail: {
        why: 'A pop-up without a concept is just a sale. A concept gives the press a headline, the visitors a reason, and the vendors a shared identity.',
        steps: [
          'In one sentence: what is the 334 Broome pop-up about? Not "emerging designers" — something more specific.',
          'What connects the vendors you have confirmed? Is there a material, an approach, a sensibility?',
          'What do you want someone to say when they leave: "that was a pop-up about ___"',
          'This concept feeds directly into your social media plan and any press outreach'
        ]
      }
    },
    {
      id:'pw1-4', day:'Wed', due:'End of Day 3', tag:'space',
      text:'Walk the 334 Broome space — measure every wall and corner, photograph everything',
      detail: {
        why: 'Layout planning without measurements is guesswork. You will waste time and money on install day without this.',
        steps: [
          'Bring a tape measure. Measure the full floor plan: length, width, ceiling height',
          'Note: where are the electrical outlets? Where is the natural light coming from and at what time?',
          'Photograph every wall, corner, floor condition, and any fixed elements',
          'Note constraints: anything that cannot be moved, covered, or used',
          'Sketch a rough floor plan — even on a napkin. This is what you use for layout planning next.'
        ]
      }
    },
    {
      id:'pw1-5', day:'Wed–Thu', due:'End of Day 4', tag:'space',
      text:'Draft layout plan — assign each vendor a zone, plan shared infrastructure',
      detail: {
        why: 'Vendors arriving to an unplanned space creates conflict and a poor experience. The layout is your hospitality.',
        steps: [
          'Draw the space to rough scale. Assign each confirmed vendor a zone.',
          'Consider: which vendors benefit from being near each other? Who needs a corner vs. a wall?',
          'Shared infrastructure: do you need a central rack, a shared checkout counter, any signage?',
          'What does the visitor flow look like? Where do people enter, how do they move, where do they naturally pause?'
        ]
      }
    },
    {
      id:'pw1-6', day:'Thu', due:'End of Day 4', tag:'ops',
      text:'Confirm exact event dates in writing with building management or landlord',
      detail: {
        why: 'Nothing else can be finalised — marketing, vendor logistics, install schedule — until the dates are locked in writing.',
        steps: [
          'Get confirmation from building management or landlord in writing (email is fine)',
          'Confirm: access hours, load-in times, any restrictions on signage, installation, or noise',
          'If dates are not yet locked: today is the day to make that call or send that email',
          'Once confirmed: update the 334 Broome tracker immediately'
        ]
      }
    },
    {
      id:'pw1-7', day:'Fri', due:'End of Week 1', tag:'money',
      text:'Open 334 Broome Financials and enter every confirmed cost',
      detail: {
        why: 'The pop-up has real costs. Knowing them now prevents a shortfall on install day.',
        steps: [
          'Space cost: is there a rental fee, a revenue share, or is it free? Enter it.',
          'Shared infrastructure: racks, tables, lighting, signage — what needs to be sourced and at what cost?',
          'Marketing: any paid promotion, printing, materials?',
          'Labour: any help you are paying for install, day-of, or breakdown?',
          'What is the minimum you need to break even on the pop-up itself?'
        ]
      }
    },
  ],

  'popup-w2': [
    {
      id:'pw2-1', day:'Mon', due:'End of Day 1 — FINAL LINEUP', tag:'people',
      text:'Lock the final vendor lineup — no more changes after today',
      detail: {
        why: 'Every change after this point creates a cascade of re-planning. The cost of adding or dropping a vendor in Week 2 is higher than the cost of a slightly imperfect lineup.',
        steps: [
          'Any pending vendors who have not confirmed by this morning: their spot is released',
          'If there is a gap in the lineup: is it worth filling or does the concept work without it?',
          'Send a final confirmation to everyone who is in: this is the locked list',
          'Update the Vendors tab with final status for everyone'
        ]
      }
    },
    {
      id:'pw2-2', day:'Mon–Tue', due:'End of Day 2', tag:'people',
      text:'Collect all vendor assets: bio, product description, photo, social handle',
      detail: {
        why: 'You cannot create marketing content without this material. Collecting it last-minute creates bad content.',
        steps: [
          'Send every vendor a simple request: 2–3 sentences about themselves and their work, 2–3 product photos, their Instagram handle',
          'Set a deadline: by Wednesday. This is non-negotiable for their inclusion in marketing.',
          'As assets come in: organise them by vendor. You will use this for posts, a press release, and any printed materials.'
        ]
      }
    },
    {
      id:'pw2-3', day:'Tue–Wed', due:'End of Day 3', tag:'brand',
      text:'Draft the social media plan — what posts, which days, who creates them',
      detail: {
        why: 'Marketing without a plan means posting in a panic the week of the event. A plan means you can execute calmly.',
        steps: [
          'Map the weeks until the event: what moments need a post? (announce, vendor spotlights, countdown, day-of, during, after)',
          'For each post: what is the content, what image, what caption tone?',
          'Vendor spotlights: one per confirmed vendor, using the assets you collected',
          'Who is making the graphics? If it is you: block the time now. If someone else: brief them with the assets.'
        ]
      }
    },
    {
      id:'pw2-4', day:'Wed', due:'End of Day 3', tag:'ops',
      text:'Source shared infrastructure — racks, tables, lighting, signage: ordered or borrowed by Friday',
      detail: {
        why: 'Infrastructure sourcing takes longer than expected. If something needs to be rented, ordered, or built, you need to start now.',
        steps: [
          'From your layout plan: what shared pieces do you need? (clothing racks, display tables, folding tables, lighting)',
          'Options: rent from an event company, borrow from vendors, buy second-hand (FB Marketplace, Craigslist)',
          'For signage: what branding needs to be printed? Entrance sign, vendor labels, price tag format?',
          'Everything needed should be ordered or arranged by end of Friday this week'
        ]
      }
    },
    {
      id:'pw2-5', day:'Thu', due:'End of Day 4', tag:'ops',
      text:'Confirm install schedule — who arrives when, what order, how long set-up takes',
      detail: {
        why: 'Install day without a schedule is chaos. With a schedule it is still hectic but manageable.',
        steps: [
          'When can you access the space before the event opens? This is your install window.',
          'What needs to happen first? (Shared infrastructure, then vendor zones)',
          'Assign each vendor an arrival window: stagger them so they are not all setting up simultaneously',
          'Write it as a simple hour-by-hour: 9am shared infrastructure, 10am first vendor wave, 12pm all vendors in, 1pm final check'
        ]
      }
    },
    {
      id:'pw2-6', day:'Thu–Fri', due:'End of Week 2', tag:'brand',
      text:'Publish the event announcement — Instagram, any press contacts, word of mouth',
      detail: {
        why: 'People need at least 2 weeks notice for a pop-up to actually show up. This is your last responsible moment.',
        steps: [
          'Announcement post: concept, dates, address, what to expect — compelling but not over-explained',
          'Tag every vendor so they can reshare immediately',
          'Press: is there a design or culture writer who covers this world? A short personal email with the concept and date is enough',
          'Word of mouth: send the event details to 10 specific people you want there and ask them to pass it on'
        ]
      }
    },
    {
      id:'pw2-7', day:'Fri', due:'End of Week 2', tag:'money',
      text:'Final budget check — are all costs covered? What is the worst-case scenario?',
      detail: {
        why: 'A budget check now means no surprises on install day when it is too late to fix anything.',
        steps: [
          'Review 334 Broome Financials: every cost entered and categorised?',
          'What is the total cost to run this pop-up regardless of sales?',
          'What is the minimum sales volume to cover costs?',
          'Is there a buffer for unexpected costs? If not, where could you cut?',
          'If you are short: which costs can be reduced or deferred?'
        ]
      }
    },
  ],

  'popup-w3': [
    {
      id:'pw3-1', day:'Mon', due:'End of Day 1', tag:'people',
      text:'All vendor logistics confirmed in writing — every vendor knows exactly what to bring and when',
      detail: {
        why: 'Vendors who are unclear on logistics create problems on install day that cascade.',
        steps: [
          'Send one final logistics summary to all vendors: their arrival time, their zone, what they are responsible for',
          'Confirm: are they bringing their own display furniture or using shared pieces?',
          'Confirm: how will they handle payment on the day? (their own card reader, cash, Venmo?)',
          'Ask each vendor to confirm receipt of this message'
        ]
      }
    },
    {
      id:'pw3-2', day:'Mon–Tue', due:'End of Day 2', tag:'ops',
      text:'Write the install day plan hour by hour — from access to doors-open',
      detail: {
        why: 'The install window is always shorter than you think. An hour-by-hour plan means you make the right tradeoffs.',
        steps: [
          'Start from your access time and work forward to your opening time',
          'First hour: shared infrastructure only (racks, tables, lighting)',
          'Stagger vendor arrivals so no more than 2 are setting up simultaneously',
          'Build in 30 minutes before opening for a final walkthrough and fixing things',
          'Have a list of what done looks like: every vendor set up, signage visible, space photographed, team briefed'
        ]
      }
    },
    {
      id:'pw3-3', day:'Tue–Wed', due:'End of Day 3', tag:'brand',
      text:'All signage and printed materials ordered or in hand',
      detail: {
        why: 'Print timelines are fixed. If you have not ordered by midweek you will not have it in time.',
        steps: [
          'What do you need printed: entrance signage, vendor labels, any promotional materials?',
          'Use a local same-day or next-day print service if needed (FedEx Office, local print shop)',
          'Check: does the signage match the concept and visual language you have developed?',
          'Have a backup: if printed signage falls through, what is the hand-made or digital fallback?'
        ]
      }
    },
    {
      id:'pw3-4', day:'Wed', due:'End of Day 3', tag:'money',
      text:'Point-of-sale sorted for every vendor — confirm how each handles transactions',
      detail: {
        why: 'Confused or slow checkout ruins the experience and costs sales.',
        steps: [
          'Each vendor should have their own payment method — confirm this with everyone',
          'Do you need a shared checkout? If so, who runs it and how do you track which vendor each sale belongs to?',
          'Have a simple sales tracking sheet per vendor if needed — even a paper tally works',
          'Test any card readers or payment apps before install day'
        ]
      }
    },
    {
      id:'pw3-5', day:'Wed–Thu', due:'End of Day 4', tag:'ops',
      text:'Day-of contact list — every phone number you could possibly need',
      detail: {
        why: 'On install day you do not have time to hunt for contact information.',
        steps: [
          'Every vendor: name and phone number',
          'Building contact: the specific person who manages access',
          'Any infrastructure rental company in case something needs to be swapped',
          'One backup person who can help in an emergency',
          'Save this list in your phone AND print it out'
        ]
      }
    },
    {
      id:'pw3-6', day:'Thu', due:'End of Day 4', tag:'ops',
      text:'Post-pop-up plan — what data do you collect, how do you follow up with visitors',
      detail: {
        why: 'A pop-up without a follow-up plan is a one-time event. With a plan it becomes a relationship.',
        steps: [
          'Email list: how are you collecting sign-ups on the day? (QR code, paper sign-up, iPad)',
          'What do you ask visitors? (One question: "how did you hear about us?" tells you a lot)',
          'Vendor debrief: after the event, what do you want to know from each vendor about their experience?',
          'For The Front: what moments, reactions, or quotes from this pop-up prove the concept works?'
        ]
      }
    },
    {
      id:'pw3-7', day:'Fri', due:'End of Week 3 — POP-UP READY', tag:'brand',
      text:'Document everything — photographs, notes, numbers. This is your proof of concept.',
      detail: {
        why: 'The 334 Broome pop-up is the evidence that The Front works. Every photo, sales figure, and visitor reaction feeds the grant application, the press pitch, and the investor conversation.',
        steps: [
          'During the event: assign someone to photograph or photograph yourself in quieter moments',
          'Capture: the space before opening, the space during, vendor interactions, visitor moments',
          'After: total visitor count estimate, total sales across vendors, any press or notable attendees',
          'Write a one-paragraph account of what happened while it is still fresh',
          'Add everything to the Archive tab. This is the beginning of The Front\'s story.'
        ]
      }
    },
  ],
};

const RTAG_CLASSES = {
  brand: 'rtag-brand', space: 'rtag-space', money: 'rtag-money',
  people: 'rtag-people', ops: 'rtag-ops', stop: 'rtag-stop'
};
const RTAG_LABELS = {
  brand: 'Brand', space: 'Space', money: 'Money',
  people: 'People', ops: 'Ops', stop: '⏱ Stop'
};

function getRoadmapState() {
  try { return JSON.parse(localStorage.getItem('roadmap_state_v1') || '{}'); } catch { return {}; }
}
function saveRoadmapState(s) { localStorage.setItem('roadmap_state_v1', JSON.stringify(s)); }

function toggleRoadmapTask(id) {
  const state = getRoadmapState();
  state[id] = !state[id];
  saveRoadmapState(state);
  renderRoadmap();
}

function getTaskDay(taskId, defaultDay, state) {
  return state['_day_' + taskId] || defaultDay || 'This week';
}

function getAllDaysForCol(col, state) {
  var tasks = ROADMAP_TASKS[col] || [];
  var days = [];
  tasks.forEach(function(t) {
    var d = getTaskDay(t.id, t.day, state);
    if (days.indexOf(d) === -1) days.push(d);
  });
  return days;
}

function buildTaskHtml(t, isDone, state) {
  var tagClass  = RTAG_CLASSES[t.tag] || '';
  var tagLabel  = RTAG_LABELS[t.tag] || t.tag;
  var expandId  = 'rmexp-' + t.id;
  var detail    = t.detail || {};
  var expanded  = !!state['_exp_' + t.id];

  var stepsHtml = '';
  if (detail.steps && detail.steps.length) {
    stepsHtml = '<div class="roadmap-detail-section"><div class="roadmap-detail-label">How to do it</div><div class="roadmap-detail-steps">' +
      detail.steps.map(function(s, i) {
        return '<div class="roadmap-detail-step"><span class="roadmap-detail-step-num">' + (i+1) + '</span><span class="roadmap-detail-step-text">' + s + '</span></div>';
      }).join('') + '</div></div>';
  }
  var whyHtml = detail.why
    ? '<div class="roadmap-detail-section"><div class="roadmap-detail-label">Why this matters</div><div class="roadmap-detail-text">' + detail.why + '</div></div>'
    : '';

  return '<div class="roadmap-task' + (isDone ? ' done' : '') + (expanded ? ' expanded' : '') + '"' +
    ' id="rmtask-' + t.id + '" draggable="true"' +
    ' ondragstart="rmDragStart(event,' + "'" + t.id + "'" + ')"' +
    ' ondragend="rmDragEnd(event)">' +
    '<div class="roadmap-task-row" onclick="toggleRoadmapExpand(' + "'" + t.id + "'" + ')">' +
      '<span class="roadmap-task-drag-handle" onclick="event.stopPropagation()" title="Drag to move">⠿</span>' +
      '<div class="roadmap-task-check" onclick="event.stopPropagation();toggleRoadmapTask(' + "'" + t.id + "'" + ')"></div>' +
      '<div style="flex:1;min-width:0">' +
        '<div class="roadmap-task-text">' + t.text + '</div>' +
        '<div class="roadmap-task-meta" style="margin-top:4px">' +
          '<span class="roadmap-task-tag ' + tagClass + '">' + tagLabel + '</span>' +
          (t.due ? '<span class="roadmap-task-due">Due: ' + t.due + '</span>' : '') +
        '</div>' +
      '</div>' +
      '<span class="roadmap-task-expand-btn" id="' + expandId + '-btn">' + (expanded ? '- less' : '+ more') + '</span>' +
    '</div>' +
    '<div class="roadmap-task-detail" id="' + expandId + '" style="display:' + (expanded ? 'block' : 'none') + '">' +
      whyHtml + stepsHtml +
    '</div>' +
  '</div>';
}

function renderRoadmap() {
  var state = getRoadmapState();
  var cols  = Object.keys(ROADMAP_TASKS);

  cols.forEach(function(col) {
    var el = document.getElementById('rm-' + col);
    if (!el) return;
    var tasks = ROADMAP_TASKS[col];
    var done  = tasks.filter(function(t) { return state[t.id]; }).length;

    // Build day groups respecting overrides
    var dayGroups = {};
    var dayOrder  = [];
    tasks.forEach(function(t) {
      var day = getTaskDay(t.id, t.day, state);
      if (!dayGroups[day]) { dayGroups[day] = []; dayOrder.push(day); }
      dayGroups[day].push(t);
    });
    dayOrder = dayOrder.filter(function(d, i) { return dayOrder.indexOf(d) === i; });

    var html = '';
    dayOrder.forEach(function(day) {
      html += '<div class="roadmap-week-day-header">' +
        '<span class="roadmap-day-label">' + day + '</span>' +
      '</div>';
      // Drop zone before first task
      html += '<div class="roadmap-day-zone" data-col="' + col + '" data-day="' + day + '" data-pos="0"' +
        ' ondragover="rmDragOver(event)" ondragleave="rmDragLeave(event)" ondrop="rmDrop(event)"></div>';
      dayGroups[day].forEach(function(t, i) {
        html += buildTaskHtml(t, !!state[t.id], state);
        // Drop zone after each task
        html += '<div class="roadmap-day-zone" data-col="' + col + '" data-day="' + day + '" data-pos="' + (i+1) + '"' +
          ' ondragover="rmDragOver(event)" ondragleave="rmDragLeave(event)" ondrop="rmDrop(event)"></div>';
      });
    });

    // Add-day button at bottom of section
    html += '<button class="roadmap-add-day-btn" onclick="rmAddDay(' + "'" + col + "'" + ')" style="margin-top:8px;opacity:0.6">+ add day</button>';

    el.innerHTML = html;

    // Progress bar
    var pct = tasks.length ? Math.round(done / tasks.length * 100) : 0;
    var bar = document.getElementById('rm-prog-' + col);
    if (bar) bar.style.width = pct + '%';
  });
}

// ── Drag state ──────────────────────────────────────────────────
var _rmDragging = null;

function rmDragStart(e, taskId) {
  _rmDragging = taskId;
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', taskId);
}

function rmDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.roadmap-day-zone').forEach(function(z) {
    z.classList.remove('drag-over');
  });
  _rmDragging = null;
}

function rmDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('drag-over');
}

function rmDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function rmDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  var taskId = e.dataTransfer.getData('text/plain') || _rmDragging;
  if (!taskId) return;
  var newDay = e.currentTarget.getAttribute('data-day');
  if (!newDay) return;
  var state = getRoadmapState();
  state['_day_' + taskId] = newDay;
  saveRoadmapState(state);
  renderRoadmap();
}

function rmAddDay(col) {
  var name = prompt('Name for the new day (e.g. "Saturday", "Next Monday"):');
  if (!name || !name.trim()) return;
  name = name.trim();
  // Add a placeholder task stub to create the day group — we do this by
  // moving the last task of the col to this day as a user action would,
  // but instead just create a synthetic empty-day marker in state
  var state = getRoadmapState();
  // Store the custom day in the days list for this col
  var customKey = '_customdays_' + col;
  var customDays = state[customKey] ? state[customKey].split('|||') : [];
  if (customDays.indexOf(name) === -1) customDays.push(name);
  state[customKey] = customDays.join('|||');
  saveRoadmapState(state);
  renderRoadmap();
}

function toggleRoadmapExpand(id) {
  var state = getRoadmapState();
  state['_exp_' + id] = !state['_exp_' + id];
  saveRoadmapState(state);
  var det  = document.getElementById('rmexp-' + id);
  var btn  = document.getElementById('rmexp-' + id + '-btn');
  var task = document.getElementById('rmtask-' + id);
  if (!det) return;
  var open = state['_exp_' + id];
  det.style.display = open ? 'block' : 'none';
  if (task) task.classList.toggle('expanded', open);
  if (btn)  btn.textContent = open ? '- less' : '+ more';
}

function initRoadmap() {
  renderRoadmap();
}
initRoadmap();





// ═══ POPUP SCHEDULE ══════════════════════════════════════════════

function getPopupSchedule() {
  try { return JSON.parse(localStorage.getItem('popup_schedule_v1') || 'null') || getDefaultPopupSchedule(); }
  catch(e) { return getDefaultPopupSchedule(); }
}
function savePopupSchedule(d) { localStorage.setItem('popup_schedule_v1', JSON.stringify(d)); }

function getDefaultPopupSchedule() {
  // Seed from roadmap popup tasks
  var weeks = [
    {
      id: 'pw1', title: 'Week 1 — Outreach & Prep',
      tasks: [
        { id:'ps-'+Date.now()+'-1', title:'Audit vendor list — confirmed, pending, still needed', due:'', done:false, tag:'people', note:'' },
        { id:'ps-'+Date.now()+'-2', title:'Send confirmation emails to all vendors with key details', due:'', done:false, tag:'people', note:'' },
        { id:'ps-'+Date.now()+'-3', title:'Define the pop-up concept and theme for 334 Broome', due:'', done:false, tag:'brand', note:'' },
        { id:'ps-'+Date.now()+'-4', title:'Walk the 334 Broome space — measure, photograph, note constraints', due:'', done:false, tag:'space', note:'' },
        { id:'ps-'+Date.now()+'-5', title:'Draft layout plan — where does each vendor go?', due:'', done:false, tag:'space', note:'' },
        { id:'ps-'+Date.now()+'-6', title:'Confirm exact event dates in writing with building management', due:'', done:false, tag:'ops', note:'' },
        { id:'ps-'+Date.now()+'-7', title:'Open 334 Broome Financials and enter every confirmed cost', due:'', done:false, tag:'money', note:'' },
      ]
    },
    {
      id: 'pw2', title: 'Week 2 — Confirm & Plan',
      tasks: [
        { id:'ps-'+(Date.now()+1)+'-1', title:'Lock the final vendor lineup — no more changes after today', due:'', done:false, tag:'people', note:'' },
        { id:'ps-'+(Date.now()+1)+'-2', title:'Collect all vendor assets: bio, product description, photo, social handle', due:'', done:false, tag:'people', note:'' },
        { id:'ps-'+(Date.now()+1)+'-3', title:'Draft social media plan — what posts, which days, who creates them', due:'', done:false, tag:'brand', note:'' },
        { id:'ps-'+(Date.now()+1)+'-4', title:'Source shared infrastructure — racks, tables, lighting, signage', due:'', done:false, tag:'ops', note:'' },
        { id:'ps-'+(Date.now()+1)+'-5', title:'Confirm install schedule — who arrives when, how long set-up takes', due:'', done:false, tag:'ops', note:'' },
        { id:'ps-'+(Date.now()+1)+'-6', title:'Publish the event announcement — Instagram, press, word of mouth', due:'', done:false, tag:'brand', note:'' },
        { id:'ps-'+(Date.now()+1)+'-7', title:'Final budget check — are all costs covered?', due:'', done:false, tag:'money', note:'' },
      ]
    },
    {
      id: 'pw3', title: 'Week 3 — Execute & Logistics',
      tasks: [
        { id:'ps-'+(Date.now()+2)+'-1', title:'All vendor logistics confirmed in writing', due:'', done:false, tag:'people', note:'' },
        { id:'ps-'+(Date.now()+2)+'-2', title:'Write the install day plan hour by hour', due:'', done:false, tag:'ops', note:'' },
        { id:'ps-'+(Date.now()+2)+'-3', title:'All signage and printed materials ordered or in hand', due:'', done:false, tag:'brand', note:'' },
        { id:'ps-'+(Date.now()+2)+'-4', title:'Point-of-sale sorted for every vendor', due:'', done:false, tag:'money', note:'' },
        { id:'ps-'+(Date.now()+2)+'-5', title:'Day-of contact list — every number you could possibly need', due:'', done:false, tag:'ops', note:'' },
        { id:'ps-'+(Date.now()+2)+'-6', title:'Post-pop-up plan — what data do you collect?', due:'', done:false, tag:'ops', note:'' },
        { id:'ps-'+(Date.now()+2)+'-7', title:'Document everything — photographs, notes, numbers', due:'', done:false, tag:'brand', note:'' },
      ]
    }
  ];
  return { weeks: weeks };
}

var PS_TAG_STYLES = {
  people: 'background:rgba(201,168,212,0.15);color:#c9a8d4',
  brand:  'background:rgba(226,201,126,0.15);color:#e2c97e',
  space:  'background:rgba(168,196,212,0.15);color:#a8c4d4',
  money:  'background:rgba(136,201,138,0.15);color:#88c98a',
  ops:    'background:rgba(212,184,150,0.15);color:#d4b896',
  stop:   'background:rgba(224,132,90,0.15);color:#e0845a',
};

var _psDragging = null; // { taskId, fromWeekId }

function renderPopupSchedule() {
  var board = document.getElementById('popup-schedule-board');
  if (!board) return;
  var data = getPopupSchedule();

  var html = '';
  data.weeks.forEach(function(week) {
    var done  = week.tasks.filter(function(t) { return t.done; }).length;
    var total = week.tasks.length;
    var pct   = total ? Math.round(done/total*100) : 0;

    html += '<div class="ps-week" id="psweek-' + week.id + '">';
    // Header
    html += '<div class="ps-week-header">' +
      '<span class="ps-week-label">Week</span>' +
      '<input class="ps-week-title" value="' + esc(week.title) + '" placeholder="Week title…"' +
        ' oninput="updatePSWeekTitle(\'' + week.id + '\',this.value)">' +
      '<span class="ps-week-progress">' + done + '/' + total + ' done</span>' +
      '<button class="ps-week-add" onclick="addPopupTask(\'' + week.id + '\')">+ task</button>' +
      '<button class="ps-week-del" onclick="deletePSWeek(\'' + week.id + '\')" title="Remove week">✕</button>' +
    '</div>';

    // Progress bar
    html += '<div style="height:2px;background:var(--faint)"><div style="height:100%;background:#88c98a;width:' + pct + '%;transition:width 0.4s"></div></div>';

    // Body + drop zones
    html += '<div class="ps-week-body" id="psbody-' + week.id + '"' +
      ' ondragover="psDragOver(event,\'' + week.id + '\')"' +
      ' ondragleave="psDragLeave(event)"' +
      ' ondrop="psDrop(event,\'' + week.id + '\',null)">';

    week.tasks.forEach(function(task, i) {
      var tagStyle = PS_TAG_STYLES[task.tag] || PS_TAG_STYLES.ops;
      html +=
        // drop zone before task
        '<div class="ps-drop-zone" ondragover="psDZOver(event)" ondragleave="psDZLeave(event)" ondrop="psDrop(event,\'' + week.id + '\',\'' + task.id + '\')"></div>' +
        '<div class="ps-task' + (task.done?' done':'') + '" id="pstask-' + task.id + '"' +
          ' draggable="true"' +
          ' ondragstart="psDragStart(event,\'' + task.id + '\',\'' + week.id + '\')"' +
          ' ondragend="psDragEnd(event)">' +
          '<span class="ps-drag-handle">⠿</span>' +
          '<div class="ps-task-check" onclick="togglePSTask(\'' + week.id + '\',\'' + task.id + '\')"></div>' +
          '<div class="ps-task-body">' +
            '<textarea class="ps-task-title" rows="1" placeholder="Task…"' +
              ' oninput="updatePSTask(\'' + week.id + '\',\'' + task.id + '\',\'title\',this.value);this.style.height=\'auto\';this.style.height=this.scrollHeight+\'px\'">' +
              esc(task.title) + '</textarea>' +
            '<div class="ps-task-meta">' +
              '<span class="ps-task-tag" style="' + tagStyle + '">' + (task.tag||'ops') + '</span>' +
              '<select style="background:none;border:none;color:var(--muted);font-family:\'DM Mono\',monospace;font-size:7px;outline:none;cursor:pointer"' +
                ' onchange="updatePSTask(\'' + week.id + '\',\'' + task.id + '\',\'tag\',this.value);renderPopupSchedule()">' +
                ['people','brand','space','money','ops','stop'].map(function(t) {
                  return '<option value="'+t+'"'+(task.tag===t?' selected':'')+'>'+t+'</option>';
                }).join('') +
              '</select>' +
              '<div class="ps-task-due-wrap">' +
                '<span class="ps-task-due-label">Due</span>' +
                '<input class="ps-task-due" type="date" value="' + esc(task.due||'') + '"' +
                  ' onchange="updatePSTask(\'' + week.id + '\',\'' + task.id + '\',\'due\',this.value)">' +
              '</div>' +
            '</div>' +
            '<textarea class="ps-task-note" rows="1" placeholder="Add a note…"' +
              ' oninput="updatePSTask(\'' + week.id + '\',\'' + task.id + '\',\'note\',this.value);this.style.height=\'auto\';this.style.height=this.scrollHeight+\'px\'">' +
              esc(task.note||'') + '</textarea>' +
          '</div>' +
          '<button class="ps-task-del" onclick="deletePSTask(\'' + week.id + '\',\'' + task.id + '\')">✕</button>' +
        '</div>';
    });
    // final drop zone
    html += '<div class="ps-drop-zone" ondragover="psDZOver(event)" ondragleave="psDZLeave(event)" ondrop="psDrop(event,\'' + week.id + '\',\'__end__\')"></div>';
    html += '</div></div>'; // close body + week
  });

  // Add week button
  html += '<div class="ps-add-week" onclick="addPSWeek()">+ Add week</div>';

  board.innerHTML = html;

  // Auto-size all textareas
  board.querySelectorAll('textarea').forEach(function(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  });
}

// ── CRUD ──────────────────────────────────────────────────────────
function addPopupTask(weekId) {
  var data = getPopupSchedule();
  var week = weekId ? data.weeks.find(function(w) { return w.id===weekId; }) : data.weeks[0];
  if (!week) { week = data.weeks[0]; }
  var id = 'ps-' + Date.now();
  week.tasks.push({ id:id, title:'', due:'', done:false, tag:'ops', note:'' });
  savePopupSchedule(data);
  renderPopupSchedule();
  setTimeout(function() {
    var el = document.getElementById('pstask-'+id);
    if (el) { var ta = el.querySelector('.ps-task-title'); if (ta) ta.focus(); }
  }, 30);
}

function updatePSTask(weekId, taskId, field, value) {
  var data = getPopupSchedule();
  var week = data.weeks.find(function(w) { return w.id===weekId; });
  if (!week) return;
  var task = week.tasks.find(function(t) { return t.id===taskId; });
  if (!task) return;
  task[field] = value;
  savePopupSchedule(data);
  if (field==='tag') renderPopupSchedule();
}

function togglePSTask(weekId, taskId) {
  var data = getPopupSchedule();
  var week = data.weeks.find(function(w) { return w.id===weekId; });
  if (!week) return;
  var task = week.tasks.find(function(t) { return t.id===taskId; });
  if (!task) return;
  task.done = !task.done;
  savePopupSchedule(data);
  renderPopupSchedule();
}

function deletePSTask(weekId, taskId) {
  var data = getPopupSchedule();
  var week = data.weeks.find(function(w) { return w.id===weekId; });
  if (!week) return;
  week.tasks = week.tasks.filter(function(t) { return t.id!==taskId; });
  savePopupSchedule(data);
  renderPopupSchedule();
}

function updatePSWeekTitle(weekId, val) {
  var data = getPopupSchedule();
  var week = data.weeks.find(function(w) { return w.id===weekId; });
  if (week) { week.title = val; savePopupSchedule(data); }
}

function addPSWeek() {
  var data = getPopupSchedule();
  data.weeks.push({ id:'pw-'+Date.now(), title:'New week', tasks:[] });
  savePopupSchedule(data);
  renderPopupSchedule();
}

function deletePSWeek(weekId) {
  var data = getPopupSchedule();
  if (data.weeks.length <= 1) return;
  if (!confirm('Remove this week and all its tasks?')) return;
  data.weeks = data.weeks.filter(function(w) { return w.id!==weekId; });
  savePopupSchedule(data);
  renderPopupSchedule();
}

// ── Drag ──────────────────────────────────────────────────────────
function psDragStart(e, taskId, weekId) {
  _psDragging = { taskId:taskId, weekId:weekId };
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}
function psDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.ps-week-body,.ps-drop-zone').forEach(function(el) {
    el.classList.remove('drag-over');
  });
  _psDragging = null;
}
function psDragOver(e, weekId) {
  e.preventDefault();
  document.getElementById('psbody-'+weekId).classList.add('drag-over');
}
function psDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}
function psDZOver(e) {
  e.preventDefault(); e.stopPropagation();
  e.currentTarget.classList.add('drag-over');
}
function psDZLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}
function psDrop(e, toWeekId, beforeTaskId) {
  e.preventDefault(); e.stopPropagation();
  document.querySelectorAll('.ps-week-body,.ps-drop-zone').forEach(function(el) { el.classList.remove('drag-over'); });
  if (!_psDragging) return;
  var taskId   = _psDragging.taskId;
  var fromWeekId = _psDragging.weekId;
  if (fromWeekId===toWeekId && beforeTaskId===null) return;

  var data = getPopupSchedule();
  var fromWeek = data.weeks.find(function(w) { return w.id===fromWeekId; });
  var toWeek   = data.weeks.find(function(w) { return w.id===toWeekId; });
  if (!fromWeek||!toWeek) return;

  var task = fromWeek.tasks.find(function(t) { return t.id===taskId; });
  if (!task) return;

  // Remove from source
  fromWeek.tasks = fromWeek.tasks.filter(function(t) { return t.id!==taskId; });

  // Insert into target
  if (!beforeTaskId || beforeTaskId==='__end__') {
    toWeek.tasks.push(task);
  } else {
    var idx = toWeek.tasks.findIndex(function(t) { return t.id===beforeTaskId; });
    if (idx===-1) toWeek.tasks.push(task);
    else toWeek.tasks.splice(idx, 0, task);
  }

  savePopupSchedule(data);
  renderPopupSchedule();
}

function initPopupSchedule() {
  renderPopupSchedule();
}

// ═══ CONTACTS ════════════════════════════════════════════════════

var _contactsSort = { col: 'name', asc: true };
var _contactsExpanded = {};

function getContacts() {
  try { return JSON.parse(localStorage.getItem('front_contacts_v1') || '[]'); } catch(e) { return []; }
}
function saveContacts(arr) { localStorage.setItem('front_contacts_v1', JSON.stringify(arr)); }

var IND_COLORS = [
  { bg:'rgba(212,184,150,0.15)', color:'#d4b896', border:'rgba(212,184,150,0.2)' },
  { bg:'rgba(201,168,212,0.15)', color:'#c9a8d4', border:'rgba(201,168,212,0.2)' },
  { bg:'rgba(168,196,212,0.15)', color:'#a8c4d4', border:'rgba(168,196,212,0.2)' },
  { bg:'rgba(226,201,126,0.15)', color:'#e2c97e', border:'rgba(226,201,126,0.2)' },
  { bg:'rgba(212,168,168,0.15)', color:'#d4a8a8', border:'rgba(212,168,168,0.2)' },
  { bg:'rgba(136,201,138,0.15)', color:'#88c98a', border:'rgba(136,201,138,0.2)' },
  { bg:'rgba(130,191,187,0.15)', color:'#82bfbb', border:'rgba(130,191,187,0.2)' },
  { bg:'rgba(224,132,90,0.12)',  color:'#e0845a', border:'rgba(224,132,90,0.2)'  },
  { bg:'rgba(136,153,170,0.15)', color:'#8899aa', border:'rgba(136,153,170,0.2)' },
  { bg:'rgba(180,160,220,0.15)', color:'#b4a0dc', border:'rgba(180,160,220,0.2)' },
  { bg:'rgba(220,180,130,0.15)', color:'#dcb482', border:'rgba(220,180,130,0.2)' },
  { bg:'rgba(150,200,170,0.15)', color:'#96c8aa', border:'rgba(150,200,170,0.2)' },
];

var DEFAULT_INDUSTRIES = [
  { id:'hospitality', label:'Hospitality',  groups:['Food & Bev','Creative'] },
  { id:'fashion',     label:'Fashion',       groups:['Creative','Industry']   },
  { id:'design',      label:'Design',        groups:['Creative','Industry']   },
  { id:'art',         label:'Art / Gallery', groups:['Creative','Cultural']   },
  { id:'retail',      label:'Retail',        groups:['Commerce','Industry']   },
  { id:'media',       label:'Media',         groups:['Press','Creative']      },
  { id:'fabrication', label:'Fabrication',   groups:['Production','Build']    },
  { id:'finance',     label:'Finance',       groups:['Business','Funding']    },
  { id:'press',       label:'Press',         groups:['Press','Media']         },
  { id:'other',       label:'Other',         groups:[]                        },
];

function getIndustries() {
  try {
    var s = localStorage.getItem('front_industries_v1');
    if (s) return JSON.parse(s);
  } catch(e) {}
  return DEFAULT_INDUSTRIES.map(function(d, i) {
    return { id: d.id, label: d.label, groups: d.groups.slice(), colorIdx: i };
  });
}
function saveIndustries(arr) { localStorage.setItem('front_industries_v1', JSON.stringify(arr)); }

function getIndustryById(id) {
  return getIndustries().find(function(x) { return x.id === id; }) || null;
}

function getIndStyle(ind) {
  if (!ind) return '';
  var col = IND_COLORS[ind.colorIdx % IND_COLORS.length] || IND_COLORS[0];
  return 'background:' + col.bg + ';color:' + col.color + ';border-color:' + col.border;
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

var REL_CLASSES = { warm:'rel-warm', cold:'rel-cold', met:'rel-met', key:'rel-key', reached:'rel-reached' };
var REL_LABELS  = { warm:'Warm', cold:'Cold', met:'Met once', key:'Key contact', reached:'Reached out' };

// ── Industry manager ─────────────────────────────────────────────
function openIndustryManager() {
  var el = document.getElementById('industry-manager');
  if (el) { el.style.display = 'block'; renderIndustryManager(); }
}
function closeIndustryManager() {
  var el = document.getElementById('industry-manager');
  if (el) el.style.display = 'none';
}
function renderIndustryManager() {
  var list = document.getElementById('industry-tag-list');
  if (!list) return;
  var inds = getIndustries();
  var html = '';
  inds.forEach(function(ind) {
    var col = IND_COLORS[ind.colorIdx % IND_COLORS.length] || IND_COLORS[0];
    var sty = 'background:' + col.bg + ';color:' + col.color + ';border-color:' + col.border;
    var g0 = (ind.groups && ind.groups[0]) || '';
    var g1 = (ind.groups && ind.groups[1]) || '';
    html += '<div class="ind-tag-row">' +
      '<span class="ind-tag-name">' + esc(ind.label) + '</span>' +
      '<span class="ind-tag-pill-preview" style="' + sty + '">' + esc(ind.label) + '</span>' +
      '<input class="ind-group-input" value="' + esc(g0) + '" placeholder="Group 1…" oninput="updateIndGroup(\'' + ind.id + '\',0,this.value)">' +
      '<input class="ind-group-input" value="' + esc(g1) + '" placeholder="Group 2…" oninput="updateIndGroup(\'' + ind.id + '\',1,this.value)">' +
      (g0 ? '<span class="ind-group-tag">' + esc(g0) + '</span>' : '') +
      (g1 ? '<span class="ind-group-tag">' + esc(g1) + '</span>' : '') +
      '<button class="ind-del-btn" onclick="deleteIndustry(\'' + ind.id + '\')">✕</button>' +
    '</div>';
  });
  list.innerHTML = html;
}
function updateIndGroup(id, idx, value) {
  var inds = getIndustries();
  var ind = inds.find(function(x) { return x.id === id; });
  if (!ind) return;
  if (!ind.groups) ind.groups = [];
  while (ind.groups.length <= idx) ind.groups.push('');
  ind.groups[idx] = value;
  saveIndustries(inds);
  populateIndustryFilters();
}
function addIndustryTag() {
  var nameEl = document.getElementById('new-industry-name');
  var g1El   = document.getElementById('new-industry-g1');
  var g2El   = document.getElementById('new-industry-g2');
  var name   = nameEl ? nameEl.value.trim() : '';
  if (!name) return;
  var inds = getIndustries();
  var id   = slugify(name) || ('ind' + Date.now());
  var base = id; var n = 1;
  while (inds.find(function(x) { return x.id === id; })) { id = base + '-' + (n++); }
  var groups = [];
  if (g1El && g1El.value.trim()) groups.push(g1El.value.trim());
  if (g2El && g2El.value.trim()) groups.push(g2El.value.trim());
  inds.push({ id: id, label: name, groups: groups, colorIdx: inds.length % IND_COLORS.length });
  saveIndustries(inds);
  if (nameEl) nameEl.value = '';
  if (g1El)   g1El.value = '';
  if (g2El)   g2El.value = '';
  renderIndustryManager();
  populateIndustryFilters();
  renderContacts();
}
function deleteIndustry(id) {
  saveIndustries(getIndustries().filter(function(x) { return x.id !== id; }));
  renderIndustryManager();
  populateIndustryFilters();
  renderContacts();
}
function populateIndustryFilters() {
  var inds = getIndustries();
  var sel = document.getElementById('contacts-filter-industry');
  if (sel) {
    var cur = sel.value;
    sel.innerHTML = '<option value="">All industries</option>' +
      inds.map(function(i) { return '<option value="' + i.id + '"' + (cur===i.id?' selected':'') + '>' + i.label + '</option>'; }).join('');
  }
  var gsel = document.getElementById('contacts-filter-group');
  if (gsel) {
    var curg = gsel.value;
    var all = [];
    inds.forEach(function(i) { (i.groups||[]).forEach(function(g) { if (g && all.indexOf(g)===-1) all.push(g); }); });
    all.sort();
    gsel.innerHTML = '<option value="">All groups</option>' +
      all.map(function(g) { return '<option value="' + esc(g) + '"' + (curg===g?' selected':'') + '>' + esc(g) + '</option>'; }).join('');
  }
}

// ── CRUD ─────────────────────────────────────────────────────────
function addContact() {
  var contacts = getContacts();
  var id = Date.now();
  contacts.unshift({ id:id, name:'', industry:'', role:'', company:'', rel:'', email:'', phone:'', instagram:'', website:'', location:'', notes:'', lastContact:'' });
  saveContacts(contacts);
  renderContacts();
  setTimeout(function() { var el = document.getElementById('cname-'+id); if (el) el.focus(); }, 50);
}
function updateContact(id, field, value) {
  var contacts = getContacts();
  var ct = contacts.find(function(x) { return x.id===id; });
  if (ct) { ct[field] = value; saveContacts(contacts); }
  if (field==='industry' || field==='rel') renderContacts();
}
function updateContactRoleCompany(id, value) {
  var contacts = getContacts();
  var ct = contacts.find(function(x) { return x.id===id; });
  if (!ct) return;
  var parts = value.split('@');
  ct.role    = parts[0] ? parts[0].trim() : '';
  ct.company = parts[1] ? parts[1].trim() : '';
  saveContacts(contacts);
}
function deleteContact(id) {
  if (!confirm('Remove this contact?')) return;
  saveContacts(getContacts().filter(function(x) { return x.id!==id; }));
  delete _contactsExpanded[id];
  renderContacts();
}
function toggleContactExpand(id) {
  _contactsExpanded[id] = !_contactsExpanded[id];
  renderContacts();
}
function sortContacts(col) {
  if (_contactsSort.col===col) { _contactsSort.asc = !_contactsSort.asc; }
  else { _contactsSort.col = col; _contactsSort.asc = true; }
  renderContacts();
}
function autoGrowCell(el) {
  el.style.height = 'auto';
  el.style.height = (el.scrollHeight) + 'px';
}
function initContactCellHeights() {
  document.querySelectorAll('.contact-cell').forEach(function(el) {
    if (el.tagName === 'TEXTAREA') { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
  });
}

// ── Render ───────────────────────────────────────────────────────
function renderContacts() {
  var tbody   = document.getElementById('contacts-tbody');
  var empty   = document.getElementById('contacts-empty');
  var countEl = document.getElementById('contacts-count');
  if (!tbody) return;

  var contacts   = getContacts();
  var search     = ((document.getElementById('contacts-search')||{}).value||'').toLowerCase();
  var filterInd  = (document.getElementById('contacts-filter-industry')||{}).value||'';
  var filterGrp  = (document.getElementById('contacts-filter-group')||{}).value||'';
  var filterRel  = (document.getElementById('contacts-filter-rel')||{}).value||'';

  var filtered = contacts.filter(function(ct) {
    var haystack = [ct.name,ct.industry,ct.role,ct.company,ct.notes,ct.location].join(' ').toLowerCase();
    var matchSearch = !search || haystack.indexOf(search) !== -1;
    var matchInd    = !filterInd || ct.industry === filterInd;
    var matchRel    = !filterRel || ct.rel === filterRel;
    var matchGrp    = !filterGrp || (function() {
      var ind = getIndustryById(ct.industry);
      return ind && ind.groups && ind.groups.indexOf(filterGrp) !== -1;
    }());
    return matchSearch && matchInd && matchRel && matchGrp;
  });

  // Sort
  var sc = _contactsSort.col;
  filtered.sort(function(a,b) {
    var av = (a[sc]||'').toLowerCase(), bv = (b[sc]||'').toLowerCase();
    return _contactsSort.asc ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  if (countEl) countEl.textContent = filtered.length + ' contact' + (filtered.length!==1?'s':'');

  // Sort header arrows
  ['name','industry','role','rel'].forEach(function(col) {
    var th = document.getElementById('cth-'+col);
    if (!th) return;
    th.classList.toggle('sorted', _contactsSort.col===col);
    var arrow = th.querySelector('.sort-arrow');
    if (arrow) arrow.textContent = _contactsSort.col===col ? (_contactsSort.asc?'↑':'↓') : '↕';
  });

  if (!filtered.length) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  var indsOpts = getIndustries().map(function(ind) {
    return '<option value="' + ind.id + '">' + ind.label + '</option>';
  }).join('');

  var html = '';
  filtered.forEach(function(ct) {
    var ind      = getIndustryById(ct.industry);
    var indLabel = ind ? ind.label : (ct.industry||'');
    var indStyle = ind ? getIndStyle(ind) : '';
    var relClass = REL_CLASSES[ct.rel]||'';
    var isExp    = !!_contactsExpanded[ct.id];
    var id       = ct.id;
    var roleVal  = ct.role ? ct.role + (ct.company ? ' @ ' + ct.company : '') : (ct.company||'');

    // Build industry options with selected
    var indOpts = '<option value="">— pick —</option>' +
      getIndustries().map(function(i) {
        return '<option value="' + i.id + '"' + (ct.industry===i.id?' selected':'') + '>' + i.label + '</option>';
      }).join('');

    // Build relationship options with selected
    var relOpts = '<option value="">— status —</option>' +
      ['key','warm','met','reached','cold'].map(function(r) {
        return '<option value="' + r + '"' + (ct.rel===r?' selected':'') + '>' + REL_LABELS[r] + '</option>';
      }).join('');

    html +=
      '<tr id="crow-' + id + '">' +
        '<td style="width:32px;padding:0">' +
          '<button class="contact-expand-btn' + (isExp?' open':'') + '" onclick="toggleContactExpand(' + id + ')">›</button>' +
        '</td>' +
        '<td>' +
          '<textarea class="contact-cell name-cell" id="cname-' + id + '" placeholder="Name…" rows="1"' +
          ' oninput="updateContact(' + id + ',\'name\',this.value);autoGrowCell(this)">' + esc(ct.name) + '</textarea>' +
        '</td>' +
        '<td>' +
          '<div class="contact-industry-wrap">' +
            (indLabel ? '<span class="contact-industry-pill" style="' + indStyle + '">' + indLabel + '</span>' : '') +
            '<select style="background:none;border:none;color:var(--muted);font-family:\'DM Mono\',monospace;font-size:8px;outline:none;cursor:pointer;max-width:80px"' +
              ' onchange="updateContact(' + id + ',\'industry\',this.value)">' + indOpts + '</select>' +
          '</div>' +
        '</td>' +
        '<td>' +
          '<textarea class="contact-cell mono" placeholder="Role @ Company…" rows="1"' +
          ' oninput="updateContactRoleCompany(' + id + ',this.value);autoGrowCell(this)">' + esc(roleVal) + '</textarea>' +
        '</td>' +
        '<td style="padding:11px 14px;white-space:nowrap">' +
          (relClass ? '<span class="contact-rel-dot ' + relClass + '"></span>' : '') +
          '<select style="background:none;border:none;color:var(--muted);font-family:\'DM Mono\',monospace;font-size:9px;outline:none;cursor:pointer"' +
            ' onchange="updateContact(' + id + ',\'rel\',this.value)">' + relOpts + '</select>' +
        '</td>' +
        '<td>' +
          '<textarea class="contact-cell mono" placeholder="Notes…" rows="1"' +
          ' oninput="updateContact(' + id + ',\'notes\',this.value);autoGrowCell(this)">' + esc(ct.notes||'') + '</textarea>' +
        '</td>' +
        '<td style="padding:0 8px;text-align:right">' +
          '<button class="contact-expand-btn" onclick="deleteContact(' + id + ')" style="font-size:11px;color:var(--muted)" title="Delete">✕</button>' +
        '</td>' +
      '</tr>';

    if (isExp) {
      html +=
        '<tr class="contact-detail-row">' +
          '<td></td>' +
          '<td colspan="6">' +
            '<div class="contact-detail-grid">' +
              '<div class="contact-detail-field"><label>Email</label>' +
                '<input class="contact-detail-input" value="' + esc(ct.email||'') + '" placeholder="email@example.com" type="email"' +
                ' oninput="updateContact(' + id + ',\'email\',this.value)"></div>' +
              '<div class="contact-detail-field"><label>Phone</label>' +
                '<input class="contact-detail-input" value="' + esc(ct.phone||'') + '" placeholder="+1 212…"' +
                ' oninput="updateContact(' + id + ',\'phone\',this.value)"></div>' +
              '<div class="contact-detail-field"><label>Instagram</label>' +
                '<input class="contact-detail-input" value="' + esc(ct.instagram||'') + '" placeholder="@handle"' +
                ' oninput="updateContact(' + id + ',\'instagram\',this.value)"></div>' +
              '<div class="contact-detail-field"><label>Website / LinkedIn</label>' +
                '<input class="contact-detail-input" value="' + esc(ct.website||'') + '" placeholder="https://…"' +
                ' oninput="updateContact(' + id + ',\'website\',this.value)"></div>' +
              '<div class="contact-detail-field"><label>Location</label>' +
                '<input class="contact-detail-input" value="' + esc(ct.location||'') + '" placeholder="Brooklyn, NYC…"' +
                ' oninput="updateContact(' + id + ',\'location\',this.value)"></div>' +
              '<div class="contact-detail-field"><label>Last contacted</label>' +
                '<input class="contact-detail-input" type="date" value="' + esc(ct.lastContact||'') + '"' +
                ' oninput="updateContact(' + id + ',\'lastContact\',this.value)"></div>' +
              '<div class="contact-detail-field" style="grid-column:1/-1"><label>Full notes</label>' +
                '<textarea class="contact-detail-notes" placeholder="How you know them, what they could help with, conversation history…"' +
                ' oninput="updateContact(' + id + ',\'notes\',this.value)">' + esc(ct.notes||'') + '</textarea></div>' +
              '<div style="grid-column:1/-1;padding-top:4px">' +
                '<button class="contact-del-btn" onclick="deleteContact(' + id + ')">Remove contact</button>' +
              '</div>' +
            '</div>' +
          '</td>' +
        '</tr>';
    }
  });

  tbody.innerHTML = html;
  setTimeout(initContactCellHeights, 0);
}

function initContacts() {
  populateIndustryFilters();
  var existing = getContacts();
  if (!existing.length) {
    saveContacts([{
      id: 1700000000000, name: 'Aisa Blue', industry: 'hospitality',
      role: 'Owner', company: 'Cassetta', rel: 'warm',
      email: '', phone: '', instagram: '@aisablue', website: '',
      location: 'New York, NY',
      notes: 'Cafe owner of Cassetta. Potential collaborator for events and preview evenings. Part of the LES creative community.',
      lastContact: ''
    }]);
  }
  renderContacts();
}
initContacts();
initRevProj();
initMarketing();
initBrandTabs();
initOverview();
initResources();
initEvents();
initChaShaMa();
initViolets();

// ═══ SPACES ══════════════════════════════════════════════════════

const STATUS_META = {
  touring:    { color:'#e2c97e', label:'Touring'    },
  interested: { color:'var(--front)', label:'Interested' },
  top:        { color:'#88c98a', label:'Top pick'   },
  passed:     { color:'#888',    label:'Passed'     },
  pending:    { color:'var(--muted)', label:'Pending' },
};

function getSpaces()        { try { return JSON.parse(localStorage.getItem('front_spaces_v1')||'[]'); } catch { return []; } }
function saveSpaces(arr)    { localStorage.setItem('front_spaces_v1', JSON.stringify(arr)); }

let spacesFilter = 'all';
let spacesOpenId = null;

function filterSpaces(f, btn) {
  spacesFilter = f;
  document.querySelectorAll('.spaces-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderSpaces();
}

function addSpace() {
  const spaces = getSpaces();
  const id = Date.now();
  spaces.unshift({
    id, name:'New space', address:'', neighborhood:'', sqft:'', rent:'',
    contact:'', contactEmail:'', toured:'', link:'', status:'pending',
    notes:'', pros:'', cons:'', lat:'', lng:'', research:null
  });
  saveSpaces(spaces);
  spacesOpenId = id;
  renderSpaces();
  // focus name field
  setTimeout(() => {
    const el = document.querySelector('[data-space-id="'+id+'"] .space-name-input');
    if (el) { el.focus(); el.select(); }
  }, 80);
}

function deleteSpace(id) {
  if (!confirm('Delete this space?')) return;
  saveSpaces(getSpaces().filter(s => s.id !== id));
  if (spacesOpenId === id) spacesOpenId = null;
  renderSpaces();
}

function toggleSpace(id) {
  spacesOpenId = spacesOpenId === id ? null : id;
  renderSpaces();
}

function updateSpaceField(id, field, value) {
  const spaces = getSpaces();
  const s = spaces.find(x => x.id === id);
  if (!s) return;
  s[field] = value;
  saveSpaces(spaces);
  // re-render header parts live
  if (['name','status','rent','neighborhood','address'].includes(field)) {
    renderSpaceHeader(id, s);
    if (['address','lat','lng'].includes(field)) renderMap();
  }
}

function renderSpaceHeader(id, s) {
  const card = document.querySelector('[data-space-id="'+id+'"]');
  if (!card) return;
  const sm = STATUS_META[s.status] || STATUS_META.pending;
  const dot = card.querySelector('.space-status-dot');
  const name = card.querySelector('.space-card-name');
  const metaRent = card.querySelector('.space-card-rent');
  const metaNbhd = card.querySelector('.space-meta-nbhd');
  if (dot) dot.style.background = sm.color;
  if (name) name.textContent = s.name || 'Untitled space';
  if (metaRent) metaRent.textContent = s.rent ? '$'+s.rent+'/mo' : '';
  if (metaNbhd) metaNbhd.textContent = s.neighborhood || '';
}

function renderSpaces() {
  const list = document.getElementById('spaces-list');
  if (!list) return;
  let spaces = getSpaces();
  if (spacesFilter !== 'all') spaces = spaces.filter(s => s.status === spacesFilter);

  if (!spaces.length) {
    list.innerHTML = '<div class="spaces-empty"><span class="spaces-empty-icon">🏛</span><div class="spaces-empty-text">No spaces yet</div><div class="spaces-empty-sub">Hit "+ Add space" to log your first lead</div></div>';
    renderMap();
    return;
  }

  list.innerHTML = spaces.map(s => buildSpaceCard(s)).join('');
  renderMap();
}

function esc(str) { return (str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function buildSpaceCard(s) {
  const open = spacesOpenId === s.id;
  const sm   = STATUS_META[s.status] || STATUS_META.pending;
  const statusOpts = Object.entries(STATUS_META).map(([v,m]) =>
    `<option value="${v}"${s.status===v?' selected':''}>${m.label}</option>`
  ).join('');

  return `<div class="space-card${open?' open':''}" data-space-id="${s.id}">
    <div class="space-card-header" onclick="toggleSpace(${s.id})">
      <div class="space-status-dot" style="background:${sm.color}"></div>
      <div class="space-card-name">${esc(s.name)||'Untitled space'}</div>
      <div class="space-card-meta">
        <span class="space-card-rent">${s.rent?'$'+esc(s.rent)+'/mo':''}</span>
        <span class="space-meta-nbhd">${esc(s.neighborhood)}</span>
        ${s.toured?'<span>Toured '+esc(s.toured)+'</span>':''}
      </div>
      <span class="space-card-chevron">›</span>
    </div>
    <div class="space-card-body">
      <div class="space-fields">
        <div class="space-field full">
          <div class="space-field-label">Space name</div>
          <input class="space-field-input space-name-input" value="${esc(s.name)}"
            oninput="updateSpaceField(${s.id},'name',this.value)" placeholder="e.g. 47 Canal St">
        </div>
        <div class="space-field full">
          <div class="space-field-label">Address</div>
          <input class="space-field-input" value="${esc(s.address)}"
            oninput="updateSpaceField(${s.id},'address',this.value)" placeholder="Full street address">
        </div>
        <div class="space-field">
          <div class="space-field-label">Neighbourhood</div>
          <input class="space-field-input" value="${esc(s.neighborhood)}"
            oninput="updateSpaceField(${s.id},'neighborhood',this.value)" placeholder="LES, Nolita, Bushwick…">
        </div>
        <div class="space-field">
          <div class="space-field-label">Sq ft</div>
          <input class="space-field-input" value="${esc(s.sqft)}"
            oninput="updateSpaceField(${s.id},'sqft',this.value)" placeholder="e.g. 800">
        </div>
        <div class="space-field">
          <div class="space-field-label">Monthly rent</div>
          <input class="space-field-input" value="${esc(s.rent)}"
            oninput="updateSpaceField(${s.id},'rent',this.value)" placeholder="e.g. 4500">
        </div>
        <div class="space-field">
          <div class="space-field-label">Date toured</div>
          <input class="space-field-input" type="date" value="${esc(s.toured)}"
            onchange="updateSpaceField(${s.id},'toured',this.value)">
        </div>
        <div class="space-field">
          <div class="space-field-label">Contact name</div>
          <input class="space-field-input" value="${esc(s.contact)}"
            oninput="updateSpaceField(${s.id},'contact',this.value)" placeholder="Broker / landlord name">
        </div>
        <div class="space-field">
          <div class="space-field-label">Contact email / phone</div>
          <input class="space-field-input" value="${esc(s.contactEmail)}"
            oninput="updateSpaceField(${s.id},'contactEmail',this.value)" placeholder="email or phone">
        </div>
        <div class="space-field full">
          <div class="space-field-label">Listing / website link</div>
          <input class="space-field-input" value="${esc(s.link)}"
            oninput="updateSpaceField(${s.id},'link',this.value)" placeholder="https://…">
        </div>
        <div class="space-field">
          <div class="space-field-label">Lat (for map)</div>
          <input class="space-field-input" value="${esc(s.lat)}"
            oninput="updateSpaceField(${s.id},'lat',this.value)" placeholder="40.7xxx">
        </div>
        <div class="space-field">
          <div class="space-field-label">Lng (for map)</div>
          <input class="space-field-input" value="${esc(s.lng)}"
            oninput="updateSpaceField(${s.id},'lng',this.value)" placeholder="-73.9xxx">
        </div>
        <div class="space-field full">
          <div class="space-field-label">Notes about the space</div>
          <textarea class="space-textarea"
            oninput="updateSpaceField(${s.id},'notes',this.value)"
            placeholder="Ceiling height, natural light, raw vs finished, vibe, foot traffic observed…">${esc(s.notes)}</textarea>
        </div>
      </div>

      <div class="space-pros-cons">
        <div class="pros-box">
          <div class="pros-cons-label">Pros</div>
          <textarea class="space-textarea" style="background:transparent;border:none;padding:0;min-height:60px"
            oninput="updateSpaceField(${s.id},'pros',this.value)"
            placeholder="Location, price, light, layout…">${esc(s.pros)}</textarea>
        </div>
        <div class="cons-box">
          <div class="pros-cons-label">Cons</div>
          <textarea class="space-textarea" style="background:transparent;border:none;padding:0;min-height:60px"
            oninput="updateSpaceField(${s.id},'cons',this.value)"
            placeholder="Lease terms, foot traffic, condition…">${esc(s.cons)}</textarea>
        </div>
      </div>

      <div class="space-card-actions">
        <div class="space-field-label" style="margin-bottom:0">Status</div>
        <select class="space-status-select" onchange="updateSpaceField(${s.id},'status',this.value)">
          ${statusOpts}
        </select>
        ${s.link ? `<a class="space-link-btn" href="${esc(s.link)}" target="_blank" rel="noopener">View listing ↗</a>` : ''}
        <button class="space-action-btn research-btn" onclick="runSpaceResearch(${s.id})">
          ${s.research ? 'Re-run research ↻' : 'Pull neighbourhood context →'}
        </button>
        <button class="space-delete-btn" onclick="deleteSpace(${s.id})" title="Delete">✕</button>
      </div>

      <div class="space-research-panel${s.research?' open':''}" id="research-${s.id}">
        <div class="space-research-header">
          <span class="space-research-label">Neighbourhood context</span>
          <button class="space-research-close" onclick="document.getElementById('research-${s.id}').classList.toggle('open')">−</button>
        </div>
        <div class="space-research-body" id="research-body-${s.id}">
          ${s.research
            ? s.research.split('\n\n').map(p=>'<p>'+p.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>')+'</p>').join('')
            : '<div class="review-loading"><div class="pulse"><span></span><span></span><span></span></div><span>Pulling context…</span></div>'}
        </div>
      </div>
    </div>
  </div>`;
}

async function runSpaceResearch(id) {
  const spaces = getSpaces();
  const s = spaces.find(x => x.id === id);
  if (!s) return;

  const panel = document.getElementById('research-'+id);
  const body  = document.getElementById('research-body-'+id);
  if (!panel || !body) return;

  panel.classList.add('open');
  body.innerHTML = '<div class="review-loading"><div class="pulse"><span></span><span></span><span></span></div><span>Pulling neighbourhood context…</span></div>';

  const prompt = `You are a sharp NYC retail real estate advisor helping a founder scout spaces for The Front — a concept-driven collective retail space for emerging designers and experimental creatives.

Space details:
- Name/address: ${s.name || 'unknown'}, ${s.address || 'unknown'}
- Neighbourhood: ${s.neighborhood || 'unknown'}
- Rent: ${s.rent ? '$'+s.rent+'/mo' : 'unknown'}
- Sq ft: ${s.sqft || 'unknown'}
- Notes: ${s.notes || 'none'}

Write a concise neighbourhood context report with these sections (use **bold** for section headers):

**Neighbourhood profile** — character, who lives/works there, foot traffic patterns, time of day dynamics

**Retail + culture scene** — name specific concept stores, vintage shops, galleries, and independent retailers nearby that share The Front's aesthetic world. Who are the neighbours?

**Closest subway lines & stops** — be specific about lines (A/C/E, L, etc.) and walking distance

**The Front fit** — honestly assess how well this neighbourhood matches The Front's community (emerging designers, design-literate buyers, Parsons network). What would work and what would be a challenge?

**Recently opened / relevant** — any notable new openings, closures, or neighbourhood shifts worth knowing

**What to investigate** — 2-3 specific things to find out before deciding on this space

Keep it sharp and specific. Reference real places. No filler.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    const text = data.content.map(b => b.type==='text'?b.text:'').join('').trim();

    // save to space
    const sp2 = getSpaces();
    const sp  = sp2.find(x => x.id === id);
    if (sp) { sp.research = text; saveSpaces(sp2); }

    body.innerHTML = text.split('\n\n').map(p =>
      '<p>'+p.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>')+'</p>'
    ).join('');
    showToast('Context pulled ✓', '#a8c4d4');
  } catch(e) {
    body.innerHTML = '<p style="color:var(--muted);font-style:italic">Could not fetch context — check your connection.</p>';
  }
}

// ── MAP ─────────────────────────────────────────────────────────
let _leafletMap = null;
let _leafletMarkers = [];

function renderMap() {
  if (typeof L === 'undefined') return; // Leaflet not loaded yet
  const spaces  = getSpaces().filter(function(s){ return s.lat && s.lng; });
  const legend  = document.getElementById('spaces-legend-pins');
  const legendW = document.getElementById('spaces-map-legend');
  const mapCon  = document.getElementById('spaces-map-container');
  if (!mapCon) return;

  if (!spaces.length) {
    // Destroy existing map if any
    if (_leafletMap) { _leafletMap.remove(); _leafletMap = null; }
    mapCon.style.display = 'flex';
    mapCon.innerHTML = '<span style="font-size:22px">&#x1F5FA;</span><span style="font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#666">Add lat/lng to see map</span>';
    if (legendW) legendW.style.display = 'none';
    return;
  }

  const center = spaces.reduce(function(acc, s) {
    return { lat: acc.lat + parseFloat(s.lat)/spaces.length, lng: acc.lng + parseFloat(s.lng)/spaces.length };
  }, {lat:0, lng:0});

  // Initialise or reuse the Leaflet map
  if (!_leafletMap) {
    mapCon.innerHTML = '';
    mapCon.style.height = '320px';
    mapCon.style.display = 'block';
    _leafletMap = L.map(mapCon, { zoomControl: true, attributionControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(_leafletMap);
  }

  // Clear old markers
  _leafletMarkers.forEach(function(m){ _leafletMap.removeLayer(m); });
  _leafletMarkers = [];

  // Add markers
  spaces.forEach(function(s, i) {
    var sm  = STATUS_META[s.status] || STATUS_META.pending;
    var col = sm.color.replace('var(--front)','#d4b896').replace('var(--muted)','#888').replace('var(--fog)','#a8c4d4');
    var name = s.name || ('Space ' + (i+1));
    var rent = s.rent ? ' · $' + s.rent + '/mo' : '';
    var nbhd = s.neighborhood || '';
    var popup = '<div style="font-size:13px"><strong>' + name + '</strong>' +
                (nbhd || rent ? '<br><span style="font-size:10px;color:#aaa">' + nbhd + rent + '</span>' : '') +
                '</div>';
    var marker = L.circleMarker([parseFloat(s.lat), parseFloat(s.lng)], {
      radius: 9, fillColor: col, color: '#0c0c0f', weight: 2, fillOpacity: 0.9
    }).addTo(_leafletMap).bindPopup(popup);
    _leafletMarkers.push(marker);
  });

  // Fit bounds
  var group = L.featureGroup(_leafletMarkers);
  _leafletMap.fitBounds(group.getBounds().pad(0.2));
  if (spaces.length === 1) _leafletMap.setZoom(15);

  // Legend
  if (legendW) legendW.style.display = 'block';
  if (legend) {
    legend.innerHTML = spaces.map(function(s, i) {
      var sm = STATUS_META[s.status] || STATUS_META.pending;
      return '<div class="spaces-map-pin" onclick="toggleSpace('+s.id+');renderSpaces()">' +
        '<div class="spaces-map-pin-dot" style="background:'+sm.color+'"></div>' +
        '<span class="spaces-map-pin-name">' + esc(s.name||('Space '+(i+1))) + '</span>' +
        '<span class="spaces-map-pin-addr">' + esc(s.neighborhood||'') + '</span>' +
        '</div>';
    }).join('');
  }

  // Invalidate size after any CSS transitions settle
  setTimeout(function(){ if (_leafletMap) _leafletMap.invalidateSize(); }, 200);
}

function initSpaces() {
  renderSpaces();
}
initSpaces();

// ─── AI REVIEW ─────────────────────────
const REVIEW_SYSTEM = {
  'front-questions': 'You are a sharp, honest business advisor for The Front — a NYC collective retail space for emerging designers. The founder has answered planning questions. Your job: (1) give a Clarity score 1-10 and Cohesion score 1-10 for the answers overall, (2) write 2-3 paragraphs synthesising what the answers reveal — be specific, reference what they wrote, highlight what is strong and what is vague or underdeveloped, (3) end with a "Consider next" section: 2-3 specific, actionable things to work on. Format your response as JSON: { "clarity": 7, "cohesion": 6, "synthesis": "paragraph 1\n\nparagraph 2\n\nparagraph 3", "next": "1. item\n2. item\n3. item" }',
  'front-reflect': 'You are a thoughtful advisor for The Front founder. They have answered weekly reflection questions. Assess: (1) Clarity score 1-10 (how clear is their thinking?), (2) Cohesion score 1-10 (how well do the answers fit together?), (3) 2-3 paragraphs synthesising what their answers reveal about their mindset, momentum, and what they might be avoiding, (4) "Consider next": 2-3 specific prompts or actions for the week ahead. Return JSON: { "clarity": 7, "cohesion": 6, "synthesis": "...", "next": "1. ...\n2. ...\n3. ..." }',
  'front-action': 'You are a direct execution coach for The Front. They have answered action check-in questions. Score: (1) Clarity 1-10, (2) Cohesion 1-10. Write 2 paragraphs: what their answers show about actual momentum vs. avoidance, and one clear recommendation. Add "Consider next" with 2-3 specific actions. JSON: { "clarity": 7, "cohesion": 6, "synthesis": "...", "next": "1. ...\n2. ...\n3. ..." }',
  'front-balance': 'You are a warm but honest wellbeing advisor for The Front founder. Score Clarity 1-10 and Cohesion 1-10 for their answers. Write 2 paragraphs on what their answers reveal about energy and sustainability. End with "Consider next" — 2-3 grounding, practical suggestions. JSON: { "clarity": 7, "cohesion": 6, "synthesis": "...", "next": "1. ...\n2. ...\n3. ..." }',
  'bizplan-general': 'You are a sharp business plan advisor. The founder has filled in their general business plan for The Front NYC. Score Clarity 1-10 (how clearly each section communicates) and Cohesion 1-10 (how well the whole plan holds together). Write 3 paragraphs: strengths, gaps, and what still reads as vague or assumed. End with "Consider next": 3 specific things to sharpen. JSON: { "clarity": 7, "cohesion": 6, "synthesis": "...", "next": "1. ...\n2. ...\n3. ..." }',
  'bizplan-parsons': 'You are a grant writing advisor. Review these Parsons grant application answers for The Front. Score Clarity 1-10 and Persuasiveness 1-10. Write 2-3 paragraphs: what is compelling, what needs more specificity, what Parsons reviewers will want to see. "Consider next": 3 things to strengthen before submitting. JSON: { "clarity": 7, "cohesion": 6, "synthesis": "...", "next": "1. ...\n2. ...\n3. ..." }',
  'story': 'You are a brand strategist. Review this brand story and voice work for The Front. Score Clarity 1-10 (how clearly the brand communicates) and Cohesion 1-10 (how consistent the voice is across contexts). Write 2-3 paragraphs: what is working, what feels generic or inconsistent, what is missing. "Consider next": 3 specific language or positioning things to develop. JSON: { "clarity": 7, "cohesion": 6, "synthesis": "...", "next": "1. ...\n2. ...\n3. ..." }',
  'fog-questions': 'You are a sharp CPG/beverage business advisor for Heft Gallery — a London Fog tea concentrate. Score Clarity 1-10 and Cohesion 1-10. Write 2-3 paragraphs synthesising the planning answers: what is clear and strong, what is still assumed or vague, what the barista-first strategy actually requires. "Consider next": 3 specific actions. JSON: { "clarity": 7, "cohesion": 6, "synthesis": "...", "next": "1. ...\n2. ...\n3. ..." }',
  'fog-reflect': 'You are an advisor for the Heft Gallery founder. Score Clarity 1-10 and Cohesion 1-10. Write 2 paragraphs on what their reflection reveals about their readiness and focus. "Consider next": 2-3 things for the week ahead. JSON: { "clarity": 7, "cohesion": 6, "synthesis": "...", "next": "1. ...\n2. ...\n3. ..." }',
  'fog-action': 'Direct execution coach for Heft Gallery. Score Clarity 1-10 and Cohesion 1-10. 2 paragraphs on momentum vs. avoidance. "Consider next": 2-3 actions. JSON: { "clarity": 7, "cohesion": 6, "synthesis": "...", "next": "1. ...\n2. ...\n3. ..." }',
  'fog-balance': 'Wellbeing advisor for Heft Gallery founder. Score Clarity 1-10 and Cohesion 1-10. 2 paragraphs on energy and sustainability. "Consider next": 2-3 grounding suggestions. JSON: { "clarity": 7, "cohesion": 6, "synthesis": "...", "next": "1. ...\n2. ...\n3. ..." }',
  'brand-identity': "You are a sharp, exacting brand advisor for The Front — a living curatorial space in downtown Manhattan treating retail as an experimental format driven by concept: showcasing work, exploring visual craft, building creative community. Hold every answer to that definition. Score: (1) Clarity 1-10 — how precisely does each answer communicate? (2) Cohesion 1-10 — does the whole thing point in one direction? Write 3 paragraphs: what is specific and earned, where language drifts into abstraction, what the answers reveal about whether this has a real spine. Be direct. Reference what was actually written. End with Consider next: 3 specific uncomfortable questions still unanswered. JSON: { \"clarity\": 7, \"cohesion\": 6, \"synthesis\": \"...\", \"next\": \"1. ...\\n2. ...\\n3. ...\" }",
  'visual-identity': 'You are a creative director reviewing the visual identity development for The Front NYC. The founder has described their references, color thinking, type choices, and applications. Score: (1) Clarity 1-10 (how clearly defined and actionable the visual direction is), (2) Cohesion 1-10 (do the color, type, signage, and packaging choices feel like one consistent system?). Write 2-3 paragraphs: what is working and feels distinctive, what is still vague or contradictory, and where the visual choices might undermine or support the brand identity. "Consider next": 3 specific decisions to make or experiments to run. JSON: { "clarity": 7, "cohesion": 6, "synthesis": "...", "next": "1. ...\n2. ...\n3. ..." }',
};

async function openReview(reviewType) {
  // Determine which form to read
  let formId, project, tab;
  if (reviewType.includes('-')) {
    const parts = reviewType.split('-');
    project = parts[0];
    tab = parts.slice(1).join('-');
    formId = 'form-' + reviewType;
  }

  // Collect answers
  let qaText = '';
  const form = document.getElementById(formId);
  if (form) {
    form.querySelectorAll('.item[data-id]').forEach(item => {
      const label = item.querySelector('.item-label')?.textContent?.trim() || '';
      const val   = item.querySelector('.item-input')?.value?.trim() || '';
      if (val) qaText += 'Q: ' + label + '\nA: ' + val + '\n\n';
    });
  }

  // For BP / story types, collect from getBPData
  if (reviewType === 'bizplan-general') {
    const d = getBPData();
    const keys = ['gen-exec-what','gen-exec-who','gen-exec-why','gen-prob-designers','gen-prob-audience','gen-prob-why-nyc','gen-model-format','gen-model-vendor','gen-model-distinct','gen-costs','gen-breakeven','gen-market-customer','gen-market-comp','gen-milestones','gen-legal','gen-team'];
    const labels = {'gen-exec-what':'What is The Front?','gen-exec-who':'Who is it for?','gen-exec-why':'Why does it matter now?','gen-prob-designers':'Problem for designers','gen-prob-audience':'Problem for audiences','gen-prob-why-nyc':'Why now why NYC','gen-model-format':'Core format','gen-model-vendor':'Vendor relationship','gen-model-distinct':'What makes cycles distinct','gen-costs':'Monthly fixed costs','gen-breakeven':'Break-even','gen-market-customer':'Customer','gen-market-comp':'Competitors','gen-milestones':'Key milestones','gen-legal':'Legal status','gen-team':'Team'};
    keys.forEach(k => { if (d[k]) qaText += 'Q: ' + labels[k] + '\nA: ' + d[k] + '\n\n'; });
  }
  if (reviewType === 'bizplan-parsons') {
    const d = getBPData();
    const keys = ['par-opening','par-parsons-gets','par-programs','par-edge','par-ask','par-longterm','par-budget'];
    const labels = {'par-opening':'Opening statement','par-parsons-gets':'What Parsons gets','par-programs':'Parsons programs highlighted','par-edge':'What makes Parsons designers distinct','par-ask':'Grant ask','par-longterm':'Long-term relationship','par-budget':'Budget narrative'};
    keys.forEach(k => { if (d[k]) qaText += 'Q: ' + labels[k] + '\nA: ' + d[k] + '\n\n'; });
  }
  if (reviewType === 'story') {
    const d = getBPData();
    const keys = ['story-mission','story-elevator','story-words','story-not','story-voice','story-grant','story-vendor','story-press','story-bio'];
    const labels = {'story-mission':'Mission statement','story-elevator':'Elevator pitch','story-words':'3 words','story-not':'What it is NOT','story-voice':'Brand voice','story-grant':'For grant','story-vendor':'For vendor','story-press':'For press','story-bio':'Instagram bio'};
    keys.forEach(k => { if (d[k]) qaText += 'Q: ' + labels[k] + '\nA: ' + d[k] + '\n\n'; });
  }
  if (reviewType === 'brand-identity') {
    const d = getBPData();
    const keys = ['brand-one-sentence','brand-problem','brand-not','brand-audience-designer','brand-audience-customer','brand-three-words','brand-competitive','brand-success','brand-revenue-streams','brand-vendor-selection'];
    const labels = {'brand-one-sentence':'In one sentence, what is The Front?','brand-problem':'What problem does it solve and for who?','brand-not':'What is The Front NOT?','brand-audience-designer':'The designer/vendor audience','brand-audience-customer':'The customer audience','brand-three-words':'3 defining words','brand-competitive':'Competitive awareness','brand-success':'What success looks like in 2 years','brand-revenue-streams':'Revenue streams','brand-vendor-selection':'How vendors are selected'};
    keys.forEach(k => { if (d[k]) qaText += 'Q: ' + labels[k] + '\nA: ' + d[k] + '\n\n'; });
  }
  if (reviewType === 'visual-identity') {
    const d = getBPData();
    const keys = ['vis-references','vis-feeling','vis-color-notes','vis-font-display','vis-font-body','vis-type-notes','vis-signage','vis-packaging','vis-digital','vis-avoid'];
    const labels = {'vis-references':'Visual references','vis-feeling':'Feeling of the visual system','vis-color-notes':'Color notes','vis-font-display':'Display typeface','vis-font-body':'Body typeface','vis-type-notes':'Type rules','vis-signage':'Signage approach','vis-packaging':'Packaging','vis-digital':'Digital presence','vis-avoid':'What to avoid visually'};
    keys.forEach(k => { if (d[k]) qaText += 'Q: ' + labels[k] + '\nA: ' + d[k] + '\n\n'; });
  }

  if (!qaText.trim()) {
    showToast('Answer some questions first', '#e0845a');
    return;
  }

  const panelId = 'review-' + reviewType.replace('bizplan-','front-').replace('story','front-story');
  const panel = (
    reviewType === 'bizplan-general' ? document.getElementById('review-front-bizplan-general') :
    reviewType === 'bizplan-parsons' ? document.getElementById('review-front-bizplan-parsons') :
    reviewType === 'story'           ? document.getElementById('review-front-story') :
    reviewType === 'brand-identity'  ? document.getElementById('review-brand-identity') :
    reviewType === 'visual-identity' ? document.getElementById('review-visual-identity') :
    document.getElementById('review-' + reviewType)
  );

  if (!panel) {
    showToast('Review panel not found', '#e0845a');
    return;
  }

  panel.classList.add('visible');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  panel.querySelector('.review-panel-body').innerHTML = '<div class="review-loading"><div class="pulse"><span></span><span></span><span></span></div><span>Analysing your answers…</span></div>';
  const scoresEl = panel.querySelector('[id^="review-scores"]');
  if (scoresEl) scoresEl.innerHTML = '';

  const sysPrompt = REVIEW_SYSTEM[reviewType] || REVIEW_SYSTEM['front-questions'];

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        system: sysPrompt,
        messages: [{ role: 'user', content: 'Here are the answers to review:\n\n' + qaText + '\nReturn ONLY valid JSON, nothing else.' }]
      })
    });
    const data = await res.json();
    // Check for API-level errors first
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    let raw = (data.content||[]).map(b => b.type === 'text' ? b.text : '').join('').trim();
    if (!raw) throw new Error('Empty response from API — check billing at console.anthropic.com');
    raw = raw.replace(/^```json\s*/,'').replace(/^```\s*/,'').replace(/```\s*$/,'').trim();
    const parsed = JSON.parse(raw);

    // Scores
    const score1Label = reviewType.includes('parsons') ? 'Persuasive' : 'Cohesion';
    const clarityVal = typeof parsed.clarity === 'number' ? parsed.clarity : parseInt(parsed.clarity) || '—';
    const cohesionVal = typeof (parsed.cohesion||parsed.persuasiveness) === 'number' ? (parsed.cohesion||parsed.persuasiveness) : parseInt(parsed.cohesion||parsed.persuasiveness) || '—';
    if (scoresEl) {
      scoresEl.innerHTML =
        '<div class="review-score-item"><div class="review-score-val">' + clarityVal + '</div><div class="review-score-lbl">Clarity</div></div>' +
        '<div class="review-score-item"><div class="review-score-val">' + cohesionVal + '</div><div class="review-score-lbl">' + score1Label + '</div></div>';
    }

    // Synthesis
    function toStr(val) {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (Array.isArray(val)) return val.join('\n');
      if (typeof val === 'object') return Object.values(val).join('\n');
      return String(val);
    }
    const synthRaw = toStr(parsed.synthesis);
    const synthHtml = synthRaw.split(/\n\n+/).map(p => '<p>' + p.replace(/\n/g,'<br>') + '</p>').join('');
    const nextText = toStr(parsed.next);
    const nextHtml = nextText
      ? '<div class="review-next"><div class="review-next-label">Consider next</div><div class="review-next-content">' +
        nextText.replace(/\n/g,'<br>') + '</div></div>'
      : '';

    panel.querySelector('.review-panel-body').innerHTML =
      '<div class="review-content">' + synthHtml + nextHtml + '</div>';

  } catch(e) {
    panel.querySelector('.review-panel-body').innerHTML =
      '<div class="review-content"><p style="color:#e07070;font-family:DM Mono,monospace;font-size:9px">Error: ' + (e.message||'unknown') + '</p>' +
      '<p style="color:var(--muted);font-family:DM Mono,monospace;font-size:9px;margin-top:8px">Check that your API key is set (⚙ AI Key in the top bar) and that your Anthropic account has billing activated at console.anthropic.com.</p></div>';
  }
}

// ─── DOCUMENT EXPORT ──────────────────
function getBPVal(key) {
  try { return getBPData()[key] || ''; } catch { return ''; }
}

function qa(question, key, emptyNote) {
  const val = getBPVal(key).trim();
  const answer = val
    ? `<div class="doc-a">${val.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`
    : `<div class="doc-a-empty">${emptyNote || 'Not yet answered.'}</div>`;
  return `<div class="doc-qa"><div class="doc-q">${question}</div>${answer}</div>`;
}

function section(title, content) {
  return `<div class="doc-section"><div class="doc-section-title">${title}</div>${content}</div>`;
}

function openDocExport(type) {
  const now = new Date();
  const updated = 'Last updated ' + now.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'}) + ' at ' + now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});

  function q(question, key, note) {
    const val = (getBPVal(key)||'').trim();
    const ans = val
      ? '<div class="doc-a">' + val.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>') + '</div>'
      : '<div class="doc-a-empty">' + (note||'Not yet answered.') + '</div>';
    return '<div class="doc-qa"><div class="doc-q">' + question + '</div>' + ans + '</div>';
  }

  function sec(title, content) {
    return '<div class="doc-section"><div class="doc-section-title">' + title + '</div>' + content + '</div>';
  }

  let title, subtitle, body;

  if (type === 'bizplan') {
    title = 'The Front';
    subtitle = 'Business Plan';
    body =
      sec('Executive Summary',
        q('What is The Front?', 'gen-exec-what') +
        q('Who is it for?', 'gen-exec-who') +
        q('Why does it matter now?', 'gen-exec-why')
      ) +
      sec('The Problem',
        q('The problem for designers', 'gen-prob-designers') +
        q('The problem for audiences & customers', 'gen-prob-audience') +
        q('Why now, why NYC', 'gen-prob-why-nyc')
      ) +
      sec('The Model',
        q('Core format', 'gen-model-format') +
        q('Vendor / designer relationship', 'gen-model-vendor') +
        q('What makes each cycle feel distinct', 'gen-model-distinct') +
        q('Commission structure', 'fin-model-final')
      ) +
      sec('Financials',
        q('Monthly fixed costs', 'gen-costs') +
        q('Break-even analysis', 'gen-breakeven') +
        q('Upfront funding plan', 'fin-upfront-plan') +
        q('Other funding leads', 'fin-other-funding')
      ) +
      sec('Market',
        q('The customer', 'gen-market-customer') +
        q('Comparable spaces & how The Front differs', 'gen-market-comp')
      ) +
      sec('Milestones & Operations',
        q('Key milestones — next 12 months', 'gen-milestones') +
        q('Legal structure / status', 'gen-legal') +
        q('Team', 'gen-team')
      );
  }
  else if (type === 'story') {
    title = 'The Front';
    subtitle = 'Brand Story & Voice';
    body =
      sec('Core Statements',
        q('Mission statement', 'story-mission') +
        q('Elevator pitch', 'story-elevator') +
        q('3 words that define the brand', 'story-words') +
        q('What The Front is NOT', 'story-not')
      ) +
      sec('Voice & Tone',
        q('Brand voice notes', 'story-voice')
      ) +
      sec('Audience-Specific Language',
        q('For a grant application', 'story-grant') +
        q('For a designer / vendor', 'story-vendor') +
        q('For press / editorial', 'story-press') +
        q('Instagram / short-form bio', 'story-bio')
      );
  }
  else if (type === 'popup') {
    title = '334 Broome';
    subtitle = 'Pop-Up Plan — The Front';
    const dateRows = [
      ['Space confirmed','popup-confirmed'],['Setup / install','popup-setup'],
      ['Opening','popup-open'],['Closing / strike','popup-close'],
      ['Opening event','popup-opening-event'],['Mid-run activation','popup-midrun']
    ];
    const datesContent = dateRows.map(([lbl,key]) => {
      const v = getBPVal(key);
      return v ? lbl + ': ' + v : '';
    }).filter(Boolean).join('\n');
    const datesHtml = '<div class="doc-qa"><div class="doc-q">Key dates</div>' +
      (datesContent ? '<div class="doc-a">' + datesContent + '</div>' : '<div class="doc-a-empty">No dates set yet.</div>') +
      '</div>';
    body =
      sec('Goals & Key Dates',
        q('What this run needs to prove', 'popup-goal') +
        q('How you will document and measure it', 'popup-measure') +
        datesHtml
      ) +
      sec('Marketing & Press',
        q('Press — who you will pitch', 'popup-press') +
        q('Instagram strategy', 'popup-instagram') +
        q('Email + personal invites', 'popup-email') +
        q('Flyers / physical presence', 'popup-flyers')
      ) +
      sec('Funding & Coverage',
        q('How you are covering this', 'popup-funding')
      ) +
      sec('Learnings (Post-Run)',
        q('Sales & revenue data', 'popup-learn-sales') +
        q('Foot traffic & conversion', 'popup-learn-traffic') +
        q('Events & press', 'popup-learn-events') +
        q('Vendor feedback', 'popup-learn-vendors') +
        q('What surprised me / what I would do differently', 'popup-learnings')
      );
  }

  // ── Session-based tabs: read from archive (most recent entry) ──────
  function getLatestAnswers(project, tab) {
    const arch = getArchive(project);
    const entry = arch.find(e => e.tab === tab);
    return entry ? entry.answers : {};
  }

  function qaFromAnswers(answers, formId) {
    const form = document.getElementById(formId);
    if (!form) return '';
    let html = '';
    form.querySelectorAll('.item[data-id]').forEach(item => {
      const id  = item.getAttribute('data-id');
      const lbl = item.querySelector('.item-label')?.textContent?.trim() || id;
      const val = (answers[id]||'').trim();
      if (val) {
        html += '<div class="doc-qa"><div class="doc-q">' + lbl + '</div><div class="doc-a">' +
          val.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>') +
          '</div></div>';
      } else {
        html += '<div class="doc-qa"><div class="doc-q">' + lbl + '</div><div class="doc-a-empty">Not yet answered.</div></div>';
      }
    });
    return html;
  }

  function sessionDoc(project, tab, titleStr, subtitleStr, color) {
    const answers = getLatestAnswers(project, tab);
    const formId  = 'form-' + project + '-' + tab;
    return { title: titleStr, subtitle: subtitleStr, body: sec('Session answers', qaFromAnswers(answers, formId)), color };
  }

  let docData = null;

  if      (type === 'front-questions')  docData = sessionDoc('front','questions','The Front','Planning Session','#c9a8d4');
  else if (type === 'front-reflect')    docData = sessionDoc('front','reflect',  'The Front','Reflection Session','#c9a8d4');
  else if (type === 'front-action')     docData = sessionDoc('front','action',   'The Front','Action Check-in','#e2c97e');
  else if (type === 'front-balance')    docData = sessionDoc('front','balance',  'The Front','Balance Check-in','#82bfbb');
  else if (type === 'fog-questions')    docData = sessionDoc('fog',  'questions','Heft Gallery','Planning Session','#a8c4d4');
  else if (type === 'fog-reflect')      docData = sessionDoc('fog',  'reflect',  'Heft Gallery','Reflection Session','#a8c4d4');
  else if (type === 'fog-action')       docData = sessionDoc('fog',  'action',   'Heft Gallery','Action Check-in','#e2c97e');
  else if (type === 'fog-balance')      docData = sessionDoc('fog',  'balance',  'Heft Gallery','Balance Check-in','#82bfbb');
  else if (type === 'front-financials') {
    const d = getBPData();
    docData = { title:'The Front', subtitle:'Financials & Funding', color:'#88c98a',
      body: sec('Core Financials',
        q('How you are covering upfront costs', 'fin-upfront-plan') +
        q('Commission structure decision', 'fin-model-final') +
        q('Other funding leads', 'fin-other-funding')
      )
    };
  }
  else if (type === 'front-tracker') {
    const tasks = getAllTasks ? getAllTasks() : [];
    const byStatus = { todo:[], inprogress:[], blocked:[], done:[] };
    tasks.forEach(t => { (byStatus[t.status] || byStatus.todo).push(t); });
    function taskRows(arr) {
      if (!arr.length) return '<div class="doc-a-empty">None.</div>';
      return arr.map(t => '<div class="doc-qa"><div class="doc-q">' + (t.cat||'') + '</div><div class="doc-a">' + (t.title||'Untitled') + (t.due ? ' — due ' + t.due : '') + '</div></div>').join('');
    }
    docData = { title:'The Front', subtitle:'Project Tracker', color:'#a8c4d4',
      body: sec('To Do', taskRows(byStatus.todo)) +
            sec('In Progress', taskRows(byStatus.inprogress)) +
            sec('Blocked', taskRows(byStatus.blocked)) +
            sec('Done', taskRows(byStatus.done))
    };
  }
  else if (type === 'front-programming') {
    docData = { title:'The Front', subtitle:'Programming', color:'#c9a8d4', body: sec('Programming notes', '<div class="doc-a-empty">Export your saved programming notes here.</div>') };
  }
  else if (type === 'front-partnerships') {
    docData = { title:'The Front', subtitle:'Partnerships & Outreach', color:'#d4b896', body: sec('Partnerships notes', '<div class="doc-a-empty">Export your saved partnerships notes here.</div>') };
  }
  else if (type === 'front-spaces') {
    const spaces = getSpaces();
    function spaceSection(s) {
      const statusLabel = (STATUS_META[s.status]||{label:'Pending'}).label;
      const fields = [
        ['Address', s.address], ['Neighbourhood', s.neighborhood],
        ['Sq ft', s.sqft], ['Monthly rent', s.rent ? '$'+s.rent+'/mo' : ''],
        ['Date toured', s.toured], ['Contact', s.contact],
        ['Contact email / phone', s.contactEmail], ['Status', statusLabel],
        ['Listing link', s.link]
      ].filter(([,v])=>v).map(([lbl,val]) =>
        '<div class="doc-qa"><div class="doc-q">'+lbl+'</div><div class="doc-a">'+val+'</div></div>'
      ).join('');
      function safeText(t){ return (t||'').split('<').join('&lt;').split('>').join('&gt;').split('\n').join('<br>'); }
      const notes = s.notes ? '<div class="doc-qa"><div class="doc-q">Notes</div><div class="doc-a">'+safeText(s.notes)+'</div></div>' : '';
      const pros  = s.pros  ? '<div class="doc-qa"><div class="doc-q" style="color:#88c98a">Pros</div><div class="doc-a">'+safeText(s.pros)+'</div></div>' : '';
      const cons  = s.cons  ? '<div class="doc-qa"><div class="doc-q" style="color:#e0845a">Cons</div><div class="doc-a">'+safeText(s.cons)+'</div></div>' : '';
      const research = s.research ? '<div class="doc-qa"><div class="doc-q">Neighbourhood context</div><div class="doc-a" style="font-size:14px">'+safeText(s.research)+'</div></div>' : '';
      return sec(s.name||'Untitled space', fields+notes+pros+cons+research);
    }
    const spaceBody = spaces.length
      ? spaces.map(s=>spaceSection(s)).join('')
      : '<div class="doc-a-empty">No spaces logged yet.</div>';
    docData = { title:'The Front', subtitle:'Space Leads Directory', color:'#a8c4d4', body: spaceBody };
  }

  if (docData) {
    title    = docData.title;
    subtitle = docData.subtitle;
    body     = docData.body;
  }

    const modal = '<div class="doc-modal-overlay" id="doc-modal-overlay">' +
    '<div class="doc-modal">' +
    '<button class="doc-modal-close" onclick="closeDocExport()">&#x2715; Close</button>' +
    '<button class="doc-modal-print" onclick="window.print()">Print / Save PDF</button>' +
    '<div class="doc-updated">' + updated + '</div>' +
    '<div class="doc-title">' + title + '</div>' +
    '<div class="doc-subtitle">' + subtitle + '</div>' +
    body +
    '</div></div>';

  document.body.insertAdjacentHTML('beforeend', modal);
  document.body.style.overflow = 'hidden';
}

function closeDocExport() {
  document.getElementById('doc-modal-overlay')?.remove();
  document.body.style.overflow = '';
}

// ─── EXPORT / IMPORT ──────────────────
const DATA_KEYS = [
  'budget_upfront_v1','budget_monthly_v1','budget_popup_v1',
  'tracker_front_v1','tracker_popup_v1',
  'front_vendors_v1','popup_vendors_v1',
  'front_bizplan_v1','fog_bizplan_v1',
  'front_refs_v1','front_articles_v1','roadmap_state_v1','front_contacts_v1','today_items_v1','focus_log_front_v1','focus_log_fog_v1',
];


// ─── DATA BRIDGE MODAL ────────────────
function openDataModal() {
  var modal = document.getElementById('data-bridge-modal');
  if (modal) modal.style.display = 'flex';
  // Clear import area
  var imp = document.getElementById('data-import-area');
  if (imp) imp.value = '';
  // Clear export area
  var exp = document.getElementById('data-export-area');
  if (exp) exp.value = '';
}

function closeDataModal() {
  var modal = document.getElementById('data-bridge-modal');
  if (modal) modal.style.display = 'none';
}

function loadExportArea() {
  var all = {};
  for (var i = 0; i < localStorage.length; i++) {
    var k = localStorage.key(i);
    try { all[k] = JSON.parse(localStorage.getItem(k)); }
    catch(e) { all[k] = localStorage.getItem(k); }
  }
  var json = JSON.stringify(all);
  var area = document.getElementById('data-export-area');
  if (area) {
    area.value = json;
    area.select();
    // Try clipboard
    try { navigator.clipboard.writeText(json).then(function(){ area.placeholder = 'Copied to clipboard! Also select all and copy manually as backup.'; }); } catch(e) {}
  }
}

function importFromText() {
  var area = document.getElementById('data-import-area');
  if (!area || !area.value.trim()) {
    alert('Please paste your data into the box first.');
    return;
  }
  try {
    var data = JSON.parse(area.value.trim());
    var count = 0;
    Object.keys(data).forEach(function(k) {
      var val = data[k];
      try {
        localStorage.setItem(k, typeof val === 'string' ? val : JSON.stringify(val));
        count++;
      } catch(e) {}
    });
    alert('Imported ' + count + ' items. Page will reload now.');
    location.reload();
  } catch(e) {
    alert('That doesn\'t look like valid data. Make sure you copied the full text from the export box.');
  }
}

// Close modal on backdrop click
document.addEventListener('click', function(e) {
  var modal = document.getElementById('data-bridge-modal');
  if (e.target === modal) closeDataModal();
});

function exportData() {
  const snapshot = {};
  for (const key of DATA_KEYS) {
    const val = localStorage.getItem(key);
    if (val) snapshot[key] = JSON.parse(val);
  }
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!snapshot[k]) {
      try { snapshot[k] = JSON.parse(localStorage.getItem(k)); }
      catch { snapshot[k] = localStorage.getItem(k); }
    }
  }
  const json = JSON.stringify(snapshot, null, 2);
  const filename = 'workspace-backup-' + new Date().toISOString().slice(0,10) + '.json';

  // Try direct download first
  try {
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Exported ✓', '#88c98a');
  } catch(e) {
    // Fallback: show data in a copy-able modal
    showExportModal(json, filename);
  }
}

function showExportModal(json, filename) {
  var existing = document.getElementById('export-data-modal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'export-data-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box';

  var box = document.createElement('div');
  box.style.cssText = 'background:#1a1a1e;border:1px solid #333;border-radius:6px;width:100%;max-width:560px;overflow:hidden';

  var header = document.createElement('div');
  header.style.cssText = 'padding:16px 20px;border-bottom:1px solid #333;display:flex;align-items:center;justify-content:space-between';
  header.innerHTML = '<span style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#f0ede6">Export your data</span>';
  var closeBtn = document.createElement('button');
  closeBtn.textContent = 'x';
  closeBtn.style.cssText = 'background:none;border:none;color:#888;font-size:16px;cursor:pointer';
  closeBtn.onclick = function() { modal.remove(); };
  header.appendChild(closeBtn);

  var body = document.createElement('div');
  body.style.cssText = 'padding:16px 20px';

  var desc = document.createElement('p');
  desc.style.cssText = 'font-size:14px;color:#aaa;margin:0 0 12px;line-height:1.6;font-family:Georgia,serif';
  desc.textContent = 'Click "Try download" or copy the text below and save it as workspace-data.json';
  body.appendChild(desc);

  var btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap';

  var dlBtn = document.createElement('button');
  dlBtn.textContent = 'Try download';
  dlBtn.style.cssText = 'background:#88c98a;border:none;color:#0c0c0f;font-family:monospace;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;padding:9px 16px;border-radius:2px;cursor:pointer';
  dlBtn.onclick = function() {
    var blob = new Blob([json], {type:'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  var copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy to clipboard';
  copyBtn.style.cssText = 'background:none;border:1px solid #444;color:#f0ede6;font-family:monospace;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;padding:9px 16px;border-radius:2px;cursor:pointer';
  copyBtn.onclick = function() {
    ta.select();
    navigator.clipboard.writeText(json).then(function() {
      copyBtn.textContent = 'Copied!';
    }).catch(function() {
      document.execCommand('copy');
      copyBtn.textContent = 'Copied!';
    });
  };

  btnRow.appendChild(dlBtn);
  btnRow.appendChild(copyBtn);
  body.appendChild(btnRow);

  var lbl = document.createElement('p');
  lbl.textContent = 'Or select all and copy manually:';
  lbl.style.cssText = 'font-family:monospace;font-size:9px;color:#666;margin:0 0 6px';
  body.appendChild(lbl);

  var ta = document.createElement('textarea');
  ta.value = json;
  ta.readOnly = true;
  ta.style.cssText = 'width:100%;height:140px;background:#111;border:1px solid #333;border-radius:2px;color:#888;font-family:monospace;font-size:9px;padding:10px;box-sizing:border-box;resize:none;outline:none';
  ta.onclick = function() { this.select(); };
  body.appendChild(ta);

  var note = document.createElement('p');
  note.style.cssText = 'font-family:monospace;font-size:8px;color:#555;margin:8px 0 0';
  note.textContent = 'Save as: ' + filename;
  body.appendChild(note);

  box.appendChild(header);
  box.appendChild(body);
  modal.appendChild(box);
  document.body.appendChild(modal);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!confirm('This will overwrite all current workspace data. Continue?')) return;
      localStorage.clear();
      for (const [key, val] of Object.entries(data)) {
        try {
          localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
        } catch(err) {
          if (err.name === 'QuotaExceededError') {
            alert('Import stopped: file too large for storage. Try importing without photos.');
            break;
          }
        }
      }
      showToast('Imported ✓ — reloading…', '#88c98a');
      setTimeout(() => location.reload(), 1200);
    } catch {
      alert('Invalid backup file.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function showToast(msg, color) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = typeof color === 'string' && color.startsWith('var') 
    ? getComputedStyle(document.documentElement).getPropertyValue(color.replace('var(','').replace(')','').trim())
    : (color || '#e2c97e');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

(function() {
      var s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = function() {
        // Re-render map if spaces tab has been visited
        if (typeof renderMap === 'function') renderMap();
      };
      document.head.appendChild(s);
    })();
  
// ── Timeline / Calendar ────────────────────────────────────────────────
var VI_CAL_VIEW = 'month';   // 'month' | 'week' | 'list'
var VI_CAL_OFFSET = 0;       // months or weeks offset from today
var VI_EDIT_ID = null;

// Default tasks expressed as relative day offsets from a "start date"
// We store them with real ISO dates so the calendar can place them.
function viGetCalStart() {
  // Use stored start date or default to next Monday
  var stored = localStorage.getItem('vi_cal_start');
  if (stored) return new Date(stored);
  var d = new Date(); d.setHours(0,0,0,0);
  var dow = d.getDay(); // 0=Sun
  var toMon = (dow === 0) ? 1 : (8 - dow) % 7 || 7;
  d.setDate(d.getDate() + toMon);
  localStorage.setItem('vi_cal_start', d.toISOString().slice(0,10));
  return d;
}

function addDays(d, n) { var r = new Date(d); r.setDate(r.getDate()+n); return r; }
function isoDate(d) { return d.toISOString().slice(0,10); }
function parseDate(s) { var p=s.split('-'); return new Date(+p[0],+p[1]-1,+p[2]); }

function getViTimeline() {
  var existing = getViolets('timeline');
  if (existing && existing.length && existing[0].startDate) return existing;
  // Migrate old format or seed defaults
  var base = viGetCalStart();
  var defaults = [
    { id:'tl1',  startDate: isoDate(addDays(base,0)),  endDate: isoDate(addDays(base,11)), phase:'sketch',     title:'Research & concept refinement',    notes:'Finalize references, mood board, define pieces' },
    { id:'tl2',  startDate: isoDate(addDays(base,0)),  endDate: isoDate(addDays(base,13)), phase:'sketch',     title:'Rough sketches — all pieces',       notes:'Quantity over quality, explore silhouette variations' },
    { id:'tl3',  startDate: isoDate(addDays(base,7)),  endDate: isoDate(addDays(base,18)), phase:'source',     title:'Material sourcing begins',          notes:'Visit Mood Fabrics, B&J, order swatches' },
    { id:'tl4',  startDate: isoDate(addDays(base,14)), endDate: isoDate(addDays(base,20)), phase:'experiment', title:'Fabric + dye experiments',          notes:'Test drape, dye tests, surface treatments' },
    { id:'tl5',  startDate: isoDate(addDays(base,14)), endDate: isoDate(addDays(base,25)), phase:'sketch',     title:'Refined sketches + tech packs',     notes:'Final silhouettes, construction notes per piece' },
    { id:'tl6',  startDate: isoDate(addDays(base,21)), endDate: isoDate(addDays(base,27)), phase:'source',     title:'Order materials',                   notes:'Confirm quantities, place orders' },
    { id:'tl7',  startDate: isoDate(addDays(base,25)), endDate: isoDate(addDays(base,35)), phase:'pattern',    title:'Pattern making',                    notes:'Draft slopers, adjust for Violets fit standard' },
    { id:'tl8',  startDate: isoDate(addDays(base,32)), endDate: isoDate(addDays(base,41)), phase:'experiment', title:'Toile / muslin stage',              notes:'Test construction, fit, proportion — iterate' },
    { id:'tl9',  startDate: isoDate(addDays(base,39)), endDate: isoDate(addDays(base,51)), phase:'production', title:'Production — main pieces',          notes:'Cut, sew, construct final garments' },
    { id:'tl10', startDate: isoDate(addDays(base,46)), endDate: isoDate(addDays(base,51)), phase:'finish',     title:'Finishing + details',               notes:'Hand work, hardware, tags, seam finishing' },
    { id:'tl11', startDate: isoDate(addDays(base,49)), endDate: isoDate(addDays(base,54)), phase:'finish',     title:'Final fit + quality check',         notes:'Try-on, reject/revise, confirm pieces for shoot' },
    { id:'tl12', startDate: isoDate(addDays(base,53)), endDate: isoDate(addDays(base,57)), phase:'photo',      title:'Photography + lookbook',            notes:'Campaign imagery, editorial, product shots' },
    { id:'tl13', startDate: isoDate(addDays(base,56)), endDate: isoDate(addDays(base,58)), phase:'launch',     title:'Launch prep',                       notes:'Site update, pricing, email + socials ready' }
  ];
  saveViolets('timeline', defaults);
  return defaults;
}

function viPhaseColor(pid) {
  return (VI_PHASES.find(function(p){ return p.id===pid; })||{}).color || '#888';
}
function viPhaseLabel(pid) {
  return (VI_PHASES.find(function(p){ return p.id===pid; })||{}).label || pid;
}

// ── View switching ────────────────────────────────────────────────────
function viSetCalView(view, btn) {
  VI_CAL_VIEW = view; VI_CAL_OFFSET = 0;
  document.querySelectorAll('.vi-cal-view-btn').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  viRenderCalendar();
}
function viCalNav(dir) { VI_CAL_OFFSET += dir; viRenderCalendar(); }
function viCalToday() { VI_CAL_OFFSET = 0; viRenderCalendar(); }

// ── Main render dispatcher ────────────────────────────────────────────
function viRenderCalendar() {
  viRenderPhasesLegend();
  if (VI_CAL_VIEW === 'month') viRenderMonth();
  else if (VI_CAL_VIEW === 'week') viRenderWeek();
  else viRenderList();
  loadBPData();
}
// alias for old call sites
function viRenderTimeline() { viRenderCalendar(); }
function viRenderPhasesLegend() {
  var el = document.getElementById('vi-phases-legend');
  if (!el) return;
  el.innerHTML = VI_PHASES.map(function(ph) {
    return '<span class="vi-phase-tag" style="background:'+ph.color+'22;color:'+ph.color+';border:1px solid '+ph.color+'44">'+ph.label+'</span>';
  }).join('');
}

// ── Month view ────────────────────────────────────────────────────────
function viRenderMonth() {
  var today = new Date(); today.setHours(0,0,0,0);
  var ref = new Date(today.getFullYear(), today.getMonth() + VI_CAL_OFFSET, 1);
  var year = ref.getFullYear(), month = ref.getMonth();
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  document.getElementById('vi-cal-nav-label').textContent = MONTHS[month] + ' ' + year;

  var firstDay = new Date(year, month, 1).getDay();
  var daysInMonth = new Date(year, month+1, 0).getDate();
  var blocks = getViTimeline();
  var CHIP_LIMIT = 2;

  var html = '<div class="vi-month-grid">';
  DAYS.forEach(function(d){ html += '<div class="vi-month-dow">'+d+'</div>'; });
  for (var b=0; b<firstDay; b++) html += '<div class="vi-month-cell vi-month-cell-other"></div>';

  for (var day=1; day<=daysInMonth; day++) {
    var cellDate = new Date(year, month, day);
    var cellIso = isoDate(cellDate);
    var isToday = cellIso === isoDate(today);
    var dayBlocks = blocks.filter(function(bl) {
      return bl.startDate <= cellIso && bl.endDate >= cellIso;
    });
    var cellId = 'vi-cell-' + cellIso;
    var popId  = 'vi-pop-'  + cellIso;

    html += '<div class="vi-month-cell' + (isToday ? ' vi-month-today' : '') + '" id="' + cellId + '">';
    html += '<div class="vi-month-day-num' + (isToday ? ' vi-today-num' : '') + '">' + day + '</div>';

    // Show up to CHIP_LIMIT chips
    dayBlocks.slice(0, CHIP_LIMIT).forEach(function(bl) {
      var col = viPhaseColor(bl.phase);
      var isStart = bl.startDate === cellIso;
      html += '<div class="vi-cal-chip" style="background:'+col+'28;border-left:2px solid '+col+';color:'+col+'" ' +
        'data-blid="'+bl.id+'" onclick="viOpenEdit(this.dataset.blid)">' +
        (isStart ? esc(bl.title) : '&middot;') +
        '</div>';
    });

    // "+N more" triggers popup
    if (dayBlocks.length > CHIP_LIMIT) {
      var extra = dayBlocks.length - CHIP_LIMIT;
      html += '<div class="vi-cal-more" data-popid="'+popId+'" onclick="viOpenDayPopup(this.dataset.popid,event)">+'+extra+' more</div>';
    }

    // Hidden popup with all chips for this day
    if (dayBlocks.length > 0) {
      var MONTHS_S = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      html += '<div class="vi-month-cell-popup" id="'+popId+'" onclick="event.stopPropagation()">';
      html += '<div class="vi-popup-day"><span>' + MONTHS_S[month] + ' ' + day + '</span>' +
        '<button class="vi-popup-close" data-popid="'+popId+'" onclick="viCloseDayPopup(this.dataset.popid,event)">✕</button></div>';
      dayBlocks.forEach(function(bl) {
        var col = viPhaseColor(bl.phase);
        html += '<button class="vi-popup-chip" style="background:'+col+'22;border-left:2px solid '+col+';color:'+col+'" ' +
          'data-blid="'+bl.id+'" onclick="viOpenEdit(this.dataset.blid)">'+esc(bl.title)+'</button>';
      });
      html += '</div>';
    }

    html += '</div>';
  }

  var total = firstDay + daysInMonth;
  var trailing = (7 - (total % 7)) % 7;
  for (var t=0; t<trailing; t++) html += '<div class="vi-month-cell vi-month-cell-other"></div>';
  html += '</div>';
  document.getElementById('vi-calendar-board').innerHTML = html;

  // Close popups when clicking outside
  document.addEventListener('click', viCloseDayPopupOutside, { once: true });
}

function viOpenDayPopup(popId, e) {
  e.stopPropagation();
  // Close any other open popup first
  document.querySelectorAll('.vi-month-cell-popup.open').forEach(function(p) {
    if (p.id !== popId) p.classList.remove('open');
  });
  var pop = document.getElementById(popId);
  if (!pop) return;
  var isOpen = pop.classList.contains('open');
  pop.classList.toggle('open');
  if (!isOpen) {
    // Position: flip left if near right edge
    var rect = pop.parentElement.getBoundingClientRect();
    var vpW = window.innerWidth;
    pop.style.left = (rect.right + 200 > vpW) ? 'auto' : '0';
    pop.style.right = (rect.right + 200 > vpW) ? '0' : 'auto';
    pop.style.top = rect.bottom + 8 > window.innerHeight ? 'auto' : '100%';
    pop.style.bottom = rect.bottom + 8 > window.innerHeight ? '100%' : 'auto';
    setTimeout(function() {
      document.addEventListener('click', viCloseDayPopupOutside);
    }, 10);
  }
}

function viCloseDayPopup(popId, e) {
  if (e) e.stopPropagation();
  var pop = document.getElementById(popId);
  if (pop) pop.classList.remove('open');
}

function viCloseDayPopupOutside(e) {
  var clickedInsidePopup = e.target.closest && e.target.closest('.vi-month-cell-popup');
  if (!clickedInsidePopup) {
    document.querySelectorAll('.vi-month-cell-popup.open').forEach(function(p) {
      p.classList.remove('open');
    });
  } else {
    // re-attach listener if they clicked inside
    document.addEventListener('click', viCloseDayPopupOutside);
  }
}

// ── Week view ─────────────────────────────────────────────────────────
function viRenderWeek() {
  var today = new Date(); today.setHours(0,0,0,0);
  var dow = today.getDay();
  var weekStart = addDays(today, -dow + VI_CAL_OFFSET * 7);
  var weekEnd = addDays(weekStart, 6);
  var DAYS_FULL = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  var label = MONTHS_SHORT[weekStart.getMonth()] + ' ' + weekStart.getDate() + ' – ' +
    (weekStart.getMonth()!==weekEnd.getMonth() ? MONTHS_SHORT[weekEnd.getMonth()]+' ' : '') +
    weekEnd.getDate() + ', ' + weekEnd.getFullYear();
  document.getElementById('vi-cal-nav-label').textContent = label;

  var blocks = getViTimeline();
  var html = '<div class="vi-week-grid">';
  // Column headers
  html += '<div class="vi-week-header-spacer"></div>';
  for (var d=0; d<7; d++) {
    var hd = addDays(weekStart, d);
    var isToday = isoDate(hd) === isoDate(today);
    html += '<div class="vi-week-col-header' + (isToday ? ' vi-week-today-hdr' : '') + '">' +
      '<span class="vi-week-dow">' + DAYS_FULL[d] + '</span>' +
      '<span class="vi-week-daynum' + (isToday ? ' vi-today-num' : '') + '">' + hd.getDate() + '</span>' +
    '</div>';
  }
  // Phase rows
  VI_PHASES.forEach(function(ph) {
    var phBlocks = blocks.filter(function(bl){ return bl.phase === ph.id; });
    var anyActive = phBlocks.some(function(bl) {
      return bl.startDate <= isoDate(weekEnd) && bl.endDate >= isoDate(weekStart);
    });
    if (!anyActive) return;

    html += '<div class="vi-week-phase-label" style="color:'+ph.color+'">'+ph.label+'</div>';
    phBlocks.forEach(function(bl) {
      if (bl.startDate > isoDate(weekEnd) || bl.endDate < isoDate(weekStart)) return;
      html += '<div class="vi-week-task-row">';
      html += '<div class="vi-week-task-label" data-blid="' + bl.id + '" onclick="viOpenEdit(this.dataset.blid)" style="border-left:2px solid ' + ph.color + ';color:' + ph.color + '">' + esc(bl.title) + '</div>';
      for (var d=0; d<7; d++) {
        var cellDate = addDays(weekStart, d);
        var cellIso = isoDate(cellDate);
        var active = bl.startDate <= cellIso && bl.endDate >= cellIso;
        var isStart = bl.startDate === cellIso;
        var isEnd = bl.endDate === cellIso;
        html += '<div class="vi-week-cell' +
          (active ? ' vi-week-active' : '') +
          (isStart ? ' vi-week-start' : '') +
          (isEnd ? ' vi-week-end' : '') + '" ' +
          'style="' + (active ? 'background:'+ph.color+'30;' : '') + '">' +
          (isStart ? '<span style="font-size:7px;color:'+ph.color+';font-family:DM Mono,monospace">▶</span>' : '') +
          '</div>';
      }
      html += '</div>';
    });
  });
  html += '</div>';
  document.getElementById('vi-calendar-board').innerHTML = html;
}

// ── List view ─────────────────────────────────────────────────────────
function viRenderList() {
  var blocks = getViTimeline().slice().sort(function(a,b){ return a.startDate < b.startDate ? -1 : 1; });
  var today = isoDate(new Date());
  document.getElementById('vi-cal-nav-label').textContent = 'All tasks';

  var MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function fmtDate(s) { if (!s) return '—'; var d=parseDate(s); return MONTHS_SHORT[d.getMonth()]+' '+d.getDate(); }

  var lastMonth = null;
  var html = '';
  blocks.forEach(function(bl) {
    var d = parseDate(bl.startDate);
    var monthKey = d.getFullYear()+'-'+(d.getMonth()+1);
    if (monthKey !== lastMonth) {
      lastMonth = monthKey;
      html += '<div class="vi-list-month-hdr">'+MONTHS_SHORT[d.getMonth()]+' '+d.getFullYear()+'</div>';
    }
    var col = viPhaseColor(bl.phase);
    var isPast = bl.endDate < today;
    html += '<div class="vi-list-row' + (isPast ? ' vi-list-past' : '') + '" data-blid="'+bl.id+'" onclick="viOpenEdit(this.dataset.blid)">' +
      '<div class="vi-list-bar" style="background:'+col+'"></div>' +
      '<div class="vi-list-dates">' + fmtDate(bl.startDate) + '<br><span style="opacity:.5">'+fmtDate(bl.endDate)+'</span></div>' +
      '<div class="vi-list-body">' +
        '<div class="vi-list-title">' + esc(bl.title) + '</div>' +
        '<div class="vi-list-phase" style="color:'+col+'">' + viPhaseLabel(bl.phase) + '</div>' +
        (bl.notes ? '<div class="vi-list-notes">'+esc(bl.notes)+'</div>' : '') +
      '</div>' +
    '</div>';
  });
  if (!html) html = '<div class="mkt-empty">No tasks yet.</div>';
  document.getElementById('vi-calendar-board').innerHTML = html;
}

// ── Modal helpers ─────────────────────────────────────────────────────
function viPopulatePhaseSelect(selId, selected) {
  var sel = document.getElementById(selId);
  if (!sel) return;
  sel.innerHTML = VI_PHASES.map(function(ph){
    return '<option value="'+ph.id+'"'+(ph.id===selected?' selected':'')+'>'+ph.label+'</option>';
  }).join('');
}
function viOpenAddBlock() {
  viPopulatePhaseSelect('vi-modal-phase','sketch');
  var today = isoDate(new Date());
  document.getElementById('vi-modal-title').value = '';
  document.getElementById('vi-modal-start').value = today;
  document.getElementById('vi-modal-end').value = today;
  document.getElementById('vi-modal-notes').value = '';
  document.getElementById('vi-modal-backdrop').style.display = 'block';
  document.getElementById('vi-add-modal').style.display = 'block';
  document.getElementById('vi-edit-modal').style.display = 'none';
}
function viOpenEdit(id) {
  var bl = getViTimeline().find(function(b){ return b.id===id; });
  if (!bl) return;
  VI_EDIT_ID = id;
  viPopulatePhaseSelect('vi-edit-phase', bl.phase);
  document.getElementById('vi-edit-title').value = bl.title || '';
  document.getElementById('vi-edit-start').value = bl.startDate || '';
  document.getElementById('vi-edit-end').value = bl.endDate || '';
  document.getElementById('vi-edit-notes').value = bl.notes || '';
  document.getElementById('vi-modal-backdrop').style.display = 'block';
  document.getElementById('vi-edit-modal').style.display = 'block';
  document.getElementById('vi-add-modal').style.display = 'none';
}
function viCloseModal() {
  document.getElementById('vi-modal-backdrop').style.display = 'none';
  document.getElementById('vi-add-modal').style.display = 'none';
  document.getElementById('vi-edit-modal').style.display = 'none';
  VI_EDIT_ID = null;
}
function viSaveNewBlock() {
  var title = document.getElementById('vi-modal-title').value.trim();
  if (!title) return;
  var blocks = getViTimeline();
  blocks.push({
    id: 'tl_'+Date.now(),
    title: title,
    phase: document.getElementById('vi-modal-phase').value,
    startDate: document.getElementById('vi-modal-start').value,
    endDate: document.getElementById('vi-modal-end').value,
    notes: document.getElementById('vi-modal-notes').value
  });
  saveViolets('timeline', blocks);
  viCloseModal();
  viRenderCalendar();
}
function viSaveEditBlock() {
  if (!VI_EDIT_ID) return;
  var blocks = getViTimeline();
  var bl = blocks.find(function(b){ return b.id===VI_EDIT_ID; });
  if (bl) {
    bl.title = document.getElementById('vi-edit-title').value;
    bl.phase = document.getElementById('vi-edit-phase').value;
    bl.startDate = document.getElementById('vi-edit-start').value;
    bl.endDate = document.getElementById('vi-edit-end').value;
    bl.notes = document.getElementById('vi-edit-notes').value;
    saveViolets('timeline', blocks);
  }
  viCloseModal();
  viRenderCalendar();
}
function viDeleteEditBlock() {
  if (!VI_EDIT_ID) return;
  saveViolets('timeline', getViTimeline().filter(function(b){ return b.id!==VI_EDIT_ID; }));
  viCloseModal();
  viRenderCalendar();
}

// Old add-block stub (kept for safety)
function viAddTimelineBlock() { viOpenAddBlock(); }
function viUpdateTL(id, field, value) {
  var blocks = getViTimeline();
  var bl = blocks.find(function(b){ return b.id===id; });
  if (bl) { bl[field]=value; saveViolets('timeline',blocks); }
}
function viDeleteTL(id) {
  saveViolets('timeline', getViTimeline().filter(function(b){ return b.id!==id; }));
  viRenderCalendar();
}




// ── Auto-expanding textareas ─────────────────────────────────────
function autoExpand(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}
function initAutoExpand() {
  document.querySelectorAll('.field-textarea').forEach(function(ta) {
    autoExpand(ta);
    ta.addEventListener('input', function(){ autoExpand(this); });
  });
}
document.addEventListener('DOMContentLoaded', function() {
  initAutoExpand();
  // Re-run when tabs switch (new textareas may become visible)
  var origShowTab = window.showTab;
  if (origShowTab) {
    window.showTab = function(project, tab, btn) {
      origShowTab(project, tab, btn);
      setTimeout(initAutoExpand, 30);
    };
  }
});


// ═══ API KEY MANAGEMENT ══════════════════════════════════════════
var API_KEY_STORAGE = 'ws_anthropic_key';

function getApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

function openApiKeyModal() {
  var modal = document.getElementById('api-key-modal');
  var backdrop = document.getElementById('api-key-backdrop');
  var input = document.getElementById('api-key-input');
  var status = document.getElementById('api-key-status');
  var existing = getApiKey();
  if (existing) {
    input.value = existing;
    status.textContent = '✓ Key saved — replace to update, or close to keep.';
    status.style.color = '#82bfbb';
    document.getElementById('api-key-save-btn').disabled = false;
  } else {
    input.value = '';
    status.textContent = 'No key set yet.';
    status.style.color = 'var(--muted)';
  }
  document.getElementById('api-key-modal-err').textContent = '';
  modal.style.display = 'block';
  backdrop.style.display = 'flex';
  setTimeout(function(){ input.focus(); }, 50);
}

function closeApiKeyModal() {
  document.getElementById('api-key-modal').style.display = 'none';
  document.getElementById('api-key-backdrop').style.display = 'none';
}

function saveApiKey() {
  var key = document.getElementById('api-key-input').value.trim();
  if (!key || key.length < 10) {
    document.getElementById('api-key-modal-err').textContent = 'Key looks too short.';
    return;
  }
  localStorage.setItem(API_KEY_STORAGE, key);
  var status = document.getElementById('api-key-status');
  status.textContent = '✓ Saved. AI features will use this key.';
  status.style.color = '#82bfbb';
  setTimeout(closeApiKeyModal, 800);
}

function deleteApiKey() {
  localStorage.removeItem(API_KEY_STORAGE);
  document.getElementById('api-key-status').textContent = 'Key removed.';
  document.getElementById('api-key-input').value = '';
}

// Check on load — show modal if no key and NOT inside claude.ai iframe
function checkApiKeyOnLoad() {
  var inClaudeAI = window.location.hostname.includes('claude.ai') ||
                   window.location.hostname.includes('anthropic.com') ||
                   (window.parent !== window); // inside iframe = claude.ai artifact
  if (inClaudeAI) return; // claude.ai handles auth automatically
  if (!getApiKey()) {
    setTimeout(openApiKeyModal, 800);
  }
}

// Wrap fetch to inject the key into Anthropic API calls
var _originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (typeof url === 'string' && url.includes('api.anthropic.com')) {
    var key = getApiKey();
    if (key) {
      options = options || {};
      options.headers = Object.assign({}, options.headers || {}, {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      });
    }
  }
  return _originalFetch.apply(this, arguments);
};

document.addEventListener('DOMContentLoaded', checkApiKeyOnLoad);

