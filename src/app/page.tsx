'use client';

import { ProductCarousel } from '@/components/ProductCarousel';
import { products } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { ShoppingCart as ShoppingCartIcon, Zap, Truck, Shield, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';

const baseUrl = 'https://vorus.es';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'Vorus',
      url: baseUrl,
      logo: `${baseUrl}/images/powerbank-principal-cable.webp`,
    },
    {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: 'Vorus',
      publisher: { '@id': `${baseUrl}/#organization` },
    },
    {
      '@type': 'ItemList',
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${baseUrl}/producto/${product.slug}`,
        name: product.name,
      })),
    },
  ],
};

export default function Home() {
  const { addItem, openCart, cartCount } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 md:h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              <span className="text-primary">VORUS</span>
            </h1>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 relative"
            onClick={openCart}
          >
            <ShoppingCartIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Carrito</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-purple-600/10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djJoLTR2LTJoNHptMC0yMHYyaC00di0yaDR6bS0yMCAyMHYyaC00di0yaDR6bTAtMjB2MmgtNHYtMmg0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative px-4 py-16 md:py-24 lg:py-32 max-w-7xl mx-auto text-center">
          <div className="space-y-6 max-w-3xl mx-auto">
            <h2 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              Tecnología y estilo
              <span className="hero-subtitle block gradient-text">
                para tu día a día
              </span>
            </h2>
            <p className="hero-description text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              Descubre nuestra selección de productos cuidadosamente elegidos: electrónica, hogar y accesorios con la mejor relación calidad-precio.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <div className="hero-feature flex items-center gap-2 text-zinc-300">
                <Truck className="hero-icon h-5 w-5 text-green-400" />
                <span className="text-sm">Envío gratuito</span>
              </div>
              <div className="hero-feature flex items-center gap-2 text-zinc-300">
                <Shield className="hero-icon h-5 w-5 text-blue-400" />
                <span className="text-sm">Garantía incluida</span>
              </div>
              <div className="hero-feature flex items-center gap-2 text-zinc-300">
                <Zap className="hero-icon h-5 w-5 text-yellow-400" />
                <span className="text-sm">Entrega rápida</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 px-4">
            <h2 className="text-2xl md:text-3xl font-bold">Nuestros Productos</h2>
            <p className="text-muted-foreground mt-2">Desliza para explorar toda nuestra gama</p>
          </div>

          <ProductCarousel products={products} onAddToCart={addItem} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-muted/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3 p-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30">
                <Truck className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg">Envío Gratuito</h3>
              <p className="text-sm text-muted-foreground">
                Envío gratis a Península española y Portugal peninsular en todos los pedidos.
              </p>
            </div>
            <div className="text-center space-y-3 p-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Shield className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg">Compra Segura</h3>
              <p className="text-sm text-muted-foreground">
                Todos nuestros productos cuentan con garantía y protección al comprador.
              </p>
            </div>
            <div className="text-center space-y-3 p-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Headphones className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg">Atención al Cliente</h3>
              <p className="text-sm text-muted-foreground">
                Estamos disponibles para resolver tus dudas antes y después de la compra.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="font-semibold">
            <span className="text-primary">VORUS</span>
          </p>
          <p className="text-sm text-muted-foreground">
            © 2026 Vorus · Suministros Payne, SLU · CIF: B42782300 · Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Precios con IVA incluido · Envío gratuito Península y Portugal
          </p>
          <p className="text-xs text-muted-foreground space-x-2">
            <a href="/aviso-legal" className="underline hover:text-primary transition-colors">Aviso Legal</a>
            <span>·</span>
            <a href="mailto:info@vorus.es" className="underline hover:text-primary transition-colors">Contacto</a>
          </p>
        </div>
      </footer>

    </div>
  );
}
