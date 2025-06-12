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
 * @param filePath - The path to the file
 * @returns Download URL
 */
export function getDownloadUrl(filePath: string): string {
  // In a real implementation, this would handle file serving
  // For now, we'll create a blob URL or direct file path
  return filePath
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