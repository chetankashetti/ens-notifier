// ENS Contract addresses and ABIs
export const ENS_CONTRACTS = {
  // Base Registrar Contract (for .eth domains)
  BASE_REGISTRAR: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
  
  // ETH Registrar Controller (for registration/renewal)
  ETH_REGISTRAR_CONTROLLER: '0x253553366Da8546fC250F225fe3d25d0C782303b',
  
  // NameWrapper Contract (for wrapped domains)
  NAME_WRAPPER: '0x114D4603199df73c7d5987874E719Ac643735B6',
  
  // ENS Registry
  ENS_REGISTRY: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
} as const;

// Base Registrar ABI - minimal functions we need
export const BASE_REGISTRAR_ABI = [
  {
    inputs: [{ name: 'id', type: 'uint256' }],
    name: 'nameExpires',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'id', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// NameWrapper ABI - for wrapped domains
export const NAME_WRAPPER_ABI = [
  {
    inputs: [{ name: 'id', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'id', type: 'uint256' }],
    name: 'getData',
    outputs: [
      { name: 'owner', type: 'address' },
      { name: 'fuses', type: 'uint96' },
      { name: 'expiry', type: 'uint64' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
