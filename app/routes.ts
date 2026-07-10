import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("products", "routes/products.tsx"),
    route("assets", "routes/assets.tsx"),
    route("goals", "routes/goals.tsx"),
    route("recommendations", "routes/recommendations.tsx"),
    route("progress", "routes/progress.tsx"),
  ]),
] satisfies RouteConfig;
