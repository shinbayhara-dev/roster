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
        const userId = loginData.data?.user?.id || 1;

        // 2. Create Schedule
        // Shift ID 1 = Pagi (usually, checking schema inserts)
        // Unit ID = null (testing my nullable fix)
        console.log("Attempting to create schedule for Admin (User 1) on 2026-01-02...");

        const payload = {
            userId: userId,
            shiftId: 1, // Pagi
            unitId: null, // Nullable test
            date: '2026-01-02',
            status: 'scheduled'
        };

        const createRes = await fetch(`${API_URL}/schedules`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload),
        });

        const createData = await createRes.json();
        console.log('Create Response:', JSON.stringify(createData, null, 2));

    } catch (e) {
        console.error(e);
    }
};

run();
