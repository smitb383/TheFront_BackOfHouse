// ============================================
// THE FRONT NYC — P&L / Budget Module
// ============================================

var PL_KEY = 'pl_data_v1';
var PL_SEED_VERSION = 9; // bump to merge new defaults while keeping user edits

function getPLData() {
  try { return JSON.parse(localStorage.getItem(PL_KEY)) || null; } catch(e) { return null; }
}
function savePLData(d) { d._seedVersion = PL_SEED_VERSION; localStorage.setItem(PL_KEY, JSON.stringify(d)); }

// Default fixed costs — defined here so migratePLData can reference them
var PL_DEFAULT_FIXED_COSTS = [
  { id: 'fc_rent', name: '46 Hester rent', amount: 9000, category: 'space', note: 'Jul 23 – Aug 23. Deposit paid Jun 23. Remaining $4,500 due Jul 19.' },
  { id: 'fc_insurance', name: 'General liability insurance (COI)', amount: 200, category: 'space', refund: 0, note: '$2M aggregate required — 46 Hester as additional insured. Upfront premium paid, prorated refund when policy cancelled after popup ends.' },
  { id: 'fc_cleaning', name: 'Cleaning supplies', amount: 30, category: 'space', note: 'Pre-install clean, weekly sweep during run' },
  { id: 'fc_extcords', name: 'Extension cords / power strips', amount: 25, category: 'space', note: 'For lighting, iPad charger, event AV' },
  { id: 'fc_ac', name: 'AC repair', amount: 0, category: 'space', note: 'AC does not work — landlord open to splitting repair cost. Talk to Mike. Amount TBD' },
  { id: 'fc_internet', name: 'Internet', amount: 0, category: 'space', note: 'Included with space' },
  { id: 'fc_power', name: 'Power', amount: 0, category: 'space', note: 'Included with space' },
  { id: 'fc_water', name: 'Water', amount: 0, category: 'space', note: 'Included with space' },
  { id: 'fc_buildout', name: 'Install / build-out', amount: 0, category: 'fit out', note: 'Paint, lighting tweaks, wall prep' },
  { id: 'fc_paint', name: 'Paint / paint supplies', amount: 0, category: 'fit out', note: '' },
  { id: 'fc_shelves', name: 'Floating shelves / pedestals', amount: 150, category: 'fit out', note: '3-4 units at varying heights for objects + accessories' },
  { id: 'fc_hangers', name: 'Hangers', amount: 0, category: 'fit out', note: '' },
  { id: 'fc_vinyl', name: 'Window vinyl', amount: 0, category: 'fit out', note: 'Vinyl lettering / signage on glass front' },
  { id: 'fc_exterior', name: 'Exterior sign', amount: 0, category: 'fit out', note: 'Outside-facing sign or blade' },
  { id: 'fc_pricelabels', name: 'Price labels / maker cards', amount: 30, category: 'fit out', note: 'Small folded card — name, price, material, vendor. Per-vendor cards with handle + bio' },
  { id: 'fc_bags', name: 'Shopping bags', amount: 0, category: 'retail supplies', note: 'Branded stamp on plain kraft bags' },
  { id: 'fc_tags', name: 'Price tags', amount: 0, category: 'retail supplies', note: 'Hang tags for all vendors' },
  { id: 'fc_tissue', name: 'Tissue / packaging', amount: 50, category: 'retail supplies', note: 'Branded tissue, bags' },
  { id: 'fc_opening', name: 'Opening night drinks / snacks', amount: 150, category: 'events', note: 'Wine + sparkling water + simple snacks for 40-60 people' },
  { id: 'fc_photographer', name: 'Photographer — opening night', amount: 0, category: 'events', note: 'Dedicated shooter for space and crowd' },
  // Cafe — sorted highest to lowest
  { id: 'fc_cafe_cups', name: 'Branded Iced Cups & Lids', amount: 440, category: 'cafe', status: 'done', note: '' },
  { id: 'fc_cafe_icechest', name: 'Ice Chest', amount: 185, category: 'cafe', status: 'done', note: 'Price with shipping' },
  { id: 'fc_cafe_straws', name: 'Straws (600)', amount: 43.52, category: 'cafe', status: 'done', note: '' },
  { id: 'fc_cafe_icekit', name: 'Ice Scoop, Ice Bin, draining tray, scoop holder', amount: 42.59, category: 'cafe', status: 'done', note: '' },
  { id: 'fc_cafe_kettle', name: 'Kettle with temperature control', amount: 39.99, category: 'cafe', status: 'done', note: '' },
  { id: 'fc_cafe_napkins', name: 'Napkins (2 packs)', amount: 30, category: 'cafe', status: 'done', note: '' },
  { id: 'fc_cafe_fridge', name: 'Mini fridge', amount: 30, category: 'cafe', status: 'done', note: 'FB marketplace' },
  { id: 'fc_cafe_cleaning', name: 'Hand Soap, Dish soap, Drying rack', amount: 25.99, category: 'cafe', status: 'done', note: '' },
  { id: 'fc_cafe_table', name: 'Folding table', amount: 25, category: 'cafe', status: 'done', note: 'FB marketplace' },
  { id: 'fc_cafe_shotcups', name: 'Shot measuring cups (4 pcs)', amount: 16.99, category: 'cafe', status: 'done', note: '' },
  { id: 'fc_cafe_canister', name: 'Matcha canister', amount: 16.99, category: 'cafe', status: 'done', note: '' },
  { id: 'fc_cafe_scoops', name: 'Matcha scoop / Scoops for flavoring ingredients', amount: 6.59, category: 'cafe', status: 'done', note: '' },
  { id: 'fc_cafe_shakers', name: 'Bar shakers (2x)', amount: 0, category: 'cafe', status: 'done', note: 'From home — Brooke & Del' },
  { id: 'fc_cafe_matcha_bowl', name: 'Matcha whisking bowl & whisk', amount: 0, category: 'cafe', status: 'done', note: 'From home — Elise whisk, Brooke bowl & whisk' },
  { id: 'fc_cafe_scale', name: 'Kitchen scale', amount: 0, category: 'cafe', status: 'done', note: 'From home — Elise' },
  { id: 'fc_cafe_outlets', name: 'Outlets (freezer, fridge, kettle)', amount: 0, category: 'cafe', status: 'done', note: 'From home' },
  { id: 'fc_cafe_sifter', name: 'Sifter / Strainer', amount: 0, category: 'cafe', status: 'done', note: 'From home — Brooke' },
  { id: 'fc_cafe_ewhisk', name: 'Electric Whisk', amount: 0, category: 'cafe', status: 'done', note: 'From home — Brooke' },
  { id: 'fc_cafe_menu', name: 'Printed Menu display', amount: 0, category: 'cafe', status: 'needed', note: '' },
  { id: 'fc_cafe_bottles', name: 'Canister / squeeze bottles for flavoring ingredients', amount: 0, category: 'cafe', status: 'needed', note: '' },
  { id: 'fc_flyers', name: 'Opening flyers (print run)', amount: 80, category: 'marketing', note: '200-300 flyers, postcard size, for LES/SoHo/Nolita drops' },
  { id: 'fc_socialgraphics', name: 'Launch social graphics', amount: 0, category: 'marketing', note: 'Save-the-date, vendor spotlights, countdown assets' },
  { id: 'fc_pressrelease', name: 'Press release', amount: 0, category: 'marketing', note: '200-word pitch + image for Hint, Time Out, local blogs' },
  { id: 'fc_graphicdesign', name: 'Graphic design', amount: 0, category: 'branding', note: '' },
  { id: 'fc_typeface', name: 'Typeface licences', amount: 0, category: 'branding', note: 'Bebas Neue is primary font' },
  { id: 'fc_pos', name: 'Square POS reader', amount: 50, category: 'operations', note: 'Plus a stand if using iPad' },
  { id: 'fc_ipad', name: 'iPad / phone for checkout', amount: 0, category: 'operations', note: '' },
  { id: 'fc_strike', name: 'Strike / removal', amount: 0, category: 'operations', note: 'Labor, disposal, end of lease cleanup' },
  { id: 'fc_contingency', name: 'Contingency (10%)', amount: 0, category: 'misc', note: '' },
  // Wholesale / In-House production costs
  { id: 'fc_merch_tshirts', name: 'Front Merch — T-shirts production', amount: 0, category: 'wholesale', status: 'needed', note: 'Lavender + Blue tees' },
  { id: 'fc_merch_stickers', name: 'Front Merch — Stickers production', amount: 0, category: 'wholesale', status: 'needed', note: 'Sticker packs + logo stickers' },
  { id: 'fc_hadaikum_cost', name: 'Hadaikum — Wholesale purchase', amount: 0, category: 'wholesale', status: 'needed', note: 'Candelabras, wall sconces, candles' }
];

var PL_DEFAULT_BUSINESS_COSTS = [
  { id: 'bc_llc', name: 'LLC registration', amount: 0, category: 'legal', note: 'NY LLC filing ~$200 via DOS' },
  { id: 'bc_domains', name: 'Website domains', amount: 0, category: 'digital', note: 'thefrontny, frontnyc, thefrontgallery, thefrontstore + variations' },
  { id: 'bc_hosting', name: 'Website hosting', amount: 0, category: 'digital', note: '' }
];

function migratePLData(existing) {
  // Rename 'working' scenario to 'popup' / '46 Hester'
  existing.scenarios.forEach(function(s) {
    if (s.id === 'working') {
      s.id = 'popup';
      s.name = '46 Hester';
      s.type = 'popup';
    }
  });
  if (existing.activeScenario === 'working') existing.activeScenario = 'popup';

  // Merge new default items into popup scenarios
  existing.scenarios.forEach(function(s) {
    if (s.type === 'business') return;
    var existingIds = {};
    (s.fixedCosts || []).forEach(function(c) { existingIds[c.id] = true; });

    // Only add NEW items — never touch existing items (name, amount, category, notes)
    PL_DEFAULT_FIXED_COSTS.forEach(function(dc) {
      if (!existingIds[dc.id]) {
        s.fixedCosts.push(JSON.parse(JSON.stringify(dc)));
      }
    });

    // Fix Square per-txn fee from $0.10 to $0.15
    (s.variableCosts || []).forEach(function(vc) {
      if (vc.id === 'vc_square' && vc.perTxn === 0.10) {
        vc.perTxn = 0.15;
        vc.note = '2.6% + $0.15 per transaction';
      }
    });

    // Remove business items from popup budget (they go to the business tab)
    s.fixedCosts = s.fixedCosts.filter(function(c) {
      return c.category !== 'business' && c.id !== 'fc_llc' && c.id !== 'fc_domains' && c.id !== 'fc_hosting';
    });
  });

  // Add business scenario if not present
  var hasBusiness = existing.scenarios.some(function(s) { return s.id === 'business'; });
  if (!hasBusiness) {
    existing.scenarios.push({
      id: 'business',
      name: 'The Front Business Costs',
      type: 'business',
      created: new Date().toISOString().slice(0,10),
      fixedCosts: JSON.parse(JSON.stringify(PL_DEFAULT_BUSINESS_COSTS)),
      variableCosts: [],
      itemSales: {},
      eventRevenue: 0,
      merchRevenue: 0,
      notes: ''
    });
  }

  existing._seedVersion = PL_SEED_VERSION;
  savePLData(existing);
  console.log('[pl] Migrated PL data to version ' + PL_SEED_VERSION);
  return existing;
}

function initPLData() {
  var existing = getPLData();
  // If data exists and is current version, return as-is
  if (existing && existing.scenarios && existing.scenarios.length && existing._seedVersion === PL_SEED_VERSION) return existing;
  // If data exists but old version, merge new defaults into it (preserve user edits)
  if (existing && existing.scenarios && existing.scenarios.length && existing._seedVersion !== PL_SEED_VERSION) {
    return migratePLData(existing);
  }

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

  var fixedCosts = JSON.parse(JSON.stringify(PL_DEFAULT_FIXED_COSTS));

  var variableCosts = [
    { id: 'vc_square', name: 'Square processing fee', rate: 2.6, perTxn: 0.15, type: 'pct_of_sales', note: '2.6% + $0.15 per transaction' },
    { id: 'vc_packaging', name: 'Packaging per sale', rate: 0, perTxn: 1.50, type: 'per_txn', note: 'Bag + tissue per transaction' }
  ];

  var data = {
    inventory: inventory,
    scenarios: [
      {
        id: 'popup',
        name: '46 Hester',
        type: 'popup',
        created: new Date().toISOString().slice(0,10),
        fixedCosts: fixedCosts,
        variableCosts: variableCosts,
        itemSales: {},
        eventRevenue: 0,
        eventNote: 'TBA',
        merchRevenue: 0,
        merchNote: '',
        notes: ''
      },
      {
        id: 'business',
        name: 'The Front Business Costs',
        type: 'business',
        created: new Date().toISOString().slice(0,10),
        fixedCosts: JSON.parse(JSON.stringify(PL_DEFAULT_BUSINESS_COSTS)),
        variableCosts: [],
        itemSales: {},
        eventRevenue: 0,
        merchRevenue: 0,
        notes: ''
      }
    ],
    activeScenario: 'popup'
  };

  savePLData(data);
  return data;
}

function getActiveScenario() {
  var d = getPLData() || initPLData();
  var id = d.activeScenario || 'working';
  return d.scenarios.find(function(s) { return s.id === id; }) || d.scenarios[0];
}

// ── Live inventory adapter ──
// Reads popup_inv_new_v1 (the real inventory) and converts to the flat
// item format that calcPL() consumes. This is the bridge between the
// Inventory tab and the P&L.

function inventoryToPLItems() {
  var inv = (typeof getInvNew === 'function') ? getInvNew() : null;
  if (!inv || !inv.vendors || !inv.vendors.length) return [];

  var popupVendorsAll = (typeof getPopupVendors === 'function') ? getPopupVendors() : [];

  var items = [];
  var totalShipping = 0;
  inv.vendors.forEach(function(vendor) {
    var vendorInfo = popupVendorsAll.find(function(v) { return v.id === vendor.vendorId; }) || {};
    var isWholesale = vendor.pricingModel === 'wholesale';
    var sPct = vendor.storePct != null ? vendor.storePct : 30;
    var dPct = vendor.designerPct != null ? vendor.designerPct : 70;
    var eurRate = vendor.eurRate || 1.08;
    var shipCost = parseFloat(vendor.shippingCost) || 0;
    var wePayShip = vendor.shippingCoveredBy === 'us' && shipCost > 0;

    vendor.items.forEach(function(item) {
      if (isWholesale) {
        var isUsdVendor = vendor.currency === 'usd';
        var costEur = item.costEur || 0;
        var costUsd = isUsdVendor ? (item.costUsd || item.costEur || 0) : Math.round(costEur * eurRate * 100) / 100;
        var upcharge = item.upchargePct || 0;
        var retailPrice = Math.round(costUsd * (1 + upcharge / 100));
        var qty = item.qty || 1;
        var sold = item.sold || 0;

        items.push({
          id: 'invnew_' + vendor.vendorId + '_' + item.id,
          name: item.name || '(untitled)',
          vendor: vendor.name || '',
          vendorId: vendor.vendorId,
          price: retailPrice,
          isInHouse: true,
          commissionPct: 100,
          costPerUnit: costUsd,
          qty: qty,
          totalSold: sold,
          pricingModel: 'wholesale',
          category: item.category || ''
        });
      } else {
        var price = item.salePrice || 0;
        var totalQty = 0, totalSold = 0;
        if (item.sizes && item.sizes.length) {
          item.sizes.forEach(function(sz) {
            totalQty += (sz.qty || 0);
            totalSold += (sz.sold || 0);
          });
        } else {
          totalQty = item.qty || 1;
          totalSold = item.sold || 0;
        }

        items.push({
          id: 'invnew_' + vendor.vendorId + '_' + item.id,
          name: item.name || '(untitled)',
          vendor: vendor.name || '',
          vendorId: vendor.vendorId,
          price: price,
          isInHouse: false,
          commissionPct: sPct,
          designerPct: dPct,
          qty: totalQty,
          totalSold: totalSold,
          pricingModel: 'consignment',
          category: item.category || ''
        });
      }
    });

    // Track shipping for all non-NYC vendors (whether we pay or they do)
    if (shipCost > 0) {
      if (wePayShip) totalShipping += shipCost;
      items.push({
        id: 'invnew_ship_' + vendor.vendorId,
        name: vendor.name || '',
        vendor: vendor.name || '',
        vendorId: vendor.vendorId,
        isShippingDeduction: true,
        shippingAmount: shipCost,
        shippingCoveredBy: vendor.shippingCoveredBy || 'vendor',
        vendorLocation: vendorInfo ? vendorInfo.location || vendorInfo.locationOther || '' : '',
        itemCount: vendor.items.length,
        price: 0, qty: 0, totalSold: 0, isInHouse: false, commissionPct: 0
      });
    }
  });
  items._totalShipping = totalShipping;
  return items;
}

// ── Calculations ──

