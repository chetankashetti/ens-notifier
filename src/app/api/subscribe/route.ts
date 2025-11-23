import { NextRequest, NextResponse } from 'next/server';
import { findOrCreateUser, subscribeToEnsDomain, unsubscribeFromEnsDomain, getUserEnsRecords } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, ensName, expiryDate, email, fid, type } = body;

    if (!walletAddress || !ensName || !expiryDate) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, ensName, expiryDate' },
        { status: 400 }
      );
    }

    // Create or find user
    const user = await findOrCreateUser(walletAddress, email, fid);

    // Subscribe to ENS domain
    const record = await subscribeToEnsDomain(user.id, ensName, new Date(expiryDate));

    return NextResponse.json({
      success: true,
      record: {
        id: record.id,
        ensName: record.ensName,
        expiryDate: record.expiryDate,
        notified: record.notified,
      },
    });
  } catch (error) {
    console.error('Error in subscribe API:', error);

    // Determine domain type label for error message
    const body = await request.clone().json().catch(() => ({}));
    const typeLabel = body.type === 'basename' ? 'Basename' : 'ENS domain';

    return NextResponse.json(
      { error: `Failed to subscribe to ${typeLabel}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const ensName = searchParams.get('ensName');

    if (!walletAddress || !ensName) {
      return NextResponse.json(
        { error: 'Missing required parameters: walletAddress, ensName' },
        { status: 400 }
      );
    }

    // Find user
    const user = await findOrCreateUser(walletAddress);

    // Unsubscribe from ENS domain
    await unsubscribeFromEnsDomain(user.id, ensName);

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from ENS domain',
    });
  } catch (error) {
    console.error('Error in unsubscribe API:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe from ENS domain' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: walletAddress' },
        { status: 400 }
      );
    }

    // Find user
    const user = await findOrCreateUser(walletAddress);

    // Get user's ENS records
    const records = await getUserEnsRecords(user.id);

    return NextResponse.json({
      success: true,
      records: records.map(record => ({
        id: record.id,
        ensName: record.ensName,
        expiryDate: record.expiryDate,
        notified: record.notified,
        lastNotifiedAt: record.lastNotifiedAt,
      })),
    });
  } catch (error) {
    console.error('Error in get subscriptions API:', error);
    return NextResponse.json(
      { error: 'Failed to get subscriptions' },
      { status: 500 }
    );
  }
}
