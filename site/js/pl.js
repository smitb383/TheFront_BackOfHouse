// ============================================
// THE FRONT NYC — P&L / Budget Module
// ============================================

var PL_KEY = 'pl_data_v1';

function getPLData() {
  try { return JSON.parse(localStorage.getItem(PL_KEY)) || null; } catch(e) { return null; }
}
function savePLData(d) { localStorage.setItem(PL_KEY, JSON.stringify(d)); }

function initPLData() {
  var existing = getPLData();
  if (existing && existing.scenarios && existing.scenarios.length) return existing;

  // Pull inventory from existing revenue catalog
  var revProj = null;
  try { revProj = JSON.parse(localStorage.getItem('popup_rev_proj_v1')); } catch(e) {}

  var inventory = [];
  if (revProj && revProj.vendors) {
    revProj.vendors.forEach(function(v) {
      (v.items || []).forEach(function(item) {
        if (item.name || item.price) {
          inventory.push({
            id: 'inv_' + v.id + '_' + item.id,
            name: item.name || '(untitled)',
            vendor: v.name || '',
            vendorId: v.id,
            price: item.price || 0,
            category: item.category || '',
            isInHouse: v.name === 'In-House' || v.split === 100,
            commissionPct: (v.name === 'In-House' || v.split === 100) ? 100 : parseInt(v.split) || 30,
            weeks: item.weeks || [0,0,0,0],
            qty: 1
          });
        }
      });
    });
  }

  var fixedCosts = [
      // Space
      { id: 'fc_rent', name: '334 Broome rent', amount: 3500, category: 'space', note: 'Flat fee June 18 - July 16' },
      { id: 'fc_insurance', name: 'General liability insurance', amount: 200, category: 'space', note: '$2M aggregate required — Amir Badawi + Patjen Realty as additional insureds' },
      { id: 'fc_cleaning', name: 'Cleaning supplies', amount: 30, category: 'space', note: 'Pre-install clean, weekly sweep during run' },
      { id: 'fc_extcords', name: 'Extension cords / power strips', amount: 25, category: 'space', note: 'For lighting, iPad charger, event AV' },
      { id: 'fc_ac', name: 'AC repair', amount: 0, category: 'space', note: 'AC does not work — landlord open to splitting repair cost. Talk to Mike. Amount TBD' },
      { id: 'fc_internet', name: 'Internet', amount: 0, category: 'space', note: 'Included with space' },
      { id: 'fc_power', name: 'Power', amount: 0, category: 'space', note: 'Included with space' },
      { id: 'fc_water', name: 'Water', amount: 0, category: 'space', note: 'Included with space' },
      // Fabrication
      { id: 'fc_buildout', name: 'Install / build-out', amount: 0, category: 'fit out', note: 'Paint, lighting tweaks, wall prep' },
      { id: 'fc_paint', name: 'Paint / paint supplies', amount: 0, category: 'fit out', note: '' },
      { id: 'fc_shelves', name: 'Floating shelves / pedestals', amount: 150, category: 'fit out', note: '3-4 units at varying heights for objects + accessories' },
      { id: 'fc_hangers', name: 'Hangers', amount: 0, category: 'fit out', note: '' },
      { id: 'fc_vinyl', name: 'Window vinyl', amount: 0, category: 'fit out', note: 'Vinyl lettering / signage on glass front' },
      { id: 'fc_exterior', name: 'Exterior sign', amount: 0, category: 'fit out', note: 'Outside-facing sign or blade' },
      { id: 'fc_pricelabels', name: 'Price labels / maker cards', amount: 30, category: 'fit out', note: 'Small folded card — name, price, material, vendor. Per-vendor cards with handle + bio' },
      // Retail supplies
      { id: 'fc_bags', name: 'Shopping bags', amount: 0, category: 'retail supplies', note: 'Branded stamp on plain kraft bags' },
      { id: 'fc_tags', name: 'Price tags', amount: 0, category: 'retail supplies', note: 'Hang tags for all vendors' },
      { id: 'fc_tissue', name: 'Tissue / packaging', amount: 50, category: 'retail supplies', note: 'Branded tissue, bags' },
      // Events
      { id: 'fc_opening', name: 'Opening night drinks / snacks', amount: 150, category: 'events', note: 'Wine + sparkling water + simple snacks for 40-60 people' },
      { id: 'fc_photographer', name: 'Photographer — opening night', amount: 0, category: 'events', note: 'Dedicated shooter for space and crowd' },
      // Marketing
      { id: 'fc_flyers', name: 'Opening flyers (print run)', amount: 80, category: 'marketing', note: '200-300 flyers, postcard size, for LES/SoHo/Nolita drops' },
      { id: 'fc_socialgraphics', name: 'Launch social graphics', amount: 0, category: 'marketing', note: 'Save-the-date, vendor spotlights, countdown assets' },
      { id: 'fc_pressrelease', name: 'Press release', amount: 0, category: 'marketing', note: '200-word pitch + image for Hint, Time Out, local blogs' },
      { id: 'fc_graphicdesign', name: 'Graphic design', amount: 0, category: 'marketing', note: '' },
      { id: 'fc_typeface', name: 'Typeface licences', amount: 0, category: 'marketing', note: 'Bebas Neue is primary font' },
      // Business / legal
      { id: 'fc_llc', name: 'LLC registration', amount: 0, category: 'business', note: 'NY LLC filing ~$200 via DOS' },
      { id: 'fc_domains', name: 'Website domains', amount: 0, category: 'business', note: 'thefrontny, frontnyc, thefrontgallery, thefrontstore + variations' },
      { id: 'fc_hosting', name: 'Website hosting', amount: 0, category: 'business', note: '' },
      // Operations
      { id: 'fc_pos', name: 'Square POS reader', amount: 50, category: 'operations', note: 'Plus a stand if using iPad' },
      { id: 'fc_ipad', name: 'iPad / phone for checkout', amount: 0, category: 'operations', note: '' },
      { id: 'fc_strike', name: 'Strike / removal', amount: 0, category: 'operations', note: 'Labor, disposal, end of lease cleanup' },
      // Misc
    { id: 'fc_contingency', name: 'Contingency (10%)', amount: 0, category: 'misc', note: '' }
  ];
  // Merge: add any default items not already in fixedCosts
  var variableCosts = [
    { id: 'vc_square', name: 'Square processing fee', rate: 2.6, perTxn: 0.10, type: 'pct_of_sales', note: '2.6% + $0.10 per transaction' },
    { id: 'vc_packaging', name: 'Packaging per sale', rate: 0, perTxn: 1.50, type: 'per_txn', note: 'Bag + tissue per transaction' }
  ];

  var data = {
    inventory: inventory,
    scenarios: [
      {
        id: 'working',
        name: 'Working Budget',
        created: new Date().toISOString().slice(0,10),
        fixedCosts: fixedCosts,
        variableCosts: variableCosts,
        // Per-item sell assumptions: { itemId: { qty: N } }
        // If not set, defaults to 0
        itemSales: {},
        eventRevenue: 0,
        eventNote: 'TBA',
        merchRevenue: 0,
        merchNote: '',
        notes: ''
      }
    ],
    activeScenario: 'working'
  };

  savePLData(data);
  return data;
}

