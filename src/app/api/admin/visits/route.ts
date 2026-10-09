import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getVisitsData } from '@/lib/admin-store';
import { Visit } from '@/types/visit';

export const dynamic = 'force-dynamic';

function dayKey(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD (UTC)
}

function topN(visits: Visit[], pick: (v: Visit) => string | undefined, n: number) {
  const counts = new Map<string, number>();
  for (const v of visits) {
    const k = pick(v);
    if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, count]) => ({ key, count }));
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { visits } = await getVisitsData();
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const last7 = visits.filter(v => now - new Date(v.ts).getTime() < 7 * DAY);
  const last30 = visits.filter(v => now - new Date(v.ts).getTime() < 30 * DAY);

  // Serie diaria últimos 14 días (UTC)
  const perDay: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * DAY).toISOString().slice(0, 10);
    perDay.push({ date: d, count: 0 });
  }
  const dayIndex = new Map(perDay.map((d, i) => [d.date, i]));
  for (const v of visits) {
    const i = dayIndex.get(dayKey(v.ts));
    if (i !== undefined) perDay[i].count++;
  }

  return NextResponse.json({
    total: visits.length,
    today: visits.filter(v => dayKey(v.ts) === new Date(now).toISOString().slice(0, 10)).length,
    last7: last7.length,
    last30: last30.length,
    perDay,
    topPages: topN(visits, v => v.path.split('?')[0], 10),
    topReferrers: topN(visits, v => v.referrer, 10),
    countries: topN(visits, v => v.country, 10),
    devices: topN(visits, v => v.device, 3),
    utmCampaigns: topN(visits, v => v.utmCampaign, 10),
    recent: visits.slice(-25).reverse(),
  });
}
