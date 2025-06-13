import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and merges Tailwind CSS classes
 * to avoid conflicts and duplicate styles
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a filename by removing file extension and converting to title case
 * @param filename - The filename to format
 * @returns Formatted title string
 */
export function formatFileName(filename: string): string {
  return filename
    .replace(/\.(json|txt)$/, '') // Remove file extensions
    .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
    .replace(/\b\w/g, l => l.toUpperCase()) // Convert to title case
}

/**
 * Formats a folder name by replacing underscores/hyphens with spaces and title casing
 * @param folderName - The folder name to format
 * @returns Formatted title string
 */
export function formatFolderName(folderName: string): string {
  return folderName
    .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
    .replace(/\b\w/g, l => l.toUpperCase()) // Convert to title case
}

/**
 * Generates a download URL for a file
 * @param categoryId - The category/folder name
 * @param filePath - The path to the file
 * @returns Download URL
 */
export function getDownloadUrl(categoryId: string, filePath: string): string {
  // Construct the full path to the file in the repository
  const fullPath = `/${categoryId}/${filePath}`
  
  // For GitHub-hosted files, we can use raw.githubusercontent.com
  // For local development, we'll use the relative path
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // For local development, serve from the public directory or API
    return `/api/download?path=${encodeURIComponent(fullPath)}`
  } else {
    // For production, you might want to serve from a CDN or file server
    // For now, we'll create a downloadable blob with placeholder content
    return createDownloadableFile(filePath)
  }
}

/**
 * Creates a downloadable file with placeholder content
 * @param fileName - The name of the file
 * @returns Blob URL for download
 */
function createDownloadableFile(fileName: string): string {
  const fileExtension = getFileExtension(fileName)
  let content = ''
  
  if (fileExtension === 'json') {
    // Create a basic n8n workflow JSON structure
    content = JSON.stringify({
      "name": fileName.replace(/\.(json|txt)$/, ''),
      "nodes": [],
      "connections": {},
      "active": false,
      "settings": {},
      "id": Math.random().toString(36).substr(2, 9)
    }, null, 2)
  } else {
    // Create a basic text file content
    content = `# ${fileName.replace(/\.(json|txt)$/, '').replace(/[_-]/g, ' ')}

This is a placeholder workflow file. Please customize it according to your needs.

Created: ${new Date().toISOString()}`
  }
  
  const blob = new Blob([content], { 
    type: fileExtension === 'json' ? 'application/json' : 'text/plain' 
  })
  
  return URL.createObjectURL(blob)
}

/**
 * Extracts file extension from filename
 * @param filename - The filename
 * @returns File extension without the dot
 */
export function getFileExtension(filename: string): string {
  const match = filename.match(/\.([^.]+)$/)
  return match ? match[1] : ''
}