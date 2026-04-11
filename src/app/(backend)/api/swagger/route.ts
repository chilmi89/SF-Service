import { NextResponse } from 'next/server';
import { getApiDocs } from '@/lib/swagger';

export async function GET() {
  try {
    const spec = await getApiDocs();
    return NextResponse.json(spec);
  } catch (error) {
    console.error('Failed to generate Swagger spec:', error);
    return NextResponse.json(
      { error: 'Gagal men-*generate* spesifikasi API' },
      { status: 500 }
    );
  }
}
