const axios = require('axios');
const api = axios.create({ baseURL: 'http://localhost:5175' });
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (originalRequest.url === '/api/v1/auth/login') {
      console.log('Skipping interceptor for login');
    }
    return Promise.reject(err);
  }
);
