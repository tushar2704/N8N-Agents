import React, { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { CategoryCard } from '@/components/CategoryCard'
import { WorkflowCardNew } from '@/components/WorkflowCardNew'
import { CategoryView } from '@/components/CategoryView'
import { SearchResults } from '@/components/SearchResults'
import { LeadModal } from '@/components/LeadModal'
import DataVerification from '@/components/DataVerification'
import useSupabaseData, { type Category, type WorkflowFile } from '@/hooks/useSupabaseData'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type ViewMode = 'categories' | 'category' | 'search'

/**
 * Main App component for the N8N Agents Directory
 * Manages application state, theme, and navigation between views
 */
function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('categories')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [searchResults, setSearchResults] = useState<{ category: Category; workflow: WorkflowFile }[]>([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [hasSubmittedLead, setHasSubmittedLead] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark)
    setIsDarkMode(shouldUseDark)
    
    // Apply theme to document
    if (shouldUseDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Handle theme toggle
  const handleToggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Show lead modal on every visit
  useEffect(() => {
    // Always show the modal when the page loads
    setShowLeadModal(true)
  }, [])

  // Handle lead form submission
  const handleLeadSubmit = () => {
    // Store submission data but don't prevent modal from showing again
    localStorage.setItem('leadSubmitted', 'true')
    setHasSubmittedLead(true)
    setShowLeadModal(false)
  }

  // Handle search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      const results: { category: Category; workflow: WorkflowFile }[] = []
      
      categories.forEach(category => {
        category.workflows.forEach(workflow => {
          if (
            workflow.name.toLowerCase().includes(searchTerm) ||
            workflow.description?.toLowerCase().includes(searchTerm) ||
            category.name.toLowerCase().includes(searchTerm) ||
            workflow.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
          ) {
            results.push({ category, workflow })
          }
        })
      })
      
      setSearchResults(results)
      if (results.length > 0) {
        setViewMode('search')
      } else {
        setViewMode('categories')
      }
    } else {
      setSearchResults([])
      setViewMode('categories')
    }
  }

  // Handle category selection
  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category)
    setViewMode('category')
  }

  // Handle navigation back to categories
  const handleBackToCategories = () => {
    setViewMode('categories')
    setSelectedCategory(null)
    setSearchResults([])
    setSearchQuery('')
  }

  // Get data from Supabase
  const { categories, workflows, loading, error } = useSupabaseData()
  const totalWorkflows = workflows.length

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background */}
      {viewMode === 'categories' && (
        <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 relative">
          <Header 
            onSearch={() => {}}
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
            categories={categories}
            workflows={workflows}
          />
          
          <section className="py-20 px-4">
            <div className="container mx-auto max-w-4xl text-center">
              <div className="mb-8">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  ✨ Free AI Agents & Automations
                </h1>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  Get started building AI agents and automations to streamline your workflows!
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto mb-12">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search Automations"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-white/60 rounded-xl focus:bg-white/20 focus:border-white/40"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
      
      {/* Other views without hero section */}
      {viewMode !== 'categories' && (
        <div className="bg-background">
          <Header 
            onSearch={() => {}}
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
            categories={categories}
            workflows={workflows}
          />
        </div>
      )}
      
      <main className={viewMode === 'categories' ? 'bg-gray-50' : 'bg-background'}>
        {loading && (
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading workflows from database...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="text-center text-red-600">
              <p className="mb-4">Error loading data: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {!loading && !error && viewMode === 'categories' && (
          <div className="px-4 py-8">
            <div className="container mx-auto max-w-7xl">
              {/* Platform Filter */}
              <div className="mb-8">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <span>🌐 Platform</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                    All Platforms
                  </Button>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <span>📁 Categories</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.slice(0, 10).map((category) => (
                    <Button 
                      key={category.id}
                      variant="outline" 
                      className="text-gray-700 border-gray-300"
                      onClick={() => handleCategoryClick(category)}
                    >
                      {category.icon} {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Results Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  All Automations <span className="text-gray-500">({totalWorkflows} results)</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {workflows.map((workflow) => (
                  <WorkflowCardNew
                    key={workflow.id}
                    workflow={workflow}
                  />
                ))}
              </div>

              {/* Database Verification - Hidden */}
              <div className="hidden">
                <DataVerification />
              </div>
            </div>
          </div>
        )}

        {!loading && !error && viewMode === 'category' && selectedCategory && (
          <CategoryView
            category={selectedCategory}
            onBack={handleBackToCategories}
          />
        )}

        {!loading && !error && viewMode === 'search' && (
          <SearchResults
            results={searchResults}
            query="" // We could track the actual query if needed
            onClearSearch={handleBackToCategories}
          />
        )}
      </main>
      
      {/* Lead Generation Modal */}
      <LeadModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onSubmit={handleLeadSubmit}
      />
    </div>
  )
}

export default App