import PizZip from 'pizzip';

// ⭐ CHANGED: Image tag mein `:50,60` bhi allow karo
const TAG_PATTERN =
  /\{\{[^{}]*\}\}|\{%\s*[a-zA-Z0-9_]+\s*(?::\s*\d+\s*,\s*\d+\s*)?\}|\[\[[^\[\]]*\]\]/g;

const TAG_SEARCH =
  /(\{\{[^{}]*\}\}|\{%\s*[a-zA-Z0-9_]+\s*(?::\s*\d+\s*,\s*\d+\s*)?\}|\[\[[^\[\]]*\]\])/g;

export function sanitizeAllDocxXml(buffer) {
  const zip = new PizZip(buffer);
  const allFiles = zip.file(/\.xml$/);
  let changed = false;

  for (const file of allFiles) {
    const fileName = file.name;
    if (!fileName.includes('word/') && !fileName.includes('customXml/')) continue;

    const content = file.asText();
    if (!content.includes('<w:t>')) continue;

    TAG_PATTERN.lastIndex = 0;
    const hasTags = TAG_PATTERN.test(content);
    TAG_PATTERN.lastIndex = 0;
    if (!hasTags) continue;

    const sanitized = sanitizeXml(content);
    if (sanitized !== content) {
      zip.file(fileName, sanitized);
      changed = true;
      console.log(`✅ Sanitized: ${fileName}`);
    }
  }

  return changed
    ? zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' })
    : buffer;
}

function sanitizeXml(xml) {
  let result = xml;
  const paragraphRegex = /<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g;
  const paragraphs = [];
  let match;

  while ((match = paragraphRegex.exec(xml)) !== null) {
    paragraphs.push({ text: match[0], index: match.index, length: match[0].length });
  }

  for (let i = paragraphs.length - 1; i >= 0; i--) {
    const para = paragraphs[i];
    const fixed = fixParagraph(para.text);
    if (fixed !== para.text) {
      result =
        result.slice(0, para.index) + fixed + result.slice(para.index + para.length);
    }
  }

  return result;
}

