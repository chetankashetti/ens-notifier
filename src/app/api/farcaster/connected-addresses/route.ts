import { NextRequest, NextResponse } from 'next/server';
import { getConnectedAddressesByFid } from '@/lib/farcaster/neynar';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    
    if (!fid) {
      return NextResponse.json(
        { error: 'FID parameter is required' },
        { status: 400 }
      );
    }
    
    const addresses = await getConnectedAddressesByFid(fid);
    
    return NextResponse.json({
      fid,
      addresses,
      count: addresses.length,
    });
  } catch (error) {
    console.error('Error in connected addresses API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connected addresses' },
      { status: 500 }
    );
  }
}
