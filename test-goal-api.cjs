const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:8080/api/v1/auth/login', {
      email: 'budi@mail.com',
      password: 'User123!'
    });
    console.log("LOGIN SUCCESS:", loginRes.data);
    const token = loginRes.data.token || loginRes.data.accessToken;

    const payload = {
      name: "Car Purchase",
      type: "vehicle",
      target_amount: 300000000,
      monthly_contribution: 0,
      target_date: "2030-07-19",
      is_priority: false,
      current_amount: 200000,
      notes: ""
    };

    try {
      const res = await axios.post('http://localhost:8080/api/v1/me/goals', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("CREATE GOAL SUCCESS:", res.data);
    } catch (e) {
      console.error("CREATE GOAL ERROR:", e.response?.status, JSON.stringify(e.response?.data, null, 2));
    }
  } catch (e) {
    console.error("LOGIN ERROR:", e.response?.status, JSON.stringify(e.response?.data, null, 2));
  }
}
test();