function calcPL(scenario, inventory) {
  var totalRevenue = 0;
  var ourCut = 0;
  var totalSalesVolume = 0;
  var totalTransactions = 0;
  var itemBreakdown = [];
  var consignGross = 0, consignCut = 0, merchGross = 0, merchCut = 0;
  var shippingDeductions = 0;

  inventory.forEach(function(item) {
    // Handle shipping deduction pseudo-items — only deduct what we cover
    if (item.isShippingDeduction) {
      if (item.shippingCoveredBy === 'us') {
        shippingDeductions += (item.shippingAmount || 0);
      }
      return;
    }

    var sale = scenario.itemSales && scenario.itemSales[item.id];
    // "sell" qty: user override from P&L scenario, then actual sold from inventory, then total qty
    var sales = (sale && sale.qty != null) ? sale.qty : (item.totalSold > 0 ? item.totalSold : (item.qty || 1));
    var gross = sales * item.price;
    var commission;
    if (item.isInHouse && item.costPerUnit) {
      // Wholesale: our cut is revenue minus COGS
      commission = gross - (sales * item.costPerUnit);
      merchGross += gross;
      merchCut += commission;
    } else if (item.isInHouse) {
      commission = gross;
      merchGross += gross;
      merchCut += commission;
    } else {
      commission = gross * (item.commissionPct / 100);
      consignGross += gross;
      consignCut += commission;
    }
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

  // Shipping we cover is tracked as a fixed cost (not a revenue deduction)

  // Add other revenue (events, branded goods, etc.)
  (scenario.otherRevenue || []).forEach(function(r) {
    ourCut += (r.amount || 0);
    totalRevenue += (r.amount || 0);
  });
  // Legacy support
  if (!scenario.otherRevenue) {
    ourCut += (scenario.eventRevenue || 0) + (scenario.merchRevenue || 0);
    totalRevenue += (scenario.eventRevenue || 0) + (scenario.merchRevenue || 0);
  }

  // Fixed costs — contingency auto-calculates as 10% of all other fixed costs
  // Refunds reduce the net cost of an item (e.g. prorated insurance refund)
  var totalFixed = 0;
  var nonContingencyTotal = 0;
  (scenario.fixedCosts || []).forEach(function(c) {
    if (c.id === 'fc_contingency' || (c.name && c.name.toLowerCase().indexOf('contingency') >= 0)) return;
    var net = (c.amount || 0) - (c.refund || 0);
    nonContingencyTotal += net;
  });
  (scenario.fixedCosts || []).forEach(function(c) {
    if (c.id === 'fc_contingency' || (c.name && c.name.toLowerCase().indexOf('contingency') >= 0)) {
      c.amount = Math.round(nonContingencyTotal * 0.10);
    }
    var net = (c.amount || 0) - (c.refund || 0);
    totalFixed += net;
  });

  // Add shipping costs we cover (from live inventory)
  totalFixed += shippingDeductions;

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

  // Merch production costs (units produced × cost per unit)
  // Skip wholesale items — their COGS is already deducted in commission calc above
  inventory.forEach(function(item) {
    if (!item.isInHouse) return;
    if (item.pricingModel === 'wholesale') return;
    var unitsProduced = item.unitsProduced || item.qty || 1;
    totalVariable += unitsProduced * (item.costPerUnit || 0);
  });

  // Cafe variable costs
  (scenario.cafeVariable || []).forEach(function(cv) {
    totalVariable += (cv.amount || 0);
  });

  // Cafe revenue (price × sold) and variable costs (cost per drink + Square)
  var cafeDrinkRevenue = 0;
  var cafeDrinkCosts = 0;
  var cafeDrinkTxns = 0;
  (scenario.cafeRevenue || []).forEach(function(cr) {
    var rev = (cr.price || 0) * (cr.sold || 0);
    var cost = (cr.costPerDrink || 0) * (cr.sold || 0);
    cafeDrinkRevenue += rev;
    cafeDrinkCosts += cost;
    cafeDrinkTxns += (cr.sold || 0);
  });
  var cafeSquareFee = cafeDrinkRevenue * 0.026 + cafeDrinkTxns * 0.15;
  ourCut += cafeDrinkRevenue;
  totalRevenue += cafeDrinkRevenue;
  totalVariable += cafeDrinkCosts + cafeSquareFee;

  // Space revenue (insurance refund etc)
  (scenario.spaceRevenue || []).forEach(function(sr) {
    ourCut += (sr.amount || 0);
    totalRevenue += (sr.amount || 0);
  });

  var netPL = ourCut - totalFixed - totalVariable;
  var breakeven = totalFixed + totalVariable;

  return {
    totalGrossRevenue: totalRevenue,
    ourCut: ourCut,
    consignGross: consignGross,
    consignCut: consignCut,
    merchGross: merchGross,
    merchCut: merchCut,
    totalFixed: totalFixed,
    totalVariable: totalVariable,
    netPL: netPL,
    breakeven: breakeven,
    totalTransactions: totalTransactions,
    itemBreakdown: itemBreakdown,
    shippingCosts: shippingDeductions
  };
}

// ── Rendering ──

function renderPL() {
  var data = getPLData() || initPLData();
  var scenario = getActiveScenario();
  var liveInventory = inventoryToPLItems();
  var calc = calcPL(scenario, liveInventory);

  var isBusiness = scenario.id === 'business';
  var isFunding = data.activeScenario === 'funding';

  renderScenarioBar(data);

  // Funding view — show/hide
  var fundingView = document.getElementById('pl-funding-view');
  var plSummary = document.getElementById('pl-summary');
  var plSections = document.getElementById('pl-sections');

  var plCalcs = document.getElementById('pl-calculators');

  if (isFunding) {
    if (fundingView) fundingView.style.display = 'block';
    if (plSummary) plSummary.style.display = 'none';
    if (plSections) plSections.style.display = 'none';
    if (plCalcs) plCalcs.style.display = 'none';
    return;
  } else {
    if (fundingView) fundingView.style.display = 'none';
    if (plSummary) plSummary.style.display = '';
    if (plSections) plSections.style.display = '';
    if (plCalcs) plCalcs.style.display = '';
  }
  renderPLSummary(calc, scenario);

  var calcEl = document.getElementById('pl-calculators');

  if (isBusiness) {
    // Business tab: just fixed costs in a flat list
    if (calcEl) calcEl.innerHTML = '';
    renderPLSectionsBusiness(scenario);
  } else {
    // Popup tabs: section-based layout
    renderPLSections(scenario, calc, liveInventory);

    // Calculators go at the very bottom (after all sections)
    renderPLCalculators(scenario);
    initBECalc();
  }
}

function renderScenarioBar(data) {
  var el = document.getElementById('pl-scenario-bar');
  if (!el) return;

  // Permanent tabs: 46 Hester + Business + any cloned scenarios
  var html = '<div class="pl-scenario-pills">';

  // Always show popup and business first
  var popup = data.scenarios.find(function(s) { return s.id === 'popup'; });
  var business = data.scenarios.find(function(s) { return s.id === 'business'; });

  if (popup) {
    html += '<button class="pl-scenario-pill' + (data.activeScenario === 'popup' ? ' active' : '') + '" onclick="switchScenario(\'popup\')">' + esc(popup.name) + '</button>';
  }
  if (business) {
    html += '<button class="pl-scenario-pill pl-scenario-biz' + (data.activeScenario === 'business' ? ' active' : '') + '" onclick="switchScenario(\'business\')">' + esc(business.name) + '</button>';
  }
  html += '<button class="pl-scenario-pill' + (data.activeScenario === 'funding' ? ' active' : '') + '" onclick="switchScenario(\'funding\')" style="' + (data.activeScenario === 'funding' ? 'background:#88c98a;color:#0c0c0f;border-color:#88c98a' : 'border-color:#88c98a;color:#88c98a') + '">Funding Sources</button>';

  // Cloned scenarios
  data.scenarios.forEach(function(s) {
    if (s.id === 'popup' || s.id === 'business') return;
    var active = s.id === data.activeScenario;
    html += '<button class="pl-scenario-pill' + (active ? ' active' : '') + '" onclick="switchScenario(\'' + s.id + '\')">' + esc(s.name) + '</button>';
  });

  html += '<button class="pl-scenario-pill pl-add-scenario" onclick="addScenario()">+ 46 Hester Budget Scenario</button>';
  html += '</div>';

  // Scenario actions for cloned scenarios
  var scenario = getActiveScenario();
  if (scenario.id !== 'popup' && scenario.id !== 'business') {
    html += '<div class="pl-scenario-actions">';
    html += '<button class="pl-small-btn" onclick="renameScenario()">Rename</button>';
    html += '<button class="pl-small-btn pl-del-btn" onclick="deleteScenario()">Delete</button>';
    html += '</div>';
  }
  el.innerHTML = html;
}

function renderPLSummary(calc, scenario) {
  var el = document.getElementById('pl-summary');
  if (!el) return;
  var netClass = calc.netPL >= 0 ? 'pl-positive' : 'pl-negative';
  var totalCosts = calc.totalFixed + calc.totalVariable;

  // Consignment-only break-even: if all revenue were 30% commission
  var beConsignment = totalCosts > 0 ? Math.ceil(totalCosts / 0.30) : 0;

  // True break-even: uses actual blended margin from current inventory mix
  // Blended margin = our cut / gross revenue (accounts for 100% in-house + 30% consignment)
  var blendedRate = calc.totalGrossRevenue > 0 ? (calc.ourCut / calc.totalGrossRevenue) : 0.30;
  var beTrue = totalCosts > 0 && blendedRate > 0 ? Math.ceil(totalCosts / blendedRate) : 0;

  var isBusiness = scenario.id === 'business';

  if (isBusiness) {
    // Business tab: just total costs
    el.innerHTML =
      '<div class="pl-summary-grid">' +
        '<div class="pl-summary-card">' +
          '<div class="pl-summary-label">Total Business Costs</div>' +
          '<div class="pl-summary-val">$' + fmt(totalCosts) + '</div>' +
        '</div>' +
      '</div>';
    return;
  }

  el.innerHTML =
    '<div class="pl-summary-grid">' +
      '<div class="pl-summary-card">' +
        '<div class="pl-summary-label">Total Costs</div>' +
        '<div class="pl-summary-val">$' + fmt(totalCosts) + '</div>' +
        '<div class="pl-summary-detail">Fixed: $' + fmt(calc.totalFixed) + '</div>' +
        '<div class="pl-summary-detail">Variable: $' + fmt(calc.totalVariable) + '</div>' +
      '</div>' +
      '<div class="pl-summary-card">' +
        '<div class="pl-summary-label">Gross Revenue</div>' +
        '<div class="pl-summary-val">$' + fmt(calc.totalGrossRevenue) + '</div>' +
        '<div class="pl-summary-detail">Consignment: $' + fmt(calc.consignGross) + (calc.totalGrossRevenue > 0 ? ' (' + Math.round(calc.consignGross / calc.totalGrossRevenue * 100) + '%)' : '') + '</div>' +
        '<div class="pl-summary-detail">Merch: $' + fmt(calc.merchGross) + (calc.totalGrossRevenue > 0 ? ' (' + Math.round(calc.merchGross / calc.totalGrossRevenue * 100) + '%)' : '') + '</div>' +
      '</div>' +
      '<div class="pl-summary-card">' +
        '<div class="pl-summary-label">Front\'s Revenue</div>' +
        '<div class="pl-summary-val">$' + fmt(calc.ourCut) + '</div>' +
        '<div class="pl-summary-detail">From consignment: $' + fmt(calc.consignCut) + '</div>' +
        '<div class="pl-summary-detail">From merch: $' + fmt(calc.merchCut) + '</div>' +
      '</div>' +
      '<div class="pl-summary-card ' + netClass + '">' +
        '<div class="pl-summary-label">Net P/L</div>' +
        '<div class="pl-summary-val">' + (calc.netPL >= 0 ? '+' : '-') + '$' + fmt(Math.abs(calc.netPL)) + '</div>' +
      '</div>' +
    '</div>';
}

// ── Section-based P&L layout ──

var PL_SECTIONS = [
  { id: 'cafe', name: '\u2615 Cafe', color: '#a8c77d',
    fixedCats: ['cafe'],
    variableType: 'cafeVariable',
    revenueType: 'cafeRevenue' },
  { id: 'retail', name: '\ud83d\udecd Retail / Consignment', color: '#e2c97e',
    fixedCats: ['retail supplies', 'fit out'],
    variableIds: ['vc_square', 'vc_packaging'],
    revenueType: 'consignment' },
  { id: 'events', name: '\ud83c\udfee Events', color: '#c77dba',
    fixedCats: ['events'],
    variableType: 'eventsVariable',
    revenueType: 'otherRevenue' },
  { id: 'space', name: '\ud83c\udfe0 Space & Operations', color: '#82bfbb',
    fixedCats: ['space', 'operations'],
    revenueType: 'spaceRevenue' },
  { id: 'marketing', name: '\ud83d\udce3 Marketing & Branding', color: '#6aaad8',
    fixedCats: ['marketing', 'branding'] },
  { id: 'wholesale', name: '\ud83d\udcca Wholesale / In-House', color: '#e0845a',
    fixedCats: ['wholesale'],
    revenueType: 'wholesale',
    variableType: 'wholesaleCOGS',
    includeShipping: true }
];

// Track which sections are open between renders
var _plSectionOpen = {};

function togglePLSection(sectionId) {
  _plSectionOpen[sectionId] = !_plSectionOpen[sectionId];
  var el = document.getElementById('pl-sec-' + sectionId);
  if (el) el.classList.toggle('open');
}

function renderPLSections(scenario, calc, liveInventory) {
  var el = document.getElementById('pl-sections');
  if (!el) return;

  // Ensure otherRevenue exists
  if (!scenario.otherRevenue) scenario.otherRevenue = [
    { id: 'or_events', name: 'Event revenue', amount: scenario.eventRevenue || 0, note: scenario.eventNote || 'TBA' },
    { id: 'or_merch', name: 'Merch / branded goods', amount: scenario.merchRevenue || 0, note: '' }
  ];

  // Ensure spaceRevenue exists (e.g. insurance prorated refund)
  if (!scenario.spaceRevenue) scenario.spaceRevenue = [
    { id: 'sr_insurance_refund', name: 'Insurance prorated refund', amount: 0, note: 'Prorated return when GL policy cancelled after popup ends' }
  ];

  // Ensure cafeVariable exists (ongoing supply costs — not per-drink)
  if (!scenario.cafeVariable || !scenario.cafeVariable.length) {
    scenario.cafeVariable = [
      { id: 'cv_ice', name: 'Ice (ongoing)', amount: 0, note: '' },
      { id: 'cv_milk', name: 'Milk / oat milk', amount: 0, note: '' },
      { id: 'cv_matcha', name: 'Matcha powder', amount: 0, note: '' },
      { id: 'cv_flavoring', name: 'Flavoring ingredients', amount: 0, note: '' }
    ];
  }
  // Remove old per-drink/square items that moved to auto-calc
  scenario.cafeVariable = scenario.cafeVariable.filter(function(cv) {
    return cv.id !== 'cv_cost_per_drink' && cv.id !== 'cv_square_cafe';
  });

  // Ensure cafeRevenue exists — each drink has price, costPerDrink, and sold count
  if (!scenario.cafeRevenue) scenario.cafeRevenue = [
    { id: 'cr_1', name: 'TBD Drink 1', price: 0, costPerDrink: 0, sold: 0, note: '' },
    { id: 'cr_2', name: 'TBD Drink 2', price: 0, costPerDrink: 0, sold: 0, note: '' }
  ];
  // Migrate old format (amount) to new format (price/sold)
  scenario.cafeRevenue.forEach(function(cr) {
    if (cr.amount !== undefined && cr.price === undefined) {
      cr.price = cr.amount;
      cr.sold = 0;
      cr.costPerDrink = 0;
      delete cr.amount;
    }
  });

  // Save new arrays if they were just created
  var data = getPLData();
  var sc = data.scenarios.find(function(s) { return s.id === scenario.id; });
  if (sc && !sc.spaceRevenue) { sc.spaceRevenue = scenario.spaceRevenue; savePLData(data); }
  if (sc && !sc.cafeVariable) { sc.cafeVariable = scenario.cafeVariable; savePLData(data); }
  if (sc && !sc.cafeRevenue) { sc.cafeRevenue = scenario.cafeRevenue; savePLData(data); }

  // Separate live inventory items
  var liveItems = (liveInventory || []).filter(function(i) { return !i.isShippingDeduction; });
  var shippingItems = (liveInventory || []).filter(function(i) { return i.isShippingDeduction; });
  var consignmentItems = liveItems.filter(function(i) { return !i.isInHouse; });
  var wholesaleItems = liveItems.filter(function(i) { return i.isInHouse; });

  // Group fixed costs by category
  var fcByCat = {};
  (scenario.fixedCosts || []).forEach(function(c) {
    var cat = c.category || 'misc';
    if (!fcByCat[cat]) fcByCat[cat] = [];
    fcByCat[cat].push(c);
  });

  var html = '';

  PL_SECTIONS.forEach(function(sec) {
    var isOpen = _plSectionOpen[sec.id] !== false; // default open
    if (_plSectionOpen[sec.id] === undefined) _plSectionOpen[sec.id] = true;

    // Gather fixed costs for this section, sorted highest to lowest
    var sectionFixed = [];
    (sec.fixedCats || []).forEach(function(cat) {
      (fcByCat[cat] || []).forEach(function(c) { sectionFixed.push(c); });
    });
    sectionFixed.sort(function(a, b) { return ((b.amount || 0) - (b.refund || 0)) - ((a.amount || 0) - (a.refund || 0)); });

    // Calculate fixed total
    var fixedTotal = 0;
    sectionFixed.forEach(function(c) { fixedTotal += (c.amount || 0) - (c.refund || 0); });

    // Shipping costs for retail section
    var sectionShipping = [];
    if (sec.includeShipping && shippingItems.length) {
      shippingItems.forEach(function(s) {
        if (s.shippingCoveredBy === 'us') fixedTotal += (s.shippingAmount || 0);
        sectionShipping.push(s);
      });
    }

    // Calculate variable total
    var variableTotal = 0;
    var sectionVarItems = [];

    if (sec.variableIds) {
      (scenario.variableCosts || []).forEach(function(vc) {
        if (sec.variableIds.indexOf(vc.id) >= 0) {
          var estCost = 0;
          if (vc.type === 'pct_of_sales') {
            estCost = calc.totalGrossRevenue * ((vc.rate || 0) / 100) + calc.totalTransactions * (vc.perTxn || 0);
          } else if (vc.type === 'per_txn') {
            estCost = calc.totalTransactions * (vc.perTxn || 0);
          }
          variableTotal += estCost;
          sectionVarItems.push({ vc: vc, estCost: estCost });
        }
      });
    }

    if (sec.variableType === 'cafeVariable') {
      (scenario.cafeVariable || []).forEach(function(cv) {
        variableTotal += (cv.amount || 0);
      });
    }

    if (sec.variableType === 'wholesaleCOGS') {
      wholesaleItems.forEach(function(item) {
        if (item.costPerUnit) {
          var sale = scenario.itemSales && scenario.itemSales[item.id];
          var sellQty = (sale && sale.qty != null) ? sale.qty : (item.qty || 1);
          variableTotal += sellQty * item.costPerUnit;
        }
      });
    }

    // Calculate revenue total
    var revenueTotal = 0;
    if (sec.revenueType === 'consignment') {
      consignmentItems.forEach(function(item) {
        var sale = scenario.itemSales && scenario.itemSales[item.id];
        var sellQty = (sale && sale.qty != null) ? sale.qty : (item.qty || 1);
        revenueTotal += sellQty * item.price * (item.commissionPct / 100);
      });
    } else if (sec.revenueType === 'wholesale') {
      wholesaleItems.forEach(function(item) {
        var sale = scenario.itemSales && scenario.itemSales[item.id];
        var sellQty = (sale && sale.qty != null) ? sale.qty : (item.qty || 1);
        var gross = sellQty * item.price;
        revenueTotal += item.costPerUnit ? gross - (sellQty * item.costPerUnit) : gross;
      });
    } else if (sec.revenueType === 'otherRevenue') {
      (scenario.otherRevenue || []).forEach(function(r) { revenueTotal += (r.amount || 0); });
    } else if (sec.revenueType === 'cafeRevenue') {
      (scenario.cafeRevenue || []).forEach(function(r) { revenueTotal += (r.price || 0) * (r.sold || 0); });
    } else if (sec.revenueType === 'spaceRevenue') {
      (scenario.spaceRevenue || []).forEach(function(r) { revenueTotal += (r.amount || 0); });
    }

    // Build section HTML
    html += '<div class="pl-section' + (isOpen ? ' open' : '') + '" id="pl-sec-' + sec.id + '" data-section="' + sec.id + '">';
    html += '<div class="pl-section-head" onclick="togglePLSection(\'' + sec.id + '\')">';
    html += '<span class="pl-section-head-name">' + sec.name + '</span>';
    html += '<span class="pl-section-head-totals">';
    html += '<span class="pl-section-head-fixed">Fixed $' + fmt(fixedTotal) + '</span>';
    html += '<span class="pl-section-head-variable">Var $' + fmt(variableTotal) + '</span>';
    html += '<span class="pl-section-head-revenue">Rev $' + fmt(revenueTotal) + '</span>';
    if (sec.id === 'cafe') {
      var cafeProfit = Math.max(0, revenueTotal - fixedTotal - variableTotal);
      html += '<span style="font-family:DM Mono,monospace;font-size:10px;color:#88c98a">Profit $' + fmt(cafeProfit) + '</span>';
    }
    html += '</span>';
    html += '<span class="pl-section-head-chevron">\u203a</span>';
    html += '</div>';

    html += '<div class="pl-section-body"><div class="pl-section-grid">';

    // ── CAFE SECTION: custom 4-column layout (Fixed | Revenue | Variable | Profit) ──
    if (sec.id === 'cafe') {
      // Fixed costs column
      html += '<div class="pl-section-col">';
      html += '<div class="pl-section-col-head"><span>Fixed Costs</span><span class="pl-section-col-total">$' + fmt(fixedTotal) + '</span></div>';
      if (sectionFixed.length) {
        sectionFixed.forEach(function(c) { html += renderFixedCostCard(c); });
        html += '<button class="pl-add-row-btn" onclick="addFixedCostToCat(\'cafe\')">+ Add to cafe</button>';
      } else {
        html += '<div class="pl-section-empty">\u2014</div>';
      }
      html += '</div>';

      // Ongoing supplies column (right next to fixed costs)
      var cafeSupplyCostsCol = 0;
      (scenario.cafeVariable || []).forEach(function(cv) {
        // Calculate amount from sub-items if they exist, otherwise use manual amount
        var subs = cv.subItems || [];
        if (subs.length > 0) {
          var subTotal = 0;
          subs.forEach(function(s) { subTotal += (s.amount || 0); });
          cv.amount = subTotal; // auto-update
        }
        cafeSupplyCostsCol += (cv.amount || 0);
      });
      html += '<div class="pl-section-col">';
      html += '<div class="pl-section-col-head"><span>Ongoing Supplies</span><span class="pl-section-col-total">$' + fmt(cafeSupplyCostsCol) + '</span></div>';
      if (scenario.cafeVariable && scenario.cafeVariable.length) {
        (scenario.cafeVariable || []).forEach(function(cv) {
          var cvOpen = document.getElementById('pl-cafe-var-' + cv.id) && document.getElementById('pl-cafe-var-' + cv.id).classList.contains('open');
          var subs = cv.subItems || [];
          var subCount = subs.length;
          html += '<div class="pl-cost-item' + (cvOpen ? ' open' : '') + '" id="pl-cafe-var-' + cv.id + '">' +
            '<div class="pl-cost-top" onclick="toggleCafeVarCard(\'' + cv.id + '\')">' +
              '<span class="pl-cost-name-display">' + esc(cv.name || '(untitled)') + '</span>' +
              (cv.who ? '<span style="font-family:DM Mono,monospace;font-size:8px;color:#88c98a;margin-right:4px">' + cv.who + '</span>' : '') +
              (subCount > 0 ? '<span style="font-family:DM Mono,monospace;font-size:8px;color:var(--muted)">' + subCount + ' items</span>' : '') +
              '<span class="pl-cost-amt-inline" style="pointer-events:none">$' + fmt(cv.amount || 0) + '</span>' +
              '<span class="pl-cost-chevron">\u203a</span>' +
            '</div>' +
            '<div class="pl-cost-body">' +
              '<div class="pl-cost-fields">' +
                '<div class="pl-cost-field"><div class="pl-cost-field-label">Category Name</div><input class="pl-cost-field-input" value="' + esc(cv.name || '') + '" data-cv-id="' + cv.id + '" data-field="name" onchange="updateCafeVarField(this)"></div>' +
                '<div class="pl-cost-field"><div class="pl-cost-field-label">Purchased by</div><div style="display:flex;gap:10px;padding:4px 0">' + ['Del','Brooke'].map(function(who) { return '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-family:DM Mono,monospace;font-size:10px;color:' + (cv.who === who ? '#88c98a' : 'var(--muted)') + '"><input type="checkbox"' + (cv.who === who ? ' checked' : '') + ' onclick="event.stopPropagation();updateCafeVarField({dataset:{cvId:\'' + cv.id + '\',field:\'who\'},value:this.checked?\'' + who + '\':\'\'})" style="accent-color:#88c98a">' + who + '</label>'; }).join('') + '</div></div>' +
                '<div class="pl-cost-field pl-cost-field-full"><div class="pl-cost-field-label">Notes</div><textarea class="pl-cost-field-textarea" placeholder="Details\u2026" data-cv-id="' + cv.id + '" data-field="note" onchange="updateCafeVarField(this)">' + esc(cv.note || '') + '</textarea></div>' +
              '</div>' +
              // Sub-items
              '<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--faint)">' +
                '<div style="font-family:DM Mono,monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.06em;color:var(--muted);margin-bottom:6px">Line Items</div>' +
                subs.map(function(sub, si) {
                  return '<div style="display:flex;gap:6px;align-items:center;padding:3px 0">' +
                    '<input class="pl-cost-field-input" value="' + esc(sub.name || '') + '" placeholder="Item name" oninput="updateCafeSubItem(\'' + cv.id + '\',' + si + ',\'name\',this.value)" style="flex:1;font-size:11px;padding:3px 6px">' +
                    '<div style="display:flex;align-items:center;gap:2px"><span style="color:var(--muted);font-size:10px">$</span><input type="number" min="0" step="0.01" value="' + (sub.amount || '') + '" placeholder="0" oninput="updateCafeSubItem(\'' + cv.id + '\',' + si + ',\'amount\',parseFloat(this.value)||0)" onblur="renderPL()" style="width:55px;background:var(--surface2);border:1px solid var(--faint);color:var(--text);font-family:DM Mono,monospace;font-size:11px;padding:3px;border-radius:3px;text-align:right"></div>' +
                    '<button onclick="deleteCafeSubItem(\'' + cv.id + '\',' + si + ')" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:10px">x</button>' +
                  '</div>';
                }).join('') +
                '<button onclick="addCafeSubItem(\'' + cv.id + '\')" style="background:none;border:1px dashed var(--faint);color:var(--muted);font-family:DM Mono,monospace;font-size:9px;padding:3px 10px;border-radius:3px;cursor:pointer;margin-top:4px">+ Add item</button>' +
              '</div>' +
              '<button class="pl-cost-delete-btn" onclick="deleteCafeVar(\'' + cv.id + '\')">Delete category</button>' +
            '</div></div>';
        });
      }
      html += '<button class="pl-add-row-btn" onclick="addCafeVar()">+ Add supply category</button>';
      html += '</div>';

      // Revenue column (with sell buttons)
      var cafeTotalDrinksSold = 0;
      var cafeTotalDrinkRevenue = 0;
      (scenario.cafeRevenue || []).forEach(function(cr) {
        cafeTotalDrinksSold += (cr.sold || 0);
        cafeTotalDrinkRevenue += (cr.price || 0) * (cr.sold || 0);
      });
      html += '<div class="pl-section-col">';
      html += '<div class="pl-section-col-head"><span>Revenue Details</span><span class="pl-section-col-total">$' + fmt(cafeTotalDrinkRevenue) + '</span></div>';
      // Compact inline entry for each drink
      html += '<div style="margin-bottom:8px">';
      html += '<div style="display:grid;grid-template-columns:1fr 60px 50px 70px 30px;gap:6px;align-items:center;font-family:DM Mono,monospace;font-size:8px;color:var(--muted);text-transform:uppercase;padding-bottom:4px;border-bottom:1px solid var(--faint)">';
      html += '<div>Drink</div><div style="text-align:center">Price</div><div style="text-align:center">Sold</div><div style="text-align:right">Revenue</div><div></div></div>';
      (scenario.cafeRevenue || []).forEach(function(cr) {
        var drinkRev = (cr.price || 0) * (cr.sold || 0);
        html += '<div style="display:grid;grid-template-columns:1fr 60px 50px 70px 30px;gap:6px;align-items:center;padding:4px 0;border-bottom:1px solid var(--faint)">';
        html += '<input class="pl-cost-field-input" value="' + esc(cr.name || '') + '" data-arr="cafeRevenue" data-rid="' + cr.id + '" data-field="name" onchange="updateGenRevField(this)" style="font-family:Cormorant Garamond,serif;font-size:14px;padding:2px 4px">';
        html += '<input type="number" min="0" step="0.5" value="' + (cr.price || 0) + '" data-arr="cafeRevenue" data-rid="' + cr.id + '" data-field="price" onchange="updateGenRevField(this)" style="width:50px;background:var(--surface2);border:1px solid var(--faint);color:var(--text);font-family:DM Mono,monospace;font-size:11px;padding:4px;border-radius:3px;text-align:center">';
        html += '<input type="number" min="0" value="' + (cr.sold || 0) + '" data-arr="cafeRevenue" data-rid="' + cr.id + '" data-field="sold" onchange="updateGenRevField(this)" style="width:40px;background:var(--surface2);border:1px solid #88c98a;color:#88c98a;font-family:DM Mono,monospace;font-size:11px;padding:4px;border-radius:3px;text-align:center;font-weight:700">';
        html += '<div style="font-family:DM Mono,monospace;font-size:11px;color:var(--text);text-align:right;font-weight:600">$' + fmt(drinkRev) + '</div>';
        html += '<button onclick="deleteGenRevItem(\'cafeRevenue\',\'' + cr.id + '\')" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:10px">x</button>';
        html += '</div>';
      });
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px">';
      html += '<button class="pl-add-row-btn" onclick="addCafeDrink()" style="margin:0">+ Add drink</button>';
      html += '<div style="font-family:DM Mono,monospace;font-size:12px;color:#88c98a;font-weight:700">' + cafeTotalDrinksSold + ' drinks · $' + fmt(cafeTotalDrinkRevenue) + ' revenue</div>';
      html += '</div></div>';
      html += '</div>';

      // Remove the old expandable revenue detail — it's now combined above
      if (false) { // kept for reference but no longer rendered
      (scenario.cafeRevenue || []).forEach(function(cr) {
        var drinkRev = (cr.price || 0) * (cr.sold || 0);
        var crOpen = document.getElementById('pl-cafe-drink-' + cr.id) && document.getElementById('pl-cafe-drink-' + cr.id).classList.contains('open');
        html += '<div class="pl-cost-item' + (crOpen ? ' open' : '') + '" id="pl-cafe-drink-' + cr.id + '">';
        html += '<div class="pl-cost-top" onclick="var e=document.getElementById(\'pl-cafe-drink-' + cr.id + '\');if(e)e.classList.toggle(\'open\')">';
        html += '<span class="pl-cost-name-display">' + esc(cr.name || '(untitled)') + '</span>';
        html += '<span style="font-family:DM Mono,monospace;font-size:10px;color:var(--muted);margin-right:4px">$' + fmt(cr.price || 0) + '</span>';
        // Sell button
        html += '<span onclick="event.stopPropagation();cafeSellDrink(\'' + cr.id + '\')" style="background:#88c98a33;border:2px solid #88c98a;color:#88c98a;font-family:DM Mono,monospace;font-size:9px;padding:3px 8px;border-radius:3px;cursor:pointer;text-transform:uppercase;font-weight:700;letter-spacing:0.04em">+ SELL</span>';
        html += '<span style="font-family:DM Mono,monospace;font-size:10px;color:#88c98a;margin:0 4px">' + (cr.sold || 0) + ' sold</span>';
        if (cr.sold > 0) {
          html += '<span onclick="event.stopPropagation();cafeUndoDrink(\'' + cr.id + '\')" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:10px" title="Undo">\u21a9</span>';
        }
        html += '<span style="font-family:DM Mono,monospace;font-size:11px;color:var(--text);font-weight:600;margin-left:auto">$' + fmt(drinkRev) + '</span>';
        html += '<span class="pl-cost-chevron">\u203a</span>';
        html += '</div>';
        html += '<div class="pl-cost-body">';
        html += '<div class="pl-cost-fields">';
        html += '<div class="pl-cost-field"><div class="pl-cost-field-label">Drink Name</div><input class="pl-cost-field-input" value="' + esc(cr.name || '') + '" data-arr="cafeRevenue" data-rid="' + cr.id + '" data-field="name" onchange="updateGenRevField(this)"></div>';
        html += '<div class="pl-cost-field"><div class="pl-cost-field-label">Price ($)</div><input class="pl-cost-field-input" type="number" min="0" step="0.5" value="' + (cr.price || 0) + '" data-arr="cafeRevenue" data-rid="' + cr.id + '" data-field="price" onchange="updateGenRevField(this)"></div>';
        html += '<div class="pl-cost-field"><div class="pl-cost-field-label">Sold</div><input class="pl-cost-field-input" type="number" min="0" value="' + (cr.sold || 0) + '" data-arr="cafeRevenue" data-rid="' + cr.id + '" data-field="sold" onchange="updateGenRevField(this)"></div>';
        html += '<div class="pl-cost-field pl-cost-field-full"><div class="pl-cost-field-label">Notes</div><textarea class="pl-cost-field-textarea" placeholder="Details\u2026" data-arr="cafeRevenue" data-rid="' + cr.id + '" data-field="note" onchange="updateGenRevField(this)">' + esc(cr.note || '') + '</textarea></div>';
        html += '</div>';
        html += '<button class="pl-cost-delete-btn" onclick="deleteGenRevItem(\'cafeRevenue\',\'' + cr.id + '\')">Delete drink</button>';
        html += '</div></div>';
      });
      } // end if(false)

      // Variable costs column (auto-calculated from sales)
      var cafeIngredientCost = 0;
      (scenario.cafeRevenue || []).forEach(function(cr) { cafeIngredientCost += (cr.costPerDrink || 0) * (cr.sold || 0); });
      var cafeSquare = cafeTotalDrinkRevenue * 0.026 + cafeTotalDrinksSold * 0.15;
      var cafeSupplyCosts = 0;
      (scenario.cafeVariable || []).forEach(function(cv) { cafeSupplyCosts += (cv.amount || 0); });
      var cafeTotalVar = cafeIngredientCost + cafeSquare + cafeSupplyCosts;
      variableTotal = cafeTotalVar; // override for profit calc

      html += '<div class="pl-section-col">';
      html += '<div class="pl-section-col-head"><span>Variable Costs</span><span class="pl-section-col-total">$' + fmt(cafeTotalVar) + '</span></div>';

      // Auto-calc items
      html += '<div style="padding:4px 0;display:flex;flex-direction:column;gap:4px">';
      html += '<div class="pl-cost-row"><span class="pl-cost-name">Square fee</span><span class="pl-cost-note">2.6% + $0.15/txn</span><span class="pl-cost-amt">$' + fmt(cafeSquare) + '</span></div>';
      html += '</div>';

      // Ongoing supplies now in their own column above
      html += '</div>';

      // Profit split column
      var cafeTotalCosts = fixedTotal + cafeTotalVar;
      var cafeGrossProfit = cafeTotalDrinkRevenue - cafeTotalCosts;
      var cafeNetProfit = Math.max(0, cafeGrossProfit);
      var eliseShare = Math.round(cafeNetProfit * 0.30);
      var frontShare = Math.round(cafeNetProfit * 0.70);
      var profitClass = cafeGrossProfit >= 0 ? '#88c98a' : '#e07070';

      html += '<div class="pl-section-col">';
      html += '<div class="pl-section-col-head"><span>Profit Split</span><span class="pl-section-col-total" style="color:' + profitClass + '">$' + fmt(cafeNetProfit) + '</span></div>';
      html += '<div style="padding:8px 0;font-family:DM Mono,monospace;font-size:11px;display:flex;flex-direction:column;gap:10px">';
      html += '<div style="display:flex;flex-direction:column;gap:4px;padding-bottom:10px;border-bottom:1px solid var(--border)">';
      html += '<div style="display:flex;justify-content:space-between;color:var(--muted)"><span>Revenue</span><span>$' + fmt(cafeTotalDrinkRevenue) + '</span></div>';
      html += '<div style="display:flex;justify-content:space-between;color:var(--muted)"><span>- Fixed</span><span>-$' + fmt(fixedTotal) + '</span></div>';
      html += '<div style="display:flex;justify-content:space-between;color:var(--muted)"><span>- Variable</span><span>-$' + fmt(cafeTotalVar) + '</span></div>';
      html += '<div style="display:flex;justify-content:space-between;font-weight:700;color:' + profitClass + '"><span>Gross Profit</span><span>' + (cafeGrossProfit >= 0 ? '' : '-') + '$' + fmt(Math.abs(cafeGrossProfit)) + '</span></div>';
      html += '</div>';
      html += '<div style="display:flex;flex-direction:column;gap:6px">';
      html += '<div style="font-size:9px;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted);font-weight:600">After break-even</div>';
      html += '<div style="display:flex;justify-content:space-between;align-items:center"><span style="color:var(--text)">Brooke & Del <span style="color:var(--muted);font-size:9px">70%</span></span><span style="color:#88c98a;font-weight:700">$' + fmt(frontShare) + '</span></div>';
      html += '<div style="display:flex;justify-content:space-between;align-items:center"><span style="color:var(--text)">Chez Elise <span style="color:var(--muted);font-size:9px">30%</span></span><span style="color:#6aaad8;font-weight:700">$' + fmt(eliseShare) + '</span></div>';
      html += '</div>';
      if (cafeGrossProfit < 0) {
        html += '<div style="font-size:9px;color:#e07070;margin-top:4px">Costs not yet covered \u2014 no profit split until break-even</div>';
      }
      html += '</div></div>';

      html += '</div></div>'; // close grid + body
      html += '</div>'; // close section
      return; // skip generic column rendering for cafe
    }

    // ── FIXED COSTS column ──
    html += '<div class="pl-section-col">';
    html += '<div class="pl-section-col-head"><span>Fixed Costs</span><span class="pl-section-col-total">$' + fmt(fixedTotal) + '</span></div>';

    if (sectionFixed.length || sectionShipping.length) {
      // Group by sub-category within the section
      var subCats = {};
      sectionFixed.forEach(function(c) {
        var cat = c.category || 'misc';
        if (!subCats[cat]) subCats[cat] = [];
        subCats[cat].push(c);
      });

      var subCatOrder = (sec.fixedCats || []).filter(function(c) { return subCats[c]; });
      Object.keys(subCats).forEach(function(c) { if (subCatOrder.indexOf(c) < 0) subCatOrder.push(c); });

      // Sort items within each sub-cat by amount desc
      subCatOrder.forEach(function(cat) {
        subCats[cat].sort(function(a, b) { return (b.amount || 0) - (a.amount || 0); });
      });

      subCatOrder.forEach(function(cat) {
        var catTotal = 0;
        subCats[cat].forEach(function(c) { catTotal += (c.amount || 0) - (c.refund || 0); });

        if (subCatOrder.length > 1) {
          html += '<div class="pl-cost-cat"><span class="pl-cost-cat-name">' + esc(cat) + '</span><span class="pl-cost-cat-total">$' + fmt(catTotal) + '</span></div>';
        }

        subCats[cat].forEach(function(c) {
          html += renderFixedCostCard(c);
          // For wholesale purchase items, show itemized costs from inventory
          if (c.id === 'fc_hadaikum_cost' || c.id === 'fc_merch_tshirts' || c.id === 'fc_merch_stickers') {
            var matchVendor = null;
            if (c.id === 'fc_hadaikum_cost') matchVendor = 'hadaikum';
            else if (c.id === 'fc_merch_tshirts' || c.id === 'fc_merch_stickers') matchVendor = 'the front merch';
            if (matchVendor) {
              var invItems = wholesaleItems.filter(function(i) { return i.vendor && i.vendor.toLowerCase().indexOf(matchVendor) >= 0; });
              if (invItems.length && c.id !== 'fc_merch_stickers') { // avoid double-listing for merch
                var isSubOpen = document.getElementById('pl-ws-sub-' + c.id) && document.getElementById('pl-ws-sub-' + c.id).classList.contains('open');
                html += '<div class="pl-cost-item' + (isSubOpen ? ' open' : '') + '" id="pl-ws-sub-' + c.id + '" style="margin-left:12px;border-left:2px solid var(--border)">';
                html += '<div class="pl-cost-top" onclick="var e=document.getElementById(\'pl-ws-sub-' + c.id + '\');if(e)e.classList.toggle(\'open\')">';
                html += '<span class="pl-cost-name-display" style="font-size:10px;color:var(--muted)">' + invItems.length + ' items breakdown</span>';
                html += '<span class="pl-cost-chevron">\u203a</span>';
                html += '</div>';
                html += '<div class="pl-cost-body" style="padding:4px 8px">';
                var invTotal = 0;
                invItems.forEach(function(inv) {
                  var cost = inv.costPerUnit || 0;
                  var qty = inv.qty || 1;
                  var lineTotal = cost * qty;
                  invTotal += lineTotal;
                  html += '<div style="display:flex;justify-content:space-between;padding:3px 0;font-family:DM Mono,monospace;font-size:10px;border-bottom:1px solid var(--border)">';
                  html += '<span style="color:var(--text)">' + esc(inv.name || '(untitled)') + '</span>';
                  html += '<span style="color:var(--muted)">$' + fmt(cost) + ' \u00d7 ' + qty + ' = <span style="color:var(--text)">$' + fmt(lineTotal) + '</span></span>';
                  html += '</div>';
                });
                html += '<div style="display:flex;justify-content:space-between;padding:6px 0;font-family:DM Mono,monospace;font-size:11px;font-weight:700">';
                html += '<span>Total</span><span>$' + fmt(invTotal) + '</span>';
                html += '</div>';
                html += '</div></div>';
              }
            }
          }
        });

        html += '<button class="pl-add-row-btn" onclick="addFixedCostToCat(\'' + esc(cat) + '\')">+ Add to ' + esc(cat) + '</button>';
      });

      // Shipping items
      if (sectionShipping.length) {
        var shippingWeCover = 0;
        var totalAllShipping = 0;
        sectionShipping.forEach(function(s) {
          totalAllShipping += (s.shippingAmount || 0);
          if (s.shippingCoveredBy === 'us') shippingWeCover += (s.shippingAmount || 0);
        });
        html += '<div class="pl-cost-cat"><span class="pl-cost-cat-name">shipping</span><span class="pl-cost-cat-total">$' + fmt(shippingWeCover) + '</span></div>';
        sectionShipping.forEach(function(shipItem) {
          html += renderShippingCard(shipItem);
        });
      }
    } else {
      html += '<div class="pl-section-empty">\u2014</div>';
    }
    html += '</div>';

    // ── VARIABLE COSTS column ──
    html += '<div class="pl-section-col">';
    html += '<div class="pl-section-col-head"><span>Variable Costs</span><span class="pl-section-col-total">$' + fmt(variableTotal) + '</span></div>';

    var hasVariable = false;
    if (sectionVarItems.length) {
      hasVariable = true;
      html += '<div class="pl-variable-note">Based on ' + calc.totalTransactions + ' txns, $' + fmt(calc.totalGrossRevenue) + ' gross</div>';
      sectionVarItems.forEach(function(sv) {
        html += '<div class="pl-cost-row">' +
          '<span class="pl-cost-name">' + esc(sv.vc.name) + '</span>' +
          '<span class="pl-cost-note">' + esc(sv.vc.note || '') + '</span>' +
          '<span class="pl-cost-amt">$' + fmt(sv.estCost) + '</span>' +
          '<button class="pl-row-del" onclick="deleteVariableCost(\'' + sv.vc.id + '\')">x</button>' +
        '</div>';
      });
    }

    if (sec.variableType === 'cafeVariable') {
      hasVariable = true;
      (scenario.cafeVariable || []).forEach(function(cv) {
        var cvOpen = document.getElementById('pl-cafe-var-' + cv.id) && document.getElementById('pl-cafe-var-' + cv.id).classList.contains('open');
        html += '<div class="pl-cost-item' + (cvOpen ? ' open' : '') + '" id="pl-cafe-var-' + cv.id + '">' +
          '<div class="pl-cost-top" onclick="toggleCafeVarCard(\'' + cv.id + '\')">' +
            '<span class="pl-cost-name-display">' + esc(cv.name || '(untitled)') + '</span>' +
            '<div class="pl-cost-amt-inline" onclick="event.stopPropagation()">$<input type="number" min="0" class="pl-cost-amt-num" value="' + (cv.amount || 0) + '" data-cv-id="' + cv.id + '" onchange="updateCafeVar(this)"></div>' +
            '<span class="pl-cost-chevron">\u203a</span>' +
          '</div>' +
          '<div class="pl-cost-body">' +
            '<div class="pl-cost-fields">' +
              '<div class="pl-cost-field"><div class="pl-cost-field-label">Name</div><input class="pl-cost-field-input" value="' + esc(cv.name || '') + '" data-cv-id="' + cv.id + '" data-field="name" onchange="updateCafeVarField(this)"></div>' +
              '<div class="pl-cost-field"><div class="pl-cost-field-label">Amount ($)</div><input class="pl-cost-field-input" type="number" min="0" value="' + (cv.amount || 0) + '" data-cv-id="' + cv.id + '" data-field="amount" onchange="updateCafeVarField(this)"></div>' +
              '<div class="pl-cost-field pl-cost-field-full"><div class="pl-cost-field-label">Notes</div><textarea class="pl-cost-field-textarea" placeholder="Details\u2026" data-cv-id="' + cv.id + '" data-field="note" onchange="updateCafeVarField(this)">' + esc(cv.note || '') + '</textarea></div>' +
            '</div>' +
            '<button class="pl-cost-delete-btn" onclick="deleteCafeVar(\'' + cv.id + '\')">Delete item</button>' +
          '</div>' +
        '</div>';
      });
      html += '<button class="pl-add-row-btn" onclick="addCafeVar()">+ Add ingredient</button>';
    }

    if (sec.variableType === 'wholesaleCOGS') {
      // No variable costs for wholesale — costs are in fixed costs
      // Square fee shown as a note only
      html += '<div style="padding:8px 0;font-family:DM Mono,monospace;font-size:9px;color:var(--muted)">Square fee (2.6% + $0.15) applies per sale</div>';
    }

    if (!hasVariable) {
      html += '<div class="pl-section-empty">\u2014</div>';
    }
    html += '</div>';

    // ── REVENUE column ──
    html += '<div class="pl-section-col">';
    html += '<div class="pl-section-col-head"><span>Revenue</span><span class="pl-section-col-total">$' + fmt(revenueTotal) + '</span></div>';

    var hasRevenue = false;

    if (sec.revenueType === 'consignment') {
      if (consignmentItems.length) {
        hasRevenue = true;
        html += renderConsignmentRevenue(consignmentItems, scenario);
      }
    } else if (sec.revenueType === 'wholesale') {
      if (wholesaleItems.length) {
        hasRevenue = true;
        html += renderWholesaleRevenue(wholesaleItems, scenario);
      }
    } else if (sec.revenueType === 'otherRevenue') {
      if (scenario.otherRevenue && scenario.otherRevenue.length) {
        hasRevenue = true;
        html += renderOtherRevenueCards(scenario);
      }
      html += '<button class="pl-add-row-btn" onclick="addOtherRevItem()">+ Add other revenue</button>';
    } else if (sec.revenueType === 'cafeRevenue') {
      if (scenario.cafeRevenue && scenario.cafeRevenue.length) {
        hasRevenue = true;
        html += renderCafeRevenueCards(scenario);
      }
      html += '<button class="pl-add-row-btn" onclick="addCafeRevItem()">+ Add drink</button>';
    } else if (sec.revenueType === 'spaceRevenue') {
      if (scenario.spaceRevenue && scenario.spaceRevenue.length) {
        hasRevenue = true;
        html += renderCafeRevenueCards(scenario, 'spaceRevenue');
      }
      html += '<button class="pl-add-row-btn" onclick="addSpaceRevItem()">+ Add item</button>';
    }

    if (!hasRevenue && sec.revenueType !== 'otherRevenue' && sec.revenueType !== 'cafeRevenue' && sec.revenueType !== 'spaceRevenue') {
      html += '<div class="pl-section-empty">\u2014</div>';
    }
    html += '</div>';

    html += '</div></div>'; // close grid + body
    html += '</div>'; // close section
  });

  // Misc / uncategorized fixed costs
  var miscCats = [];
  Object.keys(fcByCat).forEach(function(cat) {
    var assigned = false;
    PL_SECTIONS.forEach(function(sec) {
      if (sec.fixedCats && sec.fixedCats.indexOf(cat) >= 0) assigned = true;
    });
    if (!assigned) miscCats.push(cat);
  });
  if (miscCats.length) {
    var miscTotal = 0;
    miscCats.forEach(function(cat) {
      fcByCat[cat].forEach(function(c) { miscTotal += (c.amount || 0) - (c.refund || 0); });
    });
    var miscOpen = _plSectionOpen['misc'] !== false;
    if (_plSectionOpen['misc'] === undefined) _plSectionOpen['misc'] = true;

    html += '<div class="pl-section' + (miscOpen ? ' open' : '') + '" id="pl-sec-misc" data-section="misc">';
    html += '<div class="pl-section-head" onclick="togglePLSection(\'misc\')">';
    html += '<span class="pl-section-head-name">Other / Misc</span>';
    html += '<span class="pl-section-head-totals"><span class="pl-section-head-fixed">Fixed $' + fmt(miscTotal) + '</span></span>';
    html += '<span class="pl-section-head-chevron">\u203a</span>';
    html += '</div>';
    html += '<div class="pl-section-body"><div class="pl-section-grid">';
    html += '<div class="pl-section-col">';
    html += '<div class="pl-section-col-head"><span>Fixed Costs</span><span class="pl-section-col-total">$' + fmt(miscTotal) + '</span></div>';
    miscCats.forEach(function(cat) {
      var catTotal = 0;
      fcByCat[cat].forEach(function(c) { catTotal += (c.amount || 0) - (c.refund || 0); });
      html += '<div class="pl-cost-cat"><span class="pl-cost-cat-name">' + esc(cat) + '</span><span class="pl-cost-cat-total">$' + fmt(catTotal) + '</span></div>';
      fcByCat[cat].forEach(function(c) {
        html += renderFixedCostCard(c);
      });
      html += '<button class="pl-add-row-btn" onclick="addFixedCostToCat(\'' + esc(cat) + '\')">+ Add to ' + esc(cat) + '</button>';
    });
    html += '</div>';
    html += '<div class="pl-section-col"><div class="pl-section-col-head"><span>Variable Costs</span></div><div class="pl-section-empty">\u2014</div></div>';
    html += '<div class="pl-section-col"><div class="pl-section-col-head"><span>Revenue</span></div><div class="pl-section-empty">\u2014</div></div>';
    html += '</div></div></div>';
  }

  html += '<button class="pl-add-row-btn" style="margin-top:12px" onclick="addFixedCost()">+ Add to new category</button>';

  el.innerHTML = html;
}

// Business tab: flat list of fixed costs only
function renderPLSectionsBusiness(scenario) {
  var el = document.getElementById('pl-sections');
  if (!el) return;
  var html = '';
  var total = 0;
  (scenario.fixedCosts || []).forEach(function(c) { total += (c.amount || 0) - (c.refund || 0); });
  html += '<div class="pl-section-header"><span class="pl-section-title">Fixed Costs</span><span class="pl-section-total">$' + fmt(total) + '</span></div>';
  (scenario.fixedCosts || []).forEach(function(c) {
    html += renderFixedCostCard(c);
  });
  html += '<button class="pl-add-row-btn" onclick="addFixedCost()">+ Add item</button>';
  el.innerHTML = html;
}

// ── Shared card renderers ──

function renderFixedCostCard(c) {
  var isOpen = document.getElementById('pl-cost-' + c.id) && document.getElementById('pl-cost-' + c.id).classList.contains('open');
  var status = c.status || 'needed';
  var statColor = FC_STATUS_COLORS[status] || 'var(--muted)';
  var catOpts = FC_CATEGORIES.map(function(fc) {
    return '<option value="' + fc + '"' + (c.category === fc ? ' selected' : '') + '>' + fc + '</option>';
  }).join('');
  var statOpts = FC_STATUSES.map(function(s) {
    return '<option value="' + s + '"' + (status === s ? ' selected' : '') + '>' + s + '</option>';
  }).join('');

  var hasRefund = c.refund && c.refund > 0;
  var netCost = (c.amount || 0) - (c.refund || 0);
  var refundBadge = hasRefund ? '<span class="pl-refund-badge" onclick="toggleCostCard(\'' + c.id + '\')">' + 'net $' + fmt(netCost) + '</span>' : '';

  return '<div class="pl-cost-item' + (isOpen ? ' open' : '') + '" id="pl-cost-' + c.id + '" data-drag-id="' + c.id + '" data-drag-type="fixed" ondragover="plDragOver(event)" ondrop="plDrop(event)">' +
    '<div class="pl-cost-top">' +
      '<div class="pl-drag-handle" draggable="true" title="Drag to reorder" ondragstart="plDragStart(event)" ondragend="plDragEnd(event)">\u2807</div>' +
      '<div class="pl-cost-status-dot" style="background:' + statColor + '" onclick="toggleCostCard(\'' + c.id + '\')"></div>' +
      '<input class="pl-cost-name-inline" value="' + esc(c.name || '') + '" placeholder="Item name" data-cost-id="' + c.id + '" data-field="name" onchange="updateFixedCost(this)" onclick="event.stopPropagation()">' +
      refundBadge +
      '<div class="pl-cost-amt-inline" onclick="event.stopPropagation()">$<input type="number" min="0" class="pl-cost-amt-num" value="' + (c.amount || 0) + '" data-cost-id="' + c.id + '" data-field="amount" onchange="updateFixedCost(this)"></div>' +
      '<span class="pl-cost-chevron" onclick="toggleCostCard(\'' + c.id + '\')">\u203a</span>' +
    '</div>' +
    '<div class="pl-cost-body">' +
      '<div class="pl-cost-fields">' +
        '<div class="pl-cost-field"><div class="pl-cost-field-label">Category</div><select class="pl-cost-field-select" data-cost-id="' + c.id + '" data-field="category" onchange="updateFixedCost(this);renderPL()">' + catOpts + '</select></div>' +
        '<div class="pl-cost-field"><div class="pl-cost-field-label">Status</div><select class="pl-cost-status-sel" data-cost-id="' + c.id + '" data-field="status" onchange="updateFixedCost(this);renderPL()" style="border-color:' + statColor + '44;color:' + statColor + '">' + statOpts + '</select></div>' +
        '<div class="pl-cost-field"><div class="pl-cost-field-label">Where to get it</div><input class="pl-cost-field-input" value="' + esc(c.source || '') + '" placeholder="Vendor, store, link\u2026" data-cost-id="' + c.id + '" data-field="source" onchange="updateFixedCost(this)"></div>' +
        '<div class="pl-cost-field"><div class="pl-cost-field-label">Purchased by</div><div style="display:flex;gap:10px;padding:4px 0">' + ['Del','Brooke'].map(function(who) { return '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-family:DM Mono,monospace;font-size:10px;color:' + (c.who === who ? '#88c98a' : 'var(--muted)') + '"><input type="checkbox"' + (c.who === who ? ' checked' : '') + ' onclick="event.stopPropagation();updateFixedCost({dataset:{costId:\'' + c.id + '\',field:\'who\'},value:this.checked?\'' + who + '\':\'\'})" style="accent-color:#88c98a">' + who + '</label>'; }).join('') + '</div></div>' +
        '<div class="pl-cost-field"><div class="pl-cost-field-label">Refund (prorated return)</div><div class="pl-cost-refund-wrap"><span class="pl-dollar-sign">$</span><input class="pl-cost-field-input pl-cost-refund-input" type="number" min="0" value="' + (c.refund || 0) + '" placeholder="0" data-cost-id="' + c.id + '" data-field="refund" onchange="updateFixedCost(this)">' + (hasRefund ? '<span class="pl-refund-net">net $' + fmt(netCost) + '</span>' : '') + '</div></div>' +
        '<div class="pl-cost-field pl-cost-field-full"><div class="pl-cost-field-label">Notes</div><textarea class="pl-cost-field-textarea" placeholder="Details, alternatives\u2026" data-cost-id="' + c.id + '" data-field="note" onchange="updateFixedCost(this)">' + esc(c.note || '') + '</textarea></div>' +
      '</div>' +
      '<button class="pl-cost-delete-btn" onclick="deleteFixedCost(\'' + c.id + '\')">Delete item</button>' +
    '</div>' +
  '</div>';
}

function renderShippingCard(shipItem) {
  var coveredByUs = shipItem.shippingCoveredBy === 'us';
  var coveredLabel = coveredByUs ? 'We cover' : 'Vendor covers';
  var coveredColor = coveredByUs ? '#e07070' : '#88c98a';
  var isOpen = document.getElementById('pl-ship-' + shipItem.vendorId) &&
    document.getElementById('pl-ship-' + shipItem.vendorId).classList.contains('open');

  return '<div class="pl-cost-item' + (isOpen ? ' open' : '') + '" id="pl-ship-' + shipItem.vendorId + '">' +
    '<div class="pl-cost-top" onclick="var el=document.getElementById(\'pl-ship-' + shipItem.vendorId + '\');if(el)el.classList.toggle(\'open\')">' +
      '<div class="pl-cost-status-dot" style="background:' + coveredColor + '"></div>' +
      '<span class="pl-cost-name" style="flex:1">' + esc(shipItem.name) + '</span>' +
      '<span style="font-family:DM Mono,monospace;font-size:9px;color:' + coveredColor + ';margin-right:8px">' + coveredLabel + '</span>' +
      '<span class="pl-cost-amt">$' + fmt(shipItem.shippingAmount) + '</span>' +
      '<span class="pl-cost-chevron">\u203a</span>' +
    '</div>' +
    '<div class="pl-cost-body">' +
      '<div style="padding:8px 12px;font-family:DM Mono,monospace;font-size:10px;color:var(--muted);display:flex;flex-direction:column;gap:4px">' +
        (shipItem.vendorLocation ? '<div>Location: <span style="color:var(--text)">' + esc(shipItem.vendorLocation) + '</span></div>' : '') +
        '<div>Items shipping: <span style="color:var(--text)">' + shipItem.itemCount + '</span></div>' +
        '<div>Cost: <span style="color:var(--text)">$' + fmt(shipItem.shippingAmount) + '</span></div>' +
        '<div>Covered by: <span style="color:' + coveredColor + '">' + coveredLabel + '</span></div>' +
        (coveredByUs ? '<div style="margin-top:4px;color:#e07070">Added to our fixed costs</div>' : '<div style="margin-top:4px;color:#88c98a">No impact on our P&L</div>') +
      '</div>' +
      '<div style="padding:4px 12px 8px"><a href="#" onclick="showTab(\'front\',\'popup-inventory-new\',document.querySelector(\'[data-tab=popup-inventory-new]\'));return false" style="font-family:DM Mono,monospace;font-size:9px;color:var(--front)">Edit in Inventory \u2192</a></div>' +
    '</div>' +
  '</div>';
}

function renderConsignmentRevenue(items, scenario) {
  // Group by vendor
  var vendorMap = {};
  var vendorOrder = [];
  items.forEach(function(item) {
    var key = item.vendor || 'Other';
    if (!vendorMap[key]) { vendorMap[key] = { items: [], commissionPct: item.commissionPct }; vendorOrder.push(key); }
    vendorMap[key].items.push(item);
  });

  var h = '';
  vendorOrder.forEach(function(vendorName) {
    var group = vendorMap[vendorName];
    var vendorRate = group.commissionPct || 30;
    var vendorGross = 0, vendorCut = 0, vendorItemCount = 0;
    group.items.forEach(function(item) {
      var sale = scenario.itemSales && scenario.itemSales[item.id];
      var sellQty = (sale && sale.qty != null) ? sale.qty : (item.qty || 1);
      vendorGross += sellQty * item.price;
      vendorCut += sellQty * item.price * (item.commissionPct / 100);
      vendorItemCount++;
    });

    var isVendorOpen = document.getElementById('pl-vgroup-' + vendorName.replace(/\s/g,'_')) &&
      document.getElementById('pl-vgroup-' + vendorName.replace(/\s/g,'_')).classList.contains('open');

    h += '<div class="pl-vendor-collapse' + (isVendorOpen ? ' open' : '') + '" id="pl-vgroup-' + esc(vendorName.replace(/\s/g,'_')) + '">' +
      '<div class="pl-vendor-collapse-top" onclick="toggleVendorGroup(\'' + esc(vendorName.replace(/\s/g,'_')) + '\')">' +
        '<span class="pl-vendor-collapse-name">' + esc(vendorName) + ' <span style="font-size:9px;color:var(--muted);font-weight:normal">' + vendorRate + '% \u00b7 ' + vendorItemCount + ' items</span></span>' +
        '<span class="pl-vendor-collapse-gross">$' + fmt(vendorGross) + '</span>' +
        '<span class="pl-vendor-collapse-cut">$' + fmt(vendorCut) + '</span>' +
        '<span class="pl-cost-chevron">\u203a</span>' +
      '</div>' +
      '<div class="pl-vendor-collapse-body">';

    group.items.forEach(function(item) {
      var invQty = item.qty || 1;
      var sale = scenario.itemSales && scenario.itemSales[item.id];
      var sellQty = (sale && sale.qty != null) ? sale.qty : invQty;
      var gross = sellQty * item.price;
      var cut = gross * (item.commissionPct / 100);
      var dimmed = sellQty === 0;

      h += '<div class="pl-rev-spreadrow' + (dimmed ? ' pl-not-sold' : '') + '">' +
        '<span class="pl-rev-sr-item">' + esc(item.name || '(untitled)') + '</span>' +
        '<span class="pl-rev-sr-num">$' + fmt(item.price) + '</span>' +
        '<span class="pl-rev-sr-num" style="color:var(--muted)">inv ' + invQty + '</span>' +
        '<span class="pl-rev-sr-num" onclick="event.stopPropagation()">sell <input type="number" min="0" max="' + invQty + '" value="' + sellQty + '" class="pl-rev-sr-input" data-item-id="' + item.id + '" data-inv-qty="' + invQty + '" onchange="updateItemSellQty(this)"></span>' +
        '<span class="pl-rev-sr-num">' + item.commissionPct + '%</span>' +
        '<span class="pl-rev-sr-num pl-rev-sr-cut' + (dimmed ? ' pl-cut-muted' : '') + '">$' + fmt(cut) + '</span>' +
      '</div>';
    });

    h += '</div></div>';
  });
  return h;
}

function renderWholesaleRevenue(items, scenario) {
  var vendorMap = {};
  var vendorOrder = [];
  items.forEach(function(item) {
    var key = item.vendor || 'Other';
    if (!vendorMap[key]) { vendorMap[key] = { items: [] }; vendorOrder.push(key); }
    vendorMap[key].items.push(item);
  });

  var h = '';
  vendorOrder.forEach(function(vendorName) {
    var group = vendorMap[vendorName];
    var vendorGross = 0, vendorItemCount = 0;
    group.items.forEach(function(item) {
      var sale = scenario.itemSales && scenario.itemSales[item.id];
      var sellQty = (sale && sale.qty != null) ? sale.qty : (item.totalSold > 0 ? item.totalSold : (item.qty || 1));
      vendorGross += sellQty * item.price;
      vendorItemCount++;
    });

    var isVendorOpen = document.getElementById('pl-vgroup-' + vendorName.replace(/\s/g,'_')) &&
      document.getElementById('pl-vgroup-' + vendorName.replace(/\s/g,'_')).classList.contains('open');

    h += '<div class="pl-vendor-collapse' + (isVendorOpen ? ' open' : '') + '" id="pl-vgroup-' + esc(vendorName.replace(/\s/g,'_')) + '">' +
      '<div class="pl-vendor-collapse-top" onclick="toggleVendorGroup(\'' + esc(vendorName.replace(/\s/g,'_')) + '\')">' +
        '<span class="pl-vendor-collapse-name">' + esc(vendorName) + ' <span style="font-size:9px;color:var(--muted);font-weight:normal">' + vendorItemCount + ' items</span></span>' +
        '<span class="pl-vendor-collapse-gross">$' + fmt(vendorGross) + '</span>' +
        '<span class="pl-cost-chevron">\u203a</span>' +
      '</div>' +
      '<div class="pl-vendor-collapse-body">';

    group.items.forEach(function(item) {
      var invQty = item.qty || 1;
      var sale = scenario.itemSales && scenario.itemSales[item.id];
      var sellQty = (sale && sale.qty != null) ? sale.qty : (item.totalSold > 0 ? item.totalSold : invQty);
      var gross = sellQty * item.price;
      var dimmed = sellQty === 0;

      h += '<div class="pl-rev-spreadrow' + (dimmed ? ' pl-not-sold' : '') + '">' +
        '<span class="pl-rev-sr-item">' + esc(item.name || '(untitled)') + '</span>' +
        '<span class="pl-rev-sr-num">$' + fmt(item.price) + '</span>' +
        '<span class="pl-rev-sr-num" style="color:var(--muted)">inv ' + invQty + '</span>' +
        '<span class="pl-rev-sr-num" onclick="event.stopPropagation()">sell <input type="number" min="0" max="' + invQty + '" value="' + sellQty + '" class="pl-rev-sr-input" data-item-id="' + item.id + '" data-inv-qty="' + invQty + '" onchange="updateItemSellQty(this)"></span>' +
        '<span class="pl-rev-sr-num pl-rev-sr-cut' + (dimmed ? ' pl-cut-muted' : '') + '">$' + fmt(gross) + '</span>' +
      '</div>';
    });

    h += '</div></div>';
  });
  return h;
}

function renderOtherRevenueCards(scenario) {
  var h = '';
  (scenario.otherRevenue || []).forEach(function(r) {
    var isOpen = document.getElementById('pl-other-' + r.id) && document.getElementById('pl-other-' + r.id).classList.contains('open');
    h += '<div class="pl-cost-item' + (isOpen ? ' open' : '') + '" id="pl-other-' + r.id + '">' +
      '<div class="pl-cost-top" onclick="toggleOtherRevCard(\'' + r.id + '\')">' +
        '<span class="pl-other-rev-name">' + esc(r.name || '(untitled)') + '</span>' +
        '<div class="pl-cost-amt-inline" onclick="event.stopPropagation()">$<input type="number" min="0" class="pl-cost-amt-num" value="' + (r.amount || 0) + '" data-or-id="' + r.id + '" onchange="updateOtherRevItem(this)"></div>' +
        '<span class="pl-cost-chevron">\u203a</span>' +
      '</div>' +
      '<div class="pl-cost-body">' +
        '<div class="pl-cost-fields">' +
          '<div class="pl-cost-field"><div class="pl-cost-field-label">Name</div><input class="pl-cost-field-input" value="' + esc(r.name || '') + '" data-or-id="' + r.id + '" data-field="name" onchange="updateOtherRevField(this)"></div>' +
          '<div class="pl-cost-field"><div class="pl-cost-field-label">Amount ($)</div><input class="pl-cost-field-input" type="number" min="0" value="' + (r.amount || 0) + '" data-or-id="' + r.id + '" data-field="amount" onchange="updateOtherRevField(this)"></div>' +
          '<div class="pl-cost-field pl-cost-field-full"><div class="pl-cost-field-label">Notes</div><textarea class="pl-cost-field-textarea" placeholder="Details\u2026" data-or-id="' + r.id + '" data-field="note" onchange="updateOtherRevField(this)">' + esc(r.note || '') + '</textarea></div>' +
        '</div>' +
        '<button class="pl-cost-delete-btn" onclick="deleteOtherRevItem(\'' + r.id + '\')">Delete item</button>' +
      '</div>' +
    '</div>';
  });
  return h;
}

function renderCafeRevenueCards(scenario, arrayName) {
  var arrKey = arrayName || 'cafeRevenue';
  var prefix = arrKey === 'spaceRevenue' ? 'sr' : 'cr';
  var h = '';
  (scenario[arrKey] || []).forEach(function(r) {
    var elId = 'pl-' + prefix + '-' + r.id;
    var isOpen = document.getElementById(elId) && document.getElementById(elId).classList.contains('open');
    h += '<div class="pl-cost-item' + (isOpen ? ' open' : '') + '" id="' + elId + '">' +
      '<div class="pl-cost-top" onclick="var e=document.getElementById(\'' + elId + '\');if(e)e.classList.toggle(\'open\')">' +
        '<span class="pl-other-rev-name">' + esc(r.name || '(untitled)') + '</span>' +
        '<div class="pl-cost-amt-inline" onclick="event.stopPropagation()">$<input type="number" min="0" class="pl-cost-amt-num" value="' + (r.amount || 0) + '" data-arr="' + arrKey + '" data-rid="' + r.id + '" onchange="updateGenRevItem(this)"></div>' +
        '<span class="pl-cost-chevron">\u203a</span>' +
      '</div>' +
      '<div class="pl-cost-body">' +
        '<div class="pl-cost-fields">' +
          '<div class="pl-cost-field"><div class="pl-cost-field-label">Name</div><input class="pl-cost-field-input" value="' + esc(r.name || '') + '" data-arr="' + arrKey + '" data-rid="' + r.id + '" data-field="name" onchange="updateGenRevField(this)"></div>' +
          '<div class="pl-cost-field"><div class="pl-cost-field-label">Amount ($)</div><input class="pl-cost-field-input" type="number" min="0" value="' + (r.amount || 0) + '" data-arr="' + arrKey + '" data-rid="' + r.id + '" data-field="amount" onchange="updateGenRevField(this)"></div>' +
          '<div class="pl-cost-field pl-cost-field-full"><div class="pl-cost-field-label">Notes</div><textarea class="pl-cost-field-textarea" placeholder="Details\u2026" data-arr="' + arrKey + '" data-rid="' + r.id + '" data-field="note" onchange="updateGenRevField(this)">' + esc(r.note || '') + '</textarea></div>' +
        '</div>' +
        '<button class="pl-cost-delete-btn" onclick="deleteGenRevItem(\'' + arrKey + '\',\'' + r.id + '\')">Delete item</button>' +
      '</div>' +
    '</div>';
  });
  return h;
}

// Generic revenue item actions (works for cafeRevenue, spaceRevenue, etc)
function updateGenRevItem(input) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  var arr = scenario[input.dataset.arr] || [];
  var item = arr.find(function(r) { return r.id === input.dataset.rid; });
  if (item) { item.amount = parseFloat(input.value) || 0; savePLData(data); }
}
function updateGenRevField(input) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  var arr = scenario[input.dataset.arr] || [];
  var item = arr.find(function(r) { return r.id === input.dataset.rid; });
  if (item) {
    var field = input.dataset.field;
    var numFields = ['amount', 'price', 'costPerDrink', 'sold'];
    item[field] = numFields.indexOf(field) >= 0 ? (parseFloat(input.value) || 0) : input.value;
    savePLData(data);
    if (numFields.indexOf(field) >= 0) renderPL();
  }
}
function deleteGenRevItem(arrKey, id) {
  if (!confirm('Delete this item?')) return;
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  scenario[arrKey] = (scenario[arrKey] || []).filter(function(r) { return r.id !== id; });
  savePLData(data);
  renderPL();
}
function addSpaceRevItem() {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  if (!scenario.spaceRevenue) scenario.spaceRevenue = [];
  scenario.spaceRevenue.push({ id: 'sr_' + Date.now(), name: '', amount: 0, note: '' });
  savePLData(data);
  renderPL();
}

