import React, { useState } from 'react'
import { ArrowLeft, Filter, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { WorkflowCard } from '@/components/WorkflowCard'
import type { Category, WorkflowFile } from '@/data/agents'

interface CategoryViewProps {
  category: Category
  onBack: () => void
}

/**
 * CategoryView component for displaying all workflows in a specific category
 * Provides filtering and different view modes for workflows
 */
export function CategoryView({ category, onBack }: CategoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filter workflows based on search term
  const filteredWorkflows = category.workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.filename.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group workflows by type
  const workflowsByType = filteredWorkflows.reduce((acc, workflow) => {
    if (!acc[workflow.type]) {
      acc[workflow.type] = []
    }
    acc[workflow.type].push(workflow)
    return acc
  }, {} as Record<string, WorkflowFile[]>)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Categories</span>
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center text-xl border">
              {category.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{category.name}</h2>
              <p className="text-muted-foreground">{category.description}</p>
            </div>
          </div>
        </div>
        
        <Badge variant="secondary" className="hidden sm:flex">
          {filteredWorkflows.length} workflow{filteredWorkflows.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Filter workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* File Type Summary */}
      {Object.keys(workflowsByType).length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(workflowsByType).map(([type, workflows]) => (
            <Badge key={type} variant="outline" className="text-xs">
              {type.toUpperCase()}: {workflows.length}
            </Badge>
          ))}
        </div>
      )}

      {/* Results */}
      {filteredWorkflows.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Filter className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No workflows found</h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? `No workflows match "${searchTerm}" in this category.`
              : 'This category appears to be empty.'
            }
          </p>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1 max-w-4xl'
        }`}>
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.filename}
              workflow={workflow}
              category={category}
            />
          ))}
        </div>
      )}
    </div>
  )
}