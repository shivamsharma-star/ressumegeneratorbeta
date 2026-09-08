import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import ImageModule from 'docxtemplater-image-module-free';
import { getTemplateFilePath } from './templateStore';
import { parseTemplateVariables } from './templateParser';
import { convertDocxBufferToPdf } from './docxToPdf';
import { transparentPngBuffer } from './fallbackImage';

/**
 * Fetches an image from a URL (or accepts a data: URI) and returns a Buffer.
 * Used for {%photo}-style tags where the form gives us a link, not a file.
 */
async function fetchImageBuffer(source) {
  if (!source) return null;
  if (source.startsWith('data:')) {
    const base64 = source.split(',')[1] || '';
    return Buffer.from(base64, 'base64');
  }
  const res = await fetch(source);
  if (!res.ok) throw new Error(`Could not download image from ${source} (status ${res.status})`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Injects `data` into the selected template's existing .docx file (no new
 * document is ever created — same file, tags swapped for values) and returns
 * the result as a Buffer. Image tags ({%tagName}) pull their value from
 * data[tagName], which is expected to be an image URL (or data: URI).
 *
 * @param {string} templateId
 * @param {Record<string, string>} data
 * @returns {Promise<Buffer>}
 */
export async function generateDocxBuffer(templateId, data) {
  const filePath = getTemplateFilePath(templateId);
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('Template not found');
  }

  const variables = parseTemplateVariables(filePath);
  const imageVarNames = variables.filter((v) => v.type === 'image').map((v) => v.name);

  // docxtemplater-image-module-free's getImage() must be synchronous, so we
  // fetch every photo URL up front and hand it a pre-built lookup table.
  const imageBuffers = {};
  for (const tagName of imageVarNames) {
    try {
      const buf = await fetchImageBuffer(data[tagName]);
      if (buf) imageBuffers[tagName] = buf;
    } catch (err) {
      console.warn(`Image fetch failed for "${tagName}":`, err.message);
    }
  }

  const content = fs.readFileSync(filePath, 'binary');
  const zip = new PizZip(content);

  const imageModule = new ImageModule({
    centered: false,
    getImage: (_tagValue, tagName) => imageBuffers[tagName] || transparentPngBuffer(),
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
    doc.render(data);
  } catch (error) {
    const details =
      error?.properties?.errors
        ?.map((e) => e?.properties?.explanation)
        .filter(Boolean)
        .join('; ') || error.message;
    throw new Error(`Failed to fill template: ${details}`);
  }

  return doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
}

/**
 * Generates the filled .docx and converts that exact file to PDF.
 * @param {string} templateId
 * @param {Record<string, string>} data
 * @returns {Promise<Buffer>}
 */
export async function generatePdfBuffer(templateId, data) {
  const docxBuffer = await generateDocxBuffer(templateId, data);
  return convertDocxBufferToPdf(docxBuffer);
}
