# Graph Report - FE-MonarchWealthManagementSystem  (2026-07-15)

## Corpus Check
- 104 files · ~32,534 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 467 nodes · 1222 edges · 34 communities (24 shown, 10 thin omitted)
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
- `AuthSuccessResponse` --references--> `AppUser`  [EXTRACTED]
  app/api/auth.ts → app/types.ts
- `AppLayoutProps` --references--> `AppUser`  [EXTRACTED]
  app/components/layout/AppLayout.tsx → app/types.ts
- `SidebarProps` --references--> `AppUser`  [EXTRACTED]
  app/components/layout/Sidebar.tsx → app/types.ts
- `ProductCardProps` --references--> `Product`  [EXTRACTED]
  app/components/ui/ProductCard.tsx → app/types.ts
- `RiskBadgeProps` --references--> `RiskProfile`  [EXTRACTED]
  app/components/ui/RiskBadge.tsx → app/types.ts

## Import Cycles
- None detected.

## Communities (34 total, 10 thin omitted)

### Community 0 - "Admin Dashboard & UI Components"
Cohesion: 0.09
Nodes (28): ProductApi, ProductUpdateDTO, Badge(), BadgeProps, variantClasses, ConfirmModal(), ConfirmModalProps, FormattedAmount() (+20 more)

### Community 1 - "Authentication & Forms"
Cohesion: 0.09
Nodes (35): AuthApi, AuthSuccessResponse, LoginPayload, RegisterPayload, AuthShell(), AuthShellProps, depositTenors, EXPENSE_LABELS (+27 more)

### Community 2 - "App Setup & Profile"
Cohesion: 0.11
Nodes (25): AssetApi, DashboardApi, PageHeader(), PageHeaderProps, StatCard(), StatCardProps, GOAL_TYPE_CONFIG, PortfolioState (+17 more)

### Community 3 - "types.ts"
Cohesion: 0.11
Nodes (26): api, GoalApi, RecommendationApi, RecommendationCardProps, GoalsState, useGoalsStore, RecommendationsState, AdminDashboardDTO (+18 more)

### Community 4 - "Product"
Cohesion: 0.14
Nodes (25): useAssetDetail(), UseAssetDetailProps, UseTrackModalProps, LayoutContextType, AuthService, PortfolioService, AppUser, Asset (+17 more)

### Community 5 - "Types & Prop Interfaces"
Cohesion: 0.07
Nodes (27): devDependencies, @react-router/dev, rollup-plugin-visualizer, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom (+19 more)

### Community 6 - "Build Tools & Package Info"
Cohesion: 0.08
Nodes (27): **/*, ./app/*, **/.client/**/*, DOM, DOM.Iterable, ES2022, node, .react-router/types/**/* (+19 more)

### Community 7 - "TypeScript Configuration"
Cohesion: 0.13
Nodes (26): RecommendationCard(), ScoreRing(), ScoreRingProps, SubScore(), SubScoreProps, analyzeGoal(), calcHealthScore(), generateRecommendations() (+18 more)

### Community 8 - "AdminUsersView.tsx"
Cohesion: 0.21
Nodes (8): RiskBadge(), riskBadgeClasses, RiskBadgeProps, riskDotClasses, riskLabels, UserStatus, statusBadge(), AdminUsersView()

### Community 9 - "External Dependencies"
Cohesion: 0.09
Nodes (23): axios, isbot, lucide-react, dependencies, axios, isbot, lucide-react, react (+15 more)

### Community 10 - "React Router Context"
Cohesion: 0.14
Nodes (13): Data and Mutations, Forms, Fetchers, and Pending UI, Framework Mode, Framework Shape, Layout and Root Route Rules, Metadata, Middleware, Sessions, and Auth, Read the Local Docs by Mode (+5 more)

### Community 11 - "Admin Audit & Utils"
Cohesion: 0.14
Nodes (19): AppLayout(), AppLayoutProps, Sidebar(), SidebarProps, Btn(), BtnProps, sizeClasses, variantClasses (+11 more)

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
Cohesion: 0.53
Nodes (3): categoryBadge(), fmtTs(), AdminAuditView()

## Knowledge Gaps
- **147 isolated node(s):** `LoginPayload`, `RegisterPayload`, `ProductUpdateDTO`, `AdminAreaChartProps`, `DashboardPerfChartProps` (+142 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AppUser` connect `Product` to `Admin Dashboard & UI Components`, `Authentication & Forms`, `App Setup & Profile`, `types.ts`, `TypeScript Configuration`, `AdminUsersView.tsx`, `Admin Audit & Utils`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `fmt()` connect `TypeScript Configuration` to `Admin Dashboard & UI Components`, `App Setup & Profile`, `types.ts`, `AdminUsersView.tsx`, `Admin Audit & Utils`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `Product` connect `Product` to `Admin Dashboard & UI Components`, `Authentication & Forms`, `App Setup & Profile`, `types.ts`, `TypeScript Configuration`, `Admin Audit & Utils`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `LoginPayload`, `RegisterPayload`, `ProductUpdateDTO` to the rest of the system?**
  _147 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Dashboard & UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.09413067552602436 - nodes in this community are weakly interconnected._
- **Should `Authentication & Forms` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `App Setup & Profile` be split into smaller, more focused modules?**
  _Cohesion score 0.11498257839721254 - nodes in this community are weakly interconnected._