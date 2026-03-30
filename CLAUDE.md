# The Front NYC — Workspace

## What this is
A collaborative web dashboard for **The Front**, a curated retail popup store in NYC (334 Broome St, LES), and **Violets**, a textile/clothing collection by Del Musarra. This is the founders' shared planning-to-launch home base.

## Team
- **Brooke** and **Del Musarra** are co-founders
- The project was previously called "After Forever" — that name is retired
- Brand name is confirmed: **The Front**
- Primary font: **Bebas Neue** (branding), app uses **Cormorant Garamond** + **DM Mono**

## Tech stack
- **Frontend**: Vanilla HTML/CSS/JS (no framework). Single-page app with tab-based navigation.
- **Data**: Supabase (PostgreSQL) via `@supabase/supabase-js` CDN. Config in `js/data.js`.
- **Hosting**: Vercel (auto-deploys from GitHub `main` branch)
- **Maps**: Leaflet.js for vendor location maps
- **Fonts**: Google Fonts (Cormorant Garamond, DM Mono)

## Project structure
```
index.html          — Main SPA shell (landing + both workspaces)
css/styles.css      — All styles (dark/light mode, both workspaces)
js/
  app.js            — All application logic (navigation, rendering, event handlers)
  data.js           — Supabase client + data access layer (replaces localStorage)
supabase/
  schema.sql        — Database schema (run in Supabase SQL Editor)
data/
  seed.js           — Migration script from old JSON export to Supabase
docs/
  project-context.md — Full project brief for Claude Project knowledge
```

## Architecture
- Two workspaces share one app: "The Front" (gold/`--front` accent) and "Violets" (teal/`--fog` accent)
- Landing page is a split-screen chooser
- Each workspace has grouped tab navigation (group bar → sub-tabs)
- Data layer (`js/data.js`) provides `getData(key)` / `setData(key, value)` that reads/writes to Supabase with localStorage fallback
- All form fields use `data-key` attributes and auto-save on input

## Key data structures
- **kv_store**: Key-value pairs for all text fields (business plan, brand identity, settings)
- **vendors**: Vendor roster with photos, status, contacts
- **tasks**: Project tracker items with categories and due dates
- **budget_items**: Budget line items (popup, upfront, monthly types)
- **marketing_tasks**: Per-channel marketing tasks with week scheduling
- **timeline_entries**: Gantt-style timeline phases
- **sales_log**: Transaction records during the popup

## The Front workspace tabs
- **334 Broome**: Popup dashboard, budget, resources, revenue, vendors, marketing, events
- **Brand**: Brand identity, voice & story, visual identity, financials
- **Opportunities**: Chashama proposal and related sub-tabs
- **Work**: Project tracker, today view, roadmap, reflection tools

## Violets workspace tabs
- Ideation, Materials & Budget, Production, Contacts, Schedule

## Design system
- Dark mode default, light mode toggle
- CSS custom properties for all colors (see `:root` in styles.css)
- Gold (`--front: #e2c97e`) for The Front, teal (`--fog: #82bfbb`) for Violets
- Monospace UI labels (DM Mono 9px uppercase), serif content text (Cormorant Garamond)

## Important context
- Lease: June 18 – July 16, 2026, $3,500 flat
- Commission model: 70/30 split (vendor/store)
- Landlord: Amir Badawi / 334Broome / Patjen Realty Corp
- Insurance required: $2M GL aggregate
- POS: Square (2.6% fee)
- No LLC/EIN yet — in progress
