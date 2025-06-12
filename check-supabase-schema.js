import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to check if tables exist and show their structure
async function checkDatabaseSchema() {
  console.log('🔍 CHECKING SUPABASE DATABASE SCHEMA');
  console.log('================================================================================');
  
  try {
    // Check connection with a simple test
    console.log('🔗 Testing connection...');
    try {
      // Simple connection test - try to access any table
      const { data, error } = await supabase.auth.getSession();
      console.log('✅ Connection successful!');
    } catch (err) {
      console.log('❌ Connection failed:', err.message);
      return;
    }
    console.log('');
    
    // Check each expected table directly
    const expectedTables = [
      'categories',
      'workflows', 
      'workflow_nodes',
      'workflow_connections',
      'tags',
      'workflow_tags',
      'leads',
      'sync_logs'
    ];
    
    console.log('🔍 Checking each expected table...');
    
    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${tableName}': ${error.message}`);
        } else {
          console.log(`✅ Table '${tableName}': EXISTS (${data ? data.length : 0} rows checked)`);
        }
      } catch (err) {
        console.log(`❌ Table '${tableName}': ERROR - ${err.message}`);
      }
    }
    
    console.log('');
    
    // Additional connection verification
    console.log('\n🔍 Verifying Supabase configuration...');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   API Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT SET'}`);
    
    // Try a simple operation that should work even without tables
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error && error.message.includes('JWT')) {
        console.log('⚠️  Authentication issue - check your API key');
      } else {
        console.log('✅ API key is valid');
      }
    } catch (err) {
      console.log('⚠️  Could not verify API key:', err.message);
    }
    
  } catch (error) {
    console.log('❌ Error checking schema:', error.message);
  }
  
  console.log('');
  console.log('================================================================================');
  console.log('💡 RECOMMENDATIONS:');
  console.log('1. If no tables exist, run the SQL schema in Supabase Dashboard');
  console.log('2. Go to Supabase Dashboard → SQL Editor');
  console.log('3. Paste the content from supabase-schema.sql');
  console.log('4. Click "Run" to create all tables');
  console.log('5. Then re-run the test script');
  console.log('================================================================================');
}

// Run the schema check
checkDatabaseSchema().catch(console.error);

export { checkDatabaseSchema };