import { NextRequest, NextResponse } from 'next/server';
import { getConnectedAddressesByFid } from '@/lib/farcaster/neynar';

export async function GET(request: NextRequest) {
  console.log('\n[API] ===== /api/farcaster/connected-addresses called =====');
  
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    
    console.log('[API] Requested FID:', fid);
    
    if (!fid) {
      console.error('[API] ❌ FID parameter missing');
      return NextResponse.json(
        { error: 'FID parameter is required' },
        { status: 400 }
      );
    }
    
    console.log('[API] Calling getConnectedAddressesByFid...');
    const addresses = await getConnectedAddressesByFid(fid);
    console.log('[API] ✅ Received addresses:', addresses);
    console.log('[API] ============================================\n');
    
    return NextResponse.json({
      fid,
      addresses,
      count: addresses.length,
    });
  } catch (error) {
    console.error('\n[API] ========== UNEXPECTED ERROR ==========');
    console.error('[API] Error in connected addresses API:', error);
    console.error('[API] =======================================\n');
    return NextResponse.json(
      { error: 'Failed to fetch connected addresses' },
      { status: 500 }
    );
  }
}
