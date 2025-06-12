import React, { useState } from 'react'
import { Search, Moon, Sun, Github, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { WorkflowFile, Category } from '@/hooks/useSupabaseData'

interface HeaderProps {
  onSearch: (results: { category: Category; workflow: WorkflowFile }[]) => void
  isDarkMode: boolean
  onToggleTheme: () => void
  categories: Category[]
  workflows: WorkflowFile[]
}

/**
 * Header component with navigation, search, and theme toggle
 * Provides the main navigation and search functionality for the N8N Agents Directory
 */
export function Header({ onSearch, isDarkMode, onToggleTheme, categories, workflows }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

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
      
      onSearch(results)
    } else {
      onSearch([])
    }
  }

  const handleDownloadAll = () => {
    // This would trigger a download of all workflows as a ZIP file
    // For now, we'll just show an alert
    alert('Download all workflows functionality would be implemented here')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N8</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                N8N Agents Directory
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Discover and download automation workflows
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Download All Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadAll}
            className="hidden sm:flex"
          >
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>

          {/* GitHub Link */}
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <a
              href="https://github.com/tushar2704/N8N-Agents"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View N8N Agents Repository on GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}