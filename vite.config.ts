import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
    // Custom middleware to handle workflow file downloads
    middlewares: [
      {
        name: 'workflow-download',
        configureServer(server) {
          server.middlewares.use('/api/download', (req, res, next) => {
            try {
              const url = new URL(req.url || '', `http://${req.headers.host}`);
              const filePath = url.searchParams.get('path');
              
              if (!filePath) {
                res.statusCode = 400;
                res.end('File path is required');
                return;
              }
              
              // Remove leading slash and construct full file path
              const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
              const fullFilePath = path.join(process.cwd(), cleanPath);
              
              // Security check - ensure file is within project directory
              const projectRoot = process.cwd();
              const resolvedPath = path.resolve(fullFilePath);
              
              if (!resolvedPath.startsWith(projectRoot)) {
                res.statusCode = 403;
                res.end('Access denied');
                return;
              }
              
              // Check if file exists
              if (!fs.existsSync(resolvedPath)) {
                // If file doesn't exist, create a placeholder file
                const fileName = path.basename(cleanPath);
                const fileExtension = path.extname(fileName).slice(1);
                
                let content = '';
                let contentType = 'text/plain';
                
                if (fileExtension === 'json') {
                  // Create a basic n8n workflow JSON structure
                  content = JSON.stringify({
                    "name": fileName.replace(/\.(json|txt)$/, ''),
                    "nodes": [],
                    "connections": {},
                    "active": false,
                    "settings": {},
                    "id": Math.random().toString(36).substr(2, 9)
                  }, null, 2);
                  contentType = 'application/json';
                } else {
                  // Create a basic text file content
                  content = `# ${fileName.replace(/\.(json|txt)$/, '').replace(/[_-]/g, ' ')}\n\nThis is a placeholder workflow file. Please customize it according to your needs.\n\nCreated: ${new Date().toISOString()}`;
                }
                
                res.setHeader('Content-Type', contentType);
                res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                res.end(content);
                return;
              }
              
              // Read and serve the actual file
              const fileContent = fs.readFileSync(resolvedPath);
              const fileName = path.basename(resolvedPath);
              const fileExtension = path.extname(fileName).slice(1);
              
              // Set appropriate content type
              let contentType = 'application/octet-stream';
              if (fileExtension === 'json') {
                contentType = 'application/json';
              } else if (fileExtension === 'txt') {
                contentType = 'text/plain';
              }
              
              res.setHeader('Content-Type', contentType);
              res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
              res.end(fileContent);
              
            } catch (error) {
              console.error('Download error:', error);
              res.statusCode = 500;
              res.end('Internal server error');
            }
          });
        }
      }
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})