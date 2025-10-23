'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { config } from '@/lib/config';

export function Header() {
  const { login, logout, authenticated, user } = usePrivy();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              ENS Expiry Notifier
            </h1>
            <Badge variant="secondary" className="text-xs">
              MVP
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            {!config.privy.appId ? (
              <div className="text-sm text-gray-500">
                Configure Privy App ID to enable wallet connection
              </div>
            ) : authenticated && user?.wallet?.address ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  Welcome, {formatAddress(user.wallet.address)}
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={login}>
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