function getActiveScenario() {
  var d = getPLData() || initPLData();
  var id = d.activeScenario || 'working';
  return d.scenarios.find(function(s) { return s.id === id; }) || d.scenarios[0];
}

// ── Calculations ──

function calcPL(scenario, inventory) {
  var totalRevenue = 0;
  var ourCut = 0;
  var totalSalesVolume = 0;
  var totalTransactions = 0;
  var itemBreakdown = [];

  inventory.forEach(function(item) {
    var sales = (scenario.itemSales && scenario.itemSales[item.id]) ? scenario.itemSales[item.id].qty : 1;
    var gross = sales * item.price;
    var commission = item.isInHouse ? gross : gross * (item.commissionPct / 100);
    totalRevenue += gross;
    ourCut += commission;
    totalTransactions += sales;
    totalSalesVolume += gross;
    itemBreakdown.push({
      item: item,
      qtySold: sales,
      grossRevenue: gross,
      ourCut: commission
    });
  });

  // Add event + merch revenue
  ourCut += (scenario.eventRevenue || 0);
  ourCut += (scenario.merchRevenue || 0);
  totalRevenue += (scenario.eventRevenue || 0) + (scenario.merchRevenue || 0);

  // Fixed costs — contingency auto-calculates as 10% of all other fixed costs
  var totalFixed = 0;
  var nonContingencyTotal = 0;
  (scenario.fixedCosts || []).forEach(function(c) {
    if (c.id === 'fc_contingency' || (c.name && c.name.toLowerCase().indexOf('contingency') >= 0)) return;
    nonContingencyTotal += (c.amount || 0);
  });
  (scenario.fixedCosts || []).forEach(function(c) {
    if (c.id === 'fc_contingency' || (c.name && c.name.toLowerCase().indexOf('contingency') >= 0)) {
      c.amount = Math.round(nonContingencyTotal * 0.10);
    }
    totalFixed += (c.amount || 0);
  });

  // Variable costs
  var totalVariable = 0;
  (scenario.variableCosts || []).forEach(function(vc) {
    if (vc.type === 'pct_of_sales') {
      totalVariable += totalSalesVolume * ((vc.rate || 0) / 100) + totalTransactions * (vc.perTxn || 0);
    } else if (vc.type === 'per_txn') {
      totalVariable += totalTransactions * (vc.perTxn || 0);
    } else {
      totalVariable += (vc.rate || 0);
    }
  });

  var netPL = ourCut - totalFixed - totalVariable;
  var breakeven = totalFixed + totalVariable;

  return {
    totalGrossRevenue: totalRevenue,
    ourCut: ourCut,
    totalFixed: totalFixed,
    totalVariable: totalVariable,
    netPL: netPL,
    breakeven: breakeven,
    totalTransactions: totalTransactions,
    itemBreakdown: itemBreakdown
  };
}

// ── Rendering ──

function renderPL() {
  var data = getPLData() || initPLData();
  var scenario = getActiveScenario();
  var calc = calcPL(scenario, data.inventory);

  renderScenarioBar(data);
  renderPLSummary(calc);
  renderRevenueSection(data, scenario, calc);
  renderFixedCosts(scenario);
  renderVariableCosts(scenario, calc);
}

