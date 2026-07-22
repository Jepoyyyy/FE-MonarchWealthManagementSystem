import { APIRequestContext } from '@playwright/test';

export const API_BASE_URL = 'http://localhost:8080/api/v1';

export class AuthApiClient {
  constructor(private request: APIRequestContext) {}

  async register(data?: any) {
    const startTime = Date.now();
    const response = await this.request.post(`${API_BASE_URL}/auth/register`, {
      data,
    });
    const duration = Date.now() - startTime;
    return { response, duration };
  }

  async login(data?: any) {
    const startTime = Date.now();
    const response = await this.request.post(`${API_BASE_URL}/auth/login`, {
      data,
    });
    const duration = Date.now() - startTime;
    return { response, duration };
  }

  async logout(accessToken?: string) {
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    const startTime = Date.now();
    const response = await this.request.post(`${API_BASE_URL}/auth/logout`, {
      headers,
    });
    const duration = Date.now() - startTime;
    return { response, duration };
  }

  async refresh(refreshToken?: any) {
    const startTime = Date.now();
    const payload = typeof refreshToken === 'object' ? refreshToken : { refreshToken };
    const response = await this.request.post(`${API_BASE_URL}/auth/refresh`, {
      data: payload,
    });
    const duration = Date.now() - startTime;
    return { response, duration };
  }

  async completeRiskProfile(accessToken: string) {
    const startTime = Date.now();
    const response = await this.request.put(`${API_BASE_URL}/me/profiler`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        answers: [
          { questionnaireAnswer: "Protect my capital — I cannot afford to lose money", score: 0 },
          { questionnaireAnswer: "Less than 1 year — I need liquidity soon", score: 0 },
          { questionnaireAnswer: "Sell everything to stop further losses", score: 0 },
          { questionnaireAnswer: "Less than 10% — only comfortable surplus", score: 0 },
          { questionnaireAnswer: "No experience — this is my first time investing", score: 0 }
        ]
      }
    });
    const duration = Date.now() - startTime;
    return { response, duration };
  }
}
