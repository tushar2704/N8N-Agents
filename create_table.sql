
    -- Create table for storing file information
    CREATE TABLE IF NOT EXISTS n8n_files (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_extension TEXT,
        file_size BIGINT DEFAULT 0,
        is_directory BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create index for faster searches
    CREATE INDEX IF NOT EXISTS idx_n8n_files_filename ON n8n_files(filename);
    CREATE INDEX IF NOT EXISTS idx_n8n_files_extension ON n8n_files(file_extension);
    
    -- Enable Row Level Security (RLS)
    ALTER TABLE n8n_files ENABLE ROW LEVEL SECURITY;
    