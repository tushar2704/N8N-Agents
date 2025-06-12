import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseTables() {
    console.log('🚀 Starting Supabase Database Tables Test\n');
    
    const results = {
        success: [],
        failed: [],
        totalTables: 8
    };

    // Test 1: Categories table
    try {
        console.log('1️⃣ Testing categories table...');
        const { data, error } = await supabase
            .from('categories')
            .insert({
                name: 'Test Category',
                description: 'This is a test category for verification',
                icon: '🧪',
                workflow_count: 0
            })
            .select();
        
        if (error) throw error;
        console.log('✅ Categories table: SUCCESS');
        console.log(`   Created category: ${data[0].name} (ID: ${data[0].id})`);
        results.success.push('categories');
    } catch (error) {
        console.log('❌ Categories table: FAILED');
        console.log(`   Error: ${error.message}`);
        results.failed.push('categories');
    }

    // Test 2: Tags table (needed before workflows)
    try {
        console.log('\n2️⃣ Testing tags table...');
        const { data, error } = await supabase
            .from('tags')
            .insert({
                name: 'test-tag',
                description: 'Test tag for verification',
                color: '#FF5733',
                usage_count: 0
            })
            .select();
        
        if (error) throw error;
        console.log('✅ Tags table: SUCCESS');
        console.log(`   Created tag: ${data[0].name} (ID: ${data[0].id})`);
        results.success.push('tags');
    } catch (error) {
        console.log('❌ Tags table: FAILED');
        console.log(`   Error: ${error.message}`);
        results.failed.push('tags');
    }

    // Get category ID for workflow test
    let categoryId = null;
    try {
        const { data } = await supabase
            .from('categories')
            .select('id')
            .limit(1)
            .single();
        categoryId = data?.id;
    } catch (error) {
        console.log('⚠️ Could not get category ID for workflow test');
    }

    // Test 3: Workflows table
    let workflowId = null;
    try {
        console.log('\n3️⃣ Testing workflows table...');
        const { data, error } = await supabase
            .from('workflows')
            .insert({
                name: 'Test Workflow',
                description: 'This is a test workflow for verification',
                category_id: categoryId,
                file_path: '/test/test-workflow.json',
                file_type: 'json',
                file_size: 1024,
                original_filename: 'test-workflow.json',
                n8n_workflow_id: 'test-123',
                node_count: 3,
                connection_count: 2,
                complexity_score: 5,
                is_active: true,
                metadata: { test: true }
            })
            .select();
        
        if (error) throw error;
        workflowId = data[0].id;
        console.log('✅ Workflows table: SUCCESS');
        console.log(`   Created workflow: ${data[0].name} (ID: ${data[0].id})`);
        results.success.push('workflows');
    } catch (error) {
        console.log('❌ Workflows table: FAILED');
        console.log(`   Error: ${error.message}`);
        results.failed.push('workflows');
    }

    // Test 4: Workflow nodes table
    try {
        console.log('\n4️⃣ Testing workflow_nodes table...');
        const { data, error } = await supabase
            .from('workflow_nodes')
            .insert({
                workflow_id: workflowId,
                node_id: 'test-node-1',
                node_name: 'Test Node',
                node_type: 'n8n-nodes-base.webhook',
                node_type_version: '1.0',
                position_x: 100.5,
                position_y: 200.5,
                parameters: { method: 'GET' },
                credentials: {},
                is_disabled: false,
                notes: 'Test node for verification'
            })
            .select();
        
        if (error) throw error;
        console.log('✅ Workflow nodes table: SUCCESS');
        console.log(`   Created node: ${data[0].node_name} (ID: ${data[0].id})`);
        results.success.push('workflow_nodes');
    } catch (error) {
        console.log('❌ Workflow nodes table: FAILED');
        console.log(`   Error: ${error.message}`);
        results.failed.push('workflow_nodes');
    }

    // Test 5: Workflow connections table
    try {
        console.log('\n5️⃣ Testing workflow_connections table...');
        const { data, error } = await supabase
            .from('workflow_connections')
            .insert({
                workflow_id: workflowId,
                source_node_id: 'test-node-1',
                target_node_id: 'test-node-2',
                source_output_index: 0,
                target_input_index: 0,
                connection_type: 'main'
            })
            .select();
        
        if (error) throw error;
        console.log('✅ Workflow connections table: SUCCESS');
        console.log(`   Created connection: ${data[0].source_node_id} → ${data[0].target_node_id}`);
        results.success.push('workflow_connections');
    } catch (error) {
        console.log('❌ Workflow connections table: FAILED');
        console.log(`   Error: ${error.message}`);
        results.failed.push('workflow_connections');
    }

    // Test 6: Workflow tags junction table
    let tagId = null;
    try {
        const { data } = await supabase
            .from('tags')
            .select('id')
            .limit(1)
            .single();
        tagId = data?.id;
    } catch (error) {
        console.log('⚠️ Could not get tag ID for workflow_tags test');
    }

    try {
        console.log('\n6️⃣ Testing workflow_tags table...');
        const { data, error } = await supabase
            .from('workflow_tags')
            .insert({
                workflow_id: workflowId,
                tag_id: tagId
            })
            .select();
        
        if (error) throw error;
        console.log('✅ Workflow tags table: SUCCESS');
        console.log(`   Created workflow-tag relationship`);
        results.success.push('workflow_tags');
    } catch (error) {
        console.log('❌ Workflow tags table: FAILED');
        console.log(`   Error: ${error.message}`);
        results.failed.push('workflow_tags');
    }

    // Test 7: Leads table
    try {
        console.log('\n7️⃣ Testing leads table...');
        const { data, error } = await supabase
            .from('leads')
            .insert({
                name: 'John Test',
                email: 'john.test@example.com',
                company: 'Test Company',
                use_case: 'Testing database functionality',
                interest_level: 'high',
                source: 'modal_popup',
                ip_address: '192.168.1.1',
                user_agent: 'Mozilla/5.0 Test Browser',
                referrer_url: 'https://test.com',
                utm_source: 'test',
                utm_medium: 'database',
                utm_campaign: 'verification',
                consent_marketing: true,
                consent_data_processing: true,
                status: 'new',
                notes: 'Test lead for database verification',
                metadata: { test: true }
            })
            .select();
        
        if (error) throw error;
        console.log('✅ Leads table: SUCCESS');
        console.log(`   Created lead: ${data[0].name} (${data[0].email})`);
        results.success.push('leads');
    } catch (error) {
        console.log('❌ Leads table: FAILED');
        console.log(`   Error: ${error.message}`);
        results.failed.push('leads');
    }

    // Test 8: Sync logs table
    try {
        console.log('\n8️⃣ Testing sync_logs table...');
        const { data, error } = await supabase
            .from('sync_logs')
            .insert({
                operation_type: 'test_operation',
                file_path: '/test/verification.json',
                status: 'success',
                error_message: null,
                files_processed: 1,
                workflows_created: 1,
                workflows_updated: 0,
                workflows_deleted: 0,
                duration_ms: 150,
                metadata: { test: true, verification: 'database_test' }
            })
            .select();
        
        if (error) throw error;
        console.log('✅ Sync logs table: SUCCESS');
        console.log(`   Created sync log: ${data[0].operation_type} (Status: ${data[0].status})`);
        results.success.push('sync_logs');
    } catch (error) {
        console.log('❌ Sync logs table: FAILED');
        console.log(`   Error: ${error.message}`);
        results.failed.push('sync_logs');
    }

    // Final Report
    console.log('\n' + '='.repeat(60));
    console.log('📊 DATABASE TABLES TEST REPORT');
    console.log('='.repeat(60));
    console.log(`✅ Successful tables: ${results.success.length}/${results.totalTables}`);
    console.log(`❌ Failed tables: ${results.failed.length}/${results.totalTables}`);
    console.log('');
    
    if (results.success.length > 0) {
        console.log('✅ Working tables:');
        results.success.forEach(table => console.log(`   • ${table}`));
    }
    
    if (results.failed.length > 0) {
        console.log('\n❌ Failed tables:');
        results.failed.forEach(table => console.log(`   • ${table}`));
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (results.success.length === results.totalTables) {
        console.log('🎉 ALL TABLES ARE WORKING PERFECTLY!');
        console.log('✨ Your Supabase database is ready for production!');
    } else {
        console.log('⚠️ Some tables need attention before proceeding.');
    }
    
    console.log('='.repeat(60));
    
    return results.success.length === results.totalTables;
}

// Run the test
testDatabaseTables()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('🚨 Test execution failed:', error.message);
        process.exit(1);
    });