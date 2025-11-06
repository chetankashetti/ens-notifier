'use client';

import { useContext } from 'react';
import { FarcasterContext } from '@/components/FarcasterSDKProvider';

export function useFarcaster() {
  return useContext(FarcasterContext);
}


