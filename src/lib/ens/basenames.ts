import { GraphQLClient } from 'graphql-request';
import { GraphDomain } from '@/types/ens';

const ENSNODE_ENDPOINT = 'https://api.alpha.ensnode.io/subgraph';

const client = new GraphQLClient(ENSNODE_ENDPOINT);

const GET_BASENAMES_QUERY = `
  query GetBasenames($owner: String!) {
    domains(where: { owner: $owner, name_ends_with: ".base.eth" }) {
      id
      name
      labelName
      expiryDate
      owner {
        id
      }
    }
  }
`;

// Fallback query if name_ends_with is not supported
const GET_ALL_DOMAINS_QUERY = `
  query GetAllDomains($owner: String!) {
    domains(where: { owner: $owner }) {
      id
      name
      labelName
      expiryDate
      owner {
        id
      }
    }
  }
`;

export async function fetchBasenamesFromGraph(ownerAddress: string): Promise<GraphDomain[]> {
    try {
        // Try to fetch all domains and filter client-side since name_ends_with might not be standard
        const response = await client.request<{ domains: GraphDomain[] }>(GET_ALL_DOMAINS_QUERY, {
            owner: ownerAddress.toLowerCase(),
        });

        // Filter for .base.eth
        return (response.domains || []).filter(domain => domain.name.endsWith('.base.eth'));
    } catch (error) {
        console.error('Error fetching Basenames:', error);
        // Return empty array instead of throwing to avoid breaking the whole app
        return [];
    }
}
