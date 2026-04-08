/* ═══════════════════════════════════════════════════════════════
   THE FRONT — Project Tracker v3
   Renders into #front-schedule
   localStorage key: tracker_data_v1  (TRACKER_SEED_VERSION = 3)
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Constants ── */
  var LS_KEY = 'tracker_data_v1';
  var LS_FOCUS_KEY = 'tracker_focus_v1';
  var TRACKER_SEED_VERSION = 8;

  var WORKSTREAMS = {
    'Planning':              { bg: '#B5D4F4', dot: '#378ADD' },
    '334 Space':              { bg: '#F5C4B3', dot: '#D85A30' },
    'Brand':                 { bg: '#F4C0D1', dot: '#D4537E' },
    'Merch':                 { bg: '#FAEEDA', dot: '#EF9F27' },
    'Vendors':               { bg: '#9FE1CB', dot: '#1D9E75' },
    'Fit Out':               { bg: '#FAC775', dot: '#BA7517' },
    'Marketing & Events':  { bg: '#CECBF6', dot: '#7F77DD' },
  };

  // Phases derived from opening date. Foundation is fixed. Others adjust.
  var OPENING_DATE = '2026-06-25';
  var FOUNDATION_START = '2026-03-30';
  var FOUNDATION_END = '2026-04-13';

  function buildPhases() {
    var open = parseD(OPENING_DATE);
    function fmt(d) { return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
    function addDays(d, n) { var r = new Date(d); r.setDate(r.getDate() + n); return r; }

    var foundEnd = parseD(FOUNDATION_END);

    // Install: 5 days before opening, ends day before opening
    var installStart = addDays(open, -5);
    var installEnd = addDays(open, -1);

    // Pre-Launch ends day before install starts (no gap)
    var preLaunchEnd = addDays(installStart, -1);

    // Split gap between foundation and install into Design & Pre-Launch
    var totalGap = Math.round((preLaunchEnd - addDays(foundEnd, 1)) / 86400000) + 1;
    var preLaunchDays = Math.min(Math.round(totalGap * 0.35), totalGap);
    var preLaunchStart = addDays(preLaunchEnd, -(preLaunchDays - 1));

    // Design & Outreach: immediately after foundation through day before pre-launch (no gap)
    var designStart = addDays(foundEnd, 1);
    var designEnd = addDays(preLaunchStart, -1);

    // Open: opening day through +24 days
    var openEnd = addDays(open, 24);

    // Close: immediately after open (no gap), 2 days (deinstall + turnover)
    var closeStart = addDays(openEnd, 1);
    var closeEnd = addDays(closeStart, 1);

    return [
      { name: 'Foundation',        start: FOUNDATION_START, end: FOUNDATION_END, color: '#378ADD' },
      { name: 'Design & Outreach', start: fmt(designStart), end: fmt(designEnd), color: '#D4537E' },
      { name: 'Pre-Launch',        start: fmt(preLaunchStart), end: fmt(preLaunchEnd), color: '#BA7517' },
      { name: 'Install',           start: fmt(installStart), end: fmt(installEnd), color: '#D85A30' },
      { name: 'Open',              start: fmt(open), end: fmt(openEnd), color: '#1D9E75' },
      { name: 'Close',             start: fmt(closeStart), end: fmt(closeEnd), color: '#7F77DD' },
    ];
  }

  var PHASES = buildPhases();

  var MILESTONE_IDS = [9, 3, 41, 10, 14, 13, 42, 23, 24, 20, 15, 29, 34, 35, 36, 55, 56];
  var MAJOR_MILESTONE_IDS = [35, 36, 55, 56]; // Opening, Close, Turnover, Get Access — extra prominent

  /* ── Seed Data (all 54 tasks) ── */
  function buildSeedTasks() {
    var raw = [
{ id:1, title:'Get AC repair quote', workstream:'334 Space', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-04-04', startDate:'2026-03-30', deps:[], notes:'Landlord open to splitting cost. Use as leverage for lease extension + deinstall days.' },
{ id:2, title:'Finalize lease terms', workstream:'334 Space', status:'TODO', priority:'HIGH', assignee:'Brooke', dueDate:'2026-04-09', startDate:'2026-04-01', deps:[1], notes:'Merge of lease term negotiation + compiling changes. Includes: new dates for taking on space, new price if any, AC quotes, new deposit dates, possible payment structure changes. Del\'s LLC will need to eventually sign — if not ready by signing, transfer later and notify 334 Broome.' },
{ id:3, title:'Sign lease', workstream:'334 Space', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-04-10', startDate:'2026-04-09', deps:[2,51], notes:'Milestone cutoff: Apr 10. Must reflect: open Jun 25, close Jul 19, install Jun 20-24, deinstall Jul 20-21, AC cost split. Del\'s LLC signs if ready, otherwise Del signs personally and transfers later.' },
{ id:4, title:'Secure domain names', workstream:'Brand', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-04-04', startDate:'2026-03-30', deps:[], notes:'thefrontny, frontnyc, thefrontgallery, thefrontstore + variations.' },
{ id:5, title:'Draft P&L initial', workstream:'Planning', status:'TODO', priority:'HIGH', assignee:'Brooke', dueDate:'2026-04-10', startDate:'2026-03-30', deps:[], notes:'Initial P&L draft. Commission revenue projections, upfront costs.' },
      { id:6, title:'Draft project timeline', workstream:'Planning', status:'TODO', priority:'HIGH', assignee:'Brooke', dueDate:'2026-04-06', startDate:'2026-03-30', deps:[], notes:'Launch Jun 25 (Thu). Turnover Jun 15. Fabrication May 28\u2013Jun 14.' },
{ id:7, title:'Set up project workspace', workstream:'Planning', status:'TODO', priority:'MED', assignee:'Brooke', dueDate:'2026-04-13', startDate:'2026-03-30', deps:[], notes:'GitHub repo, Supabase, Vercel, tracker. Back of House workspace.' },
      { id:8, title:'Connect with Caroline', workstream:'Marketing & Events', status:'TODO', priority:'MED', assignee:'Brooke', dueDate:'2026-04-06', startDate:'2026-03-30', deps:[], notes:'Key contact \u2014 bring in early.' },
{ id:9, title:'Register LLC', workstream:'Planning', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-04-06', startDate:'2026-03-30', deps:[], notes:'Lease currently in Del\'s personal name — must reassign to LLC.' },
{ id:10, title:'Get EIN', workstream:'Planning', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-04-13', startDate:'2026-04-06', deps:[9], notes:'Required for sales tax cert and vendor agreements.' },
{ id:11, title:'Transfer lease to LLC', workstream:'334 Space', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-04-17', startDate:'2026-04-10', deps:[3,9], notes:'Can happen as soon as lease is signed or after. Coordinate with Amir Badawi / Patjen Realty Corp. If LLC not ready at signing, Del signs personally then transfers.' },
{ id:12, title:'Apply for sales tax cert', workstream:'Planning', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-05-01', startDate:'2026-04-13', deps:[10], notes:'20-day lead time. Must be active before opening.' },
      { id:13, title:'Get liability insurance', workstream:'334 Space', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-05-10', startDate:'2026-04-20', deps:[9,10], notes:'Additional insureds: Amir Badawi (334 Broome St Apt 16) + Patjen Realty Corp (151 Hester St).' },
      { id:14, title:'Pay deposit ($1,750)', workstream:'334 Space', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-05-15', startDate:'2026-05-15', deps:[13], notes:'Non-refundable. Cash / Venmo @amir-H-Badawi / Zelle (713) 410-9531 / PayPal amir.h.badawi@gmail.com' },
      { id:15, title:'Pay rent ($3,500)', workstream:'334 Space', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-06-14', startDate:'2026-06-14', deps:[14], notes:'Due June 14. $300/day overtime if overstayed beyond agreed end date.' },
{ id:16, title:'Define brand identity', workstream:'Brand', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-05-15', startDate:'2026-04-15', deps:[], notes:'One month process. Includes research, core messaging, logo, typography, colors for The Front + 334 popup.' },
      { id:17, title:'Set up social accounts', workstream:'Marketing & Events', status:'TODO', priority:'MED', assignee:'Del', dueDate:'2026-05-15', startDate:'2026-04-20', deps:[42], notes:'Instagram primary. Social templates must be produced before content goes live. Content cadence tied to launch countdown.' },
{ id:18, title:'Design window signage', workstream:'Brand', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-06-01', startDate:'2026-05-15', deps:[41], notes:'Full glass window front. Part of graphic production phase.' },
      { id:19, title:'Order window signage', workstream:'Brand', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-06-10', startDate:'2026-05-15', deps:[18], notes:'Must arrive before Jun 15 so it\u2019s ready for install week.' },
      { id:20, title:'Launch website', workstream:'Marketing & Events', status:'TODO', priority:'MED', assignee:'Brooke', dueDate:'2026-06-01', startDate:'2026-04-20', deps:[16,4], notes:'GitHub \u2192 Vercel. Vanilla HTML/CSS/JS. Supabase backend.' },
      { id:21, title:'Press outreach', workstream:'Marketing & Events', status:'TODO', priority:'MED', assignee:'Brooke', dueDate:'2026-06-10', startDate:'2026-06-01', deps:[20], notes:'Website should be live before pitching press.' },
      { id:22, title:'Launch marketing push', workstream:'Marketing & Events', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-06-20', startDate:'2026-06-10', deps:[17,21], notes:'Build to Jun 25 launch. Invites, Instagram, event listings.' },
      { id:23, title:'Confirm vendor roster', workstream:'Vendors', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-05-15', startDate:'2026-04-15', deps:[40], notes:'Deck already out by this point. Follow up with all targets, confirm who\u2019s in. Verconiik + Harlot Hands confirmed.' },
      { id:24, title:'Sign vendor agreements', workstream:'Vendors', status:'TODO', priority:'HIGH', assignee:'Brooke', dueDate:'2026-06-01', startDate:'2026-05-25', deps:[54], notes:'All vendors signed before product comes in. Agreement includes agreed item list, 70/30 split, Square POS, payment within 7 days of close.' },
      { id:25, title:'Order tags, bags & packaging', workstream:'Brand', status:'TODO', priority:'MED', assignee:'Brooke', dueDate:'2026-05-30', startDate:'2026-05-15', deps:[42], notes:'Graphic production must be done before ordering. Must arrive before Jun 14. Merch: temp tattoos, stickers, fans, lighters.' },
      { id:26, title:'Assemble packaging', workstream:'Brand', status:'TODO', priority:'MED', assignee:'Brooke', dueDate:'2026-06-14', startDate:'2026-06-01', deps:[25], notes:'Everything pre-assembled so no time is spent on this in the space.' },
      { id:27, title:'Design space layout', workstream:'Fit Out', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-05-01', startDate:'2026-04-01', deps:[16], notes:'Clothing area, nook shelving, plinths, dressing room zone. Drives fabrication scope.' },
      { id:28, title:'Purchase build materials', workstream:'Fit Out', status:'TODO', priority:'HIGH', assignee:'Brooke', dueDate:'2026-05-28', startDate:'2026-05-01', deps:[27], notes:'Paint, hardware, shelving materials, plinth materials. Everything in hand before fabrication starts.' },
      { id:29, title:'Fabrication', workstream:'Fit Out', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-06-14', startDate:'2026-05-28', deps:[28], notes:'2.5 weeks offsite. Everything built before we enter the space Jun 15.' },
      { id:30, title:'Schedule deliveries', workstream:'Fit Out', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-06-15', startDate:'2026-06-01', deps:[29], notes:'Schedule delivery for Jun 22\u201323, after hard install done and paint dry.' },
      { id:31, title:'Painting', workstream:'Fit Out', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-06-21', startDate:'2026-06-20', deps:[56,29], notes:'Jun 20-21 (Sat-Sun). First thing in install window. AJ leads.' },
      { id:32, title:'Hard install', workstream:'Fit Out', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-06-22', startDate:'2026-06-22', deps:[31], notes:'Jun 22 (Mon). All fabricated pieces go up. AJ leads.' },
      { id:33, title:'Delivery & placement', workstream:'Fit Out', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-06-23', startDate:'2026-06-22', deps:[32,30], notes:'Jun 22\u201323 (Mon\u2013Tue). Mirrors, lighting fixtures, furniture in after paint is dry.' },
      { id:34, title:'Styling & final touches', workstream:'Fit Out', status:'TODO', priority:'HIGH', assignee:'Brooke', dueDate:'2026-06-24', startDate:'2026-06-23', deps:[33,19,26], notes:'Jun 23\u201324 (Tue\u2013Wed). Vinyl signage up, vendor product placed, tags on, everything dressed. Space ready for Thu open.' },
      { id:35, title:'Opening night', workstream:'Marketing & Events', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-06-25', startDate:'2026-06-25', deps:[34,22,24], notes:'Thu Jun 25. Operating Tue\u2013Sun. Run through Sun Jul 19.' },
      { id:36, title:'Last day', workstream:'Marketing & Events', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-07-19', startDate:'2026-07-19', deps:[35], notes:'Full day Jul 19. End of ~25-day run.' },
      { id:39, title:'Create vendor deck', workstream:'Vendors', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-04-10', startDate:'2026-04-06', deps:[5], notes:'Deck communicates concept, terms (70/30), space, programming. Should feel on-brand even if identity isn\u2019t fully locked yet.' },
      { id:40, title:'Send vendor deck', workstream:'Vendors', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-04-13', startDate:'2026-04-10', deps:[39], notes:'Confirmed: Verconiik, Harlot Hands. Identify and reach all new targets this week.' },
{ id:41, title:'Brand identity created', workstream:'Brand', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-05-15', startDate:'2026-05-01', deps:[16], notes:'Full identity created: logo, type, color, tagline. Nothing goes to print, to social, or to vendors until this is done.' },
      { id:42, title:'Graphic production', workstream:'Brand', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-05-15', startDate:'2026-04-20', deps:[41], notes:'Lead time before anything prints or goes live. Includes: social templates, signage files, tag/bag/packaging design, merch graphics. All assets must clear production before ordering or releasing.' },
      { id:43, title:'Merch ideation', workstream:'Merch', status:'TODO', priority:'MED', assignee:'Del', dueDate:'2026-04-30', startDate:'2026-04-20', deps:[41], notes:'Contingent on graphic identity being locked. Define what we\u2019re making: temp tattoos, stickers, fans, lighters, totes, etc.' },
      { id:44, title:'Merch design files', workstream:'Merch', status:'TODO', priority:'MED', assignee:'Del', dueDate:'2026-05-10', startDate:'2026-04-30', deps:[43,42], notes:'Design files must meet vendor specs (bleed, resolution, format). One round of revisions built in.' },
      { id:45, title:'Merch costing & quotes', workstream:'Merch', status:'TODO', priority:'MED', assignee:'Brooke', dueDate:'2026-05-10', startDate:'2026-04-30', deps:[43], notes:'Get unit costs + MOQs for each item. Build into budget model \u2014 retail price, margin, breakeven quantity.' },
      { id:46, title:'Approve merch', workstream:'Merch', status:'TODO', priority:'HIGH', assignee:'Brooke', dueDate:'2026-05-15', startDate:'2026-05-10', deps:[44,45], notes:'Both design and cost must be approved before ordering. No changes after this.' },
      { id:47, title:'Place merch orders', workstream:'Merch', status:'TODO', priority:'HIGH', assignee:'Brooke', dueDate:'2026-05-20', startDate:'2026-05-15', deps:[46], notes:'1 month production + shipping lead time. Must order by May 20 to arrive before Jun 20.' },
      { id:48, title:'Receive & QC merch', workstream:'Merch', status:'TODO', priority:'HIGH', assignee:'Brooke', dueDate:'2026-06-20', startDate:'2026-06-10', deps:[47], notes:'Arrives ~Jun 10\u201320. Check all items against order. Any issues need time to resolve before launch.' },
      { id:49, title:'Deinstall', workstream:'Fit Out', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-07-22', startDate:'2026-07-20', deps:[36], notes:'Jul 20-22. Remove all fixtures, product, signage. Space must be returned in original condition.' },
{ id:51, title:'Meet with 334', workstream:'334 Space', status:'TODO', priority:'HIGH', assignee:'Both', dueDate:'2026-04-08', startDate:'2026-04-06', deps:[2], notes:'Go over: new dates for taking on space, new price, AC repair quotes and cost split, new deposit dates, possible payment changes for lease. Confirm all verbally before contract revision.' },
      { id:52, title:'Draft vendor agreement', workstream:'Vendors', status:'TODO', priority:'HIGH', assignee:'Brooke', dueDate:'2026-04-20', startDate:'2026-04-10', deps:[9], notes:'Terms: 70% vendor / 30% The Front. Vendor fills in: item list, descriptions, quantities, sale prices. Square POS (2.6% fee). Includes liability, pickup terms, payment schedule.' },
      { id:53, title:'Collect vendor inventory', workstream:'Vendors', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-05-15', startDate:'2026-04-20', deps:[40,52], notes:'Each vendor provides full inventory: item name, description, qty, proposed sale price. We review and agree before agreement is countersigned. Verconiik + Harlot Hands first.' },
      { id:54, title:'Approve vendor pricing', workstream:'Vendors', status:'TODO', priority:'HIGH', assignee:'Del', dueDate:'2026-05-25', startDate:'2026-05-15', deps:[53], notes:'Go through each vendor\u2019s item list. Confirm pricing makes sense for the space and customer. Flag anything to negotiate. This informs how we set up Square and the floor plan.' },
      { id:55, title:'Turnover space', workstream:'Fit Out', status:'TODO', priority:'HIGH', assignee:'Both', dueDate:'2026-07-22', startDate:'2026-07-22', deps:[49], notes:'End of Jul 22. Space returned to 334 Broome in original condition. Final walkthrough with landlord.' },
      { id:56, title:'Get access to space', workstream:'Fit Out', status:'TODO', priority:'HIGH', assignee:'Both', dueDate:'2026-06-20', startDate:'2026-06-20', deps:[15], notes:'Lease begins Jun 20. First day of install access.' },
    ];
    // Subtasks for specific tasks
    var taskSubtasks = {
      2: [ // Finalize lease terms
        { id:'s2_1', text:'Redline/redraft lease with updated terms', done:false },
        { id:'s2_2', text:'Send revised lease to 334 Broome for review', done:false },
        { id:'s2_3', text:'Review and agree on final terms', done:false },
        { id:'s2_4', text:'Circulate final draft for signature', done:false },
        { id:'s2_5', text:'Note: Del\'s LLC will need to sign — if not ready, transfer later', done:false }
      ],
      5: [ // Draft P&L initial
        { id:'s5_1', text:'Draft P&L initial', done:true },
        { id:'s5_2', text:'Review with Del', done:false },
        { id:'s5_3', text:'Update with actual items and predicted costs', done:false },
        { id:'s5_4', text:'Assign cost responsibilities', done:false },
        { id:'s5_5', text:'Set P&L timeline', done:false }
      ],
      16: [ // Define brand identity
        { id:'s16_1', text:'Research history of The Front', done:false },
        { id:'s16_2', text:'Tagline and core messaging for The Front', done:false },
        { id:'s16_3', text:'Core messaging and territorial framing for 334 popup', done:false },
        { id:'s16_4', text:'Decide on name of the volume (a.k.a. 334 popup)', done:false },
        { id:'s16_5', text:'Logo ideation for The Front brand', done:false },
        { id:'s16_6', text:'Typography, colors ideation — The Front', done:false },
        { id:'s16_7', text:'Ideation for popup brand spinoff — colors, typography', done:false },
        { id:'s16_8', text:'Decide on outside graphic design support', done:false },
        { id:'s16_9', text:'If yes: find designers and negotiate scope', done:false }
      ],
      51: [ // Meet with 334
        { id:'s51_1', text:'Go over new dates for taking on the space', done:false },
        { id:'s51_2', text:'Discuss new price if any', done:false },
        { id:'s51_3', text:'Present AC repair quotes and cost split', done:false },
        { id:'s51_4', text:'Discuss new deposit dates', done:false },
        { id:'s51_5', text:'Discuss possible payment structure changes', done:false },
        { id:'s51_6', text:'Confirm all terms verbally before contract revision', done:false }
      ]
    };

    return raw.map(function(t) {
      t.subtasks = taskSubtasks[t.id] || [];
      t.isMilestone = MILESTONE_IDS.indexOf(t.id) !== -1;
      t.isMajorMilestone = MAJOR_MILESTONE_IDS.indexOf(t.id) !== -1;
      return t;
    });
  }

  /* ── Date Helpers ── */
  function parseD(s) { return new Date(s + 'T00:00:00'); }
  function todayDate() { return new Date(); }
  function todayStr() { var d = todayDate(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
  function daysBetween(a, b) { return Math.round((parseD(b) - parseD(a)) / 86400000); }
  function daysUntil(s) { return daysBetween(todayStr(), s); }
  function fmtShort(s) { if (!s) return ''; var d = parseD(s); return d.toLocaleDateString('en-US', { month:'short', day:'numeric' }); }
  function weekStart(d) { var dt = typeof d === 'string' ? parseD(d) : new Date(d); var day = dt.getDay(); var diff = dt.getDate() - day + (day === 0 ? -6 : 1); return new Date(dt.getFullYear(), dt.getMonth(), diff); }
  function sameWeek(a, b) { return weekStart(a).getTime() === weekStart(b).getTime(); }

  /* ── Current Phase ── */
  function getCurrentPhase() {
    var today = todayStr();
    for (var i = 0; i < PHASES.length; i++) {
      if (today >= PHASES[i].start && today <= PHASES[i].end) return PHASES[i];
    }
    if (today < PHASES[0].start) return PHASES[0];
    return PHASES[PHASES.length - 1];
  }

  /* ── State ── */
  var tasks = [];
  var currentView = 'timeline';
  var selectedTaskId = null;
  var searchQuery = '';
  var filterWorkstream = 'ALL';
  var filterAssignee = 'ALL';
  var collapsedWorkstreams = {};
  var timelineZoom = 1;
  var listSortField = 'dueDate';
  var listSortAsc = true;

  /* ── Persistence ── */
  var _isSeeded = false; // true if we loaded from seed (no user data found)

  function loadTasks() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        if (Array.isArray(data.tasks) && data.tasks.length > 0) {
          tasks = data.tasks;
          _isSeeded = false;
          return;
        }
      }
    } catch (e) {}
    // No saved data — use seed but DON'T write to localStorage yet
    // (wait for Supabase to potentially have the real data)
    tasks = buildSeedTasks();
    _isSeeded = true;
  }

  function saveTasks() {
    if (_isSeeded) {
      // SAFETY: don't save seed data — it would overwrite real data in Supabase.
      // Show a warning if user tries to edit before Supabase loads.
      console.warn('[tracker] Waiting for data sync — edit not saved yet. Refresh in a moment.');
      return;
    }
    var payload = { _seedVersion: TRACKER_SEED_VERSION, tasks: tasks };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  }

  // Listen for Supabase data arrival — reload if it has better data
  window.addEventListener('kv-updated', function(e) {
    if (e.detail && e.detail.key === LS_KEY) {
      try {
        var data = JSON.parse(localStorage.getItem(LS_KEY));
        if (data && Array.isArray(data.tasks) && data.tasks.length > 0) {
          tasks = data.tasks;
          _isSeeded = false;
          if (typeof renderTracker === 'function') renderTracker();
        }
      } catch(ex) {}
    }
  });

  // Also listen for the supabase-ready event
  window.addEventListener('supabase-ready', function() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        if (Array.isArray(data.tasks) && data.tasks.length > 0) {
          tasks = data.tasks;
          _isSeeded = false;
          if (typeof renderTracker === 'function') renderTracker();
        }
      }
    } catch(ex) {}
  });

  /* ── Focus persistence ── */
  function loadFocusData() {
    try {
      var raw = localStorage.getItem(LS_FOCUS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return { customFocus: [], customBeginning: [] };
  }
  function saveFocusData(data) {
    localStorage.setItem(LS_FOCUS_KEY, JSON.stringify(data));
  }

  /* ── Task Helpers ── */
  function getTask(id) { for (var i = 0; i < tasks.length; i++) { if (tasks[i].id === id) return tasks[i]; } return null; }
  function nextId() { var mx = 0; tasks.forEach(function(t){ if (t.id > mx) mx = t.id; }); return mx + 1; }
  function taskBlocks(id) { return tasks.filter(function(t){ return t.deps && t.deps.indexOf(id) !== -1; }); }
  function taskBlockedBy(id) { var t = getTask(id); if (!t || !t.deps) return []; return t.deps.map(getTask).filter(Boolean); }
  function dueNext7Days() {
    var today = todayDate();
    var end = new Date(today); end.setDate(end.getDate() + 7);
    return tasks.filter(function(t) {
      if (t.status === 'DONE') return false;
      var due = parseD(t.dueDate);
      return due >= today && due <= end;
    });
  }
  function beginningThisWeek() { var ts = todayStr(); return tasks.filter(function(t){ return t.status !== 'DONE' && sameWeek(t.startDate, ts); }); }

  function currentFocusBullets() {
    var ws = {};
    tasks.filter(function(t){ return t.status !== 'DONE'; }).forEach(function(t) {
      if (!ws[t.workstream] || parseD(t.dueDate) < parseD(ws[t.workstream].dueDate)) {
        ws[t.workstream] = t;
      }
    });
    var focusMap = {
      'Space': 'Finalizing lease agreement',
      'Planning': 'Project scoping & budget',
      'Brand': 'Branding / voice of project',
      'Vendors': 'Vendor curation & outreach',
      'Marketing & Events': 'Marketing & press groundwork',
      'Finance': 'Insurance & deposits',
      'Merch': 'Merch planning & production',
    };
    return Object.keys(ws).map(function(k){ return focusMap[k] || k; }).slice(0, 5);
  }

  /* ── DOM Helpers ── */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    var children = Array.prototype.slice.call(arguments, 2);
    if (attrs) {
      Object.keys(attrs).forEach(function(k) {
        var v = attrs[k];
        if (k === 'style' && typeof v === 'object') { Object.keys(v).forEach(function(sk){ el.style[sk] = v[sk]; }); }
        else if (k.indexOf('on') === 0 && typeof v === 'function') { el.addEventListener(k.slice(2).toLowerCase(), v); }
        else if (k === 'className') el.className = v;
        else if (k === 'innerHTML') el.innerHTML = v;
        else if (k === 'checked' && v) el.checked = true;
        else if (k === 'selected' && v) el.selected = true;
        else el.setAttribute(k, v);
      });
    }
    function append(c) {
      if (c == null || c === false) return;
      if (Array.isArray(c)) { c.forEach(append); return; }
      if (typeof c === 'string' || typeof c === 'number') el.appendChild(document.createTextNode(String(c)));
      else if (c instanceof Node) el.appendChild(c);
    }
    children.forEach(append);
    return el;
  }

  function priorityBadge(p) {
    var colors = { HIGH: '#E24B4A', MED: '#EF9F27', LOW: '#888780' };
    return h('span', { style: { fontSize:'8px', fontFamily:"'DM Mono',monospace", letterSpacing:'0.1em', textTransform:'uppercase', padding:'1px 5px', borderRadius:'2px', background: colors[p] || '#888', color:'#fff', lineHeight:'1.5' } }, p);
  }

  function wsDot(ws, size) {
    size = size || 8;
    var color = (WORKSTREAMS[ws] || {}).dot || '#888';
    return h('span', { style: { display:'inline-block', width:size+'px', height:size+'px', borderRadius:'50%', background:color, flexShrink:'0' } });
  }

  function diamondIcon(size) {
    size = size || 10;
    return h('span', { style: { display:'inline-block', width:size+'px', height:size+'px', background:'var(--front)', transform:'rotate(45deg)', flexShrink:'0' } });
  }

  /* ── Inject Styles ── */
  function injectStyles() {
    if (document.getElementById('tracker-styles')) return;
    var css = [
      '#front-schedule { position:relative; }',
      '.trk-mono { font-family:"DM Mono",monospace; font-size:9px; letter-spacing:0.12em; text-transform:uppercase; }',
      '.trk-serif { font-family:"Cormorant Garamond",serif; font-size:15px; }',
      '.trk-card { background:var(--surface); border:1px solid var(--border); border-radius:4px; }',
      '.trk-btn { background:none; border:1px solid var(--border); color:var(--muted); font-family:"DM Mono",monospace; font-size:9px; letter-spacing:0.12em; text-transform:uppercase; padding:5px 12px; cursor:pointer; border-radius:2px; transition:all 0.2s; white-space:nowrap; line-height:1; }',
      '.trk-btn:hover { color:var(--text); border-color:var(--muted); }',
      '.trk-btn.active { background:var(--front); color:var(--bg); border-color:var(--front); }',
      '.trk-input { background:var(--surface2); border:1px solid var(--border); color:var(--text); font-family:"Cormorant Garamond",serif; font-size:14px; padding:6px 10px; border-radius:3px; outline:none; width:100%; box-sizing:border-box; }',
      '.trk-input:focus { border-color:var(--front); }',
      '.trk-select { background:var(--surface2); border:1px solid var(--border); color:var(--text); font-family:"DM Mono",monospace; font-size:10px; letter-spacing:0.08em; padding:5px 8px; border-radius:3px; outline:none; cursor:pointer; }',
      '.trk-select:focus { border-color:var(--front); }',
      '.trk-stats { display:flex; gap:24px; align-items:center; padding:12px 16px; flex-wrap:wrap; }',
      '.trk-stat-item { display:flex; flex-direction:column; gap:2px; }',
      '.trk-stat-label { font-family:"DM Mono",monospace; font-size:8px; letter-spacing:0.15em; text-transform:uppercase; color:var(--muted); }',
      '.trk-stat-value { font-family:"Cormorant Garamond",serif; font-size:18px; color:var(--text); }',
      '.trk-stat-date { font-family:"Cormorant Garamond",serif; font-size:22px; color:var(--text); font-weight:600; }',
      '.trk-stat-days { font-family:"Cormorant Garamond",serif; font-size:15px; color:var(--front); margin-left:4px; }',
      '.trk-board { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }',
      '.trk-col-header { font-family:"DM Mono",monospace; font-size:10px; letter-spacing:0.15em; text-transform:uppercase; color:var(--muted); padding:8px 0; border-bottom:1px solid var(--border); margin-bottom:8px; }',
      '.trk-task-card { padding:10px 12px; margin-bottom:8px; cursor:pointer; transition:border-color 0.15s; }',
      '.trk-task-card:hover { border-color:var(--muted); }',
      '.trk-task-card.selected { border-color:var(--front); }',
      '.trk-task-title { font-family:"Cormorant Garamond",serif; font-size:14px; color:var(--text); line-height:1.3; }',
      '.trk-task-meta { display:flex; gap:8px; align-items:center; margin-top:6px; flex-wrap:wrap; }',
      '.trk-week-sep { font-family:"DM Mono",monospace; font-size:8px; letter-spacing:0.15em; text-transform:uppercase; color:var(--muted); padding:6px 0 2px; border-top:1px dashed var(--border); margin-top:4px; }',
      '.trk-warning { display:inline-block; width:6px; height:6px; border-radius:50%; background:#E24B4A; margin-right:4px; }',
      '.trk-list-table { width:100%; border-collapse:collapse; }',
      '.trk-list-table th { font-family:"DM Mono",monospace; font-size:9px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted); text-align:left; padding:8px 10px; border-bottom:1px solid var(--border); cursor:pointer; user-select:none; white-space:nowrap; }',
      '.trk-list-table th:hover { color:var(--text); }',
      '.trk-list-table td { font-family:"Cormorant Garamond",serif; font-size:14px; color:var(--text); padding:8px 10px; border-bottom:1px solid var(--faint); vertical-align:middle; }',
      '.trk-list-table tr.trk-list-row { cursor:pointer; transition:background 0.1s; }',
      '.trk-list-table tr.trk-list-row:hover { background:var(--surface2); }',
      '.trk-list-table tr.trk-list-row.selected { background:var(--front-dim); }',
      '.trk-timeline-wrap { position:relative; overflow-x:auto; overflow-y:visible; }',
      '.trk-timeline-row { display:flex; align-items:center; height:28px; position:relative; }',
      '.trk-timeline-bar { position:absolute; height:14px; border-radius:3px; cursor:pointer; transition:opacity 0.15s; min-width:6px; z-index:2; }',
      '.trk-timeline-bar:hover { opacity:0.85; }',
      '.trk-timeline-bar.selected { outline:2px solid var(--front); outline-offset:1px; }',
      '.trk-timeline-milestone { position:absolute; width:12px; height:12px; transform:rotate(45deg); cursor:pointer; z-index:3; border:2px solid var(--front); }',
      '.trk-timeline-milestone.selected { background:var(--front); }',
      '.trk-timeline-milestone.major { border:none; box-shadow:0 0 8px rgba(226,201,126,0.5); z-index:5; }',
      '.trk-timeline-today { position:absolute; top:0; bottom:0; width:2px; background:#E24B4A; z-index:4; pointer-events:none; }',
      '.trk-timeline-dep { stroke:var(--muted); stroke-width:1; fill:none; opacity:0.4; }',
      '.trk-timeline-ws-label { font-family:"DM Mono",monospace; font-size:12px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:140px; min-width:140px; padding:4px 8px; display:flex; align-items:center; gap:8px; height:32px; }',
      '.trk-timeline-ws-row { background:var(--surface2); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }',
      '.trk-phase-band { position:absolute; top:0; bottom:0; opacity:0.06; pointer-events:none; }',
      '.trk-detail { position:fixed; top:0; right:0; width:380px; height:100vh; background:var(--surface); border-left:1px solid var(--border); z-index:100; overflow-y:auto; padding:20px; box-shadow:-4px 0 20px rgba(0,0,0,0.3); }',
      '.trk-detail-close { position:absolute; top:12px; right:12px; background:none; border:none; color:var(--muted); font-size:18px; cursor:pointer; padding:4px 8px; }',
      '.trk-detail-close:hover { color:var(--text); }',
      '.trk-detail label { font-family:"DM Mono",monospace; font-size:8px; letter-spacing:0.15em; text-transform:uppercase; color:var(--muted); display:block; margin-top:14px; margin-bottom:4px; }',
      '.trk-dep-link { font-family:"Cormorant Garamond",serif; font-size:13px; color:var(--front); cursor:pointer; text-decoration:underline; display:block; padding:1px 0; }',
      '.trk-dep-link:hover { opacity:0.8; }',
      '.trk-subtask-row { display:flex; align-items:center; gap:6px; padding:3px 0; }',
      '.trk-subtask-row input[type=checkbox] { accent-color:var(--front); cursor:pointer; }',
      '.trk-subtask-text { font-family:"Cormorant Garamond",serif; font-size:13px; color:var(--text); flex:1; }',
      '.trk-subtask-text.done { text-decoration:line-through; color:var(--muted); }',
      '.trk-subtask-del { background:none; border:none; color:var(--muted); cursor:pointer; font-size:12px; padding:0 4px; }',
      '.trk-subtask-del:hover { color:#E24B4A; }',
      '.trk-focus-list { list-style:none; padding:0; margin:4px 0 0 0; }',
      '.trk-focus-list li { font-family:"Cormorant Garamond",serif; font-size:14px; color:var(--text); padding:2px 0; display:flex; align-items:center; gap:6px; }',
      '.trk-focus-list li::before { content:"\\2022"; color:var(--front); }',
      '.trk-focus-input { background:transparent; border:none; border-bottom:1px solid transparent; color:var(--text); font-family:"Cormorant Garamond",serif; font-size:14px; padding:2px 4px; outline:none; flex:1; min-width:0; }',
      '.trk-focus-input:hover { border-bottom-color:var(--border); }',
      '.trk-focus-input:focus { border-bottom-color:var(--front); }',
      '.trk-focus-del { background:none; border:none; color:var(--muted); cursor:pointer; font-size:11px; padding:0 2px; opacity:0; transition:opacity 0.15s; }',
      '.trk-focus-list li:hover .trk-focus-del { opacity:1; }',
      '.trk-focus-del:hover { color:#E24B4A; }',
      '.trk-focus-add { background:none; border:1px dashed var(--border); color:var(--muted); font-family:"DM Mono",monospace; font-size:9px; letter-spacing:0.1em; text-transform:uppercase; padding:3px 10px; cursor:pointer; border-radius:2px; margin-top:6px; transition:all 0.15s; }',
      '.trk-focus-add:hover { border-color:var(--front); color:var(--front); }',
      '.trk-pills { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px; }',
      '.trk-pill { font-family:"DM Mono",monospace; font-size:9px; letter-spacing:0.1em; text-transform:uppercase; padding:4px 10px; border-radius:12px; border:1px solid var(--border); background:transparent; color:var(--muted); cursor:pointer; transition:all 0.15s; }',
      '.trk-pill:hover { border-color:var(--muted); color:var(--text); }',
      '.trk-pill.active { border-color:var(--front); color:var(--front); background:var(--front-dim); }',
      '.trk-ws-pill { font-family:"DM Mono",monospace; font-size:9px; letter-spacing:0.1em; text-transform:uppercase; padding:4px 10px; border-radius:12px; border:1px solid; cursor:pointer; transition:all 0.15s; }',
      '.trk-ws-pill:hover { opacity:0.85; }',
      '.trk-ws-pill.active { color:#fff !important; }',
      '.trk-due-item { font-family:"Cormorant Garamond",serif; font-size:14px; color:var(--text); padding:3px 0; display:flex; align-items:center; gap:6px; cursor:pointer; transition:color 0.15s; }',
      '.trk-due-item:hover { color:var(--front); }',
      '.trk-due-item::before { content:"\\2022"; color:var(--front); }',
      '@media (max-width:900px) { .trk-board { grid-template-columns:1fr; } .trk-detail { width:100%; } }',
    ].join('\n');
    var style = document.createElement('style');
    style.id = 'tracker-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ═══════════════════════════════════════════
     RENDER MAIN
  ═══════════════════════════════════════════ */
  function renderTracker() {
    var root = document.getElementById('front-schedule');
    if (!root) return;

    // Save scroll position before re-render
    var scrollY = window.scrollY || window.pageYOffset;
    var timelineWrap = root.querySelector('.trk-timeline-wrap');
    var timelineScrollX = timelineWrap ? timelineWrap.scrollLeft : 0;

    root.innerHTML = '';
    injectStyles();

    root.appendChild(renderStatsBar());
    root.appendChild(renderFocusSection());
    root.appendChild(renderWorkstreamFilters());
    root.appendChild(renderViewSwitcher());

    if (currentView === 'timeline') root.appendChild(renderTimeline());
    else if (currentView === 'board') root.appendChild(renderBoard());
    else root.appendChild(renderList());

    if (selectedTaskId !== null) root.appendChild(renderDetail(selectedTaskId));
  }

  // Open/close detail panel WITHOUT re-rendering the whole page
  function showDetail(id) {
    var root = document.getElementById('front-schedule');
    if (!root) return;
    // Remove existing detail panel
    var existing = root.querySelector('.trk-detail');
    if (existing) existing.remove();
    // Remove existing overlay
    var existingOverlay = root.querySelector('.trk-detail-overlay');
    if (existingOverlay) existingOverlay.remove();

    selectedTaskId = id;
    if (id !== null) {
      root.appendChild(renderDetail(id));
    }
  }

  function closeDetail() {
    showDetail(null);
  }

  /* ── Stats Bar ── */
  function renderStatsBar() {
    var phase = getCurrentPhase();

    var keyDates = [
      { label:'Deposit Due', date:'May 15', days:daysUntil('2026-05-15') },
      { label:'Rent Due', date:'Jun 14', days:daysUntil('2026-06-14') },
      { label:'Install Begins', date:'Jun 20', days:daysUntil('2026-06-20') },
      { label:'Opening', date:'Jun 25', days:daysUntil('2026-06-25') },
      { label:'Closing', date:'Jul 19', days:daysUntil('2026-07-19') },
      { label:'Turnover Space', date:'Jul 21', days:daysUntil('2026-07-21') }
    ];

    function sep() { return h('div', { style:{ width:'1px', height:'28px', background:'var(--border)' } }); }

    var stats = h('div', { className:'trk-stats' });

    stats.appendChild(h('div', { className:'trk-stat-item' },
      h('span', { className:'trk-stat-label' }, 'Current Phase'),
      h('span', { className:'trk-stat-value', style:{ color:phase.color } }, phase.name)
    ));

    keyDates.forEach(function(kd) {
      stats.appendChild(sep());
      stats.appendChild(h('div', { className:'trk-stat-item' },
        h('span', { className:'trk-stat-label' }, kd.label),
        h('span', null,
          h('span', { className:'trk-stat-date' }, kd.date),
          h('span', { className:'trk-stat-days' }, ' (' + kd.days + 'd)')
        )
      ));
    });

    return h('div', { className:'trk-card', style:{ marginBottom:'12px' } }, stats);
  }

  /* ── Focus Section ── */
  function renderFocusSection() {
    var focusBullets = currentFocusBullets();
    var beginItems = beginningThisWeek();
    var dueItems = dueNext7Days();
    var focusData = loadFocusData();

    var wrap = h('div', { style:{ display:'flex', gap:'12px', marginBottom:'12px', flexWrap:'wrap' } });

    // Current Focus
    var focusCard = h('div', { className:'trk-card', style:{ flex:'0 0 280px', minWidth:'240px', padding:'12px 16px' } });
    focusCard.appendChild(h('div', { className:'trk-mono', style:{ color:'var(--front)', marginBottom:'6px' } }, 'Current Focus'));
    var focusList = h('ul', { className:'trk-focus-list' });

    // Auto-populated items — editable with delete
    focusBullets.forEach(function(b, i) {
      var fd2 = loadFocusData();
      var isHidden = (fd2.hiddenFocus || []).indexOf(b) !== -1;
      if (isHidden) return;
      var li = h('li', { style:{ display:'flex', alignItems:'center', gap:'4px' } });
      var inp = h('input', {
        className:'trk-focus-input',
        type:'text',
        value: b,
        style:{ flex:'1' }
      });
      li.appendChild(inp);
      li.appendChild(h('button', {
        className:'trk-focus-del',
        onClick: function() {
          var fd3 = loadFocusData();
          if (!fd3.hiddenFocus) fd3.hiddenFocus = [];
          fd3.hiddenFocus.push(b);
          saveFocusData(fd3);
          renderTracker();
        }
      }, '\u2715'));
      focusList.appendChild(li);
    });

    // Custom focus items
    (focusData.customFocus || []).forEach(function(item, i) {
      var li = h('li');
      var inp = h('input', {
        className:'trk-focus-input',
        type:'text',
        value: item,
        onInput: function(e) {
          var fd = loadFocusData();
          fd.customFocus[i] = e.target.value;
          saveFocusData(fd);
        }
      });
      var del = h('button', {
        className:'trk-focus-del',
        onClick: function() {
          var fd = loadFocusData();
          fd.customFocus.splice(i, 1);
          saveFocusData(fd);
          renderTracker();
        }
      }, '\u2715');
      li.appendChild(inp);
      li.appendChild(del);
      focusList.appendChild(li);
    });

    focusCard.appendChild(focusList);
    focusCard.appendChild(h('button', {
      className:'trk-focus-add',
      onClick: function() {
        var fd = loadFocusData();
        if (!fd.customFocus) fd.customFocus = [];
        fd.customFocus.push('');
        saveFocusData(fd);
        renderTracker();
      }
    }, '+ Add'));
    wrap.appendChild(focusCard);

    // Helper: render two-column assignee split
    function renderTwoColTasks(items, title) {
      var card = h('div', { className:'trk-card', style:{ flex:'2', minWidth:'300px', padding:'12px 16px' } });
      card.appendChild(h('div', { className:'trk-mono', style:{ color:'var(--front)', marginBottom:'6px' } }, title));
      var cols = h('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' } });

      ['Brooke','Del','Both'].forEach(function(person) {
        var col = h('div');
        var label = person === 'Both' ? 'Brooke & Del' : person;
        col.appendChild(h('div', { className:'trk-mono', style:{ fontSize:'8px', color:'var(--muted)', marginBottom:'4px', letterSpacing:'0.1em' } }, label));
        var myItems = items.filter(function(t) {
          if (person === 'Both') return t.assignee === 'Both';
          return t.assignee === person;
        });
        if (!myItems.length) {
          col.appendChild(h('div', { style:{ fontSize:'11px', color:'var(--muted)', fontStyle:'italic' } }, 'None'));
        }
        myItems.forEach(function(t) {
          var isDone = t.status === 'DONE';
          col.appendChild(h('div', {
            className:'trk-due-item' + (isDone ? ' trk-done-item' : ''),
            onClick: function(){ showDetail(t.id); }
          },
            wsDot(t.workstream, 6),
            h('span', { style: isDone ? { textDecoration:'line-through', opacity:'0.4' } : {} }, t.title),
            h('span', { className:'trk-mono', style:{ color:'var(--muted)', fontSize:'8px', marginLeft:'auto', opacity: isDone ? '0.3' : '1' } }, fmtShort(t.dueDate))
          ));
        });
        cols.appendChild(col);
      });

      card.appendChild(cols);
      return card;
    }

    // Beginning This Week — two columns
    if (beginItems.length) {
      wrap.appendChild(renderTwoColTasks(beginItems, 'Beginning This Week'));
    }

    // Due This Week — two columns
    var dueItems2 = dueItems.sort(function(a,b){ return parseD(a.dueDate) - parseD(b.dueDate); });
    if (dueItems2.length) {
      wrap.appendChild(renderTwoColTasks(dueItems2, 'Due in Next 7 Days'));
    }

    // Second row: Meeting items, Action items, Open questions
    var row2 = h('div', { style:{ display:'flex', gap:'12px', marginBottom:'12px', flexWrap:'wrap' } });

    function renderEditableList(title, dataKey) {
      var card = h('div', { className:'trk-card', style:{ flex:'1', minWidth:'200px', padding:'12px 16px' } });
      card.appendChild(h('div', { className:'trk-mono', style:{ color:'var(--front)', marginBottom:'6px' } }, title));
      var fd = loadFocusData();
      var items = fd[dataKey] || [];
      var list = h('div', { style:{ display:'flex', flexDirection:'column', gap:'2px' } });

      items.forEach(function(item, i) {
        var isDone = item.done;
        var row = h('div', { style:{ display:'flex', alignItems:'center', gap:'6px', opacity: isDone ? '0.4' : '1' } });
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = isDone;
        cb.style.accentColor = 'var(--front)';
        cb.style.cursor = 'pointer';
        cb.addEventListener('change', function() {
          var fd2 = loadFocusData();
          fd2[dataKey][i].done = !fd2[dataKey][i].done;
          saveFocusData(fd2);
          renderTracker();
        });
        row.appendChild(cb);
        var inp = h('input', {
          className:'trk-focus-input',
          type:'text',
          value: item.text || '',
          style: isDone ? { textDecoration:'line-through', color:'var(--muted)' } : {},
          onInput: function(e) {
            var fd2 = loadFocusData();
            fd2[dataKey][i].text = e.target.value;
            saveFocusData(fd2);
          }
        });
        row.appendChild(inp);
        row.appendChild(h('button', {
          className:'trk-focus-del',
          onClick: function() {
            var fd2 = loadFocusData();
            fd2[dataKey].splice(i, 1);
            saveFocusData(fd2);
            renderTracker();
          }
        }, '\u2715'));
        list.appendChild(row);
      });

      card.appendChild(list);
      card.appendChild(h('button', {
        className:'trk-focus-add',
        onClick: function() {
          var fd2 = loadFocusData();
          if (!fd2[dataKey]) fd2[dataKey] = [];
          fd2[dataKey].push({ text: '', done: false });
          saveFocusData(fd2);
          renderTracker();
        }
      }, '+ Add'));
      return card;
    }

    row2.appendChild(renderEditableList('Items for Next Meeting', 'meetingItems'));
    row2.appendChild(renderEditableList('New Action Items', 'actionItems'));
    row2.appendChild(renderEditableList('Open Questions', 'openQuestions'));

    var outer = h('div');
    outer.appendChild(wrap);
    outer.appendChild(row2);
    return outer;
  }

  /* ── Workstream Filter Buttons ── */
  function renderWorkstreamFilters() {
    var pills = h('div', { className:'trk-pills', style:{ marginBottom:'8px' } });

    // ALL button
    var allBtn = h('button', {
      className: 'trk-ws-pill' + (filterWorkstream === 'ALL' ? ' active' : ''),
      style: {
        borderColor: 'var(--border)',
        color: filterWorkstream === 'ALL' ? '#fff' : 'var(--muted)',
        background: filterWorkstream === 'ALL' ? 'var(--front)' : 'transparent'
      },
      onClick: function(){ filterWorkstream = 'ALL'; renderTracker(); }
    }, 'All');
    pills.appendChild(allBtn);

    Object.keys(WORKSTREAMS).forEach(function(ws) {
      var wsData = WORKSTREAMS[ws];
      var isActive = filterWorkstream === ws;
      pills.appendChild(h('button', {
        className: 'trk-ws-pill' + (isActive ? ' active' : ''),
        style: {
          borderColor: wsData.dot,
          color: isActive ? '#fff' : wsData.dot,
          background: isActive ? wsData.dot : 'transparent'
        },
        onClick: function(){ filterWorkstream = ws; renderTracker(); }
      }, ws));
    });

    // Assignee filter pills
    pills.appendChild(h('span', { style:{ width:'1px', height:'16px', background:'var(--border)', margin:'0 8px', display:'inline-block', verticalAlign:'middle' } }));

    ['ALL','Brooke','Del','Both'].forEach(function(a) {
      var isActive = filterAssignee === a;
      var label = a === 'ALL' ? 'Everyone' : a === 'Both' ? 'Brooke & Del' : a;
      pills.appendChild(h('button', {
        className: 'trk-ws-pill' + (isActive ? ' active' : ''),
        style: {
          borderColor: 'var(--border)',
          color: isActive ? '#fff' : 'var(--muted)',
          background: isActive ? 'var(--muted)' : 'transparent'
        },
        onClick: function(){ filterAssignee = a; renderTracker(); }
      }, label));
    });

    return pills;
  }

  function matchesAssigneeFilter(task) {
    if (filterAssignee === 'ALL') return true;
    if (filterAssignee === 'Brooke') return task.assignee === 'Brooke' || task.assignee === 'Both';
    if (filterAssignee === 'Del') return task.assignee === 'Del' || task.assignee === 'Both';
    if (filterAssignee === 'Both') return task.assignee === 'Both';
    return true;
  }

  /* ── View Switcher ── */
  function renderViewSwitcher() {
    var bar = h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px', flexWrap:'wrap', gap:'8px' } });

    var btns = h('div', { style:{ display:'flex', gap:'4px' } });
    [['timeline','Timeline'],['board','Board'],['list','List']].forEach(function(pair) {
      btns.appendChild(h('button', {
        className: 'trk-btn' + (currentView === pair[0] ? ' active' : ''),
        onClick: function(){ currentView = pair[0]; renderTracker(); }
      }, pair[1]));
    });
    bar.appendChild(btns);

    bar.appendChild(h('button', {
      className:'trk-btn', style:{ color:'var(--front)', borderColor:'var(--front-border)' },
      onClick: addNewTask
    }, '+ New Task'));

    return bar;
  }

  /* ═══════════════════════════════════════════
     BOARD VIEW
  ═══════════════════════════════════════════ */
  function renderBoard() {
    var statuses = ['TODO', 'IN PROGRESS', 'DONE'];
    var grid = h('div', { className:'trk-board' });

    statuses.forEach(function(status) {
      var col = h('div');
      var colTasks = tasks.filter(function(t){
        return t.status === status && (filterWorkstream === 'ALL' || t.workstream === filterWorkstream) && matchesAssigneeFilter(t);
      }).sort(function(a,b){ return parseD(a.dueDate) - parseD(b.dueDate); });
      var count = colTasks.length;
      col.appendChild(h('div', { className:'trk-col-header' }, status + ' (' + count + ')'));

      if (status === 'DONE') {
        colTasks.forEach(function(t){ col.appendChild(renderTaskCard(t)); });
      } else {
        var ws = weekStart(todayDate());
        var nextWs = new Date(ws); nextWs.setDate(nextWs.getDate() + 7);
        var nextNextWs = new Date(ws); nextNextWs.setDate(nextNextWs.getDate() + 14);
        var groups = { thisWeek:[], nextWeek:[], later:[] };
        colTasks.forEach(function(t) {
          var dd = parseD(t.dueDate);
          if (dd < nextWs) groups.thisWeek.push(t);
          else if (dd < nextNextWs) groups.nextWeek.push(t);
          else groups.later.push(t);
        });
        function addGroup(label, items) {
          if (!items.length) return;
          col.appendChild(h('div', { className:'trk-week-sep' }, label));
          items.forEach(function(t){ col.appendChild(renderTaskCard(t)); });
        }
        addGroup('Due this week', groups.thisWeek);
        addGroup('Due next week', groups.nextWeek);
        addGroup('Later', groups.later);
      }
      grid.appendChild(col);
    });
    return grid;
  }

  function renderTaskCard(t) {
    var shouldHaveStarted = t.status === 'TODO' && parseD(t.startDate) <= todayDate();
    return h('div', {
      className: 'trk-card trk-task-card' + (selectedTaskId === t.id ? ' selected' : ''),
      onClick: function(){ showDetail(t.id); }
    },
      h('div', { style:{ display:'flex', alignItems:'flex-start', gap:'6px', marginBottom:'4px' } },
        shouldHaveStarted ? h('span', { className:'trk-warning', title:'Should have started' }) : null,
        t.isMilestone ? diamondIcon(8) : wsDot(t.workstream),
        h('span', { className:'trk-task-title' }, t.title)
      ),
      h('div', { className:'trk-task-meta' },
        h('span', { className:'trk-mono', style:{ color:'var(--muted)', fontSize:'8px' } }, fmtShort(t.dueDate)),
        h('span', { className:'trk-mono', style:{ color:'var(--muted)', fontSize:'8px' } }, t.assignee),
        priorityBadge(t.priority)
      )
    );
  }

  /* ═══════════════════════════════════════════
     LIST VIEW
  ═══════════════════════════════════════════ */
  function renderList() {
    var wrap = h('div');

    // Search
    var searchInput = h('input', {
      className:'trk-input', type:'text', placeholder:'Search tasks...',
      value: searchQuery,
      style:{ maxWidth:'300px', fontFamily:"'DM Mono',monospace", fontSize:'11px', marginBottom:'12px' },
      onInput: function(e){ searchQuery = e.target.value; renderTracker(); }
    });
    wrap.appendChild(searchInput);

    // Filter + sort
    var filtered = tasks.slice();
    if (filterWorkstream !== 'ALL') filtered = filtered.filter(function(t){ return t.workstream === filterWorkstream; });
    filtered = filtered.filter(matchesAssigneeFilter);
    if (searchQuery) {
      var q = searchQuery.toLowerCase();
      filtered = filtered.filter(function(t){ return t.title.toLowerCase().indexOf(q) !== -1 || (t.notes || '').toLowerCase().indexOf(q) !== -1; });
    }
    filtered.sort(function(a, b) {
      var va, vb;
      if (listSortField === 'title') { va = a.title.toLowerCase(); vb = b.title.toLowerCase(); return listSortAsc ? (va < vb ? -1 : va > vb ? 1 : 0) : (vb < va ? -1 : vb > va ? 1 : 0); }
      if (listSortField === 'priority') { var po = {HIGH:0,MED:1,LOW:2}; va = po[a.priority]; vb = po[b.priority]; }
      else if (listSortField === 'dueDate') { va = parseD(a.dueDate).getTime(); vb = parseD(b.dueDate).getTime(); }
      else if (listSortField === 'workstream') { va = a.workstream; vb = b.workstream; return listSortAsc ? (va < vb ? -1 : va > vb ? 1 : 0) : (vb < va ? -1 : vb > va ? 1 : 0); }
      else if (listSortField === 'status') { var so = {'TODO':0,'IN PROGRESS':1,'DONE':2}; va = so[a.status]; vb = so[b.status]; }
      else if (listSortField === 'assignee') { va = a.assignee; vb = b.assignee; return listSortAsc ? (va < vb ? -1 : va > vb ? 1 : 0) : (vb < va ? -1 : vb > va ? 1 : 0); }
      else { va = parseD(a.dueDate).getTime(); vb = parseD(b.dueDate).getTime(); }
      return listSortAsc ? va - vb : vb - va;
    });

    var table = h('table', { className:'trk-list-table' });

    function sortHeader(label, field) {
      var arrow = listSortField === field ? (listSortAsc ? ' \u25B2' : ' \u25BC') : '';
      return h('th', { onClick: function(){ if (listSortField === field) listSortAsc = !listSortAsc; else { listSortField = field; listSortAsc = true; } renderTracker(); } }, label + arrow);
    }

    table.appendChild(h('thead', null,
      h('tr', null,
        h('th', null, ''),
        sortHeader('Title', 'title'),
        sortHeader('Workstream', 'workstream'),
        sortHeader('Status', 'status'),
        sortHeader('Priority', 'priority'),
        sortHeader('Assignee', 'assignee'),
        sortHeader('Due', 'dueDate'),
        h('th', null, 'Progress')
      )
    ));

    var tbody = h('tbody');
    filtered.forEach(function(t) {
      var stDone = (t.subtasks || []).filter(function(s){ return s.done; }).length;
      var stTotal = (t.subtasks || []).length;
      var progress = stTotal ? Math.round(stDone / stTotal * 100) + '%' : (t.status === 'DONE' ? '100%' : '\u2014');
      var statusColor = t.status === 'DONE' ? '#1D9E75' : t.status === 'IN PROGRESS' ? 'var(--front)' : 'var(--muted)';

      tbody.appendChild(h('tr', {
        className: 'trk-list-row' + (selectedTaskId === t.id ? ' selected' : ''),
        onClick: function(){ showDetail(t.id); }
      },
        h('td', null, t.isMilestone ? diamondIcon(8) : wsDot(t.workstream)),
        h('td', null, t.title),
        h('td', { style:{ fontFamily:"'DM Mono',monospace", fontSize:'9px', letterSpacing:'0.08em', textTransform:'uppercase' } }, t.workstream),
        h('td', null, h('span', { style:{ fontFamily:"'DM Mono',monospace", fontSize:'9px', letterSpacing:'0.08em', textTransform:'uppercase', color:statusColor } }, t.status)),
        h('td', null, priorityBadge(t.priority)),
        h('td', { style:{ fontFamily:"'DM Mono',monospace", fontSize:'9px' } }, t.assignee),
        h('td', { style:{ fontFamily:"'DM Mono',monospace", fontSize:'9px', whiteSpace:'nowrap' } }, fmtShort(t.dueDate)),
        h('td', { style:{ fontFamily:"'DM Mono',monospace", fontSize:'9px' } }, progress)
      ));
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  /* ═══════════════════════════════════════════
     TIMELINE VIEW (Gantt)
  ═══════════════════════════════════════════ */
  function renderTimeline() {
    var wrap = h('div');

    // Zoom controls
    var zoomRow = h('div', { style:{ display:'flex', justifyContent:'flex-end', gap:'4px', marginBottom:'8px', alignItems:'center' } });
    zoomRow.appendChild(h('button', { className:'trk-btn', onClick:function(){ timelineZoom = Math.max(0.3, timelineZoom - 0.2); renderTracker(); } }, '\u2212'));
    zoomRow.appendChild(h('span', { className:'trk-mono', style:{ padding:'4px 8px', color:'var(--muted)' } }, Math.round(timelineZoom * 100) + '%'));
    zoomRow.appendChild(h('button', { className:'trk-btn', onClick:function(){ timelineZoom = Math.min(3, timelineZoom + 0.2); renderTracker(); } }, '+'));
    zoomRow.appendChild(h('button', { className:'trk-btn', style:{ marginLeft:'8px' }, onClick:function(){ timelineZoom = 1; renderTracker(); } }, 'Reset'));
    wrap.appendChild(zoomRow);

    var projStart = '2026-03-30';
    // Add 2 day buffer after last phase so Close is fully visible
    var lastPhaseEnd = parseD(PHASES[PHASES.length - 1].end);
    lastPhaseEnd.setDate(lastPhaseEnd.getDate() + 2);
    var projEnd = lastPhaseEnd.getFullYear() + '-' + String(lastPhaseEnd.getMonth()+1).padStart(2,'0') + '-' + String(lastPhaseEnd.getDate()).padStart(2,'0');
    var totalDays = daysBetween(projStart, projEnd);
    var labelWidth = 150;

    // At 100% zoom, chart fills the container width minus the label column
    var container = h('div', { className:'trk-card', style:{ overflow:'hidden' } });
    var scrollArea = h('div', { className:'trk-timeline-wrap', style:{ overflowX:'auto', position:'relative' } });

    // Calculate available width (use container's width or fallback)
    var el = document.getElementById('front-schedule');
    var availWidth = (el ? el.offsetWidth : window.innerWidth) - labelWidth - 80;
    var baseWidth = Math.max(availWidth, 600);
    var chartWidth = Math.round(baseWidth * timelineZoom);
    var dayWidth = chartWidth / totalDays;

    // Phase header — full width with dates
    var phaseHeader = h('div', { style:{ display:'flex', height:'44px', marginLeft:labelWidth+'px', width:chartWidth+'px', position:'relative' } });
    PHASES.forEach(function(phase) {
      var left = Math.max(0, daysBetween(projStart, phase.start)) * dayWidth;
      var width = daysBetween(phase.start, phase.end) * dayWidth;
      phaseHeader.appendChild(h('div', { style:{ position:'absolute', left:left+'px', width:(width+1)+'px', height:'100%', background:phase.color, opacity:'0.2' } }));
      var phaseStartFmt = fmtShort(phase.start);
      var phaseEndFmt = fmtShort(phase.end);
      // Always show name
      phaseHeader.appendChild(h('div', { style:{ position:'absolute', left:(left+6)+'px', top:'4px', fontSize:'12px', fontFamily:"'DM Mono',monospace", fontWeight:'700', letterSpacing:'0.08em', textTransform:'uppercase', color:phase.color, whiteSpace:'nowrap', pointerEvents:'none', lineHeight:'1' } },
        phase.name
      ));
      // Always show dates
      phaseHeader.appendChild(h('div', { style:{ position:'absolute', left:(left+6)+'px', top:'20px', fontSize:'9px', fontFamily:"'DM Mono',monospace", letterSpacing:'0.06em', color:phase.color, opacity:'0.8', whiteSpace:'nowrap', pointerEvents:'none' } },
        phaseStartFmt + ' \u2013 ' + phaseEndFmt
      ));
    });
    scrollArea.appendChild(phaseHeader);

    // Date markers header — more frequent markers
    var monthHeader = h('div', { style:{ display:'flex', height:'26px', marginLeft:labelWidth+'px', width:chartWidth+'px', position:'relative', borderBottom:'1px solid var(--border)' } });
    var lastLabel = -999;
    for (var d = 0; d < totalDays; d++) {
      var dt = new Date(parseD(projStart)); dt.setDate(dt.getDate() + d);
      var dayOfMonth = dt.getDate();

      // Show label on 1st and 15th of each month, or every Monday if zoomed in
      var showLabel = false;
      if (dayOfMonth === 1 || dayOfMonth === 15) showLabel = true;
      if (timelineZoom >= 1.5 && dt.getDay() === 1) showLabel = true;
      if (timelineZoom >= 2.5 && (dayOfMonth % 3 === 1)) showLabel = true;

      if (showLabel && (d - lastLabel) * dayWidth > 40) {
        var ml = dt.toLocaleDateString('en-US', { month:'short' });
        monthHeader.appendChild(h('div', { className:'trk-mono', style:{ position:'absolute', left:(d*dayWidth)+'px', top:'2px', fontSize:'10px', color:'var(--muted)', whiteSpace:'nowrap', fontWeight: dayOfMonth === 1 ? '700' : '400' } }, ml + ' ' + dayOfMonth));
        monthHeader.appendChild(h('div', { style:{ position:'absolute', left:(d*dayWidth)+'px', top:'16px', width:'1px', height:'8px', background:'var(--border)' } }));
        lastLabel = d;
      }

      if (dt.getDay() === 1) {
        monthHeader.appendChild(h('div', { style:{ position:'absolute', left:(d*dayWidth)+'px', bottom:'0', width:'1px', height:'6px', background:'var(--border)' } }));
      }
    }
    scrollArea.appendChild(monthHeader);

    // Major milestone lane (above workstream rows)
    var majorTasks = tasks.filter(function(t) { return t.isMajorMilestone; })
      .sort(function(a,b) { return parseD(a.dueDate) - parseD(b.dueDate); });
    var milestoneLane = h('div', { style:{ position:'relative', height:'50px', marginLeft:labelWidth+'px', width:chartWidth+'px', borderBottom:'1px solid var(--border)' } });

    // Stagger overlapping labels
    var prevRight = -999;
    var staggerRow = 0;
    majorTasks.forEach(function(mt) {
      var mOff = daysBetween(projStart, mt.dueDate);
      var mLeft = mOff * dayWidth;
      var topOffset = 4;
      if (mLeft - prevRight < 80) { staggerRow = (staggerRow + 1) % 2; topOffset = 4 + staggerRow * 20; }
      else { staggerRow = 0; }

      // Diamond
      milestoneLane.appendChild(h('div', {
        className:'trk-timeline-milestone major' + (selectedTaskId === mt.id ? ' selected' : ''),
        style:{ left:(mLeft - 9)+'px', top:topOffset+'px', width:'18px', height:'18px', background:'var(--front)', cursor:'pointer', zIndex:'6' },
        onClick: function(){ showDetail(mt.id); }
      }));
      // Label
      milestoneLane.appendChild(h('div', {
        style:{ position:'absolute', left:(mLeft + 14)+'px', top:(topOffset + 2)+'px', fontSize:'9px', fontFamily:"'DM Mono',monospace", fontWeight:'700', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--front)', whiteSpace:'nowrap', cursor:'pointer', zIndex:'6' },
        onClick: function(){ showDetail(mt.id); }
      }, mt.title));
      prevRight = mLeft + 80;
    });
    scrollArea.appendChild(milestoneLane);

    // Body
    var body = h('div', { style:{ position:'relative' } });

    // Phase background bands
    PHASES.forEach(function(phase) {
      var left = Math.max(0, daysBetween(projStart, phase.start)) * dayWidth + labelWidth;
      var width = daysBetween(phase.start, phase.end) * dayWidth;
      body.appendChild(h('div', { className:'trk-phase-band', style:{ left:left+'px', width:width+'px', background:phase.color } }));
    });

    // Major milestone vertical lines (full height, distinct color)
    majorTasks.forEach(function(mt) {
      var mOff = daysBetween(projStart, mt.dueDate);
      var mLeft = mOff * dayWidth + labelWidth;
      body.appendChild(h('div', { style:{ position:'absolute', left:mLeft+'px', top:'0', bottom:'0', width:'2px', background:'rgba(226,201,126,0.35)', zIndex:'2', pointerEvents:'none' } }));
    });

    // Today line
    var todayOffset = daysBetween(projStart, todayStr());
    if (todayOffset >= 0 && todayOffset <= totalDays) {
      body.appendChild(h('div', { className:'trk-timeline-today', style:{ left:(todayOffset * dayWidth + labelWidth)+'px' } }));
    }

    // Rows by workstream
    var barPositions = {};
    var rowIndex = 0;
    var pixelY = 0; // track actual pixel position
    var WS_ROW_HEIGHT = 32;
    var TASK_ROW_HEIGHT = 28;
    var wsOrder = Object.keys(WORKSTREAMS);

    wsOrder.forEach(function(ws) {
      // Apply workstream filter
      if (filterWorkstream !== 'ALL' && filterWorkstream !== ws) return;

      var wsTasks = tasks.filter(function(t){ return t.workstream === ws && matchesAssigneeFilter(t) && !t.isMajorMilestone; })
        .sort(function(a,b){ return parseD(a.startDate) - parseD(b.startDate); });
      if (!wsTasks.length) return;

      // Workstream label row — collapsible
      var wsColor = (WORKSTREAMS[ws] || {}).dot || '#888';
      var wsBg = (WORKSTREAMS[ws] || {}).bg || '#eee';
      var wsKey = ws.replace(/\s/g, '_');
      var isCollapsed = collapsedWorkstreams[wsKey];
      var labelRow = h('div', { className:'trk-timeline-ws-row', style:{ display:'flex', alignItems:'center', height:'32px', background:wsBg, opacity:'0.9', cursor:'pointer' },
        onClick: function() { collapsedWorkstreams[wsKey] = !collapsedWorkstreams[wsKey]; renderTracker(); }
      });
      labelRow.appendChild(h('span', { style:{ fontSize:'10px', color:wsColor, marginRight:'6px', display:'inline-block', transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)', transition:'transform 0.2s' } }, '\u25B6'));
      labelRow.appendChild(h('div', { className:'trk-timeline-ws-label', style:{ color:wsColor } }, wsDot(ws, 10), ws));
      labelRow.appendChild(h('span', { className:'trk-mono', style:{ marginLeft:'8px', fontSize:'9px', color:wsColor, opacity:'0.6' } }, wsTasks.length + ' tasks'));
      labelRow.appendChild(h('div', { style:{ flex:'1', height:'1px', background:wsColor, opacity:'0.3' } }));
      body.appendChild(labelRow);
      pixelY += WS_ROW_HEIGHT;
      rowIndex++;

      if (isCollapsed) return; // skip task rows if collapsed

      wsTasks.forEach(function(t) {
        var row = h('div', { className:'trk-timeline-row' });

        // Task label
        var taskLabel = h('div', {
          style:{ width:labelWidth+'px', minWidth:labelWidth+'px', paddingLeft:'16px', fontFamily:"'Cormorant Garamond',serif", fontSize:'11px', color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px' },
          title: t.title,
          onClick: function(){ showDetail(t.id); }
        });
        if (t.isMilestone) taskLabel.appendChild(diamondIcon(6));
        taskLabel.appendChild(document.createTextNode(t.title));
        row.appendChild(taskLabel);

        // Bar area
        var barArea = h('div', { style:{ position:'relative', width:chartWidth+'px', height:'28px' } });
        var startOff = daysBetween(projStart, t.startDate);
        var endOff = daysBetween(projStart, t.dueDate);
        var barLeft = startOff * dayWidth;
        var barWidth = Math.max(dayWidth, (endOff - startOff + 1) * dayWidth);
        var taskWsColor = (WORKSTREAMS[t.workstream] || {}).dot || '#888';

        if (t.isMilestone && startOff === endOff) {
          var mSize = t.isMajorMilestone ? 18 : 12;
          var mClass = 'trk-timeline-milestone' + (t.isMajorMilestone ? ' major' : '') + (selectedTaskId === t.id ? ' selected' : '');
          barArea.appendChild(h('div', {
            className: mClass,
            style:{ left:(barLeft + barWidth/2 - mSize/2)+'px', top:(t.isMajorMilestone ? '2px' : '8px'), width:mSize+'px', height:mSize+'px', background:t.isMajorMilestone ? 'var(--front)' : taskWsColor },
            onClick: function(){ showDetail(t.id); }
          }));
          if (t.isMajorMilestone) {
            barArea.appendChild(h('div', {
              style:{ position:'absolute', left:(barLeft + barWidth/2 + mSize/2 + 4)+'px', top:'5px', fontSize:'10px', fontFamily:"'DM Mono',monospace", fontWeight:'700', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--front)', whiteSpace:'nowrap', pointerEvents:'none' }
            }, t.title));
          }
        } else {
          var bar = h('div', {
            className: 'trk-timeline-bar' + (selectedTaskId === t.id ? ' selected' : ''),
            style:{ left:barLeft+'px', width:barWidth+'px', top:'7px', background:taskWsColor },
            title: t.title + ' (' + fmtShort(t.startDate) + ' \u2013 ' + fmtShort(t.dueDate) + ')',
            onClick: function(){ showDetail(t.id); }
          });
          if (t.isMilestone) { bar.style.border = '2px solid var(--front)'; }
          // Status indicator: done tasks get reduced opacity
          if (t.status === 'DONE') bar.style.opacity = '0.4';
          barArea.appendChild(bar);
        }

        row.appendChild(barArea);
        body.appendChild(row);

        barPositions[t.id] = { row: rowIndex, left: barLeft, right: barLeft + barWidth, cy: pixelY + TASK_ROW_HEIGHT / 2 };
        pixelY += TASK_ROW_HEIGHT;
        rowIndex++;
      });
    });

    // Dependency lines (SVG)
    // Add barPositions for major milestones (vertical line position)
    majorTasks.forEach(function(mt) {
      var mOff = daysBetween(projStart, mt.dueDate);
      var mLeft = mOff * dayWidth;
      // Major milestones connect at their vertical line, spanning full height
      barPositions[mt.id] = { row: 0, left: mLeft, right: mLeft, cy: 14, isMajorMilestone: true };
    });

    var totalHeight = pixelY + 28;
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', String(chartWidth + labelWidth));
    svg.setAttribute('height', String(totalHeight));
    svg.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:1;';

    tasks.forEach(function(t) {
      if (!t.deps || !t.deps.length) return;
      var to = barPositions[t.id];
      if (!to) return;

      t.deps.forEach(function(depId) {
        var from = barPositions[depId];
        if (!from) return;
        var fromTask = getTask(depId);
        var fromWsColor = (WORKSTREAMS[(fromTask || {}).workstream] || {}).dot || '#888';

        if (from.isMajorMilestone || to.isMajorMilestone) {
          // One side is a milestone — draw horizontal gold line at the regular task's y
          var milestonePos = from.isMajorMilestone ? from : to;
          var taskPos = from.isMajorMilestone ? to : from;
          var milestoneX = milestonePos.left + labelWidth;
          var taskY = taskPos.cy;
          // Line from task bar edge to milestone vertical, horizontally
          var taskEdgeX = from.isMajorMilestone ? taskPos.left + labelWidth : taskPos.right + labelWidth;

          var mLine = document.createElementNS(svgNS, 'line');
          mLine.setAttribute('x1', String(Math.min(milestoneX, taskEdgeX)));
          mLine.setAttribute('y1', String(taskY));
          mLine.setAttribute('x2', String(Math.max(milestoneX, taskEdgeX)));
          mLine.setAttribute('y2', String(taskY));
          mLine.setAttribute('stroke', 'rgba(226,201,126,0.5)');
          mLine.setAttribute('stroke-width', '2');
          svg.appendChild(mLine);

          // Gold circle at intersection with milestone vertical
          var mCircle = document.createElementNS(svgNS, 'circle');
          mCircle.setAttribute('cx', String(milestoneX));
          mCircle.setAttribute('cy', String(taskY));
          mCircle.setAttribute('r', '4');
          mCircle.setAttribute('fill', 'rgba(226,201,126,0.8)');
          svg.appendChild(mCircle);
        } else {
          // Regular task-to-task: color by SOURCE task's workstream
          var x1 = from.right + labelWidth;
          var y1 = from.cy;
          var x2 = to.left + labelWidth;
          var y2 = to.cy;
          var midX = (x1 + x2) / 2;

          var path = document.createElementNS(svgNS, 'path');
          path.setAttribute('d', 'M' + x1 + ',' + y1 + ' C' + midX + ',' + y1 + ' ' + midX + ',' + y2 + ' ' + x2 + ',' + y2);
          path.setAttribute('stroke', fromWsColor);
          path.setAttribute('stroke-width', '1.5');
          path.setAttribute('stroke-opacity', '0.4');
          path.setAttribute('fill', 'none');
          svg.appendChild(path);

          // Small circle at endpoint in source color
          var endCircle = document.createElementNS(svgNS, 'circle');
          endCircle.setAttribute('cx', String(x2));
          endCircle.setAttribute('cy', String(y2));
          endCircle.setAttribute('r', '3');
          endCircle.setAttribute('fill', fromWsColor);
          endCircle.setAttribute('fill-opacity', '0.5');
          svg.appendChild(endCircle);
        }
      });
    });
    body.appendChild(svg);
    body.style.minHeight = totalHeight + 'px';

    scrollArea.appendChild(body);
    container.appendChild(scrollArea);
    wrap.appendChild(container);
    return wrap;
  }

  /* ═══════════════════════════════════════════
     DETAIL PANEL
  ═══════════════════════════════════════════ */
  function renderDetail(id) {
    var t = getTask(id);
    if (!t) return h('div');

    var panel = h('div', { className:'trk-detail' });

    // Close
    panel.appendChild(h('button', { className:'trk-detail-close', onClick:function(){ closeDetail(); } }, '\u2715'));

    // ID badge
    panel.appendChild(h('div', { className:'trk-mono', style:{ color:'var(--muted)', marginBottom:'4px' } }, '#' + t.id));

    // Title
    panel.appendChild(h('label', null, 'Title'));
    panel.appendChild(h('input', {
      className:'trk-input', type:'text', value:t.title,
      onChange: function(e){ t.title = e.target.value; saveTasks(); }
    }));

    // Milestone badge
    if (t.isMilestone) {
      panel.appendChild(h('div', { style:{ display:'flex', alignItems:'center', gap:'6px', marginTop:'8px' } },
        diamondIcon(10),
        h('span', { className:'trk-mono', style:{ color:'var(--front)' } }, 'Milestone')
      ));
    }

    // Grid: status, priority, assignee, workstream
    var grid = h('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' } });

    // Status
    (function() {
      var w = h('div');
      w.appendChild(h('label', null, 'Status'));
      var sel = h('select', { className:'trk-select', onChange:function(e){ t.status = e.target.value; saveTasks(); renderTracker(); } });
      ['TODO','IN PROGRESS','DONE'].forEach(function(s) {
        var opt = h('option', { value:s }, s);
        if (t.status === s) opt.selected = true;
        sel.appendChild(opt);
      });
      w.appendChild(sel);
      grid.appendChild(w);
    })();

    // Priority
    (function() {
      var w = h('div');
      w.appendChild(h('label', null, 'Priority'));
      var sel = h('select', { className:'trk-select', onChange:function(e){ t.priority = e.target.value; saveTasks(); renderTracker(); } });
      ['HIGH','MED','LOW'].forEach(function(p) {
        var opt = h('option', { value:p }, p);
        if (t.priority === p) opt.selected = true;
        sel.appendChild(opt);
      });
      w.appendChild(sel);
      grid.appendChild(w);
    })();

    // Assignee
    (function() {
      var w = h('div');
      w.appendChild(h('label', null, 'Assignee'));
      var sel = h('select', { className:'trk-select', onChange:function(e){ t.assignee = e.target.value; saveTasks(); renderTracker(); } });
      ['Brooke','Del','Both'].forEach(function(a) {
        var opt = h('option', { value:a }, a);
        if (t.assignee === a) opt.selected = true;
        sel.appendChild(opt);
      });
      w.appendChild(sel);
      grid.appendChild(w);
    })();

    // Workstream
    (function() {
      var w = h('div');
      w.appendChild(h('label', null, 'Workstream'));
      var sel = h('select', { className:'trk-select', onChange:function(e){ t.workstream = e.target.value; saveTasks(); renderTracker(); } });
      Object.keys(WORKSTREAMS).forEach(function(ws) {
        var opt = h('option', { value:ws }, ws);
        if (t.workstream === ws) opt.selected = true;
        sel.appendChild(opt);
      });
      w.appendChild(sel);
      grid.appendChild(w);
    })();

    panel.appendChild(grid);

    // Dates
    var dateGrid = h('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' } });
    [['Start Date','startDate'],['Due Date','dueDate']].forEach(function(pair) {
      var dw = h('div');
      dw.appendChild(h('label', null, pair[0]));
      dw.appendChild(h('input', {
        className:'trk-input', type:'date', value: t[pair[1]] || '',
        style:{ fontFamily:"'DM Mono',monospace", fontSize:'10px' },
        onChange: function(e){ t[pair[1]] = e.target.value; saveTasks(); renderTracker(); }
      }));
      dateGrid.appendChild(dw);
    });
    panel.appendChild(dateGrid);

    // Notes
    panel.appendChild(h('label', null, 'Notes'));
    var notesArea = document.createElement('textarea');
    notesArea.className = 'trk-input';
    notesArea.rows = 3;
    notesArea.style.resize = 'vertical';
    notesArea.style.minHeight = '60px';
    notesArea.value = t.notes || '';
    notesArea.addEventListener('input', function(e){ t.notes = e.target.value; saveTasks(); });
    panel.appendChild(notesArea);

    // Depends On (Blocked By) — editable
    panel.appendChild(h('label', null, 'Depends On'));
    var depList = h('div', { style:{ display:'flex', flexDirection:'column', gap:'2px', marginBottom:'4px' } });
    (t.deps || []).forEach(function(depId) {
      var dep = getTask(depId);
      if (!dep) return;
      var row = h('div', { style:{ display:'flex', alignItems:'center', gap:'4px' } });
      row.appendChild(h('span', {
        className:'trk-dep-link',
        style:{ flex:'1' },
        onClick: function(){ showDetail(dep.id); }
      }, '#' + dep.id + ' ' + dep.title));
      row.appendChild(h('button', {
        className:'trk-subtask-del',
        title:'Remove dependency',
        onClick: function() {
          t.deps = t.deps.filter(function(d){ return d !== depId; });
          saveTasks();
          showDetail(t.id);
        }
      }, '\u2715'));
      depList.appendChild(row);
    });
    panel.appendChild(depList);
    // Add dependency — searchable
    var addDepWrap = h('div', { style:{ position:'relative' } });
    var depInput = h('input', {
      className:'trk-input', type:'text', placeholder:'Search to add dependency...',
      style:{ fontSize:'10px', width:'100%' }
    });
    var depDropdown = h('div', { style:{ display:'none', position:'absolute', top:'100%', left:'0', right:'0', maxHeight:'150px', overflowY:'auto', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'4px', zIndex:'20', boxShadow:'0 4px 12px rgba(0,0,0,0.2)' } });
    var availableDeps = tasks.filter(function(other) { return other.id !== t.id && (t.deps || []).indexOf(other.id) === -1; })
      .sort(function(a,b){ return a.id - b.id; });

    function renderDepResults(query) {
      depDropdown.innerHTML = '';
      var q = (query || '').toLowerCase();
      var matches = availableDeps.filter(function(other) {
        return !q || other.title.toLowerCase().indexOf(q) !== -1 || String(other.id).indexOf(q) !== -1 || (other.workstream || '').toLowerCase().indexOf(q) !== -1;
      }).slice(0, 15);
      if (!matches.length) {
        depDropdown.style.display = 'none';
        return;
      }
      depDropdown.style.display = 'block';
      matches.forEach(function(other) {
        var opt = h('div', {
          style:{ padding:'6px 10px', cursor:'pointer', fontSize:'11px', fontFamily:"'DM Mono',monospace", borderBottom:'1px solid var(--faint)', display:'flex', alignItems:'center', gap:'6px' },
          onMouseDown: function(e) {
            e.preventDefault();
            if (!t.deps) t.deps = [];
            t.deps.push(other.id);
            saveTasks();
            showDetail(t.id);
          }
        });
        opt.addEventListener('mouseenter', function(){ opt.style.background = 'var(--faint)'; });
        opt.addEventListener('mouseleave', function(){ opt.style.background = 'transparent'; });
        opt.appendChild(wsDot(other.workstream, 6));
        opt.appendChild(document.createTextNode('#' + other.id + ' ' + other.title));
        depDropdown.appendChild(opt);
      });
    }

    depInput.addEventListener('focus', function() { renderDepResults(depInput.value); });
    depInput.addEventListener('input', function() { renderDepResults(depInput.value); });
    depInput.addEventListener('blur', function() { setTimeout(function(){ depDropdown.style.display = 'none'; }, 200); });
    addDepWrap.appendChild(depInput);
    addDepWrap.appendChild(depDropdown);
    panel.appendChild(addDepWrap);

    // Blocks — removable (removes this task from the other task's deps)
    var blocks = taskBlocks(id);
    if (blocks.length) {
      panel.appendChild(h('label', { style:{ marginTop:'8px' } }, 'Blocks'));
      var blockList = h('div', { style:{ display:'flex', flexDirection:'column', gap:'2px' } });
      blocks.forEach(function(bl) {
        var row = h('div', { style:{ display:'flex', alignItems:'center', gap:'4px' } });
        row.appendChild(h('span', {
          className:'trk-dep-link',
          style:{ flex:'1' },
          onClick: function(){ showDetail(bl.id); }
        }, '#' + bl.id + ' ' + bl.title));
        row.appendChild(h('button', {
          className:'trk-subtask-del',
          title:'Remove — this task will no longer block #' + bl.id,
          onClick: function() {
            bl.deps = (bl.deps || []).filter(function(d){ return d !== id; });
            saveTasks();
            showDetail(t.id);
          }
        }, '\u2715'));
        blockList.appendChild(row);
      });
      panel.appendChild(blockList);
    }

    // Sub-tasks with drag reorder
    panel.appendChild(h('label', null, 'Sub-tasks'));
    var stList = h('div', { style:{ marginBottom:'8px' } });
    var _stDragIdx = null;
    (t.subtasks || []).forEach(function(st, i) {
      var stRow = h('div', {
        className:'trk-subtask-row',
        draggable: true,
        style:{ cursor:'grab' }
      });
      stRow.addEventListener('dragstart', function(e) {
        _stDragIdx = i;
        stRow.style.opacity = '0.4';
        e.dataTransfer.effectAllowed = 'move';
      });
      stRow.addEventListener('dragend', function() { stRow.style.opacity = '1'; _stDragIdx = null; });
      stRow.addEventListener('dragover', function(e) {
        e.preventDefault();
        stRow.style.borderTop = (e.offsetY < stRow.offsetHeight/2) ? '2px solid var(--front)' : 'none';
        stRow.style.borderBottom = (e.offsetY >= stRow.offsetHeight/2) ? '2px solid var(--front)' : 'none';
      });
      stRow.addEventListener('dragleave', function() { stRow.style.borderTop = 'none'; stRow.style.borderBottom = 'none'; });
      stRow.addEventListener('drop', function(e) {
        e.preventDefault();
        stRow.style.borderTop = 'none'; stRow.style.borderBottom = 'none';
        if (_stDragIdx === null || _stDragIdx === i) return;
        var item = t.subtasks.splice(_stDragIdx, 1)[0];
        var dropAfter = e.offsetY >= stRow.offsetHeight/2;
        var newIdx = dropAfter ? i + (_stDragIdx < i ? 0 : 1) : i - (_stDragIdx < i ? 1 : 0);
        t.subtasks.splice(Math.max(0, newIdx), 0, item);
        _stDragIdx = null;
        saveTasks();
        showDetail(t.id);
      });
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      if (st.done) cb.checked = true;
      cb.addEventListener('change', function(){ st.done = !st.done; saveTasks(); showDetail(t.id); });
      stRow.appendChild(h('span', { style:{ color:'var(--muted)', fontSize:'10px', cursor:'grab', marginRight:'4px' } }, '\u2630'));
      stRow.appendChild(cb);
      stRow.appendChild(h('span', { className:'trk-subtask-text' + (st.done ? ' done' : '') }, st.text));
      stRow.appendChild(h('button', { className:'trk-subtask-del', onClick:function(){ t.subtasks.splice(i, 1); saveTasks(); showDetail(t.id); } }, '\u2715'));
      stList.appendChild(stRow);
    });
    panel.appendChild(stList);

    // Add sub-task
    var addStRow = h('div', { style:{ display:'flex', gap:'4px' } });
    var stInput = h('input', { className:'trk-input', type:'text', placeholder:'New sub-task...', style:{ flex:'1', fontSize:'12px' } });
    addStRow.appendChild(stInput);
    addStRow.appendChild(h('button', { className:'trk-btn', onClick:function() {
      var val = stInput.value.trim();
      if (!val) return;
      if (!t.subtasks) t.subtasks = [];
      t.subtasks.push({ id: Date.now(), text: val, done: false });
      saveTasks();
      showDetail(t.id);
    } }, '+'));
    panel.appendChild(addStRow);

    // Delete
    panel.appendChild(h('div', { style:{ marginTop:'24px', paddingTop:'16px', borderTop:'1px solid var(--border)' } },
      h('button', {
        className:'trk-btn',
        style:{ color:'#E24B4A', borderColor:'rgba(226,75,74,0.3)' },
        onClick: function() {
          if (!confirm('Delete "' + t.title + '"?')) return;
          tasks = tasks.filter(function(x){ return x.id !== t.id; });
          tasks.forEach(function(x){ if (x.deps) x.deps = x.deps.filter(function(d){ return d !== t.id; }); });
          selectedTaskId = null;
          saveTasks();
          renderTracker();
        }
      }, 'Delete Task')
    ));

    return panel;
  }

  /* ── Add New Task ── */
  function addNewTask() {
    var id = nextId();
    var td = todayStr();
    tasks.push({
      id: id,
      title: 'New Task',
      workstream: 'Planning',
      status: 'TODO',
      priority: 'MED',
      assignee: 'Brooke',
      dueDate: td,
      startDate: td,
      dueDate: td,
      deps: [],
      notes: '',
      subtasks: [],
      isMilestone: false,
    });
    selectedTaskId = id;
    saveTasks();
    renderTracker();
  }

  /* ═══════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════ */
  function initTracker() {
    loadTasks();
    renderTracker();
    populateOverviewDates();
  }

  // Expose key dates so the overview page can read them directly
  var installPhase = PHASES.find(function(p) { return p.name === 'Install'; });
  var openPhase    = PHASES.find(function(p) { return p.name === 'Open'; });
  window.FRONT_KEY_DATES = {
    setup:        fmtShort(installPhase.start),
    opens:        fmtShort(OPENING_DATE),
    openingEvent: fmtShort(OPENING_DATE),
    closes:       fmtShort(openPhase.end),
  };

  function populateOverviewDates() {
    var kd = window.FRONT_KEY_DATES;
    var slots = {
      'ov-date-setup':   kd.setup,
      'ov-date-opens':   kd.opens,
      'ov-date-event':   kd.openingEvent,
      'ov-date-closes':  kd.closes,
    };
    Object.keys(slots).forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.textContent = slots[id];
    });

    // Populate "This week — what needs to happen" on overview, grouped by priority
    var ovWeek = document.getElementById('ov-week-from-schedule');
    if (ovWeek) {
      var weekItems = dueNext7Days().sort(function(a,b){ return parseD(a.dueDate) - parseD(b.dueDate); });
      if (!weekItems.length) {
        ovWeek.innerHTML = '<div style="font-size:11px;color:var(--muted);font-style:italic">Nothing due in the next 7 days</div>';
      } else {
        var priGroups = { HIGH: [], MED: [], LOW: [] };
        weekItems.forEach(function(t) {
          var p = t.priority || 'MED';
          if (!priGroups[p]) priGroups[p] = [];
          priGroups[p].push(t);
        });
        var priColors = { HIGH:'#E24B4A', MED:'var(--front)', LOW:'var(--muted)' };
        var priLabels = { HIGH:'High', MED:'Medium', LOW:'Low' };
        var whtml = '';
        ['HIGH','MED','LOW'].forEach(function(pri) {
          var items = priGroups[pri];
          if (!items || !items.length) return;
          whtml += '<div style="margin-top:8px"><div style="font-family:DM Mono,monospace;font-size:8px;letter-spacing:0.12em;text-transform:uppercase;color:' + priColors[pri] + ';margin-bottom:4px;padding-bottom:3px;border-bottom:1px solid var(--faint)">' + priLabels[pri] + '</div>';
          items.forEach(function(t) {
            var ws = WORKSTREAMS[t.workstream] || {};
            whtml += '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--faint)">' +
              '<div style="width:6px;height:6px;border-radius:50%;background:' + (ws.dot || '#888') + ';flex-shrink:0"></div>' +
              '<span style="font-family:Cormorant Garamond,serif;font-size:14px;flex:1">' + (t.title || '') + '</span>' +
              '<span style="font-family:DM Mono,monospace;font-size:9px;color:var(--muted)">' + fmtShort(t.dueDate) + '</span>' +
              '<span style="font-family:DM Mono,monospace;font-size:8px;color:var(--muted);min-width:40px;text-align:right">' + (t.assignee || '') + '</span>' +
            '</div>';
          });
          whtml += '</div>';
        });
        ovWeek.innerHTML = whtml;
      }
    }

    // Populate meeting/action/questions on overview
    var focusData = loadFocusData();
    [['meetingItems','ov-meeting-list'],['actionItems','ov-action-list'],['openQuestions','ov-questions-list']].forEach(function(pair) {
      var dataKey = pair[0], elId = pair[1];
      var el = document.getElementById(elId);
      if (!el) return;
      var items = focusData[dataKey] || [];
      var html = '';
      items.forEach(function(item, i) {
        var isDone = item.done;
        html += '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--faint);opacity:' + (isDone ? '0.4' : '1') + '">' +
          '<input type="checkbox"' + (isDone ? ' checked' : '') + ' style="accent-color:var(--front);cursor:pointer" onchange="ovToggleFocusItem(\'' + dataKey + '\',' + i + ')">' +
          '<input type="text" value="' + (item.text || '').replace(/"/g,'&quot;') + '" style="flex:1;background:none;border:none;color:var(--text);font-family:Cormorant Garamond,serif;font-size:13px;outline:none;' + (isDone ? 'text-decoration:line-through;color:var(--muted)' : '') + '" oninput="ovEditFocusItem(\'' + dataKey + '\',' + i + ',this.value)">' +
          '<button style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:12px;padding:0 4px" onclick="ovDelFocusItem(\'' + dataKey + '\',' + i + ')">✕</button>' +
        '</div>';
      });
      html += '<button style="background:none;border:none;color:var(--muted);font-family:DM Mono,monospace;font-size:9px;letter-spacing:0.1em;text-transform:uppercase;padding:8px 0;cursor:pointer" onclick="ovAddFocusItem(\'' + dataKey + '\')">+ Add</button>';
      el.innerHTML = html;
    });

    // Populate "Due in next 7 days" on overview
    var ovDue = document.getElementById('ov-due-next-7');
    if (ovDue) {
      var dueItems = dueNext7Days().sort(function(a,b){ return parseD(a.dueDate) - parseD(b.dueDate); });
      if (!dueItems.length) {
        ovDue.innerHTML = '<div style="font-size:11px;color:var(--muted);font-style:italic">Nothing due in the next 7 days</div>';
      } else {
        var html = '';
        dueItems.forEach(function(t) {
          var ws = WORKSTREAMS[t.workstream] || {};
          html += '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--faint);cursor:pointer" onclick="showTab(\'front\',\'schedule\',document.querySelector(\'[data-tab=schedule]\'))">' +
            '<div style="width:6px;height:6px;border-radius:50%;background:' + (ws.dot || '#888') + ';flex-shrink:0"></div>' +
            '<span style="font-family:Cormorant Garamond,serif;font-size:13px;flex:1">' + (t.title || '') + '</span>' +
            '<span style="font-family:DM Mono,monospace;font-size:8px;color:var(--muted)">' + fmtShort(t.dueDate) + '</span>' +
            '<span style="font-family:DM Mono,monospace;font-size:8px;color:var(--muted)">' + (t.assignee || '') + '</span>' +
          '</div>';
        });
        ovDue.innerHTML = html;
      }
    }
  }

  window.initTracker = initTracker;
  window.renderTracker = renderTracker;

  // Global helpers for overview focus items
  window.ovToggleFocusItem = function(key, i) {
    var fd = loadFocusData();
    if (fd[key] && fd[key][i]) { fd[key][i].done = !fd[key][i].done; saveFocusData(fd); populateOverviewDates(); }
  };
  window.ovEditFocusItem = function(key, i, val) {
    var fd = loadFocusData();
    if (fd[key] && fd[key][i]) { fd[key][i].text = val; saveFocusData(fd); }
  };
  window.ovDelFocusItem = function(key, i) {
    var fd = loadFocusData();
    if (fd[key]) { fd[key].splice(i, 1); saveFocusData(fd); populateOverviewDates(); }
  };
  window.ovAddFocusItem = function(key) {
    var fd = loadFocusData();
    if (!fd[key]) fd[key] = [];
    fd[key].push({ text: '', done: false });
    saveFocusData(fd);
    populateOverviewDates();
  };

  // Populate overview dates on page load (not just when Schedule tab opens)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', populateOverviewDates);
  } else {
    populateOverviewDates();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTracker);
  } else {
    initTracker();
  }

})();
