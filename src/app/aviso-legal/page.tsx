import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aviso Legal',
  description: 'Aviso legal, condiciones de uso y datos identificativos de Vorus.',
};

export default function AvisoLegalPage() {
  return (
    <div className="legal-page section-shell">
      <h1 className="text-3xl font-bold">Aviso Legal</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Titularidad</h2>
        <p className="text-muted-foreground">
          En cumplimiento de las obligaciones establecidas en el artículo 10 de la Ley 34/2002, de 11 de julio, 
          de Servicios de la Sociedad de la Información y Comercio Electrónico, se hace constar que esta página 
          (vorus.es, nombre comercial Vorus) corresponde a la entidad:
        </p>
        <div className="legal-details">
          <p><strong>Razón social:</strong> SUMINISTROS PAYNE, SLU</p>
          <p><strong>CIF:</strong> B42782300</p>
          <p><strong>Domicilio:</strong> Avda. de la Agricultura, 26 Nave 6 – Polígono Bankunión II, 33211 Gijón (Asturias), España</p>
          <p><strong>Teléfono:</strong> (+34) 985 052 099 / (+34) 673 792 977</p>
          <p><strong>Nombre comercial:</strong> Vorus</p>
          <p><strong>Email:</strong> info@vorus.es</p>
          <p><strong>Web:</strong> www.vorus.es</p>
          <p><strong>Registro Mercantil:</strong> Oviedo, Tomo 4426, Folio 138, Hoja 57311</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Condiciones de uso</h2>
        <p className="text-muted-foreground">
          El acceso y/o uso de este portal atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, 
          las Condiciones Generales de Uso aquí reflejadas. Las citadas Condiciones serán de aplicación independientemente 
          de las Condiciones Generales de Contratación que en su caso resulten de obligado cumplimiento.
        </p>
        <p className="text-muted-foreground">
          El USUARIO se compromete a hacer un uso adecuado de los contenidos y servicios que SUMINISTROS PAYNE, SLU 
          ofrece a través de su portal y, con carácter enunciativo pero no limitativo, a no emplearlos para incurrir 
          en actividades ilícitas, ilegales o contrarias a la buena fe y al orden público.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Propiedad intelectual e industrial</h2>
        <p className="text-muted-foreground">
          SUMINISTROS PAYNE, SLU, por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual 
          e industrial de su página web, así como de los elementos contenidos en la misma (imágenes, sonido, audio, 
          vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, selección de 
          materiales usados, programas de ordenador necesarios para su funcionamiento, acceso y uso, etc.).
        </p>
        <p className="text-muted-foreground">
          Quedan expresamente prohibidas la reproducción, la distribución y la comunicación pública, incluida su 
          modalidad de puesta a disposición, de la totalidad o parte de los contenidos de esta página web, con fines 
          comerciales, en cualquier soporte y por cualquier medio técnico, sin la autorización de SUMINISTROS PAYNE, SLU.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Exclusión de garantías y responsabilidad</h2>
        <p className="text-muted-foreground">
          SUMINISTROS PAYNE, SLU no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier 
          naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, falta de 
          disponibilidad del portal o la transmisión de virus o programas maliciosos o lesivos en los contenidos, 
          a pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Seguridad</h2>
        <p className="text-muted-foreground">
          El sitio web utiliza técnicas de seguridad de la información generalmente aceptadas en la industria, tales 
          como firewalls, procedimientos de control de acceso y mecanismos criptográficos, todo ello con el objeto de 
          evitar el acceso no autorizado a los datos. Todo proceso de contratación o que conlleve la introducción de 
          datos personales será siempre transmitido mediante protocolo de comunicación segura (HTTPS).
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Legislación aplicable y jurisdicción</h2>
        <p className="text-muted-foreground">
          La relación entre SUMINISTROS PAYNE, SLU y el USUARIO se regirá por la normativa española vigente y 
          cualquier controversia se someterá a los Juzgados y Tribunales que corresponda.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Política de devoluciones</h2>
        <p className="text-muted-foreground">
          El usuario dispone de un plazo de 14 días naturales desde la recepción del producto para ejercer su derecho 
          de desistimiento, conforme a lo establecido en el Real Decreto Legislativo 1/2007, de 16 de noviembre. 
          El producto deberá devolverse en su embalaje original y en perfecto estado. Los gastos de devolución correrán 
          a cargo del cliente, salvo que el producto sea defectuoso o no se corresponda con lo solicitado.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Envíos</h2>
        <p className="text-muted-foreground">
          Envío gratuito a Península española y Portugal peninsular. Para otros destinos (Baleares, Canarias, Ceuta, 
          Melilla y otros países), consultar condiciones antes de confirmar el pedido. Plazo de entrega estimado: 
          24-72 horas laborables para envíos peninsulares.
        </p>
      </section>

      <p className="text-xs text-muted-foreground pt-8 border-t">
        Última actualización: mayo 2025
      </p>
    </div>
  );
}
