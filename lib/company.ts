// Contenido corporativo de KOVEX Colombia. La mayoría viene del manual de marca
// (concepto, pilares, significado de la K, valores, manifiesto). Misión y visión son
// propuestas redactadas a partir de ese concepto: validar con el cliente.

export const COMPANY = {
  tagline: 'Tecnología que conecta, soluciones que evolucionan.',
  slogan: 'Compra más. Paga mejor. Haz crecer tu negocio.',

  about:
    'KOVEX Colombia es un distribuidor mayorista multicategoría que conecta negocios, profesionales y hogares con un amplio portafolio de productos, precios competitivos y disponibilidad, a través de una experiencia de compra confiable, moderna y multicanal.',
  aboutDetail:
    'Trabajamos con fabricantes y distribuidores de primer nivel para reunir en un solo proveedor ferretería, agro, hogar, maquinaria, tecnología y electro. Menos proveedores, menos trámites y más tiempo para hacer crecer tu negocio.',

  pillars: [
    { title: 'Variedad', text: 'Todo lo que tu negocio necesita.' },
    { title: 'Precio', text: 'Compra mejor. Haz rendir tu negocio.' },
    { title: 'Disponibilidad', text: 'Lo necesitas. KOVEX responde.' },
  ],

  /** Lo que representa cada trazo del monograma (manual, lámina 2). */
  monogram: [
    { title: 'Fuerza', text: 'La barra vertical representa respaldo y solidez.' },
    { title: 'Innovación', text: 'La diagonal superior azul impulsa evolución y movimiento.' },
    { title: 'Conexión', text: 'La X interna integra ideas, rutas y oportunidades.' },
    { title: 'Estabilidad', text: 'La base diagonal proyecta seguridad y continuidad.' },
  ],

  mission:
    'Abastecer a los negocios, profesionales y hogares de Colombia con un portafolio multicategoría de marcas confiables, precios competitivos y disponibilidad real, a través de una experiencia de compra ágil y cercana que les ayude a crecer.',
  vision:
    'Ser el aliado mayorista de referencia en Colombia: el proveedor que reúne en un solo lugar lo que un negocio necesita, reconocido por su cumplimiento, el uso de la tecnología para comprar fácil y relaciones de largo plazo con clientes y proveedores.',

  values: [
    { title: 'Confianza', text: 'Respaldamos cada relación y cada compra.' },
    { title: 'Innovación', text: 'Evolucionamos para darte mejores soluciones.' },
    { title: 'Transparencia', text: 'Relaciones claras, precios justos y comunicación honesta.' },
    { title: 'Compromiso', text: 'Estamos comprometidos con tu negocio y con Colombia.' },
  ],

  manifesto: [
    'Creemos en el poder de las oportunidades.',
    'Creemos en los negocios que se construyen con esfuerzo, en los proyectos que transforman realidades y en las personas que mueven a Colombia hacia adelante.',
    'Por eso existimos: para conectar lo que necesitas con soluciones reales, con respaldo, con confianza y al mejor precio.',
  ],
  manifestoClosing: ['No somos solo un distribuidor.', 'Somos tu socio para crecer.'],

  audiences: [
    {
      title: 'Negocios y mayoristas',
      text: 'Ferreterías, almacenes, distribuidores, constructoras, empresas y negocios que compran por volumen.',
    },
    {
      title: 'Profesionales',
      text: 'Técnicos, contratistas, instaladores, electricistas y trabajadores independientes.',
    },
    {
      title: 'Hogares',
      text: 'Familias que buscan productos de marca, buen precio y entrega en su ciudad.',
    },
  ],

  proudlyColombian: 'Conectamos talento, empresas y regiones para fortalecer el comercio del país.',

  faq: [
    {
      q: '¿Necesito crear una cuenta para comprar?',
      a: 'No. Agregas los productos a tu pedido, dejas tus datos y lo envías por WhatsApp. Un asesor continúa contigo por ese mismo chat.',
    },
    {
      q: '¿Qué diferencia hay entre hacer un pedido y pedir una cotización?',
      a: 'Con un pedido separamos las unidades mientras confirmas el pago con el asesor. Con una cotización te enviamos precios por volumen y tiempos de entrega, sin compromiso; si te sirve, la convertimos en pedido.',
    },
    {
      q: '¿Por qué algunos productos dicen “Precio a cotizar”?',
      a: 'Su precio depende del volumen, de la disponibilidad del fabricante o del destino. Agrégalos a tu lista y te enviamos el valor por WhatsApp.',
    },
    {
      q: '¿Cómo pago mi pedido?',
      a: 'El asesor te confirma por WhatsApp el total y los medios de pago disponibles. Despachamos cuando el pago queda confirmado.',
    },
    {
      q: '¿Hacen envíos a toda Colombia?',
      a: 'Sí. Despachamos a todo el país con aliados logísticos. El costo y el tiempo de entrega dependen de la ciudad y del volumen, y te los confirmamos antes de despachar.',
    },
    {
      q: '¿Venden solo a empresas?',
      a: 'No. Atendemos ferreterías, almacenes, constructoras y empresas, y también a profesionales independientes y hogares. Por volumen te ofrecemos precio especial.',
    },
  ],
} as const
