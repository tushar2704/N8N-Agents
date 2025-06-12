import React from 'react'
import { ChevronRight, Folder } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Category } from '@/data/agents'

interface CategoryCardProps {
  category: Category
  onClick: (category: Category) => void
}

/**
 * CategoryCard component for displaying workflow categories
 * Shows category icon, name, description, and workflow count
 */
export function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center text-2xl border">
              {category.icon}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {category.name}
              </CardTitle>
              <Badge variant="secondary" className="mt-1">
                <Folder className="w-3 h-3 mr-1" />
                {category.count} workflows
              </Badge>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {category.description}
        </p>
        
        <Button 
          onClick={() => onClick(category)}
          variant="outline" 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
        >
          Explore Workflows
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}