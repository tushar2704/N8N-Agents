# N8N Files to Supabase Setup Guide

## Overview
This guide will help you set up a Supabase table to store all 496 files from your `/Users/tushar/Desktop/N8N-Agents/n8n/` directory.

## Files Generated

1. **`create_table.sql`** - Creates the `n8n_files` table in Supabase
2. **`insert_files.sql`** - Inserts all 496 file records into the table
3. **`files_data.json`** - Raw JSON data of all files (for reference)
4. **`file_list_to_supabase.py`** - The Python script used to generate these files

## Database Schema

The `n8n_files` table includes:
- `id` - Primary key (auto-increment)
- `filename` - Name of the file
- `file_path` - Full path to the file
- `file_extension` - File extension (.txt, .json, etc.)
- `file_size` - Size of the file in bytes
- `is_directory` - Boolean indicating if it's a directory
- `created_at` - Timestamp when record was created
- `updated_at` - Timestamp when record was last updated

## Step-by-Step Setup

### Step 1: Access Your Supabase Dashboard
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in to your account
3. Select your project or create a new one

### Step 2: Create the Table
1. In your Supabase dashboard, go to the **SQL Editor**
2. Open the `create_table.sql` file
3. Copy all the content and paste it into the SQL Editor
4. Click **Run** to execute the SQL

### Step 3: Insert the File Data
1. Still in the SQL Editor, open the `insert_files.sql` file
2. Copy all the content (496 file records) and paste it into the SQL Editor
3. Click **Run** to insert all files

### Step 4: Verify the Data
1. Go to the **Table Editor** in your Supabase dashboard
2. Find the `n8n_files` table
3. You should see 496 records representing all your files

## File Statistics

From your `/Users/tushar/Desktop/N8N-Agents/n8n/` directory:
- **Total files**: 496
- **JSON files**: Automation workflows and configurations
- **TXT files**: Documentation and guides
- **Other files**: Various file types

## Sample Queries

Once your data is in Supabase, you can run queries like:

```sql
-- Get all JSON files
SELECT * FROM n8n_files WHERE file_extension = '.json';

-- Get all TXT files
SELECT * FROM n8n_files WHERE file_extension = '.txt';

-- Search for files by name
SELECT * FROM n8n_files WHERE filename ILIKE '%AI%';

-- Get files larger than 10KB
SELECT * FROM n8n_files WHERE file_size > 10240;

-- Count files by extension
SELECT file_extension, COUNT(*) as count 
FROM n8n_files 
GROUP BY file_extension 
ORDER BY count DESC;
```

## API Access

After setting up the table, you can access your file data via Supabase's REST API:

```javascript
// Example: Get all files
const { data, error } = await supabase
  .from('n8n_files')
  .select('*');

// Example: Search for specific files
const { data, error } = await supabase
  .from('n8n_files')
  .select('*')
  .ilike('filename', '%automation%');
```

## Security Notes

- Row Level Security (RLS) has been enabled on the table
- You may need to create policies based on your security requirements
- Consider who should have read/write access to this file data

## Troubleshooting

### Common Issues:
1. **SQL Error**: Make sure you run `create_table.sql` before `insert_files.sql`
2. **Permission Error**: Check your Supabase project permissions
3. **Large Insert**: The insert file is large (496 records), it may take a moment to execute

### Need to Re-run?
If you need to regenerate the files:
```bash
python3 /Users/tushar/Desktop/N8N-Agents/file_list_to_supabase.py
```

## Next Steps

1. Set up the Supabase table using the provided SQL files
2. Verify all 496 files are properly inserted
3. Create any additional indexes or policies as needed
4. Start building applications that use this file metadata

---

**Note**: This setup stores metadata about your files (names, paths, sizes) in Supabase. The actual file content remains in your local directory.