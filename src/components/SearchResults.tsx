import React from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WorkflowCard } from '@/components/WorkflowCard'
import type { WorkflowFile, Category } from '@/data/agents'

interface SearchResultsProps {
  results: { category: Category; workflow: WorkflowFile }[]
  query: string
  onClearSearch: () => void
}

/**
 * SearchResults component for displaying filtered workflow search results
 * Shows workflows from multiple categories based on search query
 */
export function SearchResults({ results, query, onClearSearch }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onClearSearch}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Categories</span>
            </Button>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No workflows found</h3>
          <p className="text-muted-foreground">
            No workflows match your search for "{query}". Try a different search term.
          </p>
        </div>
      </div>
    )
  }

  // Group results by category for better organization
  const groupedResults = results.reduce((acc, result) => {
    const categoryId = result.category.id
    if (!acc[categoryId]) {
      acc[categoryId] = {
        category: result.category,
        workflows: []
      }
    }
    acc[categoryId].workflows.push(result.workflow)
    return acc
  }, {} as Record<string, { category: Category; workflows: WorkflowFile[] }>)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onClearSearch}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Categories</span>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Search Results</h2>
            <p className="text-muted-foreground">
              Found {results.length} workflow{results.length !== 1 ? 's' : ''} for "{query}"
            </p>
          </div>
        </div>
      </div>

      {/* Results grouped by category */}
      <div className="space-y-8">
        {Object.values(groupedResults).map(({ category, workflows }) => (
          <div key={category.id}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center text-lg border">
                {category.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {workflows.map((workflow) => (
                <WorkflowCard
                  key={`${category.id}-${workflow.filename}`}
                  workflow={workflow}
                  category={category}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}