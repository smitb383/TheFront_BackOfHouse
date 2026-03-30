-- ============================================
-- THE FRONT NYC — Supabase Schema
-- ============================================
-- Run this in your Supabase SQL Editor to set up all tables.
-- Dashboard > SQL Editor > New Query > Paste & Run

-- ── Key-Value Store (for simple fields: business plan text, brand identity, settings) ──
CREATE TABLE IF NOT EXISTS kv_store (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '""',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kv_store_updated
  BEFORE UPDATE ON kv_store
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ── Vendors ──
CREATE TABLE IF NOT EXISTS vendors (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  medium TEXT DEFAULT '',
  discipline TEXT DEFAULT '',
  status TEXT DEFAULT 'prospect',
  email TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  website TEXT DEFAULT '',
  commission_rate TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  cycles_participated TEXT DEFAULT '',
  fee TEXT DEFAULT '',
  photos JSONB DEFAULT '[]',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  workspace TEXT NOT NULL DEFAULT 'front',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER vendors_updated
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ── Tasks (project tracker) ──
CREATE TABLE IF NOT EXISTS tasks (
  id BIGINT PRIMARY KEY,
  text TEXT NOT NULL DEFAULT '',
  done BOOLEAN NOT NULL DEFAULT false,
  title TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  cat TEXT DEFAULT '',
  due TEXT DEFAULT '',
  type TEXT DEFAULT '',
  status TEXT DEFAULT '',
  priority TEXT DEFAULT '',
  workspace TEXT NOT NULL DEFAULT 'front',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER tasks_updated
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ── Budget Items ──
CREATE TABLE IF NOT EXISTS budget_items (
  id BIGINT PRIMARY KEY,
  item TEXT NOT NULL DEFAULT '',
  note TEXT DEFAULT '',
  amt NUMERIC NOT NULL DEFAULT 0,
  cat TEXT DEFAULT '',
  budget_type TEXT NOT NULL DEFAULT 'popup',
  workspace TEXT NOT NULL DEFAULT 'front',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER budget_items_updated
  BEFORE UPDATE ON budget_items
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ── Marketing Tasks ──
CREATE TABLE IF NOT EXISTS marketing_tasks (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  type TEXT DEFAULT '',
  week TEXT DEFAULT 'pre',
  done BOOLEAN NOT NULL DEFAULT false,
  workspace TEXT NOT NULL DEFAULT 'front',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER marketing_tasks_updated
  BEFORE UPDATE ON marketing_tasks
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ── Timeline Entries (Gantt-style) ──
CREATE TABLE IF NOT EXISTS timeline_entries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  phase TEXT DEFAULT '',
  start_date DATE,
  end_date DATE,
  notes TEXT DEFAULT '',
  workspace TEXT NOT NULL DEFAULT 'front',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER timeline_entries_updated
  BEFORE UPDATE ON timeline_entries
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ── Opening Budget (separate from recurring) ──
CREATE TABLE IF NOT EXISTS opening_budget (
  id TEXT PRIMARY KEY,
  item TEXT NOT NULL DEFAULT '',
  cat TEXT DEFAULT '',
  cost NUMERIC NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  workspace TEXT NOT NULL DEFAULT 'front',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Color Swatches ──
CREATE TABLE IF NOT EXISTS swatches (
  id SERIAL PRIMARY KEY,
  hex TEXT NOT NULL,
  name TEXT DEFAULT '',
  swatch_type TEXT NOT NULL DEFAULT 'primary',
  workspace TEXT NOT NULL DEFAULT 'front',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Violets: Materials ──
CREATE TABLE IF NOT EXISTS vi_materials (
  id BIGINT PRIMARY KEY,
  item TEXT DEFAULT '',
  supplier TEXT DEFAULT '',
  unit_price NUMERIC DEFAULT 0,
  qty NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'yd',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER vi_materials_updated
  BEFORE UPDATE ON vi_materials
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ── Violets: Labor ──
CREATE TABLE IF NOT EXISTS vi_labor (
  id BIGINT PRIMARY KEY,
  task TEXT DEFAULT '',
  hours NUMERIC DEFAULT 0,
  rate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Violets: Contacts ──
CREATE TABLE IF NOT EXISTS vi_contacts (
  id BIGINT PRIMARY KEY,
  name TEXT DEFAULT '',
  type TEXT DEFAULT 'other',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER vi_contacts_updated
  BEFORE UPDATE ON vi_contacts
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ── Violets: Production Tasks ──
CREATE TABLE IF NOT EXISTS vi_prod_tasks (
  id BIGINT PRIMARY KEY,
  title TEXT DEFAULT '',
  phase TEXT DEFAULT '',
  done BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER vi_prod_tasks_updated
  BEFORE UPDATE ON vi_prod_tasks
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ── Sales Log ──
CREATE TABLE IF NOT EXISTS sales_log (
  id BIGINT PRIMARY KEY,
  date DATE,
  vendor_name TEXT DEFAULT '',
  item_desc TEXT DEFAULT '',
  sale_price NUMERIC DEFAULT 0,
  commission_pct NUMERIC DEFAULT 30,
  commission_amt NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'card',
  notes TEXT DEFAULT '',
  workspace TEXT NOT NULL DEFAULT 'front',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY (open for now — tighten later)
-- ============================================
-- Enable RLS on all tables but allow all operations via anon key
-- This is fine for a private workspace; add auth later if needed

ALTER TABLE kv_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE swatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE vi_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE vi_labor ENABLE ROW LEVEL SECURITY;
ALTER TABLE vi_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vi_prod_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_log ENABLE ROW LEVEL SECURITY;

-- Open policies (both founders can read/write everything)
CREATE POLICY "Allow all" ON kv_store FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON budget_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON marketing_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON timeline_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON opening_budget FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON swatches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON vi_materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON vi_labor FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON vi_contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON vi_prod_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON sales_log FOR ALL USING (true) WITH CHECK (true);
