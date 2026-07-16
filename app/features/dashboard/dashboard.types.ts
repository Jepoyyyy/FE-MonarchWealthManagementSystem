export interface UserDashboardDTO {
  performance: { month: number; value: number }[];
  portofolio: {
    value: number | string;
    invested: number | string;
    holdings: number;
    items: { name: string; value: number; color?: string }[];
  };
}
