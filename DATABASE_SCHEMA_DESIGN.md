# Supabase Database Schema Design for N8N Workflows Repository

## Overview

This database schema is designed to store and organize N8N workflow files (both JSON and TXT formats) from your GitHub repository, with full support for categorization, search functionality, and efficient data retrieval.

## Schema Architecture

### Core Tables

#### 1. `categories`
Stores information about workflow categories based on repository folders.

```sql
- id: UUID (Primary Key)
- category_id: Unique identifier (e.g., 'ai-ml')
- name: Folder name (e.g., 'AI_ML')
- display_name: Human-readable name (e.g., 'AI & Machine Learning')
- description: Category description
- icon: Emoji or icon identifier
- folder_name: Actual repository folder name
- workflow_count: Auto-updated count of workflows
- is_active: Boolean flag for active categories
- created_at, updated_at: Timestamps
```

#### 2. `workflows`
Main table storing workflow files and their metadata.

```sql
- id: UUID (Primary Key)
- category_id: Foreign key to categories
- name: Workflow display name
- filename: Original filename with extension
- file_type: 'json' or 'txt'
- description: Workflow description
- content: JSONB field for parsed JSON content
- raw_content: TEXT field for raw content
- file_size: File size in bytes
- workflow_name: Extracted from JSON 'name' field
- workflow_id: Extracted from JSON 'id' field
- node_count: Number of nodes in workflow
- has_webhook: Boolean flag for webhook triggers
- has_ai_nodes: Boolean flag for AI/ML nodes
- search_vector: Full-text search vector (auto-generated)
- tags: Array of tags
- file_path: Relative path from repository root
- file_hash: SHA256 hash for change detection
- created_at, updated_at, last_synced_at: Timestamps
```

#### 3. `workflow_nodes`
Detailed information about individual nodes within workflows.

```sql
- id: UUID (Primary Key)
- workflow_id: Foreign key to workflows
- node_id: Node ID from JSON
- node_name: Node display name
- node_type: Node type (e.g., 'n8n-nodes-base.webhook')
- node_category: Category (trigger, action, transform)
- parameters: JSONB field for node parameters
- position_x, position_y: Node coordinates
- created_at: Timestamp
```

#### 4. `workflow_connections`
Stores connections between workflow nodes.

```sql
- id: UUID (Primary Key)
- workflow_id: Foreign key to workflows
- source_node_id: Source node identifier
- target_node_id: Target node identifier
- connection_type: Type of connection (main, error, etc.)
- created_at: Timestamp
```

#### 5. `tags`
Manages workflow tags for better organization.

```sql
- id: UUID (Primary Key)
- name: Tag name
- description: Tag description
- color: Hex color code for UI
- usage_count: Auto-updated usage counter
- created_at: Timestamp
```

#### 6. `workflow_tags`
Junction table for many-to-many relationship between workflows and tags.

#### 7. `sync_logs`
Tracks synchronization operations with the repository.

```sql
- id: UUID (Primary Key)
- sync_type: 'full', 'incremental', 'category'
- status: 'started', 'completed', 'failed'
- files_processed, files_added, files_updated, files_deleted: Counters
- error_message: Error details if sync fails
- started_at, completed_at: Timestamps
- duration_ms: Sync duration
```

## Key Features

### 1. **Full-Text Search**
- Automatic search vector generation using PostgreSQL's `tsvector`
- Searches across workflow names, descriptions, tags, and content
- GIN indexes for fast search performance

### 2. **Category Management**
- Matches your repository's folder structure exactly
- Auto-updates workflow counts per category
- Supports category activation/deactivation

### 3. **File Type Support**
- Handles both JSON and TXT workflow files
- JSON files: Parsed content stored in JSONB for querying
- TXT files: Raw content stored for full-text search

### 4. **Metadata Extraction**
- Automatically extracts workflow metadata from JSON files
- Counts nodes and identifies special node types (webhooks, AI)
- Stores node relationships and positions

