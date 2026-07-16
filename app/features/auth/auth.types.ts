export interface FinancialProfile {
  monthlyIncome: number;
  expenses: {
    housing: number;
    food: number;
    transport: number;
    utilities: number;
    healthcare: number;
    entertainment: number;
    insurance: number;
    other: number;
    [key: string]: number;
  };
}
