# User Dashboard Feature — Code Review

> **Review scope:** User dashboard (new files): route, view, charts, stat card, API, store, portfolio service.  
> **Effort level:** High (8 finder angles × up to 6 candidates, 1-vote verify)  
> **Date:** 2026-07-15

---

## Summary

**6 CONFIRMED + 4 PLAUSIBLE findings.** The dashboard has one critical data-flow bug (empty products context kills recommendations & pie labels), one serious correctness bug (unit price used instead of total position for allocation — stocks off by 1000×), and pervasive UX fragility (silent error swallowing, fabricated portfolio history, NaN chart values, label mismatches).

---

## Findings (ranked most severe first)

### 1. Products array never populated — recommendations dead, pie labels all "Unknown"

**Severity: Critical** | **CONFIRMED**  
**File:** `app/routes/layout.tsx:29`  
**File:** `app/views/dashboard/DashboardView.tsx:55-59`

```tsx
// layout.tsx:29 — setter never exposed
const [products] = useState<Product[]>([]);
```

Layout context initializes `products` as an empty array and **never exposes or calls a setter** (`git grep "setProducts"` returns zero hits). The empty array flows through `Outlet` context to every child route:

```tsx
// DashboardView.tsx:55 — always empty
const recommended = products.filter((p) => p.visible && p.riskLevel <= maxRisk).slice(0, 4);

// DashboardView.tsx:58 — always returns undefined
const p = products.find((pr) => pr.id === a.productId);
```

**Impact:**
- "Recommended for You" section renders zero cards regardless of user risk profile
- All pie chart allocation labels show `"Unknown"` 
- "View All" button navigates to `/products` which is also empty

**Fix:** Destructure `setProducts` in layout.tsx and populate it from the backend (or connect the existing products store).

---

### 2. Pie chart uses unit price instead of total position — allocation percentages are wrong (stocks off by 1000×)

**Severity: Critical** | **CONFIRMED**  
**File:** `app/views/dashboard/DashboardView.tsx:57-60`

The pie chart is meant to show **portfolio composition** — what percentage of your total portfolio value is in stocks, bonds, mutual funds, sukuk, etc. But the implementation uses the wrong source value.

```tsx
const allocationData = myAssets.map((a) => {
  const p = products.find((pr) => pr.id === a.productId);
  return { name: p?.name.split("–")[0].trim() ?? "Unknown", value: a.currentValue, type: p?.type };
});
```

`a.currentValue` on an `Asset` is a **unit price** (set to `txPrice` in `processTransaction`), not the total position value. So the percentage each product type represents of the total portfolio is computed from unit prices, not from actual position sizes. The existing `PortfolioService.calculateCurrentValue()` correctly computes total position:

| Product type | Formula | Unit price 1500, qty 10 → |
|---|---|---|
| Stock | `qty × 100 × currentValue` | **1,500,000** (dashboard shows: 1,500) |
| Mutual fund / money market | `qty × currentValue` | 15,000 (dashboard shows: 1,500) |
| Bond | `(qty ?? amount) × (currentValue / 100)` | varies |
| Deposit | `amount` | correct (no multiplier) |

**Impact:** If a user holds Rp 150M in stocks and Rp 50M in deposits, the pie reports stocks at Rp 1,500 (≈ 3%) and deposits at Rp 50M (≈ 97%) — completely inverting the actual allocation. The composition breakdown is misleading and unusable for investment decisions.

**Fix:** Use `PortfolioService.calculateCurrentValue(a, p)` inside the map instead of raw `a.currentValue`. Then the pie will correctly show e.g. 75% stocks, 25% deposits.

---

### 3. Fabricated IDR 50M portfolio history when user has no assets

**Severity: High** | **CONFIRMED**  
**File:** `app/views/dashboard/DashboardView.tsx:52`

```tsx
const history = useMemo(() => genHistory(totalValue || 50000000), [totalValue]);
```

```ts
// utils.tsx — genHistory
export const genHistory = (total: number) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  let v = total * 0.76;
  return months.map((m, i) => {
    if (i === months.length - 1) return { month: m, value: total, baseline: total * 0.76 };
    v = Math.round(v * (1 + 0.012 + Math.random() * 0.025));
    return { month: m, value: v, baseline: total * 0.76 };
  });
};
```

