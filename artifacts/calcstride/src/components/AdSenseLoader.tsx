import { useEffect } from 'react';
import { ADSENSE_PRODUCTION_HOSTS, disableAdvertisingProvider } from '@/lib/adsense';

export function AdSenseLoader({ eligible = true }: { eligible?: boolean }) {
  useEffect(() => {
    const approvedHost = ADSENSE_PRODUCTION_HOSTS.includes(
      window.location.hostname.toLowerCase() as (typeof ADSENSE_PRODUCTION_HOSTS)[number],
    );
    if (!eligible || !approvedHost) disableAdvertisingProvider();
  }, [eligible]);

  return null;
}