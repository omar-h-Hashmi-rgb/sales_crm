-- Seed data for Sales CRM

-- Insert sample users (one per tier)
INSERT INTO users (name, email, tier_level) VALUES
('Admin User', 'admin@company.com', 1),
('Area Manager John', 'john.manager@company.com', 2),
('Store Manager Sarah', 'sarah.store@company.com', 3),
('Sales Rep Mike', 'mike.sales@company.com', 4),
('Sales Rep Lisa', 'lisa.sales@company.com', 4)
ON CONFLICT (email) DO NOTHING;

-- Insert sample leads
INSERT INTO leads (
    name, phone, email, location, address, services, service_category,
    notes, source, source_campaign_id, source_ad_id, status, is_fresh
) VALUES
('Rajesh Kumar', '+919876543210', 'rajesh@email.com', 'Mumbai', '123 Main St, Mumbai', 
 ARRAY['Car Wash', 'Oil Change'], 'Maintenance', 
 'Interested in monthly car maintenance package', 'meta', 'campaign_123', 'ad_456', 'new', true),

('Priya Sharma', '9876543211', 'priya@email.com', 'Delhi', '456 Park Ave, Delhi',
 ARRAY['Engine Repair', 'AC Service'], 'Repair',
 'Car not starting properly, AC needs check', 'google_ads', 'campaign_789', 'ad_101', 'new', true),

('Amit Patel', '+919876543212', 'amit@email.com', 'Bangalore', '789 Tech City, Bangalore',
 ARRAY['Denting', 'Painting'], 'Cosmetic',
 'Minor accident damage repair needed', 'manual', NULL, NULL, 'contacted', false),

('Sunita Singh', '9876543213', 'sunita@email.com', 'Chennai', '321 Beach Road, Chennai',
 ARRAY['Brake Service', 'Tyre Change'], 'Safety',
 'Brake noise and tyre wear inspection', 'meta', 'campaign_456', 'ad_789', 'follow-up', false),

('Vikram Gupta', '+919876543214', 'vikram@email.com', 'Pune', '654 IT Park, Pune',
 ARRAY['Full Service', 'Detailing'], 'Premium',
 'Regular customer, wants premium service package', 'google_ads', 'campaign_321', 'ad_654', 'qualified', false),

('Neha Reddy', '9876543215', 'neha@email.com', 'Hyderabad', '987 Cyber City, Hyderabad',
 ARRAY['Car Wash', 'Vacuum'], 'Basic',
 'Quick service needed for weekend trip', 'meta', 'campaign_654', 'ad_321', 'new', true),

('Ravi Agarwal', '+919876543216', 'ravi@email.com', 'Kolkata', '147 Park Street, Kolkata',
 ARRAY['Engine Tune-up', 'Battery Check'], 'Maintenance',
 'Car performance issues, battery seems weak', 'manual', NULL, NULL, 'contacted', false),

('Kavita Joshi', '9876543217', 'kavita@email.com', 'Ahmedabad', '258 Commerce Six, Ahmedabad',
 ARRAY['Transmission Service', 'Clutch Repair'], 'Repair',
 'Gear shifting problems, clutch slipping', 'google_ads', 'campaign_987', 'ad_147', 'new', true),

('Deepak Mishra', '+919876543218', 'deepak@email.com', 'Jaipur', '369 Pink City, Jaipur',
 ARRAY['Interior Cleaning', 'Seat Cover'], 'Cosmetic',
 'Interior renovation after long usage', 'meta', 'campaign_147', 'ad_258', 'follow-up', false),

('Anita Kulkarni', '9876543219', 'anita@email.com', 'Nashik', '741 Wine Country, Nashik',
 ARRAY['Wheel Alignment', 'Balancing'], 'Safety',
 'Car pulling to one side while driving', 'google_ads', 'campaign_258', 'ad_369', 'lost', false)
ON CONFLICT DO NOTHING;