function renderScenarioBar(data) {
  var el = document.getElementById('pl-scenario-bar');
  if (!el) return;
  var html = '<div class="pl-scenario-pills">';
  data.scenarios.forEach(function(s) {
    var active = s.id === data.activeScenario;
    html += '<button class="pl-scenario-pill' + (active ? ' active' : '') + '" onclick="switchScenario(\'' + s.id + '\')">' + esc(s.name) + '</button>';
  });
  html += '<button class="pl-scenario-pill pl-add-scenario" onclick="addScenario()">+ New</button>';
  html += '</div>';

  // Scenario actions
  var scenario = getActiveScenario();
  if (scenario.id !== 'working') {
    html += '<div class="pl-scenario-actions">';
    html += '<button class="pl-small-btn" onclick="renameScenario()">Rename</button>';
    html += '<button class="pl-small-btn pl-del-btn" onclick="deleteScenario()">Delete</button>';
    html += '</div>';
  }
  el.innerHTML = html;
}

function renderPLSummary(calc) {
  var el = document.getElementById('pl-summary');
  if (!el) return;
  var netClass = calc.netPL >= 0 ? 'pl-positive' : 'pl-negative';
  el.innerHTML =
    '<div class="pl-summary-grid">' +
      '<div class="pl-summary-card">' +
        '<div class="pl-summary-label">Gross Revenue</div>' +
        '<div class="pl-summary-val">$' + fmt(calc.totalGrossRevenue) + '</div>' +
      '</div>' +
      '<div class="pl-summary-card">' +
        '<div class="pl-summary-label">Our Cut (commission + in-house)</div>' +
        '<div class="pl-summary-val">$' + fmt(calc.ourCut) + '</div>' +
      '</div>' +
      '<div class="pl-summary-card">' +
        '<div class="pl-summary-label">Total Costs</div>' +
        '<div class="pl-summary-val">$' + fmt(calc.totalFixed + calc.totalVariable) + '</div>' +
        '<div class="pl-summary-sub">Fixed: $' + fmt(calc.totalFixed) + ' · Variable: $' + fmt(calc.totalVariable) + '</div>' +
      '</div>' +
      '<div class="pl-summary-card ' + netClass + '">' +
        '<div class="pl-summary-label">Net P/L</div>' +
        '<div class="pl-summary-val">' + (calc.netPL >= 0 ? '+' : '') + '$' + fmt(calc.netPL) + '</div>' +
        '<div class="pl-summary-sub">Break-even at $' + fmt(calc.breakeven) + ' in revenue</div>' +
      '</div>' +
    '</div>';
}

