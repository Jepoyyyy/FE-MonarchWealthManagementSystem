# Plan: Make `app/data.tsx` Obsolete

## Current State

`app/data.tsx` exports 15 symbols consumed by 11 files. The exports fall into three buckets:

### Bucket A — Mutable seed data (backend now owns this)

| Export | Used by | API endpoint already exists? |
|---|---|---|
| `INIT_PRODUCTS` | `layout.tsx` | Yes — `GET /products` |
| `INIT_USERS` | `layout.tsx` | Yes — `GET /users` (admin), `GET /auth/me` |
| `INIT_ASSETS` | `layout.tsx` | Yes — `GET /assets` |
| `INIT_LOGS` | `layout.tsx` | Yes — `GET /audit-logs` |
| `INIT_GOALS` | `layout.tsx` | Yes — `GET /goals` |
| `INIT_FIN_PROFILE` | `layout.tsx` | Yes — `GET /financial-profile` |

### Bucket B — Static configuration (no backend needed, but doesn't belong in a "data" file with seed data)

| Export | Used by | Nature |
|---|---|---|
| `GOAL_TYPE_CONFIG` | `layout.tsx`, `engine.tsx`, `GoalCard.tsx`, `GoalFormModal.tsx`, `ProgressView.tsx`, `AssetDetailPage.tsx`, `AssetsView.tsx` | Pure config map — belongs in `app/config/goals.ts` |
| `GOAL_MAX_MONTHS` | `engine.tsx`, `ProgressView.tsx` | Pure config — belongs in `app/config/goals.ts` |
| `GOAL_FAST_MONTHS` | `engine.tsx` | Pure config — belongs in `app/config/goals.ts` |
| `GOAL_PRODUCT_TYPES` | `engine.tsx` | Pure config — belongs in `app/config/goals.ts` |
| `QUESTIONNAIRE` | `QuestionnaireView.tsx`, `useQuestionnaire.ts` | Pure config — belongs in `app/config/questionnaire.ts` |
| `PRIORITY_CONFIG` | `RecommendationCard.tsx` | Pure config — belongs in `app/config/` |
| `EXPENSE_LABELS` | (no consumers found in active code) | Dead code — delete |
| `depositTenors` | `TrackFormStep.tsx` | Pure config — belongs in `app/config/products.ts` |
| `PRODUCT_SEED_PRICES` | `useTrackModal.ts` | Mock/fallback prices — belongs in `app/config/products.ts` or delete if backend covers it |

## Plan

### Step 1 — Remove seed data from `layout.tsx` (Bucket A)

`layout.tsx` currently initializes all state from `INIT_*` constants. Since the backend is integrated, this state should start empty (`[]` / `null`) and be populated from API responses.

**Changes:**
1. Remove the import of `INIT_USERS, INIT_PRODUCTS, INIT_ASSETS, INIT_LOGS, INIT_GOALS, INIT_FIN_PROFILE` from `layout.tsx`
2. Initialize state empty: `useState<AppUser[]>([])`, `useState<Product[]>([])`, etc.
3. Add a `useEffect` to fetch these from the API on mount (or delegate to child routes which already call the API)
4. `addLog` already has a comment saying it's a fallback — it can stay but empty-initialized

### Step 2 — Relocate static config (Bucket B)

Create two new files, move config there, delete `data.tsx`:

**`app/config/goals.ts`:**
```
GOAL_TYPE_CONFIG, GOAL_MAX_MONTHS, GOAL_FAST_MONTHS, GOAL_PRODUCT_TYPES
```

**`app/config/products.ts`:**
```
depositTenors, PRODUCT_SEED_PRICES
```

**`app/config/questionnaire.ts`:**
```
QUESTIONNAIRE
```

**`app/config/recommendation.ts`:**
```
PRIORITY_CONFIG
```

**Delete:**
- `EXPENSE_LABELS` — unused, dead code

### Step 3 — Update imports

Update every consumer to import from the new config files instead of `~/data`:

| Consumer | Old import | New import |
|---|---|---|
| `engine.tsx` | `~/data` | `~/config/goals` |
| `GoalCard.tsx` | `~/data` | `~/config/goals` |
| `GoalFormModal.tsx` | `~/data` | `~/config/goals` |
| `ProgressView.tsx` | `~/data` | `~/config/goals` |
| `AssetDetailPage.tsx` | `~/data` | `~/config/goals` |
| `AssetsView.tsx` | `~/data` | `~/config/goals` |
| `QuestionnaireView.tsx` | `~/data` | `~/config/questionnaire` |
| `useQuestionnaire.ts` | `~/data` | `~/config/questionnaire` |
| `RecommendationCard.tsx` | `~/data` | `~/config/recommendation` |
| `TrackFormStep.tsx` | `~/data` | `~/config/products` |
| `useTrackModal.ts` | `~/data` | `~/config/products` |

### Step 4 — Delete `app/data.tsx`

Once all imports are migrated and the file has zero consumers.

### Step 5 — Verify

- `grep -r "from.*~/data" app/` returns nothing
- `grep -r "EXPENSE_LABELS" app/` returns nothing
- App compiles (`npx tsc --noEmit`)
- Graph update: `graphify update .`

## What's Skipped

- **Types** (`app/types.ts`) stay untouched — `GoalType`, `ProductType`, etc. are the contract between frontend and backend, not seed data.
- **`PRODUCT_SEED_PRICES`** — kept in `config/products.ts` as a fallback for when the market-data API isn't reachable. If the backend reliably provides current prices, delete it in a follow-up.
- **`useAuthManager` hook with `users` array** — `layout.tsx` passes `users` via context. If the admin user-management page already calls the API directly, the `users` state in layout can be removed entirely. Investigate in a follow-up.