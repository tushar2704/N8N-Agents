import React from 'react'
import { Download, ExternalLink, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { WorkflowFile } from '@/hooks/useSupabaseData'

interface WorkflowCardNewProps {
  workflow: WorkflowFile
  onDownload?: (workflow: WorkflowFile) => void
}

/**
 * WorkflowCardNew component for displaying individual workflow cards
 * Shows workflow title, description, tags/labels, and action buttons
 */
export function WorkflowCardNew({ workflow, onDownload }: WorkflowCardNewProps) {
  const handleDownload = () => {
    console.log('Download button clicked!')
    console.log('Workflow:', workflow)
    console.log('jsonContent raw:', workflow.jsonContent)
    console.log('jsonContent type:', typeof workflow.jsonContent)
    console.log('jsonContent is null:', workflow.jsonContent === null)
    console.log('jsonContent is undefined:', workflow.jsonContent === undefined)
    console.log('Has jsonContent:', !!workflow.jsonContent)
    console.log('onDownload prop:', !!onDownload)
    
    if (onDownload) {
      onDownload(workflow)
    } else {
      try {
        // Download JSON content from n8n_file table's json column
        const element = document.createElement('a')
        
        // Check if jsonContent exists and is not null/undefined
        let fileData: string
        if (workflow.jsonContent && workflow.jsonContent !== null && workflow.jsonContent !== undefined) {
          // If jsonContent is already a string, use it directly; if it's an object, stringify it
          fileData = typeof workflow.jsonContent === 'string' ? workflow.jsonContent : JSON.stringify(workflow.jsonContent, null, 2)
          console.log('Using jsonContent from database')
        } else {
          // Fallback to workflow object
          fileData = JSON.stringify(workflow, null, 2)
          console.log('Using fallback workflow object - jsonContent was null/undefined')
        }
        
        console.log('File data length:', fileData.length)
        console.log('File data preview (first 200 chars):', fileData.substring(0, 200))
        
        const file = new Blob([fileData], { type: 'application/json' })
        element.href = URL.createObjectURL(file)
        element.download = `${workflow.name.replace(/\s+/g, '_')}.json`
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
        console.log('Download triggered successfully')
      } catch (error) {
        console.error('Download error:', error)
      }
    }
  }

  return (
    <Card className="group hover:shadow-md transition-all duration-200 bg-white border border-gray-200 hover:border-gray-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
          {workflow.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
          {workflow.description || 'No description available for this workflow.'}
        </p>
        
        {/* Tags/Labels */}
        <div className="flex flex-wrap gap-2">
          {workflow.tags?.slice(0, 3).map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200"
            >
              {tag}
            </Badge>
          )) || (
            <Badge 
              variant="secondary" 
              className="text-xs px-2 py-1 bg-purple-50 text-purple-700 border-purple-200"
            >
              Workflow
            </Badge>
          )}
          
          {/* Additional tags indicators */}
          {workflow.category && (
            <Badge 
              variant="outline" 
              className="text-xs px-2 py-1 bg-gray-50 text-gray-600 border-gray-200"
            >
              {workflow.category}
            </Badge>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={handleDownload}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-xs font-medium"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
            
            {workflow.url && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(workflow.url, '_blank')}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1 text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View
              </Button>
            )}
          </div>
          
          {/* Optional rating or popularity indicator */}
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Star className="w-3 h-3" />
            <span>{workflow.rating || '4.5'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}