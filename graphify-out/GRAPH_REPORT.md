# Graph Report - FE-MonarchWealthManagementSystem  (2026-07-15)

## Corpus Check
- 106 files · ~33,278 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 480 nodes · 1243 edges · 39 communities (25 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3aede720`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Admin Dashboard & UI Components
- Authentication & Forms
- App Setup & Profile
- types.ts
- Product
- Types & Prop Interfaces
- Build Tools & Package Info
- TypeScript Configuration
- AdminUsersView.tsx
- External Dependencies
- React Router Context
- Admin Audit & Utils
- Dashboard Charts
- Admin Area Chart
- Dashboard Perf Chart
- Progress Chart
- Progress Goal Chart
- Navigation Config
- Docker Config
- TailwindCSS Config
- Welcome to React Router!
- Data Mode
- Identify the Mode
- React Server Components (RSC)
- Declarative Mode
- CLAUDE.md
- AdminAuditView.tsx
- test-interceptor.js
- test-login.js
- Auth Feature Code Review
- assets.ts
- lucide-react
- @react-router/node
- @tailwindcss/vite

## God Nodes (most connected - your core abstractions)
1. `AppUser` - 43 edges
2. `Product` - 43 edges
3. `fmt()` - 43 edges
4. `Asset` - 32 edges
5. `Btn()` - 28 edges
6. `Goal` - 26 edges
7. `LayoutContextType` - 17 edges
8. `compilerOptions` - 15 edges
9. `AuditLog` - 14 edges
10. `FinancialProfile` - 13 edges

## Surprising Connections (you probably didn't know these)
- `ProductsViewProps` --references--> `AppUser`  [EXTRACTED]
  app/views/products/ProductsView.tsx → app/types.ts
- `AuthSuccessResponse` --references--> `AppUser`  [EXTRACTED]
  app/api/auth.ts → app/types.ts
- `GoalsView()` --references--> `GoalApi`  [EXTRACTED]
  app/views/goals/GoalsView.tsx → app/api/goals.ts
- `AppLayoutProps` --references--> `AppUser`  [EXTRACTED]
  app/components/layout/AppLayout.tsx → app/types.ts
- `SidebarProps` --references--> `AppUser`  [EXTRACTED]
  app/components/layout/Sidebar.tsx → app/types.ts

## Import Cycles
- None detected.

## Communities (39 total, 14 thin omitted)

### Community 0 - "Admin Dashboard & UI Components"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, start, typecheck, type

### Community 1 - "Authentication & Forms"
Cohesion: 0.08
Nodes (40): AuthApi, AuthSuccessResponse, LoginPayload, RegisterPayload, api, failedQueue, GoalApi, RecommendationApi (+32 more)

### Community 2 - "App Setup & Profile"
Cohesion: 0.09
Nodes (37): Badge(), BadgeProps, variantClasses, Btn(), BtnProps, sizeClasses, variantClasses, ConfirmModal() (+29 more)

### Community 3 - "types.ts"
Cohesion: 0.22
Nodes (8): AuthService, AuditLog, categoryBadge(), fmtTs(), AdminAuditView(), AdminAuditViewProps, AdminProductsViewProps, AdminUsersViewProps

### Community 4 - "Product"
Cohesion: 0.14
Nodes (21): ProductApi, ProductUpdateDTO, ProductCardProps, UseAssetDetailProps, LayoutContextType, ProductsState, useProductsStore, FinancialProfile (+13 more)

### Community 5 - "Types & Prop Interfaces"
Cohesion: 0.12
Nodes (17): devDependencies, @react-router/dev, rollup-plugin-visualizer, tailwindcss, @types/node, @types/react, @types/react-dom, typescript (+9 more)

### Community 6 - "Build Tools & Package Info"
Cohesion: 0.08
Nodes (27): **/*, ./app/*, **/.client/**/*, DOM, DOM.Iterable, ES2022, node, .react-router/types/**/* (+19 more)

### Community 7 - "TypeScript Configuration"
Cohesion: 0.13
Nodes (27): FormattedAmount(), FormattedAmountProps, StatCard(), StatCardProps, GOAL_MAX_MONTHS, GOAL_TYPE_CONFIG, analyzeGoal(), generateRecommendations() (+19 more)

### Community 8 - "AdminUsersView.tsx"
Cohesion: 0.14
Nodes (20): RiskBadgeProps, depositTenors, EXPENSE_LABELS, GOAL_FAST_MONTHS, GOAL_PRODUCT_TYPES, INIT_ASSETS, INIT_FIN_PROFILE, INIT_GOALS (+12 more)

### Community 9 - "External Dependencies"
Cohesion: 0.12
Nodes (17): axios, isbot, dependencies, axios, isbot, react, react-dom, @react-router/serve (+9 more)

### Community 10 - "React Router Context"
Cohesion: 0.14
Nodes (13): Data and Mutations, Forms, Fetchers, and Pending UI, Framework Mode, Framework Shape, Layout and Root Route Rules, Metadata, Middleware, Sessions, and Auth, Read the Local Docs by Mode (+5 more)

### Community 11 - "Admin Audit & Utils"
Cohesion: 0.19
Nodes (12): InputField(), InputFieldProps, AddTransactionModal(), AddTransactionModalProps, BondFormProps, BondTransactionForm(), DepositFormProps, DepositTransactionForm() (+4 more)

### Community 12 - "Dashboard Charts"
Cohesion: 0.40
Nodes (3): DashboardPieChartProps, FALLBACK_COLORS, PieSlice

### Community 24 - "Welcome to React Router!"
Cohesion: 0.18
Nodes (10): Building for Production, Deployment, Development, DIY Deployment, Docker Deployment, Features, Getting Started, Installation (+2 more)

### Community 25 - "Data Mode"
Cohesion: 0.20
Nodes (9): Data and Mutations, Data Mode, Data Router Shape, Forms, Fetchers, and Pending UI, Navigation and URL State, Read the Local Docs by Mode, Route Objects and Routing, RSC Data (+1 more)

### Community 26 - "Identify the Mode"
Cohesion: 0.20
Nodes (9): Data Mode, Declarative Mode, Framework Mode, Identify the Mode, Mode Migration Doc Index, React Router, RSC Framework and RSC Data Modes, Skill References (+1 more)

### Community 27 - "React Server Components (RSC)"
Cohesion: 0.22
Nodes (8): Client/Server Boundaries, Data Loading in RSC, Detect RSC Data Mode, Detect RSC Framework Mode, React Server Components (RSC), Read the Local RSC Docs, RSC Route Module Differences, Stability

### Community 28 - "Declarative Mode"
Cohesion: 0.25
Nodes (7): Declarative Mode, Declarative Router Shape, Mode Boundary, Navigation, Read the Local Docs by Mode, Routing, URL Values

### Community 30 - "AdminAuditView.tsx"
Cohesion: 0.08
Nodes (33): AssetApi, DashboardApi, PageHeader(), PageHeaderProps, ProductCard(), RecommendationCard(), ScoreRing(), ScoreRingProps (+25 more)

### Community 34 - "Auth Feature Code Review"
Cohesion: 0.25
Nodes (7): 1. Logout Token Race Condition, 2. Missing Unauthenticated State Handler, 3. Questionnaire State Lost on Page Reload, 4. Missing Logout on 401 Without Refresh Token, 5. Global Token Leak, 6. Refresh Token Race Condition, Auth Feature Code Review

## Knowledge Gaps
- **154 isolated node(s):** `LoginPayload`, `RegisterPayload`, `failedQueue`, `ProductUpdateDTO`, `AdminAreaChartProps` (+149 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AppUser` connect `Authentication & Forms` to `App Setup & Profile`, `types.ts`, `Product`, `TypeScript Configuration`, `AdminUsersView.tsx`, `AdminAuditView.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `fmt()` connect `TypeScript Configuration` to `App Setup & Profile`, `Admin Audit & Utils`, `Product`, `AdminAuditView.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `Product` connect `Product` to `Authentication & Forms`, `App Setup & Profile`, `TypeScript Configuration`, `AdminUsersView.tsx`, `Admin Audit & Utils`, `AdminAuditView.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `LoginPayload`, `RegisterPayload`, `failedQueue` to the rest of the system?**
  _154 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Authentication & Forms` be split into smaller, more focused modules?**
  _Cohesion score 0.07706766917293233 - nodes in this community are weakly interconnected._
- **Should `App Setup & Profile` be split into smaller, more focused modules?**
  _Cohesion score 0.09025974025974026 - nodes in this community are weakly interconnected._
- **Should `Product` be split into smaller, more focused modules?**
  _Cohesion score 0.13846153846153847 - nodes in this community are weakly interconnected._