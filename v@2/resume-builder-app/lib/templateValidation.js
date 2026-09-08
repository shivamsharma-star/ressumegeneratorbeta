import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import ImageModule from 'docxtemplater-image-module-free';

function decodeXmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function extractPlainText(xml) {
  const texts = [];
  const wtRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
  let m;
  while ((m = wtRegex.exec(xml)) !== null) texts.push(decodeXmlEntities(m[1]));
  return texts.join('');
}

/**
 * Heuristic check: after removing every well-formed {{tag}} / {%tag}, any
 * leftover "{" or "}" is almost certainly a typo (missing brace, extra
 * brace, or a curly-brace character used as normal text). Returns each
 * occurrence with surrounding context so the admin can find it in the file.
 */
export function findStrayBraces(xml) {
  const fullText = extractPlainText(xml);
  const cleanPattern = /\{\{\s*[a-zA-Z0-9_]+\s*\}\}|\{%\s*[a-zA-Z0-9_]+\s*\}/g;
  const stripped = fullText.replace(cleanPattern, '\u0000\u0000\u0000');

  const issues = [];
  const strayRegex = /[{}]/g;
  let m;
  while ((m = strayRegex.exec(stripped)) !== null) {
    const start = Math.max(0, m.index - 35);
    const end = Math.min(stripped.length, m.index + 35);
    issues.push({
      char: m[0],
      context: stripped.slice(start, end).replace(/\u0000/g, ''),
    });
  }
  return issues;
}

/**
 * Actually constructs a Docxtemplater instance (this alone triggers its XML
 * parsing/validation, without rendering) so we catch the same "malformed
 * xml" error at upload time instead of only when a user tries to generate.
 */
export function validateDocxCompiles(buffer) {
  try {
    const zip = new PizZip(buffer);
    const imageModule = new ImageModule({
      centered: false,
      getImage: () => Buffer.alloc(0),
      getSize: () => [1, 1],
    });
    // eslint-disable-next-line no-new
    new Docxtemplater(zip, {
      modules: [imageModule],
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{{', end: '}}' },
    });
    return { ok: true };
  } catch (error) {
    const details = error?.properties?.explanation || error.message || 'Unknown compile error';
    return { ok: false, message: details };
  }
}

/**
 * Full validation used right before a template is saved. Throws a
 * descriptive Error (safe to surface to the admin UI) if the template
 * can't be safely used.
 */
export function assertTemplateIsValid(buffer) {
  const zip = new PizZip(buffer);
  const xmlFile = zip.file('word/document.xml');
  if (!xmlFile) {
    throw new Error('Not a valid .docx file (word/document.xml missing).');
  }

  const compileCheck = validateDocxCompiles(buffer);
  if (compileCheck.ok) return; // all good

  const strayBraces = findStrayBraces(xmlFile.asText());
  let message = `This template could not be processed (${compileCheck.message}).`;

  if (strayBraces.length > 0) {
    const preview = strayBraces
      .slice(0, 3)
      .map((i) => `"${i.context}"`)
      .join('  |  ');
    message += ` Found ${strayBraces.length} unmatched "{" or "}" character(s) near: ${preview}. Fix or remove these in the .docx and re-upload.`;
  } else {
    message +=
      ' Check every {{tagName}} and {%tagName} for typos (missing/extra brace), and make sure no other curly braces "{" or "}" are used anywhere else in the document.';
  }

  throw new Error(message);
}
