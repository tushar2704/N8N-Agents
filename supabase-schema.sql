-- Supabase Database Schema for N8N Workflows Repository
-- Optimized for better relational integrity and scalability

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Categories table (improved with better constraints)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    workflow_count INTEGER DEFAULT 0 CHECK (workflow_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflows table (enhanced with better foreign key relationships)
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(500) NOT NULL,
    description TEXT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    file_path VARCHAR(1000) NOT NULL UNIQUE,
    file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('json', 'txt')),
    file_size INTEGER CHECK (file_size >= 0),
    original_filename VARCHAR(500) NOT NULL,
    n8n_workflow_id VARCHAR(100) UNIQUE,
    node_count INTEGER DEFAULT 0 CHECK (node_count >= 0),
    connection_count INTEGER DEFAULT 0 CHECK (connection_count >= 0),
    complexity_score INTEGER DEFAULT 0 CHECK (complexity_score >= 0),
    is_active BOOLEAN DEFAULT true,
    search_vector TSVECTOR,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow nodes table (strengthened relationships)
CREATE TABLE workflow_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE ON UPDATE CASCADE,
    node_id VARCHAR(100) NOT NULL,
    node_name VARCHAR(500),
    node_type VARCHAR(200) NOT NULL,
    node_type_version VARCHAR(20),
    position_x FLOAT,
    position_y FLOAT,
    parameters JSONB DEFAULT '{}',
    credentials JSONB DEFAULT '{}',
    is_disabled BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workflow_id, node_id)
);

-- Workflow connections table (enhanced with proper constraints)
CREATE TABLE workflow_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE ON UPDATE CASCADE,
    source_node_id VARCHAR(100) NOT NULL,
    target_node_id VARCHAR(100) NOT NULL,
    source_output_index INTEGER DEFAULT 0 CHECK (source_output_index >= 0),
    target_input_index INTEGER DEFAULT 0 CHECK (target_input_index >= 0),
    connection_type VARCHAR(50) DEFAULT 'main',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workflow_id, source_node_id, target_node_id, source_output_index, target_input_index)
);

-- Tags table (improved with constraints)
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow tags junction table (proper many-to-many relationship)
CREATE TABLE workflow_tags (
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE ON UPDATE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (workflow_id, tag_id)
);

-- Sync logs table (enhanced with better constraints)
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('create', 'update', 'delete', 'sync', 'import')),
    file_path VARCHAR(1000),
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'skipped')),
    error_message TEXT,
    files_processed INTEGER DEFAULT 0 CHECK (files_processed >= 0),
    workflows_created INTEGER DEFAULT 0 CHECK (workflows_created >= 0),
    workflows_updated INTEGER DEFAULT 0 CHECK (workflows_updated >= 0),
    workflows_deleted INTEGER DEFAULT 0 CHECK (workflows_deleted >= 0),
    duration_ms INTEGER CHECK (duration_ms >= 0),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead generation table (improved with better constraints and indexes)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    company VARCHAR(255),
    use_case TEXT,
    interest_level VARCHAR(50) DEFAULT 'medium' CHECK (interest_level IN ('low', 'medium', 'high')),
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email)
);

-- N8N files table (enhanced with better relationships)
CREATE TABLE n8n_files (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL UNIQUE,
    file_extension TEXT,
    file_size BIGINT DEFAULT 0 CHECK (file_size >= 0),
    is_directory BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    json JSONB
);

-- Performance indexes
CREATE INDEX idx_workflows_category_id ON workflows(category_id);
CREATE INDEX idx_workflows_file_type ON workflows(file_type);
CREATE INDEX idx_workflows_is_active ON workflows(is_active);
CREATE INDEX idx_workflows_created_at ON workflows(created_at);
CREATE INDEX idx_workflows_n8n_workflow_id ON workflows(n8n_workflow_id) WHERE n8n_workflow_id IS NOT NULL;

CREATE INDEX idx_workflow_nodes_workflow_id ON workflow_nodes(workflow_id);
CREATE INDEX idx_workflow_nodes_type ON workflow_nodes(node_type);
CREATE INDEX idx_workflow_nodes_workflow_node ON workflow_nodes(workflow_id, node_id);

CREATE INDEX idx_workflow_connections_workflow_id ON workflow_connections(workflow_id);
CREATE INDEX idx_workflow_connections_source ON workflow_connections(source_node_id);
CREATE INDEX idx_workflow_connections_target ON workflow_connections(target_node_id);

