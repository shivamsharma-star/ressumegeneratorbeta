import { NextResponse } from 'next/server';
import { listTemplates, saveTemplate } from '../../../../lib/templateStore';

export const runtime = 'nodejs';

function isAuthorized(request) {
  const required = process.env.ADMIN_TOKEN;
  if (!required) return true; // no token configured — open for local/dev use
  return request.headers.get('x-admin-token') === required;
}

export async function GET() {
  return NextResponse.json({ templates: listTemplates() });
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
  }

  const file = formData.get('file');
  const rawName = formData.get('name');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded (field "file")' }, { status: 400 });
  }
  if (!file.name?.toLowerCase().endsWith('.docx')) {
    return NextResponse.json({ error: 'Only .docx files are supported' }, { status: 400 });
  }

  const name = (rawName && String(rawName).trim()) || file.name.replace(/\.docx$/i, '');

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const record = saveTemplate({ name, buffer });
    return NextResponse.json({ template: record }, { status: 201 });
  } catch (err) {
    console.error('template upload error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
