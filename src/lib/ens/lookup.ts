import { createPublicClient, http, parseAbi } from 'viem';
import { mainnet } from 'viem/chains';
import { keccak256, toHex } from 'viem';
import { ENS_CONTRACTS, BASE_REGISTRAR_ABI, NAME_WRAPPER_ABI } from './contracts';
import { fetchDomainsFromGraph } from './graph';
import { EnsDomain, ContractDomainData } from '@/types/ens';

// Create viem client for mainnet
const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

// Calculate days left until expiry
function calculateDaysLeft(expiryTimestamp: number): number {
  const now = Math.floor(Date.now() / 1000);
  const daysLeft = Math.floor((expiryTimestamp - now) / (24 * 60 * 60));
  return daysLeft;
}

// Determine status based on days left
function getStatus(daysLeft: number): EnsDomain['status'] {
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 7) return 'expiring-very-soon';
  if (daysLeft <= 30) return 'expiring-soon';
  return 'active';
}

// Get expiry date from contract
async function getExpiryFromContract(labelHash: string, isWrapped: boolean = false): Promise<number> {
  try {
    if (isWrapped) {
      // For wrapped domains, use NameWrapper contract
      const data = await client.readContract({
        address: ENS_CONTRACTS.NAME_WRAPPER as `0x${string}`,
        abi: NAME_WRAPPER_ABI,
        functionName: 'getData',
        args: [BigInt(labelHash)],
      });
      
      // NameWrapper returns expiry as uint64
      return Number(data[2]); // expiry is the third element
    } else {
      // For regular .eth domains, use Base Registrar
      const expiry = await client.readContract({
        address: ENS_CONTRACTS.BASE_REGISTRAR as `0x${string}`,
        abi: BASE_REGISTRAR_ABI,
        functionName: 'nameExpires',
        args: [BigInt(labelHash)],
      });
      
      return Number(expiry);
    }
  } catch (error) {
    console.error(`Error fetching expiry for labelHash ${labelHash}:`, error);
    throw error;
  }
}

// Convert label name to label hash (keccak256)
function labelToHash(label: string): string {
  return keccak256(toHex(label));
}

// Main function to get ENS domains for an address
export async function getEnsDomains(address: string): Promise<EnsDomain[]> {
  try {
    // 1. Fetch domains from The Graph
    const graphDomains = await fetchDomainsFromGraph(address);
    
    if (graphDomains.length === 0) {
      return [];
    }

    // 2. Process each domain and get on-chain expiry data
    const processedDomains: EnsDomain[] = [];
    
    for (const domain of graphDomains) {
      try {
        // Skip if no labelName (shouldn't happen but safety check)
        if (!domain.labelName) continue;
        
        // Check if domain is wrapped by checking owner
        const isWrapped = domain.owner.id.toLowerCase() === ENS_CONTRACTS.NAME_WRAPPER.toLowerCase();
        
        // Get expiry from contract
        const labelHash = labelToHash(domain.labelName);
        const expiryTimestamp = await getExpiryFromContract(labelHash, isWrapped);
        
        // Calculate days left
        const daysLeft = calculateDaysLeft(expiryTimestamp);
        
        // Create domain object
        const ensDomain: EnsDomain = {
          id: domain.id,
          name: domain.name,
          labelName: domain.labelName,
          expiryDate: expiryTimestamp,
          owner: domain.owner.id,
          daysLeft,
          status: getStatus(daysLeft),
          isWrapped,
        };
        
        processedDomains.push(ensDomain);
      } catch (error) {
        console.error(`Error processing domain ${domain.name}:`, error);
        // Continue with other domains even if one fails
      }
    }
    
    // 3. Sort by expiry date (soonest first)
    processedDomains.sort((a, b) => a.expiryDate - b.expiryDate);
    
    return processedDomains;
  } catch (error) {
    console.error('Error in getEnsDomains:', error);
    throw new Error('Failed to fetch ENS domains');
  }
}

// Utility function to format expiry date
export function formatExpiryDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Utility function to get status color class
export function getStatusColor(status: EnsDomain['status']): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'expiring-soon':
      return 'bg-yellow-100 text-yellow-800';
    case 'expiring-very-soon':
    case 'expired':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
