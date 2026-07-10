import { NextResponse } from 'next/server';
import { UrBackendClient } from '@urbackend/sdk';

export async function POST(req) {
  try {
    const { featureId, userId, action } = await req.json();

    if (!featureId || !userId) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const ur = new UrBackendClient({ 
      apiKey: process.env.URBACKEND_SECRET_KEY,
      apiUrl: process.env.NEXT_PUBLIC_URBACKEND_URL || 'http://localhost:3000'
    });
    
    const feature = await ur.db.getOne('features', featureId);
    let votes = feature.votes || [];
    
    const hasVoted = votes.includes(userId);
    
    if (action === 'toggle') {
      if (hasVoted) {
        votes = votes.filter(id => id !== userId);
      } else {
        votes.push(userId);
      }
    }
    
    const updateRes = await ur.db.patch('features', featureId, { votes });
    
    return NextResponse.json(updateRes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
