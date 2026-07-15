# Graph Report - FE-MonarchWealthManagementSystem  (2026-07-15)

## Corpus Check
- 100 files · ~30,654 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 460 nodes · 1218 edges · 29 communities (21 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3dbe41a5`
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

## God Nodes (most connected - your core abstractions)
1. `Product` - 43 edges
2. `fmt()` - 43 edges
3. `AppUser` - 42 edges
4. `Asset` - 31 edges
5. `Btn()` - 28 edges
6. `Goal` - 26 edges
7. `LayoutContextType` - 17 edges
8. `compilerOptions` - 15 edges
9. `FinancialProfile` - 13 edges
10. `AuditLog` - 13 edges

## Surprising Connections (you probably didn't know these)
- `ProductCardProps` --references--> `Product`  [EXTRACTED]
  app/components/ui/ProductCard.tsx → app/types.ts
- `ProductsState` --references--> `Product`  [EXTRACTED]
  app/stores/productsStore.ts → app/types.ts
- `AssetsView()` --references--> `AssetApi`  [EXTRACTED]
  app/views/assets/AssetsView.tsx → app/api/assets.ts
- `AuthSuccessResponse` --references--> `AppUser`  [EXTRACTED]
  app/api/auth.ts → app/types.ts
- `AppLayoutProps` --references--> `AppUser`  [EXTRACTED]
  app/components/layout/AppLayout.tsx → app/types.ts

## Import Cycles
- None detected.

## Communities (29 total, 8 thin omitted)

### Community 0 - "Admin Dashboard & UI Components"
Cohesion: 0.08
Nodes (44): Badge(), BadgeProps, variantClasses, Btn(), BtnProps, sizeClasses, variantClasses, ConfirmModal() (+36 more)

### Community 1 - "Authentication & Forms"
Cohesion: 0.07
Nodes (47): AuthApi, AuthSuccessResponse, LoginPayload, RegisterPayload, AppLayout(), AppLayoutProps, Sidebar(), SidebarProps (+39 more)

### Community 2 - "App Setup & Profile"
Cohesion: 0.10
Nodes (22): api, ProductApi, ProductUpdateDTO, RecommendationApi, RecommendationCardProps, PortfolioState, ProductsState, RecommendationsState (+14 more)

### Community 3 - "types.ts"
Cohesion: 0.14
Nodes (29): GoalApi, GOAL_TYPE_CONFIG, analyzeGoal(), generateRecommendations(), LayoutContextType, GoalsState, useGoalsStore, FinancialProfile (+21 more)

### Community 4 - "Product"
Cohesion: 0.13
Nodes (23): ProductTypeBadgeProps, depositTenors, useAssetDetail(), UseAssetDetailProps, useTrackModal(), UseTrackModalProps, AuthService, PortfolioService (+15 more)

### Community 5 - "Types & Prop Interfaces"
Cohesion: 0.07
Nodes (27): devDependencies, @react-router/dev, rollup-plugin-visualizer, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom (+19 more)

### Community 6 - "Build Tools & Package Info"
Cohesion: 0.08
Nodes (27): **/*, ./app/*, **/.client/**/*, DOM, DOM.Iterable, ES2022, node, .react-router/types/**/* (+19 more)

### Community 7 - "TypeScript Configuration"
Cohesion: 0.12
Nodes (19): AssetApi, DashboardApi, RecommendationCard(), ScoreRing(), ScoreRingProps, SubScore(), SubScoreProps, calcHealthScore() (+11 more)

### Community 9 - "External Dependencies"
Cohesion: 0.09
Nodes (23): axios, isbot, lucide-react, dependencies, axios, isbot, lucide-react, react (+15 more)

### Community 10 - "React Router Context"
Cohesion: 0.14
Nodes (13): Data and Mutations, Forms, Fetchers, and Pending UI, Framework Mode, Framework Shape, Layout and Root Route Rules, Metadata, Middleware, Sessions, and Auth, Read the Local Docs by Mode (+5 more)

### Community 11 - "Admin Audit & Utils"
Cohesion: 0.21
Nodes (11): InputField(), InputFieldProps, AddTransactionModal(), BondFormProps, BondTransactionForm(), DepositFormProps, DepositTransactionForm(), MutualFundFormProps (+3 more)

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

## Knowledge Gaps
- **144 isolated node(s):** `LoginPayload`, `RegisterPayload`, `ProductUpdateDTO`, `AdminAreaChartProps`, `DashboardPerfChartProps` (+139 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AppUser` connect `Authentication & Forms` to `Admin Dashboard & UI Components`, `App Setup & Profile`, `types.ts`, `Product`, `TypeScript Configuration`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `fmt()` connect `types.ts` to `Admin Dashboard & UI Components`, `App Setup & Profile`, `Product`, `TypeScript Configuration`, `Admin Audit & Utils`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `Product` connect `Product` to `Admin Dashboard & UI Components`, `Authentication & Forms`, `App Setup & Profile`, `types.ts`, `TypeScript Configuration`, `Admin Audit & Utils`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `LoginPayload`, `RegisterPayload`, `ProductUpdateDTO` to the rest of the system?**
  _144 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Dashboard & UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.07577639751552795 - nodes in this community are weakly interconnected._
- **Should `Authentication & Forms` be split into smaller, more focused modules?**
  _Cohesion score 0.06547619047619048 - nodes in this community are weakly interconnected._
- **Should `App Setup & Profile` be split into smaller, more focused modules?**
  _Cohesion score 0.10080645161290322 - nodes in this community are weakly interconnected._