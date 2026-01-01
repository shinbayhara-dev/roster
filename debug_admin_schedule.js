const run = async () => {
    try {
        const API_URL = 'http://localhost:3001/api';

        // 1. Login to get token
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@cssd.com', password: 'admin123' }),
        });
        const loginData = await loginRes.json();
        const token = loginData.data?.token || loginData.token;
        const user = loginData.data?.user || loginData.user;

        console.log('Logged in User:', user);

        // 2. Get Schedules for Admin (User ID 1) for Jan 2026
        const schedulesRes = await fetch(`${API_URL}/schedules?startDate=2026-01-01&endDate=2026-01-31&userId=${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const schedulesData = await schedulesRes.json();

        console.log(`Schedules for User ${user.id} (Jan 2026):`);
        console.log(JSON.stringify(schedulesData.data, null, 2));

    } catch (e) {
        console.error(e);
    }
};

run();
