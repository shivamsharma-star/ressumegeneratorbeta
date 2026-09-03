import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import libre from 'libreoffice-convert';

const libreConvert = promisify(libre.convert);

const TEMPLATE_PATH = path.join(process.cwd(), 'template', 'ressumetemp.docx');

/**
 * Reads the college-provided template once. We never build a document from
 * scratch — we only ever open THIS file and swap {{placeholders}} for values.
 */
function readTemplateZip() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(
      `Template not found at ${TEMPLATE_PATH}. Put your .docx template at template/ressumetemp.docx`
    );
  }
  const content = fs.readFileSync(TEMPLATE_PATH, 'binary');
  return new PizZip(content);
}

/**
 * Injects `data` into template/ressumetemp.docx and returns the resulting
 * .docx file as a Buffer. No new document is created — the original template
 * structure/formatting is preserved, only the {{tags}} are replaced.
 *
 * @param {Record<string, string>} data - flat key/value map matching the
 *   {{placeholders}} in the template (see lib/types.js -> flattenForTemplate)
 * @returns {Buffer}
 */
export function generateDocxBuffer(data) {
  const zip = readTemplateZip();

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
    // Any tag missing from `data` is rendered as an empty string instead of
    // throwing, so a partially filled form still produces a valid document.
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
 * Generates the filled .docx (via generateDocxBuffer) and then converts that
 * exact file to PDF using LibreOffice headless. This is a format conversion
 * of the already-injected document — not a separately built PDF.
 *
 * Requires LibreOffice ("soffice") to be installed on the machine running
 * this code. On Ubuntu/Debian: `sudo apt-get install libreoffice`.
 * On Docker, use a base image that includes LibreOffice, or an image such as
 * `libreoffice` alongside your Next.js app.
 *
 * @param {Record<string, string>} data
 * @returns {Promise<Buffer>}
 */
export async function generatePdfBuffer(data) {
  const docxBuffer = generateDocxBuffer(data);
  try {
    const pdfBuffer = await libreConvert(docxBuffer, '.pdf', undefined);
    return pdfBuffer;
  } catch (error) {
    throw new Error(
      `DOCX -> PDF conversion failed. Make sure LibreOffice ("soffice") is installed and on PATH. Original error: ${error.message}`
    );
  }
}
