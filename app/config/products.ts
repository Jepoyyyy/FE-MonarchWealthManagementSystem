export const depositTenors = [
  { months: 1, label: "1 Month", return: 4.0 },
  { months: 3, label: "3 Months", return: 4.5 },
  { months: 12, label: "12 Months", return: 5.5 },
];

// Seed market prices for prototype — replaces live API data
export const PRODUCT_SEED_PRICES: Record<string, number> = {
  p1: 1015, p2: 1008, p3: 0, p4: 0,
  p5: 101.5, p6: 98.2,
  p7: 1075, p8: 1250, p11: 985,
  p9: 5490, p10: 3120, p12: 534,
};