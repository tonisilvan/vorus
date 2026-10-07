'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import { PublicUser } from '@/types/user';

/**
 * Icono de cuenta en la cabecera: muestra "Entrar" sin sesión o
 * "Mi cuenta" cuando el cliente está autenticado.
 */
export function AuthMenu() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => setUser(data?.user ?? null))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return null;

  if (!user) {
    return (
      <Link href="/login" className="cart-trigger" aria-label="Iniciar sesión">
        <User size={15} />
        <span>Entrar</span>
      </Link>
    );
  }

  return (
    <Link href="/mi-cuenta" className="cart-trigger" aria-label="Ir a mi cuenta">
      <User size={15} />
      <span>{user.nombre.split(' ')[0]}</span>
    </Link>
  );
}
