import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Function to test each table with correct column names
async function testAllTables() {
  console.log('🚀 Starting comprehensive database test with correct schema...');
  console.log('=======================================================\n');
  
  const results = {
    total: 8,
    passed: 0,
    failed: 0,
    details: []
  };
  
  // 1. Test categories table
  console.log('1️⃣ Testing categories table...');
  try {
    const uniqueName = `Test Category ${Date.now()}`;
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: uniqueName,
        description: 'Test category for verification',
        icon: '🧪'
      })
      .select();
    
    if (error) throw error;
    console.log('✅ Categories: SUCCESS');
    console.log(`   Created: ${data[0].name} (ID: ${data[0].id})\n`);
    results.passed++;
    results.details.push({ table: 'categories', status: 'SUCCESS', id: data[0].id });
  } catch (err) {
    console.log('❌ Categories: FAILED');
    console.log(`   Error: ${err.message}\n`);
    results.failed++;
    results.details.push({ table: 'categories', status: 'FAILED', error: err.message });
  }
  
  // 2. Test tags table
  console.log('2️⃣ Testing tags table...');
  try {
    const uniqueName = `test-tag-${Date.now()}`;
    const { data, error } = await supabase
      .from('tags')
      .insert({
        name: uniqueName,
        description: 'Test tag for verification',
        color: '#4ECDC4'
      })
      .select();
    
    if (error) throw error;
    console.log('✅ Tags: SUCCESS');
    console.log(`   Created: ${data[0].name} (ID: ${data[0].id})\n`);
    results.passed++;
    results.details.push({ table: 'tags', status: 'SUCCESS', id: data[0].id });
  } catch (err) {
    console.log('❌ Tags: FAILED');
    console.log(`   Error: ${err.message}\n`);
    results.failed++;
    results.details.push({ table: 'tags', status: 'FAILED', error: err.message });
  }
  
  // 3. Test workflows table (using correct column names)
  console.log('3️⃣ Testing workflows table...');
  try {
    const uniqueName = `Test Workflow ${Date.now()}`;
    const { data, error } = await supabase
      .from('workflows')
      .insert({
        name: uniqueName,
        description: 'Test workflow for verification',
        file_path: '/test/path.json',
        file_type: 'json',
        file_size: 1024,
        original_filename: 'test-workflow.json',
        metadata: { test: true }
      })
      .select();
    
    if (error) throw error;
    console.log('✅ Workflows: SUCCESS');
    console.log(`   Created: ${data[0].name} (ID: ${data[0].id})\n`);
    results.passed++;
    results.details.push({ table: 'workflows', status: 'SUCCESS', id: data[0].id });
  } catch (err) {
    console.log('❌ Workflows: FAILED');
    console.log(`   Error: ${err.message}\n`);
    results.failed++;
    results.details.push({ table: 'workflows', status: 'FAILED', error: err.message });
  }
  
  // 4. Test workflow_nodes table (using correct column names)
  console.log('4️⃣ Testing workflow_nodes table...');
  try {
    // Get a workflow ID first
    const { data: workflows } = await supabase.from('workflows').select('id').limit(1);
    if (workflows.length === 0) throw new Error('No workflows available for node test');
    
    const uniqueNodeId = `test-node-${Date.now()}`;
    const { data, error } = await supabase
      .from('workflow_nodes')
      .insert({
        workflow_id: workflows[0].id,
        node_id: uniqueNodeId,
        node_name: 'Test Node',
        node_type: 'test',
        position_x: 100,
        position_y: 100,
        parameters: { testParam: 'testValue' }
      })
      .select();
    
    if (error) throw error;
    console.log('✅ Workflow Nodes: SUCCESS');
    console.log(`   Created: ${data[0].node_name} (ID: ${data[0].id})\n`);
    results.passed++;
    results.details.push({ table: 'workflow_nodes', status: 'SUCCESS', id: data[0].id });
  } catch (err) {
    console.log('❌ Workflow Nodes: FAILED');
    console.log(`   Error: ${err.message}\n`);
    results.failed++;
    results.details.push({ table: 'workflow_nodes', status: 'FAILED', error: err.message });
  }
  
  // 5. Test workflow_connections table (using correct column names)
  console.log('5️⃣ Testing workflow_connections table...');
  try {
    // Get a workflow ID first
    const { data: workflows } = await supabase.from('workflows').select('id').limit(1);
    if (workflows.length === 0) throw new Error('No workflows available for connection test');
    
    const uniqueId = Date.now();
    const { data, error } = await supabase
      .from('workflow_connections')
      .insert({
        workflow_id: workflows[0].id,
        source_node_id: `source-${uniqueId}`,
        target_node_id: `target-${uniqueId}`,
        source_output_index: 0,
        target_input_index: 0,
        connection_type: 'main'
      })
      .select();
    
    if (error) throw error;
    console.log('✅ Workflow Connections: SUCCESS');
    console.log(`   Created connection: ${data[0].source_node_id} → ${data[0].target_node_id} (ID: ${data[0].id})\n`);
    results.passed++;
    results.details.push({ table: 'workflow_connections', status: 'SUCCESS', id: data[0].id });
  } catch (err) {
    console.log('❌ Workflow Connections: FAILED');
    console.log(`   Error: ${err.message}\n`);
    results.failed++;
    results.details.push({ table: 'workflow_connections', status: 'FAILED', error: err.message });
  }
  
  // 6. Test workflow_tags table
  console.log('6️⃣ Testing workflow_tags table...');
  try {
    // Get existing workflow and tag IDs
    const { data: workflows } = await supabase.from('workflows').select('id').limit(1);
    const { data: tags } = await supabase.from('tags').select('id').limit(1);
    
    if (workflows.length > 0 && tags.length > 0) {
      const { data, error } = await supabase
        .from('workflow_tags')
        .insert({
          workflow_id: workflows[0].id,
          tag_id: tags[0].id
        })
        .select();
      
      if (error && !error.message.includes('duplicate')) throw error;
      console.log('✅ Workflow Tags: SUCCESS');
      console.log('   Created workflow-tag relationship\n');
      results.passed++;
      results.details.push({ table: 'workflow_tags', status: 'SUCCESS' });
    } else {
      throw new Error('No workflows or tags available for junction test');
    }
  } catch (err) {
    console.log('❌ Workflow Tags: FAILED');
    console.log(`   Error: ${err.message}\n`);
    results.failed++;
    results.details.push({ table: 'workflow_tags', status: 'FAILED', error: err.message });
  }
  
  // 7. Test leads table (using correct column names)
  console.log('7️⃣ Testing leads table...');
  try {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: 'Test User',
        email: uniqueEmail,
        company: 'Test Company',
        use_case: 'Testing database functionality',
        interest_level: 'high',
        source: 'verification_test',
        status: 'new',
        metadata: { testRun: true }
      })
      .select();
    
    if (error) throw error;
    console.log('✅ Leads: SUCCESS');
    console.log(`   Created lead: ${data[0].name} (${data[0].email}) (ID: ${data[0].id})\n`);
    results.passed++;
    results.details.push({ table: 'leads', status: 'SUCCESS', id: data[0].id });
  } catch (err) {
    console.log('❌ Leads: FAILED');
    console.log(`   Error: ${err.message}\n`);
    results.failed++;
    results.details.push({ table: 'leads', status: 'FAILED', error: err.message });
  }
  
  // 8. Test sync_logs table (using correct column names)
  console.log('8️⃣ Testing sync_logs table...');
  try {
    const { data, error } = await supabase
      .from('sync_logs')
      .insert({
        operation_type: 'verification_test',
        file_path: '/test/verification.json',
        status: 'success',
        files_processed: 1,
        workflows_created: 0,
        workflows_updated: 0,
        workflows_deleted: 0,
        duration_ms: 100,
        metadata: { message: 'Database verification test completed' }
      })
      .select();
    
    if (error) throw error;
    console.log('✅ Sync Logs: SUCCESS');
    console.log(`   Created sync log: ${data[0].operation_type} (ID: ${data[0].id})\n`);
    results.passed++;
    results.details.push({ table: 'sync_logs', status: 'SUCCESS', id: data[0].id });
  } catch (err) {
    console.log('❌ Sync Logs: FAILED');
    console.log(`   Error: ${err.message}\n`);
    results.failed++;
    results.details.push({ table: 'sync_logs', status: 'FAILED', error: err.message });
  }
  
  // Final Report
  console.log('\n📊 FINAL TEST REPORT');
  console.log('============================================');
  console.log(`✅ Successful tables: ${results.passed}/${results.total}`);
  console.log(`❌ Failed tables: ${results.failed}/${results.total}\n`);
  
  const successfulTables = results.details.filter(d => d.status === 'SUCCESS').map(d => d.table);
  const failedTables = results.details.filter(d => d.status === 'FAILED').map(d => d.table);
  
  if (successfulTables.length > 0) {
    console.log('✅ Working tables:');
    successfulTables.forEach(table => console.log(`   • ${table}`));
    console.log('');
  }
  
  if (failedTables.length > 0) {
    console.log('❌ Failed tables:');
    failedTables.forEach(table => console.log(`   • ${table}`));
    console.log('');
  }
  
  console.log('============================================');
  if (results.failed === 0) {
    console.log('🎉 All database tables are working perfectly!');
    console.log('💡 Your lead generation form should be working correctly.');
    console.log('   If form submissions aren\'t appearing, check:');
    console.log('   • Frontend form is posting to correct API endpoint');
    console.log('   • API endpoint is using correct Supabase credentials');
    console.log('   • Form field names match database column names');
  } else {
    console.log('⚠️ Some tables need attention before proceeding.');
  }
  console.log('============================================');
}

testAllTables().catch(console.error);