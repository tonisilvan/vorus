export interface Visit {
  /** ISO timestamp */
  ts: string;
  /** Ruta visitada, p.ej. /producto/power-bank */
  path: string;
  /** Host de origen o 'directo' */
  referrer: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  /** ISO country code (x-vercel-ip-country) */
  country?: string;
  device: 'mobile' | 'tablet' | 'desktop';
}
