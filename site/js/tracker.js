// ============================================
// THE FRONT NYC — Project Tracker Module
// ============================================
// Vanilla JS — stores in localStorage key 'tracker_data_v1'
// which syncs to Supabase automatically via data.js layer.

var TRACKER_KEY = 'tracker_data_v1';
var TRACKER_SEED_VERSION = 1;

// ── Categories with JSX-matching colors ──
var TR_CATEGORIES = {
  'BUILD / PLAN':     { color: '#B5D4F4', text: '#0C447C', dot: '#378ADD' },
  'LEGAL':            { color: '#C0DD97', text: '#27500A', dot: '#639922' },
  'MONEY / FUNDING':  { color: '#FAC775', text: '#633806', dot: '#BA7517' },
  'SPACE / VENUE':    { color: '#F5C4B3', text: '#712B13', dot: '#D85A30' },
  'BRAND / STORY':    { color: '#F4C0D1', text: '#72243E', dot: '#D4537E' },
  'PEOPLE / VENDORS': { color: '#CECBF6', text: '#3C3489', dot: '#7F77DD' },
  'PRODUCT':          { color: '#9FE1CB', text: '#085041', dot: '#1D9E75' },
  'THE FRONT MERCH':  { color: '#FAEEDA', text: '#633806', dot: '#EF9F27' },
  'OTHER':            { color: '#D3D1C7', text: '#444441', dot: '#888780' }
};

var TR_STATUS_COLORS = {
  'TODO':        '#888780',
  'IN PROGRESS': '#378ADD',
  'BLOCKED':     '#E24B4A',
  'DONE':        '#1D9E75'
};

var TR_PRIORITY_ORDER = { HIGH: 0, MED: 1, LOW: 2 };
var TR_STATUS_ORDER   = { 'TODO': 0, 'IN PROGRESS': 1, 'BLOCKED': 2, 'DONE': 3 };

