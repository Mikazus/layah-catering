-- ============================================================================
-- Layah Catering — Initial Seed Data (002_seed.sql)
-- Default password for all demo accounts: demo1234
-- Uses pgcrypto Blowfish (bf) which produces $2a$10$ hashes compatible with Go bcrypt
-- ============================================================================

-- 1. DEMO USERS (4 Roles)
INSERT INTO users (username, password_hash, full_name, email, phone, role, initials, title)
VALUES
  ('aditya',        crypt('demo1234', gen_salt('bf', 10)), 'Aditya Pratama', 'aditya.pratama@gmail.com', '0812 3456 7890', 'customer',   'AP', 'Customer'),
  ('ayu.pramesti',  crypt('demo1234', gen_salt('bf', 10)), 'Ayu Pramesti',   'ayu.pramesti@layah.id',    '0812 0000 1001', 'kitchen',    'AP', 'Kitchen Staff'),
  ('bagas.kurir',   crypt('demo1234', gen_salt('bf', 10)), 'Bagas Santoso',  'bagas.kurir@layah.id',     '0812 0000 1002', 'driver',     'BS', 'Kurir Lapangan'),
  ('anindya.putri', crypt('demo1234', gen_salt('bf', 10)), 'Anindya Putri',  'anindya.putri@layah.id',   '0812 0000 1003', 'management', 'AP', 'Administrator')
ON CONFLICT (username) DO NOTHING;

-- 2. MENUS
INSERT INTO menus (id, name, description, category, price, is_available, allergens)
VALUES
  ('menu-01', 'Nasi Liwet Nusantara', 'Nasi liwet · ayam suwir · sambal',     'Paket Nasi',   25000, TRUE, ARRAY['Bawang']),
  ('menu-02', 'Ayam Bakar Madu',      'Nasi putih · ayam bakar · lalapan',    'Lauk Pilihan', 22000, TRUE, ARRAY['Madu']),
  ('menu-03', 'Babi Rica',            'Babi rica · nasi · sambal tomat',      'Lauk Pilihan', 35000, TRUE, ARRAY[]::TEXT[]),
  ('menu-04', 'Nasi Rendang Minang',  'Rendang sapi · daun singkong',         'Paket Nasi',   32000, TRUE, ARRAY['Santan']),
  ('menu-05', 'Gado-Gado Betawi',     'Sayuran segar · bumbu kacang',         'Sayuran',      22000, TRUE, ARRAY['Kacang']),
  ('menu-06', 'Ikan Bakar Jimbaran',  'Ikan bakar · nasi · sambal matah',     'Lauk Pilihan', 20000, TRUE, ARRAY['Ikan']),
  ('menu-07', 'Es Teh Manis',         'Sweet iced tea',                       'Minuman',      10000, TRUE, ARRAY[]::TEXT[]),
  ('menu-08', 'Nasi Putih',           'Steamed fragrant white rice',          'Paket Nasi',    8000, TRUE, ARRAY[]::TEXT[])
ON CONFLICT (id) DO NOTHING;

