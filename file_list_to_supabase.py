#!/usr/bin/env python3
"""
Script to list all files in the n8n directory and create/populate a Supabase table
"""

import os
import json
from datetime import datetime
from pathlib import Path

def get_all_files(directory_path):
    """Get all files from the specified directory"""
    files_data = []
    directory = Path(directory_path)
    
    if not directory.exists():
        print(f"Error: Directory {directory_path} does not exist")
        return []
    
    print(f"Scanning directory: {directory_path}")
    
    for item in directory.iterdir():
        if item.is_file():
            file_info = {
                'filename': item.name,
                'file_path': str(item),
                'file_extension': item.suffix,
                'file_size': item.stat().st_size,
                'created_at': datetime.now().isoformat(),
                'is_directory': False
            }
            files_data.append(file_info)
        elif item.is_dir():
            file_info = {
                'filename': item.name,
                'file_path': str(item),
                'file_extension': '',
                'file_size': 0,
                'created_at': datetime.now().isoformat(),
                'is_directory': True
            }
            files_data.append(file_info)
    
    return files_data

def create_supabase_table_sql():
    """Generate SQL to create the Supabase table"""
    sql = """
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
    """
    return sql

def generate_insert_statements(files_data):
    """Generate SQL INSERT statements for all files"""
    if not files_data:
        return ""
    
    sql = "INSERT INTO n8n_files (filename, file_path, file_extension, file_size, is_directory) VALUES\n"
    
    values = []
    for file_info in files_data:
        filename = file_info['filename'].replace("'", "''")
        file_path = file_info['file_path'].replace("'", "''")
        file_extension = file_info['file_extension'].replace("'", "''")
        file_size = file_info['file_size']
        is_directory = str(file_info['is_directory']).lower()
        
        value = f"('{filename}', '{file_path}', '{file_extension}', {file_size}, {is_directory})"
        values.append(value)
    
    sql += ",\n".join(values) + ";"
    return sql

def main():
    # Directory to scan
    n8n_directory = "/Users/tushar/Desktop/N8N-Agents/n8n"
    
    print("N8N Files to Supabase Migration Script")
    print("="*50)
    
    # Get all files
    files_data = get_all_files(n8n_directory)
    
    if not files_data:
        print("No files found to process.")
        return
    
    print(f"Found {len(files_data)} items (files and directories)")
    
    # Generate SQL scripts
    create_table_sql = create_supabase_table_sql()
    insert_sql = generate_insert_statements(files_data)
    
    # Save SQL scripts to files
    with open('/Users/tushar/Desktop/N8N-Agents/create_table.sql', 'w') as f:
        f.write(create_table_sql)
    
    with open('/Users/tushar/Desktop/N8N-Agents/insert_files.sql', 'w') as f:
        f.write(insert_sql)
    
    # Save JSON data for reference
    with open('/Users/tushar/Desktop/N8N-Agents/files_data.json', 'w') as f:
        json.dump(files_data, f, indent=2)
    
    print("\nFiles generated:")
    print("1. create_table.sql - SQL to create the Supabase table")
    print("2. insert_files.sql - SQL to insert all file data")
    print("3. files_data.json - JSON data of all files")
    
    print("\nNext steps:")
    print("1. Run create_table.sql in your Supabase SQL editor")
    print("2. Run insert_files.sql in your Supabase SQL editor")
    print("3. Your files will be stored in the 'n8n_files' table")
    
    # Display summary statistics
    txt_files = [f for f in files_data if f['file_extension'] == '.txt']
    json_files = [f for f in files_data if f['file_extension'] == '.json']
    directories = [f for f in files_data if f['is_directory']]
    
    print(f"\nSummary:")
    print(f"- Total items: {len(files_data)}")
    print(f"- Text files (.txt): {len(txt_files)}")
    print(f"- JSON files (.json): {len(json_files)}")
    print(f"- Directories: {len(directories)}")
    print(f"- Other files: {len(files_data) - len(txt_files) - len(json_files) - len(directories)}")
    
    # Show first 10 files
    print(f"\nFirst 10 items:")
    for i, file_info in enumerate(files_data[:10]):
        item_type = "DIR" if file_info['is_directory'] else "FILE"
        print(f"{i+1:2d}. [{item_type}] {file_info['filename']}")

if __name__ == "__main__":
    main()