// ── Cafe Variable Cost actions ──

function toggleCafeVarCard(id) {
  var card = document.getElementById('pl-cafe-var-' + id);
  if (card) card.classList.toggle('open');
}

function updateCafeVar(input) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  var item = (scenario.cafeVariable || []).find(function(r) { return r.id === input.dataset.cvId; });
  if (item) {
    item.amount = parseFloat(input.value) || 0;
    savePLData(data);
    renderPL();
  }
}

function updateCafeVarField(input) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  var item = (scenario.cafeVariable || []).find(function(r) { return r.id === input.dataset.cvId; });
  if (item) {
    var field = input.dataset.field;
    item[field] = field === 'amount' ? (parseFloat(input.value) || 0) : input.value;
    savePLData(data);
  }
}

function addCafeSubItem(cvId) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  var cv = (scenario.cafeVariable || []).find(function(c) { return c.id === cvId; });
  if (!cv) return;
  if (!cv.subItems) cv.subItems = [];
  cv.subItems.push({ name: '', amount: 0 });
  // Recalc total
  var total = 0;
  cv.subItems.forEach(function(s) { total += (s.amount || 0); });
  cv.amount = total;
  savePLData(data);
  renderPL();
  setTimeout(function() { var card = document.getElementById('pl-cafe-var-' + cvId); if (card) card.classList.add('open'); }, 50);
}

