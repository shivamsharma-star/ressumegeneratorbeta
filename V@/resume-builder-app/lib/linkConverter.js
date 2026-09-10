import PizZip from 'pizzip';

// XML-safe marker (no < or > — those break XML)
const MARKER_PREFIX = '@@LINK:';
const MARKER_SUFFIX = '@@';

/**
 * Converts @@LINK:varName|text|url@@ markers in DOCX to real Word hyperlinks.
 * Creates relationship entries and replaces the containing run with <w:hyperlink>.
 */
export function convertLinkMarkersToHyperlinks(docxBuffer) {
  const zip = new PizZip(docxBuffer);

  const docFile = zip.file('word/document.xml');
  const relsFile = zip.file('word/_rels/document.xml.rels');
  if (!docFile || !relsFile) return docxBuffer;

  let docXml = docFile.asText();
  let relsXml = relsFile.asText();

  // Find current max rId
  const rIdMatches = relsXml.match(/Id="rId(\d+)"/g) || [];
  let maxRId = 0;
  rIdMatches.forEach((m) => {
    const num = parseInt(m.match(/\d+/)[0], 10);
    if (num > maxRId) maxRId = num;
  });

  // Match @@LINK:varName|text|url@@
  const markerRegex = /@@LINK:([a-zA-Z0-9_]+)\|([^|]*)\|([\s\S]*?)@@/g;

  const newRelationships = [];
  const replacements = [];
  let match;
  let nextRId = maxRId;

  while ((match = markerRegex.exec(docXml)) !== null) {
    const [fullMatch, varName, text, url] = match;
    nextRId++;
    const rId = `rId${nextRId}`;

    newRelationships.push(
      `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${escapeXml(
        url
      )}" TargetMode="External"/>`
    );

    replacements.push({ marker: fullMatch, rId, text: text || url });
  }

  if (replacements.length === 0) {
    console.log('ℹ️ No link markers to convert');
    return docxBuffer;
  }

  console.log(`🔗 Converting ${replacements.length} link marker(s) to hyperlinks`);

  for (const { marker, rId, text } of replacements) {
    docXml = replaceMarkerWithHyperlink(docXml, marker, rId, text);
  }

  relsXml = relsXml.replace(
    '</Relationships>',
    newRelationships.join('') + '</Relationships>'
  );

  zip.file('word/document.xml', docXml);
  zip.file('word/_rels/document.xml.rels', relsXml);

  return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
}

function replaceMarkerWithHyperlink(docXml, marker, rId, text) {
  const escapedMarker = escapeRegex(marker);

  const runRegex = new RegExp(
    `<w:r\\b[^>]*>(?:(?!<w:r\\b)[\\s\\S])*?<w:t[^>]*>${escapedMarker}</w:t>(?:(?!<w:r\\b)[\\s\\S])*?</w:r>`,
    'g'
  );

  const hyperlinkXml = createHyperlinkXml(rId, text);

  let replaced = false;
  const newXml = docXml.replace(runRegex, () => {
    replaced = true;
    return hyperlinkXml;
  });

  if (!replaced) {
    console.warn(`⚠️ Could not find run for marker: ${marker.substring(0, 40)}`);
    return docXml;
  }

  return newXml;
}

function createHyperlinkXml(rId, text) {
  return `<w:hyperlink r:id="${rId}" w:history="1"><w:r><w:rPr><w:rStyle w:val="Hyperlink"/></w:rPr><w:t xml:space="preserve">${escapeXml(
    text
  )}</w:t></w:r></w:hyperlink>`;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


// import PizZip from 'pizzip';

// /**
//  * Post-processes the generated DOCX to convert link markers
//  * into real Word hyperlinks.
//  *
//  * Before this runs, the DOCX text contains:
//  *   <<LINK:varName>>
//  *
//  * This function replaces those with real hyperlink XML.
//  */
// export function convertLinkMarkersToHyperlinks(docxBuffer) {
//   const zip = new PizZip(docxBuffer);

//   const docFile = zip.file('word/document.xml');
//   if (!docFile) return docxBuffer;

//   let docXml = docFile.asText();
//   const relsFile = zip.file('word/_rels/document.xml.rels');
//   if (!relsFile) return docxBuffer;

//   let relsXml = relsFile.asText();

//   // Find existing max rId
//   const rIdMatches = relsXml.match(/Id="rId(\d+)"/g) || [];
//   let maxRId = 0;
//   rIdMatches.forEach((m) => {
//     const num = parseInt(m.match(/\d+/)[0], 10);
//     if (num > maxRId) maxRId = num;
//   });

//   // Find all markers: <<LINK:varName|text|url>>
//   // Note: URL might contain |, so we split on the FIRST 2 pipes only
//   const markerRegex = /<<LINK:([a-zA-Z0-9_]+)\|([^|]*)\|([^>]*)>>/g;

//   let newRels = '';
//   let linkIndex = 0;
//   const replacements = [];

//   let match;
//   while ((match = markerRegex.exec(docXml)) !== null) {
//     const [fullMatch, varName, text, url] = match;
//     const rId = `rId${maxRId + linkIndex + 1}`;
//     linkIndex++;

//     // Add relationship
//     newRels += `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${escapeXml(url)}" TargetMode="External"/>`;

//     replacements.push({ fullMatch, rId, text, url });
//   }

//   if (replacements.length === 0) return docxBuffer;

//   // Insert relationships
//   relsXml = relsXml.replace('</Relationships>', newRels + '</Relationships>');
//   zip.file('word/_rels/document.xml.rels', relsXml);

//   // Replace each marker with hyperlink XML
//   for (const { fullMatch, rId, text } of replacements) {
//     const hyperlinkXml = createHyperlinkRun(rId, text);

//     // Marker may be inside <w:t>...</w:t>
//     // Find the whole <w:t> containing the marker and replace it
//     const escapedMarker = escapeRegex(fullMatch);
//     const wtRegex = new RegExp(`<w:t[^>]*>${escapedMarker}</w:t>`, 'g');

//     if (wtRegex.test(docXml)) {
//       // Marker fills the whole <w:t>
//       docXml = docXml.replace(wtRegex, hyperlinkXml);
//     } else {
//       // Marker is part of a larger <w:t> — split it
//       docXml = docXml.replace(fullMatch, hyperlinkXml);
//     }
//   }

//   zip.file('word/document.xml', docXml);

//   return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
// }

// function createHyperlinkRun(rId, text) {
//   return `<w:hyperlink r:id="${rId}" w:history="1"><w:r><w:rPr><w:rStyle w:val="Hyperlink"/><w:color w:val="0563C1"/><w:u w:val="single"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:hyperlink>`;
// }

// function escapeXml(str) {
//   return String(str)
//     .replace(/&/g, '&amp;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;')
//     .replace(/"/g, '&quot;')
//     .replace(/'/g, '&apos;');
// }

// function escapeRegex(str) {
//   return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// }