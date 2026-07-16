export interface AuditLog {
  id: string; 
  userId: string; 
  userName: string;
  action: string; 
  details: string; 
  timestamp: string;
  category: "auth" | "portfolio" | "admin" | "questionnaire";
}

export interface AdminDashboardDTO {
  totalAUM: number;
  activeUsers: number;
  totalUsers: number;
  activeProducts: number;
  totalProducts: number;
  totalEvents: number;
  riskProfileDist: {
    riskAverse: number;
    moderate: number;
    riskTaker: number;
  };
  recentActivity: any[];
  aumHistory?: { month: number; value: number }[];
}