function updateCafeSubItem(cvId, si, field, val) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  var cv = (scenario.cafeVariable || []).find(function(c) { return c.id === cvId; });
  if (!cv || !cv.subItems || !cv.subItems[si]) return;
  cv.subItems[si][field] = val;
  // Recalc total
  var total = 0;
  cv.subItems.forEach(function(s) { total += (s.amount || 0); });
  cv.amount = total;
  savePLData(data);
}

function deleteCafeSubItem(cvId, si) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  var cv = (scenario.cafeVariable || []).find(function(c) { return c.id === cvId; });
  if (!cv || !cv.subItems) return;
  cv.subItems.splice(si, 1);
  var total = 0;
  cv.subItems.forEach(function(s) { total += (s.amount || 0); });
  cv.amount = total;
  savePLData(data);
  renderPL();
  setTimeout(function() { var card = document.getElementById('pl-cafe-var-' + cvId); if (card) card.classList.add('open'); }, 50);
}

function addCafeVar() {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  if (!scenario.cafeVariable) scenario.cafeVariable = [];
  var newId = 'cv_' + Date.now();
  scenario.cafeVariable.push({ id: newId, name: '', amount: 0, note: '' });
  savePLData(data);
  renderPL();
  setTimeout(function() {
    var card = document.getElementById('pl-cafe-var-' + newId);
    if (card) card.classList.add('open');
  }, 50);
}

