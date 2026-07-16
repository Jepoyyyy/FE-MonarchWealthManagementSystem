import type { ProductType } from "~/types";
import { PRODUCT_TYPE_ICONS, RISK_LEVEL_LABELS, RISK_LEVEL_BADGE_CLASSES } from "~/constants/productTypes";

export function getProductTypeIcon(type: ProductType): string {
  return PRODUCT_TYPE_ICONS[type] ?? "🪙";
}

export function getRiskLevelLabel(level: number): string {
  return RISK_LEVEL_LABELS[level] ?? "Unknown";
}

export function getRiskLevelBadgeClass(level: number): string {
  return RISK_LEVEL_BADGE_CLASSES[level] ?? "bg-gray-100 text-gray-700 border-gray-200";
}