// ── All 54 seed tasks from the JSX ──
var TRACKER_SEED_TASKS = [
  {
    id: 1, title: "Get AC repair quote from Amir / 334 Broome",
    category: "SPACE / VENUE", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-04-04",
    startDate: "2026-03-30", endDate: "2026-04-04",
    deps: [], notes: "Landlord open to splitting cost. Use as leverage for lease extension + deinstall days."
  },
  {
    id: 2, title: "Negotiate AC cost split + lease extension + deinstall days",
    category: "SPACE / VENUE", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-04-06",
    startDate: "2026-04-04", endDate: "2026-04-06",
    deps: [1], notes: "Negotiate all together: AC cost split, install access Jun 20\u201324 (5 days before launch), deinstall days Jul 20\u201321 (2 days after close Jul 19). AC contribution is leverage for the extras."
  },
  {
    id: 3, title: "Sign lease contract (updated terms)",
    category: "LEGAL", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-04-13",
    startDate: "2026-04-08", endDate: "2026-04-13",
    deps: [51], notes: "Sign within 2 weeks. Must reflect: open Jun 25, close Jul 19, install Jun 20\u201324, deinstall Jul 20\u201321, AC cost split."
  },
  {
    id: 4, title: "Secure domain names",
    category: "BRAND / STORY", status: "TODO", priority: "HIGH",
    assignee: "Brooke", dueDate: "2026-04-04",
    startDate: "2026-03-30", endDate: "2026-04-04",
    deps: [], notes: "thefrontny, frontnyc, thefrontgallery, thefrontstore + variations."
  },
  {
    id: 5, title: "Preliminary budget \u2014 costs + revenue model",
    category: "MONEY / FUNDING", status: "TODO", priority: "HIGH",
    assignee: "Brooke", dueDate: "2026-04-06",
    startDate: "2026-03-30", endDate: "2026-04-06",
    deps: [], notes: "Upfront costs, P&L, commission revenue projections. Inform business plan."
  },
  {
    id: 6, title: "Preliminary project timeline",
    category: "BUILD / PLAN", status: "TODO", priority: "HIGH",
    assignee: "Brooke", dueDate: "2026-04-06",
    startDate: "2026-03-30", endDate: "2026-04-06",
    deps: [], notes: "Launch Jun 25 (Thu). Turnover Jun 15. Fabrication May 28\u2013Jun 14."
  },
  {
    id: 7, title: "Set up project base (repo, Supabase, Vercel, tracker)",
    category: "BUILD / PLAN", status: "TODO", priority: "MED",
    assignee: "Brooke", dueDate: "2026-04-06",
    startDate: "2026-03-30", endDate: "2026-04-06",
    deps: [], notes: "GitHub: smitb383/TheFront_BackOfHouse. Migrate tasks to Supabase."
  },
  {
    id: 8, title: "Loop in Caroline Zimbalist",
    category: "PEOPLE / VENDORS", status: "TODO", priority: "MED",
    assignee: "Brooke", dueDate: "2026-04-06",
    startDate: "2026-03-30", endDate: "2026-04-06",
    deps: [], notes: "Key contact \u2014 bring in early."
  },
  {
    id: 9, title: "Register LLC",
    category: "LEGAL", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-04-06",
    startDate: "2026-03-30", endDate: "2026-04-06",
    deps: [], notes: "Lease currently in Del\u2019s personal name \u2014 must reassign to LLC."
  },
  {
    id: 10, title: "Get EIN",
    category: "LEGAL", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-04-13",
    startDate: "2026-04-06", endDate: "2026-04-13",
    deps: [9], notes: "Required for sales tax cert and vendor agreements."
  },
  {
    id: 11, title: "Reassign lease from Del \u2192 LLC",
    category: "LEGAL", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-04-20",
    startDate: "2026-04-13", endDate: "2026-04-20",
    deps: [3, 9], notes: "Coordinate with Amir Badawi / Patjen Realty Corp."
  },
  {
    id: 12, title: "Apply for NY Sales Tax Certificate of Authority",
    category: "LEGAL", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-05-01",
    startDate: "2026-04-13", endDate: "2026-05-01",
    deps: [10], notes: "20-day lead time. Must be active before opening."
  },
  {
    id: 13, title: "Secure General Liability Insurance ($2M)",
    category: "LEGAL", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-05-10",
    startDate: "2026-04-20", endDate: "2026-05-10",
    deps: [9, 10], notes: "Additional insureds: Amir Badawi (334 Broome St Apt 16) + Patjen Realty Corp (151 Hester St)."
  },
  {
    id: 14, title: "Pay deposit \u2014 $1,750 to Amir",
    category: "MONEY / FUNDING", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-05-15",
    startDate: "2026-05-15", endDate: "2026-05-15",
    deps: [13], notes: "Non-refundable. Cash / Venmo @amir-H-Badawi / Zelle (713) 410-9531 / PayPal amir.h.badawi@gmail.com"
  },
  {
    id: 15, title: "Pay full rent \u2014 $3,500 to Amir",
    category: "MONEY / FUNDING", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-06-14",
    startDate: "2026-06-14", endDate: "2026-06-14",
    deps: [14], notes: "Due June 14. $300/day overtime if overstayed beyond agreed end date."
  },
  {
    id: 16, title: "Brand identity \u2014 tagline, visual language, type system",
    category: "BRAND / STORY", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-04-20",
    startDate: "2026-03-30", endDate: "2026-04-20",
    deps: [], notes: "Bebas Neue confirmed. Tagline TBD. Loop Hannah Witner for graphic work."
  },
  {
    id: 17, title: "Social accounts set up + content strategy",
    category: "BRAND / STORY", status: "TODO", priority: "MED",
    assignee: "Del", dueDate: "2026-05-15",
    startDate: "2026-04-20", endDate: "2026-05-15",
    deps: [42], notes: "Instagram primary. Social templates must be produced before content goes live. Content cadence tied to launch countdown."
  },
  {
    id: 18, title: "Design window vinyl signage",
    category: "BRAND / STORY", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-05-15",
    startDate: "2026-04-20", endDate: "2026-05-15",
    deps: [41], notes: "Full glass window front. Part of graphic production phase. Must be ordered with enough lead time to arrive before Jun 15."
  },
  {
    id: 19, title: "Order + receive window vinyl signage",
    category: "BRAND / STORY", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-06-10",
    startDate: "2026-05-15", endDate: "2026-06-10",
    deps: [18], notes: "Must arrive before Jun 15 so it\u2019s ready for install week."
  },
  {
    id: 20, title: "Build + launch website",
    category: "BRAND / STORY", status: "TODO", priority: "MED",
    assignee: "Brooke", dueDate: "2026-06-01",
    startDate: "2026-04-20", endDate: "2026-06-01",
    deps: [16, 4], notes: "GitHub \u2192 Vercel. Vanilla HTML/CSS/JS. Supabase backend."
  },
  {
    id: 21, title: "Press outreach \u2014 Megan Prives (WGSN) + others",
    category: "BRAND / STORY", status: "TODO", priority: "MED",
    assignee: "Brooke", dueDate: "2026-06-10",
    startDate: "2026-06-01", endDate: "2026-06-10",
    deps: [20], notes: "Website should be live before pitching press."
  },
  {
    id: 22, title: "Launch marketing push \u2014 posts, invites, event page",
    category: "BRAND / STORY", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-06-20",
    startDate: "2026-06-10", endDate: "2026-06-20",
    deps: [17, 21], notes: "Build to Jun 25 launch. Invites, Instagram, event listings."
  },
  {
    id: 23, title: "Finalize vendor roster \u2014 outreach + confirmation",
    category: "PEOPLE / VENDORS", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-05-15",
    startDate: "2026-04-15", endDate: "2026-05-15",
    deps: [40], notes: "Deck already out by this point. Follow up with all targets, confirm who\u2019s in. Verconiik + Harlot Hands confirmed."
  },
  {
    id: 24, title: "Vendor consignment agreements signed",
    category: "PEOPLE / VENDORS", status: "TODO", priority: "HIGH",
    assignee: "Brooke", dueDate: "2026-06-01",
    startDate: "2026-05-25", endDate: "2026-06-01",
    deps: [54], notes: "All vendors signed before product comes in. Agreement includes agreed item list, 70/30 split, Square POS, payment within 7 days of close."
  },
  {
    id: 25, title: "Order small print items \u2014 tags, cards, bags, tissue, hangers",
    category: "PRODUCT", status: "TODO", priority: "MED",
    assignee: "Brooke", dueDate: "2026-05-30",
    startDate: "2026-05-15", endDate: "2026-05-30",
    deps: [42], notes: "Graphic production must be done before ordering. Must arrive before Jun 14. Merch: temp tattoos, stickers, fans, lighters."
  },
  {
    id: 26, title: "Assemble tags, bags, packaging \u2014 fully done before install",
    category: "PRODUCT", status: "TODO", priority: "MED",
    assignee: "Brooke", dueDate: "2026-06-14",
    startDate: "2026-06-01", endDate: "2026-06-14",
    deps: [25], notes: "Everything pre-assembled so no time is spent on this in the space."
  },
  {
    id: 27, title: "Space design plan \u2014 layout, zones, fixture list",
    category: "SPACE / VENUE", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-05-01",
    startDate: "2026-04-01", endDate: "2026-05-01",
    deps: [16], notes: "Clothing area, nook shelving, plinths, dressing room zone. Drives fabrication scope."
  },
  {
    id: 28, title: "Source + purchase all build materials",
    category: "SPACE / VENUE", status: "TODO", priority: "HIGH",
    assignee: "Brooke", dueDate: "2026-05-28",
    startDate: "2026-05-01", endDate: "2026-05-28",
    deps: [27], notes: "Paint, hardware, shelving materials, plinth materials. Everything in hand before fabrication starts."
  },
  {
    id: 29, title: "Fabrication \u2014 clothing racks, shelves, plinths, dressing room",
    category: "SPACE / VENUE", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-06-14",
    startDate: "2026-05-28", endDate: "2026-06-14",
    deps: [28], notes: "2.5 weeks offsite. Everything built before we enter the space Jun 15."
  },
  {
    id: 30, title: "Coordinate large item deliveries \u2014 mirrors, lights, furniture",
    category: "SPACE / VENUE", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-06-15",
    startDate: "2026-06-01", endDate: "2026-06-15",
    deps: [29], notes: "Schedule delivery for Jun 22\u201323, after hard install done and paint dry."
  },
  {
    id: 31, title: "INSTALL: Painting \u2014 2 days",
    category: "SPACE / VENUE", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-06-21",
    startDate: "2026-06-20", endDate: "2026-06-21",
    deps: [15, 29], notes: "Jun 20\u201321 (Sat\u2013Sun). First thing in install window. AJ leads. 5-day buffer after Jun 15 turnover used here."
  },
  {
    id: 32, title: "INSTALL: Hard install \u2014 shelves, built items \u2014 1 day",
    category: "SPACE / VENUE", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-06-22",
    startDate: "2026-06-22", endDate: "2026-06-22",
    deps: [31], notes: "Jun 22 (Mon). All fabricated pieces go up. AJ leads."
  },
  {
    id: 33, title: "INSTALL: Large item delivery + placement",
    category: "SPACE / VENUE", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-06-23",
    startDate: "2026-06-22", endDate: "2026-06-23",
    deps: [32, 30], notes: "Jun 22\u201323 (Mon\u2013Tue). Mirrors, lighting fixtures, furniture in after paint is dry."
  },
  {
    id: 34, title: "INSTALL: Decorative styling, signage + final touches",
    category: "SPACE / VENUE", status: "TODO", priority: "HIGH",
    assignee: "Brooke", dueDate: "2026-06-24",
    startDate: "2026-06-23", endDate: "2026-06-24",
    deps: [33, 19, 26], notes: "Jun 23\u201324 (Tue\u2013Wed). Vinyl signage up, vendor product placed, tags on, everything dressed. Space ready for Thu open."
  },
  {
    id: 35, title: "LAUNCH \u2014 Opening event, Thu Jun 25",
    category: "BUILD / PLAN", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-06-25",
    startDate: "2026-06-25", endDate: "2026-06-25",
    deps: [34, 22, 24], notes: "Thu Jun 25. Operating Tue\u2013Sun. Run through Sun Jul 19."
  },
  {
    id: 36, title: "CLOSE \u2014 Last day of run, Sun Jul 19",
    category: "BUILD / PLAN", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-07-19",
    startDate: "2026-07-19", endDate: "2026-07-19",
    deps: [35], notes: "Full day Jul 19. End of ~25-day run."
  },
  {
    id: 37, title: "General business plan \u2014 all sections",
    category: "BUILD / PLAN", status: "TODO", priority: "HIGH",
    assignee: "Brooke", dueDate: "2026-04-06",
    startDate: "2026-03-30", endDate: "2026-04-06",
    deps: [5], notes: "Full business plan. Parsons grant version adapted from this."
  },
  {
    id: 38, title: "Parsons grant version of business plan",
    category: "BUILD / PLAN", status: "TODO", priority: "HIGH",
    assignee: "Brooke", dueDate: "2026-04-10",
    startDate: "2026-04-06", endDate: "2026-04-10",
    deps: [37], notes: "Adapted from general plan."
  },
  {
    id: 39, title: "Finalize vendor deck",
    category: "PEOPLE / VENDORS", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-04-10",
    startDate: "2026-04-06", endDate: "2026-04-10",
    deps: [37], notes: "Deck communicates concept, terms (70/30), space, programming. Should feel on-brand even if identity isn\u2019t fully locked yet."
  },
  {
    id: 40, title: "Begin sending vendor deck \u2014 outreach to targets",
    category: "PEOPLE / VENDORS", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-04-13",
    startDate: "2026-04-10", endDate: "2026-04-13",
    deps: [39], notes: "Confirmed: Verconiik, Harlot Hands. Identify and reach all new targets this week."
  },
  {
    id: 41, title: "Brand identity complete \u2014 gate for all graphic production",
    category: "BRAND / STORY", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-04-20",
    startDate: "2026-04-06", endDate: "2026-04-20",
    deps: [16], notes: "Full identity locked: logo, type, color, tagline. Nothing goes to print, to social, or to vendors until this is done."
  },
  {
    id: 42, title: "Graphic production \u2014 social templates, print assets, packaging",
    category: "BRAND / STORY", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-05-15",
    startDate: "2026-04-20", endDate: "2026-05-15",
    deps: [41], notes: "Lead time before anything prints or goes live. Includes: social templates, signage files, tag/bag/packaging design, merch graphics. All assets must clear production before ordering or releasing."
  },
  {
    id: 43, title: "Merch ideation \u2014 concepts, items, quantities",
    category: "THE FRONT MERCH", status: "TODO", priority: "MED",
    assignee: "Del", dueDate: "2026-04-30",
    startDate: "2026-04-20", endDate: "2026-04-30",
    deps: [41], notes: "Contingent on graphic identity being locked. Define what we\u2019re making: temp tattoos, stickers, fans, lighters, totes, etc. Think about what makes sense for a summer pop-up with no AC."
  },
  {
    id: 44, title: "Merch design \u2014 artwork files for each item",
    category: "THE FRONT MERCH", status: "TODO", priority: "MED",
    assignee: "Del", dueDate: "2026-05-10",
    startDate: "2026-04-30", endDate: "2026-05-10",
    deps: [43, 42], notes: "Design files must meet vendor specs (bleed, resolution, format). One round of revisions built in."
  },
  {
    id: 45, title: "Merch costing \u2014 get quotes per item, build cost model",
    category: "THE FRONT MERCH", status: "TODO", priority: "MED",
    assignee: "Brooke", dueDate: "2026-05-10",
    startDate: "2026-04-30", endDate: "2026-05-10",
    deps: [43], notes: "Get unit costs + MOQs for each item. Build into budget model \u2014 retail price, margin, breakeven quantity."
  },
  {
    id: 46, title: "Merch final approval \u2014 items, designs, quantities confirmed",
    category: "THE FRONT MERCH", status: "TODO", priority: "HIGH",
    assignee: "Brooke", dueDate: "2026-05-15",
    startDate: "2026-05-10", endDate: "2026-05-15",
    deps: [44, 45], notes: "Both design and cost must be approved before ordering. No changes after this."
  },
  {
    id: 47, title: "Place merch orders",
    category: "THE FRONT MERCH", status: "TODO", priority: "HIGH",
    assignee: "Brooke", dueDate: "2026-05-20",
    startDate: "2026-05-15", endDate: "2026-05-20",
    deps: [46], notes: "1 month production + shipping lead time. Must order by May 20 to arrive before Jun 20."
  },
  {
    id: 48, title: "Merch received + QC checked",
    category: "THE FRONT MERCH", status: "TODO", priority: "HIGH",
    assignee: "Brooke", dueDate: "2026-06-20",
    startDate: "2026-06-10", endDate: "2026-06-20",
    deps: [47], notes: "Arrives ~Jun 10\u201320. Check all items against order. Any issues need time to resolve before launch."
  },
  {
    id: 49, title: "DEINSTALL \u2014 2 days, Jul 20\u201321",
    category: "SPACE / VENUE", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-07-21",
    startDate: "2026-07-20", endDate: "2026-07-21",
    deps: [36], notes: "Jul 20 (Mon) \u2013 Jul 21 (Tue). Space must be returned in original condition. Negotiate these 2 days into the lease."
  },
  {
    id: 50, title: "Compile contract term changes \u2014 dates, AC, deinstall, extensions",
    category: "LEGAL", status: "TODO", priority: "HIGH",
    assignee: "Brooke", dueDate: "2026-04-06",
    startDate: "2026-04-04", endDate: "2026-04-06",
    deps: [2], notes: "Document all requested changes before the call with Amir: open Jun 25 (Thu), close Jul 19 (Sun), install access Jun 20\u201324, deinstall Jul 20\u201321, AC cost split terms. Have everything written out so nothing gets missed."
  },
  {
    id: 51, title: "Call / meet with Amir + Patjen Realty to align on terms",
    category: "LEGAL", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-04-08",
    startDate: "2026-04-06", endDate: "2026-04-08",
    deps: [50], notes: "Verify all changes verbally before the contract is revised. Confirm: updated dates, install + deinstall access, AC agreement, deposit and rent amounts unchanged."
  },
  {
    id: 52, title: "Draft vendor consignment agreement template",
    category: "PEOPLE / VENDORS", status: "TODO", priority: "HIGH",
    assignee: "Brooke", dueDate: "2026-04-20",
    startDate: "2026-04-10", endDate: "2026-04-20",
    deps: [9], notes: "Terms: 70% vendor / 30% The Front. Vendor fills in: item list, descriptions, quantities, sale prices. We agree on each item before signing. Square POS (2.6% fee). Includes liability, pickup terms, payment schedule."
  },
  {
    id: 53, title: "Collect item lists from confirmed vendors",
    category: "PEOPLE / VENDORS", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-05-15",
    startDate: "2026-04-20", endDate: "2026-05-15",
    deps: [40, 52], notes: "Each vendor provides full inventory: item name, description, qty, proposed sale price. We review and agree before agreement is countersigned. Verconiik + Harlot Hands first."
  },
  {
    id: 54, title: "Review + agree on inventory + pricing per vendor",
    category: "PEOPLE / VENDORS", status: "TODO", priority: "HIGH",
    assignee: "Del", dueDate: "2026-05-25",
    startDate: "2026-05-15", endDate: "2026-05-25",
    deps: [53], notes: "Go through each vendor\u2019s item list. Confirm pricing makes sense for the space and customer. Flag anything to negotiate. This informs how we set up Square and the floor plan."
  }
];

