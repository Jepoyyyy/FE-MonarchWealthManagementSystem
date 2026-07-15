const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:8080/api/v1/auth/login', {
      email: 'budi.santoso@example.com',
      password: 'Admin123!'
    });
    console.log("BUDI LOGIN:", res.data);
    const token = res.data.accessToken;
    
    try {
      const d = await axios.get('http://localhost:8080/api/v1/me/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("BUDI DASHBOARD:", d.data);
    } catch (e) {
      console.error("BUDI DASHBOARD ERROR:", e.response?.status, e.response?.data);
    }
  } catch (e) {
    console.error("BUDI LOGIN ERROR:", e.response?.data);
  }

  try {
    const res = await axios.post('http://localhost:8080/api/v1/auth/login', {
      email: 'admin@wms.id',
      password: 'Admin123!'
    });
    console.log("ADMIN LOGIN:", res.data);
    const token = res.data.accessToken;
    
    try {
      const d = await axios.get('http://localhost:8080/api/v1/admin-dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("ADMIN DASHBOARD:", d.data);
    } catch (e) {
      console.error("ADMIN DASHBOARD ERROR:", e.response?.status, e.response?.data);
    }
  } catch (e) {
    console.error("ADMIN LOGIN ERROR:", e.response?.data);
  }
}
test();
