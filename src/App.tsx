import React, { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { CategoryCard } from '@/components/CategoryCard'
import { CategoryView } from '@/components/CategoryView'
import { SearchResults } from '@/components/SearchResults'
import { LeadModal } from '@/components/LeadModal'
import DataVerification from '@/components/DataVerification'
import useSupabaseData, { type Category, type WorkflowFile } from '@/hooks/useSupabaseData'

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

  // Handle search results
  const handleSearch = (results: { category: Category; workflow: WorkflowFile }[]) => {
    setSearchResults(results)
    if (results.length > 0) {
      setViewMode('search')
    } else {
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
  }

  // Get data from Supabase
  const { categories, workflows, loading, error } = useSupabaseData()
  const totalWorkflows = workflows.length

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        onSearch={handleSearch}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        categories={categories}
        workflows={workflows}
      />
      
      <main>
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
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                N8N Agents Directory
              </h1>
              <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                Discover, explore, and download automation workflows from our comprehensive collection of N8N agents.
              </p>
              <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{categories.length} Categories</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>{totalWorkflows} Workflows</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Free Downloads</span>
                </div>
              </div>
            </div>

            {/* Database Verification */}
            <div className="mb-12">
              <DataVerification />
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={handleCategoryClick}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t text-center text-muted-foreground">
              <p className="mb-2">
                Built with ❤️ by <a href="https://www.linkedin.com/in/tusharaggarwalinseec/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">Tushar Aggarwal</a>
              </p>
              <p className="text-sm">
                Explore automation workflows across {categories.length} categories with {totalWorkflows} ready-to-use templates.
              </p>
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