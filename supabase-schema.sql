-- Supabase Database Schema for N8N Workflows Repository
-- This schema supports categorized storage of JSON/TXT workflow files with search capabilities

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'ai-ml', 'finance-accounting'
    name VARCHAR(255) NOT NULL, -- e.g., 'AI_ML', 'Finance_Accounting'
    display_name VARCHAR(255) NOT NULL, -- e.g., 'AI & Machine Learning'
    description TEXT,
    icon VARCHAR(50), -- emoji or icon identifier
    folder_name VARCHAR(255) NOT NULL, -- actual folder name in repository
    workflow_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflows table
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL, -- workflow display name
    filename VARCHAR(500) NOT NULL, -- actual filename with extension
    file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('json', 'txt')),
    description TEXT,
    content JSONB, -- for JSON files, store parsed content
    raw_content TEXT, -- for TXT files or raw JSON content
    file_size INTEGER, -- file size in bytes
    
    -- Metadata extracted from workflow content
    workflow_name VARCHAR(500), -- extracted from JSON 'name' field
    workflow_id VARCHAR(100), -- extracted from JSON 'id' field
    node_count INTEGER, -- number of nodes in the workflow
    has_webhook BOOLEAN DEFAULT false, -- whether workflow has webhook trigger
    has_ai_nodes BOOLEAN DEFAULT false, -- whether workflow uses AI/ML nodes
    
    -- Search and indexing fields
    search_vector TSVECTOR, -- full-text search vector
    tags TEXT[], -- array of tags for categorization
    
    -- File management
    file_path TEXT, -- relative path from repository root
    file_hash VARCHAR(64), -- SHA256 hash for change detection
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_nodes table for detailed node information
CREATE TABLE workflow_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    node_id VARCHAR(100) NOT NULL, -- node ID from JSON
    node_name VARCHAR(500), -- node display name
    node_type VARCHAR(200) NOT NULL, -- e.g., 'n8n-nodes-base.webhook'
    node_category VARCHAR(100), -- e.g., 'trigger', 'action', 'transform'
    parameters JSONB, -- node parameters
    position_x INTEGER, -- x coordinate
    position_y INTEGER, -- y coordinate
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_connections table for node relationships
CREATE TABLE workflow_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    source_node_id VARCHAR(100) NOT NULL,
    target_node_id VARCHAR(100) NOT NULL,
    connection_type VARCHAR(50) DEFAULT 'main', -- main, error, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tags table for better tag management
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7), -- hex color code
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_tags junction table
CREATE TABLE workflow_tags (
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (workflow_id, tag_id)
);

-- Create sync_logs table for tracking repository synchronization
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_type VARCHAR(50) NOT NULL, -- 'full', 'incremental', 'category'
    status VARCHAR(20) NOT NULL, -- 'started', 'completed', 'failed'
    files_processed INTEGER DEFAULT 0,
    files_added INTEGER DEFAULT 0,
    files_updated INTEGER DEFAULT 0,
    files_deleted INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER
);

-- Create indexes for performance
CREATE INDEX idx_workflows_category_id ON workflows(category_id);
CREATE INDEX idx_workflows_file_type ON workflows(file_type);
CREATE INDEX idx_workflows_search_vector ON workflows USING gin(search_vector);
CREATE INDEX idx_workflows_tags ON workflows USING gin(tags);
CREATE INDEX idx_workflows_filename ON workflows(filename);
CREATE INDEX idx_workflows_updated_at ON workflows(updated_at);
CREATE INDEX idx_workflow_nodes_workflow_id ON workflow_nodes(workflow_id);
CREATE INDEX idx_workflow_nodes_type ON workflow_nodes(node_type);
CREATE INDEX idx_categories_category_id ON categories(category_id);
CREATE INDEX idx_categories_folder_name ON categories(folder_name);

-- Create full-text search index
CREATE INDEX idx_workflows_search ON workflows USING gin(to_tsvector('english', 
    COALESCE(name, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(workflow_name, '') || ' ' ||
    COALESCE(array_to_string(tags, ' '), '')
));

-- Create trigger to update search_vector automatically
CREATE OR REPLACE FUNCTION update_workflow_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.name, '') || ' ' || 
        COALESCE(NEW.description, '') || ' ' || 
        COALESCE(NEW.workflow_name, '') || ' ' ||
        COALESCE(array_to_string(NEW.tags, ' '), '')
    );
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_workflow_search_vector
    BEFORE INSERT OR UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_search_vector();

-- Create function to update category workflow counts
CREATE OR REPLACE FUNCTION update_category_workflow_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE categories 
        SET workflow_count = workflow_count + 1,
            updated_at = NOW()
        WHERE id = NEW.category_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE categories 
        SET workflow_count = workflow_count - 1,
            updated_at = NOW()
        WHERE id = OLD.category_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.category_id != NEW.category_id THEN
            UPDATE categories 
            SET workflow_count = workflow_count - 1,
                updated_at = NOW()
            WHERE id = OLD.category_id;
            
            UPDATE categories 
            SET workflow_count = workflow_count + 1,
                updated_at = NOW()
            WHERE id = NEW.category_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_workflow_count
    AFTER INSERT OR UPDATE OR DELETE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_category_workflow_count();

