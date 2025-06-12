# N8N Workflow Database Schema Design

## Overview

This database schema is designed to store and organize N8N workflow files (both JSON and TXT formats) from your GitHub repository, with full support for categorization, search functionality, lead generation, and efficient data retrieval.

## Schema Architecture

### Core Tables

#### 1. `categories`
Stores information about workflow categories based on repository folders.

```sql
- id: UUID (Primary Key)
- name: Category name (e.g., 'AI_ML')
- description: Category description
- icon: Emoji or icon identifier
- workflow_count: Auto-updated count of workflows (default: 0)
- created_at, updated_at: Timestamps
```

#### 2. `workflows`
Main table storing workflow files and their metadata.

```sql
- id: UUID (Primary Key)
- name: Workflow display name (required)
- description: Workflow description
- category_id: Foreign key to categories (nullable)
- file_path: Path to workflow file (required)
- file_type: 'json' or 'txt' (required)
- file_size: File size in bytes
- original_filename: Original filename with extension
- n8n_workflow_id: Extracted from JSON 'id' field
- node_count: Number of nodes in workflow (default: 0)
- connection_count: Number of connections (default: 0)
- complexity_score: Workflow complexity rating (default: 0)
- is_active: Boolean flag for active workflows (default: true)
- search_vector: Full-text search vector (auto-generated)
- metadata: JSONB field for additional data (default: '{}')
- created_at, updated_at, last_synced_at: Timestamps
```

#### 3. `workflow_nodes`
Detailed information about individual nodes within workflows.

```sql
- id: UUID (Primary Key)
- workflow_id: Foreign key to workflows (cascade delete)
- node_id: Node ID from JSON (required)
- node_name: Node display name
- node_type: Node type (e.g., 'n8n-nodes-base.webhook')
- node_type_version: Version of the node type
- position_x, position_y: Node coordinates (float)
- parameters: JSONB field for node parameters (default: '{}')
- credentials: JSONB field for credential info (default: '{}')
- is_disabled: Boolean flag for disabled nodes (default: false)
- notes: Node notes/comments
- created_at: Timestamp
```

#### 4. `workflow_connections`
Stores connections between workflow nodes.

```sql
- id: UUID (Primary Key)
- workflow_id: Foreign key to workflows (cascade delete)
- source_node_id: Source node identifier (required)
- target_node_id: Target node identifier (required)
- source_output_index: Output index (default: 0)
- target_input_index: Input index (default: 0)
- connection_type: Type of connection (default: 'main')
- created_at: Timestamp
```

#### 5. `tags`
Manages workflow tags for better organization.

```sql
- id: UUID (Primary Key)
- name: Tag name (unique, required)
- description: Tag description
- color: Hex color code for UI (default: '#3B82F6')
- usage_count: Auto-updated usage counter (default: 0)
- created_at: Timestamp
```

#### 6. `workflow_tags`
Junction table for many-to-many relationship between workflows and tags.

```sql
- workflow_id: Foreign key to workflows (cascade delete)
- tag_id: Foreign key to tags (cascade delete)
- created_at: Timestamp
- PRIMARY KEY (workflow_id, tag_id)
```

#### 7. `sync_logs`
Tracks synchronization operations with the repository.

```sql
- id: UUID (Primary Key)
- operation_type: Type of sync operation (required)
- file_path: Path to synced file
- status: 'success', 'error', or 'skipped' (required)
- error_message: Error details if sync fails
- files_processed: Number of files processed (default: 0)
- workflows_created: Number of workflows created (default: 0)
- workflows_updated: Number of workflows updated (default: 0)
- workflows_deleted: Number of workflows deleted (default: 0)
- duration_ms: Sync duration in milliseconds
- metadata: JSONB field for additional data (default: '{}')
- created_at: Timestamp
```

#### 8. `leads`
Stores lead generation data from website forms.

```sql
- id: UUID (Primary Key)
- name: Lead's full name (required)
- email: Lead's email address (required)
- company: Company name
- use_case: Description of intended use case
- interest_level: 'low', 'medium', or 'high'
- source: Lead source (default: 'modal_popup')
- ip_address: IP address (INET type)
- user_agent: Browser user agent string
- referrer_url: Referring URL
- utm_source: UTM source parameter
- utm_medium: UTM medium parameter
- utm_campaign: UTM campaign parameter
- consent_marketing: Marketing consent (default: false)
- consent_data_processing: Data processing consent (default: true)
- status: 'new', 'contacted', 'qualified', 'converted', or 'archived' (default: 'new')
- notes: Additional notes
- metadata: JSONB field for additional data (default: '{}')
- created_at, updated_at: Timestamps
```

## Database Features

### 1. **Full-Text Search**
- Automatic generation of search vectors from workflow content
- Support for searching across names, descriptions, and content
- Weighted search results (name > description > content)
- GIN indexes for optimal search performance

### 2. **File Synchronization**
- Scan repository folders based on category structure
- Parse JSON files to extract metadata and node information
- Track sync operations in `sync_logs` table
- Update search vectors automatically

### 3. **Auto-updating Counters**
- Category workflow counts update automatically via triggers
- Tag usage counts maintained via triggers
- Performance optimized with PostgreSQL functions

### 4. **Lead Generation**
- Comprehensive lead capture from website forms
- UTM tracking and analytics support
- GDPR-compliant consent management
- Lead status workflow management

