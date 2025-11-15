-- Create database tables for Sales CRM

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    tier_level INTEGER NOT NULL, -- 1=Admin, 2=Area Manager, 3=Store Manager, 4=Sales Rep
    company_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID, -- Can be NULL for standalone version
    
    -- Source
    source VARCHAR(50) NOT NULL, -- 'meta', 'google_ads', 'manual'
    source_campaign_id VARCHAR(255),
    source_ad_id VARCHAR(255),
    
    -- Contact Info
    name TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    location TEXT,
    address TEXT,
    
    -- Details
    services TEXT[],
    service_category VARCHAR(100),
    notes TEXT,
    
    -- Assignment
    assigned_to_user_id UUID,
    assigned_to_tier INTEGER,
    assigned_at TIMESTAMPTZ,
    assigned_by_user_id UUID,
    
    -- Status
    status VARCHAR(50) DEFAULT 'new',
    is_fresh BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Conversion
    converted_to_booking_id UUID,
    converted_to_customer_id INTEGER,
    converted_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_contacted_at TIMESTAMPTZ
);

-- Lead comments table
CREATE TABLE IF NOT EXISTS lead_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Lead status history table
CREATE TABLE IF NOT EXISTS lead_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_user_id UUID NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID,
    customer_name TEXT NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    location TEXT,
    services TEXT[],
    date DATE,
    time_slot TIME,
    status VARCHAR(50) DEFAULT 'pending',
    lead_id UUID REFERENCES leads(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_lead_comments_lead_id ON lead_comments(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_status_history_lead_id ON lead_status_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_lead_id ON bookings(lead_id);

-- Add foreign key constraints (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_leads_assigned_to_user'
    ) THEN
        ALTER TABLE leads ADD CONSTRAINT fk_leads_assigned_to_user 
        FOREIGN KEY (assigned_to_user_id) REFERENCES users(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_leads_assigned_by_user'
    ) THEN
        ALTER TABLE leads ADD CONSTRAINT fk_leads_assigned_by_user 
        FOREIGN KEY (assigned_by_user_id) REFERENCES users(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_lead_comments_user'
    ) THEN
        ALTER TABLE lead_comments ADD CONSTRAINT fk_lead_comments_user 
        FOREIGN KEY (user_id) REFERENCES users(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_lead_status_history_user'
    ) THEN
        ALTER TABLE lead_status_history ADD CONSTRAINT fk_lead_status_history_user 
        FOREIGN KEY (changed_by_user_id) REFERENCES users(id);
    END IF;
END $$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for leads table
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Migration completed successfully!