'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [web, setWeb] = useState(''); // honeypot anti-spam
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, mensaje, web }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar el mensaje');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje');
    } finally {
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
          <h1 className="text-3xl font-bold tracking-tight">Contacto</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ¿Dudas sobre un producto o tu pedido? Escríbenos y te respondemos por email.
          </p>
        </div>

        {sent ? (
          <div className="commerce-panel p-6 space-y-4 text-center">
            <CheckCircle className="h-10 w-10 mx-auto text-primary" />
            <p className="font-medium">Mensaje enviado</p>
            <p className="text-sm text-muted-foreground">
              Gracias, {nombre}. Te responderemos lo antes posible a {email}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="commerce-panel p-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="nombre" className="text-sm font-medium">Nombre *</label>
              <input
                id="nombre"
                type="text"
                required
                maxLength={100}
                autoComplete="name"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
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
              <label htmlFor="mensaje" className="text-sm font-medium">Mensaje *</label>
              <textarea
                id="mensaje"
                required
                rows={5}
                maxLength={5000}
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
              />
            </div>

            {/* Honeypot: invisible para humanos, los bots lo rellenan */}
            <input
              type="text"
              name="web"
              value={web}
              onChange={e => setWeb(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
            )}

            <Button type="submit" className="w-full h-12 gap-2" disabled={loading}>
              <Send className="h-4 w-4" />
              {loading ? 'Enviando...' : 'Enviar mensaje'}
            </Button>
          </form>
        )}

        <p className="text-sm text-muted-foreground text-center">
          También puedes escribirnos a{' '}
          <a href="mailto:info@suministrospayne.com" className="underline text-primary font-medium">
            info@suministrospayne.com
          </a>
        </p>
      </div>
    </div>
  );
}