### 5. **Database Functions & Triggers**
- `update_workflow_count()` - Updates category workflow counts
- `update_tag_usage_count()` - Updates tag usage counts
- `update_updated_at_column()` - Updates timestamp columns
- Automatic triggers on INSERT/UPDATE/DELETE operations

## Pre-populated Data

### Categories
The database comes with pre-configured categories:

```sql
-- Essential workflow categories
INSERT INTO categories (name, description, icon) VALUES
('AI_ML', 'Artificial Intelligence and Machine Learning workflows', '🤖'),
('Data_Processing', 'Data transformation and processing workflows', '📊'),
('Web_Scraping', 'Web scraping and data extraction workflows', '🕷️'),
('Social_Media', 'Social media automation and management', '📱'),
('Email_Marketing', 'Email campaigns and marketing automation', '📧'),
('E_Commerce', 'E-commerce and online store automation', '🛒'),
('Finance', 'Financial data processing and analysis', '💰'),
('Productivity', 'General productivity and utility workflows', '⚡');
```

### Tags
Common workflow tags are pre-populated:

```sql
-- Common workflow tags
INSERT INTO tags (name, description, color) VALUES
('automation', 'General automation workflows', '#3B82F6'),
('ai', 'Artificial Intelligence related', '#8B5CF6'),
('data', 'Data processing and analysis', '#10B981'),
('webhook', 'Workflows with webhook triggers', '#F59E0B'),
('api', 'API integration workflows', '#EF4444'),
('scheduled', 'Time-based scheduled workflows', '#6366F1'),
('notification', 'Notification and alerting workflows', '#EC4899'),
('beginner', 'Beginner-friendly workflows', '#84CC16');
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
SELECT w.*, c.name as category_name
FROM workflows w
JOIN categories c ON w.category_id = c.id
WHERE w.file_type = 'json'
  AND c.name IN ('AI_ML', 'Finance')
  AND w.is_active = true;
```

## Data Population Strategy

### 1. **Initial Setup**
- Categories are pre-populated with essential workflow types
- Common tags are pre-defined for immediate use
- Database functions and triggers are automatically created

### 2. **File Synchronization**
- Scan repository folders based on category structure
- Parse JSON files to extract metadata and node information
- Track sync operations in `sync_logs` table
- Update search vectors automatically

### 3. **Incremental Updates**
- Monitor file changes through sync operations
- Update only modified workflows
- Maintain referential integrity through cascade operations
- Track all operations in sync logs for auditing

## API Integration Points

### Essential API Endpoints to Build

1. **GET /api/categories** - List all categories with workflow counts
2. **GET /api/workflows** - List workflows with filtering and search
3. **GET /api/workflows/:id** - Get specific workflow details
4. **POST /api/search** - Advanced search with filters
5. **GET /api/tags** - List available tags
6. **POST /api/sync** - Trigger repository synchronization
7. **POST /api/leads** - Create new lead from form submission
8. **GET /api/leads** - List leads with filtering

### Example API Response Structure

```json
{
  "workflows": [
    {
      "id": "uuid",
      "name": "Auto-tag Blog Posts",
      "category": {
        "id": "uuid",
        "name": "AI_ML",
        "icon": "🤖"
      },
      "file_type": "json",
      "description": "Automatically categorize blog posts using AI",
      "tags": ["ai", "content", "automation"],
      "node_count": 8,
      "connection_count": 12,
      "complexity_score": 75,
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "file_size": 15420,
      "file_path": "/AI_ML/auto-tag-blog-posts.json"
    }
  ],
  "total": 156,
  "categories": [...],
  "tags": [...]
}
```

### Performance Considerations

1. **Indexing Strategy**
   - Primary keys (UUIDs) with B-tree indexes
   - Foreign key indexes for join performance
   - GIN indexes on search vectors and JSONB fields
   - Unique constraints on critical fields (tag names, etc.)
   - Composite indexes on frequently queried combinations

2. **Query Optimization**
   - Use materialized views for complex aggregations
   - Implement query result caching
   - Optimize full-text search queries with proper weighting
   - Efficient cascade deletes with foreign key constraints

3. **Storage Optimization**
   - JSONB compression for large workflow content and metadata
   - Proper text field sizing with appropriate limits
   - Archive old sync logs periodically
   - Use INET type for IP addresses in leads table

4. **Data Integrity**
   - Cascade deletes for workflow-related data
   - Check constraints for enum-like fields
   - NOT NULL constraints on required fields
   - Default values to prevent null-related issues

## Benefits of This Schema

1. **Scalability**: Handles thousands of workflows efficiently
2. **Flexibility**: Supports both JSON and TXT files with extensible metadata
3. **Search Performance**: Full-text search with ranking and filtering
4. **Data Integrity**: Automatic triggers maintain consistency
5. **Analytics Ready**: Built-in counters and comprehensive sync tracking
6. **Lead Management**: Complete lead generation and tracking system
7. **Future-Proof**: Extensible design for new features

## Next Steps

1. **Create Supabase Project**: Set up your Supabase instance
2. **Run Schema**: Execute the SQL schema file to create all tables and functions
3. **Build Sync Service**: Create a service to populate data from your repository
4. **Implement API**: Build REST API endpoints for your frontend
5. **Update Frontend**: Integrate with the new backend and lead generation
6. **Test Lead Forms**: Verify lead capture functionality

This schema provides a robust foundation for managing your N8N workflows with excellent search capabilities, lead generation, and room for future enhancements.