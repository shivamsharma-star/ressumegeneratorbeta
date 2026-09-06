import mammoth from 'mammoth';
import puppeteer from 'puppeteer';

/**
 * docx-pdf / libreoffice-convert-style packages all secretly shell out to a
 * LibreOffice install on the machine. To avoid requiring ANY system install,
 * this instead:
 *   1. Uses mammoth (pure JS, reads the .docx XML directly) to turn the
 *      filled .docx into HTML — inline images become base64 data URIs.
 *   2. Uses puppeteer (downloads its own bundled Chromium via npm install,
 *      no separate system package needed) to print that HTML to PDF.
 *
 * Trade-off: this does not pixel-match Word's exact layout (tab stops,
 * some spacing) the way a real Word/LibreOffice render would — but it needs
 * zero system dependencies beyond `npm install`.
 *
 * @param {Buffer} docxBuffer
 * @returns {Promise<Buffer>}
 */
export async function convertDocxBufferToPdf(docxBuffer) {
  const { value: html } = await mammoth.convertToHtml(
    { buffer: docxBuffer },
    { convertImage: mammoth.images.inline(mammoth.images.imgElement) }
  );

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11.5pt;
    line-height: 1.45;
    color: #111;
    padding: 28px 34px;
  }
  h1, h2, h3 { margin: 0.6em 0 0.3em; }
  p { margin: 0.25em 0; }
  img { max-width: 130px; max-height: 160px; object-fit: cover; }
  table { border-collapse: collapse; width: 100%; }
  td, th { padding: 2px 6px; vertical-align: top; }
</style>
</head>
<body>${html}</body>
</html>`;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '14mm', bottom: '14mm', left: '14mm', right: '14mm' },
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}