When `totalValue` is 0 (API failure or genuinely empty portfolio), the `|| 50000000` fallback generates a convincing 7-month growth curve from IDR 38M → IDR 50M — while stat cards correctly show `IDR 0`.

**Impact:** Brand-new users or error states show a chart displaying IDR 38M–50M of simulated history that directly contradicts the zero-value stat cards. Users cannot tell this is fabricated.

**Fix:** Guard behind `totalValue > 0`. Show empty-state chart or "Start investing to see your performance" placeholder when no real data exists.

---

### 4. API errors silently swallowed — user sees all-zero dashboard with no feedback

**Severity: High** | **CONFIRMED**  
**File:** `app/views/dashboard/DashboardView.tsx:39-41`

```tsx
} catch (err) {
  console.error("Dashboard error:", err);
} finally {
  setLoading(false);
}
```

No error state variable (`useState` for error), no toast, no retry button, no inline banner. The `finally` block always sets `loading = false`, so on any API failure:

- Stat cards display all zeros (`IDR 0`, `0%`, `0`)
- `totalValue = 0` triggers finding #3: fabricated IDR 50M history chart
- Empty pie chart (no assets loaded)
- Empty recommendations

No visual indicator distinguishes "loading failed" from "you have no data."

**Fix:** Add `error` state + toast notification and/or inline error banner. Consider a retry mechanism.

---

### 5. Division by zero → NaN/Infinity values in pie chart

**Severity: High** | **CONFIRMED**  
**File:** `app/views/dashboard/DashboardView.tsx:113-117`

```tsx
data={allocationData.map((d, i) => ({
  name: d.name,
  value: Math.round((d.value / totalValue) * 100),
  color: PIE_COLORS[i % PIE_COLORS.length],
}))}
```

No zero-guard on `totalValue`. When it's 0 (API error, finding #4, or genuinely no assets):
- If `myAssets` has items with positive `currentValue`: **positive / 0 = ∞**, chart renders malformed
- If `myAssets` is also empty/value 0: **0 / 0 = NaN**, chart shows "NaN%"

**Impact:** Partial API failure can produce a pie chart with `∞` or `NaN` values, locking up or visually breaking the chart.

**Fix:** Guard with `totalValue > 0 ? ... : []` or filter out zero entries.

---

### 6. Pie chart tooltip labels percentages as IDR currency

**Severity: Medium** | **CONFIRMED**  
**File:** `app/components/charts/DashboardPieChart.tsx:34`

```tsx
<Tooltip formatter={(v: any) => [`IDR ${v.toLocaleString()}`, "Value"]} />
```

The data passed is `Math.round((d.value / totalValue) * 100)` — a percentage (0–100). Tooltip shows **"IDR 45"** instead of **"45%"**. The legend below correctly appends `%`, so hover and legend directly contradict.

**Fix:** Change formatter to `` `v => [`${v}%`]` `` and name to `"Allocation"`.

---

### 7. Chart data regenerated with random values on every render

**Severity: Medium** | **PLAUSIBLE**  
**File:** `app/views/dashboard/DashboardView.tsx:107`

```tsx
<DashboardPerfChart
  data={dashData?.recentTransactions ? genHistory(totalValue || 50000000) : history}
  ...
/>
```

Three interacting problems:

1. `genHistory()` uses `Math.random()` — different data every call, making `useMemo` on line 52 pointless
2. `dashData?.recentTransactions` is always truthy (even `[]` is truthy in JS) — the `useMemo`'ed `history` is **never used** after data loads
3. Any re-render (hover on a stat card, sidebar toggle) creates fresh random chart data, causing visible flicker

**Impact:** The chart visibly jumps to different data on every parent re-render. Looks broken.

**Fix:** Always use the memoized `history`. Remove the inline `genHistory()` call. Change `genHistory` to accept an optional seed for deterministic output on the same total.

---

### 8. O(n×m) product lookup per render — no memoization on allocation/recommended

**Severity: Low** | **PLAUSIBLE**  
**File:** `app/views/dashboard/DashboardView.tsx:55-60`

