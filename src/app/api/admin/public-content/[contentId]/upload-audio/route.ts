import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const resolvedParams = await params;
    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    console.log('🔐 Authorization header:', {
      hasAuthHeader: !!authHeader,
      authValue: authHeader?.substring(0, 30) + '...'
    });
    
    let accessToken = null;
    
    // Try to extract token from Authorization header first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7);
      console.log('✅ Using token from Authorization header');
    } else {
      console.log('❌ No valid Authorization header found');
      return NextResponse.json(
        { error: 'Unauthorized - No access token in header' },
        { status: 401 }
      );
    }
    
    console.log('🔐 Auth info for audio upload:', {
      hasAccessToken: !!accessToken,
      tokenLength: accessToken?.length,
      contentId: resolvedParams.contentId
    });

    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('📤 Uploading audio file:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      backendUrl: `${BACKEND_URL}/api/admin/public-content/${resolvedParams.contentId}/upload-audio`
    });
    
    // Forward the formData to the backend
    const response = await fetch(
      `${BACKEND_URL}/api/admin/public-content/${resolvedParams.contentId}/upload-audio`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      }
    );
    
    console.log('📥 Backend response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Audio upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 