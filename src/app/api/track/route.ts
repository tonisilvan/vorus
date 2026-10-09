import { NextRequest, NextResponse } from 'next/server';
import { recordVisit } from '@/lib/admin-store';
import { Visit } from '@/types/visit';

export const dynamic = 'force-dynamic';

const BLOCKED_PREFIXES = ['/admin', '/api', '/_next', '/favicon', '/icon', '/apple-icon', '/robots', '/sitemap'];

function detectDevice(ua: string): Visit['device'] {
  const s = ua.toLowerCase();
  if (/ipad|tablet/.test(s)) return 'tablet';
  if (/mobi|iphone|ipod|android/.test(s)) return 'mobile';
  return 'desktop';
}

/**
 * Tracking público de pageviews. Best-effort: los errores devuelven ok para
 * no alertar a bots ni romper la navegación.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const path = String(body?.path ?? '').slice(0, 300);
    if (!path.startsWith('/') || BLOCKED_PREFIXES.some(p => path.startsWith(p))) {
      return NextResponse.json({ ok: true });
    }

    let refHost = '';
    try {
      const ref = String(body?.referrer ?? '').slice(0, 300);
      refHost = ref ? new URL(ref).host : '';
    } catch {}
    if (refHost === request.headers.get('host')) refHost = ''; // tráfico interno

    await recordVisit({
      ts: new Date().toISOString(),
      path,
      referrer: refHost || 'directo',
      ...(body?.utmSource && { utmSource: String(body.utmSource).slice(0, 100) }),
      ...(body?.utmMedium && { utmMedium: String(body.utmMedium).slice(0, 100) }),
      ...(body?.utmCampaign && { utmCampaign: String(body.utmCampaign).slice(0, 100) }),
      ...(request.headers.get('x-vercel-ip-country')
        ? { country: request.headers.get('x-vercel-ip-country')! }
        : {}),
      device: detectDevice(request.headers.get('user-agent') ?? ''),
    });
  } catch {
    // Tracking nunca rompe
  }
  return NextResponse.json({ ok: true });
}