-- Assign some leads to users
UPDATE leads SET 
    assigned_to_user_id = (SELECT id FROM users WHERE email = 'mike.sales@company.com' LIMIT 1),
    assigned_to_tier = 4,
    assigned_at = NOW() - INTERVAL '2 days',
    assigned_by_user_id = (SELECT id FROM users WHERE email = 'john.manager@company.com' LIMIT 1),
    is_fresh = false
WHERE name IN ('Amit Patel', 'Sunita Singh', 'Ravi Agarwal');

UPDATE leads SET 
    assigned_to_user_id = (SELECT id FROM users WHERE email = 'lisa.sales@company.com' LIMIT 1),
    assigned_to_tier = 4,
    assigned_at = NOW() - INTERVAL '1 day',
    assigned_by_user_id = (SELECT id FROM users WHERE email = 'john.manager@company.com' LIMIT 1),
    is_fresh = false
WHERE name IN ('Vikram Gupta', 'Deepak Mishra');

-- Insert some sample comments
INSERT INTO lead_comments (lead_id, user_id, comment) VALUES
((SELECT id FROM leads WHERE name = 'Amit Patel' LIMIT 1),
 (SELECT id FROM users WHERE email = 'mike.sales@company.com' LIMIT 1),
 'Called the customer, very interested in our services. Scheduled visit for tomorrow.'),

((SELECT id FROM leads WHERE name = 'Amit Patel' LIMIT 1),
 (SELECT id FROM users WHERE email = 'mike.sales@company.com' LIMIT 1),
 'Customer visited our center. Provided quotation for denting and painting work.'),

((SELECT id FROM leads WHERE name = 'Vikram Gupta' LIMIT 1),
 (SELECT id FROM users WHERE email = 'lisa.sales@company.com' LIMIT 1),
 'Premium customer, very satisfied with our previous services. Ready for monthly package.'),

((SELECT id FROM leads WHERE name = 'Sunita Singh' LIMIT 1),
 (SELECT id FROM users WHERE email = 'mike.sales@company.com' LIMIT 1),
 'Customer needs brake service urgently. Scheduled for this weekend.');

-- Insert sample status history
INSERT INTO lead_status_history (lead_id, old_status, new_status, changed_by_user_id, notes) VALUES
((SELECT id FROM leads WHERE name = 'Amit Patel' LIMIT 1),
 'new', 'contacted',
 (SELECT id FROM users WHERE email = 'mike.sales@company.com' LIMIT 1),
 'Initial contact made, customer responded positively'),

((SELECT id FROM leads WHERE name = 'Sunita Singh' LIMIT 1),
 'contacted', 'follow-up',
 (SELECT id FROM users WHERE email = 'mike.sales@company.com' LIMIT 1),
 'Customer needs time to think, following up next week'),

((SELECT id FROM leads WHERE name = 'Vikram Gupta' LIMIT 1),
 'contacted', 'qualified',
 (SELECT id FROM users WHERE email = 'lisa.sales@company.com' LIMIT 1),
 'Customer qualified for premium package'),

((SELECT id FROM leads WHERE name = 'Anita Kulkarni' LIMIT 1),
 'follow-up', 'lost',
 (SELECT id FROM users WHERE email = 'john.manager@company.com' LIMIT 1),
 'Customer chose competitor, price was the deciding factor');

-- Insert sample bookings
INSERT INTO bookings (
    customer_name, customer_phone, customer_email, location, services,
    date, time_slot, status, lead_id
) VALUES
('Conversion Customer', '+919876543220', 'conversion@email.com', 'Mumbai',
 ARRAY['Car Wash', 'Detailing'], '2024-01-20', '10:00', 'confirmed', NULL),

('Walk-in Customer', '9876543221', 'walkin@email.com', 'Delhi',
 ARRAY['Oil Change'], '2024-01-21', '14:00', 'pending', NULL);

-- Seed data inserted successfully!
-- Default login credentials:
-- Admin: admin@company.com / password123
-- Area Manager: john.manager@company.com / password123
-- Store Manager: sarah.store@company.com / password123
-- Sales Rep: mike.sales@company.com / password123
-- Sales Rep: lisa.sales@company.com / password123