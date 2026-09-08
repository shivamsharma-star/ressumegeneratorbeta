import fs from 'fs';
import PizZip from 'pizzip';

/**
 * Parses template variables WITHOUT modifying the DOCX
 * Reads directly from the raw file
 */
export function parseTemplateVariables(filePath) {
  const content = fs.readFileSync(filePath);
  const zip = new PizZip(content);
  
  // Get ALL text from ALL XML files
  const xmlFiles = zip.file(/\.xml$/);
  const allTexts = [];
  
  for (const file of xmlFiles) {
    const fileName = file.name;
    // Only process Word XML files
    if (!fileName.startsWith('word/') && !fileName.startsWith('customXml/')) continue;
    
    const xml = file.asText();
    // Extract text from all w:t tags
    const wtRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
    let match;
    while ((match = wtRegex.exec(xml)) !== null) {
      let text = match[1];
      // Decode XML entities
      text = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
      allTexts.push(text);
    }
  }
  
  // Join all text and find variables
  const fullText = allTexts.join('');
  
  // Find text variables: {{name}}
  const textRegex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  const imageRegex = /\{%\s*([a-zA-Z0-9_]+)\s*\}/g;
  
  const variables = new Map();
  let match;
  
  while ((match = textRegex.exec(fullText)) !== null) {
    const name = match[1];
    if (!variables.has(name)) {
      variables.set(name, { name, type: 'text' });
    }
  }
  
  while ((match = imageRegex.exec(fullText)) !== null) {
    const name = match[1];
    variables.set(name, { name, type: 'image' });
  }
  
  return Array.from(variables.values());
}