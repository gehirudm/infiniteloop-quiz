-- Create clicks table for storing click coordinates
CREATE TABLE IF NOT EXISTS clicks (
  id SERIAL PRIMARY KEY,
  x REAL NOT NULL,
  y REAL NOT NULL,
  image_width INTEGER NOT NULL,
  image_height INTEGER NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is a demo)
CREATE POLICY "Allow all operations on clicks" ON clicks
  FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for the clicks table
ALTER PUBLICATION supabase_realtime ADD TABLE clicks;