CREATE INDEX idx_workflow_tags_workflow_id ON workflow_tags(workflow_id);
CREATE INDEX idx_workflow_tags_tag_id ON workflow_tags(tag_id);

CREATE INDEX idx_sync_logs_status ON sync_logs(status);
CREATE INDEX idx_sync_logs_created_at ON sync_logs(created_at);
CREATE INDEX idx_sync_logs_operation_type ON sync_logs(operation_type);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_interest_level ON leads(interest_level);

CREATE INDEX idx_n8n_files_filename ON n8n_files(filename);
CREATE INDEX idx_n8n_files_extension ON n8n_files(file_extension);
CREATE INDEX idx_n8n_files_is_directory ON n8n_files(is_directory);

-- Full-text search index
CREATE INDEX idx_workflows_search_vector ON workflows USING GIN(search_vector);

-- Trigger functions and triggers (same as before but with improved logic)
CREATE OR REPLACE FUNCTION update_workflow_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
                        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_workflow_search_vector
    BEFORE INSERT OR UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_search_vector();

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
        IF OLD.category_id IS DISTINCT FROM NEW.category_id THEN
            IF OLD.category_id IS NOT NULL THEN
                UPDATE categories 
                SET workflow_count = workflow_count - 1,
                    updated_at = NOW()
                WHERE id = OLD.category_id;
            END IF;
            
            IF NEW.category_id IS NOT NULL THEN
                UPDATE categories 
                SET workflow_count = workflow_count + 1,
                    updated_at = NOW()
                WHERE id = NEW.category_id;
            END IF;
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

CREATE TRIGGER trigger_update_tag_usage_count
    AFTER INSERT OR DELETE ON workflow_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_usage_count();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER trigger_update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_n8n_files_updated_at
    BEFORE UPDATE ON n8n_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data
INSERT INTO categories (name, description, icon, workflow_count) VALUES
('AI_ML', 'Artificial Intelligence and Machine Learning workflows', '🤖', 0),
('AI_Research_RAG_and_Data_Analysis', 'AI Research, RAG systems and Data Analysis', '🔍', 0),
('Agriculture', 'Agricultural and farming automation workflows', '🌾', 0),
('Airtable', 'Airtable integration workflows', '📊', 0),
('Automotive', 'Automotive industry workflows', '🚗', 0),
('Creative_Content', 'Creative content generation workflows', '🎨', 0),
('Data_Analytics', 'Data analytics and reporting workflows', '📈', 0),
('Database_and_Storage', 'Database and storage integration workflows', '💾', 0),
('DevOps', 'DevOps and development workflows', '⚙️', 0),
('Discord', 'Discord bot and integration workflows', '💬', 0),
('E_Commerce_Retail', 'E-commerce and retail workflows', '🛒', 0),
('Education', 'Educational and training workflows', '📚', 0),
('Email_Automation', 'Email automation and management workflows', '📧', 0),
('Energy', 'Energy and utilities workflows', '⚡', 0),
('Finance_Accounting', 'Finance and accounting workflows', '💰', 0),
('Forms_and_Surveys', 'Forms and survey automation workflows', '📝', 0),
('Gaming', 'Gaming and entertainment workflows', '🎮', 0),
('Gmail_and_Email_Automation', 'Gmail and email automation workflows', '✉️', 0),
('Google_Drive_and_Google_Sheets', 'Google Drive and Sheets integration workflows', '📊', 0),
('Government_NGO', 'Government and NGO workflows', '🏛️', 0),
('HR', 'Human Resources workflows', '👥', 0),
('HR_and_Recruitment', 'HR and recruitment workflows', '🤝', 0),
('Healthcare', 'Healthcare and medical workflows', '🏥', 0),
('Instagram_Twitter_Social_Media', 'Social media automation workflows', '📱', 0),
('IoT', 'Internet of Things workflows', '🔌', 0),
('Legal_Tech', 'Legal technology workflows', '⚖️', 0),
('Manufacturing', 'Manufacturing and production workflows', '🏭', 0),
('Media', 'Media and broadcasting workflows', '📺', 0),
('Misc', 'Miscellaneous workflows', '🔧', 0),
('Notion', 'Notion integration workflows', '📔', 0),
('OpenAI_and_LLMs', 'OpenAI and Language Model workflows', '🧠', 0),
('Other', 'Other specialized workflows', '📋', 0),
('Other_Integrations_and_Use_Cases', 'Various integration workflows', '🔗', 0);

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
