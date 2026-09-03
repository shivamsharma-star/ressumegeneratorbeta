import { NextResponse } from 'next/server';
import { generateResume } from '@/lib/generateResume';

export async function POST(request) {
  try {
    const { data, format } = await request.json();

    if (!data || !data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const blob = await generateResume(data, format || 'docx');
    const ext = format === 'pdf' ? 'pdf' : 'docx';
    const contentType = format === 'pdf' 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${data.name.replace(/\s+/g, '_')}_Resume.${ext}"`,
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate' },
      { status: 500 }
    );
  }
}