// N8N Agents Directory Data Structure
// This file contains the structured data representing all available N8N workflows

export interface WorkflowFile {
  name: string
  filename: string
  type: 'json' | 'txt'
  description?: string
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  workflows: WorkflowFile[]
  count: number
}

/**
 * Complete N8N Agents Directory Data
 * Generated from the actual directory structure
 */
export const categories: Category[] = [
  {
    id: 'ai-ml',
    name: 'AI_ML',
    description: 'Intelligent automation workflows powered by AI and ML technologies',
    icon: '🤖',
    count: 10,
    workflows: []
  },
  {
    id: 'ai-research-rag-data-analysis',
    name: 'AI_Research_RAG_and_Data_Analysis',
    description: 'Advanced AI research workflows with RAG, vector databases, and data analysis',
    icon: '🔬',
    count: 35,
    workflows: []
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'Smart farming and agricultural automation workflows',
    icon: '🌾',
    count: 10,
    workflows: []
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Airtable integration and database automation workflows',
    icon: '📊',
    count: 5,
    workflows: []
  },
  {
    id: 'automotive',
    name: 'Automotive',
    description: 'Connected car and automotive industry automation workflows',
    icon: '🚗',
    count: 10,
    workflows: []
  },
  {
    id: 'creative-content',
    name: 'Creative_Content',
    description: 'Content creation and creative automation workflows',
    icon: '🎨',
    count: 2,
    workflows: []
  },
  {
    id: 'data-analytics',
    name: 'Data_Analytics',
    description: 'Data analysis and business intelligence automation workflows',
    icon: '📈',
    count: 2,
    workflows: []
  },
  {
    id: 'database-and-storage',
    name: 'Database_and_Storage',
    description: 'Database management and data storage automation workflows',
    icon: '🗄️',
    count: 5,
    workflows: []
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'Development operations and CI/CD automation workflows',
    icon: '⚙️',
    count: 2,
    workflows: []
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Discord bot and community management automation workflows',
    icon: '💬',
    count: 3,
    workflows: []
  },
  {
    id: 'e-commerce-retail',
    name: 'E_Commerce_Retail',
    description: 'Online retail and e-commerce automation workflows',
    icon: '🛒',
    count: 4,
    workflows: []
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Educational technology and learning automation workflows',
    icon: '🎓',
    count: 3,
    workflows: []
  },
  {
    id: 'email-automation',
    name: 'Email_Automation',
    description: 'Email processing and automation workflows',
    icon: '📧',
    count: 11,
    workflows: []
  },
  {
    id: 'energy',
    name: 'Energy',
    description: 'Energy management and renewable energy automation workflows',
    icon: '⚡',
    count: 10,
    workflows: []
  },
  {
    id: 'finance-accounting',
    name: 'Finance_Accounting',
    description: 'Financial automation and accounting workflows',
    icon: '💰',
    count: 8,
    workflows: []
  },
  {
    id: 'forms-and-surveys',
    name: 'Forms_and_Surveys',
    description: 'Form processing and survey automation workflows',
    icon: '📝',
     count: 4,
     workflows: []
   },
   {
     id: 'gaming',
     name: 'Gaming',
     description: 'Gaming industry automation workflows',
     icon: '🎮',
     count: 10,
     workflows: []
   },
   {
     id: 'gmail-email',
     name: 'Gmail_Email',
     description: 'Gmail and advanced email automation workflows',
     icon: '📧',
     count: 20,
     workflows: []
   },
   {
     id: 'google-drive-sheets',
     name: 'Google_Drive_Sheets',
     description: 'Google Drive and Google Sheets integration workflows',
     icon: '📁',
     count: 15,
     workflows: []
   },
   {
     id: 'hr',
     name: 'HR',
     description: 'Human resources automation workflows',
     icon: '👥',
     count: 8,
     workflows: []
   },
   {
     id: 'healthcare',
     name: 'Healthcare',
     description: 'Healthcare and medical automation workflows',
     icon: '🏥',
     count: 10,
     workflows: []
   },
   {
     id: 'instagram-twitter-social',
     name: 'Instagram_Twitter_Social',
     description: 'Instagram, Twitter and social media automation workflows',
     icon: '📱',
     count: 15,
     workflows: []
   },
   {
     id: 'manufacturing',
     name: 'Manufacturing',
     description: 'Manufacturing industry automation workflows',
     icon: '🏭',
     count: 12,
     workflows: []
   },
   {
     id: 'misc',
     name: 'Misc',
     description: 'Miscellaneous automation workflows and utilities',
     icon: '🔧',
     count: 5,
     workflows: []
   },
   {
     id: 'notion',
     name: 'Notion',
     description: 'Notion integration and workspace automation workflows',
     icon: '📝',
     count: 8,
     workflows: []
   },
   {
     id: 'openai-llms',
     name: 'OpenAI_LLMs',
     description: 'OpenAI and Large Language Model integration workflows',
     icon: '🧠',
     count: 25,
     workflows: []
   },
   {
     id: 'other-integrations',
     name: 'Other_Integrations_and_Use_Cases',
     description: 'Various integration patterns and use cases',
     icon: '🔗',
     count: 12,
     workflows: []
   },
   {
     id: 'pdf-document',
     name: 'PDF_Document_Processing',
     description: 'PDF and document processing automation workflows',
     icon: '📄',
     count: 8,
     workflows: []
   },
   {
     id: 'productivity',
     name: 'Productivity',
     description: 'Personal and business productivity automation workflows',
     icon: '⚡',
     count: 15,
     workflows: []
   },
   {
     id: 'slack',
     name: 'Slack',
     description: 'Slack integration and team communication workflows',
     icon: '💬',
     count: 12,
     workflows: []
   },
   {
     id: 'social-media',
     name: 'Social_Media',
     description: 'Social media management and automation workflows',
     icon: '📱',
     count: 10,
     workflows: []
   },
   {
     id: 'telegram',
     name: 'Telegram',
     description: 'Telegram bot and messaging automation workflows',
     icon: '✈️',
     count: 8,
     workflows: []
   },
   {
     id: 'whatsapp',
     name: 'WhatsApp',
     description: 'WhatsApp automation and messaging workflows',
     icon: '💬',
     count: 7,
     workflows: []
   }
 ] 

 /**
 * Get all categories with their workflow counts
 */
export function getAllCategories(): Category[] {
  return categories
}

/**
 * Get a specific category by ID
 */
export function getCategoryById(id: string): Category | undefined {
  return categories.find(category => category.id === id)
}

/**
 * Get total number of workflows across all categories
 */
export function getTotalWorkflowCount(): number {
  return categories.reduce((total, category) => total + category.count, 0)
}

/**
 * Search workflows across all categories
 */
export function searchWorkflows(query: string): { category: Category; workflow: WorkflowFile }[] {
  const results: { category: Category; workflow: WorkflowFile }[] = []
  const lowercaseQuery = query.toLowerCase()
  
  categories.forEach(category => {
    category.workflows.forEach(workflow => {
      if (workflow.name.toLowerCase().includes(lowercaseQuery) ||
          workflow.filename.toLowerCase().includes(lowercaseQuery)) {
        results.push({ category, workflow })
      }
    })
  })
  
  return results
}