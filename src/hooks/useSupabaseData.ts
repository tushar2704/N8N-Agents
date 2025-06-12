import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export interface WorkflowFile {
  id: string;
  name: string;
  path: string;
  category: string;
  description?: string;
  tags?: string[];
  nodeCount?: number;
  complexity?: 'simple' | 'medium' | 'complex';
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  workflowCount: number;
  workflows: WorkflowFile[];
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  color: string;
  usageCount: number;
}

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Category icons mapping
const categoryIcons: { [key: string]: string } = {
  'Agriculture': '🌾',
  'AI_ML': '🤖',
  'AI_Research_RAG_and_Data_Analysis': '🔬',
  'OpenAI_and_LLMs': '🧠',
  'Data_Analysis': '📊',
  'E_Commerce': '🛒',
  'Instagram_Twitter_Social_Media': '📱',
  'IoT': '🌐',
  'Legal_Tech': '⚖️',
  'Manufacturing': '🏭',
  'Media': '🎬',
  'Misc': '📦',
  'Notion': '📝',
  'Other': '🔧',
  'Other_Integrations_and_Use_Cases': '🔗',
  'Finance': '💰',
  'Crypto': '₿',
  'CRM': '👥',
  'Healthcare': '🏥',
  'Education': '🎓',
  'Real_Estate': '🏠',
  'Travel': '✈️',
  'Food': '🍕',
  'Entertainment': '🎮',
};

function useSupabaseData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowFile[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories from Supabase
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          setError('Failed to fetch categories from database');
          return;
        }

        // Fetch workflows from Supabase
        const { data: workflowsData, error: workflowsError } = await supabase
          .from('workflows')
          .select(`
            *,
            categories(name)
          `)
          .eq('is_active', true)
          .order('name');

        if (workflowsError) {
          console.error('Error fetching workflows:', workflowsError);
          setError('Failed to fetch workflows from database');
          return;
        }

        // Fetch tags from Supabase
        const { data: tagsData, error: tagsError } = await supabase
          .from('tags')
          .select('*')
          .order('usage_count', { ascending: false });

        if (tagsError) {
          console.error('Error fetching tags:', tagsError);
        }

        // Transform workflows data
        const transformedWorkflows: WorkflowFile[] = (workflowsData || []).map((workflow: any) => ({
          id: workflow.id,
          name: workflow.name,
          path: workflow.file_path,
          category: workflow.categories?.name || 'Other',
          description: workflow.description || `N8N workflow for ${workflow.name}`,
          nodeCount: workflow.node_count || 0,
          complexity: workflow.complexity_score > 7 ? 'complex' : 
                     workflow.complexity_score > 3 ? 'medium' : 'simple'
        }));

        // Transform categories data and group workflows by category
        const transformedCategories: Category[] = (categoriesData || []).map((category: any) => {
          const categoryWorkflows = transformedWorkflows.filter(
            workflow => workflow.category === category.name
          );
          
          return {
            id: category.id,
            name: category.name,
            description: category.description || `${category.name} workflows and automation`,
            icon: categoryIcons[category.name] || '📁',
            workflowCount: categoryWorkflows.length,
            workflows: categoryWorkflows
          };
        });

        // Transform tags data
        const transformedTags: Tag[] = (tagsData || []).map((tag: any) => ({
          id: tag.id,
          name: tag.name,
          description: tag.description,
          color: tag.color || '#3B82F6',
          usageCount: tag.usage_count || 0
        }));

        setCategories(transformedCategories);
        setWorkflows(transformedWorkflows);
        setTags(transformedTags);
        
      } catch (err) {
        console.error('Error loading data from Supabase:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return {
    categories,
    workflows,
    tags,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      // Re-trigger the useEffect
      window.location.reload();
    }
  };
}

export default useSupabaseData;