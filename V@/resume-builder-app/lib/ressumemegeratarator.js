import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import ImageModule from 'docxtemplater-image-module-free';
import { getTemplateFilePath } from './templateStore';
import { parseTemplateVariables } from './templateParser';
import { convertDocxBufferToPdf } from './docxToPdf';
import { transparentPngBuffer } from './fallbackImage';
import { sanitizeAllDocxXml } from './sanitizeTemplate';
import { convertLinkMarkersToHyperlinks } from './linkConverter';

// ─────────────────────────────────────────────────────────────
// IMAGE FETCH
// ─────────────────────────────────────────────────────────────
async function fetchImageBuffer(source) {
  if (!source) return null;

  if (typeof source === 'string' && source.startsWith('data:')) {
    const commaIdx = source.indexOf(',');
    if (commaIdx === -1) return null;
    const base64 = source.slice(commaIdx + 1);
    if (!base64) return null;
    try {
      const buf = Buffer.from(base64, 'base64');
      console.log(`✅ Decoded image: ${buf.length} bytes`);
      return buf;
    } catch (err) {
      console.warn('⚠️ Decode failed:', err.message);
      return null;
    }
  }

  if (typeof source === 'string' && /^https?:\/\//i.test(source)) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(source, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      console.log(`✅ Fetched image: ${buf.length} bytes`);
      return buf;
    } catch (err) {
      console.warn('⚠️ Fetch failed:', err.message);
      return null;
    }
  }

  return null;
}

// ═════════════════════════════════════════════════════════════
// ⭐ NEW: Extract size from {%photo:50,60} and strip it
// Returns: { buffer, imageSizes }
// ═════════════════════════════════════════════════════════════
function preprocessImageSizes(buffer, variables) {
  console.log('\n═══ preprocessImageSizes START ═══');

  const zip = new PizZip(buffer);
  const allFiles = zip.file(/\.xml$/);

  // ⭐ Step 1: Build size map from parsed variables (with defaults)
  var imageSizes = {};
  for (const v of variables) {
    if (v.type === 'image') {
      imageSizes = {width: v.width, height: v.height};
      console.log("aaaaaaaa: ", imageSizes)
      console.log(`📐 Initial: "${v.name}" = [${v.width}, ${v.height}]`);
    }
  }

  // ⭐ Step 2: Regex to find {%name:W,H} in XML
  const sizeRegex = /\{%\s*([a-zA-Z0-9_]+)\s*:\s*(\d+)\s*,\s*(\d+)\s*\}/g;

  let changed = false;

  // ⭐ Step 3: Process EVERY XML file (document, headers, footers)
  for (const file of allFiles) {
    if (!file.name.startsWith('word/') && !file.name.startsWith('customXml/')) continue;

    let content = file.asText();
    let fileChanged = false;

    // ⭐ ⭐ ⭐ CRITICAL: Reset lastIndex before replace
    sizeRegex.lastIndex = 0;

    const newContent = content.replace(sizeRegex, (_match, name, w, h) => {
      const width = parseInt(w, 10);
      const height = parseInt(h, 10);
      imageSizes[name] = [width, height];
      console.log(`🔧 Stripped: {%${name}:${w},${h}} → {%${name}} = [${width}, ${height}]`);
      fileChanged = true;
      return `{%${name}}`;
    });

    if (fileChanged) {
      zip.file(file.name, newContent);
      changed = true;
    }
  }

  console.log(`📐 FINAL imageSizes:`, JSON.stringify(imageSizes));
  console.log('═══ preprocessImageSizes END ═══\n');

  return {
    buffer: changed
      ? zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' })
      : buffer,
    imageSizes,   // ⭐ Return karo
  };
}

