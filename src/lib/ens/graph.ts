import { GraphQLClient } from 'graphql-request';
import { GraphResponse, GraphDomain } from '@/types/ens';

const GRAPH_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/ensdomains/ens';

const client = new GraphQLClient(GRAPH_ENDPOINT);

// GraphQL query to fetch domains owned by an address
const GET_DOMAINS_QUERY = `
  query GetDomains($owner: String!) {
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

export async function fetchDomainsFromGraph(ownerAddress: string): Promise<GraphDomain[]> {
  try {
    const response = await client.request<GraphResponse>(GET_DOMAINS_QUERY, {
      owner: ownerAddress.toLowerCase(),
    });
    
    return response.domains || [];
  } catch (error) {
    console.error('Error fetching domains from The Graph:', error);
    throw new Error('Failed to fetch ENS domains from The Graph');
  }
}
