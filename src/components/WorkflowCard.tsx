import React from 'react'
import { Download, FileText, Code, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatFileName, getDownloadUrl } from '@/lib/utils'
import type { WorkflowFile, Category } from '@/hooks/useSupabaseData'

interface WorkflowCardProps {
  workflow: WorkflowFile
  category: Category
}

/**
 * WorkflowCard component for displaying individual workflow files
 * Shows workflow name, type, and provides download functionality
 */
export function WorkflowCard({ workflow, category }: WorkflowCardProps) {
  const handleDownload = () => {
    const downloadUrl = getDownloadUrl(category.id, workflow.path)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = workflow.path
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleView = () => {
    // This would open a modal or navigate to a detailed view
    // For now, we'll just show an alert
    alert(`View details for: ${workflow.name}`)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'json':
        return <Code className="w-4 h-4" />
      case 'txt':
        return <FileText className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getFileTypeVariant = (type: string) => {
    switch (type) {
      case 'json':
        return 'info' as const
      case 'txt':
        return 'secondary' as const
      default:
        return 'outline' as const
    }
  }

  return (
    <Card className="group hover:shadow-md transition-all duration-200 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base leading-tight mb-2">
              {formatFileName(workflow.name)}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={getFileTypeVariant(workflow.type)} className="text-xs">
                {getFileIcon(workflow.type)}
                <span className="ml-1 uppercase">{workflow.type}</span>
              </Badge>
              <span className="text-xs text-muted-foreground">
                {workflow.path}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {workflow.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {workflow.description}
          </p>
        )}
        
        <div className="flex space-x-2">
          <Button 
            onClick={handleDownload}
            size="sm"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          
          <Button 
            onClick={handleView}
            variant="outline"
            size="sm"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}