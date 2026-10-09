import { Truck } from 'lucide-react';

/**
 * Sello circular con texto giratorio: "Envío gratis · IVA incluido".
 * Se superpone al hero como un sello/tampon visual.
 */
export function ShippingSeal() {
  return (
    <div className="shipping-seal" role="img" aria-label="Envío gratuito e IVA incluido en todos los pedidos">
      <svg viewBox="0 0 120 120" className="shipping-seal-text" aria-hidden="true">
        <defs>
          <path
            id="shipping-seal-circle"
            d="M 60,60 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0"
            fill="none"
          />
        </defs>
        <text>
          <textPath href="#shipping-seal-circle">
            ENVÍO GRATIS · IVA INCLUIDO · ENVÍO GRATIS · IVA INCLUIDO ·
          </textPath>
        </text>
      </svg>
      <span className="shipping-seal-center">
        <Truck size={30} strokeWidth={1.8} />
      </span>
    </div>
  );
}
