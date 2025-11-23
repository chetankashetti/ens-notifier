'use client';

import { useState } from 'react';
import { useEnsData } from '@/hooks/useEnsData';
import { formatExpiryDate, getStatusColor } from '@/lib/ens/lookup';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { SubscribeModal } from '@/components/SubscribeModal';
import { toast } from 'sonner';

interface EnsTableProps {
  address: string;
}

export function EnsTable({ address }: EnsTableProps) {
  const { data: domains, isLoading, error } = useEnsData(address);
  const [subscribeModal, setSubscribeModal] = useState<{
    isOpen: boolean;
    ensName: string;
    expiryDate: number;
  }>({
    isOpen: false,
    ensName: '',
    expiryDate: 0,
  });

  const handleSubscribe = (ensName: string, expiryDate: number) => {
    setSubscribeModal({
      isOpen: true,
      ensName,
      expiryDate,
    });
  };

  const handleRenew = (ensName: string) => {
    window.open(`https://app.ens.domains/name/${ensName}/register`, '_blank');
  };

  const handleSubscribeSuccess = () => {
    // Could refresh data here if needed
    toast.success('Subscription updated successfully');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your ENS Domains</CardTitle>
          <CardDescription>Loading your domains...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Domains</CardTitle>
          <CardDescription>There was an error fetching your ENS domains</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!domains || domains.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No ENS Domains Found</CardTitle>
          <CardDescription>This wallet doesn't own any ENS domains</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm">
            ENS domains will appear here once they are discovered for this wallet address.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your ENS Domains ({domains.length})</CardTitle>
          <CardDescription>
            Monitor expiry dates and get notified before domains expire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <span>{domain.name}</span>
                        {domain.type === 'basename' ? (
                          <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                            Basename
                          </Badge>
                        ) : domain.isWrapped && (
                          <Badge variant="outline" className="text-xs">
                            Wrapped
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatExpiryDate(domain.expiryDate)}</TableCell>
                    <TableCell>
                      <span className={domain.daysLeft < 0 ? 'text-red-600' : ''}>
                        {domain.daysLeft < 0 ? 'Expired' : `${domain.daysLeft} days`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(domain.status)}>
                        {domain.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSubscribe(domain.name, domain.expiryDate)}
                        >
                          Notify Me
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRenew(domain.name)}
                        >
                          Renew
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <SubscribeModal
        isOpen={subscribeModal.isOpen}
        onClose={() => setSubscribeModal({ isOpen: false, ensName: '', expiryDate: 0 })}
        ensName={subscribeModal.ensName}
        expiryDate={subscribeModal.expiryDate}
        walletAddress={address}
        onSubscribe={handleSubscribeSuccess}
      />
    </>
  );
}
