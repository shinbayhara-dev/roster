
export const INDONESIAN_HOLIDAYS: Record<string, string> = {
    // 2024
    '2024-01-01': 'Tahun Baru 2024 Masehi',
    '2024-02-08': 'Isra Mikraj Nabi Muhammad SAW',
    '2024-02-10': 'Tahun Baru Imlek 2575 Kongzili',
    '2024-03-11': 'Hari Suci Nyepi Tahun Baru Saka 1946',
    '2024-03-29': 'Wafat Isa Al Masih',
    '2024-03-31': 'Hari Paskah',
    '2024-04-10': 'Hari Raya Idul Fitri 1445 Hijriah',
    '2024-04-11': 'Hari Raya Idul Fitri 1445 Hijriah',
    '2024-05-01': 'Hari Buruh Internasional',
    '2024-05-09': 'Kenaikan Isa Al Masih',
    '2024-05-23': 'Hari Raya Waisak 2568 BE',
    '2024-06-01': 'Hari Lahir Pancasila',
    '2024-06-17': 'Hari Raya Idul Adha 1445 Hijriah',
    '2024-07-07': 'Tahun Baru Islam 1446 Hijriah',
    '2024-08-17': 'Hari Kemerdekaan Republik Indonesia',
    '2024-09-16': 'Maulid Nabi Muhammad SAW',
    '2024-12-25': 'Hari Raya Natal',

    // 2025 (Estimasi / Umum)
    '2025-01-01': 'Tahun Baru 2025 Masehi',
    '2025-01-27': 'Isra Mikraj Nabi Muhammad SAW',
    '2025-01-29': 'Tahun Baru Imlek 2576 Kongzili',
    '2025-03-29': 'Hari Suci Nyepi Tahun Baru Saka 1947',
    '2025-03-31': 'Hari Raya Idul Fitri 1446 Hijriah', // Estimasi
    '2025-04-01': 'Hari Raya Idul Fitri 1446 Hijriah',
    '2025-04-18': 'Wafat Isa Al Masih',
    '2025-04-20': 'Hari Paskah',
    '2025-05-01': 'Hari Buruh Internasional',
    '2025-05-12': 'Hari Raya Waisak 2569 BE',
    '2025-05-29': 'Kenaikan Isa Al Masih',
    '2025-06-01': 'Hari Lahir Pancasila',
    '2025-06-06': 'Hari Raya Idul Adha 1446 Hijriah', // Estimasi
    '2025-06-27': 'Tahun Baru Islam 1447 Hijriah',
    '2025-08-17': 'Hari Kemerdekaan Republik Indonesia',
    '2025-09-05': 'Maulid Nabi Muhammad SAW',
    '2025-12-25': 'Hari Raya Natal',

    // 2026 (Estimasi)
    '2026-01-01': 'Tahun Baru 2026 Masehi',
    '2026-02-17': 'Tahun Baru Imlek 2577 Kongzili',
    // Tambahkan data lain sesuai kebutuhan
};

export const getHolidayName = (year: number, month: number, day: number): string | null => {
    // Month is 0-indexed in JS/TS but normally strict YYYY-MM-DD uses 01-12.
    // Our utility might pass 0-11 for month.
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${year}-${monthStr}-${dayStr}`;
    return INDONESIAN_HOLIDAYS[dateKey] || null;
};
