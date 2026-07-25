export const mockUserDashboardData = {
  portofolio: {
    value: 12500000,
    invested: 10000000,
    holdings: 4,
    items: [
      { id: '1', name: 'Monarch Equity Fund', value: 5000000 },
      { id: '2', name: 'Government Bond Series 1', value: 3500000 },
      { id: '3', name: 'Monarch Balanced Growth', value: 2500000 },
      { id: '4', name: 'US Tech ETF', value: 1500000 },
    ],
  },
  performance: [
    { month: 1, value: 9500000 },
    { month: 2, value: 9800000 },
    { month: 3, value: 10200000 },
    { month: 4, value: 11000000 },
    { month: 5, value: 11800000 },
    { month: 6, value: 12500000 },
    { month: 7, value: 0 },
    { month: 8, value: 0 },
    { month: 9, value: 0 },
    { month: 10, value: 0 },
    { month: 11, value: 0 },
    { month: 12, value: 0 },
  ],
};

export const mockEmptyDashboardData = {
  portofolio: {
    value: 0,
    invested: 0,
    holdings: 0,
    items: [],
  },
  performance: [],
};

export const mockAdminDashboardData = {
  totalAum: 450000000,
  activeUsers: 120,
  totalProducts: 15,
  auditEventsCount: 342,
  aumTrend: [
    { month: "Jan", aum: 380000000 },
    { month: "Feb", aum: 400000000 },
    { month: "Mar", aum: 420000000 },
    { month: "Apr", aum: 450000000 },
  ],
  riskProfileDistribution: [
    { name: "Risk Averse", value: 30, color: "#10b981" },
    { name: "Moderate", value: 50, color: "#b8860b" },
    { name: "Risk Taker", value: 40, color: "#ef4444" },
  ],
};
