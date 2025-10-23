'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnsTable } from '@/components/EnsTable';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function AddressVerifier() {
  const [address, setAddress] = useState('');
  const [verifiedAddress, setVerifiedAddress] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Basic Ethereum address validation
  const isValidEthereumAddress = (addr: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const handleVerify = async () => {
    if (!address.trim()) return;
    
    setIsLoading(true);
    setIsValid(null);
    
    // Validate address format
    const valid = isValidEthereumAddress(address.trim());
    setIsValid(valid);
    
    if (valid) {
      setVerifiedAddress(address.trim());
    }
    
    setIsLoading(false);
  };

  const handleClear = () => {
    setAddress('');
    setVerifiedAddress(null);
    setIsValid(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🔍 Address Verifier</span>
            <Badge variant="outline" className="text-xs">
              Testing Tool
            </Badge>
          </CardTitle>
          <CardDescription>
            Enter any Ethereum address to discover and verify ENS domains
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
            />
            <Button 
              onClick={handleVerify} 
              disabled={isLoading || !address.trim()}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClear}
              disabled={isLoading}
            >
              Clear
            </Button>
          </div>
          
          <div className="text-xs text-gray-500">
            <p className="mb-2">Try these example addresses:</p>
            <div className="space-y-1">
              <button 
                onClick={() => setAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')}
                className="block text-blue-600 hover:text-blue-800 underline"
              >
                Vitalik Buterin (35+ domains)
              </button>
              <button 
                onClick={() => setAddress('0x983110309620D911731Ac0932219af06091b6744')}
                className="block text-blue-600 hover:text-blue-800 underline"
              >
                ENS Foundation (10+ domains)
              </button>
              <button 
                onClick={() => setAddress('0x1234567890123456789012345678901234567890')}
                className="block text-blue-600 hover:text-blue-800 underline"
              >
                Test Address (no domains)
              </button>
            </div>
          </div>
          
          {isValid !== null && (
            <div className="flex items-center space-x-2">
              {isValid ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    Valid Ethereum address format
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">
                    Invalid address format. Please enter a valid Ethereum address (0x...)
                  </span>
                </>
              )}
            </div>
          )}
          
          {verifiedAddress && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Verified Address:</strong> {verifiedAddress}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                ENS domains for this address will be displayed below
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {verifiedAddress && (
        <EnsTable address={verifiedAddress} />
      )}
    </div>
  );
}