function deleteCafeVar(id) {
  if (!confirm('Delete this ingredient?')) return;
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  scenario.cafeVariable = (scenario.cafeVariable || []).filter(function(r) { return r.id !== id; });
  savePLData(data);
  renderPL();
}

// ── Cafe Revenue actions ──

function toggleCafeRevCard(id) {
  var card = document.getElementById('pl-cafe-rev-' + id);
  if (card) card.classList.toggle('open');
}

function updateCafeRevItem(input) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  var item = (scenario.cafeRevenue || []).find(function(r) { return r.id === input.dataset.crId; });
  if (item) {
    item.amount = parseFloat(input.value) || 0;
    savePLData(data);
    var calc = calcPL(scenario, inventoryToPLItems());
    renderPLSummary(calc, scenario);
  }
}

function updateCafeRevField(input) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  var item = (scenario.cafeRevenue || []).find(function(r) { return r.id === input.dataset.crId; });
  if (item) {
    var field = input.dataset.field;
    item[field] = field === 'amount' ? (parseFloat(input.value) || 0) : input.value;
    savePLData(data);
    if (field === 'amount') {
      var calc = calcPL(scenario, inventoryToPLItems());
      renderPLSummary(calc, scenario);
    }
  }
}

function addCafeRevItem() {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  if (!scenario.cafeRevenue) scenario.cafeRevenue = [];
  var newId = 'cr_' + Date.now();
  scenario.cafeRevenue.push({ id: newId, name: '', amount: 0, note: '' });
  savePLData(data);
  renderPL();
  setTimeout(function() {
    var card = document.getElementById('pl-cafe-rev-' + newId);
    if (card) card.classList.add('open');
  }, 50);
}

