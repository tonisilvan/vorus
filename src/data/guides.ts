export interface GuideSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  image?: { url: string; alt: string };
  intro: string;
  sections: GuideSection[];
  /** Slugs de productos relacionados que se muestran al final de la guía. */
  relatedProductSlugs: string[];
}

export const guides: Guide[] = [
  {
    slug: 'como-limpiar-teclado-ordenador',
    title: 'Cómo limpiar el teclado y el ordenador sin dañarlos',
    description:
      'Guía paso a paso para eliminar el polvo del teclado, las rejillas y el interior del PC con aire, sin abrir el equipo ni usar líquidos.',
    publishedAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    image: {
      url: '/images/aspirador-principal.webp',
      alt: 'Aspirador y soplador 2 en 1 para limpiar ordenadores y teclados',
    },
    intro:
      'El polvo es el enemigo silencioso de cualquier equipo: obstruye ventiladores, degrada el teclado y acaba provocando sobrecalentamiento. La buena noticia es que con un soplado y aspirado regulares puedes alargar la vida del ordenador sin herramientas ni desmontaje.',
    sections: [
      {
        heading: 'Por qué el polvo es un problema real',
        paragraphs: [
          'El polvo se acumula en las rejillas de ventilación, entre las teclas y sobre los componentes. Con el tiempo actúa como una manta térmica: el ventilador trabaja más, el equipo hace más ruido y el rendimiento cae por las temperaturas.',
          'En teclados y periféricos, migas y partículas acaban debajo de las teclas y provocan pulsaciones fallidas o botones que se quedan pegados.',
        ],
      },
      {
        heading: 'Qué usar (y qué evitar)',
        paragraphs: [
          'La opción clásica son las latas de aire comprimido, pero son de un solo uso, caras a la larga y enfrían el aire al salir, lo que puede generar condensación si se usan de cerca. Una alternativa reutilizable es un soplador de aire eléctrico, que da chorro continuo sin consumibles.',
          'Un aspirador portátil de pequeño tamaño complementa al soplador: en lugar de esparcir el polvo por la habitación, lo recoge directamente.',
        ],
        bullets: [
          'Evita paños húmedos o sprays directos sobre el equipo.',
          'No uses aspiradores domésticos potentes en contacto directo con componentes.',
          'Apaga y desenchufa siempre el equipo antes de limpiarlo.',
        ],
      },
      {
        heading: 'Paso a paso: teclado',
        paragraphs: [
          'Con el equipo apagado, inclina el teclado y sopla aire a baja velocidad entre las filas de teclas, de arriba abajo. Las partículas sueltas saldrán solas. Después pasa el aspirador con boquilla estrecha para recoger lo que queda.',
          'Para migas incrustadas, repite el soplado a velocidad media manteniendo la boquilla a 2–3 cm. No introduzcas objetos metálicos entre las teclas.',
        ],
      },
      {
        heading: 'Paso a paso: torre y portátil',
        paragraphs: [
          'Sopla las rejillas de ventilación desde fuera hacia dentro solo si puedes abrir el equipo; si no, sopla desde fuera y aspira lo que salga por las rejillas. Sujeta las aspas del ventilador con el dedo para que no giren en exceso con el chorro.',
          'Una limpieza cada 2–3 meses suele ser suficiente en entornos normales; si tienes mascotas o alfombras, mejor una vez al mes.',
        ],
      },
      {
        heading: 'La herramienta que usamos',
        paragraphs: [
          'Para esta rutina usamos un aspirador y soplador 2 en 1 recargable: sopla aire a tres velocidades (60.000, 80.000 y 100.000 rpm) y aspira con las boquillas estrechas incluidas. Con unos 50 minutos de autonomía y carga en unas 2 horas, cubre la limpieza completa de varios equipos.',
        ],
      },
    ],
    relatedProductSlugs: ['aspirador-soplador-2-en-1-recargable'],
  },
  {
    slug: 'que-power-bank-llevar-en-avion',
    title: 'Qué power bank puedes llevar en el avión (normativa y consejos)',
    description:
      'Límites de mAh y Wh permitidos en cabina, por qué no va en la maleta facturada y cómo elegir una batería externa para viajar.',
    publishedAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    image: {
      url: '/images/powerbank-principal-cable.webp',
      alt: 'Power bank de 10.000 mAh apta para llevar en cabina',
    },
    intro:
      'Si vas a volar, tu power bank viaja contigo en cabina o no viaja: las baterías de litio están prohibidas en la maleta facturada. Aquí van las reglas que aplican las aerolíneas (IATA) y cómo elegir la capacidad adecuada.',
    sections: [
      {
        heading: 'La regla de oro: cabina, nunca bodega',
        paragraphs: [
          'Las baterías externas de litio deben ir en el equipaje de mano. En bodega están prohibidas porque, en caso de incidente térmico, la tripulación no podría acceder a ellas.',
        ],
      },
      {
        heading: 'Cuánta capacidad está permitida',
        paragraphs: [
          'El límite se mide en vatios-hora (Wh), no en mAh. Como referencia práctica:',
        ],
        bullets: [
          'Hasta 100 Wh: permitido sin autorización (equivale a unos 27.000 mAh a 3,7 V).',
          'Entre 100 y 160 Wh: permitido con autorización de la aerolínea, máximo 2 unidades.',
          'Más de 160 Wh: prohibido en avión de pasajeros.',
        ],
      },
      {
        heading: 'La conversión rápida de mAh a Wh',
        paragraphs: [
          'Wh = (mAh ÷ 1000) × voltaje interno (normalmente 3,7 V). Una batería de 10.000 mAh equivale a unos 37 Wh: muy por debajo del límite de 100 Wh, así que puedes llevarla sin trámites y hasta varias unidades.',
        ],
      },
      {
        heading: 'Consejos para viajar con power bank',
        paragraphs: [
          'Llévala identificada (que se vean los mAh en la carcasa), protegida de golpes y con los puertos cubiertos. Durante el vuelo, muchas aerolíneas permiten usarla pero no recargarla en los enchufes del asiento; sigue las indicaciones de la tripulación.',
          'Si usas el móvil para mapas, fotos y tarjeta de embarque, un power bank de 10.000 mAh te da de 2 a 3 cargas completas: más que suficiente para un día largo de viaje sin llevarte peso extra.',
        ],
      },
      {
        heading: 'Nuestra recomendación',
        paragraphs: [
          'Para viajar nos quedamos con capacidad media y carga variada: el Power Bank Vorus de 10.000 mAh (unos 37 Wh) entra sin problema en cabina, carga varios dispositivos por cable y también de forma inalámbrica, y sus ventosas permiten sujetarlo al móvil mientras lo usas en el trayecto.',
        ],
      },
    ],
    relatedProductSlugs: ['power-bank-vorus-10000-mah', 'estacion-carga-inalambrica-4-en-1'],
  },
  {
    slug: 'como-elegir-juego-te-ceramica',
    title: 'Cómo elegir un juego de té de cerámica (y qué revisar antes de comprar)',
    description:
      'Piezas que debe incluir, materiales, capacidad de la tetera y cuidados para que un juego de té de cerámica te dure años.',
    publishedAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    image: {
      url: '/images/te-principal.webp',
      alt: 'Juego de té de cerámica en blanco y negro con bandeja de madera',
    },
    intro:
      'Un juego de té bien elegido convierte un té de diario en un pequeño ritual. Pero entre tanta variedad conviene saber qué mirar: número de piezas, capacidad real, materiales y cuidados. Esto es lo que revisamos antes de recomendar uno.',
    sections: [
      {
        heading: 'Qué piezas debe incluir',
        paragraphs: [
          'El conjunto mínimo razonable es tetera + tazas. Una bandeja de madera o bambú marca la diferencia en la presentación: permite llevar el servicio completo a la mesa de una vez y protege la superficie del calor.',
          'Los juegos de 6 piezas (tetera, 4 tazas y bandeja) son el punto dulce para uso doméstico: suficientes para invitados sin ocupar demasiado espacio.',
        ],
      },
      {
        heading: 'Capacidad: el dato que casi nadie mira',
        paragraphs: [
          'Comprueba la capacidad de la tetera, no solo el número de tazas. Una tetera de unos 1.200 ml (40 oz) rinde para 4–5 tazas completas; teteras más pequeñas obligan a rellenar en mitad de la sobremesa.',
          'Las tazas de 180–200 ml son el tamaño estándar de servicio; más pequeñas quedan bien en foto pero resultan escasas en la mesa.',
        ],
      },
      {
        heading: 'Material y acabado',
        paragraphs: [
          'La cerámica es el clásico por algo: retiene bien el calor, no transmite sabores y aguanta décadas si se cuida. Los acabados marmoleados o bicolor combinan mejor en mesas modernas que los estampados intensos.',
          'Fíjate también en el asa: un asa superior tipo bambú da agarre firme y no se calienta al servir, a diferencia de las asas laterales metálicas.',
        ],
      },
      {
        heading: 'Cuidados que alargan su vida',
        paragraphs: [
          'Lava la tetera y la bandeja a mano: los lavavajillas agrietan esmaltes y resecan la madera. No uses el conjunto en microondas ni sobre fuego directo: la cerámica decorativa no está pensada para calentar, sino para servir.',
        ],
      },
      {
        heading: 'Si buscas uno para regalar (o para ti)',
        paragraphs: [
          'Un ejemplo del formato que recomendamos es el juego de té de cerámica de 6 piezas de Vorus: tetera de 40 oz con asa de bambú, cuatro tazas y bandeja de madera de 35 × 19 cm, disponible en blanco o negro con acabado marmoleado. Vale tanto para uso diario como para regalo de boda o inauguración.',
        ],
      },
    ],
    relatedProductSlugs: ['juego-te-ceramica-6-piezas-bandeja-madera', 'sacacorchos-electrico-recargable-vino'],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find(guide => guide.slug === slug);
}