function renderRevenueSection(data, scenario, calc) {
  var el = document.getElementById('pl-revenue');
  if (!el) return;

  // Group inventory by vendor
  var vendorMap = {};
  var vendorOrder = [];
  data.inventory.forEach(function(item) {
    var key = item.vendor || 'Other';
    if (!vendorMap[key]) { vendorMap[key] = { items: [], isInHouse: item.isInHouse, commissionPct: item.commissionPct }; vendorOrder.push(key); }
    vendorMap[key].items.push(item);
  });

  // Sort items within each vendor by price descending
  vendorOrder.forEach(function(key) {
    vendorMap[key].items.sort(function(a, b) { return (b.price || 0) - (a.price || 0); });
  });

  var html = '<div class="pl-section-header"><span class="pl-section-title">Revenue</span><span class="pl-section-total">$' + fmt(calc.ourCut) + '</span></div>';

  // Vendor / In-House groups as category headers (like fixed costs)
  vendorOrder.forEach(function(vendorName) {
    var group = vendorMap[vendorName];
    var vendorTotal = 0;
    var vendorGross = 0;

    // Calculate totals first
    group.items.forEach(function(item) {
      var qty = (scenario.itemSales && scenario.itemSales[item.id]) ? scenario.itemSales[item.id].qty : 1;
      var gross = qty * item.price;
      var cut = item.isInHouse ? gross : gross * (item.commissionPct / 100);
      vendorTotal += cut;
      vendorGross += gross;
    });

    var tagLabel = group.isInHouse ? '100% yours' : (group.commissionPct || 30) + '% commission';
    html += '<div class="pl-cost-cat"><span class="pl-cost-cat-name">' + esc(vendorName) + ' <span class="pl-commission-tag">' + tagLabel + '</span></span><span class="pl-cost-cat-total">$' + fmt(vendorTotal) + '</span></div>';

    group.items.forEach(function(item) {
      var qty = (scenario.itemSales && scenario.itemSales[item.id]) ? scenario.itemSales[item.id].qty : 1;
      var gross = qty * item.price;
      var cut = item.isInHouse ? gross : gross * (item.commissionPct / 100);
      var isOpen = document.getElementById('pl-rev-' + item.id) && document.getElementById('pl-rev-' + item.id).classList.contains('open');

      html += '<div class="pl-cost-item' + (isOpen ? ' open' : '') + '" id="pl-rev-' + item.id + '">' +
        '<div class="pl-cost-top">' +
          '<div class="pl-cost-status-dot" style="background:var(--front)" onclick="toggleRevCard(\'' + item.id + '\')"></div>' +
          '<span class="pl-rev-item-name" onclick="toggleRevCard(\'' + item.id + '\')">' + esc(item.name || '(untitled)') + '</span>' +
          '<span class="pl-rev-item-price">$' + fmt(item.price) + '</span>' +
          '<span class="pl-rev-item-qty" onclick="event.stopPropagation()">×<input type="number" min="0" value="' + qty + '" class="pl-cost-amt-num" style="width:40px" data-item-id="' + item.id + '" onchange="updateItemQty(this)"></span>' +
          '<span class="pl-rev-item-cut">$' + fmt(cut) + '</span>' +
          '<span class="pl-cost-chevron" onclick="toggleRevCard(\'' + item.id + '\')">›</span>' +
        '</div>' +
        '<div class="pl-cost-body">' +
          '<div class="pl-cost-fields">' +
            '<div class="pl-cost-field"><div class="pl-cost-field-label">Item</div><div class="pl-cost-field-val">' + esc(item.name) + '</div></div>' +
            '<div class="pl-cost-field"><div class="pl-cost-field-label">Vendor</div><div class="pl-cost-field-val">' + esc(item.vendor) + '</div></div>' +
            '<div class="pl-cost-field"><div class="pl-cost-field-label">Unit price</div><div class="pl-cost-field-val">$' + fmt(item.price) + '</div></div>' +
            '<div class="pl-cost-field"><div class="pl-cost-field-label">Category</div><div class="pl-cost-field-val">' + esc(item.category || '—') + '</div></div>' +
            '<div class="pl-cost-field"><div class="pl-cost-field-label">Commission</div><div class="pl-cost-field-val">' + (item.isInHouse ? '100% (in-house)' : item.commissionPct + '% to us / ' + (100 - item.commissionPct) + '% to vendor') + '</div></div>' +
            '<div class="pl-cost-field"><div class="pl-cost-field-label">Gross (qty × price)</div><div class="pl-cost-field-val">$' + fmt(gross) + '</div></div>' +
            '<div class="pl-cost-field"><div class="pl-cost-field-label">Your cut</div><div class="pl-cost-field-val" style="color:var(--front)">$' + fmt(cut) + '</div></div>' +
            '<div class="pl-cost-field"><div class="pl-cost-field-label">Vendor payout</div><div class="pl-cost-field-val">' + (item.isInHouse ? '—' : '$' + fmt(gross - cut)) + '</div></div>' +
          '</div>' +
          '<button class="pl-add-row-btn" onclick="goToInventoryItem(\'' + esc(item.vendor) + '\')">View in Inventory →</button>' +
        '</div>' +
      '</div>';
    });
  });

  // Other revenue (events, merch)
  html += '<div class="pl-cost-cat"><span class="pl-cost-cat-name">other revenue</span><span class="pl-cost-cat-total">$' + fmt((scenario.eventRevenue || 0) + (scenario.merchRevenue || 0)) + '</span></div>';

  html += '<div class="pl-cost-item" id="pl-rev-events">' +
    '<div class="pl-cost-top">' +
      '<div class="pl-cost-status-dot" style="background:var(--muted)"></div>' +
      '<span class="pl-rev-item-name">Event revenue</span>' +
      '<span class="pl-rev-item-price" style="font-style:italic;color:var(--muted)">' + esc(scenario.eventNote || 'TBA') + '</span>' +
      '<div class="pl-cost-amt-inline" onclick="event.stopPropagation()">$<input type="number" min="0" class="pl-cost-amt-num" value="' + (scenario.eventRevenue || 0) + '" onchange="updateOtherRevenue(\'eventRevenue\',this.value)"></div>' +
    '</div>' +
  '</div>';

  html += '<div class="pl-cost-item" id="pl-rev-merch">' +
    '<div class="pl-cost-top">' +
      '<div class="pl-cost-status-dot" style="background:var(--muted)"></div>' +
      '<span class="pl-rev-item-name">Merch / branded goods</span>' +
      '<span class="pl-rev-item-price"></span>' +
      '<div class="pl-cost-amt-inline" onclick="event.stopPropagation()">$<input type="number" min="0" class="pl-cost-amt-num" value="' + (scenario.merchRevenue || 0) + '" onchange="updateOtherRevenue(\'merchRevenue\',this.value)"></div>' +
    '</div>' +
  '</div>';

  el.innerHTML = html;
}

function toggleRevCard(id) {
  var card = document.getElementById('pl-rev-' + id);
  if (card) card.classList.toggle('open');
}

function goToInventoryItem(vendorName) {
  // Switch to inventory tab and scroll to vendor
  showTab('front', 'popup-inventory', document.querySelector('[data-tab="popup-inventory"]'));
  setTimeout(function() {
    renderInventory();
  }, 50);
}

var FC_CATEGORIES = ['space','fit out','retail supplies','events','marketing','business','operations','misc'];
var FC_STATUSES = ['needed','sourcing','ordered','done'];
var FC_STATUS_COLORS = { needed:'#e07070', sourcing:'#e2c97e', ordered:'#a8c4d4', done:'#88c98a' };

