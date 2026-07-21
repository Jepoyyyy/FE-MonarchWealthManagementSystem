import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    // User Routes
    index("routes/user/dashboard.tsx"),
    route("products", "routes/user/products.tsx"),
    route("assets", "routes/user/assets.tsx"),
    route("goals", "routes/user/goals.tsx"),
    route("recommendations", "routes/user/recommendations.tsx"),
    route("progress", "routes/user/progress.tsx"),
    // Admin Routes
    route("admin", "routes/admin/dashboard.tsx"),
    route("admin/products", "routes/admin/products.tsx"),
    route("admin/users", "routes/admin/users.tsx"),
    route("admin/audit", "routes/admin/audit.tsx"),
  ]),
  route("questionnaire", "routes/user/questionnaire.tsx"),
] satisfies RouteConfig;
