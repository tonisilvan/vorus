'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Registra cada cambio de página en /api/track. Silencioso: nunca interfiere
 * con la navegación. No trackea /admin ni /api.
 */
export function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    const query = searchParams.toString();
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        path: query ? `${pathname}?${query}` : pathname,
        referrer: document.referrer,
        utmSource: searchParams.get('utm_source') ?? undefined,
        utmMedium: searchParams.get('utm_medium') ?? undefined,
        utmCampaign: searchParams.get('utm_campaign') ?? undefined,
      }),
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