function renderFixedCosts(scenario) {
  var el = document.getElementById('pl-fixed');
  if (!el) return;
  var total = 0;
  (scenario.fixedCosts || []).forEach(function(c) { total += (c.amount || 0); });

  var html = '<div class="pl-section-header"><span class="pl-section-title">Fixed Costs</span><span class="pl-section-total">$' + fmt(total) + '</span></div>';

  var cats = {};
  var catOrder = [];
  (scenario.fixedCosts || []).forEach(function(c) {
    var cat = c.category || 'misc';
    if (!cats[cat]) { cats[cat] = []; catOrder.push(cat); }
    cats[cat].push(c);
  });

  // Sort items within each category by amount descending
  catOrder.forEach(function(cat) {
    cats[cat].sort(function(a, b) { return (b.amount || 0) - (a.amount || 0); });
  });

  catOrder.forEach(function(cat) {
    var catTotal = 0;
    cats[cat].forEach(function(c) { catTotal += (c.amount || 0); });
    html += '<div class="pl-cost-cat"><span class="pl-cost-cat-name">' + esc(cat) + '</span><span class="pl-cost-cat-total">$' + fmt(catTotal) + '</span></div>';

    cats[cat].forEach(function(c) {
      var isOpen = document.getElementById('pl-cost-' + c.id) && document.getElementById('pl-cost-' + c.id).classList.contains('open');
      var status = c.status || 'needed';
      var statColor = FC_STATUS_COLORS[status] || 'var(--muted)';
      var catOpts = FC_CATEGORIES.map(function(fc) {
        return '<option value="' + fc + '"' + (c.category === fc ? ' selected' : '') + '>' + fc + '</option>';
      }).join('');
      var statOpts = FC_STATUSES.map(function(s) {
        return '<option value="' + s + '"' + (status === s ? ' selected' : '') + '>' + s + '</option>';
      }).join('');

      html += '<div class="pl-cost-item' + (isOpen ? ' open' : '') + '" id="pl-cost-' + c.id + '" draggable="true" data-drag-id="' + c.id + '" data-drag-type="fixed" ondragstart="plDragStart(event)" ondragover="plDragOver(event)" ondrop="plDrop(event)" ondragend="plDragEnd(event)">' +
        '<div class="pl-cost-top">' +
          '<div class="pl-drag-handle" title="Drag to reorder">⠿</div>' +
          '<div class="pl-cost-status-dot" style="background:' + statColor + '" onclick="toggleCostCard(\'' + c.id + '\')"></div>' +
          '<input class="pl-cost-name-inline" value="' + esc(c.name || '') + '" placeholder="Item name" data-cost-id="' + c.id + '" data-field="name" onchange="updateFixedCost(this)" onclick="event.stopPropagation()">' +
          '<div class="pl-cost-amt-inline" onclick="event.stopPropagation()">$<input type="number" min="0" class="pl-cost-amt-num" value="' + (c.amount || 0) + '" data-cost-id="' + c.id + '" data-field="amount" onchange="updateFixedCost(this)"></div>' +
          '<span class="pl-cost-chevron" onclick="toggleCostCard(\'' + c.id + '\')">›</span>' +
        '</div>' +
        '<div class="pl-cost-body">' +
          '<div class="pl-cost-fields">' +
            '<div class="pl-cost-field"><div class="pl-cost-field-label">Category</div><select class="pl-cost-field-select" data-cost-id="' + c.id + '" data-field="category" onchange="updateFixedCost(this);renderPL()">' + catOpts + '</select></div>' +
            '<div class="pl-cost-field"><div class="pl-cost-field-label">Status</div><select class="pl-cost-status-sel" data-cost-id="' + c.id + '" data-field="status" onchange="updateFixedCost(this);renderFixedCosts(getActiveScenario())" style="border-color:' + statColor + '44;color:' + statColor + '">' + statOpts + '</select></div>' +
            '<div class="pl-cost-field"><div class="pl-cost-field-label">Where to get it</div><input class="pl-cost-field-input" value="' + esc(c.source || '') + '" placeholder="Vendor, store, link…" data-cost-id="' + c.id + '" data-field="source" onchange="updateFixedCost(this)"></div>' +
            '<div class="pl-cost-field"><div class="pl-cost-field-label">Who\'s responsible</div><select class="pl-cost-field-select" data-cost-id="' + c.id + '" data-field="who" onchange="updateFixedCost(this)"><option value=""' + (!c.who ? ' selected' : '') + '>—</option><option value="Brooke"' + (c.who === 'Brooke' ? ' selected' : '') + '>Brooke</option><option value="Del"' + (c.who === 'Del' ? ' selected' : '') + '>Del</option><option value="334 Broome"' + (c.who === '334 Broome' ? ' selected' : '') + '>334 Broome</option></select></div>' +
            '<div class="pl-cost-field pl-cost-field-full"><div class="pl-cost-field-label">Notes</div><textarea class="pl-cost-field-textarea" placeholder="Details, alternatives…" data-cost-id="' + c.id + '" data-field="note" onchange="updateFixedCost(this)">' + esc(c.note || '') + '</textarea></div>' +
          '</div>' +
          '<button class="pl-cost-delete-btn" onclick="deleteFixedCost(\'' + c.id + '\')">Delete item</button>' +
        '</div>' +
      '</div>';
    });
    html += '<button class="pl-add-row-btn" onclick="addFixedCostToCat(\'' + esc(cat) + '\')">+ Add to ' + esc(cat) + '</button>';
  });

  html += '<button class="pl-add-row-btn" style="margin-top:12px" onclick="addFixedCost()">+ Add to new category</button>';
  el.innerHTML = html;
}

function renderVariableCosts(scenario, calc) {
  var el = document.getElementById('pl-variable');
  if (!el) return;
  var total = calc.totalVariable;

  var html = '<div class="pl-section-header"><span class="pl-section-title">Variable Costs</span><span class="pl-section-total">$' + fmt(total) + '</span></div>';
  html += '<div class="pl-variable-note">Calculated from sales volume (' + calc.totalTransactions + ' transactions, $' + fmt(calc.totalGrossRevenue) + ' gross)</div>';

  (scenario.variableCosts || []).forEach(function(vc) {
    var estCost = 0;
    if (vc.type === 'pct_of_sales') {
      estCost = calc.totalGrossRevenue * ((vc.rate || 0) / 100) + calc.totalTransactions * (vc.perTxn || 0);
    } else if (vc.type === 'per_txn') {
      estCost = calc.totalTransactions * (vc.perTxn || 0);
    }
    html += '<div class="pl-cost-row">' +
      '<span class="pl-cost-name">' + esc(vc.name) + '</span>' +
      '<span class="pl-cost-note">' + esc(vc.note || '') + '</span>' +
      '<span class="pl-cost-amt">$' + fmt(estCost) + '</span>' +
    '</div>';
  });

  html += '<button class="pl-add-row-btn" onclick="addVariableCost()">+ Add variable cost</button>';
  el.innerHTML = html;
}