`allocationData` runs `products.find()` inside `.map()` — O(assets × products) per render. `recommended` filters the full products array. Neither uses `useMemo`. As data grows (50+ products × 100+ assets), render-phase work scales quadratically.

**Fix:** Wrap both in `useMemo`. Build a `Map<productId, product>` once for the lookup.

---

### 9. Duplicate and inconsistent color arrays for same chart

**Severity: Low** | **PLAUSIBLE**  

| Location | Colors | Scope |
|---|---|---|
| `DashboardView.tsx:62` | `#1a3a5c, #b8860b, #10b981, #f59e0b, #6366f1, #ef4444` | In-component array, re-created every render |
| `DashboardPieChart.tsx:13` | `#1a3a5c, #b8860b, #2d6a4f, #7b2d8b, #d97706, #dc2626, #2563eb, #059669` | Module-level fallback |
| `AdminDashboardView.tsx` | Third inline set | Admin variation |

Only the first two colors match across all three. `DashboardView`'s array is defined inside the component body (new allocation each render).

**Fix:** Define a single shared palette at module level. Remove `FALLBACK_COLORS` — always pass explicit colors from the caller.

---

### 10. Duplicate React import on lines 1 and 11

**Severity: Cosmetic** | **PLAUSIBLE**  
**File:** `app/views/dashboard/DashboardView.tsx:1,11`

```tsx
import React, { useMemo, Suspense } from "react";     // line 1
import { useEffect, useState } from "react";            // line 11
```

Two separate imports from the same module. Linters (`no-duplicate-imports`) would flag this. Suggests two-pass authoring with no final cleanup.

**Fix:** Merge into one import.

---

## REFUTED findings (not in final list)

| Claim | Why REFUTED |
|---|---|
| `p?.name.split("–")[0].trim()` crashes on null | Optional chaining short-circuits the entire chain; `?? "Unknown"` catches it |
| No ErrorBoundary → lazy chunk failure unmounts app | `root.tsx:53` has a React Router `ErrorBoundary` (though it replaces the entire dashboard with a generic "Oops!" page — not granular) |
| `err.message` in portofolioStore crashes on null | Axios always rejects with `AxiosError` objects. The pattern is unsafe but not exploitable via current code paths |

---

## Root-cause map

```
layout.tsx: products=[] (setter never called)
    ├──► "Recommended for You" always empty             [F1]
    └──► Pie labels all "Unknown"                       [F1]
    
DashboardView: a.currentValue ≠ total position
    └──► Pie allocation wrong (stocks off by 1000×)     [F2]

API error → console.error() only (no user feedback)    [F4]
    ├──► totalValue=0 → genHistory(50M) → fake chart   [F3]
    ├──► totalValue=0 → pie values = ∞/NaN              [F5]
    └──► User can't distinguish "error" from "empty"

Chart data = genHistory() inline (not memoized)         [F7]
    └──► Random data every render → visual flicker

Pie tooltip: `IDR ${v}` where v is percentage           [F6]
Performance: O(n×m) lookups, no memoization             [F8]
Colors: 3 copies, 1 inline, all diverging               [F9]
```

---

## Quick-fix guide

| # | Fix | Lines of change | Risk |
|---|---|---|---|
| 1 | Add `setProducts` to layout, fetch products from API | ~5 | Low |
| 2 | `value: PortfolioService.calculateCurrentValue(a, p)` | 1 | Low |
| 3 | `totalValue > 0 ? genHistory(totalValue) : null` (show placeholder) | 2 | Low |
| 4 | Add `error` state + toast notification in catch block | ~8 | Low |
| 5 | `totalValue > 0 ? ... : []` guard on pie data | 1 | Low |
| 6 | `` [`${v}%`, "Allocation"] `` in tooltip formatter | 1 | Trivial |
| 7 | Remove inline `genHistory()` call; use memoized value | 1 | Low |
| 8 | `useMemo` on allocationData + recommended | ~6 | Low |
| 9 | Lift palette to shared constant; remove fallbacks | ~5 | Trivial |
| 10 | Merge two React imports | 1 | Trivial |