-- Create function to update tag usage counts
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_usage_count
    AFTER INSERT OR DELETE ON workflow_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_usage_count();

-- Insert initial categories based on repository structure
INSERT INTO categories (category_id, name, display_name, description, icon, folder_name) VALUES
('ai-ml', 'AI_ML', 'AI & Machine Learning', 'Intelligent automation workflows powered by AI and ML technologies', '🤖', 'AI_ML'),
('ai-research-rag-data-analysis', 'AI_Research_RAG_and_Data_Analysis', 'AI Research & Data Analysis', 'Advanced AI research workflows with RAG, vector databases, and data analysis', '🔬', 'AI_Research_RAG_and_Data_Analysis'),
('agriculture', 'Agriculture', 'Agriculture', 'Smart farming and agricultural automation workflows', '🌾', 'Agriculture'),
('airtable', 'Airtable', 'Airtable', 'Airtable integration and database automation workflows', '📊', 'Airtable'),
('automotive', 'Automotive', 'Automotive', 'Connected car and automotive industry automation workflows', '🚗', 'Automotive'),
('creative-content', 'Creative_Content', 'Creative Content', 'Content creation and creative automation workflows', '🎨', 'Creative_Content'),
('data-analytics', 'Data_Analytics', 'Data Analytics', 'Data analysis and business intelligence automation workflows', '📈', 'Data_Analytics'),
('database-and-storage', 'Database_and_Storage', 'Database & Storage', 'Database management and data storage automation workflows', '🗄️', 'Database_and_Storage'),
('devops', 'DevOps', 'DevOps', 'Development operations and CI/CD automation workflows', '⚙️', 'DevOps'),
('discord', 'Discord', 'Discord', 'Discord bot and community management automation workflows', '💬', 'Discord'),
('e-commerce-retail', 'E_Commerce_Retail', 'E-Commerce & Retail', 'Online retail and e-commerce automation workflows', '🛒', 'E_Commerce_Retail'),
('education', 'Education', 'Education', 'Educational technology and learning automation workflows', '🎓', 'Education'),
('email-automation', 'Email_Automation', 'Email Automation', 'Email processing and automation workflows', '📧', 'Email_Automation'),
('energy', 'Energy', 'Energy', 'Energy management and renewable energy automation workflows', '⚡', 'Energy'),
('finance-accounting', 'Finance_Accounting', 'Finance & Accounting', 'Financial automation and accounting workflows', '💰', 'Finance_Accounting'),
('forms-and-surveys', 'Forms_and_Surveys', 'Forms & Surveys', 'Form processing and survey automation workflows', '📝', 'Forms_and_Surveys'),
('gaming', 'Gaming', 'Gaming', 'Gaming and entertainment automation workflows', '🎮', 'Gaming'),
('gmail-email', 'Gmail_Email', 'Gmail & Email', 'Gmail and email automation workflows', '📬', 'Gmail_Email'),
('google-drive-sheets', 'Google_Drive_Sheets', 'Google Drive & Sheets', 'Google Workspace automation workflows', '📄', 'Google_Drive_Sheets'),
('hr', 'HR', 'Human Resources', 'HR and recruitment automation workflows', '👥', 'HR'),
('healthcare', 'Healthcare', 'Healthcare', 'Healthcare and medical automation workflows', '🏥', 'Healthcare'),
('instagram-twitter-social', 'Instagram_Twitter_Social', 'Social Media', 'Social media automation workflows', '📱', 'Instagram_Twitter_Social'),
('manufacturing', 'Manufacturing', 'Manufacturing', 'Manufacturing and industrial automation workflows', '🏭', 'Manufacturing'),
('misc', 'Misc', 'Miscellaneous', 'Various automation workflows and utilities', '🔧', 'Misc'),
('notion', 'Notion', 'Notion', 'Notion integration and productivity workflows', '📚', 'Notion'),
('openai-llms', 'OpenAI_LLMs', 'OpenAI & LLMs', 'OpenAI and Large Language Model workflows', '🧠', 'OpenAI_LLMs'),
('other-integrations-and-use-cases', 'Other_Integrations_and_Use_Cases', 'Other Integrations', 'Various integration and use case workflows', '🔗', 'Other_Integrations_and_Use_Cases'),
('pdf-document-processing', 'PDF_Document_Processing', 'PDF & Documents', 'PDF and document processing workflows', '📄', 'PDF_Document_Processing'),
('productivity', 'Productivity', 'Productivity', 'Productivity and workflow optimization', '⚡', 'Productivity'),
('slack', 'Slack', 'Slack', 'Slack integration and team communication workflows', '💬', 'Slack'),
('social-media', 'Social_Media', 'Social Media', 'Social media management and automation workflows', '📱', 'Social_Media'),
('telegram', 'Telegram', 'Telegram', 'Telegram bot and messaging automation workflows', '📱', 'Telegram'),
('whatsapp', 'WhatsApp', 'WhatsApp', 'WhatsApp automation and messaging workflows', '📱', 'WhatsApp');

-- Insert some common tags
INSERT INTO tags (name, description, color) VALUES
('ai', 'Artificial Intelligence workflows', '#FF6B6B'),
('webhook', 'Workflows with webhook triggers', '#4ECDC4'),
('automation', 'General automation workflows', '#45B7D1'),
('integration', 'Third-party service integrations', '#96CEB4'),