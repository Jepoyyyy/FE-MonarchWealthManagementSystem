# Code Review — Product Feature
**Commits:** `396d02c` → `a7b7955` (product adjustment · introduce products · product tracking fix)  
**Effort:** high · **Date:** 2026-07-18

---

## Summary
10 findings across the product-type migration (snake_case → Title Case) and new stock unit-conversion layer. The dominant theme is **silent quantity corruption**: Stock lot counts can appear 100× inflated or 100× deflated depending on timing, and goal payloads drop fields without error.

| # | Severity | File | Finding |
|---|----------|------|---------|
| 1 | 🔴 Critical | `assets/api.ts:32` | Stock qty 100× inflated — store not hydrated |
| 2 | 🔴 Critical | `assets/api.ts:63` | `update()` response lacks `productId` → stock qty 100× wrong |
| 3 | 🔴 Critical | `goals/api.ts:13` | NaN months sends `"NaN-NaN-NaN"` as `target_date` |
| 4 | 🔴 Critical | `goals/api.ts:25` | `expected_return` silently dropped from goal payload |
| 5 | 🔴 Critical | `useTrackModal.ts:154` | Bond nominal now fractional; lot-multiple validation removed |
| 6 | 🟠 High | `useTrackModal.ts:110` | Initial product fetch failure silently swallowed |
| 7 | 🟠 High | `assets/api.ts:34` | `list()` crashes with TypeError if `res.data` is null |
| 8 | 🟡 Medium | `AssetsView.tsx:57` | Stale `myAssets` → stock transaction qty 100× too small |
| 9 | 🟡 Medium | `assets/api.ts:1` | API layer couples to UI store — untestable, degrades silently |
| 10 | 🟡 Medium | `goals/api.ts:10` | FE-computed `target_date` drifts from backend on read-back |

---

## Findings

### 1 🔴 `app/features/assets/api.ts:32` — Stock qty 100× inflated when store not hydrated
**Verdict:** CONFIRMED

`AssetApi.list`, `create`, and `update` all call `useProductsStore.getState().products` which initialises as `[]`. `fetchPortfolio` and `fetchProducts` run concurrently on mount — if any API call resolves before the product store is hydrated, every `products.find()` returns `undefined`, `isStock` is always `false`, and Stock positions are displayed at raw `units` (which the backend stores as `lots × 100`).

```ts
// assets/api.ts — current (broken)
const products = useProductsStore.getState().products; // [] on first load
const p = products.find(prod => prod.id === asset.productId); // always undefined
const qty = p?.type === "Stock" ? units / 100 : units;        // always takes else branch
```

**Fix:** pass `products` as a parameter instead of reading the store inside the API layer. This also resolves finding #9.

```ts
// e.g.
list: async (products: Product[]) => { ... }
// caller: AssetApi.list(useProductsStore.getState().products)
```

---

### 2 🔴 `app/features/assets/api.ts:63` — `update()` response lacks `productId`, stock qty 100× wrong
**Verdict:** CONFIRMED

`AssetApi.update` PUTs only `{ goalId: data.goalId }`. A partial PATCH/PUT response typically does not echo back the full resource — `productId` is absent. The remap then gets `p = undefined`, `isStock = false`, and returns `units` unchanged (which is `lots × 100` for stocks). The UI shows 100× the actual lot count after every goal-link save.

```ts
// PUT body sent: { goalId: data.goalId }
// Response likely: { id, goalId, currentValue, units, ... }  ← no productId
const p = products.find(prod => prod.id === asset.productId); // undefined
const qty = p?.type === "Stock" ? units / 100 : units;        // returns units (100× too high)
```

**Fix:** either request the full resource after a PATCH (GET after PUT), or pass `productId` explicitly from the call site so the remap doesn't depend on the response field.

---

### 3 🔴 `app/features/goals/api.ts:13` — NaN months bypasses guard, sends `"NaN-NaN-NaN"` as `target_date`
**Verdict:** CONFIRMED

When `monthlyContribution === 0` or `targetAmount === currentSaved`, `monthsToGoal` returns `NaN`. The guard `if (months < 0)` does not catch `NaN` (`NaN < 0` is `false`). `d.setMonth(d.getMonth() + NaN)` produces `Invalid Date`, and the template literal emits `"NaN-NaN-NaN"` which is POSTed to the backend.

```ts
let months = monthsToGoal(target, current, monthly, annualReturn);
if (months < 0) { months = 120; }   // ← NaN slips through
const d = new Date();
d.setMonth(d.getMonth() + months);   // Invalid Date
const targetDate = `${year}-${month}-${day}`; // "NaN-NaN-NaN"
```

**Fix:**
```ts
if (months < 0 || !isFinite(months)) months = 120;
```

---

### 4 🔴 `app/features/goals/api.ts:25` — `expected_return` silently dropped from goal payload
**Verdict:** CONFIRMED

`toGoalPayload` reads `data.expectedReturn` (aliased as `annualReturn`) to compute the target date, but never includes it in the returned object. Every create and update call is missing the field; the backend persists its own default (or ignores it), making the "Expected Return" field a no-op.

```ts
function toGoalPayload(data: any) {
  const annualReturn = data.expectedReturn || 7.5;  // used for date calc only
  // ...
  return {
    name: data.name,
    type: ...,
    target_amount: target,
    monthly_contribution: monthly,
    target_date: targetDate,
    is_priority: data.isPriority || false,
    notes: data.notes || "",
    // expected_return: annualReturn  ← MISSING
  };
}
```

