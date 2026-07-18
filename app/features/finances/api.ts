import { api } from '~/shared/api/client';

export interface FinancialProfileData {
  monthlyIncome: number;
  housing: number;
  food: number;
  transport: number;
  utilities: number;
  healthcare: number;
  entertainment: number;
  insurance: number;
  other: number;
}

export interface FinancialProfileResponse extends FinancialProfileData {
  id: string;
  totalExpenses: number;
  createdAt: string;
  updatedAt: string;
}

export const FinancesApi = {
  get: async () => {
    return api.get<FinancialProfileResponse>("/api/v1/me/finances");
  },

  update: async (data: FinancialProfileData) => {
    const payload = {
      monthly_income: data.monthlyIncome,
      expense: {
        housing: data.housing,
        food: data.food,
        transport: data.transport,
        utilities: data.utilities,
        healthcare: data.healthcare,
        entertainment: data.entertainment,
        insurance: data.insurance,
        other: data.other,
      },
    };
    return api.put<FinancialProfileResponse>("/api/v1/me/finances", payload);
  },
};