-- 3. ORDERS (Matches KDS Kanban + Driver Verification + History)
INSERT INTO orders (
  id, order_code, receipt_code, customer_name, customer_phone,
  delivery_address, delivery_route, scheduled_time, scheduled_label,
  service_type, status, total_amount, allergy_alert, allergy_instruction,
  created_at
)
VALUES
  (
    'ORD-001', '#ORD-001', 'KTG-0254', 'Nadia Omara', '+62 812 3456 7890',
    'Jl. Kemang Raya No. 18, Jakarta Selatan', 'Selatan · Kemang', '11:30', 'Today, 11:30 WIB',
    'Lunch service · Home delivery', 'incoming', 92000, 'Peanut allergy',
    'WARNING: Peanut Allergy - No peanuts in Gado-Gado. Use clean utensils and a separate preparation area. Avoid cross-contact.',
    NOW() - INTERVAL '4 minutes'
  ),
  (
    'ORD-002', '#ORD-002', 'KTG-0249', 'Lilbah', '+62 813 9981 1102',
    'Jl. Teuku Umar No. 12, Menteng, Jakarta Pusat', 'Pusat · Menteng', '11:45', 'Today, 11:45 WIB',
    'Lunch service · Office delivery', 'incoming', 120000, '', '',
    NOW() - INTERVAL '8 minutes'
  ),
  (
    'ORD-003', '#ORD-003', 'KTG-0250', 'Putri Padang', '+62 811 2245 8890',
    'Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan', 'Selatan · Senopati', '11:15', 'Today, 11:15 WIB',
    'Lunch service · Home delivery', 'preparing', 105000, '', '',
    NOW() - INTERVAL '16 minutes'
  ),
  (
    'ORD-004', '#ORD-004', 'KTG-0251', 'Bianto', '+62 815 7710 3421',
    'Jl. Cikini Raya No. 72, Menteng, Jakarta Pusat', 'Pusat · Cikini', '11:30', 'Today, 11:30 WIB',
    'Lunch service · Office delivery', 'preparing', 200000, 'Shellfish allergy',
    'WARNING: Shellfish Allergy - Ensure zero shrimp paste (terasi) in sambal and clean prep station.',
    NOW() - INTERVAL '22 minutes'
  ),
  (
    'ORD-005', '#ORD-005', 'KTG-0252', 'Justin Bieber', '+62 812 8899 0011',
    'Jl. Cipete Raya No. 9, Jakarta Selatan', 'Selatan · Cipete', '11:00', 'Today, 11:00 WIB',
    'Lunch service · Home delivery', 'ready', 165000, '', '',
    NOW() - INTERVAL '28 minutes'
  ),
  (
    'ORD-006', '#ORD-006', 'KTG-0253', 'Taylor Swift', '+62 818 6612 9087',
    'Jl. Medan Merdeka Selatan No. 5, Gambir, Jakarta Pusat', 'Pusat · Gambir', '11:00', 'Today, 11:00 WIB',
    'Lunch service · Office delivery', 'ready', 72000, '', '',
    NOW() - INTERVAL '32 minutes'
  ),
  (
    'ORD-000', '#ORD-000', 'KTG-0248', 'Ibu Ratna Pratiwi', '+62 812 1990 4412',
    'Jl. Melati No. 18, RT 003/RW 005, Kel. Cilandak Barat, Kec. Cilandak, Jakarta Selatan, DKI Jakarta 12430',
    'Selatan · Cilandak', '10:15', 'Today, 10:15 WIB',
    'Morning catering · Home delivery', 'dispatched', 245000, '', '',
    NOW() - INTERVAL '95 minutes'
  ),
  (
    'ORD-998', '#ORD-998', 'KTG-0245', 'Dewi Anggraini', '+62 811 8877 6655',
    'Jl. Ijen Nirwana Blok B-4, Malang', 'Malang · Tidar Atas', '09:30', 'Today, 09:30 WIB',
    'Breakfast box · Office delivery', 'delivered', 440000, '', '',
    NOW() - INTERVAL '160 minutes'
  )
ON CONFLICT (id) DO NOTHING;

-- 4. ORDER ITEMS
INSERT INTO order_items (order_id, menu_id, menu_name, description, category, quantity, unit_price, allergen_note)
SELECT * FROM (VALUES
  ('ORD-001', 'menu-01', 'Nasi Liwet Nusantara', 'Fragrant rice, traditional accompaniments', 'Main',     2, 25000, ''),
  ('ORD-001', 'menu-05', 'Gado-Gado',            'Vegetable salad · No peanuts',              'Side',     1, 22000, 'No peanuts'),
  ('ORD-001', 'menu-07', 'Es Teh Manis',         'Sweet iced tea',                            'Beverage', 2, 10000, ''),
  ('ORD-002', 'menu-02', 'Ayam Bakar Madu',      'Honey glazed grilled chicken',              'Main',     4, 22000, ''),
  ('ORD-002', 'menu-08', 'Nasi Putih',           'Steamed fragrant white rice',               'Side',     4,  8000, ''),
  ('ORD-003', 'menu-01', 'Nasi Liwet Nusantara', 'Fragrant rice, traditional accompaniments', 'Main',     3, 25000, ''),
  ('ORD-003', 'menu-07', 'Es Teh Manis',         'Sweet iced tea',                            'Beverage', 3, 10000, ''),
  ('ORD-004', 'menu-04', 'Rendang Minang',       'Slow-braised beef rendang',                 'Main',     5, 32000, 'No terasi / shellfish'),
  ('ORD-004', 'menu-08', 'Nasi Putih',           'Steamed fragrant white rice',               'Side',     5,  8000, ''),
  ('ORD-005', 'menu-01', 'Nasi Kuning Komplit',  'Festive turmeric rice platter',             'Main',     3, 30000, ''),
  ('ORD-005', 'menu-02', 'Sate Ayam',            'Charcoal-grilled chicken skewers',          'Side',     3, 25000, ''),
  ('ORD-006', 'menu-01', 'Nasi Liwet Nusantara', 'Fragrant rice, traditional accompaniments', 'Main',     2, 25000, ''),
  ('ORD-006', 'menu-05', 'Gado-Gado',            'Fresh garden vegetables',                   'Side',     1, 22000, ''),
  ('ORD-000', 'menu-01', 'Nasi Liwet Nusantara', 'Fragrant rice, traditional accompaniments', 'Main',     5, 25000, ''),
  ('ORD-000', 'menu-04', 'Nasi Rendang Minang',  'Slow-braised beef rendang',                 'Main',     3, 32000, ''),
  ('ORD-000', 'menu-06', 'Ikan Bakar Jimbaran',  'Grilled fish with sambal matah',            'Main',     1, 24000, ''),
  ('ORD-998', 'menu-02', 'Ayam Bakar Madu',      'Honey glazed grilled chicken',              'Main',    20, 22000, '')
) AS v(order_id, menu_id, menu_name, description, category, quantity, unit_price, allergen_note)
WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = v.order_id AND oi.menu_name = v.menu_name);

