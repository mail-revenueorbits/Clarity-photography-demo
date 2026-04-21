-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    source TEXT,
    note TEXT,
    is_follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all actions for authenticated users (simplified)
CREATE POLICY "Allow all actions for authenticated users" ON leads
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