**Fix:** add `expected_return: annualReturn` to the return object.

---

### 5 🔴 `app/features/products/hooks/useTrackModal.ts:154` — Bond nominal now fractional; lot-multiple validation removed
**Verdict:** CONFIRMED

The bond quantity formula was changed from integer-snapped to a 4-decimal float, and the corresponding modulo validation in `TrackFormStep` was deleted without a replacement.

```ts
// OLD — rounded to nearest IDR 10,000 (exchange minimum)
String(Math.round(amt / (parsedCurrentVal / 100) / 10000) * 10000)

// NEW — fractional, e.g. "15123.4567"
(amt / (parsedCurrentVal / 100)).toFixed(4)
```

The new submit validation in `useTrackModal` only checks `amt < minInvestment` — it does **not** enforce `nominal % minInvestment === 0`. Bond nominals must be integer multiples of face value (typically IDR 1,000 or 10,000 minimums). Fractional nominals will be rejected by the backend or cause data corruption.

**Fix:** restore the modulo guard in `submit()`:
```ts
if (isBond && picked.minInvestment > 0) {
  const nominal = parseFloat(quantity) || 0;
  if (nominal % picked.minInvestment !== 0) {
    setErr(`Nominal must be a multiple of ${fmt(picked.minInvestment)}`);
    return;
  }
}
```
And round the quantity to the nearest face-value multiple:
```ts
if (isBond) setQuantity(String(Math.round(amt / (parsedCurrentVal / 100) / picked.minInvestment) * picked.minInvestment));
```

---

### 6 🟠 `app/features/products/hooks/useTrackModal.ts:110` — Initial product fetch failure silently swallowed
**Verdict:** CONFIRMED

The `useEffect` for `initialProduct` has a catch that calls `setPicked({...initialProduct})` and `console.error`, but never calls `setProductError`. The user sees no error banner and unknowingly proceeds with stale/fallback product data (missing `currentPrice`, `lotSize`, `minInvestment`, etc.).

```ts
.catch((error) => {
  console.error("Failed to load initial product details:", error); // silent to user
  if (active) setPicked({ ...initialProduct }); // proceeds with incomplete data
  // setProductError("...") ← MISSING
})
```

**Fix:** add `setProductError("Failed to load product details. Please try again.")` in the catch block.

---

### 7 🟠 `app/features/assets/api.ts:34` — `list()` crashes with TypeError if `res.data` is null
**Verdict:** PLAUSIBLE

`res.data.map(...)` has no null/array guard. A new user (no assets yet → server may return `null` or `[]`) or an error body that slips past the axios interceptor causes `TypeError: res.data.map is not a function`, crashing the portfolio page.

```ts
// current
const mapped = res.data.map((asset) => { ... }); // throws if null

// fix
const mapped = (res.data ?? []).map((asset) => { ... });
```

---

### 8 🟡 `app/features/assets/components/AssetsView.tsx:57` — Stale `myAssets` → stock transaction qty 100× too small
**Verdict:** PLAUSIBLE

`updateAsset` looks up the product type through `myAssets` to decide whether to apply ×100 scaling:

```ts
const p = products.find((prod) => prod.id === myAssets.find(a => a.id === id)?.productId);
const actualQty = p?.type === "Stock" ? txQty * 100 : txQty;
```

If `myAssets` hasn't refreshed after a prior create (concurrent operations), `myAssets.find(a => a.id === id)` returns `undefined`, `p` is `undefined`, and the transaction is sent with `txQty` (1 lot) instead of `txQty * 100` (100 shares). The backend records 100× fewer shares than intended.

**Fix:** use the `asset` already in scope if available, or derive `productId` from a source that can't be stale.

---

### 9 🟡 `app/features/assets/api.ts:1` — API layer couples to UI store — untestable, degrades silently
**Verdict:** CONFIRMED

`useProductsStore` is imported and read inside `assets/api.ts` — a plain data-transport module. This creates wrong-direction coupling (transport → UI state) and makes every `AssetApi` function impossible to unit test without a hydrated Zustand store. It also means any race (finding #1) or store-shape change silently corrupts the return value with no type error.

The unit conversion (`÷100` / `×100`) is also now scattered across four sites: `toAssetPayload`, `list`, `create`, `update` in `api.ts`, and `updateAsset` in `AssetsView.tsx`.

**Fix:** extract a `mapAssetQuantity(asset, products)` helper in a service layer and pass `products` from the call site.

---

### 10 🟡 `app/features/goals/api.ts:10` — FE-computed `target_date` drifts from backend on read-back
**Verdict:** PLAUSIBLE

`toGoalPayload` runs `monthsToGoal` on the frontend and POSTs the computed `target_date`. If the backend also derives a target date from the stored contributions and return rate (common pattern), the two values will diverge on any rounding difference — the stored date and the displayed date disagree silently after every edit.

**Fix:** either send raw inputs and let the backend own the date, or accept the computed date as the canonical source of truth and ensure the backend never overrides it.

---

## Recurrence Pattern
Five of the ten findings share the same root cause: **the ×100 stock unit conversion is duplicated across too many layers with no single source of truth, and all copies depend on a store that may not be ready.** Consolidating the conversion into one utility function called at the service boundary would eliminate findings 1, 2, 8, and 9.