// ── State ──
var _trState = {
  tasks: [],
  view: 'board',       // board | timeline | log
  filterCat: 'ALL',
  filterStatus: 'ALL',
  search: '',
  selectedId: null,
  sortField: 'priority', // for log view
  sortDir: 1
};

// ── Data helpers ──
function getTrackerData() {
  try { return JSON.parse(localStorage.getItem(TRACKER_KEY)) || null; } catch(e) { return null; }
}
function saveTrackerData(d) {
  d._seedVersion = TRACKER_SEED_VERSION;
  localStorage.setItem(TRACKER_KEY, JSON.stringify(d));
}

function migrateTrackerData(existing) {
  // Future migrations go here based on _seedVersion
  // For now, merge any missing seed tasks
  var existingIds = {};
  existing.tasks.forEach(function(t) { existingIds[t.id] = true; });
  TRACKER_SEED_TASKS.forEach(function(seed) {
    if (!existingIds[seed.id]) {
      existing.tasks.push(JSON.parse(JSON.stringify(seed)));
    }
  });
  return existing;
}

function loadTrackerTasks() {
  var data = getTrackerData();
  if (!data) {
    // First run — seed
    data = { tasks: JSON.parse(JSON.stringify(TRACKER_SEED_TASKS)), _seedVersion: TRACKER_SEED_VERSION };
    saveTrackerData(data);
  } else if ((data._seedVersion || 0) < TRACKER_SEED_VERSION) {
    data = migrateTrackerData(data);
    saveTrackerData(data);
  }
  return data.tasks;
}

