import { NextResponse } from 'next/server';
import { deleteTemplate } from '../../../../../lib/templateStore';

export const runtime = 'nodejs';

function isAuthorized(request) {
  const required = process.env.ADMIN_TOKEN;
  if (!required) return true;
  return request.headers.get('x-admin-token') === required;
}

export async function DELETE(request, { params }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const ok = deleteTemplate(params.id);
  if (!ok) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
