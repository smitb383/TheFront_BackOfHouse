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

  // Pull existing fixed costs from budget
  var budgetPopup = [];
  try { budgetPopup = JSON.parse(localStorage.getItem('budget_popup_v1')) || []; } catch(e) {}

  var fixedCosts = [];
  budgetPopup.forEach(function(b) {
    if (b.item) {
      fixedCosts.push({
        id: 'fc_' + (b.id || Date.now() + Math.random()),
        name: b.item,
        amount: b.amt || 0,
        category: b.cat || 'operations',
        note: b.note || ''
      });
    }
  });

  // If no fixed costs from budget, seed defaults
  if (!fixedCosts.length) {
    fixedCosts = [
      { id: 'fc_rent', name: 'Rent — 334 Broome', amount: 3500, category: 'operations', note: 'Flat fee June 18 - July 16' },
      { id: 'fc_insurance', name: 'General liability insurance', amount: 0, category: 'operations', note: '$2M aggregate required' },
      { id: 'fc_buildout', name: 'Install / build-out', amount: 0, category: 'interior', note: 'Fixtures, paint, lighting' },
      { id: 'fc_signage', name: 'Signage', amount: 0, category: 'fabrication', note: 'Vinyl, window cling' },
      { id: 'fc_bags', name: 'Shopping bags', amount: 0, category: 'supplies', note: 'Branded' },
      { id: 'fc_tags', name: 'Hang tags / price tags', amount: 0, category: 'supplies', note: '' },
      { id: 'fc_tissue', name: 'Tissue / packaging', amount: 0, category: 'supplies', note: '' },
      { id: 'fc_opening', name: 'Opening event', amount: 0, category: 'events', note: 'Drinks, invitations, florals' },
      { id: 'fc_marketing', name: 'Marketing / promotion', amount: 0, category: 'marketing', note: 'Flyers, paid posts' },
      { id: 'fc_pos', name: 'POS equipment', amount: 50, category: 'operations', note: 'Square reader' },
      { id: 'fc_strike', name: 'Strike / removal', amount: 0, category: 'operations', note: '' },
      { id: 'fc_contingency', name: 'Contingency (10%)', amount: 0, category: 'buffer', note: '' }
    ];
  }

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
    var sales = (scenario.itemSales && scenario.itemSales[item.id]) ? scenario.itemSales[item.id].qty : 0;
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

  // Fixed costs
  var totalFixed = 0;
  (scenario.fixedCosts || []).forEach(function(c) { totalFixed += (c.amount || 0); });

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
  var vendors = {};
  data.inventory.forEach(function(item) {
    var key = item.vendor || 'Other';
    if (!vendors[key]) vendors[key] = { items: [], isInHouse: item.isInHouse };
    vendors[key].items.push(item);
  });

  var html = '<div class="pl-section-header"><span class="pl-section-title">Revenue</span><span class="pl-section-total">$' + fmt(calc.ourCut) + '</span></div>';

  // Inventory items by vendor
  Object.keys(vendors).forEach(function(vendorName) {
    var group = vendors[vendorName];
    var vendorTotal = 0;
    html += '<div class="pl-vendor-group">';
    html += '<div class="pl-vendor-name">' + esc(vendorName) +
      '<span class="pl-commission-tag">' + (group.isInHouse ? '100% yours' : '30% commission') + '</span></div>';
    html += '<div class="pl-item-header"><span>Item</span><span>Price</span><span>Est. qty</span><span>Gross</span><span>Your cut</span></div>';

    group.items.forEach(function(item) {
      var qty = (scenario.itemSales && scenario.itemSales[item.id]) ? scenario.itemSales[item.id].qty : 0;
      var gross = qty * item.price;
      var cut = item.isInHouse ? gross : gross * (item.commissionPct / 100);
      vendorTotal += cut;
      html += '<div class="pl-item-row">' +
        '<span class="pl-item-name">' + esc(item.name) + '</span>' +
        '<span class="pl-item-price">$' + fmt(item.price) + '</span>' +
        '<span class="pl-item-qty"><input type="number" min="0" value="' + qty + '" class="pl-qty-input" data-item-id="' + item.id + '" onchange="updateItemQty(this)"></span>' +
        '<span class="pl-item-gross">$' + fmt(gross) + '</span>' +
        '<span class="pl-item-cut">$' + fmt(cut) + '</span>' +
      '</div>';
    });

    html += '<div class="pl-vendor-subtotal">Subtotal: $' + fmt(vendorTotal) + '</div>';
    html += '</div>';
  });

  // Event revenue
  html += '<div class="pl-other-revenue">';
  html += '<div class="pl-other-row">' +
    '<span class="pl-other-label">Event revenue</span>' +
    '<input type="number" class="pl-other-input" value="' + (scenario.eventRevenue || 0) + '" onchange="updateOtherRevenue(\'eventRevenue\',this.value)">' +
    '<span class="pl-other-note">' + esc(scenario.eventNote || 'TBA') + '</span>' +
  '</div>';
  html += '<div class="pl-other-row">' +
    '<span class="pl-other-label">Merch / branded goods</span>' +
    '<input type="number" class="pl-other-input" value="' + (scenario.merchRevenue || 0) + '" onchange="updateOtherRevenue(\'merchRevenue\',this.value)">' +
    '<span class="pl-other-note">' + esc(scenario.merchNote || '') + '</span>' +
  '</div>';
  html += '</div>';

  el.innerHTML = html;
}

