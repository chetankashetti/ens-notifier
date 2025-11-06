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
      console.log('[Farcaster SDK] ✅ Mini App detected - SDK ready() successful');
      setIsMiniApp(true);
    } catch (err) {
      // Not in Farcaster environment
      console.log('[Farcaster SDK] ❌ Not in Farcaster environment:', err);
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
        if (fetchedFid) {
          console.log('[Farcaster SDK] ✅ FID fetched via actions.getFid():', fetchedFid);
        }
      } catch (err) {
        console.log('[Farcaster SDK] ⚠️ actions.getFid() failed:', err);
      }
      if (!fetchedFid) {
        try {
          // @ts-expect-error - alternate API surface
          const user = await sdk?.context?.user?.get?.();
          fetchedFid = user?.fid?.toString();
          if (fetchedFid) {
            console.log('[Farcaster SDK] ✅ FID fetched via context.user.get():', fetchedFid);
          }
        } catch (err) {
          console.log('[Farcaster SDK] ⚠️ context.user.get() failed:', err);
        }
      }
      if (fetchedFid) {
        setFid(fetchedFid);
        console.log('[Farcaster SDK] ✅ Authenticated with FID:', fetchedFid);
      } else {
        console.log('[Farcaster SDK] ⚠️ No FID found - user may not be authenticated');
      }

      // Attempt to fetch connected wallets
      let fetchedWallets: string[] | undefined = undefined;
      try {
        // @ts-expect-error - hypothetical API
        fetchedWallets = await sdk?.actions?.getConnectedWallets?.();
        if (Array.isArray(fetchedWallets) && fetchedWallets.length > 0) {
          console.log('[Farcaster SDK] ✅ Wallets fetched via actions.getConnectedWallets():', fetchedWallets);
        }
      } catch (err) {
        console.log('[Farcaster SDK] ⚠️ actions.getConnectedWallets() failed:', err);
      }
      if (!Array.isArray(fetchedWallets)) {
        try {
          // @ts-expect-error - alternate API shape
          const res = await sdk?.context?.wallets?.get?.();
          if (Array.isArray(res)) {
            fetchedWallets = res as string[];
            console.log('[Farcaster SDK] ✅ Wallets fetched via context.wallets.get() (array):', fetchedWallets);
          } else if (Array.isArray(res?.wallets)) {
            fetchedWallets = res.wallets as string[];
            console.log('[Farcaster SDK] ✅ Wallets fetched via context.wallets.get() (object):', fetchedWallets);
          }
        } catch (err) {
          console.log('[Farcaster SDK] ⚠️ context.wallets.get() failed:', err);
        }
      }
      // If nothing returned, proactively request in preview/client
      if (!Array.isArray(fetchedWallets) || fetchedWallets.length === 0) {
        console.log('[Farcaster SDK] ⚠️ No wallets found, attempting to request...');
        try {
          // @ts-expect-error - request API may exist
          const req = await sdk?.context?.wallets?.request?.();
          if (Array.isArray(req)) {
            fetchedWallets = req as string[];
            console.log('[Farcaster SDK] ✅ Wallets requested via context.wallets.request() (array):', fetchedWallets);
          } else if (Array.isArray(req?.wallets)) {
            fetchedWallets = req.wallets as string[];
            console.log('[Farcaster SDK] ✅ Wallets requested via context.wallets.request() (object):', fetchedWallets);
          }
        } catch (err) {
          console.log('[Farcaster SDK] ⚠️ context.wallets.request() failed:', err);
        }
        if (!Array.isArray(fetchedWallets) || fetchedWallets.length === 0) {
          try {
            // @ts-expect-error - alternate request action
            const req2 = await sdk?.actions?.requestWallets?.();
            if (Array.isArray(req2)) {
              fetchedWallets = req2 as string[];
              console.log('[Farcaster SDK] ✅ Wallets requested via actions.requestWallets() (array):', fetchedWallets);
            } else if (Array.isArray(req2?.wallets)) {
              fetchedWallets = req2.wallets as string[];
              console.log('[Farcaster SDK] ✅ Wallets requested via actions.requestWallets() (object):', fetchedWallets);
            }
          } catch (err) {
            console.log('[Farcaster SDK] ⚠️ actions.requestWallets() failed:', err);
          }
        }
      }
      if (Array.isArray(fetchedWallets) && fetchedWallets.length > 0) {
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
    // Subscribe to wallet changes if supported
    // @ts-expect-error - optional event API surface
    const unsubscribe = sdk?.context?.wallets?.onChange?.((next: unknown) => {
      try {
        console.log('[Farcaster SDK] 🔔 Wallet change event received:', next);
        const arr = Array.isArray(next)
          ? (next as unknown[])
          : Array.isArray((next as any)?.wallets)
          ? ((next as any).wallets as unknown[])
          : [];
        if (arr.length > 0) {
          const normalizedWallets = Array.from(new Set(arr.map((w) => String(w).toLowerCase())));
          setWallets(normalizedWallets);
          console.log('[Farcaster SDK] ✅ Wallets updated from onChange event:', normalizedWallets);
        }
      } catch (err) {
        console.error('[Farcaster SDK] ❌ Error handling wallet change event:', err);
      }
    });
    if (unsubscribe) {
      console.log('[Farcaster SDK] ✅ Subscribed to wallet change events');
    }
    return () => {
      try {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
          console.log('[Farcaster SDK] 🔌 Unsubscribed from wallet change events');
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
