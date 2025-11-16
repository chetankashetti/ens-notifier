import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';
import { config } from '@/lib/config';

let neynarClient: NeynarAPIClient | null = null;

function getNeynarClient(): NeynarAPIClient | null {
  if (!config.neynar.apiKey) {
    console.warn('[Neynar] API key not configured');
    return null;
  }

  if (!neynarClient) {
    const neynarConfig = new Configuration({
      apiKey: config.neynar.apiKey,
    });
    neynarClient = new NeynarAPIClient(neynarConfig);
  }

  return neynarClient;
}

/**
 * Fetches connected Ethereum addresses for a Farcaster user by their FID
 * @param fid - Farcaster ID
 * @returns Array of connected Ethereum addresses (lowercase)
 */
export async function getConnectedAddressesByFid(fid: string | number): Promise<string[]> {
  try {
    const client = getNeynarClient();
    if (!client) {
      console.warn('[Neynar] Client not available, returning empty array');
      return [];
    }

    const fidNumber = typeof fid === 'string' ? parseInt(fid, 10) : fid;
    if (isNaN(fidNumber)) {
      console.error('[Neynar] Invalid FID:', fid);
      return [];
    }

    console.log('[Neynar] Fetching user by FID:', fidNumber);
    const { users } = await client.fetchBulkUsers({ fids: [fidNumber] });

    if (!users || users.length === 0) {
      console.log('[Neynar] No user found for FID:', fidNumber);
      return [];
    }

    const user = users[0];
    const ethAddresses = user.verified_addresses?.eth_addresses || [];
    
    // Normalize to lowercase
    const normalizedAddresses = ethAddresses
      .filter((addr): addr is string => typeof addr === 'string' && addr.length > 0)
      .map((addr) => addr.toLowerCase());

    console.log('[Neynar] ✅ Found connected addresses:', normalizedAddresses);
    return normalizedAddresses;
  } catch (error) {
    console.error('[Neynar] ❌ Error fetching connected addresses:', error);
    return [];
  }
}