function deleteCafeRevItem(id) {
  if (!confirm('Delete this drink?')) return;
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  scenario.cafeRevenue = (scenario.cafeRevenue || []).filter(function(r) { return r.id !== id; });
  savePLData(data);
  renderPL();
}

function addCafeDrink() {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  if (!scenario.cafeRevenue) scenario.cafeRevenue = [];
  var newId = 'cr_' + Date.now();
  scenario.cafeRevenue.push({ id: newId, name: '', price: 0, costPerDrink: 0, sold: 0, note: '' });
  savePLData(data);
  renderPL();
  setTimeout(function() {
    var card = document.getElementById('pl-cafe-drink-' + newId);
    if (card) card.classList.add('open');
  }, 50);
}

function cafeSellDrink(id) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  (scenario.cafeRevenue || []).forEach(function(cr) {
    if (cr.id === id) cr.sold = (cr.sold || 0) + 1;
  });
  savePLData(data);
  renderPL();
}

function cafeUndoDrink(id) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  (scenario.cafeRevenue || []).forEach(function(cr) {
    if (cr.id === id && (cr.sold || 0) > 0) cr.sold = cr.sold - 1;
  });
  savePLData(data);
  renderPL();
}

function renderPLCalculators(scenario) {
  var el = document.getElementById('pl-calculators');
  if (!el) return;

  el.innerHTML =
    '<div class="pl-calc-row">' +
      '<div class="pl-summary-card pl-breakeven pl-be-calc">' +
        '<div class="pl-summary-label">Break-even Calculator</div>' +
        '<div class="pl-be-inputs">' +
          '<div class="pl-be-row"><span class="pl-be-lbl">Merch / Events (100%)</span><input type="number" min="0" max="100" class="pl-be-input" id="pl-be-owned" value="' + (scenario.beMerchPct || 20) + '" onchange="updateBECalc(this)">%</div>' +
          '<div class="pl-be-row"><span class="pl-be-lbl">Consignment</span><input type="number" min="0" max="100" class="pl-be-input" id="pl-be-consign" value="' + (scenario.beConsignPct || 80) + '" onchange="updateBECalc(this)">% <span class="pl-be-at">@ <input type="number" min="0" max="100" class="pl-be-input" id="pl-be-consign-rate" value="' + (scenario.beConsignRate || 30) + '" onchange="updateBECalc(this)">%</span></div>' +
        '</div>' +
        '<div class="pl-be-result" id="pl-be-result"></div>' +
      '</div>' +
      '<div class="pl-summary-card pl-breakeven pl-be-calc">' +
        '<div class="pl-summary-label">P/L Calculator</div>' +
        '<div class="pl-be-inputs">' +
          '<div class="pl-be-row"><span class="pl-be-lbl">Consignment /wk</span>$<input type="number" min="0" class="pl-be-input pl-be-input-wide" id="pl-calc-consign-wk" value="' + (scenario.calcConsignWk || 0) + '" onchange="updatePLCalc()"></div>' +
          '<div class="pl-be-row"><span class="pl-be-lbl">Merch /wk</span>$<input type="number" min="0" class="pl-be-input pl-be-input-wide" id="pl-calc-merch-wk" value="' + (scenario.calcMerchWk || 0) + '" onchange="updatePLCalc()"></div>' +
          '<div class="pl-be-row"><span class="pl-be-lbl">Weeks</span><input type="number" min="1" class="pl-be-input" id="pl-calc-weeks" value="' + (scenario.calcWeeks || 4) + '" onchange="updatePLCalc()"></div>' +
          '<div class="pl-target-divider"></div>' +
          '<div class="pl-be-row"><span class="pl-be-lbl">Total consignment</span><span class="pl-be-computed" id="pl-calc-consign-total">$0</span></div>' +
          '<div class="pl-be-row"><span class="pl-be-lbl">Total merch</span><span class="pl-be-computed" id="pl-calc-merch-total">$0</span></div>' +
        '</div>' +
        '<div class="pl-calc-result" id="pl-calc-result"></div>' +
      '</div>' +
      '<div class="pl-summary-card pl-breakeven pl-be-calc">' +
        '<div class="pl-summary-label">Profit Target</div>' +
        '<div class="pl-be-inputs">' +
          '<div class="pl-be-row"><span class="pl-be-lbl">Target profit</span>$<input type="number" min="0" class="pl-be-input pl-be-input-wide" id="pl-target-profit" value="' + (scenario.targetProfit || 0) + '"></div>' +
          '<div class="pl-target-divider"></div>' +
          '<div class="pl-be-row"><span class="pl-be-lbl">Consignment rate</span><input type="number" min="0" max="100" class="pl-be-input" id="pl-target-comm" value="' + (scenario.targetComm || 30) + '">%</div>' +
          '<div class="pl-be-row"><span class="pl-be-lbl">Merch/Other rate</span><input type="number" min="0" max="100" class="pl-be-input" id="pl-target-merch-rate" value="' + (scenario.targetMerchRate || 100) + '">%</div>' +
          '<div class="pl-target-divider"></div>' +
          '<div class="pl-be-row"><span class="pl-be-lbl">Predicted consignment $</span>$<input type="number" min="0" class="pl-be-input pl-be-input-wide" id="pl-target-known-consign" value="' + (scenario.targetPredConsign || '') + '" placeholder="—"></div>' +
          '<div class="pl-be-row"><span class="pl-be-lbl">Predicted merch $</span>$<input type="number" min="0" class="pl-be-input pl-be-input-wide" id="pl-target-known-merch" value="' + (scenario.targetPredMerch || '') + '" placeholder="—"></div>' +
        '</div>' +
        '<button class="pl-target-run-btn" onclick="runProfitTarget()">Run →</button>' +
        '<div class="pl-calc-result" id="pl-target-result"></div>' +
      '</div>' +
    '</div>';
}

function renderRevenueSection(data, scenario, calc, liveInventory) {
  var el = document.getElementById('pl-revenue');
  if (!el) return;

  var items = (liveInventory || []).filter(function(i) { return !i.isShippingDeduction; });

  // Group inventory by vendor
  var vendorMap = {};
  var vendorOrder = [];
  items.forEach(function(item) {
    var key = item.vendor || 'Other';
    if (!vendorMap[key]) { vendorMap[key] = { items: [], isInHouse: item.isInHouse, commissionPct: item.commissionPct, pricingModel: item.pricingModel }; vendorOrder.push(key); }
    vendorMap[key].items.push(item);
  });

  // Sort items within each vendor by price descending
  vendorOrder.forEach(function(key) {
    vendorMap[key].items.sort(function(a, b) { return (b.price || 0) - (a.price || 0); });
  });

  var html = '<div class="pl-section-header"><span class="pl-section-title">Revenue <span style="font-size:9px;color:var(--muted);font-weight:normal;letter-spacing:0.1em;margin-left:6px">FROM INVENTORY</span></span><span class="pl-section-total">$' + fmt(calc.ourCut) + '</span></div>';

  if (!items.length) {
    html += '<div style="padding:20px;color:var(--muted);font-style:italic;font-family:Cormorant Garamond,serif;font-size:14px">No inventory items yet. Add items in the <a href="#" onclick="showTab(\'front\',\'popup-inventory-new\',document.querySelector(\'[data-tab=popup-inventory-new]\'));return false" style="color:var(--front)">Inventory tab</a> and they\'ll appear here automatically.</div>';
    el.innerHTML = html;
    return;
  }

  // Split vendors into consignment vs wholesale
  var consignmentVendors = [];
  var wholesaleVendors = [];
  vendorOrder.forEach(function(vendorName) {
    var group = vendorMap[vendorName];
    if (group.isInHouse) wholesaleVendors.push(vendorName);
    else consignmentVendors.push(vendorName);
  });

  function renderConsignmentGroup(vendorList) {
    if (!vendorList.length) return '';
    var groupGross = 0;
    var groupOurCut = 0;
    vendorList.forEach(function(vn) {
      var group = vendorMap[vn];
      group.items.forEach(function(item) {
        var sale = scenario.itemSales && scenario.itemSales[item.id];
        var sellQty = (sale && sale.qty != null) ? sale.qty : (item.qty || 1);
        var gross = sellQty * item.price;
        groupGross += gross;
        groupOurCut += gross * (item.commissionPct / 100);
      });
    });

    var h = '<div class="pl-cost-cat">' +
      '<span class="pl-cost-cat-name">Consignment</span>' +
      '<span class="pl-consign-header-nums"><span class="pl-consign-gross">$' + fmt(groupGross) + ' gross</span><span class="pl-consign-cut">$' + fmt(groupOurCut) + ' ours</span></span>' +
    '</div>';

    vendorList.forEach(function(vendorName) {
      var group = vendorMap[vendorName];
      var vendorRate = group.commissionPct || 30;
      var vendorGross = 0, vendorCut = 0, vendorItemCount = 0, vendorMerchValue = 0;
      group.items.forEach(function(item) {
        var sale = scenario.itemSales && scenario.itemSales[item.id];
        var sellQty = (sale && sale.qty != null) ? sale.qty : (item.qty || 1);
        vendorMerchValue += item.price * (item.qty || 1);
        vendorGross += sellQty * item.price;
        vendorCut += sellQty * item.price * (item.commissionPct / 100);
        vendorItemCount++;
      });
      var isVendorOpen = document.getElementById('pl-vgroup-' + vendorName.replace(/\s/g,'_')) &&
        document.getElementById('pl-vgroup-' + vendorName.replace(/\s/g,'_')).classList.contains('open');

      h += '<div class="pl-vendor-collapse' + (isVendorOpen ? ' open' : '') + '" id="pl-vgroup-' + esc(vendorName.replace(/\s/g,'_')) + '">' +
        '<div class="pl-vendor-collapse-top" onclick="toggleVendorGroup(\'' + esc(vendorName.replace(/\s/g,'_')) + '\')">' +
          '<span class="pl-vendor-collapse-name">' + esc(vendorName) + ' <span style="font-size:9px;color:var(--muted);font-weight:normal">' + vendorRate + '% · ' + vendorItemCount + ' items</span></span>' +
          '<span class="pl-vendor-collapse-gross">$' + fmt(vendorGross) + '</span>' +
          '<span class="pl-vendor-collapse-cut">$' + fmt(vendorCut) + '</span>' +
          '<span class="pl-cost-chevron">›</span>' +
        '</div>' +
        '<div class="pl-vendor-collapse-body">';

      group.items.forEach(function(item) {
        var invQty = item.qty || 1;
        var sale = scenario.itemSales && scenario.itemSales[item.id];
        var sellQty = (sale && sale.qty != null) ? sale.qty : invQty;
        var gross = sellQty * item.price;
        var cut = gross * (item.commissionPct / 100);
        var dimmed = sellQty === 0;

        h += '<div class="pl-rev-spreadrow' + (dimmed ? ' pl-not-sold' : '') + '">' +
          '<span class="pl-rev-sr-item">' + esc(item.name || '(untitled)') + '</span>' +
          '<span class="pl-rev-sr-num">$' + fmt(item.price) + '</span>' +
          '<span class="pl-rev-sr-num" style="color:var(--muted)">inv ' + invQty + '</span>' +
          '<span class="pl-rev-sr-num" onclick="event.stopPropagation()">sell <input type="number" min="0" max="' + invQty + '" value="' + sellQty + '" class="pl-rev-sr-input" data-item-id="' + item.id + '" data-inv-qty="' + invQty + '" onchange="updateItemSellQty(this)"></span>' +
          '<span class="pl-rev-sr-num">' + item.commissionPct + '%</span>' +
          '<span class="pl-rev-sr-num pl-rev-sr-cut' + (dimmed ? ' pl-cut-muted' : '') + '">$' + fmt(cut) + '</span>' +
        '</div>';
      });

      h += '<div style="padding:4px 8px;font-size:9px;color:var(--muted);font-family:DM Mono,monospace;display:flex;justify-content:space-between">' +
        '<span>Value: $' + fmt(vendorMerchValue) + '</span>' +
        '<span>Max take-home: $' + fmt(Math.round(vendorMerchValue * vendorRate / 100)) + '</span>' +
      '</div>';
      h += '</div></div>';
    });
    return h;
  }

  function renderWholesaleGroup(vendorList) {
    if (!vendorList.length) return '';
    var groupGross = 0, groupProfit = 0;
    vendorList.forEach(function(vn) {
      vendorMap[vn].items.forEach(function(item) {
        var sale = scenario.itemSales && scenario.itemSales[item.id];
        var sellQty = (sale && sale.qty != null) ? sale.qty : (item.qty || 1);
        var gross = sellQty * item.price;
        var profit = item.costPerUnit ? gross - (sellQty * item.costPerUnit) : gross;
        groupGross += gross;
        groupProfit += profit;
      });
    });

    var h = '<div class="pl-cost-cat">' +
      '<span class="pl-cost-cat-name">Wholesale</span>' +
      '<span class="pl-consign-header-nums"><span class="pl-consign-gross">$' + fmt(groupGross) + ' revenue</span><span class="pl-consign-cut">$' + fmt(groupProfit) + ' profit</span></span>' +
    '</div>';

    vendorList.forEach(function(vendorName) {
      var group = vendorMap[vendorName];
      var vendorGross = 0, vendorProfit = 0, vendorItemCount = 0;
      group.items.forEach(function(item) {
        var sale = scenario.itemSales && scenario.itemSales[item.id];
        var sellQty = (sale && sale.qty != null) ? sale.qty : (item.qty || 1);
        var gross = sellQty * item.price;
        var profit = item.costPerUnit ? gross - (sellQty * item.costPerUnit) : gross;
        vendorGross += gross;
        vendorProfit += profit;
        vendorItemCount++;
      });
      var isVendorOpen = document.getElementById('pl-vgroup-' + vendorName.replace(/\s/g,'_')) &&
        document.getElementById('pl-vgroup-' + vendorName.replace(/\s/g,'_')).classList.contains('open');

      h += '<div class="pl-vendor-collapse' + (isVendorOpen ? ' open' : '') + '" id="pl-vgroup-' + esc(vendorName.replace(/\s/g,'_')) + '">' +
        '<div class="pl-vendor-collapse-top" onclick="toggleVendorGroup(\'' + esc(vendorName.replace(/\s/g,'_')) + '\')">' +
          '<span class="pl-vendor-collapse-name">' + esc(vendorName) + ' <span style="font-size:9px;color:var(--muted);font-weight:normal">' + vendorItemCount + ' items</span></span>' +
          '<span class="pl-vendor-collapse-gross">$' + fmt(vendorGross) + '</span>' +
          '<span class="pl-vendor-collapse-cut">$' + fmt(vendorProfit) + '</span>' +
          '<span class="pl-cost-chevron">›</span>' +
        '</div>' +
        '<div class="pl-vendor-collapse-body">';

      group.items.forEach(function(item) {
        var invQty = item.qty || 1;
        var sale = scenario.itemSales && scenario.itemSales[item.id];
        var sellQty = (sale && sale.qty != null) ? sale.qty : invQty;
        var gross = sellQty * item.price;
        var profit = item.costPerUnit ? gross - (sellQty * item.costPerUnit) : gross;
        var dimmed = sellQty === 0;

        h += '<div class="pl-rev-spreadrow' + (dimmed ? ' pl-not-sold' : '') + '">' +
          '<span class="pl-rev-sr-item">' + esc(item.name || '(untitled)') + '</span>' +
          '<span class="pl-rev-sr-num">$' + fmt(item.price) + '</span>' +
          '<span class="pl-rev-sr-num" style="color:var(--muted)">inv ' + invQty + '</span>' +
          '<span class="pl-rev-sr-num" onclick="event.stopPropagation()">sell <input type="number" min="0" max="' + invQty + '" value="' + sellQty + '" class="pl-rev-sr-input" data-item-id="' + item.id + '" data-inv-qty="' + invQty + '" onchange="updateItemSellQty(this)"></span>' +
          '<span class="pl-rev-sr-num">cost $' + fmt(item.costPerUnit || 0) + '</span>' +
          '<span class="pl-rev-sr-num pl-rev-sr-cut' + (dimmed ? ' pl-cut-muted' : '') + '">$' + fmt(profit) + '</span>' +
        '</div>';
      });

      h += '</div></div>';
    });
    return h;
  }

  html += renderConsignmentGroup(consignmentVendors);
  html += renderWholesaleGroup(wholesaleVendors);

  // Other revenue
  if (!scenario.otherRevenue) scenario.otherRevenue = [
    { id: 'or_events', name: 'Event revenue', amount: scenario.eventRevenue || 0, note: scenario.eventNote || 'TBA' },
    { id: 'or_merch', name: 'Merch / branded goods', amount: scenario.merchRevenue || 0, note: '' }
  ];
  var otherTotal = 0;
  scenario.otherRevenue.forEach(function(r) { otherTotal += (r.amount || 0); });

  html += '<div class="pl-cost-cat"><span class="pl-cost-cat-name">Other Revenue</span><span class="pl-cost-cat-total">$' + fmt(otherTotal) + '</span></div>';

  scenario.otherRevenue.forEach(function(r) {
    var isOpen = document.getElementById('pl-other-' + r.id) && document.getElementById('pl-other-' + r.id).classList.contains('open');
    html += '<div class="pl-cost-item' + (isOpen ? ' open' : '') + '" id="pl-other-' + r.id + '">' +
      '<div class="pl-cost-top" onclick="toggleOtherRevCard(\'' + r.id + '\')">' +
        '<span class="pl-other-rev-name">' + esc(r.name || '(untitled)') + '</span>' +
        '<div class="pl-cost-amt-inline" onclick="event.stopPropagation()">$<input type="number" min="0" class="pl-cost-amt-num" value="' + (r.amount || 0) + '" data-or-id="' + r.id + '" onchange="updateOtherRevItem(this)"></div>' +
        '<span class="pl-cost-chevron">›</span>' +
      '</div>' +
      '<div class="pl-cost-body">' +
        '<div class="pl-cost-fields">' +
          '<div class="pl-cost-field"><div class="pl-cost-field-label">Name</div><input class="pl-cost-field-input" value="' + esc(r.name || '') + '" data-or-id="' + r.id + '" data-field="name" onchange="updateOtherRevField(this)"></div>' +
          '<div class="pl-cost-field"><div class="pl-cost-field-label">Amount ($)</div><input class="pl-cost-field-input" type="number" min="0" value="' + (r.amount || 0) + '" data-or-id="' + r.id + '" data-field="amount" onchange="updateOtherRevField(this)"></div>' +
          '<div class="pl-cost-field pl-cost-field-full"><div class="pl-cost-field-label">Notes</div><textarea class="pl-cost-field-textarea" placeholder="Details…" data-or-id="' + r.id + '" data-field="note" onchange="updateOtherRevField(this)">' + esc(r.note || '') + '</textarea></div>' +
        '</div>' +
        '<button class="pl-cost-delete-btn" onclick="deleteOtherRevItem(\'' + r.id + '\')">Delete item</button>' +
      '</div>' +
    '</div>';
  });

  html += '<button class="pl-add-row-btn" onclick="addOtherRevItem()">+ Add other revenue</button>';

  el.innerHTML = html;
}