function persistTasks() {
  saveTrackerData({ tasks: _trState.tasks });
}

// ── Date helpers ──
function trParseDate(s) { return new Date(s + 'T00:00:00'); }
function trFmtDate(s) {
  if (!s) return '\u2014';
  var d = trParseDate(s);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function trDaysDiff(a, b) { return Math.round((trParseDate(b) - trParseDate(a)) / 86400000); }
function trToday() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}
function trDaysFromToday(s) { return trDaysDiff(trToday(), s); }

function trUrgency(task) {
  if (task.status === 'DONE') return 'ok';
  var d = trDaysFromToday(task.dueDate);
  if (d < 0) return 'overdue';
  if (d <= 3) return 'urgent';
  if (d <= 14) return 'soon';
  return 'ok';
}
var TR_URGENCY_COLOR = { overdue: '#E24B4A', urgent: '#EF9F27', soon: '#BA7517', ok: '#888780' };
function trUrgencyLabel(task) {
  if (task.status === 'DONE') return 'done';
  var d = trDaysFromToday(task.dueDate);
  if (d < 0) return Math.abs(d) + 'd overdue';
  if (d === 0) return 'due today';
  return 'due in ' + d + 'd';
}

// ── Escape HTML ──
function trEsc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ── Filter tasks ──
function trFilteredTasks() {
  var tasks = _trState.tasks;
  var fc = _trState.filterCat;
  var fs = _trState.filterStatus;
  var search = (_trState.search || '').toLowerCase();
  return tasks.filter(function(t) {
    if (fc !== 'ALL' && t.category !== fc) return false;
    if (fs !== 'ALL' && t.status !== fs) return false;
    if (search && t.title.toLowerCase().indexOf(search) === -1 &&
        (t.notes||'').toLowerCase().indexOf(search) === -1 &&
        (t.assignee||'').toLowerCase().indexOf(search) === -1) return false;
    return true;
  });
}

