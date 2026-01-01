const run = async () => {
    try {
        const API_URL = 'http://localhost:3001/api';

        // 1. Login
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@cssd.com', password: 'admin123' }),
        });
        const loginData = await loginRes.json();
        const token = loginData.data?.token || loginData.token;

        // 2. Get Schedules for Jan 2026
        // Date range: 2026-01-01 to 2026-01-31
        const schedulesRes = await fetch(`${API_URL}/schedules?startDate=2026-01-01&endDate=2026-01-31&userId=2`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const schedulesData = await schedulesRes.json();

        console.log('Schedules for Singgih (Jan 2026):');
        console.log(JSON.stringify(schedulesData.data, null, 2));

    } catch (e) {
        console.error(e);
    }
};

run();
