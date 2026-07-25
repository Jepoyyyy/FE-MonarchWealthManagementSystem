import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  // Unauthenticated routes
  route("login", "routes/auth/login.tsx"),
  route("register", "routes/auth/register.tsx"),
  route("questionnaire", "routes/auth/questionnaire.tsx"),

  // Authenticated routes under layout
  layout("routes/layout.tsx", [
    // User Routes
    index("routes/user/dashboard.tsx"),
    route("products", "routes/user/products.tsx"),
    route("assets", "routes/user/assets.tsx"),
    route("assets/:id", "routes/user/asset-detail.tsx", { id: "assets-detail" }),
    route("user/assets/:id", "routes/user/asset-detail.tsx", { id: "user-assets-detail" }),
    route("goals", "routes/user/goals.tsx"),
    route("recommendations", "routes/user/recommendations.tsx"),
    route("progress", "routes/user/progress.tsx"),
    route("user/progress", "routes/user/progress.tsx", { id: "user-progress" }),
    // Admin Routes
    route("admin", "routes/admin/dashboard.tsx"),
    route("admin/products", "routes/admin/products.tsx"),
    route("admin/users", "routes/admin/users.tsx"),
    route("admin/audit", "routes/admin/audit.tsx"),
  ]),
] satisfies RouteConfig;
