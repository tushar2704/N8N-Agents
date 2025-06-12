-- Supabase Database Schema for N8N Workflows Repository
-- This schema supports categorized storage of JSON/TXT workflow files with search capabilities

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    workflow_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflows table
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(500) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('json', 'txt')),
    file_size INTEGER,
    original_filename VARCHAR(500),
    n8n_workflow_id VARCHAR(100),
    node_count INTEGER DEFAULT 0,
    connection_count INTEGER DEFAULT 0,
    complexity_score INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    search_vector TSVECTOR,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow nodes table
CREATE TABLE workflow_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    node_id VARCHAR(100) NOT NULL,
    node_name VARCHAR(500),
    node_type VARCHAR(200),
    node_type_version VARCHAR(20),
    position_x FLOAT,
    position_y FLOAT,
    parameters JSONB DEFAULT '{}',
    credentials JSONB DEFAULT '{}',
    is_disabled BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow connections table
CREATE TABLE workflow_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    source_node_id VARCHAR(100) NOT NULL,
    target_node_id VARCHAR(100) NOT NULL,
    source_output_index INTEGER DEFAULT 0,
    target_input_index INTEGER DEFAULT 0,
    connection_type VARCHAR(50) DEFAULT 'main',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow tags junction table
CREATE TABLE workflow_tags (
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (workflow_id, tag_id)
);

-- Sync logs table
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(1000),
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'skipped')),
    error_message TEXT,
    files_processed INTEGER DEFAULT 0,
    workflows_created INTEGER DEFAULT 0,
    workflows_updated INTEGER DEFAULT 0,
    workflows_deleted INTEGER DEFAULT 0,
    duration_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead generation table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    use_case TEXT,
    interest_level VARCHAR(50) CHECK (interest_level IN ('low', 'medium', 'high')),
    source VARCHAR(100) DEFAULT 'modal_popup',
    ip_address INET,
    user_agent TEXT,
    referrer_url TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    consent_marketing BOOLEAN DEFAULT false,
    consent_data_processing BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'archived')),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_workflows_category_id ON workflows(category_id);
CREATE INDEX idx_workflows_file_type ON workflows(file_type);
CREATE INDEX idx_workflows_is_active ON workflows(is_active);
CREATE INDEX idx_workflows_created_at ON workflows(created_at);
CREATE INDEX idx_workflow_nodes_workflow_id ON workflow_nodes(workflow_id);
CREATE INDEX idx_workflow_nodes_type ON workflow_nodes(node_type);
CREATE INDEX idx_workflow_connections_workflow_id ON workflow_connections(workflow_id);
CREATE INDEX idx_workflow_connections_source ON workflow_connections(source_node_id);
CREATE INDEX idx_workflow_connections_target ON workflow_connections(target_node_id);
CREATE INDEX idx_sync_logs_status ON sync_logs(status);
CREATE INDEX idx_sync_logs_created_at ON sync_logs(created_at);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_source ON leads(source);

-- Full-text search index
CREATE INDEX idx_workflows_search_vector ON workflows USING GIN(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_workflow_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
                        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search vector
CREATE TRIGGER trigger_update_workflow_search_vector
    BEFORE INSERT OR UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_search_vector();

-- Function to update category workflow count
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

-- Trigger to automatically update category workflow count
CREATE TRIGGER trigger_update_category_workflow_count
    AFTER INSERT OR UPDATE OR DELETE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_category_workflow_count();

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags 
        SET usage_count = usage_count + 1
        WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags 
        SET usage_count = usage_count - 1
        WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update tag usage count
CREATE TRIGGER trigger_update_tag_usage_count
    AFTER INSERT OR DELETE ON workflow_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_usage_count();

-- Insert initial categories data
INSERT INTO categories (name, description, icon, workflow_count) VALUES
('AI_ML', 'Artificial Intelligence and Machine Learning workflows', '🤖', 11),
('AI_Research_RAG_and_Data_Analysis', 'AI Research, RAG systems and Data Analysis', '🔍', 39),
('Agriculture', 'Agricultural and farming automation workflows', '🌾', 10),
('Airtable', 'Airtable integration workflows', '📊', 5),
('Automotive', 'Automotive industry workflows', '🚗', 10),
('Creative_Content', 'Creative content generation workflows', '🎨', 1),
('Data_Analytics', 'Data analytics and reporting workflows', '📈', 1),
('Database_and_Storage', 'Database and storage integration workflows', '💾', 5),
('DevOps', 'DevOps and development workflows', '⚙️', 1),
('Discord', 'Discord bot and integration workflows', '💬', 3),
('E_Commerce_Retail', 'E-commerce and retail workflows', '🛒', 3),
('Education', 'Educational and training workflows', '📚', 2),
('Email_Automation', 'Email automation and management workflows', '📧', 10),
('Energy', 'Energy and utilities workflows', '⚡', 10),
('Finance_Accounting', 'Finance and accounting workflows', '💰', 8),
('Forms_and_Surveys', 'Forms and survey automation workflows', '📝', 4),
('Gaming', 'Gaming and entertainment workflows', '🎮', 10),
('Gmail_and_Email_Automation', 'Gmail and email automation workflows', '✉️', 21),
('Google_Drive_and_Google_Sheets', 'Google Drive and Sheets integration workflows', '📊', 17),
('Government_NGO', 'Government and NGO workflows', '🏛️', 8),
('HR', 'Human Resources workflows', '👥', 7),
('HR_and_Recruitment', 'HR and recruitment workflows', '🤝', 16),
('Healthcare', 'Healthcare and medical workflows', '🏥', 16),
('Instagram_Twitter_Social_Media', 'Social media automation workflows', '📱', 26),
('IoT', 'Internet of Things workflows', '🔌', 8),
('Legal_Tech', 'Legal technology workflows', '⚖️', 7),
('Manufacturing', 'Manufacturing and production workflows', '🏭', 10),
('Media', 'Media and broadcasting workflows', '📺', 7),
('Misc', 'Miscellaneous workflows', '🔧', 17),
('Notion', 'Notion integration workflows', '📔', 10),
('OpenAI_and_LLMs', 'OpenAI and Language Model workflows', '🧠', 28),
('Other', 'Other specialized workflows', '📋', 12),
('Other_Integrations_and_Use_Cases', 'Various integration workflows', '🔗', 13);

-- Insert common tags
INSERT INTO tags (name, description, color) VALUES
('automation', 'Workflow automation', '#3B82F6'),
('ai', 'Artificial Intelligence', '#8B5CF6'),
('email', 'Email related workflows', '#EF4444'),
('social-media', 'Social media automation', '#F59E0B'),
('data-processing', 'Data processing and analysis', '#10B981'),
('notification', 'Notification and alerting', '#F97316'),
('integration', 'Third-party integrations', '#6366F1'),
('webhook', 'Webhook based workflows', '#84CC16'),
('api', 'API integrations', '#06B6D4'),
('scheduler', 'Scheduled workflows', '#EC4899');