function toggleOtherRevCard(id) {
  var card = document.getElementById('pl-other-' + id);
  if (card) card.classList.toggle('open');
}

function updateOtherRevItem(input) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  var item = (scenario.otherRevenue || []).find(function(r) { return r.id === input.dataset.orId; });
  if (item) {
    item.amount = parseFloat(input.value) || 0;
    savePLData(data);
    // Update total without full re-render
    var total = 0;
    scenario.otherRevenue.forEach(function(r) { total += (r.amount || 0); });
    var calc = calcPL(scenario, inventoryToPLItems());
    renderPLSummary(calc, scenario);
  }
}

function updateOtherRevField(input) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  var item = (scenario.otherRevenue || []).find(function(r) { return r.id === input.dataset.orId; });
  if (item) {
    var field = input.dataset.field;
    item[field] = field === 'amount' ? (parseFloat(input.value) || 0) : input.value;
    savePLData(data);
    if (field === 'amount') {
      var calc = calcPL(scenario, inventoryToPLItems());
      renderPLSummary(calc, scenario);
    }
  }
}

function addOtherRevItem() {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  if (!scenario.otherRevenue) scenario.otherRevenue = [];
  var newId = 'or_' + Date.now();
  scenario.otherRevenue.push({ id: newId, name: '', amount: 0, note: '' });
  savePLData(data);
  renderPL();
  setTimeout(function() {
    var card = document.getElementById('pl-other-' + newId);
    if (card) card.classList.add('open');
  }, 50);
}

function deleteOtherRevItem(id) {
  if (!confirm('Delete this revenue item?')) return;
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  scenario.otherRevenue = (scenario.otherRevenue || []).filter(function(r) { return r.id !== id; });
  savePLData(data);
  renderPL();
}

function updateBECalc() {
  var ownedPct = parseInt(document.getElementById('pl-be-owned').value) || 0;
  var consignPct = parseInt(document.getElementById('pl-be-consign').value) || 0;
  var consignRate = parseInt(document.getElementById('pl-be-consign-rate').value) || 30;

  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  scenario.beMerchPct = ownedPct;
  scenario.beConsignPct = consignPct;
  scenario.beConsignRate = consignRate;
  savePLData(data);

  var blended = (ownedPct * 1.0 + consignPct * (consignRate / 100)) / 100;
  // Use TOTAL costs (fixed + variable) from actual calc
  var calc = calcPL(scenario, inventoryToPLItems());
  var totalCosts = calc.totalFixed + calc.totalVariable;

  var beGross = blended > 0 ? Math.ceil(totalCosts / blended) : 0;
  var merchGross = Math.ceil(beGross * (ownedPct / 100));
  var consignGross = beGross - merchGross;
  var merchTakeHome = merchGross; // 100%
  var consignTakeHome = Math.round(consignGross * (consignRate / 100));

  var el = document.getElementById('pl-be-result');
  if (el) {
    el.innerHTML =
      '<div class="pl-calc-breakdown" style="margin-top:6px">' +
        '<div class="pl-calc-line"><span>Costs to cover</span><span></span><span>$' + fmt(totalCosts) + '</span></div>' +
        '<div class="pl-calc-line pl-calc-total"><span>Gross sales needed</span><span></span><span>$' + fmt(beGross) + '</span></div>' +
        '<div class="pl-calc-line"><span>Merch (' + ownedPct + '% @ 100%)</span><span>$' + fmt(merchGross) + ' gross</span><span>$' + fmt(merchTakeHome) + ' ours</span></div>' +
        '<div class="pl-calc-line"><span>Consignment (' + consignPct + '% @ ' + consignRate + '%)</span><span>$' + fmt(consignGross) + ' gross</span><span>$' + fmt(consignTakeHome) + ' ours</span></div>' +
      '</div>';
  }
}

function updatePLCalc() {
  var consignWk = parseFloat(document.getElementById('pl-calc-consign-wk').value) || 0;
  var merchWk = parseFloat(document.getElementById('pl-calc-merch-wk').value) || 0;
  var weeks = parseInt(document.getElementById('pl-calc-weeks').value) || 4;

  var consignSales = consignWk * weeks;
  var merchSales = merchWk * weeks;

  // Update computed totals
  var ctEl = document.getElementById('pl-calc-consign-total');
  var mtEl = document.getElementById('pl-calc-merch-total');
  if (ctEl) ctEl.textContent = '$' + fmt(consignSales);
  if (mtEl) mtEl.textContent = '$' + fmt(merchSales);

  // Save to scenario
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  scenario.calcConsignWk = consignWk;
  scenario.calcMerchWk = merchWk;
  scenario.calcWeeks = weeks;
  savePLData(data);

  // Calculate
  var consignRate = scenario.beConsignRate || 30;
  var consignReturn = consignSales * (consignRate / 100);
  var merchReturn = merchSales; // 100%
  var totalGross = consignSales + merchSales;
  var totalReturn = consignReturn + merchReturn;

  var consignPct = totalGross > 0 ? Math.round((consignSales / totalGross) * 100) : 0;
  var merchPct = totalGross > 0 ? Math.round((merchSales / totalGross) * 100) : 0;

  var calc = calcPL(scenario, inventoryToPLItems());
  var totalCosts = calc.totalFixed + calc.totalVariable;
  var netPL = totalReturn - totalCosts;
  var plClass = netPL >= 0 ? 'pl-positive' : 'pl-negative';

  var el = document.getElementById('pl-calc-result');
  if (el) {
    el.innerHTML =
      '<div class="pl-calc-sheet">' +
        '<div class="pl-calc-sheet-header">' +
          '<span class="pl-cs-label"></span>' +
          '<span class="pl-cs-hdr">Gross</span>' +
          '<span class="pl-cs-hdr">% of total sales</span>' +
          '<span class="pl-cs-hdr">Our Cut</span>' +
        '</div>' +
        '<div class="pl-calc-sheet-row">' +
          '<span class="pl-cs-label">Consignment</span>' +
          '<span class="pl-cs-gross">$' + fmt(consignSales) + '</span>' +
          '<span class="pl-cs-pct">' + consignPct + '%</span>' +
          '<span class="pl-cs-ours">$' + fmt(consignReturn) + '</span>' +
        '</div>' +
        '<div class="pl-calc-sheet-row">' +
          '<span class="pl-cs-label">Merch</span>' +
          '<span class="pl-cs-gross">$' + fmt(merchSales) + '</span>' +
          '<span class="pl-cs-pct">' + merchPct + '%</span>' +
          '<span class="pl-cs-ours">$' + fmt(merchReturn) + '</span>' +
        '</div>' +
        '<div class="pl-calc-sheet-divider"></div>' +
        '<div class="pl-calc-sheet-row">' +
          '<span class="pl-cs-label">Cost</span>' +
          '<span class="pl-cs-gross"></span>' +
          '<span class="pl-cs-pct"></span>' +
          '<span class="pl-cs-ours pl-cs-cost-val">-$' + fmt(totalCosts) + '</span>' +
        '</div>' +
        '<div class="pl-calc-sheet-row">' +
          '<span class="pl-cs-label">Total</span>' +
          '<span class="pl-cs-gross"></span>' +
          '<span class="pl-cs-pct"></span>' +
          '<span class="pl-cs-ours pl-cs-total-val ' + plClass + '">$' + fmt(Math.abs(netPL)) + '</span>' +
        '</div>' +
      '</div>';
  }
}

function runProfitTarget() {
  var targetProfit = parseFloat(document.getElementById('pl-target-profit').value) || 0;
  var commRate = parseFloat(document.getElementById('pl-target-comm').value) || 30;
  var merchRate = parseFloat(document.getElementById('pl-target-merch-rate').value) || 100;
  var knownConsign = document.getElementById('pl-target-known-consign').value;
  var knownMerch = document.getElementById('pl-target-known-merch').value;
  var hasKnownConsign = knownConsign !== '' && knownConsign !== undefined;
  var hasKnownMerch = knownMerch !== '' && knownMerch !== undefined;
  knownConsign = parseFloat(knownConsign) || 0;
  knownMerch = parseFloat(knownMerch) || 0;

  // Save to scenario
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  scenario.targetProfit = targetProfit;
  scenario.targetComm = commRate;
  scenario.targetMerchRate = merchRate;
  scenario.targetPredConsign = hasKnownConsign ? knownConsign : '';
  scenario.targetPredMerch = hasKnownMerch ? knownMerch : '';
  savePLData(data);

  var calc = calcPL(scenario, inventoryToPLItems());
  var totalCosts = calc.totalFixed + calc.totalVariable;
  var needed = totalCosts + targetProfit;

  var consignGross, merchGross, consignReturn, merchReturn;

  if (hasKnownConsign && hasKnownMerch) {
    // Both known — just calculate returns
    consignGross = knownConsign;
    merchGross = knownMerch;
    consignReturn = Math.round(consignGross * (commRate / 100));
    merchReturn = Math.round(merchGross * (merchRate / 100));
  } else if (hasKnownMerch && !hasKnownConsign) {
    // Merch known — how much consignment do we need?
    merchGross = knownMerch;
    merchReturn = Math.round(merchGross * (merchRate / 100));
    var consignNeeded = needed - merchReturn; // our cut still needed from consignment
    consignReturn = Math.max(0, consignNeeded);
    consignGross = commRate > 0 ? Math.ceil(consignReturn / (commRate / 100)) : 0;
  } else if (hasKnownConsign && !hasKnownMerch) {
    // Consignment known — how much merch do we need?
    consignGross = knownConsign;
    consignReturn = Math.round(consignGross * (commRate / 100));
    var merchNeeded = needed - consignReturn;
    merchReturn = Math.max(0, merchNeeded);
    merchGross = merchRate > 0 ? Math.ceil(merchReturn / (merchRate / 100)) : 0;
  } else {
    // Neither known — use equal split
    var blended = 0.5 * (commRate / 100) + 0.5 * (merchRate / 100);
    var totalGross = blended > 0 ? Math.ceil(needed / blended) : 0;
    consignGross = Math.ceil(totalGross * 0.5);
    merchGross = totalGross - consignGross;
    consignReturn = Math.round(consignGross * (commRate / 100));
    merchReturn = Math.round(merchGross * (merchRate / 100));
  }

  var totalGrossNeeded = consignGross + merchGross;
  var totalReturn = consignReturn + merchReturn;
  var consignPct = totalGrossNeeded > 0 ? Math.round((consignGross / totalGrossNeeded) * 100) : 0;
  var merchPct = totalGrossNeeded > 0 ? 100 - consignPct : 0;
  var actualPL = totalReturn - totalCosts;
  var plClass = actualPL >= targetProfit ? 'pl-positive' : 'pl-negative';

  var el = document.getElementById('pl-target-result');
  if (el) {
    el.innerHTML =
      '<div class="pl-calc-breakdown">' +
        '<div class="pl-calc-line"><span>Costs to cover</span><span></span><span>$' + fmt(totalCosts) + '</span></div>' +
        '<div class="pl-calc-line"><span>+ Target profit</span><span></span><span>$' + fmt(targetProfit) + '</span></div>' +
        '<div class="pl-calc-line pl-calc-total"><span>Need (our cut)</span><span></span><span>$' + fmt(needed) + '</span></div>' +
        '<div class="pl-calc-line" style="margin-top:8px"><span>Consignment @ ' + commRate + '%</span><span>' + consignPct + '% · $' + fmt(consignGross) + ' gross</span><span>$' + fmt(consignReturn) + ' ours</span></div>' +
        '<div class="pl-calc-line"><span>Merch/Other @ ' + merchRate + '%</span><span>' + merchPct + '% · $' + fmt(merchGross) + ' gross</span><span>$' + fmt(merchReturn) + ' ours</span></div>' +
        '<div class="pl-calc-line pl-calc-total"><span>Total sales</span><span>$' + fmt(totalGrossNeeded) + '</span><span>$' + fmt(totalReturn) + ' ours</span></div>' +
      '</div>' +
      '<div class="pl-calc-net ' + plClass + '">' + (actualPL >= 0 ? '+' : '-') + '$' + fmt(Math.abs(actualPL)) + ' profit</div>';
  }
}

// Run calcs after render
function initBECalc() {
  setTimeout(function() { updateBECalc(); updatePLCalc(); }, 50);
}

function toggleVendorGroup(id) {
  var el = document.getElementById('pl-vgroup-' + id);
  if (el) el.classList.toggle('open');
}

function toggleRevCard(id) {
  var card = document.getElementById('pl-rev-' + id);
  if (card) card.classList.toggle('open');
}

function toggleMerchCard(id) {
  var card = document.getElementById('pl-merch-' + id);
  if (card) card.classList.toggle('open');
}

function addMerchItem() {
  var data = getPLData();
  var newId = 'inv_merch_' + Date.now();
  data.inventory.push({
    id: newId,
    name: '',
    vendor: 'In-House',
    vendorId: 3,
    price: 0,
    category: '',
    isInHouse: true,
    commissionPct: 100,
    weeks: [0,0,0,0],
    qty: 1,
    notes: ''
  });
  savePLData(data);
  renderPL();
  // Auto-open the new card
  setTimeout(function() {
    var card = document.getElementById('pl-merch-' + newId);
    if (card) card.classList.add('open');
  }, 50);
}

