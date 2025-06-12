import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkActualSchema() {
  console.log('🔍 Checking actual database schema...');
  console.log('=========================================\n');
  
  const tables = [
    'categories',
    'workflows', 
    'workflow_nodes',
    'workflow_connections',
    'tags',
    'workflow_tags',
    'leads',
    'sync_logs'
  ];
  
  for (const tableName of tables) {
    console.log(`📋 Table: ${tableName}`);
    console.log('-------------------');
    
    try {
      // Try to get column information using information_schema
      const { data, error } = await supabase
        .rpc('get_table_columns', { table_name: tableName })
        .single();
      
      if (error) {
        // Fallback: try to select from table to see what columns exist
        const { data: sampleData, error: selectError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (selectError) {
          console.log(`❌ Error accessing table: ${selectError.message}`);
        } else {
          console.log('✅ Table exists');
          if (sampleData && sampleData.length > 0) {
            console.log('📊 Sample data columns:');
            Object.keys(sampleData[0]).forEach(col => {
              console.log(`   • ${col}`);
            });
          } else {
            console.log('📊 Table is empty - trying to describe structure...');
            
            // Try a simple insert to see what columns are required
            const { error: insertError } = await supabase
              .from(tableName)
              .insert({})
              .select();
            
            if (insertError) {
              console.log(`💡 Insert error reveals structure: ${insertError.message}`);
            }
          }
        }
      } else {
        console.log('✅ Found column information:', data);
      }
      
    } catch (err) {
      console.log(`💥 Unexpected error: ${err.message}`);
    }
    
    console.log('\n');
  }
  
  console.log('=========================================');
  console.log('🏁 Schema check completed');
}

checkActualSchema().catch(console.error);