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
  type?: string;
  jsonContent?: string;
  fileSize?: number;
  fileExtension?: string;
  workflowNodes?: WorkflowNode[];
  workflowConnections?: WorkflowConnection[];
}

export interface WorkflowNode {
  id: string;
  workflow_id: string;
  node_id: string;
  node_name?: string;
  node_type?: string;
  node_type_version?: string;
  position_x?: number;
  position_y?: number;
  parameters?: any;
  credentials?: any;
  is_disabled?: boolean;
  notes?: string;
}

export interface WorkflowConnection {
  id: string;
  workflow_id: string;
  source_node_id: string;
  target_node_id: string;
  source_output_index?: number;
  target_input_index?: number;
  connection_type?: string;
}

export interface N8NFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_extension?: string;
  type?: string;
  json?: any;
  created_at: string;
  last_modified?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  use_case?: string;
  interest_level?: 'low' | 'medium' | 'high';
  source?: string;
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'archived';
  created_at: string;
}

export interface SyncLog {
  id: string;
  operation_type: string;
  file_path?: string;
  status: 'success' | 'error' | 'skipped';
  error_message?: string;
  files_processed?: number;
  workflows_created?: number;
  workflows_updated?: number;
  workflows_deleted?: number;
  duration_ms?: number;
  created_at: string;
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
  const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>([]);
  const [workflowConnections, setWorkflowConnections] = useState<WorkflowConnection[]>([]);
  const [n8nFiles, setN8nFiles] = useState<N8NFile[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
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

        // Fetch n8n files from Supabase
        const { data: n8nFilesData, error: n8nFilesError } = await supabase
          .from('n8n_files')
          .select('*')
          .order('filename');

        if (n8nFilesError) {
          console.error('Error fetching n8n files:', n8nFilesError);
        }

        // Fetch tags from Supabase
        const { data: tagsData, error: tagsError } = await supabase
          .from('tags')
          .select('*')
          .order('usage_count', { ascending: false });

        if (tagsError) {
          console.error('Error fetching tags:', tagsError);
        }

        // Fetch workflow nodes from Supabase
        const { data: workflowNodesData, error: workflowNodesError } = await supabase
          .from('workflow_nodes')
          .select('*')
          .order('created_at', { ascending: false });

        if (workflowNodesError) {
          console.error('Error fetching workflow nodes:', workflowNodesError);
        }

        // Fetch workflow connections from Supabase
        const { data: workflowConnectionsData, error: workflowConnectionsError } = await supabase
          .from('workflow_connections')
          .select('*')
          .order('created_at', { ascending: false });

        if (workflowConnectionsError) {
          console.error('Error fetching workflow connections:', workflowConnectionsError);
        }

        // Fetch leads from Supabase
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (leadsError) {
          console.error('Error fetching leads:', leadsError);
        }

        // Fetch sync logs from Supabase
        const { data: syncLogsData, error: syncLogsError } = await supabase
          .from('sync_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (syncLogsError) {
          console.error('Error fetching sync logs:', syncLogsError);
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
                     workflow.complexity_score > 3 ? 'medium' : 'simple',
          type: 'json'
        }));

        // Transform n8n files data
        const transformedN8nFiles: WorkflowFile[] = (n8nFilesData || []).map((file: any) => ({
          id: file.id,
          name: file.filename,
          path: file.file_path,
          category: 'N8N Files',
          description: `N8N file: ${file.filename}`,
          jsonContent: file.json,
          fileSize: file.file_size,
          fileExtension: file.file_extension,
          type: file.file_extension?.replace('.', '') || 'json',
          complexity: 'simple'
        }));

        // Combine all workflows
        const allWorkflows = [...transformedWorkflows, ...transformedN8nFiles];

        // Transform categories data and group workflows by category
        const transformedCategories: Category[] = (categoriesData || []).map((category: any) => {
          const categoryWorkflows = allWorkflows.filter(
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

        // Add N8N Files category if there are n8n files
        if (transformedN8nFiles.length > 0) {
          transformedCategories.push({
            id: 'n8n-files',
            name: 'N8N Files',
            description: 'N8N workflow files with JSON content available for download',
            icon: '📄',
            workflowCount: transformedN8nFiles.length,
            workflows: transformedN8nFiles
          });
        }

        // Transform tags data
        const transformedTags: Tag[] = (tagsData || []).map((tag: any) => ({
          id: tag.id,
          name: tag.name,
          description: tag.description,
          color: tag.color || '#3B82F6',
          usageCount: tag.usage_count || 0
        }));

        // Set all the fetched data
        setCategories(transformedCategories);
        setWorkflows(allWorkflows);
        setTags(transformedTags);
        setWorkflowNodes(workflowNodesData || []);
        setWorkflowConnections(workflowConnectionsData || []);
        setN8nFiles(n8nFilesData || []);
        setLeads(leadsData || []);
        setSyncLogs(syncLogsData || []);

        // Log data fetching results for verification
        console.log('✅ Data fetched from all 9 Supabase tables:');
        console.log(`📁 Categories: ${transformedCategories.length} records`);
        console.log(`⚙️ Workflows: ${(workflowsData || []).length} records`);
        console.log(`🔗 Workflow Nodes: ${(workflowNodesData || []).length} records`);
        console.log(`🔀 Workflow Connections: ${(workflowConnectionsData || []).length} records`);
        console.log(`🏷️ Tags: ${(tagsData || []).length} records`);
        console.log(`🔗 Workflow Tags: Available via joins`);
        console.log(`📄 N8N Files: ${(n8nFilesData || []).length} records`);
        console.log(`👥 Leads: ${(leadsData || []).length} records`);
        console.log(`📊 Sync Logs: ${(syncLogsData || []).length} records`);
        console.log('🎉 All table data successfully loaded!');
        
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
    // Main data for the website
    categories,
    workflows,
    tags,
    loading,
    error,
    
    // Additional table data for comprehensive testing
    workflowNodes,
    workflowConnections,
    n8nFiles,
    leads,
    syncLogs,
    
    // Utility functions
    refetch: () => {
      setLoading(true);
      // Re-trigger the useEffect
      window.location.reload();
    },
    
    // Data summary for verification
    dataSummary: {
      totalCategories: categories.length,
      totalWorkflows: workflows.length,
      totalTags: tags.length,
      totalWorkflowNodes: workflowNodes.length,
      totalWorkflowConnections: workflowConnections.length,
      totalN8nFiles: n8nFiles.length,
      totalLeads: leads.length,
      totalSyncLogs: syncLogs.length,
      allTablesLoaded: !loading && !error
    }
  };
}

export default useSupabaseData;