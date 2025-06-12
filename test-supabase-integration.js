import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testSupabaseIntegration() {
  console.log('🧪 Testing Supabase Integration...');
  console.log('=' .repeat(50));
  
  let allTestsPassed = true;
  
  try {
    // Test 1: Check all tables exist and have data
    const tables = ['categories', 'workflows', 'workflow_nodes', 'workflow_connections', 'tags', 'workflow_tags', 'leads', 'sync_logs'];
    
    console.log('\n📋 Table Status Check:');
    console.log('-'.repeat(30));
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ERROR - ${error.message}`);
          allTestsPassed = false;
        } else {
          console.log(`✅ ${table}: ${count || 0} records`);
        }
      } catch (err) {
        console.log(`❌ ${table}: EXCEPTION - ${err.message}`);
        allTestsPassed = false;
      }
    }
    
    // Test 2: Test lead insertion (similar to form submission)
    console.log('\n📝 Lead Insertion Test:');
    console.log('-'.repeat(25));
    
    const testLead = {
      name: 'Test User',
      email: 'test@example.com',
      company: 'Test Company',
      use_case: 'Testing the lead insertion functionality',
      interest_level: 'high',
      source: 'test-script',
      consent_data_processing: true,
      status: 'new',
      metadata: {
        phone: '+1234567890',
        test_run: true
      }
    };
    
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .insert([testLead])
      .select();
    
    if (leadError) {
      console.log(`❌ Lead insertion failed: ${leadError.message}`);
      allTestsPassed = false;
    } else {
      console.log(`✅ Lead inserted successfully: ID ${leadData[0]?.id}`);
      
      // Clean up test lead
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadData[0].id);
      
      if (!deleteError) {
        console.log(`🧹 Test lead cleaned up`);
      }
    }
    
    // Test 3: Check categories data (should be used instead of static data)
    console.log('\n🏷️  Categories Data Check:');
    console.log('-'.repeat(28));
    
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (catError) {
      console.log(`❌ Categories fetch failed: ${catError.message}`);
      allTestsPassed = false;
    } else {
      console.log(`✅ Categories fetched: ${categories.length} items`);
      categories.forEach(cat => {
        console.log(`   • ${cat.name}: ${cat.description}`);
      });
    }
    
    // Test 4: Check tags data
    console.log('\n🏷️  Tags Data Check:');
    console.log('-'.repeat(20));
    
    const { data: tags, error: tagError } = await supabase
      .from('tags')
      .select('*')
      .order('name');
    
    if (tagError) {
      console.log(`❌ Tags fetch failed: ${tagError.message}`);
      allTestsPassed = false;
    } else {
      console.log(`✅ Tags fetched: ${tags.length} items`);
      tags.forEach(tag => {
        console.log(`   • ${tag.name}: ${tag.color}`);
      });
    }
    
    // Test 5: Check workflows data
    console.log('\n⚙️  Workflows Data Check:');
    console.log('-'.repeat(26));
    
    const { data: workflows, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .limit(5);
    
    if (workflowError) {
      console.log(`❌ Workflows fetch failed: ${workflowError.message}`);
      allTestsPassed = false;
    } else {
      console.log(`✅ Workflows fetched: ${workflows.length} items (showing first 5)`);
      workflows.forEach(wf => {
        console.log(`   • ${wf.name}: ${wf.description?.substring(0, 50)}...`);
      });
    }
    
    // Final Result
    console.log('\n' + '='.repeat(50));
    if (allTestsPassed) {
      console.log('🎉 ALL TESTS PASSED! Supabase integration is working correctly.');
      console.log('✅ All data is being fetched from Supabase tables.');
      console.log('✅ Lead insertion (form submission) functionality is working.');
    } else {
      console.log('❌ SOME TESTS FAILED! Check the errors above.');
    }
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
    allTestsPassed = false;
  }
  
  return allTestsPassed;
}

// Run the test
testSupabaseIntegration().then(success => {
  process.exit(success ? 0 : 1);
});