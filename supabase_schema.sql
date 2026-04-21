-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_number TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    session_type TEXT,
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    is_custom_slot BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deliverables TEXT,
    deliverable_due_date DATE,
    is_delivered BOOLEAN DEFAULT FALSE,
    baby_birthday DATE,
    source TEXT,
    package TEXT,
    notes TEXT,
    payment JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all actions for authenticated users (simplified)
CREATE POLICY "Allow all actions for authenticated users" ON sessions
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