-- 5. MEMBERSHIPS
INSERT INTO memberships (member_code, full_name, email, status, joined_date, total_transactions)
VALUES
  ('LRS-001', 'Dewi Anggraini',    'dewi.anggraini@gmail.com',    'Active',   '2025-01-12', 24750000),
  ('LRS-002', 'Budi Santoso',      'budi.santoso@gmail.com',      'Active',   '2025-01-18', 18500000),
  ('LRS-003', 'Siti Rahmawati',    'siti.rahmawati@gmail.com',    'Active',   '2025-02-03', 32250000),
  ('LRS-004', 'Andi Pratama',      'andi.pratama@gmail.com',      'Inactive', '2025-02-15',  6750000),
  ('LRS-005', 'Rina Wulandari',    'rina.wulandari@gmail.com',    'Active',   '2025-02-22', 15000000),
  ('LRS-006', 'Fajar Nugroho',     'fajar.nugroho@gmail.com',     'Active',   '2025-03-08', 21500000),
  ('LRS-007', 'Maya Permatasari',  'maya.permatasari@gmail.com',  'Inactive', '2025-03-19',  4500000),
  ('LRS-008', 'Hendra Wijaya',     'hendra.wijaya@gmail.com',     'Active',   '2025-04-06', 28000000),
  ('LRS-009', 'Nadia Putri',       'nadia.putri@gmail.com',       'Active',   '2025-04-14', 12750000),
  ('LRS-010', 'Rizky Maulana',     'rizky.maulana@gmail.com',     'Inactive', '2025-04-27',  3250000),
  ('LRS-011', 'Kartika Sari',      'kartika.sari@gmail.com',      'Active',   '2025-05-04', 19200000),
  ('LRS-012', 'Dimas Saputra',     'dimas.saputra@gmail.com',     'Active',   '2025-05-16', 14800000),
  ('LRS-013', 'Lestari Handayani', 'lestari.handayani@gmail.com', 'Active',   '2025-05-29', 26400000),
  ('LRS-014', 'Arif Hidayat',      'arif.hidayat@gmail.com',      'Inactive', '2025-06-11',  5100000),
  ('LRS-015', 'Putri Maharani',    'putri.maharani@gmail.com',    'Active',   '2025-06-21', 22900000)
ON CONFLICT (member_code) DO NOTHING;

-- 6. MONTHLY SALES SNAPSHOTS (Jan–Okt 2026)
INSERT INTO monthly_sales_snapshots (
  year, month_num, month_short, period_label, period_range,
  total_orders, total_revenue, active_customers, highlight_note
)
VALUES
  (2026,  1, 'Jan', 'Januari 2026',   '01–31 Januari 2026 · Seluruh pesanan selesai',   68, 48000000, 44, 'Awal tahun berjalan stabil dengan pesanan korporat.'),
  (2026,  2, 'Feb', 'Februari 2026',  '01–28 Februari 2026 · Seluruh pesanan selesai',  76, 56000000, 50, 'Kenaikan 16,7% didorong pesanan acara keluarga.'),
  (2026,  3, 'Mar', 'Maret 2026',     '01–31 Maret 2026 · Seluruh pesanan selesai',     72, 52000000, 48, 'Penyesuaian musiman di akhir kuartal pertama.'),
  (2026,  4, 'Apr', 'April 2026',     '01–30 April 2026 · Seluruh pesanan selesai',     88, 64000000, 58, 'Permintaan paket nasi box meningkat signifikan.'),
  (2026,  5, 'Mei', 'Mei 2026',       '01–31 Mei 2026 · Seluruh pesanan selesai',       82, 60000000, 55, 'Retensi pelanggan aktif terjaga di atas 85%.'),
  (2026,  6, 'Jun', 'Juni 2026',      '01–30 Juni 2026 · Seluruh pesanan selesai',      96, 72000000, 65, 'Peningkatan tajam pada pesanan acara wisuda Malang.'),
  (2026,  7, 'Jul', 'Juli 2026',      '01–31 Juli 2026 · Seluruh pesanan selesai',      93, 68000000, 63, 'Stabil pada segmen langganan kantor harian.'),
  (2026,  8, 'Agu', 'Agustus 2026',   '01–31 Agustus 2026 · Seluruh pesanan selesai',  108, 80000000, 71, 'Lonjakan pesanan acara kemerdekaan mendorong pertumbuhan Agustus.'),
  (2026,  9, 'Sep', 'September 2026', '01–30 September 2026 · Seluruh pesanan selesai', 114, 84000000, 76, 'September stabil meningkat 5,0% dibanding Agustus.'),
  (2026, 10, 'Okt', 'Oktober 2026',   '01–31 Oktober 2026 · Seluruh pesanan selesai',  128, 96000000, 84, 'Oktober tertinggi tahun ini, naik 14,3% dari September.')
ON CONFLICT (period_label) DO NOTHING;
