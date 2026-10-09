import Link from 'next/link';
import type { CategoryInfo } from '@/lib/categories';
import type { Product } from '@/types/product';

interface SiteFooterProps {
  categories?: CategoryInfo[];
  products?: Product[];
}

export function SiteFooter({ categories = [], products = [] }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="section-shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="wordmark" href="/" aria-label="Vorus, inicio">VOR<span>U</span>S</Link>
            <p>Diseño exclusivo y calidad premium para hacer mejor cada día. Una selección cuidada por Vorus.</p>
          </div>
          <div className="footer-column">
            <h2>Explora</h2>
            <Link href="/#coleccion">Colección completa</Link>
            {categories.map(category => (
              <Link key={category.slug} href={`/categoria/${category.slug}`}>{category.name}</Link>
            ))}
            {products.slice(0, 4).map(product => (
              <Link key={product.id} href={`/producto/${product.slug}`}>{product.name.split(' ').slice(0, 3).join(' ')}</Link>
            ))}
          </div>
          <div className="footer-column">
            <h2>Información</h2>
            <Link href="/guias">Guías y consejos</Link>
            <a href="/aviso-legal">Aviso legal</a>
            <Link href="/devoluciones">Envíos y devoluciones</Link>
            <a href="/aviso-legal">Privacidad y condiciones</a>
          </div>
          <div className="footer-column">
            <h2>Hablemos</h2>
            <Link href="/contacto">Atención al cliente</Link>
            <a href="mailto:info@suministrospayne.com">info@suministrospayne.com</a>
            <p>Gijón · Asturias · España</p>
          </div>
        </div>
        <div className="footer-bottom"><span>© 2026 Vorus · Suministros Payne, SLU · CIF B42782300</span><span>Precios con IVA incluido · Envío gratuito Península y Portugal</span></div>
      </div>
    </footer>
  );
}