// ─────────────────────────────────────────────────────────────
// LINK PREPROCESSING
// ─────────────────────────────────────────────────────────────
function preprocessLinks(buffer, variables, data) {
  const linkVars = variables.filter((v) => v.type === 'link').map((v) => v.name);
  if (linkVars.length === 0) return buffer;

  const zip = new PizZip(buffer);
  const docFile = zip.file('word/document.xml');
  if (!docFile) return buffer;

  let docXml = docFile.asText();
  let changed = false;

  for (const varName of linkVars) {
    const value = data[varName] || {};
    const text = value.text || value.url || '';
    const url = value.url || '';
    const marker = `@@LINK:${varName}|${text}|${url}@@`;

    const regex = new RegExp(`\\[\\[\\s*${varName}\\s*\\]\\]`, 'g');
    if (regex.test(docXml)) {
      docXml = docXml.replace(regex, marker);
      changed = true;
      console.log(`🔗 Link marker: ${varName}`);
    }
  }

  if (!changed) return buffer;
  zip.file('word/document.xml', docXml);
  return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
}

// ═════════════════════════════════════════════════════════════
// MAIN DOCX GENERATOR
// ═════════════════════════════════════════════════════════════
export async function generateDocxBuffer(templateId, data) {
  const filePath = getTemplateFilePath(templateId);
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('Template not found');
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`📄 Generating DOCX: ${filePath}`);
  console.log(`📦 Data keys:`, Object.keys(data));
  console.log(`═══════════════════════════════════════\n`);

  // 1. Sanitize
  const rawBuffer = fs.readFileSync(filePath);
  const sanitizedBuffer = sanitizeAllDocxXml(rawBuffer);

  // 2. Parse variables
  const variables = parseTemplateVariables(filePath);
  const imageVars = variables.filter((v) => v.type === 'image');
  const linkVars = variables.filter((v) => v.type === 'link');

  console.log(
    `📝 ${variables.length} variables (${imageVars.length} image, ${linkVars.length} link)`
  );

  // ⭐ 3. Extract sizes from template AND strip size tags from XML
  const { buffer: sizeStrippedBuffer, imageSizes } =
    preprocessImageSizes(sanitizedBuffer, variables);

  // ⭐ VERIFY
  console.log(`⭐ VERIFY imageSizes:`, JSON.stringify(imageSizes));
  console.log(`⭐ VERIFY imageSizes["photo"]:`, JSON.stringify(imageSizes["photo"]));

  // 4. Fetch images
  const imageBuffers = {};
  for (const imgVar of imageVars) {
    console.log(`📥 Loading image "${imgVar.name}"...`);
    const buf = await fetchImageBuffer(data[imgVar.name]);
    if (buf && buf.length > 0) {
      imageBuffers[imgVar.name] = buf;
      console.log(`✅ imageBuffers["${imgVar.name}"] = ${buf.length} bytes`);
    } else {
      console.warn(`⚠️ Fallback for "${imgVar.name}"`);
    }
  }

  // 5. Preprocess links
  const preprocessed = preprocessLinks(sizeStrippedBuffer, variables, data);

  // ⭐ 6. IMAGE MODULE — yahan size inject hota hai
  const imageModule = new ImageModule({
    centered: false,

    getImage: (_tagValue, tagName) => {
      console.log(`🖼️ getImage → tagName="${tagName}"`);
      const buf = imageBuffers[tagName];
      if (buf && buf.length > 0) {
        console.log(`   ✅ Returning ${buf.length} bytes`);
        return buf;
      }
      console.log(`   ⚠️ Fallback`);
      return transparentPngBuffer();
    },

    // ⭐⭐⭐ YEH SABSE IMPORTANT — Size inject
    getSize: (_tagValue, tagName) => {
      // console.log(`\n📐 getSize CALLED → tagName="${tagName}"`);
      console.log(`   imageSizes:`, imageSizes);
      // console.log(`imagesize   imageSizes["${tagName}"]:`, JSON.stringify(imageSizes?.[tagName]));

      const size = Object.values(imageSizes);
      console.log(`   → RETURNING: [${size[0]}, ${size[1]}]\n `, size);
      return size;
    },
  });

  // 7. Docxtemplater
  const zip = new PizZip(preprocessed);

  const doc = new Docxtemplater(zip, {
    modules: [imageModule],
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => '',
  });

  // 8. Render data
  const renderData = { ...data };
  linkVars.forEach((v) => delete renderData[v.name]);

  // 9. Render
  try {
    console.log('🔄 Rendering...');
    doc.render(renderData);
    console.log('✅ Render OK');
  } catch (error) {
    console.error('❌ Render error:', error);
    let details = error.message;
    if (error.properties?.errors) {
      details = error.properties.errors
        .map((e) => e.properties?.explanation || e.message)
        .filter(Boolean)
        .join('; ');
    }
    throw new Error(`Failed to render: ${details}`);
  }

  // 10. Generate buffer
  let outputBuffer = doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });

  // 11. Convert links
  outputBuffer = convertLinkMarkersToHyperlinks(outputBuffer);

  console.log(`\n✅ DOCX generated: ${outputBuffer.length} bytes\n`);
  return outputBuffer;
}

