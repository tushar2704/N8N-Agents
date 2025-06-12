import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

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

export function useSupabaseData() {
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

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (categoriesError) throw categoriesError;

        // Fetch workflows
        const { data: workflowsData, error: workflowsError } = await supabase
          .from('workflows')
          .select(`
            id,
            name,
            description,
            file_path,
            node_count,
            complexity_score,
            categories!inner(name)
          `)
          .eq('is_active', true)
          .order('name');

        if (workflowsError) throw workflowsError;

        // Fetch tags
        const { data: tagsData, error: tagsError } = await supabase
          .from('tags')
          .select('*')
          .order('usage_count', { ascending: false });

        if (tagsError) throw tagsError;

        // Transform workflows data
        const transformedWorkflows: WorkflowFile[] = workflowsData.map(wf => ({
          id: wf.id,
          name: wf.name,
          path: wf.file_path,
          category: wf.categories?.name || 'Other',
          description: wf.description || '',
          nodeCount: wf.node_count || 0,
          complexity: wf.complexity_score > 20 ? 'complex' : 
                     wf.complexity_score > 10 ? 'medium' : 'simple'
        }));

        // Transform categories data and group workflows
        const transformedCategories: Category[] = categoriesData.map(cat => {
          const categoryWorkflows = transformedWorkflows.filter(
            wf => wf.category === cat.name
          );
          
          return {
            id: cat.id,
            name: cat.name,
            description: cat.description || '',
            icon: cat.icon || '📁',
            count: categoryWorkflows.length,
            workflows: categoryWorkflows
          };
        });

        // Transform tags data
        const transformedTags: Tag[] = tagsData.map(tag => ({
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
        console.error('Error fetching data from Supabase:', err);
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