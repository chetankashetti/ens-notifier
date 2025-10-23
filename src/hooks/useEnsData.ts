import { useQuery } from '@tanstack/react-query';
import { getEnsDomains } from '@/lib/ens/lookup';
import { EnsDomain } from '@/types/ens';

export function useEnsData(address: string | undefined) {
  return useQuery<EnsDomain[], Error>({
    queryKey: ['ens-domains', address],
    queryFn: () => getEnsDomains(address!),
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
