# Monarch WMS – Loading Logic & StatCard Component

## Overview
Documentation of the loading architecture and the StatCard component added to the dashboard.

---

## 1. Loading Logic

### How It Works
React Router with Vite code-splits each route into its own JS chunk at build time. The layout shell + current route load first; other tabs load **on demand** when navigated to.

| What loads | When |
|---|---|
| Layout shell (`AppLayout` + `Sidebar`) | Initial page load |
| Current route chunk (e.g. `home-DQVls2hq.js`) | Initial page load |
| Shared libs (`lib-BvlMHlRI.js`, `root-BNKxP_Vg.js`) | Initial page load |
| Other route chunks (Products, Assets, Goals, etc.) | On click (lazy-loaded) |

### Key Files
- `app/routes.ts` – route config using React Router's `layout` + `index` + `route`
- `app/routes/layout.tsx` – Layout wrapper, renders `<AppLayout>` + `<Outlet>`
- `app/components/layout/AppLayout.tsx` – Shell: sidebar + scrollable content area
- `app/components/layout/Sidebar.tsx` – Navigation sidebar with `NavLink` items

### Current State
- ❌ No `loader()` / `clientLoader()` in any route — no data fetching
- ❌ No Suspense boundaries — no loading spinners during chunk download
- ✅ User can navigate immediately; previous page stays visible while new chunk downloads

---

## 2. StatCard Component

### File: `app/components/ui/StatCard.tsx`

#### Props
| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Label shown above the value |
| `value` | `string \| number` | Yes | Raw number or pre-formatted string |
| `unit` | `"currency" \| "percent" \| "count"` | No | Controls display formatting |
| `icon` | `LucideIcon` | No | Icon rendered in upper-right corner |

#### Behavior
| `unit` value | Input | Output | Formatter |
|---|---|---|---|
| `"currency"` | `1000000` | `Rp 1.000.000` | `Intl.NumberFormat` (id-ID, IDR) |
| `"percent"` | `8.5` | `8,5%` | `Intl.NumberFormat` (id-ID, percent) |
| `"count"` | `12` | `12` | `Intl.NumberFormat` (id-ID) |
| _(omitted)_ | `"Rp 5.000.000"` | `Rp 5.000.000` | Raw string passthrough |

#### Visual Design
- White background (`bg-white`) with dark mode support
- `rounded-xl` + `border` + `shadow-sm`
- Title: small, gray text (`text-sm text-gray-500`)
- Value: large, bold text (`text-2xl font-bold`)

### Dashboard Integration: `app/routes/home.tsx`

The dashboard now renders a responsive grid of stat cards **above** a UI Primitives Test Area showcasing buttons and badges.

```tsx
// Header actions
<div className="flex items-center gap-2">
  <Btn variant="secondary" size="sm">Export Report</Btn>
  <Btn variant="primary" size="sm">
    <Plus className="w-4 h-4" /> Add Asset
  </Btn>
</div>

// Grid
<div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
  <StatCard title="Total Assets" value={1000000} unit="currency" icon={Wallet} />
  <StatCard title="Return Rate" value={8.5} unit="percent" icon={TrendingUp} />
  <StatCard title="Holdings" value={12} unit="count" icon={Layers} />
  <StatCard title="Custom Value" value="Rp 5.000.000" icon={DollarSign} />
</div>

// UI Test Cards
<Btn variant="primary">Primary</Btn>
<Badge variant="secondary">Moderate Risk</Badge>
```

### Grid Behavior (`auto-fit` + `minmax`)
- Cards automatically shrink to fit more per row
- Minimum card width: **200px**
- Maximum: expands to fill available space (`1fr`)
- Adding more cards compresses them; they wrap when hitting 200px minimum

#### Previous Grid (removed)
```css
grid-cols-1 md:grid-cols-2 lg:grid-cols-4
```
Fixed column counts — always 4 cards per row on desktop, 5th card wrapped at same size.

---

## 3. Files Changed

| File | Action |
|---|---|
| `app/components/ui/StatCard.tsx` | **Created** – Reusable stat card component |
| `app/components/ui/Badge.tsx` | **Created** – Semantic Badge tag component |
| `app/components/ui/Btn.tsx` | **Created** – Reusable semantic button |
| `app/routes/home.tsx` | **Modified** – Added imports + header actions + test gallery |