function trByStatus(status) {
  return trFilteredTasks().filter(function(t) { return t.status === status; })
    .sort(function(a,b) { return (TR_PRIORITY_ORDER[a.priority]||9) - (TR_PRIORITY_ORDER[b.priority]||9); });
}

// ── Next available ID ──
function trNextId() {
  var max = 0;
  _trState.tasks.forEach(function(t) { if (t.id > max) max = t.id; });
  return max + 1;
}

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
function initTracker() {
  _trState.tasks = loadTrackerTasks();
  renderTracker();
}

// ═══════════════════════════════════════
// RENDER — Main
// ═══════════════════════════════════════
function renderTracker() {
  var el = document.getElementById('front-schedule');
  if (!el) return;

  var html = '';

  // ── Stats row ──
  var total = _trState.tasks.length;
  var overdue = _trState.tasks.filter(function(t) { return trDaysFromToday(t.dueDate) < 0 && t.status !== 'DONE'; }).length;
  var dueWeek = _trState.tasks.filter(function(t) { var d = trDaysFromToday(t.dueDate); return d >= 0 && d <= 7 && t.status !== 'DONE'; }).length;
  var inProg = _trState.tasks.filter(function(t) { return t.status === 'IN PROGRESS'; }).length;
  var daysToOpen = trDaysDiff(trToday(), '2026-06-25');

  html += '<div class="trk-stats">';
  html += trStatCard('TOTAL', total, '#888780');
  html += trStatCard('OVERDUE', overdue, '#E24B4A');
  html += trStatCard('DUE THIS WEEK', dueWeek, '#EF9F27');
  html += trStatCard('IN PROGRESS', inProg, '#378ADD');
  html += trStatCard('DAYS TO OPEN', daysToOpen, '#1D9E75');
  html += '</div>';

  // ── View tabs ──
  html += '<div class="trk-toolbar">';
  html += '<div class="trk-views">';
  ['board','timeline','log'].forEach(function(v) {
    var active = _trState.view === v ? ' active' : '';
    html += '<button class="trk-view-btn' + active + '" onclick="trSetView(\'' + v + '\')">' + v.toUpperCase() + '</button>';
  });
  html += '</div>';
  html += '<div class="trk-search-wrap"><input type="text" class="trk-search" placeholder="Search tasks..." value="' + trEsc(_trState.search) + '" oninput="trSetSearch(this.value)"></div>';
  html += '<button class="trk-add-btn" onclick="trAddTask()">+ New task</button>';
  html += '</div>';

  // ── Category filter pills ──
  html += '<div class="trk-filters">';
  html += '<div class="trk-cat-pills">';
  var cats = ['ALL'].concat(Object.keys(TR_CATEGORIES));
  cats.forEach(function(c) {
    var active = _trState.filterCat === c;
    var cat = TR_CATEGORIES[c];
    var cls = 'trk-pill' + (active ? ' active' : '');
    var style = '';
    if (active && cat) style = 'background:' + cat.color + ';color:' + cat.text + ';border-color:' + cat.color;
    else if (active) style = 'background:var(--text);color:var(--bg);border-color:var(--text)';
    else if (cat) style = 'border-color:' + cat.dot + '66';
    var label = c === 'ALL' ? 'ALL' : c.split(' / ')[0];
    html += '<button class="' + cls + '" style="' + style + '" onclick="trSetCatFilter(\'' + trEsc(c) + '\')">' + trEsc(label) + '</button>';
  });
  html += '</div>';

  html += '<div class="trk-filter-sep"></div>';

  // ── Status filter pills ──
  html += '<div class="trk-status-pills">';
  ['ALL','TODO','IN PROGRESS','BLOCKED','DONE'].forEach(function(s) {
    var active = _trState.filterStatus === s;
    var cls = 'trk-pill' + (active ? ' active' : '');
    var style = active ? 'background:var(--text);color:var(--bg);border-color:var(--text)' : '';
    html += '<button class="' + cls + '" style="' + style + '" onclick="trSetStatusFilter(\'' + trEsc(s) + '\')">' + trEsc(s) + '</button>';
  });
  html += '</div>';
  html += '</div>';

  // ── View content ──
  if (_trState.view === 'board') html += renderBoard();
  else if (_trState.view === 'timeline') html += renderTimeline();
  else if (_trState.view === 'log') html += renderLog();

  // ── Detail panel ──
  if (_trState.selectedId !== null) {
    html += renderDetailPanel();
  }

  el.innerHTML = html;

  // Focus search if it was focused
  var searchEl = el.querySelector('.trk-search');
  if (searchEl && document.activeElement && document.activeElement.classList.contains('trk-search')) {
    searchEl.focus();
    searchEl.selectionStart = searchEl.selectionEnd = searchEl.value.length;
  }
}

function trStatCard(label, val, color) {
  return '<div class="trk-stat-card"><div class="trk-stat-label">' + label + '</div><div class="trk-stat-val" style="color:' + color + '">' + val + '</div></div>';
}

// ═══════════════════════════════════════
// BOARD VIEW
// ═══════════════════════════════════════
function renderBoard() {
  var html = '<div class="trk-board">';
  [['TODO','#888780'],['IN PROGRESS','#378ADD'],['BLOCKED','#E24B4A'],['DONE','#1D9E75']].forEach(function(pair) {
    var status = pair[0], color = pair[1];
    var tasks = trByStatus(status);
    html += '<div class="trk-board-col">';
    html += '<div class="trk-col-header"><div class="trk-col-dot" style="background:' + color + '"></div>';
    html += '<span class="trk-col-title">' + status + '</span>';
    html += '<span class="trk-col-count">' + tasks.length + '</span></div>';
    html += '<div class="trk-col-body">';
    if (tasks.length === 0) {
      html += '<div class="trk-col-empty">\u2014</div>';
    } else {
      tasks.forEach(function(t) { html += renderTaskCard(t); });
    }
    html += '</div></div>';
  });
  html += '</div>';
  return html;
}

