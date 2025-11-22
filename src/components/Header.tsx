'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { config } from '@/lib/config';
import { useFarcaster } from '@/hooks/useFarcasterWallets';

export function Header() {
  const { login, logout, authenticated, user } = usePrivy();
  const { isMiniApp, fid } = useFarcaster();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              KeepENS
            </h1>
            {isMiniApp && (
              <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                Mini App{fid ? ` · ${String(fid).slice(0, 6)}` : ''}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isMiniApp ? (
              // Minimal header for Mini App - wallet is handled by context
              null
            ) : !config.privy.appId ? (
              <div className="text-sm text-gray-500 text-center sm:text-left">
                Configure Privy App ID
              </div>
            ) : authenticated && user?.wallet?.address ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600 hidden sm:block">
                  {formatAddress(user.wallet.address)}
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={login} className="w-full sm:w-auto">
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
