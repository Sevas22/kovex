/**
 * Artículos del blog.
 *
 * Viven en código y no en la base a propósito: son cinco textos que cambian
 * poco, se versionan con el resto del proyecto y no necesitan panel ni
 * migración. Si algún día el cliente quiere escribir desde el administrador,
 * esto se muda a una tabla sin tocar las páginas que lo pintan.
 *
 * Los temas están escogidos por lo que busca un comprador mayorista en
 * Colombia, no por lo que KOVEX quiere contar de sí misma: el tráfico llega por
 * la pregunta, y la marca aparece después.
 */

export type Bloque =
  | { t: 'p'; x: string }
  | { t: 'h2'; x: string }
  | { t: 'ul'; x: string[] }
  | { t: 'ol'; x: string[] }
  | { t: 'cita'; x: string }

export interface Post {
  slug: string
  titulo: string
  /** Se usa como meta description y en la tarjeta del listado. */
  resumen: string
  fecha: string
  minutos: number
  etiqueta: string
  cuerpo: Bloque[]
}

export const POSTS: Post[] = [
  {
    slug: 'como-comprar-al-por-mayor-en-colombia',
    titulo: 'Cómo comprar al por mayor en Colombia sin equivocarse en el primer pedido',
    resumen:
      'Qué pedir, a quién y en qué cantidades cuando vas a surtir un negocio por primera vez. Los errores más comunes y cómo evitarlos.',
    fecha: '2026-10-06',
    minutos: 7,
    etiqueta: 'Guías',
    cuerpo: [
      {
        t: 'p',
        x: 'El primer pedido al por mayor casi siempre sale mal. No porque el proveedor falle, sino porque uno compra con el entusiasmo del arranque y no con los números del negocio. Esta guía es lo que nos hubiera gustado que nos contaran antes de ese primer pedido.',
      },
      { t: 'h2', x: 'Empieza por lo que ya se vende, no por lo que te gustaría vender' },
      {
        t: 'p',
        x: 'La tentación es surtir variedad: un poco de todo para que el local se vea lleno. El problema es que la variedad inmoviliza plata. Cada referencia que compras es dinero que se queda quieto en una estantería hasta que alguien la pide.',
      },
      {
        t: 'p',
        x: 'Si ya tienes un negocio andando, mira qué se te acabó el mes pasado y cómpralo con holgura. Si vas a abrir, pregunta en el barrio: el tendero de al lado sabe mejor que cualquier estudio qué se mueve en esa cuadra.',
      },
      { t: 'h2', x: 'El precio por unidad no es el precio real' },
      {
        t: 'p',
        x: 'Un producto a $4.800 que debes comprar de a 50 unidades te cuesta $240.000 de caja. Otro a $5.400 que puedes pedir de a 12 te cuesta $64.800. El segundo es más caro por unidad y más barato para tu flujo de caja.',
      },
      {
        t: 'p',
        x: 'Antes de comparar precios, compara cantidades mínimas. Un proveedor que te deja pedir poco mientras arrancas vale más que uno con mejor precio y un mínimo que no puedes pagar.',
      },
      { t: 'h2', x: 'Los cinco errores que más cuestan' },
      {
        t: 'ol',
        x: [
          'Comprar mucho de una referencia nueva sin haberla probado. Pide lo mínimo, mira cómo rota, y ahí sí carga.',
          'No preguntar por el precio escalonado. Muchos mayoristas bajan el precio por cantidad y no lo publican: hay que preguntarlo.',
          'Olvidar el costo del flete en el cálculo. Un producto barato que viaja caro deja de ser barato.',
          'No confirmar disponibilidad antes de prometerle al cliente. El catálogo dice que hay; el asesor confirma que hay.',
          'Pagar todo por adelantado en la primera compra con un proveedor que no conoces.',
        ],
      },
      { t: 'h2', x: 'Cómo saber si un proveedor te conviene' },
      {
        t: 'p',
        x: 'La prueba no es el catálogo ni la página web: es el segundo pedido. En el primero todos cumplen. En el segundo se ve si contestan rápido, si avisan cuando algo no llegó y si el precio se sostiene.',
      },
      {
        t: 'p',
        x: 'Haz el primer pedido pequeño a propósito, aunque puedas pagar uno grande. Es la forma más barata de averiguar con quién estás tratando.',
      },
      { t: 'h2', x: 'Y cuando ya tengas ritmo' },
      {
        t: 'p',
        x: 'Cuando sepas qué rota, concentra el volumen. Comprar lo mismo en tres proveedores distintos te deja sin poder de negociación en ninguno. Concentrar en uno o dos te da mejor precio, mejor atención y menos trámites.',
      },
      {
        t: 'cita',
        x: 'Menos proveedores, menos trámites y más tiempo para hacer crecer tu negocio.',
      },
    ],
  },

  {
    slug: 'precios-por-volumen-como-calcular-tu-margen',
    titulo: 'Precios por volumen: cómo saber cuánto estás ganando de verdad',
    resumen:
      'Comprar más barato no siempre es ganar más. Cómo calcular tu margen real y en qué momento conviene subir la cantidad del pedido.',
    fecha: '2026-10-06',
    minutos: 6,
    etiqueta: 'Finanzas',
    cuerpo: [
      {
        t: 'p',
        x: 'Un descuento por cantidad se ve siempre como una buena noticia. Pero el descuento solo es ganancia si el producto se vende. Si se queda en la bodega, es plata quieta disfrazada de ahorro.',
      },
      { t: 'h2', x: 'El margen, en una línea' },
      {
        t: 'p',
        x: 'Margen es lo que te queda sobre lo que vendes: (precio de venta − costo) ÷ precio de venta. Si compras a $6.000 y vendes a $10.000, te quedan $4.000, que es 40 % de margen. Ojo: no es 66 %. Ese número es el sobreprecio sobre el costo, que es otra cosa.',
      },
      {
        t: 'p',
        x: 'Confundir los dos es el error de cálculo más común en el comercio pequeño, y hace que la gente crea que gana más de lo que gana.',
      },
      { t: 'h2', x: 'Cuándo conviene comprar más' },
      {
        t: 'p',
        x: 'La pregunta no es cuánto te descuentan, sino en cuánto tiempo recuperas la plata. Un 10 % de descuento por llevar el triple es buen negocio si lo vendes en un mes; es mal negocio si te demoras seis.',
      },
      {
        t: 'p',
        x: 'La cuenta rápida: mira cuántas unidades vendiste el mes pasado. Si el escalón de descuento está dentro de lo que vendes en 30 o 45 días, tómalo. Si te obliga a comprar cuatro meses de inventario, deja pasar.',
      },
      { t: 'h2', x: 'El costo que nadie suma' },
      {
        t: 'ul',
        x: [
          'La plata inmovilizada. Esos $2.000.000 en inventario son $2.000.000 que no están disponibles para otra cosa.',
          'El espacio. Si tienes que arrendar bodega para que quepa el descuento, el descuento se fue.',
          'El riesgo. Productos de temporada, de moda o perecederos pierden valor quietos.',
          'La merma. Lo que se rompe, se daña o se pierde crece con el tiempo que pasa guardado.',
        ],
      },
      { t: 'h2', x: 'Un ejemplo con números' },
      {
        t: 'p',
        x: 'Supón un producto con costo de $8.000 que vendes a $12.000, y vendes 40 al mes. Tu margen es 33 % y ganas $160.000 mensuales con esa referencia.',
      },
      {
        t: 'p',
        x: 'Te ofrecen 12 % de descuento si llevas 200. El costo baja a $7.040 y tu ganancia por unidad sube a $4.960. Suena bien. Pero 200 unidades son cinco meses de ventas: inmovilizas $1.408.000 durante casi medio año para ganar $38.400 más por mes.',
      },
      {
        t: 'p',
        x: 'Si en cambio el escalón empezara en 80 unidades, serían dos meses de inventario por una ganancia parecida. Ese sí es el escalón que te sirve.',
      },
      { t: 'h2', x: 'La regla práctica' },
      {
        t: 'p',
        x: 'Compra hasta donde alcances a vender en un trimestre. Más allá de eso, el descuento lo está pagando tu flujo de caja. Y pregunta siempre si hay escalones intermedios: muchos proveedores tienen uno más bajo que no publican.',
      },
    ],
  },

  {
    slug: 'como-elegir-un-distribuidor-mayorista',
    titulo: 'Siete señales de que un distribuidor mayorista te conviene',
    resumen:
      'Más allá del precio: qué mirar antes de concentrar tus compras en un proveedor, y las señales de alerta que conviene no ignorar.',
    fecha: '2026-10-06',
    minutos: 6,
    etiqueta: 'Guías',
    cuerpo: [
      {
        t: 'p',
        x: 'Cambiar de proveedor cuesta tiempo y errores. Vale la pena escoger bien de entrada. Estas son las señales que distinguen a un distribuidor con el que se puede trabajar años de uno que solo sirve para una compra.',
      },
      { t: 'h2', x: '1. Te dice que no' },
      {
        t: 'p',
        x: 'Un proveedor que siempre tiene todo, siempre entrega mañana y siempre dice que sí, o está mintiendo o está a punto de quedarte mal. El que te avisa que una referencia está agotada y te propone otra te está cuidando el negocio.',
      },
      { t: 'h2', x: '2. El precio no cambia según quién pregunte' },
      {
        t: 'p',
        x: 'Las listas de precios deben ser estables y explicables. Si el precio depende del humor del vendedor o de cuánto cree que puedes pagar, cada compra va a ser una negociación desgastante.',
      },
      { t: 'h2', x: '3. Tiene profundidad en pocas líneas, no superficie en todas' },
      {
        t: 'p',
        x: 'Un catálogo enorme no sirve si de cada producto hay tres unidades. Prefiere al que maneja bien las categorías que tú vendes, aunque no tenga todo.',
      },
      { t: 'h2', x: '4. Puedes hablar con una persona' },
      {
        t: 'p',
        x: 'Cuando llegue el pedido incompleto —y algún día llegará— vas a necesitar que alguien conteste. Un canal directo con un asesor que conoce tu negocio vale más que un formulario de contacto.',
      },
      { t: 'h2', x: '5. Las condiciones están escritas' },
      {
        t: 'p',
        x: 'Mínimo de pedido, tiempos de entrega, quién paga el flete, qué pasa si algo llega roto. Si eso solo existe de palabra, existe hasta que cambie el vendedor.',
      },
      { t: 'h2', x: '6. El precio baja con el volumen y te lo dicen' },
      {
        t: 'p',
        x: 'Casi todos los mayoristas tienen escalones por cantidad. Los buenos te los muestran para que planees tus compras; los demás esperan a que preguntes.',
      },
      { t: 'h2', x: '7. No te obliga a comprar más de lo que necesitas' },
      {
        t: 'p',
        x: 'Un mínimo de pedido razonable es normal; uno que te obliga a inmovilizar meses de inventario está trasladándote su problema de bodega.',
      },
      { t: 'h2', x: 'Las señales de alerta' },
      {
        t: 'ul',
        x: [
          'Pide todo el pago por adelantado en la primera compra y no da factura.',
          'No tiene dirección verificable ni razón social clara.',
          'Los precios cambian entre la cotización y la factura sin aviso.',
          'Te presiona a cerrar hoy por una oferta que vence en horas.',
          'No contesta cuando hay un problema, solo cuando hay una venta.',
        ],
      },
    ],
  },

  {
    slug: 'como-surtir-una-ferreteria',
    titulo: 'Cómo surtir una ferretería: el inventario base que no puede faltar',
    resumen:
      'Qué comprar primero cuando abres una ferretería de barrio, en qué orden invertir y qué productos sostienen la caja mientras el negocio arranca.',
    fecha: '2026-10-06',
    minutos: 8,
    etiqueta: 'Ferretería',
    cuerpo: [
      {
        t: 'p',
        x: 'Una ferretería de barrio vive de dos cosas: que el cliente encuentre lo que vino a buscar y que no tenga que ir al centro por ello. Eso no exige un catálogo enorme, exige el catálogo correcto.',
      },
      { t: 'h2', x: 'Lo que entra primero' },
      {
        t: 'p',
        x: 'La primera compra debería cubrir las urgencias domésticas, que es lo que trae gente a la puerta sin que tengas que hacer nada: se rompió una llave, se fundió un bombillo, se dañó el empaque del sanitario.',
      },
      {
        t: 'ul',
        x: [
          'Eléctrico básico: bombillos, tomas, interruptores, cinta aislante, cable por metro, multitomas.',
          'Plomería de emergencia: empaques, teflón, siliconas, flotadores, acoples.',
          'Fijación y sujeción: tornillos y chazos en los calibres comunes, clavos, puntillas, abrazaderas.',
          'Pintura y acabados: brochas, rodillos, lijas, cinta de enmascarar, un blanco en varios tamaños.',
          'Herramienta de mano: alicates, destornilladores, martillo, metro, bisturí.',
          'Aseo e insumos: guantes, bolsas, trapos, limpiadores.',
        ],
      },
      { t: 'h2', x: 'Lo que puede esperar' },
      {
        t: 'p',
        x: 'Herramienta eléctrica, grifería de línea alta, cerraduras especiales y todo lo que sea de encargo. Son productos de ticket alto que rotan despacio: mejor conseguirlos sobre pedido mientras aprendes qué te piden.',
      },
      {
        t: 'p',
        x: 'La regla es sencilla: lo que el cliente necesita hoy, tenlo. Lo que el cliente puede esperar dos días, consíguelo.',
      },
      { t: 'h2', x: 'Profundidad antes que variedad' },
      {
        t: 'p',
        x: 'Es mejor tener tornillos en seis medidas con veinte unidades de cada una, que en veinte medidas con tres de cada una. El cliente que encuentra lo que busca vuelve; el que encuentra "ya se me acabó" se va al que sí tiene.',
      },
      { t: 'h2', x: 'Lo que sostiene la caja' },
      {
        t: 'p',
        x: 'Hay productos que dejan poco margen pero traen gente todos los días: cinta aislante, bombillos, teflón, tornillería suelta. Y hay productos que dejan buen margen pero se venden una vez al mes.',
      },
      {
        t: 'p',
        x: 'Necesitas los dos. Los primeros pagan el arriendo y crean la costumbre de entrar a tu local. Los segundos son los que dejan la utilidad. Un error típico es surtirse solo de los segundos porque "dejan más".',
      },
      { t: 'h2', x: 'Cómo crecer el inventario sin ahogarte' },
      {
        t: 'ol',
        x: [
          'Anota todo lo que te pidan y no tengas. Esa libreta es tu próxima lista de compras, y vale más que cualquier recomendación.',
          'Revisa cada quince días qué se movió y qué no. Lo que lleva dos meses quieto, no lo repitas.',
          'Reinvierte de a poco. Subir el inventario 20 % cada mes es sostenible; duplicarlo de un golpe no.',
          'Negocia el escalón de volumen solo en lo que ya sabes que rota.',
        ],
      },
      { t: 'h2', x: 'Una ventaja de comprar multicategoría' },
      {
        t: 'p',
        x: 'Las ferreterías de barrio terminan vendiendo cosas que no son ferretería: baldes, canecas, extensiones, pequeños electrodomésticos. Conseguir todo eso con un solo proveedor ahorra fletes, trámites y tiempo de coordinación, que es lo que más escasea cuando uno atiende su propio local.',
      },
    ],
  },

  {
    slug: 'comprar-por-whatsapp-para-negocios',
    titulo: 'Comprar al por mayor por WhatsApp: por qué funciona y qué cuidar',
    resumen:
      'Por qué el mayoreo en Colombia se cerró en WhatsApp y no en las pasarelas de pago, y cómo usarlo sin perder el rastro de tus pedidos.',
    fecha: '2026-10-06',
    minutos: 5,
    etiqueta: 'Operación',
    cuerpo: [
      {
        t: 'p',
        x: 'En Colombia el comercio mayorista se cerró en WhatsApp antes de que existiera un solo botón de pago decente. No fue una moda: fue que el canal se ajustaba mejor a cómo se compra al por mayor.',
      },
      { t: 'h2', x: 'Por qué no funciona el carrito tradicional' },
      {
        t: 'p',
        x: 'Una compra mayorista rara vez es "agregar al carrito y pagar". Hay preguntas que no caben en un formulario: si hay stock para 300 unidades, si el precio mejora llevando el doble, si lo despachan a Montería, si se puede pagar la mitad ahora.',
      },
      {
        t: 'p',
        x: 'Cada una de esas preguntas es una razón para abandonar un carrito y ninguna es un problema en un chat.',
      },
      { t: 'h2', x: 'Lo que el chat hace mejor' },
      {
        t: 'ul',
        x: [
          'Deja negociar. El precio de 10 unidades y el de 500 no son el mismo, y eso se conversa.',
          'Resuelve la confianza. Hablar con una persona que responde pesa más que cualquier sello de seguridad.',
          'Deja rastro. La conversación queda: qué se pidió, a qué precio y qué se prometió.',
          'No exige registro. Nadie crea una cuenta para preguntar un precio.',
        ],
      },
      { t: 'h2', x: 'Lo que hay que cuidar' },
      {
        t: 'p',
        x: 'El chat también es donde los pedidos se pierden. Tres cosas evitan la mayoría de los líos:',
      },
      {
        t: 'ol',
        x: [
          'Que el pedido llegue escrito y completo, no en mensajes sueltos. Un solo mensaje con referencias, cantidades y precios es la diferencia entre un pedido y una conversación.',
          'Que tenga un código. Sin un número al que referirse, reclamar algo tres semanas después es imposible.',
          'Que exista un respaldo fuera del chat. Si el pedido solo vive en WhatsApp, un celular perdido se lleva el historial.',
        ],
      },
      { t: 'h2', x: 'El punto medio que funciona' },
      {
        t: 'p',
        x: 'Lo que mejor resultado da no es el catálogo sin chat ni el chat sin catálogo, sino los dos conectados: el cliente arma su pedido en el sitio, con precios y disponibilidad a la vista, y lo envía al chat ya escrito y con código.',
      },
      {
        t: 'p',
        x: 'Así el cliente no tiene que dictar referencias, el asesor no tiene que transcribir nada y los dos quedan hablando de lo que de verdad importa: cantidad, precio y entrega.',
      },
      {
        t: 'cita',
        x: 'Sin registros ni pasarelas: tú eliges los productos y un asesor cierra la compra contigo.',
      },
    ],
  },
]

export const postBySlug = (slug: string) => POSTS.find((p) => p.slug === slug)

/** Los demás artículos, para la sección «sigue leyendo». */
export const otrosPosts = (slug: string, max = 3) => POSTS.filter((p) => p.slug !== slug).slice(0, max)
