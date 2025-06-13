const fs = require('fs');
const path = require('path');

/**
 * API endpoint to serve workflow files for download
 * Handles requests for files from different category directories
 */
module.exports = (req, res) => {
  try {
    const { path: filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    // Remove leading slash and construct full file path
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const fullFilePath = path.join(process.cwd(), cleanPath);
    
    // Security check - ensure file is within project directory
    const projectRoot = process.cwd();
    const resolvedPath = path.resolve(fullFilePath);
    
    if (!resolvedPath.startsWith(projectRoot)) {
      return res.status(403).json({ error: 'Access denied' });
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
      return res.send(content);
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
    res.send(fileContent);
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};