// ENS Domain types
export interface EnsDomain {
  id: string;
  name: string;
  labelName: string;
  expiryDate: number;
  owner: string;
  daysLeft: number;
  status: 'active' | 'expired' | 'expiring-soon' | 'expiring-very-soon';
  isWrapped: boolean;
}

// ENS Status based on days left
export type EnsStatus = 'safe' | 'warning' | 'danger';

// GraphQL response types from The Graph
export interface GraphDomain {
  id: string;
  name: string;
  labelName: string;
  expiryDate: string;
  owner: {
    id: string;
  };
}

export interface GraphResponse {
  domains: GraphDomain[];
}

// Contract interaction types
export interface ContractDomainData {
  name: string;
  expiryDate: number;
  owner: string;
  isWrapped: boolean;
}
