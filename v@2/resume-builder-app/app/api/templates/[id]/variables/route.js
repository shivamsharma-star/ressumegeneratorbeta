import { NextResponse } from 'next/server';
import { getTemplateFilePath } from '../../../../../lib/templateStore';
import { parseTemplateVariables } from '../../../../../lib/templateParser';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  const filePath = getTemplateFilePath(params.id);
  if (!filePath) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }
  try {
    const variables = parseTemplateVariables(filePath);
    return NextResponse.json({ variables });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
