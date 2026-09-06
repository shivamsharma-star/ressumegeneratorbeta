import fs from 'fs';
import PizZip from 'pizzip';

/**
 * @typedef {Object} TemplateVariable
 * @property {string} name
 * @property {'text' | 'image'} type
 */

/**
 * @param {string} filePath - path to a .docx file already sanitized by sanitizeTemplate.js
 * @returns {TemplateVariable[]}
 */
export function parseTemplateVariables(filePath) {
  const content = fs.readFileSync(filePath);
  const zip = new PizZip(content);
  const xmlFile = zip.file('word/document.xml');
  if (!xmlFile) {
    throw new Error('Not a valid .docx file (word/document.xml missing)');
  }
  const xml = xmlFile.asText();

  const texts = [];
  const wtRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
  let m;
  while ((m = wtRegex.exec(xml)) !== null) {
    texts.push(decodeXmlEntities(m[1]));
  }
  const fullText = texts.join('');

  /** @type {Map<string, TemplateVariable>} */
  const variables = new Map();

  const textVarRegex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  let vm;
  while ((vm = textVarRegex.exec(fullText)) !== null) {
    if (!variables.has(vm[1])) variables.set(vm[1], { name: vm[1], type: 'text' });
  }

  // Image tags use docxtemplater-image-module syntax: {%tagName}
  const imageVarRegex = /\{%\s*([a-zA-Z0-9_]+)\s*\}/g;
  while ((vm = imageVarRegex.exec(fullText)) !== null) {
    variables.set(vm[1], { name: vm[1], type: 'image' }); // image wins if name collides
  }

  return Array.from(variables.values());
}

function decodeXmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