function renderFixedCosts(scenario) {
  var el = document.getElementById('pl-fixed');
  if (!el) return;
  var total = 0;
  (scenario.fixedCosts || []).forEach(function(c) { total += (c.amount || 0); });

  var html = '<div class="pl-section-header"><span class="pl-section-title">Fixed Costs</span><span class="pl-section-total">$' + fmt(total) + '</span></div>';

  var cats = {};
  (scenario.fixedCosts || []).forEach(function(c) {
    var cat = c.category || 'other';
    if (!cats[cat]) cats[cat] = [];
    cats[cat].push(c);
  });

  Object.keys(cats).forEach(function(cat) {
    html += '<div class="pl-cost-cat"><span class="pl-cost-cat-name">' + esc(cat) + '</span></div>';
    cats[cat].forEach(function(c) {
      var hasNote = c.note && c.note.trim();
      html += '<div class="pl-cost-item" id="pl-cost-' + c.id + '">' +
        '<div class="pl-cost-row">' +
          '<input class="pl-cost-name-input" value="' + esc(c.name) + '" data-cost-id="' + c.id + '" data-field="name" onchange="updateFixedCost(this)">' +
          '<div class="pl-cost-amt-wrap">$<input type="number" class="pl-cost-amt-input" value="' + (c.amount || 0) + '" data-cost-id="' + c.id + '" data-field="amount" onchange="updateFixedCost(this)"></div>' +
          '<button class="pl-cost-note-toggle' + (hasNote ? ' has-note' : '') + '" onclick="toggleCostNote(\'' + c.id + '\')" title="Notes">▾</button>' +
          '<button class="pl-row-del" data-cost-id="' + c.id + '" onclick="deleteFixedCost(this.dataset.costId)">×</button>' +
        '</div>' +
        '<div class="pl-cost-note-panel" id="pl-note-' + c.id + '"' + (hasNote ? ' style="display:block"' : '') + '>' +
          '<textarea class="pl-cost-note-textarea" placeholder="Add notes…" data-cost-id="' + c.id + '" data-field="note" onchange="updateFixedCost(this)">' + esc(c.note || '') + '</textarea>' +
        '</div>' +
      '</div>';
    });
  });

  html += '<button class="pl-add-row-btn" onclick="addFixedCost()">+ Add fixed cost</button>';
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

function toggleCostNote(id) {
  var panel = document.getElementById('pl-note-' + id);
  if (!panel) return;
  var isOpen = panel.style.display === 'block';
  panel.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) panel.querySelector('textarea').focus();
}

function addFixedCost() {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  var cat = prompt('Category (e.g., operations, supplies, marketing, events, interior, fabrication, buffer):');
  if (!cat) return;
  scenario.fixedCosts.push({
    id: 'fc_' + Date.now(),
    name: '',
    amount: 0,
    category: cat.toLowerCase().trim(),
    note: ''
  });
  savePLData(data);
  renderPL();
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