### 5. **Change Detection**
- SHA256 file hashing for detecting changes
- Sync logging for tracking repository updates
- Incremental sync support

### 6. **Performance Optimization**
- Strategic indexes on commonly queried fields
- JSONB for efficient JSON querying
- Automatic trigger functions for data consistency

## Search Capabilities

### Basic Search Queries

```sql
-- Search workflows by text
SELECT w.*, c.display_name as category_name
FROM workflows w
JOIN categories c ON w.category_id = c.id
WHERE w.search_vector @@ plainto_tsquery('english', 'AI automation');

-- Search by category
SELECT * FROM workflows w
JOIN categories c ON w.category_id = c.id
WHERE c.category_id = 'ai-ml';

-- Search by tags
SELECT * FROM workflows
WHERE tags && ARRAY['ai', 'webhook'];

-- Search by node type
SELECT DISTINCT w.*
FROM workflows w
JOIN workflow_nodes wn ON w.id = wn.workflow_id
WHERE wn.node_type LIKE '%openai%';
```

### Advanced Search Features

```sql
-- Ranked search results
SELECT w.*, 
       ts_rank(w.search_vector, plainto_tsquery('english', 'search_term')) as rank
FROM workflows w
WHERE w.search_vector @@ plainto_tsquery('english', 'search_term')
ORDER BY rank DESC;

-- Filter by file type and category
SELECT w.*, c.display_name
FROM workflows w
JOIN categories c ON w.category_id = c.id
WHERE w.file_type = 'json'
  AND c.category_id IN ('ai-ml', 'finance-accounting')
  AND w.has_webhook = true;
```

## Data Population Strategy

### 1. **Initial Setup**
- Categories are pre-populated based on your repository structure
- Common tags are pre-defined

### 2. **File Synchronization**
- Scan repository folders matching category `folder_name`
- Parse JSON files to extract metadata
- Generate file hashes for change detection
- Update search vectors automatically

### 3. **Incremental Updates**
- Compare file hashes to detect changes
- Update only modified files
- Track sync operations in `sync_logs`

## API Integration Points

### Essential API Endpoints to Build

1. **GET /api/categories** - List all categories with workflow counts
2. **GET /api/workflows** - List workflows with filtering and search
3. **GET /api/workflows/:id** - Get specific workflow details
4. **POST /api/search** - Advanced search with filters
5. **GET /api/tags** - List available tags
6. **POST /api/sync** - Trigger repository synchronization

### Example API Response Structure

```json
{
  "workflows": [
    {
      "id": "uuid",
      "name": "Auto-tag Blog Posts",
      "category": {
        "id": "ai-ml",
        "name": "AI & Machine Learning",
        "icon": "🤖"
      },
      "file_type": "json",
      "description": "Automatically categorize blog posts using AI",
      "tags": ["ai", "content", "automation"],
      "node_count": 8,
      "has_webhook": true,
      "has_ai_nodes": true,
      "created_at": "2024-01-15T10:30:00Z",
      "file_size": 15420
    }
  ],
  "total": 156,
  "categories": [...],
  "tags": [...]
}
```

## Benefits of This Schema

1. **Scalability**: Handles thousands of workflows efficiently
2. **Flexibility**: Supports both JSON and TXT files
3. **Search Performance**: Full-text search with ranking
4. **Data Integrity**: Automatic triggers maintain consistency
5. **Analytics Ready**: Built-in counters and sync tracking
6. **Future-Proof**: Extensible design for new features

## Next Steps

1. **Create Supabase Project**: Set up your Supabase instance
2. **Run Schema**: Execute the SQL schema file
3. **Build Sync Service**: Create a service to populate data from your repository
4. **Implement API**: Build REST API endpoints for your frontend
5. **Update Frontend**: Integrate with the new backend

This schema provides a robust foundation for managing your N8N workflows with excellent search capabilities and room for future enhancements.