import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkLeads() {
  console.log('🔍 Checking leads table data...');
  
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Error:', error);
      return;
    }
    
    console.log(`📊 Found ${data.length} leads in database:`);
    console.log('================================');
    
    if (data.length === 0) {
      console.log('🚫 No leads found in database');
    } else {
      data.forEach((lead, index) => {
        console.log(`${index + 1}. Name: ${lead.name}`);
        console.log(`   Email: ${lead.email}`);
        console.log(`   Phone: ${lead.phone || 'Not provided'}`);
        console.log(`   Source: ${lead.source || 'Unknown'}`);
        console.log(`   Status: ${lead.status}`);
        console.log(`   Created: ${new Date(lead.created_at).toLocaleString()}`);
        console.log('   ---');
      });
    }
    
  } catch (err) {
    console.log('💥 Unexpected error:', err);
  }
}

checkLeads();