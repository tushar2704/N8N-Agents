import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Test results tracking
const testResults = {
  connection: false,
  tables: {},
  operations: {},
  cleanup: {}
};

// Sample data for testing
const sampleData = {
  category: {
    name: 'Test Category',
    description: 'A test category for verification',
    icon: '🧪',
    count: 0
  },
  workflow: {
    name: 'Test Workflow',
    description: 'A test workflow for verification',
    content: {
      id: 'test-workflow-123',
      name: 'Test Workflow',
      nodes: [
        {
          id: 'node1',
          type: 'trigger',
          name: 'Test Trigger'
        }
      ]
    },
    file_path: '/test/test-workflow.json',
    file_size: 1024,
    file_hash: 'test-hash-123',
    tags: ['test', 'automation'],
    search_vector: null
  },
  tag: {
    name: 'test-tag',
    usage_count: 0
  },
  lead: {
    email: 'test@example.com',
    name: 'Test User',
    company: 'Test Company',
    message: 'This is a test lead',
    source: 'modal',
    metadata: {
      browser: 'Chrome',
      timestamp: new Date().toISOString()
    }
  }
};

// Utility functions
function formatResult(success, message, data = null) {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

function logResult(operation, result) {
  const icon = result.success ? '✅' : '❌';
  console.log(`${icon} ${operation}: ${result.message}`);
  if (result.data && typeof result.data === 'object') {
    console.log(`   Data: ${JSON.stringify(result.data, null, 2).substring(0, 100)}...`);
  }
}

// Test functions
async function testConnection() {
  console.log('\n🔗 Testing Supabase Connection...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error && error.message.includes('Invalid API key')) {
      throw new Error('Invalid API key');
    }
    testResults.connection = true;
    logResult('Connection Test', formatResult(true, 'Successfully connected to Supabase'));
    return true;
  } catch (error) {
    testResults.connection = false;
    logResult('Connection Test', formatResult(false, `Connection failed: ${error.message}`));
    return false;
  }
}

