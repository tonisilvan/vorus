'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ExternalLink, Eye, Monitor, Smartphone, Tablet } from 'lucide-react';

interface VisitStats {
  total: number;
  today: number;
  last7: number;
  last30: number;
  perDay: { date: string; count: number }[];
  topPages: { key: string; count: number }[];
  topReferrers: { key: string; count: number }[];
  countries: { key: string; count: number }[];
  devices: { key: string; count: number }[];
  utmCampaigns: { key: string; count: number }[];
  recent: { ts: string; path: string; referrer: string; country?: string; device: string }[];
}

const DEVICE_ICONS: Record<string, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Ranking({ title, items }: { title: string; items: { key: string; count: number }[] }) {
  const max = items[0]?.count ?? 1;
  return (
    <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-5 shadow-sm">
      <h3 className="font-semibold text-sm mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
      ) : (
        <ul className="space-y-2">
          {items.map(i => (
            <li key={i.key} className="text-sm">
              <div className="flex justify-between gap-2">
                <span className="truncate">{i.key}</span>
                <span className="text-muted-foreground tabular-nums">{i.count}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full mt-1">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(i.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function VisitsSection() {
  const router = useRouter();
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/visits', { cache: 'no-store' });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar visitas');
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar visitas');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const maxDay = Math.max(1, ...(stats?.perDay.map(d => d.count) ?? [1]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Visitas</h2>
          <p className="text-sm text-muted-foreground">
            Trackeo propio de pageviews (se guardan hasta 10.000)
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Recargar
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {loading && !stats ? (
        <div className="p-12 text-center text-muted-foreground bg-white dark:bg-zinc-900 border rounded-2xl">
          Cargando visitas...
        </div>
      ) : stats ? (
        <>
          {/* Tarjetas resumen */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Hoy', value: stats.today },
              { label: 'Últimos 7 días', value: stats.last7 },
              { label: 'Últimos 30 días', value: stats.last30 },
              { label: 'Total registrado', value: stats.total },
            ].map(c => (
              <div
                key={c.label}
                className="bg-white dark:bg-zinc-900 border rounded-2xl p-5 shadow-sm"
              >
                <p className="text-3xl font-bold tabular-nums">{c.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Gráfico últimos 14 días */}
          <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-sm mb-4">Visitas por día (últimos 14 días)</h3>
            <div className="flex items-end gap-1.5 h-28">
              {stats.perDay.map(d => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <span className="text-[10px] text-muted-foreground tabular-nums">{d.count}</span>
                  <div
                    className="w-full bg-primary/80 rounded-t-sm"
                    style={{ height: `${Math.max(2, (d.count / maxDay) * 72)}px` }}
                    title={`${d.date}: ${d.count} visitas`}
                  />
                  <span className="text-[9px] text-muted-foreground tabular-nums">
                    {d.date.slice(8)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Ranking title="Páginas más visitadas" items={stats.topPages} />
            <Ranking title="De dónde vienen (referrer)" items={stats.topReferrers} />
            <Ranking title="Países" items={stats.countries} />
            <Ranking title="Campañas (utm_campaign)" items={stats.utmCampaigns} />
          </div>

          {/* Dispositivos */}
          <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-sm mb-3">Dispositivos</h3>
            <div className="flex gap-3 flex-wrap">
              {stats.devices.map(d => {
                const Icon = DEVICE_ICONS[d.key] ?? Monitor;
                return (
                  <Badge key={d.key} variant="secondary" className="gap-1.5 px-3 py-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    {d.key} · {d.count}
                  </Badge>
                );
              })}
              {stats.devices.length === 0 && (
                <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
              )}
            </div>
          </div>

          {/* Últimas visitas */}
          <div className="bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden shadow-sm">
            <h3 className="font-semibold text-sm px-5 pt-5 pb-3">Últimas visitas</h3>
            {stats.recent.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-muted-foreground">Sin visitas registradas aún.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="px-4 py-2 font-medium">Hora</th>
                      <th className="px-4 py-2 font-medium">Página</th>
                      <th className="px-4 py-2 font-medium hidden sm:table-cell">Origen</th>
                      <th className="px-4 py-2 font-medium hidden md:table-cell">País</th>
                      <th className="px-4 py-2 font-medium hidden lg:table-cell">Dispositivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {stats.recent.map((v, i) => {
                      const Icon = DEVICE_ICONS[v.device] ?? Monitor;
                      return (
                        <tr key={i} className="hover:bg-muted/30">
                          <td className="px-4 py-2 text-muted-foreground whitespace-nowrap tabular-nums">
                            {formatTime(v.ts)}
                          </td>
                          <td className="px-4 py-2 font-mono text-xs truncate max-w-[280px]">
                            {v.path}
                          </td>
                          <td className="px-4 py-2 hidden sm:table-cell text-muted-foreground truncate max-w-[160px]">
                            {v.referrer}
                          </td>
                          <td className="px-4 py-2 hidden md:table-cell text-muted-foreground">
                            {v.country ?? '—'}
                          </td>
                          <td className="px-4 py-2 hidden lg:table-cell text-muted-foreground">
                            <Icon className="h-4 w-4" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Para mapas de calor, grabaciones de sesión y embudos completos, el sitio ya tiene{' '}
            <a
              href="https://clarity.microsoft.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary inline-flex items-center gap-1"
            >
              Microsoft Clarity <ExternalLink className="h-3 w-3" />
            </a>{' '}
            y{' '}
            <a
              href="https://analytics.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary inline-flex items-center gap-1"
            >
              Google Analytics <ExternalLink className="h-3 w-3" />
            </a>{' '}
            instalados — ahí está el detalle de clics por elemento.
          </p>
        </>
      ) : null}
    </div>
  );
}
