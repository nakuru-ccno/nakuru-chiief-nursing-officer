
-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  date DATE NOT NULL,
  duration INTEGER,
  facility TEXT DEFAULT 'HQ',
  description TEXT,
  submitted_by TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Users can manage activities" ON activities
  FOR ALL USING (true);

-- Create policy to allow read access for anonymous users (for demo purposes)
CREATE POLICY "Anonymous users can read activities" ON activities
  FOR SELECT USING (true);