function renderTaskCard(task) {
  var cat = TR_CATEGORIES[task.category] || TR_CATEGORIES['OTHER'];
  var urg = trUrgency(task);
  var selected = _trState.selectedId === task.id;
  var cls = 'trk-card' + (selected ? ' selected' : '');
  var catLabel = task.category.split(' / ')[0];

  var html = '<div class="' + cls + '" onclick="trSelectTask(' + task.id + ')">';
  if (task.priority === 'HIGH') {
    html += '<div class="trk-card-urgency-bar" style="background:' + TR_URGENCY_COLOR[urg] + '"></div>';
  }
  html += '<div class="trk-card-tags">';
  html += '<span class="trk-cat-tag" style="background:' + cat.color + ';color:' + cat.text + '">' + trEsc(catLabel) + '</span>';
  if (task.deps && task.deps.length > 0) {
    html += '<span class="trk-dep-tag">' + task.deps.length + ' dep' + (task.deps.length > 1 ? 's' : '') + '</span>';
  }
  html += '</div>';
  html += '<div class="trk-card-title">' + trEsc(task.title) + '</div>';
  html += '<div class="trk-card-footer">';
  html += '<span class="trk-card-urgency" style="color:' + TR_URGENCY_COLOR[urg] + '">' + trUrgencyLabel(task) + '</span>';
  html += '<span class="trk-card-assignee">' + trEsc(task.assignee) + '</span>';
  html += '</div>';
  html += '</div>';
  return html;
}

// ═══════════════════════════════════════
// TIMELINE VIEW
// ═══════════════════════════════════════
function renderTimeline() {
  var START = new Date('2026-03-25T00:00:00');
  var END   = new Date('2026-07-25T00:00:00');
  var totalMs = END - START;
  function pct(d) { return ((d - START) / totalMs) * 100; }

  var today = trParseDate(trToday());
  var todayPct = pct(today);

  var phases = [
    { label: 'NOW',      start: '2026-03-25', end: '2026-04-14', color: '#B5D4F422' },
    { label: 'LEGAL & $', start: '2026-04-14', end: '2026-05-15', color: '#C0DD9722' },
    { label: 'BUILD',    start: '2026-05-15', end: '2026-06-18', color: '#CECBF622' },
    { label: 'OPEN',     start: '2026-06-18', end: '2026-07-21', color: '#9FE1CB22' }
  ];

  // Month markers
  var months = [];
  var d = new Date(START);
  while (d < END) {
    months.push({ label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), pct: pct(d) });
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }

  var tasks = trFilteredTasks().sort(function(a,b) { return new Date(a.startDate) - new Date(b.startDate); });

  var html = '<div class="trk-timeline">';

  // Header
  html += '<div class="trk-tl-header" style="margin-left:220px;position:relative;height:32px;border-bottom:1px solid var(--border)">';
  phases.forEach(function(p) {
    var ps = pct(trParseDate(p.start)), pe = pct(trParseDate(p.end));
    html += '<div style="position:absolute;left:' + ps + '%;width:' + (pe-ps) + '%;height:100%;background:' + p.color + ';display:flex;align-items:center;justify-content:center"><span class="trk-tl-phase-label">' + p.label + '</span></div>';
  });
  months.forEach(function(m) {
    html += '<div style="position:absolute;left:' + m.pct + '%;top:0;height:100%;border-left:1px solid var(--border)"><span class="trk-tl-month-label">' + m.label + '</span></div>';
  });
  html += '<div class="trk-tl-today-line" style="left:' + todayPct + '%"></div>';
  html += '</div>';

  // Rows
  html += '<div class="trk-tl-rows">';
  tasks.forEach(function(task, i) {
    var cat = TR_CATEGORIES[task.category] || TR_CATEGORIES['OTHER'];
    var sp = pct(trParseDate(task.startDate));
    var ep = pct(trParseDate(task.endDate));
    var width = Math.max(ep - sp, 0.5);
    var stripe = i % 2 === 1 ? ' trk-tl-row-alt' : '';

    html += '<div class="trk-tl-row' + stripe + '" onclick="trSelectTask(' + task.id + ')">';
    // Label
    html += '<div class="trk-tl-label"><div class="trk-tl-dot" style="background:' + cat.dot + '"></div><span class="trk-tl-name">' + trEsc(task.title) + '</span></div>';
    // Bar area
    html += '<div class="trk-tl-bar-area">';
    html += '<div class="trk-tl-today-line-row" style="left:' + todayPct + '%"></div>';
    // Phase bg
    phases.forEach(function(p) {
      var ps2 = pct(trParseDate(p.start)), pe2 = pct(trParseDate(p.end));
      html += '<div style="position:absolute;left:' + ps2 + '%;width:' + (pe2-ps2) + '%;height:100%;background:' + p.color + '"></div>';
    });
    // Dep lines
    if (task.deps) {
      task.deps.forEach(function(depId) {
        var dep = _trState.tasks.find(function(t) { return t.id === depId; });
        if (!dep) return;
        var depEp = pct(trParseDate(dep.endDate));
        html += '<div class="trk-tl-dep-line" style="left:' + depEp + '%;width:' + (sp - depEp) + '%;background:' + cat.dot + '44"></div>';
      });
    }
    // Bar
    html += '<div class="trk-tl-bar" style="left:' + sp + '%;width:' + width + '%;background:' + cat.color + ';border-color:' + cat.dot + '55">';
    if (task.priority === 'HIGH') html += '<div class="trk-tl-bar-hi" style="background:' + cat.dot + '"></div>';
    html += '<span class="trk-tl-bar-text" style="color:' + cat.text + '">' + trEsc(task.assignee) + '</span>';
    html += '</div>';
    html += '</div>'; // bar-area
    html += '</div>'; // row
  });
  html += '</div>';

  // Legend
  html += '<div class="trk-tl-legend">';
  Object.keys(TR_CATEGORIES).forEach(function(name) {
    var cat = TR_CATEGORIES[name];
    html += '<div class="trk-tl-legend-item"><div class="trk-tl-legend-swatch" style="background:' + cat.color + ';border-color:' + cat.dot + '55"></div><span>' + name.split(' / ')[0] + '</span></div>';
  });
  html += '<div class="trk-tl-legend-item"><div class="trk-tl-today-swatch"></div><span>TODAY</span></div>';
  html += '</div>';

  html += '</div>';
  return html;
}

