import { NextResponse } from 'next/server';
import { generateDocxBuffer, generatePdfBuffer } from '../../../lib/ressumemegeratarator';

// Force the Node.js runtime (not Edge) — fs / child_process / libreoffice need it.
export const runtime = 'nodejs';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { data, format } = body || {};

  if (!data || typeof data !== 'object') {
    return NextResponse.json({ error: 'Missing "data" object' }, { status: 400 });
  }
  if (format !== 'docx' && format !== 'pdf') {
    return NextResponse.json(
      { error: 'Invalid "format": must be "docx" or "pdf"' },
      { status: 400 }
    );
  }

  const safeName = String(data.name || 'resume')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .slice(0, 60) || 'resume';

  try {
    if (format === 'docx') {
      const buffer = generateDocxBuffer(data);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${safeName}.docx"`,
        },
      });
    }

    const pdfBuffer = await generatePdfBuffer(data);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}.pdf"`,
      },
    });
  } catch (err) {
    console.error('generate-document error:', err);
    return NextResponse.json({ error: err.message || 'Generation failed' }, { status: 500 });
  }
}
