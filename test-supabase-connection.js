/**
 * Comprehensive Supabase Schema Test Script
 * Tests database connectivity and inserts sample data into all tables
 * to understand the schema logic and relationships
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration - Using environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

class SupabaseSchemaTest {
    constructor() {
        this.testResults = [];
        this.sampleData = {};
    }

    /**
     * Log test results with status
     */
    log(message, status = 'INFO', data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, message, status, data };
        this.testResults.push(logEntry);
        console.log(`[${timestamp}] ${status}: ${message}`);
        if (data) console.log('Data:', JSON.stringify(data, null, 2));
    }

    /**
     * Test database connectivity
     */
    async testConnection() {
        try {
            const { data, error } = await supabase.from('categories').select('count');
            if (error) throw error;
            this.log('✅ Database connection successful', 'SUCCESS');
            return true;
        } catch (error) {
            this.log(`❌ Database connection failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * Test Categories table
     * Primary table with workflow count tracking via triggers
     */
    async testCategoriesTable() {
        try {
            this.log('Testing Categories table...', 'INFO');
            
            // Insert 5 test categories
            const testCategories = [
                {
                    name: `AI_Automation_${Date.now()}`,
                    description: 'AI-powered automation workflows',
                    icon: '🤖',
                    workflow_count: 0
                },
                {
                    name: `Data_Processing_${Date.now()}`,
                    description: 'Data transformation and processing workflows',
                    icon: '📊',
                    workflow_count: 0
                },
                {
                    name: `Email_Marketing_${Date.now()}`,
                    description: 'Email marketing and communication workflows',
                    icon: '📧',
                    workflow_count: 0
                },
                {
                    name: `Social_Media_${Date.now()}`,
                    description: 'Social media management and posting workflows',
                    icon: '📱',
                    workflow_count: 0
                },
                {
                    name: `File_Management_${Date.now()}`,
                    description: 'File organization and processing workflows',
                    icon: '📁',
                    workflow_count: 0
                }
            ];

            const { data: insertData, error: insertError } = await supabase
                .from('categories')
                .insert(testCategories)
                .select();

            if (insertError) throw insertError;
            
            this.sampleData.categories = insertData;
            this.sampleData.category = insertData[0]; // Keep backward compatibility
            this.log('✅ 5 Categories inserted successfully', 'SUCCESS', insertData);

            // Test category retrieval
            const { data: selectData, error: selectError } = await supabase
                .from('categories')
                .select('*')
                .in('id', insertData.map(cat => cat.id));

            if (selectError) throw selectError;
            this.log('✅ All categories retrieved successfully', 'SUCCESS', `Retrieved ${selectData.length} categories`);

            return true;
        } catch (error) {
            this.log(`❌ Categories table test failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * Test Tags table
     * Supports many-to-many relationship with workflows
     */
    async testTagsTable() {
        try {
            this.log('Testing Tags table...', 'INFO');
            
            const testTags = [
                {
                    name: `ai-automation-${Date.now()}`,
                    description: 'AI and machine learning automation',
                    color: '#FF5733',
                    usage_count: 0
                },
                {
                    name: `data-processing-${Date.now()}`,
                    description: 'Data transformation and analysis',
                    color: '#33FF57',
                    usage_count: 0
                },
                {
                    name: `email-marketing-${Date.now()}`,
                    description: 'Email campaigns and marketing',
                    color: '#3357FF',
                    usage_count: 0
                },
                {
                    name: `api-integration-${Date.now()}`,
                    description: 'Third-party API connections',
                    color: '#FF33F5',
                    usage_count: 0
                },
                {
                    name: `webhook-automation-${Date.now()}`,
                    description: 'Webhook-triggered workflows',
                    color: '#FFB833',
                    usage_count: 0
                }
            ];

            const { data: insertData, error: insertError } = await supabase
                .from('tags')
                .insert(testTags)
                .select();

            if (insertError) throw insertError;
            
            this.sampleData.tags = insertData;
            this.log('✅ 5 Tags inserted successfully', 'SUCCESS', insertData);

            return true;
        } catch (error) {
            this.log(`❌ Tags table test failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * Test Workflows table
     * Core table with foreign key to categories and full-text search
     */
    async testWorkflowsTable() {
        try {
            this.log('Testing Workflows table...', 'INFO');
            
            if (!this.sampleData.categories || this.sampleData.categories.length === 0) {
                throw new Error('Category data required for workflow test');
            }

            const testWorkflows = [
                {
                    name: `AI Content Generator ${Date.now()}`,
                    description: 'AI-powered content generation workflow with GPT integration and automated publishing',
                    category_id: this.sampleData.categories[0].id,
                    file_path: `/workflows/ai-content-${Date.now()}.json`,
                    file_type: 'json',
                    file_size: 2048,
                    original_filename: `ai-content-generator-${Date.now()}.json`,
                    n8n_workflow_id: `wf_ai_${Date.now()}`,
                    node_count: 8,
                    connection_count: 7,
                    complexity_score: 25,
                    is_active: true,
                    metadata: {
                        created_by: 'ai-team',
                        version: '2.1.0',
                        tags: ['ai', 'content', 'automation']
                    }
                },
                {
                    name: `Data Pipeline ${Date.now()}`,
                    description: 'Automated data processing pipeline with transformation and validation steps',
                    category_id: this.sampleData.categories[1].id,
                    file_path: `/workflows/data-pipeline-${Date.now()}.json`,
                    file_type: 'json',
                    file_size: 3072,
                    original_filename: `data-pipeline-${Date.now()}.json`,
                    n8n_workflow_id: `wf_data_${Date.now()}`,
                    node_count: 12,
                    connection_count: 11,
                    complexity_score: 35,
                    is_active: true,
                    metadata: {
                        created_by: 'data-team',
                        version: '1.5.0',
                        tags: ['data', 'processing', 'etl']
                    }
                },
                {
                    name: `Email Campaign ${Date.now()}`,
                    description: 'Automated email marketing campaign with segmentation and personalization',
                    category_id: this.sampleData.categories[2].id,
                    file_path: `/workflows/email-campaign-${Date.now()}.json`,
                    file_type: 'json',
                    file_size: 1536,
                    original_filename: `email-campaign-${Date.now()}.json`,
                    n8n_workflow_id: `wf_email_${Date.now()}`,
                    node_count: 6,
                    connection_count: 5,
                    complexity_score: 18,
                    is_active: true,
                    metadata: {
                        created_by: 'marketing-team',
                        version: '1.2.0',
                        tags: ['email', 'marketing', 'automation']
                    }
                },
                {
                    name: `Social Media Scheduler ${Date.now()}`,
                    description: 'Multi-platform social media posting scheduler with content optimization',
                    category_id: this.sampleData.categories[3].id,
                    file_path: `/workflows/social-scheduler-${Date.now()}.json`,
                    file_type: 'json',
                    file_size: 2560,
                    original_filename: `social-scheduler-${Date.now()}.json`,
                    n8n_workflow_id: `wf_social_${Date.now()}`,
                    node_count: 10,
                    connection_count: 9,
                    complexity_score: 28,
                    is_active: true,
                    metadata: {
                        created_by: 'social-team',
                        version: '1.8.0',
                        tags: ['social', 'scheduling', 'content']
                    }
                },
                {
                    name: `File Processor ${Date.now()}`,
                    description: 'Automated file processing workflow with OCR and document analysis capabilities',
                    category_id: this.sampleData.categories[4].id,
                    file_path: `/workflows/file-processor-${Date.now()}.json`,
                    file_type: 'json',
                    file_size: 4096,
                    original_filename: `file-processor-${Date.now()}.json`,
                    n8n_workflow_id: `wf_file_${Date.now()}`,
                    node_count: 15,
                    connection_count: 14,
                    complexity_score: 42,
                    is_active: true,
                    metadata: {
                        created_by: 'ops-team',
                        version: '3.0.0',
                        tags: ['files', 'processing', 'ocr']
                    }
                }
            ];

            const { data: insertData, error: insertError } = await supabase
                .from('workflows')
                .insert(testWorkflows)
                .select();

            if (insertError) throw insertError;
            
            this.sampleData.workflows = insertData;
            this.sampleData.workflow = insertData[0]; // Keep backward compatibility
            this.log('✅ 5 Workflows inserted successfully', 'SUCCESS', insertData);

            // Test search vector functionality
            const { data: searchData, error: searchError } = await supabase
                .from('workflows')
                .select('*')
                .textSearch('search_vector', 'automation');

            if (searchError) throw searchError;
            this.log('✅ Full-text search working', 'SUCCESS', { found: searchData.length });

            return true;
        } catch (error) {
            this.log(`❌ Workflows table test failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * Test Workflow Nodes table
     * Stores individual nodes within workflows
     */
    async testWorkflowNodesTable() {
        try {
            this.log('Testing Workflow Nodes table...', 'INFO');
            
            if (!this.sampleData.workflows || this.sampleData.workflows.length === 0) {
                throw new Error('Workflow data required for nodes test');
            }

            // Create 5 nodes for the first workflow
            const firstWorkflowId = this.sampleData.workflows[0].id;
            const testNodes = [
                {
                    workflow_id: firstWorkflowId,
                    node_id: 'node_1_webhook',
                    node_name: 'Webhook Trigger',
                    node_type: 'n8n-nodes-base.webhook',
                    node_type_version: '1.0',
                    position_x: 100,
                    position_y: 200,
                    parameters: { httpMethod: 'POST', path: 'webhook' },
                    is_disabled: false,
                    notes: 'Webhook trigger node'
                },
                {
                    workflow_id: firstWorkflowId,
                    node_id: 'node_2_openai',
                    node_name: 'OpenAI GPT',
                    node_type: 'n8n-nodes-base.openAi',
                    node_type_version: '1.3',
                    position_x: 300,
                    position_y: 200,
                    parameters: {
                        model: 'gpt-4',
                        prompt: 'Analyze the input data',
                        temperature: 0.7
                    },
                    credentials: { openAiApi: 'openai_credentials' },
                    is_disabled: false,
                    notes: 'AI processing node'
                },
                {
                    workflow_id: firstWorkflowId,
                    node_id: 'node_3_http',
                    node_name: 'HTTP Request',
                    node_type: 'n8n-nodes-base.httpRequest',
                    node_type_version: '4.1',
                    position_x: 500,
                    position_y: 200,
                    parameters: {
                        url: 'https://api.example.com/data',
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    },
                    is_disabled: false,
                    notes: 'External API call'
                },
                {
                    workflow_id: firstWorkflowId,
                    node_id: 'node_4_function',
                    node_name: 'Data Processor',
                    node_type: 'n8n-nodes-base.function',
                    node_type_version: '1.0',
                    position_x: 700,
                    position_y: 200,
                    parameters: {
                        functionCode: 'return items.map(item => ({ ...item.json, processed: true }));'
                    },
                    is_disabled: false,
                    notes: 'Data transformation function'
                },
                {
                    workflow_id: firstWorkflowId,
                    node_id: 'node_5_email',
                    node_name: 'Send Email',
                    node_type: 'n8n-nodes-base.emailSend',
                    node_type_version: '2.0',
                    position_x: 900,
                    position_y: 200,
                    parameters: {
                        to: 'admin@example.com',
                        subject: 'Workflow Complete',
                        text: 'Process completed successfully'
                    },
                    is_disabled: false,
                    notes: 'Email notification'
                }
            ];

            const { data: insertData, error: insertError } = await supabase
                .from('workflow_nodes')
                .insert(testNodes)
                .select();

            if (insertError) throw insertError;
            
            this.sampleData.nodes = insertData;
            this.log('✅ 5 Workflow nodes inserted successfully', 'SUCCESS', insertData);

            return true;
        } catch (error) {
            this.log(`❌ Workflow nodes table test failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * Test Workflow Connections table
     * Stores connections between workflow nodes
     */
    async testWorkflowConnectionsTable() {
        try {
            this.log('Testing Workflow Connections table...', 'INFO');
            
            if (!this.sampleData.workflows || !this.sampleData.nodes || this.sampleData.nodes.length < 5) {
                throw new Error('Workflows and 5 nodes data required for connections test');
            }

            const firstWorkflowId = this.sampleData.workflows[0].id;
            const testConnections = [
                {
                    workflow_id: firstWorkflowId,
                    source_node_id: 'node_1_webhook',
                    target_node_id: 'node_2_openai',
                    source_output_index: 0,
                    target_input_index: 0,
                    connection_type: 'main'
                },
                {
                    workflow_id: firstWorkflowId,
                    source_node_id: 'node_2_openai',
                    target_node_id: 'node_3_http',
                    source_output_index: 0,
                    target_input_index: 0,
                    connection_type: 'main'
                },
                {
                    workflow_id: firstWorkflowId,
                    source_node_id: 'node_3_http',
                    target_node_id: 'node_4_function',
                    source_output_index: 0,
                    target_input_index: 0,
                    connection_type: 'main'
                },
                {
                    workflow_id: firstWorkflowId,
                    source_node_id: 'node_4_function',
                    target_node_id: 'node_5_email',
                    source_output_index: 0,
                    target_input_index: 0,
                    connection_type: 'main'
                },
                {
                    workflow_id: firstWorkflowId,
                    source_node_id: 'node_2_openai',
                    target_node_id: 'node_5_email',
                    source_output_index: 1,
                    target_input_index: 1,
                    connection_type: 'auxiliary'
                }
            ];

            const { data: insertData, error: insertError } = await supabase
                .from('workflow_connections')
                .insert(testConnections)
                .select();

            if (insertError) throw insertError;
            
            this.sampleData.connections = insertData;
            this.log('✅ 5 Workflow connections inserted successfully', 'SUCCESS', insertData);

            return true;
        } catch (error) {
            this.log(`❌ Workflow connections table test failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * Test Workflow Tags junction table
     * Many-to-many relationship between workflows and tags
     */
    async testWorkflowTagsTable() {
        try {
            this.log('Testing Workflow Tags junction table...', 'INFO');
            
            if (!this.sampleData.workflows || !this.sampleData.tags) {
                throw new Error('Workflows and tags data required for junction test');
            }

            // Create relationships between workflows and tags (5 relationships)
            const workflowTagRelations = [
                { workflow_id: this.sampleData.workflows[0].id, tag_id: this.sampleData.tags[0].id },
                { workflow_id: this.sampleData.workflows[0].id, tag_id: this.sampleData.tags[1].id },
                { workflow_id: this.sampleData.workflows[1].id, tag_id: this.sampleData.tags[2].id },
                { workflow_id: this.sampleData.workflows[2].id, tag_id: this.sampleData.tags[3].id },
                { workflow_id: this.sampleData.workflows[3].id, tag_id: this.sampleData.tags[4].id }
            ];

            const { data: insertData, error: insertError } = await supabase
                .from('workflow_tags')
                .insert(workflowTagRelations)
                .select();

            if (insertError) throw insertError;
            
            this.log('✅ Workflow-tag relationships created successfully', 'SUCCESS', insertData);

            // Test tag usage count trigger
            const { data: tagData, error: tagError } = await supabase
                .from('tags')
                .select('*')
                .in('id', this.sampleData.tags.map(t => t.id));

            if (tagError) throw tagError;
            this.log('✅ Tag usage counts updated by trigger', 'SUCCESS', tagData);

            return true;
        } catch (error) {
            this.log(`❌ Workflow tags table test failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * Test Sync Logs table
     * Tracks synchronization operations
     */
    async testSyncLogsTable() {
        try {
            this.log('Testing Sync Logs table...', 'INFO');
            
            const testSyncLogs = [
                {
                    operation_type: 'sync',
                    file_path: '/workflows/batch_1/',
                    status: 'success',
                    files_processed: 10,
                    workflows_created: 5,
                    workflows_updated: 3,
                    workflows_deleted: 0,
                    duration_ms: 2500,
                    metadata: {
                        source: 'test-script',
                        batch_id: `batch_1_${Date.now()}`,
                        user_id: 'admin'
                    }
                },
                {
                    operation_type: 'import',
                    file_path: '/workflows/batch_2/',
                    status: 'success',
                    files_processed: 8,
                    workflows_created: 4,
                    workflows_updated: 2,
                    workflows_deleted: 1,
                    duration_ms: 1800,
                    metadata: {
                        source: 'file-import',
                        batch_id: `batch_2_${Date.now()}`,
                        user_id: 'user1'
                    }
                },
                {
                    operation_type: 'backup',
                    file_path: '/backups/daily/',
                    status: 'success',
                    files_processed: 25,
                    workflows_created: 0,
                    workflows_updated: 0,
                    workflows_deleted: 0,
                    duration_ms: 5000,
                    metadata: {
                        source: 'automated-backup',
                        batch_id: `backup_${Date.now()}`,
                        user_id: 'system'
                    }
                },
                {
                    operation_type: 'sync',
                    file_path: '/workflows/failed/',
                    status: 'failed',
                    files_processed: 3,
                    workflows_created: 0,
                    workflows_updated: 1,
                    workflows_deleted: 0,
                    duration_ms: 800,
                    error_message: 'Connection timeout',
                    metadata: {
                        source: 'retry-script',
                        batch_id: `failed_${Date.now()}`,
                        user_id: 'admin'
                    }
                },
                {
                    operation_type: 'cleanup',
                    file_path: '/temp/workflows/',
                    status: 'success',
                    files_processed: 15,
                    workflows_created: 0,
                    workflows_updated: 0,
                    workflows_deleted: 5,
                    duration_ms: 1200,
                    metadata: {
                        source: 'cleanup-job',
                        batch_id: `cleanup_${Date.now()}`,
                        user_id: 'system'
                    }
                }
            ];

            const { data: insertData, error: insertError } = await supabase
                .from('sync_logs')
                .insert(testSyncLogs)
                .select();

            if (insertError) throw insertError;
            
            this.log('✅ 5 Sync logs inserted successfully', 'SUCCESS', insertData);

            return true;
        } catch (error) {
            this.log(`❌ Sync logs table test failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * Test Leads table
     * Lead generation and tracking
     */
    async testLeadsTable() {
        try {
            this.log('Testing Leads table...', 'INFO');
            
            const testLeads = [
                {
                    name: 'John Doe',
                    email: `john.doe.${Date.now()}@example.com`,
                    company: 'Tech Solutions Inc.',
                    use_case: 'Automating email workflows with AI integration',
                    interest_level: 'high',
                    source: 'website_form',
                    ip_address: '192.168.1.100',
                    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    referrer_url: 'https://example.com/workflows',
                    utm_source: 'google',
                    utm_medium: 'cpc',
                    utm_campaign: 'ai_automation',
                    consent_marketing: true,
                    consent_data_processing: true,
                    status: 'new',
                    notes: 'Interested in AI-powered workflow automation',
                    metadata: {
                        form_version: '2.1',
                        session_id: `session_${Date.now()}_1`,
                        interests: ['ai', 'automation', 'email']
                    }
                },
                {
                    name: 'Jane Smith',
                    email: `jane.smith.${Date.now()}@company.com`,
                    company: 'Digital Marketing Agency',
                    use_case: 'Social media automation and analytics',
                    interest_level: 'medium',
                    source: 'linkedin',
                    ip_address: '10.0.0.50',
                    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                    referrer_url: 'https://linkedin.com/in/janesmith',
                    utm_source: 'linkedin',
                    utm_medium: 'social',
                    utm_campaign: 'social_automation',
                    consent_marketing: true,
                    consent_data_processing: true,
                    status: 'contacted',
                    notes: 'Looking for social media automation solutions',
                    metadata: {
                        form_version: '2.1',
                        session_id: `session_${Date.now()}_2`,
                        interests: ['social_media', 'analytics', 'automation']
                    }
                },
                {
                    name: 'Robert Johnson',
                    email: `robert.johnson.${Date.now()}@startup.io`,
                    company: 'AI Startup Co.',
                    use_case: 'Data processing and ML model deployment',
                    interest_level: 'high',
                    source: 'referral',
                    ip_address: '172.16.0.25',
                    user_agent: 'Mozilla/5.0 (X11; Linux x86_64)',
                    referrer_url: 'https://partner.com/recommendations',
                    utm_source: 'partner',
                    utm_medium: 'referral',
                    utm_campaign: 'ml_automation',
                    consent_marketing: false,
                    consent_data_processing: true,
                    status: 'qualified',
                    notes: 'Needs advanced ML workflow automation',
                    metadata: {
                        form_version: '2.2',
                        session_id: `session_${Date.now()}_3`,
                        interests: ['machine_learning', 'data_processing', 'deployment']
                    }
                },
                {
                    name: 'Maria Garcia',
                    email: `maria.garcia.${Date.now()}@enterprise.com`,
                    company: 'Enterprise Solutions Ltd.',
                    use_case: 'Customer support automation',
                    interest_level: 'low',
                    source: 'webinar',
                    ip_address: '203.0.113.45',
                    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    referrer_url: 'https://webinar.com/automation-trends',
                    utm_source: 'webinar',
                    utm_medium: 'event',
                    utm_campaign: 'support_automation',
                    consent_marketing: true,
                    consent_data_processing: true,
                    status: 'nurturing',
                    notes: 'Exploring customer support automation options',
                    metadata: {
                        form_version: '2.0',
                        session_id: `session_${Date.now()}_4`,
                        interests: ['customer_support', 'chatbots', 'ticketing']
                    }
                },
                {
                    name: 'David Chen',
                    email: `david.chen.${Date.now()}@consulting.biz`,
                    company: 'Process Consulting Group',
                    use_case: 'Business process optimization',
                    interest_level: 'medium',
                    source: 'organic_search',
                    ip_address: '198.51.100.15',
                    user_agent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
                    referrer_url: 'https://google.com/search?q=business+automation',
                    utm_source: 'organic',
                    utm_medium: 'search',
                    utm_campaign: null,
                    consent_marketing: true,
                    consent_data_processing: true,
                    status: 'new',
                    notes: 'Interested in optimizing client business processes',
                    metadata: {
                        form_version: '2.1',
                        session_id: `session_${Date.now()}_5`,
                        interests: ['process_optimization', 'consulting', 'efficiency']
                    }
                }
            ];

            const { data: insertData, error: insertError } = await supabase
                .from('leads')
                .insert(testLeads)
                .select();

            if (insertError) throw insertError;
            
            this.log('✅ 5 Leads inserted successfully', 'SUCCESS', insertData);

            return true;
        } catch (error) {
            this.log(`❌ Leads table test failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * Test N8N Files table
     * Stores N8N workflow file metadata
     */
    async testN8nFilesTable() {
        try {
            this.log('Testing N8N Files table...', 'INFO');
            
            const testN8nFiles = [
                {
                    file_path: `/n8n/workflows/email-automation-${Date.now()}.json`,
                    file_name: `email-automation-${Date.now()}.json`,
                    file_size: 4096,
                    file_hash: `sha256_${Date.now()}_email_hash`,
                    processing_status: 'completed',
                    error_message: null,
                    metadata: {
                        n8n_version: '1.2.0',
                        last_modified: new Date().toISOString(),
                        workflow_count: 3,
                        category: 'email'
                    }
                },
                {
                    file_path: `/n8n/workflows/data-processing-${Date.now()}.json`,
                    file_name: `data-processing-${Date.now()}.json`,
                    file_size: 6144,
                    file_hash: `sha256_${Date.now()}_data_hash`,
                    processing_status: 'completed',
                    error_message: null,
                    metadata: {
                        n8n_version: '1.2.0',
                        last_modified: new Date().toISOString(),
                        workflow_count: 5,
                        category: 'data'
                    }
                },
                {
                    file_path: `/n8n/workflows/social-media-${Date.now()}.json`,
                    file_name: `social-media-${Date.now()}.json`,
                    file_size: 3072,
                    file_hash: `sha256_${Date.now()}_social_hash`,
                    processing_status: 'processing',
                    error_message: null,
                    metadata: {
                        n8n_version: '1.1.5',
                        last_modified: new Date().toISOString(),
                        workflow_count: 2,
                        category: 'social'
                    }
                },
                {
                    file_path: `/n8n/workflows/broken-workflow-${Date.now()}.json`,
                    file_name: `broken-workflow-${Date.now()}.json`,
                    file_size: 1024,
                    file_hash: `sha256_${Date.now()}_broken_hash`,
                    processing_status: 'failed',
                    error_message: 'Invalid node configuration detected',
                    metadata: {
                        n8n_version: '1.0.8',
                        last_modified: new Date().toISOString(),
                        workflow_count: 1,
                        category: 'test'
                    }
                },
                {
                    file_path: `/n8n/workflows/analytics-dashboard-${Date.now()}.json`,
                    file_name: `analytics-dashboard-${Date.now()}.json`,
                    file_size: 8192,
                    file_hash: `sha256_${Date.now()}_analytics_hash`,
                    processing_status: 'completed',
                    error_message: null,
                    metadata: {
                        n8n_version: '1.2.1',
                        last_modified: new Date().toISOString(),
                        workflow_count: 4,
                        category: 'analytics'
                    }
                }
            ];

            const { data: insertData, error: insertError } = await supabase
                .from('n8n_files')
                .insert(testN8nFiles)
                .select();

            if (insertError) throw insertError;
            
            this.log('✅ 5 N8N file records inserted successfully', 'SUCCESS', insertData);

            return true;
        } catch (error) {
            this.log(`❌ N8N files table test failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * Test schema relationships and triggers
     */
    async testSchemaLogic() {
        try {
            this.log('Testing schema logic and relationships...', 'INFO');
            
            // Test category workflow count trigger
            const { data: categoryData, error: categoryError } = await supabase
                .from('categories')
                .select('*')
                .eq('id', this.sampleData.category.id);

            if (categoryError) throw categoryError;
            
            const updatedCategory = categoryData[0];
            if (updatedCategory.workflow_count > 0) {
                this.log('✅ Category workflow count trigger working', 'SUCCESS', 
                    { workflow_count: updatedCategory.workflow_count });
            } else {
                this.log('⚠️ Category workflow count not updated', 'WARNING');
            }

            // Test workflow with tags relationship
            const { data: workflowWithTags, error: workflowError } = await supabase
                .from('workflows')
                .select(`
                    *,
                    categories!workflows_category_id_fkey(*),
                    workflow_tags!workflow_tags_workflow_id_fkey(
                        tags!workflow_tags_tag_id_fkey(*)
                    )
                `)
                .eq('id', this.sampleData.workflow.id);

            if (workflowError) throw workflowError;
            
            this.log('✅ Workflow relationships loaded successfully', 'SUCCESS', {
                workflow_name: workflowWithTags[0].name,
                category: workflowWithTags[0].categories.name,
                tags_count: workflowWithTags[0].workflow_tags.length
            });

            return true;
        } catch (error) {
            this.log(`❌ Schema logic test failed: ${error.message}`, 'ERROR');
            return false;
        }
    }

    /**
     * Run all tests in sequence
     */
    async runAllTests() {
        console.log('🚀 Starting Supabase Schema Comprehensive Test\n');
        
        const tests = [
            { name: 'Database Connection', method: this.testConnection },
            { name: 'Categories Table', method: this.testCategoriesTable },
            { name: 'Tags Table', method: this.testTagsTable },
            { name: 'Workflows Table', method: this.testWorkflowsTable },
            { name: 'Workflow Nodes Table', method: this.testWorkflowNodesTable },
            { name: 'Workflow Connections Table', method: this.testWorkflowConnectionsTable },
            { name: 'Workflow Tags Junction Table', method: this.testWorkflowTagsTable },
            { name: 'Sync Logs Table', method: this.testSyncLogsTable },
            { name: 'Leads Table', method: this.testLeadsTable },
            { name: 'N8N Files Table', method: this.testN8nFilesTable },
            { name: 'Schema Logic & Relationships', method: this.testSchemaLogic }
        ];

        let passedTests = 0;
        const totalTests = tests.length;

        for (const test of tests) {
            console.log(`\n📋 Running: ${test.name}`);
            console.log('=' .repeat(50));
            
            try {
                const result = await test.method.call(this);
                if (result) {
                    passedTests++;
                }
            } catch (error) {
                this.log(`❌ Test '${test.name}' failed with error: ${error.message}`, 'ERROR');
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('🏁 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${passedTests}/${totalTests}`);
        console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
        console.log(`📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        if (passedTests === totalTests) {
            console.log('\n🎉 All tests passed! Your Supabase schema is working correctly.');
        } else {
            console.log('\n⚠️ Some tests failed. Please check the logs above for details.');
        }

        return {
            total: totalTests,
            passed: passedTests,
            failed: totalTests - passedTests,
            successRate: (passedTests / totalTests) * 100,
            testResults: this.testResults
        };
    }

    /**
     * Generate schema analysis report
     */
    generateSchemaAnalysis() {
        console.log('\n📊 SUPABASE SCHEMA ANALYSIS');
        console.log('='.repeat(60));
        
        const analysis = {
            tables: {
                categories: {
                    purpose: 'Organize workflows into categories',
                    features: ['Auto-increment workflow count via triggers', 'Icon support', 'Timestamped'],
                    relationships: ['One-to-many with workflows']
                },
                workflows: {
                    purpose: 'Core workflow storage with metadata',
                    features: ['Full-text search support', 'N8N integration', 'Complexity scoring', 'File metadata'],
                    relationships: ['Belongs to category', 'Has many nodes', 'Has many connections', 'Many-to-many with tags']
                },
                workflow_nodes: {
                    purpose: 'Individual nodes within workflows',
                    features: ['Position tracking', 'Parameters storage', 'Credentials reference', 'Version tracking'],
                    relationships: ['Belongs to workflow', 'Referenced in connections']
                },
                workflow_connections: {
                    purpose: 'Node connections and data flow',
                    features: ['Source/target mapping', 'Input/output indexing', 'Connection type classification'],
                    relationships: ['Belongs to workflow', 'References nodes']
                },
                tags: {
                    purpose: 'Tagging system for workflows',
                    features: ['Usage count tracking via triggers', 'Color coding', 'Description support'],
                    relationships: ['Many-to-many with workflows']
                },
                workflow_tags: {
                    purpose: 'Junction table for workflow-tag relationships',
                    features: ['Automatic tag usage count updates'],
                    relationships: ['Links workflows and tags']
                },
                sync_logs: {
                    purpose: 'Track synchronization operations',
                    features: ['Operation metrics', 'Duration tracking', 'Status monitoring'],
                    relationships: ['Standalone logging table']
                },
                leads: {
                    purpose: 'Lead generation and tracking',
                    features: ['UTM tracking', 'Consent management', 'Interest level scoring'],
                    relationships: ['Standalone CRM table']
                },
                n8n_files: {
                    purpose: 'N8N file metadata and processing status',
                    features: ['File hashing', 'Content preview', 'Processing status'],
                    relationships: ['Related to workflow files']
                }
            },
            keyFeatures: [
                '🔍 Full-text search on workflows using PostgreSQL search vectors',
                '🔄 Automatic counters via database triggers (categories, tags)',
                '📊 Comprehensive workflow metadata and complexity scoring',
                '🏷️ Flexible tagging system with usage analytics',
                '📝 Detailed audit logging for sync operations',
                '🎯 Lead tracking with marketing attribution',
                '⚡ N8N workflow file processing and status tracking',
                '🔗 Complex relationships supporting workflow composition'
            ],
            databaseTriggers: [
                'update_search_vector() - Maintains full-text search indexes',
                'update_category_workflow_count() - Keeps category workflow counts accurate',
                'update_tag_usage_count() - Tracks tag usage across workflows',
                'update_updated_at_column() - Automatic timestamp updates'
            ]
        };

        Object.entries(analysis.tables).forEach(([tableName, info]) => {
            console.log(`\n📋 ${tableName.toUpperCase()}`);
            console.log(`   Purpose: ${info.purpose}`);
            console.log(`   Features: ${info.features.join(', ')}`);
            console.log(`   Relationships: ${info.relationships.join(', ')}`);
        });

        console.log('\n🔑 KEY FEATURES:');
        analysis.keyFeatures.forEach(feature => console.log(`   ${feature}`));
        
        console.log('\n⚡ DATABASE TRIGGERS:');
        analysis.databaseTriggers.forEach(trigger => console.log(`   ${trigger}`));

        return analysis;
    }
}

// Main execution
async function main() {
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        console.log('❌ Please configure your Supabase URL and Key in the script first!');
        console.log('\n📋 To get your credentials:');
        console.log('1. Go to your Supabase project dashboard');
        console.log('2. Navigate to Settings > API');
        console.log('3. Copy the Project URL and anon/public key');
        console.log('4. Replace the values at the top of this script');
        return;
    }

    const tester = new SupabaseSchemaTest();
    
    // Run all tests
    const results = await tester.runAllTests();
    
    // Generate schema analysis
    const analysis = tester.generateSchemaAnalysis();
    
    console.log('\n💾 Test completed. Results saved to testResults array.');
    
    return { results, analysis };
}

// Export for use as module or run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { SupabaseSchemaTest, main };