// ── Actions ──

function updateItemQty(input) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  if (!scenario.itemSales) scenario.itemSales = {};
  scenario.itemSales[input.dataset.itemId] = { qty: parseInt(input.value) || 0 };
  savePLData(data);
  renderPL();
}

function updateOtherRevenue(field, value) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  scenario[field] = parseFloat(value) || 0;
  savePLData(data);
  renderPL();
}

function updateFixedCost(input) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  var cost = (scenario.fixedCosts || []).find(function(c) { return c.id === input.dataset.costId; });
  if (!cost) return;
  var field = input.dataset.field;
  cost[field] = field === 'amount' ? (parseFloat(input.value) || 0) : input.value;
  savePLData(data);
  // Only re-render summary, not the whole thing (to keep focus)
  var calc = calcPL(scenario, data.inventory);
  renderPLSummary(calc);
  renderVariableCosts(scenario, calc);
  // Update section totals
  var total = 0;
  (scenario.fixedCosts || []).forEach(function(c) { total += (c.amount || 0); });
  var header = document.querySelector('#pl-fixed .pl-section-total');
  if (header) header.textContent = '$' + fmt(total);
}

function toggleCostCard(id) {
  var card = document.getElementById('pl-cost-' + id);
  if (card) card.classList.toggle('open');
}

function addFixedCostToCat(cat) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  var newId = 'fc_' + Date.now();
  scenario.fixedCosts.push({
    id: newId,
    name: '',
    amount: 0,
    category: cat,
    note: ''
  });
  savePLData(data);
  renderFixedCosts(scenario);
  // Auto-open the new item
  var card = document.getElementById('pl-cost-' + newId);
  if (card) card.classList.add('open');
}

function addFixedCost() {
  var cat = prompt('Category (e.g., space, fabrication, retail supplies, events, marketing, business, operations, misc):');
  if (!cat) return;
  addFixedCostToCat(cat.toLowerCase().trim());
}

function deleteFixedCost(id) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  scenario.fixedCosts = scenario.fixedCosts.filter(function(c) { return c.id !== id; });
  savePLData(data);
  renderPL();
}

function addVariableCost() {
  var name = prompt('Variable cost name:');
  if (!name) return;
  var type = prompt('Type: "pct_of_sales" or "per_txn"');
  if (!type) type = 'per_txn';
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  scenario.variableCosts.push({
    id: 'vc_' + Date.now(),
    name: name,
    rate: 0,
    perTxn: 0,
    type: type,
    note: ''
  });
  savePLData(data);
  renderPL();
}

// ── Scenarios ──

function switchScenario(id) {
  var data = getPLData();
  data.activeScenario = id;
  savePLData(data);
  renderPL();
}

function addScenario() {
  var name = prompt('Scenario name:');
  if (!name) return;
  var data = getPLData();
  // Clone from working budget
  var working = data.scenarios.find(function(s) { return s.id === 'working'; }) || data.scenarios[0];
  var newScenario = JSON.parse(JSON.stringify(working));
  newScenario.id = 'sc_' + Date.now();
  newScenario.name = name;
  newScenario.created = new Date().toISOString().slice(0,10);
  data.scenarios.push(newScenario);
  data.activeScenario = newScenario.id;
  savePLData(data);
  renderPL();
}

function renameScenario() {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  var name = prompt('New name:', scenario.name);
  if (!name) return;
  scenario.name = name;
  savePLData(data);
  renderPL();
}

function deleteScenario() {
  if (!confirm('Delete this scenario?')) return;
  var data = getPLData();
  data.scenarios = data.scenarios.filter(function(s) { return s.id !== data.activeScenario; });
  data.activeScenario = 'working';
  savePLData(data);
  renderPL();
}

// ── Inventory Management ──
// Mirrors Del's original catalog: vendor blocks with split %, items with
// name, category, unit price, price-per-week columns, net totals.

var INV_CATEGORIES = ['','Clothing','Accessories','Jewelry','Objects','Art / Print','Textiles','Furniture','Lighting','Other'];

