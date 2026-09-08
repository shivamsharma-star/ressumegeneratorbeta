import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import ImageModule from 'docxtemplater-image-module-free';
import { getTemplateFilePath } from './templateStore';
import { parseTemplateVariables } from './templateParser';
import { convertDocxBufferToPdf } from './docxToPdf';
import { transparentPngBuffer } from './fallbackImage';
import { sanitizeAllDocxXml } from './sanitizeTemplate';

async function fetchImageBuffer(source) {
  if (!source) return null;
  if (source.startsWith('data:')) {
    const base64 = source.split(',')[1] || '';
    return Buffer.from(base64, 'base64');
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(source, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.warn(`⚠️ Image fetch failed:`, err.message);
    return null;
  }
}

export async function generateDocxBuffer(templateId, data) {
  const filePath = getTemplateFilePath(templateId);
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('Template not found');
  }

  console.log(`📄 Generating from: ${filePath}`);
  
  // Read and sanitize the template on-the-fly
  const rawBuffer = fs.readFileSync(filePath);
  console.log('🔄 Sanitizing template...');
  const sanitizedBuffer = sanitizeAllDocxXml(rawBuffer);
  console.log('✅ Sanitization complete');

  const variables = parseTemplateVariables(filePath);
  const imageVarNames = variables.filter(v => v.type === 'image').map(v => v.name);
  console.log(`📝 Found ${variables.length} variables`);

  // Fetch images
  const imageBuffers = {};
  for (const tagName of imageVarNames) {
    const buf = await fetchImageBuffer(data[tagName]);
    if (buf) {
      imageBuffers[tagName] = buf;
    }
  }

  const zip = new PizZip(sanitizedBuffer);

  const imageModule = new ImageModule({
    centered: false,
    getImage: (_tagValue, tagName) => {
      return imageBuffers[tagName] || transparentPngBuffer();
    },
    getSize: () => [140, 160],
  });

  const doc = new Docxtemplater(zip, {
    modules: [imageModule],
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
    nullGetter: () => '',
  });

  try {
    console.log('🔄 Rendering...');
    doc.render(data);
    console.log('✅ Rendered successfully');
  } catch (error) {
    console.error('❌ Render error:', error);
    let details = error.message;
    if (error.properties?.errors) {
      details = error.properties.errors
        .map(e => e.properties?.explanation || e.message)
        .filter(Boolean)
        .join('; ');
    }
    throw new Error(`Failed to render: ${details}`);
  }

  return doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
}

export async function generatePdfBuffer(templateId, data) {
  const docxBuffer = await generateDocxBuffer(templateId, data);
  return convertDocxBufferToPdf(docxBuffer);
}