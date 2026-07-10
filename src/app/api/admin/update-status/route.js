import { NextResponse } from 'next/server';
import { UrBackendClient } from '@urbackend/sdk';

export async function POST(req) {
  try {
    const { featureId, status, token } = await req.json();

    if (!featureId || !status || !token) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const ur = new UrBackendClient({ 
      apiKey: process.env.URBACKEND_SECRET_KEY,
      apiUrl: process.env.NEXT_PUBLIC_URBACKEND_URL || 'http://localhost:3000'
    });
    
    const user = await ur.auth.me(token);
    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }
    
    const updateRes = await ur.db.patch('features', featureId, { status });
    
    return NextResponse.json(updateRes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
