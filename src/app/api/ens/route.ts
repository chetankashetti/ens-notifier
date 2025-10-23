import { NextRequest, NextResponse } from 'next/server';
import { getEnsDomains } from '@/lib/ens/lookup';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }
    
    const domains = await getEnsDomains(address);
    
    return NextResponse.json({
      address,
      domains,
      count: domains.length,
    });
  } catch (error) {
    console.error('Error in ENS API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ENS domains' },
      { status: 500 }
    );
  }
}
