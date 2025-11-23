'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatExpiryDate } from '@/lib/ens/lookup';
import { toast } from 'sonner';
import { sdk } from '@farcaster/miniapp-sdk';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ensName: string;
  expiryDate: number;
  walletAddress: string;
  onSubscribe: () => void;
  type: 'ens' | 'basename';
}

export function SubscribeModal({
  isOpen,
  onClose,
  ensName,
  expiryDate,
  walletAddress,
  onSubscribe,
  type,
}: SubscribeModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fid, setFid] = useState<string | null>(null);

  // Get Farcaster FID if available
  useEffect(() => {
    const getFid = async () => {
      try {
        const context = await sdk.context;
        if (context.user?.fid) {
          setFid(context.user.fid.toString());
        }
      } catch (error) {
        // Not in Farcaster environment or SDK not available
        console.log('Not in Farcaster Mini App environment');
      }
    };

    if (isOpen) {
      getFid();
    }
  }, [isOpen]);

  const handleSubscribe = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          ensName,
          expiryDate: new Date(expiryDate * 1000).toISOString(),
          email: email.trim(),
          fid: fid, // Include Farcaster FID if available
          type, // Pass domain type to API
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Successfully subscribed to notifications for ${ensName}`);
        onSubscribe();
        onClose();
        setEmail('');
      } else {
        toast.error(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setEmail('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Subscribe to Notifications</span>
            <Badge variant="outline" className="text-xs">
              {ensName}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Get email reminders before your {type === 'basename' ? 'Basename' : 'ENS domain'} expires
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Domain:</span>
                <span className="font-medium">{ensName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Expiry Date:</span>
                <span className="font-medium">{formatExpiryDate(expiryDate)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              We'll send you reminders 30, 15, and 7 days before expiry
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubscribe} disabled={isLoading}>
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
