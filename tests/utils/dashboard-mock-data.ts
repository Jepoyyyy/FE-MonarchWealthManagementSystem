import type { UserDashboardDTO, AdminDashboardDTO } from '../../app/types';

export function generateUserDashboardData(): UserDashboardDTO {
  return {
    portofolio: {
      value: "125750.50",
      invested: "100000.00",
      holdings: 5,
      items: [
        { name: "Tech Growth Fund", value: 45000.00 },
        { name: "Blue Chip Stocks ETF", value: 35000.00 },
        { name: "Government Bonds", value: 25000.00 },
        { name: "Real Estate Fund", value: 15750.50 },
        { name: "Emerging Markets", value: 5000.00 }
      ]
    },
    performance: [
      { month: 1, value: 102000.00 },
      { month: 2, value: 105500.00 },
      { month: 3, value: 108200.00 },
      { month: 4, value: 112000.00 },
      { month: 5, value: 118500.00 },
      { month: 6, value: 122000.00 },
      { month: 7, value: 125750.50 }
    ]
  };
}

export function generateEmptyUserDashboard(): UserDashboardDTO {
  return {
    portofolio: {
      value: "0.00",
      invested: "0.00",
      holdings: 0,
      items: []
    },
    performance: []
  };
}

export function generateAdminDashboardData(): AdminDashboardDTO {
  return {
    aum: 15750000.50,
    user_count: 1250,
    active_user_count: 1180,
    product_count: 45,
    active_product_count: 38,
    total_audit_events: 8542,
    risk_profiles: {
      risk_averse: 420,
      moderate: 550,
      risk_taker: 210
    },
    aum_trend: [
      { month: 1, value: 12500000.00 },
      { month: 2, value: 13200000.00 },
      { month: 3, value: 13800000.00 },
      { month: 4, value: 14100000.00 },
      { month: 5, value: 14650000.00 },
      { month: 6, value: 15200000.00 },
      { month: 7, value: 15750000.50 }
    ]
  };
}
