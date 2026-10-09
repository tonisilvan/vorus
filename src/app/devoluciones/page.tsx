import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de devoluciones',
  description: 'Devoluciones en Vorus: 14 días naturales de desistimiento, proceso de devolución y reembolso. Envío de devolución gratuito si el producto es defectuoso.',
};

export default function DevolucionesPage() {
  return (
    <div className="legal-page section-shell">
      <h1 className="text-3xl font-bold">Política de devoluciones</h1>
      <p className="text-muted-foreground">
        En Vorus queremos que compres con total tranquilidad. Si un producto no cumple tus expectativas,
        puedes devolverlo dentro de los <strong>14 días naturales</strong> siguientes a su recepción.
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Derecho de desistimiento</h2>
        <p className="text-muted-foreground">
          Conforme al Real Decreto Legislativo 1/2007, de 16 de noviembre (LGDCU), dispones de 14 días
          naturales desde la entrega del pedido para desistir de la compra sin necesidad de justificar
          el motivo. El producto debe devolverse en su embalaje original, completo y en perfecto estado.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Cómo solicitar una devolución</h2>
        <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
          <li>
            Escríbenos a <a href="mailto:info@suministrospayne.com" className="underline">info@suministrospayne.com</a> o
            desde nuestra página de <Link href="/contacto" className="underline">contacto</Link> indicando tu número
            de pedido y el motivo de la devolución.
          </li>
          <li>Te enviaremos las instrucciones y la dirección de devolución en un plazo máximo de 24-48 h laborables.</li>
          <li>Envía el producto en su embalaje original, con todos los accesorios incluidos.</li>
          <li>
            En cuanto recibamos y revisemos el producto, te reembolsaremos el importe por el mismo medio de pago
            utilizado en la compra, en un plazo máximo de 14 días.
          </li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Gastos de devolución</h2>
        <p className="text-muted-foreground">
          En devoluciones por desistimiento, los gastos de envío de la devolución corren a cargo del cliente.
          Si el producto es <strong>defectuoso, ha llegado dañado o no se corresponde con lo solicitado</strong>,
          nosotros asumimos íntegramente el coste de la devolución y te enviaremos una etiqueta prepagada.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Productos defectuosos o incorrectos</h2>
        <p className="text-muted-foreground">
          Si recibes un producto defectuoso, dañado durante el transporte o distinto al pedido, contacta con
          nosotros lo antes posible. Podrás elegir entre la sustitución del producto o el reembolso completo,
          incluidos los gastos de envío, sin coste alguno para ti.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Estado del producto devuelto</h2>
        <p className="text-muted-foreground">
          Para aceptar la devolución el producto debe estar en perfecto estado: sin signos de uso, con su
          embalaje original, accesorios y documentación. Nos reservamos el derecho de rechazar devoluciones
          de productos que no cumplan estas condiciones.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Contacto</h2>
        <p className="text-muted-foreground">
          ¿Dudas sobre tu devolución? Escríbenos a{' '}
          <a href="mailto:info@suministrospayne.com" className="underline">info@suministrospayne.com</a>{' '}
          o llámanos al (+34) 985 052 099. Respondemos en menos de 24-48 h laborables.
        </p>
      </section>

      <p className="text-xs text-muted-foreground pt-8 border-t">
        Última actualización: octubre 2026
      </p>
    </div>
  );
}