// ═══════════════════════════════════════
// LOG VIEW
// ═══════════════════════════════════════
function renderLog() {
  var tasks = trFilteredTasks().sort(function(a,b) {
    return (TR_PRIORITY_ORDER[a.priority]||9) - (TR_PRIORITY_ORDER[b.priority]||9) || trDaysFromToday(a.dueDate) - trDaysFromToday(b.dueDate);
  });

  var html = '<div class="trk-log">';
  // Header row
  html += '<div class="trk-log-header">';
  html += '<div class="trk-log-cell trk-log-dot-col"></div>';
  html += '<div class="trk-log-cell trk-log-title-col">TASK</div>';
  html += '<div class="trk-log-cell trk-log-cat-col">CATEGORY</div>';
  html += '<div class="trk-log-cell trk-log-status-col">STATUS</div>';
  html += '<div class="trk-log-cell trk-log-pri-col">PRIORITY</div>';
  html += '<div class="trk-log-cell trk-log-who-col">ASSIGNEE</div>';
  html += '<div class="trk-log-cell trk-log-due-col">DUE</div>';
  html += '</div>';

  tasks.forEach(function(task, i) {
    var cat = TR_CATEGORIES[task.category] || TR_CATEGORIES['OTHER'];
    var urg = trUrgency(task);
    var selected = _trState.selectedId === task.id;
    var cls = 'trk-log-row' + (selected ? ' selected' : '');
    var statusColor = TR_STATUS_COLORS[task.status] || 'var(--muted)';
    var priColor = task.priority === 'HIGH' ? '#E24B4A' : task.priority === 'MED' ? '#BA7517' : 'var(--muted)';
    var catLabel = task.category.split(' / ')[0];

    html += '<div class="' + cls + '" onclick="trSelectTask(' + task.id + ')">';
    html += '<div class="trk-log-cell trk-log-dot-col"><div class="trk-log-dot" style="background:' + cat.dot + '"></div></div>';
    html += '<div class="trk-log-cell trk-log-title-col">';
    if (task.deps && task.deps.length > 0) html += '<span class="trk-log-dep-icon">\u21b3 ' + task.deps.length + '</span>';
    html += trEsc(task.title) + '</div>';
    html += '<div class="trk-log-cell trk-log-cat-col"><span class="trk-cat-tag" style="background:' + cat.color + ';color:' + cat.text + '">' + trEsc(catLabel) + '</span></div>';
    html += '<div class="trk-log-cell trk-log-status-col" style="color:' + statusColor + '">' + task.status + '</div>';
    html += '<div class="trk-log-cell trk-log-pri-col" style="color:' + priColor + '">' + task.priority + '</div>';
    html += '<div class="trk-log-cell trk-log-who-col">' + trEsc(task.assignee) + '</div>';
    html += '<div class="trk-log-cell trk-log-due-col" style="color:' + TR_URGENCY_COLOR[urg] + '">' + trFmtDate(task.dueDate) + '</div>';
    html += '</div>';
  });

  html += '</div>';
  return html;
}

