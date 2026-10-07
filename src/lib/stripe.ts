import Stripe from 'stripe';

let client: Stripe | null = null;

/** Devuelve el cliente de Stripe o null si no está configurado. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!client) client = new Stripe(key);
  return client;
}
