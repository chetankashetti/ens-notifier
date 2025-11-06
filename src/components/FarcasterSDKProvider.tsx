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
    try {
      // Indicates Mini App environment and hides splash when ready
      await sdk.actions.ready();
      setIsMiniApp(true);
    } catch (err) {
      // Not in Farcaster environment
      setIsMiniApp(false);
      return;
    }

    // Best-effort: fetch fid and connected wallets; tolerate SDK differences
    try {
      // Attempt common identity retrievals
      let fetchedFid: string | undefined = undefined;
      try {
        // @ts-expect-error - SDK typings may vary
        fetchedFid = await sdk?.actions?.getFid?.();
      } catch {}
      if (!fetchedFid) {
        try {
          // @ts-expect-error - alternate API surface
          const user = await sdk?.context?.user?.get?.();
          fetchedFid = user?.fid?.toString();
        } catch {}
      }
      if (fetchedFid) setFid(fetchedFid);

      // Attempt to fetch connected wallets
      let fetchedWallets: string[] | undefined = undefined;
      try {
        // @ts-expect-error - hypothetical API
        fetchedWallets = await sdk?.actions?.getConnectedWallets?.();
      } catch {}
      if (!Array.isArray(fetchedWallets)) {
        try {
          // @ts-expect-error - alternate API shape
          const res = await sdk?.context?.wallets?.get?.();
          if (Array.isArray(res)) {
            fetchedWallets = res as string[];
          } else if (Array.isArray(res?.wallets)) {
            fetchedWallets = res.wallets as string[];
          }
        } catch {}
      }
      if (Array.isArray(fetchedWallets)) {
        // Normalize to lowercase; checksum will be applied by consumers if needed
        setWallets(Array.from(new Set(fetchedWallets.map((w) => String(w).toLowerCase()))));
      }
    } catch (error) {
      // Swallow errors to avoid breaking web app path
      // Keep defaults: fid undefined, wallets []
    }
  }, []);

  useEffect(() => {
    void initializeSDK();
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
