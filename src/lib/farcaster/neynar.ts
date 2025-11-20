import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';
import { config } from '@/lib/config';

let neynarClient: NeynarAPIClient | null = null;

function getNeynarClient(): NeynarAPIClient | null {
  const apiKey = config.neynar.apiKey;
  
  if (!apiKey) {
    console.warn('[Neynar] API key not configured - check NEYNAR_API_KEY environment variable');
    return null;
  }

  // Log first few characters for debugging (don't log full key for security)
  const apiKeyPreview = apiKey.length > 8 ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : '***';
  console.log('[Neynar] Initializing client with API key:', apiKeyPreview);

  if (!neynarClient) {
    try {
      const neynarConfig = new Configuration({
        apiKey: apiKey.trim(), // Trim whitespace in case there's any
      });
      neynarClient = new NeynarAPIClient(neynarConfig);
      console.log('[Neynar] ✅ Client initialized successfully');
    } catch (error) {
      console.error('[Neynar] ❌ Failed to initialize client:', error);
      return null;
    }
  }

  return neynarClient;
}

/**
 * Fetches connected Ethereum addresses for a Farcaster user by their FID
 * @param fid - Farcaster ID
 * @returns Array of connected Ethereum addresses (lowercase)
 */
export async function getConnectedAddressesByFid(fid: string | number): Promise<string[]> {
  console.log('[Neynar] ===== Starting getConnectedAddressesByFid =====');
  console.log('[Neynar] Input FID:', fid);
  
  try {
    const client = getNeynarClient();
    if (!client) {
      console.warn('[Neynar] ⚠️ Client not available, returning empty array');
      return [];
    }

    const fidNumber = typeof fid === 'string' ? parseInt(fid, 10) : fid;
    if (isNaN(fidNumber)) {
      console.error('[Neynar] ❌ Invalid FID:', fid);
      return [];
    }

    console.log('[Neynar] 📡 Fetching user by FID:', fidNumber);
    console.log('[Neynar] Making API call to Neynar...');
    
    const { users } = await client.fetchBulkUsers({ fids: [fidNumber] });
    
    console.log('[Neynar] ✅ API call successful, received response');
    
    if (!users) {
      console.warn('[Neynar] No users returned in response');
      return [];
    }

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
  } catch (error: any) {
    // Force output to stderr to ensure visibility
    console.error('\n[Neynar] ========== ERROR ==========');
    console.error('[Neynar] ❌ Error fetching connected addresses');
    console.error('[Neynar] Error type:', error?.constructor?.name || typeof error);
    console.error('[Neynar] Error message:', error?.message || 'No message');
    
    // Provide more detailed error information
    if (error?.response) {
      console.error('[Neynar] Response status:', error.response.status);
      console.error('[Neynar] Response statusText:', error.response.statusText);
      
      if (error.response.status === 401) {
        console.error('\n[Neynar] 🔐 Authentication failed (401). Please check:');
        console.error('[Neynar]   1. NEYNAR_API_KEY is set in your environment variables');
        console.error('[Neynar]   2. The API key is valid and not expired');
        console.error('[Neynar]   3. The API key has the correct permissions');
        console.error('[Neynar]   4. There are no extra spaces or quotes around the API key');
        
        // Check if API key is actually set
        const apiKey = config.neynar.apiKey;
        if (!apiKey) {
          console.error('[Neynar] ⚠️ API key is empty or not loaded from environment');
        } else {
          console.error(`[Neynar] ✅ API key is set (length: ${apiKey.length} chars)`);
          console.error(`[Neynar] API key preview: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
        }
        
        if (error.response.data) {
          const errorData = error.response.data;
          console.error('[Neynar] Error response data:', JSON.stringify(errorData, null, 2));
          
          // Check for specific error messages
          if (errorData.message === 'Subscription expired') {
            console.error('\n[Neynar] ⚠️  SUBSCRIPTION EXPIRED');
            console.error('[Neynar] Your Neynar API subscription has expired.');
            console.error('[Neynar] Please renew your subscription at: https://neynar.com/');
            console.error('[Neynar] The app will continue to work, but connected addresses');
            console.error('[Neynar] will not be fetched from Neynar until the subscription is renewed.\n');
          }
        }
      } else if (error.response.status) {
        console.error(`[Neynar] HTTP Error ${error.response.status}:`, error.response.statusText);
        if (error.response.data) {
          console.error('[Neynar] Error details:', JSON.stringify(error.response.data, null, 2));
        }
      }
    } else {
      console.error('[Neynar] Full error object:', error);
    }
    
    console.error('[Neynar] ============================\n');
    
    return [];
  }
}
