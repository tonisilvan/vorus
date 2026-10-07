'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/mi-cuenta';

  const [form, setForm] = useState({ nombre: '', apellidos: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo crear la cuenta');
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50';

  return (
    <div className="checkout-state section-shell">
      <div className="w-full max-w-md space-y-6 text-left">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Volver a la tienda
        </Link>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear cuenta</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Guarda tus pedidos y recibe avisos por email cuando cambien de estado.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="commerce-panel p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="nombre" className="text-sm font-medium">Nombre *</label>
              <input id="nombre" name="nombre" required autoComplete="given-name" value={form.nombre} onChange={handleChange} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="apellidos" className="text-sm font-medium">Apellidos *</label>
              <input id="apellidos" name="apellidos" required autoComplete="family-name" value={form.apellidos} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">Email *</label>
            <input id="email" name="email" type="email" required autoComplete="email" value={form.email} onChange={handleChange} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">Contraseña *</label>
            <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={handleChange} className={inputClass} />
            <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
          )}

          <Button type="submit" className="w-full h-12 gap-2" disabled={loading}>
            <UserPlus className="h-4 w-4" />
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center">
          ¿Ya tienes cuenta?{' '}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="underline text-primary font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