function fixParagraph(paragraphXml) {
  const wtRegex = /<w:t([^>]*)>([\s\S]*?)<\/w:t>/g;
  const nodes = [];
  let match;

  while ((match = wtRegex.exec(paragraphXml)) !== null) {
    nodes.push({
      attrs: match[1],
      text: decodeXmlEntities(match[2]),
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  if (nodes.length < 2) return paragraphXml;

  let fullText = '';
  const charToNode = [];
  const nodeStart = [];

  nodes.forEach((node, idx) => {
    nodeStart.push(fullText.length);
    for (let i = 0; i < node.text.length; i++) charToNode.push(idx);
    fullText += node.text;
  });

  const replacements = new Map();
  const toClear = new Set();
  let tagMatch;
  TAG_SEARCH.lastIndex = 0;

  while ((tagMatch = TAG_SEARCH.exec(fullText)) !== null) {
    const start = tagMatch.index;
    const end = tagMatch.index + tagMatch[0].length - 1;
    const startNode = charToNode[start];
    const endNode = charToNode[end];

    if (startNode === endNode) continue;

    const localStart = start - nodeStart[startNode];
    const localEnd = end - nodeStart[endNode];

    const prefix = nodes[startNode].text.slice(0, localStart);
    const suffix = nodes[endNode].text.slice(localEnd + 1);

    replacements.set(startNode, prefix + tagMatch[0]);
    for (let n = startNode + 1; n < endNode; n++) toClear.add(n);
    replacements.set(endNode, suffix);
  }

  if (replacements.size === 0) return paragraphXml;

  let result = paragraphXml;
  const sortedNodes = [...nodes]
    .map((n, idx) => ({ ...n, idx }))
    .sort((a, b) => b.start - a.start);

  for (const node of sortedNodes) {
    let newText = null;
    if (replacements.has(node.idx)) newText = replacements.get(node.idx);
    else if (toClear.has(node.idx)) newText = '';
    else continue;

    let attrs = node.attrs;
    if (!attrs.includes('xml:space="preserve"')) {
      attrs = attrs.replace(/\s*xml:space="[^"]*"/, '') + ' xml:space="preserve"';
    }

    const newTag = `<w:t${attrs}>${escapeXml(newText)}</w:t>`;
    result = result.slice(0, node.start) + newTag + result.slice(node.end);
  }

  return result;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function decodeXmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}


// import PizZip from 'pizzip';

// const TAG_PATTERN = /\{\{[^{}]*\}\}|\{%[^{}]*\}/g;

// /**
//  * ULTIMATE sanitizer - processes EVERY XML file in the DOCX
//  * including headers, footers, footnotes, endnotes, and custom XML
//  */
// export function sanitizeAllDocxXml(buffer) {
//   const zip = new PizZip(buffer);
//   const allFiles = zip.file(/\.xml$/);
//   let changed = false;
  
//   for (const file of allFiles) {
//     const fileName = file.name;
//     // Skip files that don't contain text
//     if (!fileName.includes('word/') && !fileName.includes('customXml/')) continue;
    
//     const content = file.asText();
//     // Skip if no text runs
//     if (!content.includes('<w:t>')) continue;
    
//     // Check if any tags exist in this file
//     const hasTags = TAG_PATTERN.test(content);
//     TAG_PATTERN.lastIndex = 0; // Reset regex
//     if (!hasTags) continue;
    
//     const sanitized = sanitizeXml(content);
//     if (sanitized !== content) {
//       zip.file(fileName, sanitized);
//       changed = true;
//       console.log(`✅ Sanitized: ${fileName}`);
//     }
//   }
  
//   return changed ? zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }) : buffer;
// }

// function sanitizeXml(xml) {
//   // Process each paragraph separately
//   let result = xml;
//   const paragraphRegex = /<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g;
//   const paragraphs = [];
//   let match;
  
//   while ((match = paragraphRegex.exec(xml)) !== null) {
//     paragraphs.push({
//       text: match[0],
//       index: match.index,
//       length: match[0].length
//     });
//   }
  
//   // Process paragraphs from end to start to maintain positions
//   for (let i = paragraphs.length - 1; i >= 0; i--) {
//     const para = paragraphs[i];
//     const fixed = fixParagraph(para.text);
//     if (fixed !== para.text) {
//       result = result.slice(0, para.index) + fixed + result.slice(para.index + para.length);
//     }
//   }
  
//   return result;
// }

// function fixParagraph(paragraphXml) {
//   // Extract all text runs
//   const wtRegex = /<w:t([^>]*)>([\s\S]*?)<\/w:t>/g;
//   const nodes = [];
//   let match;
  
//   while ((match = wtRegex.exec(paragraphXml)) !== null) {
//     nodes.push({
//       attrs: match[1],
//       text: decodeXmlEntities(match[2]),
//       start: match.index,
//       end: match.index + match[0].length,
//       fullMatch: match[0]
//     });
//   }
  
//   if (nodes.length < 2) return paragraphXml;
  
//   // Build concatenated text with node mapping
//   let fullText = '';
//   const charToNode = [];
//   const nodeStart = [];
  
//   nodes.forEach((node, idx) => {
//     nodeStart.push(fullText.length);
//     for (let i = 0; i < node.text.length; i++) {
//       charToNode.push(idx);
//     }
//     fullText += node.text;
//   });
  
//   // Find all tags and merge if split across nodes
//   const replacements = new Map();
//   const toClear = new Set();
//   let tagMatch;
//   TAG_PATTERN.lastIndex = 0;
  
//   while ((tagMatch = TAG_PATTERN.exec(fullText)) !== null) {
//     const start = tagMatch.index;
//     const end = tagMatch.index + tagMatch[0].length - 1;
//     const startNode = charToNode[start];
//     const endNode = charToNode[end];
    
//     // If tag is within a single node, skip
//     if (startNode === endNode) continue;
    
//     // Calculate positions within nodes
//     const localStart = start - nodeStart[startNode];
//     const localEnd = end - nodeStart[endNode];
    
//     // Get prefix from first node and suffix from last node
//     const prefix = nodes[startNode].text.slice(0, localStart);
//     const suffix = nodes[endNode].text.slice(localEnd + 1);
    
//     // Replace first node's text with prefix + full tag
//     replacements.set(startNode, prefix + tagMatch[0]);
    
//     // Clear middle nodes
//     for (let n = startNode + 1; n < endNode; n++) {
//       toClear.add(n);
//     }
    
//     // Replace last node's text with suffix
//     replacements.set(endNode, suffix);
//   }
  
//   if (replacements.size === 0) return paragraphXml;
  
//   // Apply replacements from end to start
//   let result = paragraphXml;
//   const sortedNodes = [...nodes].map((n, idx) => ({ ...n, idx }))
//     .sort((a, b) => b.start - a.start);
  
//   for (const node of sortedNodes) {
//     let newText = null;
//     if (replacements.has(node.idx)) {
//       newText = replacements.get(node.idx);
//     } else if (toClear.has(node.idx)) {
//       newText = '';
//     } else {
//       continue;
//     }
    
//     // Preserve attributes but ensure xml:space is set
//     let attrs = node.attrs;
//     if (!attrs.includes('xml:space="preserve"')) {
//       attrs = attrs.replace(/\s*xml:space="[^"]*"/, '');
//       attrs = attrs + ' xml:space="preserve"';
//     }
    
//     const newTag = `<w:t${attrs}>${escapeXml(newText)}</w:t>`;
//     result = result.slice(0, node.start) + newTag + result.slice(node.end);
//   }
  
//   return result;
// }

// function escapeXml(str) {
//   return str
//     .replace(/&/g, '&amp;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;')
//     .replace(/"/g, '&quot;')
//     .replace(/'/g, '&apos;');
// }

// function decodeXmlEntities(str) {
//   return str
//     .replace(/&amp;/g, '&')
//     .replace(/&lt;/g, '<')
//     .replace(/&gt;/g, '>')
//     .replace(/&quot;/g, '"')
//     .replace(/&apos;/g, "'");
// }