// ═══════════════════════════════════════
// DETAIL PANEL
// ═══════════════════════════════════════
function renderDetailPanel() {
  var task = _trState.tasks.find(function(t) { return t.id === _trState.selectedId; });
  if (!task) return '';
  var cat = TR_CATEGORIES[task.category] || TR_CATEGORIES['OTHER'];
  var urg = trUrgency(task);
  var priColor = task.priority === 'HIGH' ? '#E24B4A' : task.priority === 'MED' ? '#BA7517' : 'var(--muted)';

  var html = '<div class="trk-detail-overlay" onclick="trCloseDetail()"></div>';
  html += '<div class="trk-detail">';

  // Header
  html += '<div class="trk-detail-header">';
  html += '<div>';
  html += '<div class="trk-detail-tags">';
  html += '<span class="trk-cat-tag" style="background:' + cat.color + ';color:' + cat.text + '">' + trEsc(task.category) + '</span>';
  html += '<span class="trk-pri-tag" style="color:' + priColor + '">' + task.priority + '</span>';
  html += '</div>';
  html += '<h2 class="trk-detail-title">' + trEsc(task.title) + '</h2>';
  html += '</div>';
  html += '<button class="trk-detail-close" onclick="trCloseDetail()">\u00d7</button>';
  html += '</div>';

  // Body
  html += '<div class="trk-detail-body">';

  // Status selector
  html += '<div class="trk-detail-section">';
  html += '<div class="trk-detail-label">STATUS</div>';
  html += '<div class="trk-detail-status-btns">';
  ['TODO','IN PROGRESS','BLOCKED','DONE'].forEach(function(s) {
    var active = task.status === s ? ' active' : '';
    html += '<button class="trk-status-btn' + active + '" onclick="trUpdateTask(' + task.id + ',\'status\',\'' + s + '\')">' + s + '</button>';
  });
  html += '</div></div>';

  // Priority selector
  html += '<div class="trk-detail-section">';
  html += '<div class="trk-detail-label">PRIORITY</div>';
  html += '<div class="trk-detail-status-btns">';
  ['HIGH','MED','LOW'].forEach(function(p) {
    var active = task.priority === p ? ' active' : '';
    html += '<button class="trk-status-btn' + active + '" onclick="trUpdateTask(' + task.id + ',\'priority\',\'' + p + '\')">' + p + '</button>';
  });
  html += '</div></div>';

  // Assignee selector
  html += '<div class="trk-detail-section">';
  html += '<div class="trk-detail-label">ASSIGNEE</div>';
  html += '<div class="trk-detail-status-btns">';
  ['Brooke','Del'].forEach(function(a) {
    var active = task.assignee === a ? ' active' : '';
    html += '<button class="trk-status-btn' + active + '" onclick="trUpdateTask(' + task.id + ',\'assignee\',\'' + a + '\')">' + a + '</button>';
  });
  html += '</div></div>';

  // Category selector
  html += '<div class="trk-detail-section">';
  html += '<div class="trk-detail-label">CATEGORY</div>';
  html += '<select class="trk-detail-select" onchange="trUpdateTask(' + task.id + ',\'category\',this.value)">';
  Object.keys(TR_CATEGORIES).forEach(function(c) {
    var sel = task.category === c ? ' selected' : '';
    html += '<option value="' + trEsc(c) + '"' + sel + '>' + trEsc(c) + '</option>';
  });
  html += '</select></div>';

  // Meta grid
  html += '<div class="trk-detail-meta">';
  html += '<div class="trk-detail-meta-card"><div class="trk-detail-label">DUE</div><input type="date" class="trk-detail-date" value="' + (task.dueDate||'') + '" onchange="trUpdateTask(' + task.id + ',\'dueDate\',this.value)"></div>';
  html += '<div class="trk-detail-meta-card"><div class="trk-detail-label">URGENCY</div><div class="trk-detail-meta-val" style="color:' + TR_URGENCY_COLOR[urg] + '">' + trUrgencyLabel(task) + '</div></div>';
  html += '<div class="trk-detail-meta-card"><div class="trk-detail-label">START</div><input type="date" class="trk-detail-date" value="' + (task.startDate||'') + '" onchange="trUpdateTask(' + task.id + ',\'startDate\',this.value)"></div>';
  html += '<div class="trk-detail-meta-card"><div class="trk-detail-label">END</div><input type="date" class="trk-detail-date" value="' + (task.endDate||'') + '" onchange="trUpdateTask(' + task.id + ',\'endDate\',this.value)"></div>';
  html += '</div>';

  // Title edit
  html += '<div class="trk-detail-section">';
  html += '<div class="trk-detail-label">TITLE</div>';
  html += '<input type="text" class="trk-detail-input" value="' + trEsc(task.title) + '" onchange="trUpdateTask(' + task.id + ',\'title\',this.value)">';
  html += '</div>';

  // Notes
  html += '<div class="trk-detail-section">';
  html += '<div class="trk-detail-label">NOTES</div>';
  html += '<textarea class="trk-detail-textarea" onchange="trUpdateTask(' + task.id + ',\'notes\',this.value)">' + trEsc(task.notes || '') + '</textarea>';
  html += '</div>';

  // Dependencies
  var depTasks = (task.deps||[]).map(function(id) { return _trState.tasks.find(function(t) { return t.id === id; }); }).filter(Boolean);
  if (depTasks.length > 0) {
    html += '<div class="trk-detail-section">';
    html += '<div class="trk-detail-label">DEPENDS ON</div>';
    html += '<div class="trk-detail-deps">';
    depTasks.forEach(function(d) {
      var dc = TR_CATEGORIES[d.category] || TR_CATEGORIES['OTHER'];
      html += '<div class="trk-detail-dep-item"><div class="trk-tl-dot" style="background:' + dc.dot + '"></div><span>' + trEsc(d.title) + '</span></div>';
    });
    html += '</div></div>';
  }

  // Unlocks
  var unlocks = _trState.tasks.filter(function(t) { return t.deps && t.deps.indexOf(task.id) !== -1; });
  if (unlocks.length > 0) {
    html += '<div class="trk-detail-section">';
    html += '<div class="trk-detail-label">UNLOCKS</div>';
    html += '<div class="trk-detail-deps">';
    unlocks.forEach(function(d) {
      var dc = TR_CATEGORIES[d.category] || TR_CATEGORIES['OTHER'];
      html += '<div class="trk-detail-dep-item"><div class="trk-tl-dot" style="background:' + dc.dot + '"></div><span>' + trEsc(d.title) + '</span></div>';
    });
    html += '</div></div>';
  }

  // Delete button
  html += '<div class="trk-detail-section" style="margin-top:20px;border-top:1px solid var(--border);padding-top:16px">';
  html += '<button class="trk-delete-btn" onclick="trDeleteTask(' + task.id + ')">Delete task</button>';
  html += '</div>';

  html += '</div>'; // body
  html += '</div>'; // detail
  return html;
}

// ═══════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════
function trSetView(v) {
  _trState.view = v;
  renderTracker();
}

function trSetSearch(val) {
  _trState.search = val;
  renderTracker();
}

function trSetCatFilter(cat) {
  _trState.filterCat = cat;
  renderTracker();
}

function trSetStatusFilter(status) {
  _trState.filterStatus = status;
  renderTracker();
}

function trSelectTask(id) {
  _trState.selectedId = _trState.selectedId === id ? null : id;
  renderTracker();
}

function trCloseDetail() {
  _trState.selectedId = null;
  renderTracker();
}

function trUpdateTask(id, field, value) {
  var task = _trState.tasks.find(function(t) { return t.id === id; });
  if (!task) return;
  task[field] = value;
  persistTasks();
  renderTracker();
}

function trAddTask() {
  var newTask = {
    id: trNextId(),
    title: 'New task',
    category: _trState.filterCat !== 'ALL' ? _trState.filterCat : 'BUILD / PLAN',
    status: 'TODO',
    priority: 'MED',
    assignee: 'Brooke',
    dueDate: trToday(),
    startDate: trToday(),
    endDate: trToday(),
    deps: [],
    notes: ''
  };
  _trState.tasks.push(newTask);
  persistTasks();
  _trState.selectedId = newTask.id;
  renderTracker();
}

function trDeleteTask(id) {
  if (!confirm('Delete this task?')) return;
  _trState.tasks = _trState.tasks.filter(function(t) { return t.id !== id; });
  // Remove from deps
  _trState.tasks.forEach(function(t) {
    if (t.deps) t.deps = t.deps.filter(function(d) { return d !== id; });
  });
  _trState.selectedId = null;
  persistTasks();
  renderTracker();
}

// ═══════════════════════════════════════
// BOOT — called when tracker tab is shown
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
  // If initTracker is called from tab switching logic, this is a fallback
  if (document.getElementById('front-schedule')) {
    initTracker();
  }
});
