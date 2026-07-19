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
    const response = await api.get<any>("/api/v1/me/finances");
    // Transform snake_case backend response to camelCase
    const data = response.data;
    return {
      ...response,
      data: {
        id: data.id,
        monthlyIncome: data.monthly_income || 0,
        housing: data.housing || 0,
        food: data.food || 0,
        transport: data.transport || 0,
        utilities: data.utilities || 0,
        healthcare: data.healthcare || 0,
        entertainment: data.entertainment || 0,
        insurance: data.insurance || 0,
        other: data.other || 0,
        totalExpenses: data.total_expenses || 0,
        createdAt: data.created_at || "",
        updatedAt: data.updated_at || "",
      } as FinancialProfileResponse,
    };
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
    const response = await api.put<any>("/api/v1/me/finances", payload);
    // Transform response
    const respData = response.data;
    return {
      ...response,
      data: {
        id: respData.id,
        monthlyIncome: respData.monthly_income || 0,
        housing: respData.housing || 0,
        food: respData.food || 0,
        transport: respData.transport || 0,
        utilities: respData.utilities || 0,
        healthcare: respData.healthcare || 0,
        entertainment: respData.entertainment || 0,
        insurance: respData.insurance || 0,
        other: respData.other || 0,
        totalExpenses: respData.total_expenses || 0,
        createdAt: respData.created_at || "",
        updatedAt: respData.updated_at || "",
      } as FinancialProfileResponse,
    };
  },
};
