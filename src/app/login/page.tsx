'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogIn } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/mi-cuenta';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo iniciar sesión');
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <div className="checkout-state section-shell">
      <div className="w-full max-w-md space-y-6 text-left">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Volver a la tienda
        </Link>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Iniciar sesión</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Accede a tu cuenta para ver tus pedidos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="commerce-panel p-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">Email *</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">Contraseña *</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
          )}

          <Button type="submit" className="w-full h-12 gap-2" disabled={loading}>
            <LogIn className="h-4 w-4" />
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center">
          ¿No tienes cuenta?{' '}
          <Link href={`/registro?next=${encodeURIComponent(next)}`} className="underline text-primary font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
