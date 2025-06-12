import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function createSampleData() {
  console.log('🔧 Creating sample data for testing...');
  
  try {
    // Insert sample categories
    console.log('Inserting sample categories...');
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .upsert([
        {
          name: 'AI_ML',
          description: 'Intelligent automation workflows powered by AI and ML technologies',
          icon: '🤖',
          workflow_count: 10
        },
        {
          name: 'Data_Analysis',
          description: 'Data processing and analysis workflows',
          icon: '📊',
          workflow_count: 15
        },
        {
          name: 'E_Commerce',
          description: 'E-commerce automation and integration workflows',
          icon: '🛒',
          workflow_count: 8
        }
      ], { onConflict: 'name' })
      .select();
    
    if (categoryError) {
      console.error('❌ Error inserting categories:', categoryError);
    } else {
      console.log('✅ Sample categories inserted successfully:', categoryData?.length || 0, 'categories');
    }
    
    // Insert sample tags
    console.log('Inserting sample tags...');
    const { data: tagData, error: tagError } = await supabase
      .from('tags')
      .upsert([
        {
          name: 'automation',
          description: 'Workflow automation related',
          color: '#3B82F6',
          usage_count: 25
        },
        {
          name: 'ai',
          description: 'Artificial Intelligence related',
          color: '#8B5CF6',
          usage_count: 15
        },
        {
          name: 'data',
          description: 'Data processing related',
          color: '#10B981',
          usage_count: 20
        }
      ], { onConflict: 'name' })
      .select();
    
    if (tagError) {
      console.error('❌ Error inserting tags:', tagError);
    } else {
      console.log('✅ Sample tags inserted successfully:', tagData?.length || 0, 'tags');
    }
    
    console.log('\n🎉 Sample data creation completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createSampleData();