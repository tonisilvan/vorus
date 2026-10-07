# Vorus - Shopping Cart Website (vorus.es)

Una web de carrito de compras moderna y responsive construida con Next.js, TypeScript y Tailwind CSS.

## 🚀 Características

- **Catálogo de productos** con búsqueda y filtrado por categorías
- **Carrito de compras** funcional con gestión de cantidades
- **Diseño responsive** que funciona en todos los dispositivos
- **Interfaz moderna** con Tailwind CSS y componentes reutilizables
- **SEO optimizado** con Next.js App Router
- **TypeScript** para mejor experiencia de desarrollo
- **Firebase ready** para base de datos y autenticación

## 🛠️ Tecnologías

- **Next.js 16** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS utility-first
- **Lucide React** - Iconos modernos
- **Radix UI** - Componentes accesibles
- **Firebase** - Base de datos y autenticación (configurable)

## 📦 Estructura del Proyecto

```
src/
├── app/                 # Páginas y layouts (App Router)
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes UI base
│   ├── ProductCard.tsx # Tarjeta de producto
│   └── ShoppingCart.tsx # Modal del carrito
├── data/               # Datos de ejemplo
├── lib/                # Utilidades y configuración
├── types/              # Definiciones de TypeScript
└── ...                 # Otros archivos
```

## 🚀 Getting Started

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar Firebase (opcional):**
```bash
# Copiar .env.local.example a .env.local
# Añadir tus credenciales de Firebase
```

3. **Iniciar servidor de desarrollo:**
```bash
npm run dev
```

4. **Abrir en navegador:**
```
http://localhost:3000
```

## 📝 Productos de Ejemplo

El proyecto incluye 6 productos de ejemplo que puedes fácilmente reemplazar con tus productos del PDF:

1. Producto Premium 1 - €299.99
2. Producto Estándar 2 - €149.99
3. Producto Profesional 3 - €599.99
4. Producto Compacto 4 - €89.99
5. Producto Deluxe 5 - €899.99
6. Producto Básico 6 - €49.99

## 🔧 Personalización

### Añadir tus productos:

Usa el panel de administración en `/admin` (requiere `ADMIN_PASSWORD`). Los cambios
se guardan en **Vercel Blob** en producción (crea un Blob store en el dashboard de
Vercel y conéctalo al proyecto — la variable `BLOB_READ_WRITE_TOKEN` se configura
automáticamente). En desarrollo local, sin token, se escribe directamente en
`src/data/products.json`.

### Pedidos:

El checkout registra cada pedido vía `POST /api/orders`. Los importes se
recalculan siempre en el servidor desde el catálogo (el precio del cliente se
ignora). Los pedidos se persisten en **Vercel Blob** (`orders/`) en producción y
en `src/data/orders.json` en desarrollo.

Desde `/admin` → pestaña **Pedidos** se listan los pedidos con detalle
(productos, cliente, dirección) y se puede cambiar su estado
(pendiente → en proceso → enviado → completado / cancelado) o eliminarlos.

También puedes editar `src/data/products.json` a mano como catálogo inicial/seed:

```typescript
{
  id: 'tu-producto-id',
  name: 'Nombre del Producto',
  description: 'Descripción detallada',
  price: 99.99,
  currency: 'EUR',
  images: ['url-de-imagen-1', 'url-de-imagen-2'],
  category: 'Categoría',
  stock: 10,
  featured: true,
  sku: 'SKU-001',
  // ... otros campos
}
```

### Configurar Firebase:

1. Crea un proyecto en Firebase Console
2. Copia las credenciales en `.env.local`
3. Las funciones de Firebase ya están configuradas en `src/lib/firebase.ts`

## 🎨 Diseño y UX

- **Interfaz limpia y moderna**
- **Animaciones suaves** en hover y transiciones
- **Notificaciones visuales** para stock bajo y productos destacados
- **Responsive design** para móviles, tablets y desktop
- **Accesibilidad** con componentes Radix UI

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