async function testCategoriesTable() {
  console.log('\n📁 Testing Categories Table...');
  
  try {
    // Insert test category
    const { data: insertData, error: insertError } = await supabase
      .from('categories')
      .insert([sampleData.category])
      .select();
    
    if (insertError) throw insertError;
    
    const categoryId = insertData[0].id;
    testResults.tables.categories = {
      insert: formatResult(true, 'Category inserted successfully', insertData[0]),
      insertedId: categoryId
    };
    
    logResult('Categories Insert', testResults.tables.categories.insert);
    
    // Read test
    const { data: readData, error: readError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();
    
    if (readError) throw readError;
    
    testResults.tables.categories.read = formatResult(true, 'Category read successfully', readData);
    logResult('Categories Read', testResults.tables.categories.read);
    
    // Update test
    const { data: updateData, error: updateError } = await supabase
      .from('categories')
      .update({ description: 'Updated test category description' })
      .eq('id', categoryId)
      .select();
    
    if (updateError) throw updateError;
    
    testResults.tables.categories.update = formatResult(true, 'Category updated successfully', updateData[0]);
    logResult('Categories Update', testResults.tables.categories.update);
    
    return true;
  } catch (error) {
    const errorResult = formatResult(false, `Categories table test failed: ${error.message}`);
    testResults.tables.categories = { error: errorResult };
    logResult('Categories Test', errorResult);
    return false;
  }
}

async function testWorkflowsTable() {
  console.log('\n⚙️  Testing Workflows Table...');
  
  try {
    // Get a category ID first
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .limit(1);
    
    const categoryId = categories[0]?.id || testResults.tables.categories?.insertedId;
    
    if (!categoryId) {
      throw new Error('No category found for workflow test');
    }
    
    const workflowData = {
      ...sampleData.workflow,
      category_id: categoryId
    };
    
    // Insert test workflow
    const { data: insertData, error: insertError } = await supabase
      .from('workflows')
      .insert([workflowData])
      .select();
    
    if (insertError) throw insertError;
    
    const workflowId = insertData[0].id;
    testResults.tables.workflows = {
      insert: formatResult(true, 'Workflow inserted successfully', insertData[0]),
      insertedId: workflowId
    };
    
    logResult('Workflows Insert', testResults.tables.workflows.insert);
    
    // Read test
    const { data: readData, error: readError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single();
    
    if (readError) throw readError;
    
    testResults.tables.workflows.read = formatResult(true, 'Workflow read successfully', readData);
    logResult('Workflows Read', testResults.tables.workflows.read);
    
    return true;
  } catch (error) {
    const errorResult = formatResult(false, `Workflows table test failed: ${error.message}`);
    testResults.tables.workflows = { error: errorResult };
    logResult('Workflows Test', errorResult);
    return false;
  }
}

async function testTagsTable() {
  console.log('\n🏷️  Testing Tags Table...');
  
  try {
    // Insert test tag
    const { data: insertData, error: insertError } = await supabase
      .from('tags')
      .insert([sampleData.tag])
      .select();
    
    if (insertError) throw insertError;
    
    const tagId = insertData[0].id;
    testResults.tables.tags = {
      insert: formatResult(true, 'Tag inserted successfully', insertData[0]),
      insertedId: tagId
    };
    
    logResult('Tags Insert', testResults.tables.tags.insert);
    
    // Read test
    const { data: readData, error: readError } = await supabase
      .from('tags')
      .select('*')
      .eq('id', tagId)
      .single();
    
    if (readError) throw readError;
    
    testResults.tables.tags.read = formatResult(true, 'Tag read successfully', readData);
    logResult('Tags Read', testResults.tables.tags.read);
    
    return true;
  } catch (error) {
    const errorResult = formatResult(false, `Tags table test failed: ${error.message}`);
    testResults.tables.tags = { error: errorResult };
    logResult('Tags Test', errorResult);
    return false;
  }
}

async function testLeadsTable() {
  console.log('\n👤 Testing Leads Table...');
  
  try {
    // Insert test lead
    const { data: insertData, error: insertError } = await supabase
      .from('leads')
      .insert([sampleData.lead])
      .select();
    
    if (insertError) throw insertError;
    
    const leadId = insertData[0].id;
    testResults.tables.leads = {
      insert: formatResult(true, 'Lead inserted successfully', insertData[0]),
      insertedId: leadId
    };
    
    logResult('Leads Insert', testResults.tables.leads.insert);
    
    // Read test
    const { data: readData, error: readError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();
    
    if (readError) throw readError;
    
    testResults.tables.leads.read = formatResult(true, 'Lead read successfully', readData);
    logResult('Leads Read', testResults.tables.leads.read);
    
    return true;
  } catch (error) {
    const errorResult = formatResult(false, `Leads table test failed: ${error.message}`);
    testResults.tables.leads = { error: errorResult };
    logResult('Leads Test', errorResult);
    return false;
  }
}

async function testWorkflowNodesTable() {
  console.log('\n🔧 Testing Workflow Nodes Table...');
  
  try {
    const workflowId = testResults.tables.workflows?.insertedId;
    
    if (!workflowId) {
      throw new Error('No workflow found for node test');
    }
    
    const nodeData = {
      workflow_id: workflowId,
      node_id: 'test-node-123',
      name: 'Test Node',
      type: 'trigger',
      position_x: 100,
      position_y: 200,
      parameters: {
        testParam: 'testValue'
      }
    };
    
    // Insert test node
    const { data: insertData, error: insertError } = await supabase
      .from('workflow_nodes')
      .insert([nodeData])
      .select();
    
    if (insertError) throw insertError;
    
    testResults.tables.workflow_nodes = {
      insert: formatResult(true, 'Workflow node inserted successfully', insertData[0]),
      insertedId: insertData[0].id
    };
    
    logResult('Workflow Nodes Insert', testResults.tables.workflow_nodes.insert);
    
    return true;
  } catch (error) {
    const errorResult = formatResult(false, `Workflow nodes table test failed: ${error.message}`);
    testResults.tables.workflow_nodes = { error: errorResult };
    logResult('Workflow Nodes Test', errorResult);
    return false;
  }
}

async function testWorkflowTagsTable() {
  console.log('\n🔗 Testing Workflow Tags Table...');
  
  try {
    const workflowId = testResults.tables.workflows?.insertedId;
    const tagId = testResults.tables.tags?.insertedId;
    
    if (!workflowId || !tagId) {
      throw new Error('Missing workflow or tag for workflow_tags test');
    }
    
    const workflowTagData = {
      workflow_id: workflowId,
      tag_id: tagId
    };
    
    // Insert test workflow-tag relationship
    const { data: insertData, error: insertError } = await supabase
      .from('workflow_tags')
      .insert([workflowTagData])
      .select();
    
    if (insertError) throw insertError;
    
    testResults.tables.workflow_tags = {
      insert: formatResult(true, 'Workflow tag relationship inserted successfully', insertData[0])
    };
    
    logResult('Workflow Tags Insert', testResults.tables.workflow_tags.insert);
    
    return true;
  } catch (error) {
    const errorResult = formatResult(false, `Workflow tags table test failed: ${error.message}`);
    testResults.tables.workflow_tags = { error: errorResult };
    logResult('Workflow Tags Test', errorResult);
    return false;
  }
}

async function testSyncLogsTable() {
  console.log('\n📋 Testing Sync Logs Table...');
  
  try {
    const syncLogData = {
      operation: 'test_sync',
      status: 'completed',
      files_processed: 1,
      files_succeeded: 1,
      files_failed: 0,
      details: {
        testOperation: true,
        timestamp: new Date().toISOString()
      }
    };
    
    // Insert test sync log
    const { data: insertData, error: insertError } = await supabase
      .from('sync_logs')
      .insert([syncLogData])
      .select();
    
    if (insertError) throw insertError;
    
    testResults.tables.sync_logs = {
      insert: formatResult(true, 'Sync log inserted successfully', insertData[0]),
      insertedId: insertData[0].id
    };
    
    logResult('Sync Logs Insert', testResults.tables.sync_logs.insert);
    
    return true;
  } catch (error) {
    const errorResult = formatResult(false, `Sync logs table test failed: ${error.message}`);
    testResults.tables.sync_logs = { error: errorResult };
    logResult('Sync Logs Test', errorResult);
    return false;
  }
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');
  
  const cleanup = async (tableName, id) => {
    if (!id) return;
    
    try {
      const { error } = await supa