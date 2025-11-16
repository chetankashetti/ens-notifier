'use client';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

type FarcasterContextValue = {
  isMiniApp: boolean;
  fid?: string;
  wallets: string[];
};

export const FarcasterContext = createContext<FarcasterContextValue>({
  isMiniApp: false,
  fid: undefined,
  wallets: [],
});

export function FarcasterSDKProvider({ children }: { children: React.ReactNode }) {
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [fid, setFid] = useState<string | undefined>(undefined);
  const [wallets, setWallets] = useState<string[]>([]);

  const initializeSDK = useCallback(async () => {
    // Mock mode for local development/testing
    const MOCK_MODE = 
      typeof window !== 'undefined' && 
      (window.location.search.includes('mock=true') || 
       process.env.NEXT_PUBLIC_MOCK_FARCASTER === 'true');
    
    if (MOCK_MODE) {
      console.log('[Farcaster SDK] 🧪 Mock mode enabled for local testing');
      setIsMiniApp(true);
      // Use mock FID and addresses from URL params or defaults
      const urlParams = new URLSearchParams(window.location.search);
      const mockFid = urlParams.get('mockFid') || '1234';
      const mockAddresses = urlParams.get('mockAddresses')?.split(',') || [
        '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', // vitalik.eth
      ];
      
      setFid(mockFid);
      setWallets(mockAddresses.map(addr => addr.toLowerCase().trim()));
      console.log('[Farcaster SDK] 🧪 Mock data set - FID:', mockFid, 'Addresses:', mockAddresses);
      return;
    }

    try {
      // Indicates Mini App environment and hides splash when ready
      await sdk.actions.ready();
      console.log('[Farcaster SDK] ✅ Mini App detected - SDK ready() successful');
      setIsMiniApp(true);
    } catch (err) {
      // Not in Farcaster environment
      console.log('[Farcaster SDK] ❌ Not in Farcaster environment:', err);
      setIsMiniApp(false);
      return;
    }

    // Fetch fid and connected wallets using the correct SDK API
    try {
      // Get FID from context
      let fetchedFid: string | undefined = undefined;
      try {
        const context = await sdk.context;
        fetchedFid = context.user.fid.toString();
        if (fetchedFid) {
          console.log('[Farcaster SDK] ✅ FID fetched from context:', fetchedFid);
          setFid(fetchedFid);
        }
      } catch (err) {
        console.log('[Farcaster SDK] ⚠️ Failed to get FID from context:', err);
      }

      // Fetch connected addresses from Neynar API using FID
      let fetchedWallets: string[] = [];
      if (fetchedFid) {
        try {
          console.log('[Farcaster SDK] Fetching connected addresses from Neynar for FID:', fetchedFid);
          const response = await fetch(`/api/farcaster/connected-addresses?fid=${fetchedFid}`);
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data.addresses) && data.addresses.length > 0) {
              fetchedWallets = data.addresses;
              console.log('[Farcaster SDK] ✅ Connected addresses fetched from Neynar:', fetchedWallets);
            } else {
              console.log('[Farcaster SDK] ⚠️ No connected addresses found for FID:', fetchedFid);
            }
          } else {
            console.error('[Farcaster SDK] ⚠️ Failed to fetch connected addresses:', response.statusText);
          }
        } catch (err) {
          console.error('[Farcaster SDK] ⚠️ Error fetching connected addresses from Neynar:', err);
        }
      }

      // Fallback: Try to get wallets from Ethereum provider if Neynar didn't return any
      if (fetchedWallets.length === 0) {
        console.log('[Farcaster SDK] No addresses from Neynar, trying Ethereum provider as fallback...');
        try {
          // Try to get the Ethereum provider
          const provider = await sdk.wallet.getEthereumProvider();
          if (provider) {
            // Request accounts from the provider
            try {
              const accounts = await provider.request({ method: 'eth_requestAccounts' });
              if (Array.isArray(accounts) && accounts.length > 0) {
                fetchedWallets = accounts as string[];
                console.log('[Farcaster SDK] ✅ Wallets fetched via eth_requestAccounts:', fetchedWallets);
              }
            } catch (err) {
              // If request fails, try eth_accounts (doesn't require user approval)
              console.log('[Farcaster SDK] ⚠️ eth_requestAccounts failed, trying eth_accounts:', err);
              try {
                const accounts = await provider.request({ method: 'eth_accounts' });
                if (Array.isArray(accounts) && accounts.length > 0) {
                  fetchedWallets = accounts as string[];
                  console.log('[Farcaster SDK] ✅ Wallets fetched via eth_accounts:', fetchedWallets);
                }
              } catch (err2) {
                console.log('[Farcaster SDK] ⚠️ eth_accounts also failed:', err2);
              }
            }
          } else {
            console.log('[Farcaster SDK] ⚠️ No Ethereum provider available');
          }
        } catch (err) {
          console.log('[Farcaster SDK] ⚠️ Failed to get Ethereum provider:', err);
        }

        // If no wallets found via provider, try the direct ethProvider property
        if (fetchedWallets.length === 0) {
          try {
            const provider = sdk.wallet.ethProvider;
            if (provider) {
              try {
                const accounts = await provider.request({ method: 'eth_requestAccounts' });
                if (Array.isArray(accounts) && accounts.length > 0) {
                  fetchedWallets = accounts as string[];
                  console.log('[Farcaster SDK] ✅ Wallets fetched via ethProvider.eth_requestAccounts:', fetchedWallets);
                }
              } catch (err) {
                try {
                  const accounts = await provider.request({ method: 'eth_accounts' });
                  if (Array.isArray(accounts) && accounts.length > 0) {
                    fetchedWallets = accounts as string[];
                    console.log('[Farcaster SDK] ✅ Wallets fetched via ethProvider.eth_accounts:', fetchedWallets);
                  }
                } catch (err2) {
                  console.log('[Farcaster SDK] ⚠️ ethProvider methods failed:', err2);
                }
              }
            }
          } catch (err) {
            console.log('[Farcaster SDK] ⚠️ Failed to access ethProvider:', err);
          }
        }
      }

      if (fetchedWallets.length > 0) {
        // Normalize to lowercase; checksum will be applied by consumers if needed
        const normalizedWallets = Array.from(new Set(fetchedWallets.map((w) => String(w).toLowerCase())));
        setWallets(normalizedWallets);
        console.log('[Farcaster SDK] ✅ Wallets set:', normalizedWallets);
      } else {
        console.log('[Farcaster SDK] ⚠️ No wallets available');
      }
    } catch (error) {
      // Swallow errors to avoid breaking web app path
      console.error('[Farcaster SDK] ❌ Error during initialization:', error);
      // Keep defaults: fid undefined, wallets []
    }
  }, []);

  useEffect(() => {
    void initializeSDK();
    
    // Subscribe to wallet/account changes via Ethereum provider
    let provider: any = null;
    let accountChangeHandler: ((accounts: string[]) => void) | null = null;
    let isMounted = true;
    
    const setupWalletListener = async () => {
      try {
        provider = await sdk.wallet.getEthereumProvider();
        if (!provider && sdk.wallet.ethProvider) {
          provider = sdk.wallet.ethProvider;
        }
        
        if (provider && typeof provider.on === 'function' && isMounted) {
          accountChangeHandler = (accounts: string[]) => {
            if (!isMounted) return;
            try {
              console.log('[Farcaster SDK] 🔔 Account change event received:', accounts);
              if (Array.isArray(accounts) && accounts.length > 0) {
                const normalizedWallets = Array.from(new Set(accounts.map((w) => String(w).toLowerCase())));
                setWallets(normalizedWallets);
                console.log('[Farcaster SDK] ✅ Wallets updated from account change event:', normalizedWallets);
              } else {
                setWallets([]);
                console.log('[Farcaster SDK] ⚠️ No accounts in change event');
              }
            } catch (err) {
              console.error('[Farcaster SDK] ❌ Error handling account change event:', err);
            }
          };
          
          provider.on('accountsChanged', accountChangeHandler);
          console.log('[Farcaster SDK] ✅ Subscribed to account change events');
        }
      } catch (err) {
        console.log('[Farcaster SDK] ⚠️ Failed to setup wallet listener:', err);
      }
    };
    
    void setupWalletListener();
    
    return () => {
      isMounted = false;
      try {
        if (provider && accountChangeHandler && typeof provider.removeListener === 'function') {
          provider.removeListener('accountsChanged', accountChangeHandler);
          console.log('[Farcaster SDK] 🔌 Unsubscribed from account change events');
        }
      } catch {}
    };
  }, [initializeSDK]);

  const value = useMemo<FarcasterContextValue>(() => ({
    isMiniApp,
    fid,
    wallets,
  }), [isMiniApp, fid, wallets]);

  return (
    <FarcasterContext.Provider value={value}>
      {children}
    </FarcasterContext.Provider>
  );
}