function renderInventory() {
  var data = getPLData() || initPLData();
  var el = document.getElementById('pl-inventory');
  if (!el) return;
  var numWeeks = data.numWeeks || 4;

  // Group inventory by vendor
  var vendorMap = {};
  var vendorOrder = [];
  data.inventory.forEach(function(item) {
    var key = item.vendor || 'Other';
    if (!vendorMap[key]) { vendorMap[key] = { items: [], split: item.commissionPct || 30, isInHouse: item.isInHouse, vendorId: item.vendorId }; vendorOrder.push(key); }
    vendorMap[key].items.push(item);
  });

  var grandGross = 0, grandNet = 0;
  var html = '';

  vendorOrder.forEach(function(vendorName) {
    var group = vendorMap[vendorName];
    var split = group.isInHouse ? 100 : (group.split || 30);

    // Week column headers
    var weeksHead = '';
    for (var wi = 0; wi < numWeeks; wi++) {
      weeksHead += '<th class="num">Wk ' + (wi+1) + ' $</th>';
    }

    var rows = '';
    var vGross = 0, vNet = 0;

    group.items.forEach(function(item) {
      var weekCells = '';
      var weeks = item.weeks || [];
      for (var wi = 0; wi < numWeeks; wi++) {
        var wVal = weeks[wi] || 0;
        weekCells += '<td><input class="pl-inv-week-input" type="number" min="0" value="' + wVal + '" placeholder="0"' +
          ' data-inv-id="' + item.id + '" data-week="' + wi + '" onchange="updateInvWeek(this)"></td>';
      }
      var totalWeekRevenue = (weeks || []).reduce(function(s,x){ return s + (parseInt(x)||0); }, 0);
      var net = totalWeekRevenue * (split / 100);
      vGross += totalWeekRevenue;
      vNet += net;

      var catOpts = INV_CATEGORIES.map(function(c) {
        return '<option value="' + c + '"' + (item.category === c ? ' selected' : '') + '>' + (c || '— cat —') + '</option>';
      }).join('');

      rows += '<tr>' +
        '<td><input class="pl-inv-name-input" value="' + esc(item.name) + '" placeholder="Item name"' +
          ' data-inv-id="' + item.id + '" data-field="name" onchange="updateInventoryItem(this)"></td>' +
        '<td><select class="pl-inv-cat-select" data-inv-id="' + item.id + '" data-field="category" onchange="updateInventoryItem(this)">' + catOpts + '</select></td>' +
        '<td class="num"><span class="pl-dollar">$</span><input class="pl-inv-price-input" type="number" min="0" value="' + (item.price||0) + '" placeholder="0"' +
          ' data-inv-id="' + item.id + '" data-field="price" onchange="updateInventoryItem(this)"></td>' +
        weekCells +
        '<td class="num pl-inv-net">$' + fmt(net) + '</td>' +
        '<td><button class="pl-row-del" data-inv-id="' + item.id + '" onclick="deleteInventoryItem(this.dataset.invId)">×</button></td>' +
      '</tr>';
    });

    grandGross += vGross;
    grandNet += vNet;

    html += '<div class="pl-inv-vendor-block">' +
      '<div class="pl-inv-vendor-header">' +
        '<input class="pl-inv-vendor-name-input" value="' + esc(vendorName) + '" placeholder="Vendor name"' +
          ' data-vendor="' + esc(vendorName) + '" onchange="renameInvVendor(this)">' +
        '<div class="pl-inv-split-wrap">' +
          '<span class="pl-inv-split-label">your split</span>' +
          '<input type="number" min="0" max="100" class="pl-inv-split-input" value="' + split + '"' +
            ' data-vendor="' + esc(vendorName) + '" onchange="updateInvVendorSplit(this)">' +
          '<span class="pl-inv-split-pct">%</span>' +
        '</div>' +
        '<button class="pl-inv-vendor-del" data-vendor="' + esc(vendorName) + '" onclick="deleteInvVendor(this.dataset.vendor)">×</button>' +
      '</div>' +
      '<div class="pl-inv-table-wrap"><table class="pl-inv-table">' +
        '<thead><tr><th>Item</th><th>Category</th><th class="num">Unit $</th>' + weeksHead + '<th class="num">Your net</th><th></th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table></div>' +
      '<button class="pl-add-row-btn" onclick="addInventoryItem(\'' + esc(vendorName) + '\')">+ Add item</button>' +
      '<div class="pl-inv-vendor-totals">' +
        '<span>Gross: <strong>$' + fmt(vGross) + '</strong></span>' +
        '<span>Your take: <strong class="pl-inv-net-highlight">$' + fmt(vNet) + '</strong></span>' +
        '<span>Vendor payout: <strong>$' + fmt(vGross - vNet) + '</strong></span>' +
      '</div>' +
    '</div>';
  });

  // Grand totals
  html += '<div class="pl-inv-grand-total">' +
    '<span>Total gross: <strong>$' + fmt(grandGross) + '</strong></span>' +
    '<span>Total your take: <strong class="pl-inv-net-highlight">$' + fmt(grandNet) + '</strong></span>' +
  '</div>';

  html += '<button class="pl-add-row-btn" style="margin-top:16px" onclick="addInventoryVendor()">+ Add vendor</button>';
  el.innerHTML = html;
}

function updateInventoryItem(input) {
  var data = getPLData();
  var item = data.inventory.find(function(i) { return i.id === input.dataset.invId; });
  if (!item) return;
  var field = input.dataset.field;
  item[field] = field === 'price' ? (parseFloat(input.value) || 0) : input.value;
  savePLData(data);
}

function updateInvWeek(input) {
  var data = getPLData();
  var item = data.inventory.find(function(i) { return i.id === input.dataset.invId; });
  if (!item) return;
  if (!item.weeks) item.weeks = [0,0,0,0];
  var wi = parseInt(input.dataset.week);
  item.weeks[wi] = parseInt(input.value) || 0;
  savePLData(data);
  renderInventory();
}

function updateInvVendorSplit(input) {
  var data = getPLData();
  var vendorName = input.dataset.vendor;
  var newSplit = parseInt(input.value) || 30;
  data.inventory.forEach(function(item) {
    if (item.vendor === vendorName) {
      item.commissionPct = newSplit;
      item.isInHouse = newSplit === 100;
    }
  });
  savePLData(data);
  renderInventory();
}