function deleteMerchItem(id) {
  if (!confirm('Delete this merch item?')) return;
  var data = getPLData();
  data.inventory = data.inventory.filter(function(i) { return i.id !== id; });
  savePLData(data);
  renderPL();
}

function goToInventoryItem(vendorName) {
  // Switch to inventory tab and scroll to vendor
  showTab('front', 'popup-inventory', document.querySelector('[data-tab="popup-inventory"]'));
  setTimeout(function() {
    renderInventory();
  }, 50);
}

var FC_CATEGORIES = ['space','cafe','retail','fit out','retail supplies','events','marketing','branding','operations','wholesale','misc'];
var FC_STATUSES = ['needed','sourcing','ordered','done'];
var FC_STATUS_COLORS = { needed:'#e07070', sourcing:'#e2c97e', ordered:'#a8c4d4', done:'#88c98a' };

function renderFixedCosts(scenario, liveInventory) {
  var el = document.getElementById('pl-fixed');
  if (!el) return;
  if (!liveInventory) liveInventory = inventoryToPLItems();
  var total = 0;
  (scenario.fixedCosts || []).forEach(function(c) { total += (c.amount || 0) - (c.refund || 0); });
  // Add shipping we cover
  var shippingItems = (liveInventory || []).filter(function(i) { return i.isShippingDeduction; });
  var shippingWeCover = 0;
  shippingItems.forEach(function(s) { if (s.shippingCoveredBy === 'us') shippingWeCover += (s.shippingAmount || 0); });
  total += shippingWeCover;

  var html = '<div class="pl-section-header"><span class="pl-section-title">Fixed Costs</span><span class="pl-section-total">$' + fmt(total) + '</span></div>';

  var cats = {};
  (scenario.fixedCosts || []).forEach(function(c) {
    var cat = c.category || 'misc';
    if (!cats[cat]) cats[cat] = [];
    cats[cat].push(c);
  });
  // Sort categories by FC_CATEGORIES order
  var catOrder = FC_CATEGORIES.filter(function(c) { return cats[c]; });
  // Add any categories not in FC_CATEGORIES at the end
  Object.keys(cats).forEach(function(c) { if (catOrder.indexOf(c) < 0) catOrder.push(c); });

  // Sort items within each category by amount descending
  catOrder.forEach(function(cat) {
    cats[cat].sort(function(a, b) { return (b.amount || 0) - (a.amount || 0); });
  });

  catOrder.forEach(function(cat) {
    var catTotal = 0;
    cats[cat].forEach(function(c) { catTotal += (c.amount || 0) - (c.refund || 0); });
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

      var hasRefund = c.refund && c.refund > 0;
      var netCost = (c.amount || 0) - (c.refund || 0);
      var refundBadge = hasRefund ? '<span class="pl-refund-badge" onclick="toggleCostCard(\'' + c.id + '\')">net $' + fmt(netCost) + '</span>' : '';

      html += '<div class="pl-cost-item' + (isOpen ? ' open' : '') + '" id="pl-cost-' + c.id + '" data-drag-id="' + c.id + '" data-drag-type="fixed" ondragover="plDragOver(event)" ondrop="plDrop(event)">' +
        '<div class="pl-cost-top">' +
          '<div class="pl-drag-handle" draggable="true" title="Drag to reorder" ondragstart="plDragStart(event)" ondragend="plDragEnd(event)">⠿</div>' +
          '<div class="pl-cost-status-dot" style="background:' + statColor + '" onclick="toggleCostCard(\'' + c.id + '\')"></div>' +
          '<input class="pl-cost-name-inline" value="' + esc(c.name || '') + '" placeholder="Item name" data-cost-id="' + c.id + '" data-field="name" onchange="updateFixedCost(this)" onclick="event.stopPropagation()">' +
          refundBadge +
          '<div class="pl-cost-amt-inline" onclick="event.stopPropagation()">$<input type="number" min="0" class="pl-cost-amt-num" value="' + (c.amount || 0) + '" data-cost-id="' + c.id + '" data-field="amount" onchange="updateFixedCost(this)"></div>' +
          '<span class="pl-cost-chevron" onclick="toggleCostCard(\'' + c.id + '\')">›</span>' +
        '</div>' +
        '<div class="pl-cost-body">' +
          '<div class="pl-cost-fields">' +
            '<div class="pl-cost-field"><div class="pl-cost-field-label">Category</div><select class="pl-cost-field-select" data-cost-id="' + c.id + '" data-field="category" onchange="updateFixedCost(this);renderPL()">' + catOpts + '</select></div>' +
            '<div class="pl-cost-field"><div class="pl-cost-field-label">Status</div><select class="pl-cost-status-sel" data-cost-id="' + c.id + '" data-field="status" onchange="updateFixedCost(this);renderPL()" style="border-color:' + statColor + '44;color:' + statColor + '">' + statOpts + '</select></div>' +
            '<div class="pl-cost-field"><div class="pl-cost-field-label">Where to get it</div><input class="pl-cost-field-input" value="' + esc(c.source || '') + '" placeholder="Vendor, store, link…" data-cost-id="' + c.id + '" data-field="source" onchange="updateFixedCost(this)"></div>' +
            '<div class="pl-cost-field"><div class="pl-cost-field-label">Purchased by</div><div style="display:flex;gap:10px;padding:4px 0">' + ['Del','Brooke'].map(function(who) { return '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-family:DM Mono,monospace;font-size:10px;color:' + (c.who === who ? '#88c98a' : 'var(--muted)') + '"><input type="checkbox"' + (c.who === who ? ' checked' : '') + ' onclick="event.stopPropagation();updateFixedCost({dataset:{costId:\'' + c.id + '\',field:\'who\'},value:this.checked?\'' + who + '\':\'\'})" style="accent-color:#88c98a">' + who + '</label>'; }).join('') + '</div></div>' +
            '<div class="pl-cost-field"><div class="pl-cost-field-label">Refund (prorated return)</div><div class="pl-cost-refund-wrap"><span class="pl-dollar-sign">$</span><input class="pl-cost-field-input pl-cost-refund-input" type="number" min="0" value="' + (c.refund || 0) + '" placeholder="0" data-cost-id="' + c.id + '" data-field="refund" onchange="updateFixedCost(this)">' + (hasRefund ? '<span class="pl-refund-net">net $' + fmt(netCost) + '</span>' : '') + '</div></div>' +
            '<div class="pl-cost-field pl-cost-field-full"><div class="pl-cost-field-label">Notes</div><textarea class="pl-cost-field-textarea" placeholder="Details, alternatives…" data-cost-id="' + c.id + '" data-field="note" onchange="updateFixedCost(this)">' + esc(c.note || '') + '</textarea></div>' +
          '</div>' +
          '<button class="pl-cost-delete-btn" onclick="deleteFixedCost(\'' + c.id + '\')">Delete item</button>' +
        '</div>' +
      '</div>';
    });
    html += '<button class="pl-add-row-btn" onclick="addFixedCostToCat(\'' + esc(cat) + '\')">+ Add to ' + esc(cat) + '</button>';
  });

  // Shipping category (pulled from inventory, not editable here)
  if (shippingItems.length) {
    var totalAllShipping = 0;
    shippingItems.forEach(function(s) { totalAllShipping += (s.shippingAmount || 0); });
    html += '<div class="pl-cost-cat"><span class="pl-cost-cat-name">shipping</span><span class="pl-cost-cat-total">$' + fmt(shippingWeCover) + (totalAllShipping !== shippingWeCover ? ' <span style="font-size:9px;color:var(--muted);font-weight:normal">($' + fmt(totalAllShipping) + ' total)</span>' : '') + '</span></div>';

    shippingItems.forEach(function(shipItem) {
      var coveredByUs = shipItem.shippingCoveredBy === 'us';
      var coveredLabel = coveredByUs ? 'We cover' : 'Vendor covers';
      var coveredColor = coveredByUs ? '#e07070' : '#88c98a';
      var isOpen = document.getElementById('pl-ship-' + shipItem.vendorId) &&
        document.getElementById('pl-ship-' + shipItem.vendorId).classList.contains('open');

      html += '<div class="pl-cost-item' + (isOpen ? ' open' : '') + '" id="pl-ship-' + shipItem.vendorId + '">' +
        '<div class="pl-cost-top" onclick="var el=document.getElementById(\'pl-ship-' + shipItem.vendorId + '\');if(el)el.classList.toggle(\'open\')">' +
          '<div class="pl-cost-status-dot" style="background:' + coveredColor + '"></div>' +
          '<span class="pl-cost-name" style="flex:1">' + esc(shipItem.name) + '</span>' +
          '<span style="font-family:DM Mono,monospace;font-size:9px;color:' + coveredColor + ';margin-right:8px">' + coveredLabel + '</span>' +
          '<span class="pl-cost-amt">$' + fmt(shipItem.shippingAmount) + '</span>' +
          '<span class="pl-cost-chevron">›</span>' +
        '</div>' +
        '<div class="pl-cost-body">' +
          '<div style="padding:8px 12px;font-family:DM Mono,monospace;font-size:10px;color:var(--muted);display:flex;flex-direction:column;gap:4px">' +
            (shipItem.vendorLocation ? '<div>Location: <span style="color:var(--text)">' + esc(shipItem.vendorLocation) + '</span></div>' : '') +
            '<div>Items shipping: <span style="color:var(--text)">' + shipItem.itemCount + '</span></div>' +
            '<div>Cost: <span style="color:var(--text)">$' + fmt(shipItem.shippingAmount) + '</span></div>' +
            '<div>Covered by: <span style="color:' + coveredColor + '">' + coveredLabel + '</span></div>' +
            (coveredByUs ? '<div style="margin-top:4px;color:#e07070">Added to our fixed costs</div>' : '<div style="margin-top:4px;color:#88c98a">No impact on our P&L</div>') +
          '</div>' +
          '<div style="padding:4px 12px 8px"><a href="#" onclick="showTab(\'front\',\'popup-inventory-new\',document.querySelector(\'[data-tab=popup-inventory-new]\'));return false" style="font-family:DM Mono,monospace;font-size:9px;color:var(--front)">Edit in Inventory →</a></div>' +
        '</div>' +
      '</div>';
    });
  }

  html += '<button class="pl-add-row-btn" style="margin-top:12px" onclick="addFixedCost()">+ Add to new category</button>';
  el.innerHTML = html;
}

function renderVariableCosts(scenario, calc, data, liveInventory) {
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
      '<button class="pl-row-del" onclick="deleteVariableCost(\'' + vc.id + '\')">×</button>' +
    '</div>';
  });

  // Merch production COGS (non-wholesale in-house items only)
  // Wholesale COGS are already shown in the Wholesale revenue section
  var merchCOGSItems = (liveInventory || []).filter(function(i) { return i.isInHouse && i.costPerUnit && !i.isShippingDeduction && i.pricingModel !== 'wholesale'; });
  if (merchCOGSItems.length) {
    html += '<div class="pl-cost-cat" style="margin-top:14px"><span class="pl-cost-cat-name">Merch COGS</span></div>';
    merchCOGSItems.forEach(function(item) {
      var qty = item.qty || 1;
      var totalCost = qty * item.costPerUnit;
      html += '<div class="pl-cost-row pl-merch-vc-row">' +
        '<span class="pl-cost-name">' + esc(item.name || '(untitled)') + '</span>' +
        '<span class="pl-cost-note">$' + fmt(item.costPerUnit) + '/unit × ' + qty + '</span>' +
        '<span class="pl-cost-amt">$' + fmt(totalCost) + '</span>' +
      '</div>';
    });
  }

  html += '<button class="pl-add-row-btn" onclick="addVariableCost()">+ Add variable cost</button>';
  el.innerHTML = html;
}

// Store reference to data for variable costs merch COGS
var _plRenderData = null;

// ── Actions ──

function updateItemQty(input) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  if (!scenario.itemSales) scenario.itemSales = {};
  var id = input.dataset.itemId;
  var existing = scenario.itemSales[id] || { qty: 1, sold: true };
  existing.qty = parseInt(input.value) || 0;
  scenario.itemSales[id] = existing;
  savePLData(data);
  renderPL();
}

function updateAllConsignRate(val) {
  var rate = parseInt(val) || 30;
  var data = getPLData();
  data.inventory.forEach(function(item) {
    if (!item.isInHouse) item.commissionPct = rate;
  });
  savePLData(data);
  renderPL();
}

function updateItemCommission(input) {
  var data = getPLData();
  var item = data.inventory.find(function(i) { return i.id === input.dataset.invId; });
  if (!item) return;
  item.commissionPct = parseInt(input.value) || 30;
  savePLData(data);
  renderPL();
}

function updateItemSellQty(input) {
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  if (!scenario.itemSales) scenario.itemSales = {};
  var id = input.dataset.itemId;
  var val = parseInt(input.value);
  if (isNaN(val) || val < 0) val = 0;
  scenario.itemSales[id] = { qty: val };
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
  cost[field] = (field === 'amount' || field === 'refund') ? (parseFloat(input.value) || 0) : input.value;
  savePLData(data);
  // Only re-render summary, not the whole thing (to keep focus)
  var liveInv = inventoryToPLItems();
  var calc = calcPL(scenario, liveInv);
  renderPLSummary(calc, scenario);
  // For refund or category changes, re-render fully
  if (field === 'refund' || field === 'category') {
    renderPLSections(scenario, calc, liveInv);
    var card = document.getElementById('pl-cost-' + input.dataset.costId);
    if (card) card.classList.add('open');
    return;
  }
  // Update section head totals inline (lightweight)
  renderPLSections(scenario, calc, liveInv);
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
  renderPL();
  // Auto-open the new item
  setTimeout(function() {
    var card = document.getElementById('pl-cost-' + newId);
    if (card) card.classList.add('open');
  }, 50);
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

function deleteVariableCost(id) {
  if (!confirm('Delete this variable cost?')) return;
  var data = getPLData();
  var scenario = data.scenarios.find(function(s) { return s.id === data.activeScenario; });
  scenario.variableCosts = (scenario.variableCosts || []).filter(function(vc) { return vc.id !== id; });
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
  // Clone from 46 Hester
  var popup = data.scenarios.find(function(s) { return s.id === 'popup'; }) || data.scenarios[0];
  var newScenario = JSON.parse(JSON.stringify(popup));
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
  data.activeScenario = 'popup';
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
      weeksHead += '<th class="num">Wk ' + (wi+1) + '</th>';
    }

    var rows = '';
    var vGross = 0, vNet = 0;

    group.items.forEach(function(item) {
      var qty = item.qty || 1;
      var isMulti = qty > 1;
      var weekCells = '';
      var weeks = item.weeks || [];
      for (var wi = 0; wi < numWeeks; wi++) {
        var wVal = weeks[wi] || 0;
        if (isMulti) {
          // Multi-quantity: number input for units sold that week
          weekCells += '<td class="num"><input class="pl-inv-week-num" type="number" min="0" value="' + wVal + '" placeholder="0"' +
            ' data-inv-id="' + item.id + '" data-week="' + wi + '" onchange="updateInvWeek(this)"></td>';
        } else {
          // Single item: checkbox
          var checked = wVal > 0;
          weekCells += '<td class="num"><input class="pl-inv-week-check" type="checkbox"' + (checked ? ' checked' : '') +
            ' data-inv-id="' + item.id + '" data-week="' + wi + '" onchange="updateInvWeekCheck(this)"></td>';
        }
      }
      var totalWeekQty = (weeks || []).reduce(function(s,x){ return s + (parseInt(x)||0); }, 0);
      var net = (item.price || 0) * (split / 100);
      var totalGrossItem = totalWeekQty * (item.price || 0);
      var totalNetItem = totalWeekQty * net;
      vGross += totalGrossItem;
      vNet += totalNetItem;

      var catOpts = INV_CATEGORIES.map(function(c) {
        return '<option value="' + c + '"' + (item.category === c ? ' selected' : '') + '>' + (c || '— cat —') + '</option>';
      }).join('');

      rows += '<tr>' +
        '<td><input class="pl-inv-name-input" value="' + esc(item.name) + '" placeholder="Item name"' +
          ' data-inv-id="' + item.id + '" data-field="name" onchange="updateInventoryItem(this)"></td>' +
        '<td><select class="pl-inv-cat-select" data-inv-id="' + item.id + '" data-field="category" onchange="updateInventoryItem(this)">' + catOpts + '</select></td>' +
        '<td class="num"><span class="pl-dollar">$</span><input class="pl-inv-price-input" type="number" min="0" value="' + (item.price||0) + '" placeholder="0"' +
          ' data-inv-id="' + item.id + '" data-field="price" onchange="updateInventoryItem(this)"></td>' +
        '<td class="num"><input class="pl-inv-qty-input" type="number" min="1" value="' + qty + '"' +
          ' data-inv-id="' + item.id + '" data-field="qty" onchange="updateInventoryItem(this);renderInventory()"></td>' +
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
        '<thead><tr><th>Item</th><th>Category</th><th class="num">Unit $</th><th class="num">Qty</th>' + weeksHead + '<th class="num">Your net</th><th></th></tr></thead>' +
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
  if (field === 'price' || field === 'qty' || field === 'costPerUnit' || field === 'unitsProduced') {
    item[field] = (field === 'qty' || field === 'unitsProduced') ? (parseInt(input.value) || 1) : (parseFloat(input.value) || 0);
  } else {
    item[field] = input.value;
  }
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

function updateInvWeekCheck(input) {
  var data = getPLData();
  var item = data.inventory.find(function(i) { return i.id === input.dataset.invId; });
  if (!item) return;
  if (!item.weeks) item.weeks = [0,0,0,0];
  var wi = parseInt(input.dataset.week);
  item.weeks[wi] = input.checked ? 1 : 0;
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
  // Set the drag image to the whole card
  e.dataTransfer.setDragImage(el, 0, 0);
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
