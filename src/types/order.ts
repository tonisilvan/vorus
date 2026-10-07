export interface OrderCustomer {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
}

export interface OrderShipping {
  direccion: string;
  codigoPostal: string;
  ciudad: string;
  provincia: string;
  pais: string;
  notas?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | 'pendiente'
  | 'en_proceso'
  | 'enviado'
  | 'completado'
  | 'cancelado';

export const ORDER_STATUSES: OrderStatus[] = [
  'pendiente',
  'en_proceso',
  'enviado',
  'completado',
  'cancelado',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  enviado: 'Enviado',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

export interface Order {
  id: string;
  /** Id del usuario registrado, si el pedido se hizo con sesión iniciada */
  userId?: string;
  customer: OrderCustomer;
  shipping: OrderShipping;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  /** Pago con Stripe: true cuando el webhook confirma el pago */
  paid?: boolean;
  paidAt?: string;
  stripeSessionId?: string;
  createdAt: string;
  updatedAt: string;
}