function renameInvVendor(input) {
  var data = getPLData();
  var oldName = input.dataset.vendor;
  var newName = input.value.trim();
  if (!newName || newName === oldName) return;
  data.inventory.forEach(function(item) {
    if (item.vendor === oldName) item.vendor = newName;
  });
  savePLData(data);
  renderInventory();
}

function deleteInvVendor(vendorName) {
  if (!confirm('Delete vendor "' + vendorName + '" and all their items?')) return;
  var data = getPLData();
  data.inventory = data.inventory.filter(function(i) { return i.vendor !== vendorName; });
  savePLData(data);
  renderInventory();
}

function deleteInventoryItem(id) {
  var data = getPLData();
  data.inventory = data.inventory.filter(function(i) { return i.id !== id; });
  savePLData(data);
  renderInventory();
}

function addInventoryItem(vendorName) {
  var data = getPLData();
  var existing = data.inventory.find(function(i) { return i.vendor === vendorName; });
  var isInHouse = existing ? existing.isInHouse : false;
  var split = existing ? existing.commissionPct : 30;
  data.inventory.push({
    id: 'inv_' + Date.now(),
    name: '',
    vendor: vendorName,
    vendorId: existing ? existing.vendorId : Date.now(),
    price: 0,
    category: '',
    isInHouse: isInHouse,
    commissionPct: split,
    weeks: [0,0,0,0],
    qty: 1
  });
  savePLData(data);
  renderInventory();
}

function addInventoryVendor() {
  var name = prompt('Vendor name:');
  if (!name) return;
  var split = prompt('Your commission split % (e.g., 30 for vendors, 100 for in-house):', '30');
  var splitNum = parseInt(split) || 30;
  var data = getPLData();
  data.inventory.push({
    id: 'inv_' + Date.now(),
    name: '',
    vendor: name,
    vendorId: Date.now(),
    price: 0,
    category: '',
    isInHouse: splitNum === 100,
    commissionPct: splitNum,
    weeks: [0,0,0,0],
    qty: 1
  });
  savePLData(data);
  renderInventory();
}

// ── Helpers ──

function fmt(n) {
  if (n === undefined || n === null || isNaN(n)) return '0';
  var neg = n < 0;
  var abs = Math.abs(n);
  var str = abs.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return neg ? '-' + str : str;
}

function esc(s) {
  if (!s) return '';
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ── Drag and Drop ──

var _plDragId = null;
var _plDragType = null;

function plDragStart(e) {
  var el = e.target.closest('[data-drag-id]');
  if (!el) return;
  _plDragId = el.dataset.dragId;
  _plDragType = el.dataset.dragType;
  el.classList.add('pl-dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', _plDragId);
}

function plDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  var target = e.target.closest('[data-drag-id]');
  if (!target || target.dataset.dragId === _plDragId) return;
  // Visual indicator
  var rect = target.getBoundingClientRect();
  var midY = rect.top + rect.height / 2;
  target.classList.remove('pl-drag-above', 'pl-drag-below');
  if (e.clientY < midY) {
    target.classList.add('pl-drag-above');
  } else {
    target.classList.add('pl-drag-below');
  }
}

function plDrop(e) {
  e.preventDefault();
  var target = e.target.closest('[data-drag-id]');
  if (!target || !_plDragId || target.dataset.dragId === _plDragId) return;

  var targetId = target.dataset.dragId;
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });

  if (_plDragType === 'fixed') {
    var costs = scenario.fixedCosts || [];
    var fromIdx = costs.findIndex(function(c) { return c.id === _plDragId; });
    var toIdx = costs.findIndex(function(c) { return c.id === targetId; });
    if (fromIdx < 0 || toIdx < 0) return;

    // Determine if dropping above or below
    var rect = target.getBoundingClientRect();
    var dropBelow = e.clientY > rect.top + rect.height / 2;

    var item = costs.splice(fromIdx, 1)[0];
    // Recalc toIdx after splice
    toIdx = costs.findIndex(function(c) { return c.id === targetId; });
    if (dropBelow) toIdx++;
    costs.splice(toIdx, 0, item);

    // Update category to match where it was dropped
    var targetCost = costs.find(function(c) { return c.id === targetId; });
    if (targetCost && item.category !== targetCost.category) {
      item.category = targetCost.category;
    }

    scenario.fixedCosts = costs;
  }

  savePLData(data);

  // Clean up classes
  document.querySelectorAll('.pl-drag-above,.pl-drag-below').forEach(function(el) {
    el.classList.remove('pl-drag-above', 'pl-drag-below');
  });

  renderPL();
}

function plDragEnd(e) {
  _plDragId = null;
  _plDragType = null;
  document.querySelectorAll('.pl-dragging,.pl-drag-above,.pl-drag-below').forEach(function(el) {
    el.classList.remove('pl-dragging', 'pl-drag-above', 'pl-drag-below');
  });
}

// ── P&L Tab Switching ──

function plShowTab(tab, btn) {
  document.querySelectorAll('.pl-tab').forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.pl-panel').forEach(function(p) { p.style.display = 'none'; });
  var panel = document.getElementById('pl-panel-' + tab);
  if (panel) panel.style.display = 'block';
  if (tab === 'pl') renderPL();
  if (tab === 'inventory') renderInventory();
}
