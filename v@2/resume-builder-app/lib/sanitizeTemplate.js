/**
 * Word/autocorrect frequently splits a placeholder like {{name}} into several
 * <w:t> runs (e.g. "{{na" + "me}}"), which breaks both our variable parser and
 * docxtemplater's rendering. This scans each paragraph, finds any {{...}} or
 * {%...} pattern that spans multiple <w:t> nodes, and merges it back into a
 * single run so the rest of the pipeline never has to worry about it.
 *
 * This runs once, automatically, whenever an admin uploads a template.
 */

const TAG_PATTERN = /\{\{[^{}]*\}\}|\{%[^{}]*\}/g;

export function sanitizeDocumentXml(xml) {
  return xml.replace(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g, mergeSplitTagsInParagraph);
}

function mergeSplitTagsInParagraph(paragraphXml) {
  const wtRegex = /<w:t([^>]*)>([\s\S]*?)<\/w:t>/g;
  const nodes = [];
  let m;
  while ((m = wtRegex.exec(paragraphXml)) !== null) {
    nodes.push({
      attrs: m[1],
      text: decodeXmlEntities(m[2]),
      matchStart: m.index,
      matchEnd: m.index + m[0].length,
    });
  }
  if (nodes.length < 2) return paragraphXml;

  let concatenated = '';
  const charNodeMap = [];
  const nodeCharOffset = [];
  nodes.forEach((node, idx) => {
    nodeCharOffset.push(concatenated.length);
    for (let i = 0; i < node.text.length; i++) charNodeMap.push(idx);
    concatenated += node.text;
  });

  const nodeReplacements = new Map();
  const nodesToClear = new Set();
  let tm;
  TAG_PATTERN.lastIndex = 0;
  while ((tm = TAG_PATTERN.exec(concatenated)) !== null) {
    const startIdx = tm.index;
    const endIdx = tm.index + tm[0].length - 1;
    const startNode = charNodeMap[startIdx];
    const endNode = charNodeMap[endIdx];
    if (startNode === endNode) continue; // not split, leave untouched

    const localStart = startIdx - nodeCharOffset[startNode];
    const localEnd = endIdx - nodeCharOffset[endNode];

    const beforeText = nodes[startNode].text.slice(0, localStart);
    const afterText = nodes[endNode].text.slice(localEnd + 1);

    nodeReplacements.set(startNode, beforeText + tm[0]);
    for (let n = startNode + 1; n < endNode; n++) nodesToClear.add(n);
    nodeReplacements.set(endNode, afterText);
  }

  if (nodeReplacements.size === 0) return paragraphXml;

  let result = paragraphXml;
  const order = nodes
    .map((n, idx) => ({ ...n, idx }))
    .sort((a, b) => b.matchStart - a.matchStart);

  for (const node of order) {
    let newText = null;
    if (nodeReplacements.has(node.idx)) newText = nodeReplacements.get(node.idx);
    else if (nodesToClear.has(node.idx)) newText = '';
    else continue;

    const attrsWithoutSpace = node.attrs.replace(/\s*xml:space="[^"]*"/, '');
    const newTag = `<w:t${attrsWithoutSpace} xml:space="preserve">${escapeXml(newText)}</w:t>`;
    result = result.slice(0, node.matchStart) + newTag + result.slice(node.matchEnd);
  }

  return result;
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function decodeXmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