// import fs from 'fs';
// import PizZip from 'pizzip';
// import Docxtemplater from 'docxtemplater';
// import ImageModule from 'docxtemplater-image-module-free';
// import { getTemplateFilePath } from './templateStore';
// import { parseTemplateVariables } from './templateParser';
// import { convertDocxBufferToPdf } from './docxToPdf';
// import { transparentPngBuffer } from './fallbackImage';
// import { sanitizeAllDocxXml } from './sanitizeTemplate';

// async function fetchImageBuffer(source) {
//   if (!source) return null;
//   if (source.startsWith('data:')) {
//     const base64 = source.split(',')[1] || '';
//     return Buffer.from(base64, 'base64');
//   }
//   try {
//     const controller = new AbortController();
//     const timeout = setTimeout(() => controller.abort(), 10000);
//     const res = await fetch(source, { signal: controller.signal });
//     clearTimeout(timeout);
//     if (!res.ok) throw new Error(`HTTP ${res.status}`);
//     const arrayBuffer = await res.arrayBuffer();
//     return Buffer.from(arrayBuffer);
//   } catch (err) {
//     console.warn(`⚠️ Image fetch failed:`, err.message);
//     return null;
//   }
// }

// export async function generateDocxBuffer(templateId, data) {
//   const filePath = getTemplateFilePath(templateId);
//   if (!filePath || !fs.existsSync(filePath)) {
//     throw new Error('Template not found');
//   }

//   console.log(`📄 Generating from: ${filePath}`);
  
//   // Read and sanitize the template on-the-fly
//   const rawBuffer = fs.readFileSync(filePath);
//   console.log('🔄 Sanitizing template...');
//   const sanitizedBuffer = sanitizeAllDocxXml(rawBuffer);
//   console.log('✅ Sanitization complete');

//   const variables = parseTemplateVariables(filePath);
//   const imageVarNames = variables.filter(v => v.type === 'image').map(v => v.name);
//   console.log(`📝 Found ${variables.length} variables`);

//   // Fetch images
//   const imageBuffers = {};
//   for (const tagName of imageVarNames) {
//     const buf = await fetchImageBuffer(data[tagName]);
//     if (buf) {
//       imageBuffers[tagName] = buf;
//     }
//   }

//   const zip = new PizZip(sanitizedBuffer);

//   const imageModule = new ImageModule({
//     centered: false,
//     getImage: (_tagValue, tagName) => {
//       return imageBuffers[tagName] || transparentPngBuffer();
//     },
//     getSize: () => [140, 160]
//   });

//   const doc = new Docxtemplater(zip, {
//     modules: [imageModule],
//     paragraphLoop: true,
//     linebreaks: true,
//     delimiters: { start: '{{', end: '}}' },
//     nullGetter: () => '',
//   });

//   try {
//     console.log('🔄 Rendering...');
//     doc.render(data);
//     console.log('✅ Rendered successfully');
//   } catch (error) {
//     console.error('❌ Render error:', error);
//     let details = error.message;
//     if (error.properties?.errors) {
//       details = error.properties.errors
//         .map(e => e.properties?.explanation || e.message)
//         .filter(Boolean)
//         .join('; ');
//     }
//     throw new Error(`Failed to render: ${details}`);
//   }

//   return doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
// }

// export async function generatePdfBuffer(templateId, data) {
//   const docxBuffer = await generateDocxBuffer(templateId, data);
//   return convertDocxBufferToPdf(docxBuffer);
// }