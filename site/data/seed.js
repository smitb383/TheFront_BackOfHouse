#!/usr/bin/env node
// ============================================
// Seed script: import workspace-data.json into Supabase
// ============================================
// Usage:
//   1. Export your data from the old workspace (↓ Export button)
//   2. Save the JSON file as data/export.json
//   3. Run: SUPABASE_URL=xxx SUPABASE_KEY=xxx node data/seed.js
//
// Or just run: npm run seed (after setting env vars)

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ygptkypwptsrnkwwqiox.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

if (!SUPABASE_KEY) {
  console.error('Set SUPABASE_KEY env var (use the service_role key for seeding)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Load the exported JSON
let raw;
try {
  // Try to read as plain JSON first
  raw = fs.readFileSync('data/export.json', 'utf8');
} catch (e) {
  console.error('Place your exported JSON at data/export.json');
  process.exit(1);
}

let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  // If it's an RTF file, try to extract the JSON from it
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    // Clean RTF escape sequences
    let cleaned = match[0]
      .replace(/\\'/[0-9a-f]{2}/g, '') // RTF hex escapes
      .replace(/\\'97/g, '—')
      .replace(/\\'96/g, '–')
      .replace(/\\'d7/g, '×')
      .replace(/\\'9615/g, '–')
      .replace(/\\n/g, '\n');
    data = JSON.parse(cleaned);
  } else {
    console.error('Could not parse JSON from file');
    process.exit(1);
  }
}

async function seed() {
  console.log('Starting seed...');

  // ── Key-Value pairs (business plan, brand identity, settings, etc.) ──
  const kvKeys = Object.keys(data).filter(k =>
    typeof data[k] === 'string' ||
    (typeof data[k] === 'object' && !Array.isArray(data[k]) && data[k] !== null)
  );

  // Special handling for nested objects that should be flattened to KV
  const kvPairs = [];

  // front_bp_v1 is a big object of business plan fields
  if (data.front_bp_v1) {
    Object.keys(data.front_bp_v1).forEach(k => {
      kvPairs.push({ key: k, value: data.front_bp_v1[k] });
    });
  }

  // today focus
  if (data.today_front_v1) {
    kvPairs.push({ key: 'today_front_v1', value: data.today_front_v1 });
  }

  // Any remaining simple KV data
  if (data.ws_anthropic_key) {
    kvPairs.push({ key: 'ws_anthropic_key', value: data.ws_anthropic_key });
  }

  if (kvPairs.length) {
    const { error } = await supabase.from('kv_store').upsert(kvPairs, { onConflict: 'key' });
    if (error) console.error('KV insert error:', error);
    else console.log(`  ✓ ${kvPairs.length} KV pairs`);
  }

  // ── Vendors ──
  const frontVendors = (data.front_vendors_v1 || []).map(v => ({
    ...v,
    commission_rate: v.commissionRate || '',
    cycles_participated: v.cyclesParticipated || '',
    workspace: 'front'
  }));
  const popupVendors = (data.popup_vendors_v1 || []).map(v => ({
    ...v,
    commission_rate: v.fee || '',
    workspace: 'front'
  }));
  const allVendors = [...frontVendors, ...popupVendors];

  if (allVendors.length) {
    // Clean for DB schema
    const cleaned = allVendors.map(v => ({
      id: v.id,
      name: v.name || '',
      medium: v.medium || v.discipline || '',
      discipline: v.discipline || v.medium || '',
      status: v.status || 'prospect',
      email: v.email || '',
      instagram: v.instagram || '',
      website: v.website || '',
      commission_rate: v.commission_rate || '',
      notes: v.notes || '',
      cycles_participated: v.cycles_participated || '',
      fee: v.fee || '',
      photos: JSON.stringify(v.photos || []),
      workspace: v.workspace || 'front'
    }));
    const { error } = await supabase.from('vendors').upsert(cleaned, { onConflict: 'id' });
    if (error) console.error('Vendors insert error:', error);
    else console.log(`  ✓ ${cleaned.length} vendors`);
  }

  // ── Tasks ──
  const tasks = [
    ...(data.tasks_front_v1 || []).map(t => ({ ...t, workspace: 'front' })),
    ...(data.tasks_fog_v1 || []).map(t => ({ ...t, workspace: 'fog' }))
  ];
  const tracker = (data.tracker_front_v1 || []).map(t => ({
    id: t.id,
    title: t.title || '',
    text: t.title || '',
    notes: t.notes || '',
    cat: t.cat || '',
    due: t.due || '',
    done: t.done || false,
    workspace: 'front'
  }));
  const allTasks = [...tasks.map(t => ({
    id: t.id,
    text: t.text || '',
    done: t.done || false,
    workspace: t.workspace
  })), ...tracker];

  if (allTasks.length) {
    const { error } = await supabase.from('tasks').upsert(allTasks, { onConflict: 'id' });
    if (error) console.error('Tasks insert error:', error);
    else console.log(`  ✓ ${allTasks.length} tasks`);
  }

  // ── Budget Items ──
  const budgetTypes = {
    'budget_popup_v1': 'popup',
    'budget_upfront_v1': 'upfront',
    'budget_monthly_v1': 'monthly'
  };
  let allBudget = [];
  Object.keys(budgetTypes).forEach(key => {
    if (data[key]) {
      data[key].forEach(b => {
        allBudget.push({
          id: b.id,
          item: b.item || '',
          note: b.note || '',
          amt: b.amt || 0,
          cat: b.cat || '',
          budget_type: budgetTypes[key],
          workspace: 'front'
        });
      });
    }
  });

  if (allBudget.length) {
    const { error } = await supabase.from('budget_items').upsert(allBudget, { onConflict: 'id' });
    if (error) console.error('Budget insert error:', error);
    else console.log(`  ✓ ${allBudget.length} budget items`);
  }

  // ── Marketing Tasks ──
  if (data.mkt_tasks_v1) {
    let allMkt = [];
    Object.keys(data.mkt_tasks_v1).forEach(channel => {
      (data.mkt_tasks_v1[channel] || []).forEach(t => {
        allMkt.push({
          id: t.id,
          channel: channel,
          title: t.title || '',
          type: t.type || '',
          week: t.week || 'pre',
          done: t.done || false,
          workspace: 'front'
        });
      });
    });
    if (allMkt.length) {
      const { error } = await supabase.from('marketing_tasks').upsert(allMkt, { onConflict: 'id' });
      if (error) console.error('Marketing tasks insert error:', error);
      else console.log(`  ✓ ${allMkt.length} marketing tasks`);
    }
  }

  // ── Timeline ──
  if (data.vi_timeline_v1) {
    const timeline = data.vi_timeline_v1.map(t => ({
      id: t.id,
      title: t.title || '',
      phase: t.phase || '',
      start_date: t.startDate || null,
      end_date: t.endDate || null,
      notes: t.notes || '',
      workspace: 'fog'
    }));
    const { error } = await supabase.from('timeline_entries').upsert(timeline, { onConflict: 'id' });
    if (error) console.error('Timeline insert error:', error);
    else console.log(`  ✓ ${timeline.length} timeline entries`);
  }

  // ── Opening Budget ──
  if (data.cshb_open_v1) {
    const opening = data.cshb_open_v1.map(b => ({
      id: b.id,
      item: b.item || '',
      cat: b.cat || '',
      cost: b.cost || 0,
      notes: b.notes || '',
      workspace: 'front'
    }));
    const { error } = await supabase.from('opening_budget').upsert(opening, { onConflict: 'id' });
    if (error) console.error('Opening budget insert error:', error);
    else console.log(`  ✓ ${opening.length} opening budget items`);
  }

  // ── Swatches ──
  const swatches = [];
  if (data.vis_swatches_primary_v1) {
    data.vis_swatches_primary_v1.forEach(s => {
      swatches.push({ hex: s.hex, name: s.name, swatch_type: 'primary', workspace: 'front' });
    });
  }
  if (data.vis_swatches_accent_v1) {
    data.vis_swatches_accent_v1.forEach(s => {
      swatches.push({ hex: s.hex, name: s.name, swatch_type: 'accent', workspace: 'front' });
    });
  }
  if (swatches.length) {
    const { error } = await supabase.from('swatches').insert(swatches);
    if (error) console.error('Swatches insert error:', error);
    else console.log(`  ✓ ${swatches.length} swatches`);
  }

  console.log('\nSeed complete!');
}

seed().catch(console.error);
