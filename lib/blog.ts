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
    slug: 'como-surtir-un-almacen-de-electrodomesticos',
    titulo: 'Cómo surtir un almacén de electrodomésticos sin dejar la plata quieta',
    resumen:
      'Qué referencias comprar primero, cuántas unidades por modelo y por qué el electrodoméstico grande se maneja distinto al pequeño.',
    fecha: '2026-11-09',
    minutos: 8,
    etiqueta: 'Electro',
    cuerpo: [
      {
        t: 'p',
        x: 'El electrodoméstico es el producto que más plata inmoviliza por metro cuadrado de bodega. Una nevera ocupa el espacio de cuarenta ollas y cuesta lo mismo que doscientas. Por eso surtir un almacén de electro no se parece en nada a surtir una tienda: aquí cada decisión de compra es una apuesta grande.',
      },
      { t: 'h2', x: 'Separa la línea blanca de la línea pequeña: son dos negocios' },
      {
        t: 'p',
        x: 'La línea blanca —neveras, lavadoras, estufas— se vende poco y deja mucho por unidad. La línea pequeña —licuadoras, planchas, freidoras— se vende mucho y deja poco por unidad. Mezclarlas en el mismo criterio de compra es el error más caro.',
      },
      {
        t: 'p',
        x: 'En línea blanca compra por modelo, no por cantidad: una o dos unidades de cada referencia, y repón cuando se venda. En línea pequeña compra por rotación: pide por caja de las tres o cuatro referencias que más salen, porque ahí el riesgo de quedarte con una es bajo.',
      },
      { t: 'h2', x: 'La exhibición vende, pero el inventario es otra cosa' },
      {
        t: 'p',
        x: 'Un cliente compra una nevera que puede abrir y tocar. Pero no necesitas tener en bodega todas las que exhibes. La práctica que mejor funciona es tener una unidad de exhibición por referencia y pedirle al proveedor despacho rápido para la reposición.',
      },
      {
        t: 'p',
        x: 'Eso convierte el almacén en una sala de muestra con respaldo, no en una bodega llena. La diferencia en flujo de caja es enorme: con el mismo capital exhibes el triple de modelos.',
      },
      { t: 'h2', x: 'Cuántas unidades por referencia, en la práctica' },
      {
        t: 'ol',
        x: [
          'Línea blanca que ya conoces: una exhibida y una en bodega. Si se vende en menos de dos semanas, sube a dos en bodega.',
          'Línea blanca nueva: una sola, exhibida. Hasta que no se venda la primera, no pidas la segunda.',
          'Línea pequeña de alta rotación: lo que vendas en tres semanas. Menos te deja sin stock; más es plata quieta.',
          'Combos y promociones: solo lo que puedas vender en el periodo de la promoción. Cuando se acaba la campaña, se queda.',
        ],
      },
      { t: 'h2', x: 'El servicio técnico decide qué marcas te convienen' },
      {
        t: 'p',
        x: 'En electrodomésticos no vendes solo el aparato: vendes la tranquilidad de que si falla, alguien responde. Antes de cargar inventario de una marca, averigua si tiene servicio técnico en tu ciudad. Una marca barata sin taller cerca termina costándote clientes.',
      },
      {
        t: 'p',
        x: 'Marcas como Haceb, Mabe y Electrolux tienen red nacional, y eso se traduce en que el cliente las compra con menos dudas. Una referencia desconocida puede dejar mejor margen y aun así rotar peor, porque el comprador duda.',
      },
      { t: 'h2', x: 'Los meses mandan más de lo que crees' },
      {
        t: 'p',
        x: 'El electrodoméstico tiene estacionalidad fuerte en Colombia: prima de junio, prima de diciembre y temporada escolar mueven la línea pequeña; las primas mueven la línea blanca. Comprar en febrero lo que se vende en junio es financiar cuatro meses de bodega.',
      },
      {
        t: 'p',
        x: 'La regla simple: carga inventario tres o cuatro semanas antes de la temporada, no tres meses. Y negocia con el proveedor que te despache rápido en vez de comprar por anticipado.',
      },
      { t: 'h2', x: 'Qué preguntarle al mayorista antes de cargar' },
      {
        t: 'ul',
        x: [
          '¿En cuántos días me despachan una reposición? Si son dos días, puedes tener menos inventario.',
          '¿Hay precio escalonado por cantidad? En línea pequeña suele haberlo y cambia el cálculo.',
          '¿Quién responde la garantía: el mayorista o la marca? Define a dónde mandas al cliente.',
          '¿El precio incluye IVA? En electro la diferencia del 19 % sobre una nevera es plata de verdad.',
          '¿Hay flete incluido o va aparte? Una nevera viaja caro y cambia el margen.',
        ],
      },
      {
        t: 'cita',
        x: 'En electrodomésticos no gana quien tiene más inventario, sino quien repone más rápido.',
      },
    ],
  },

  {
    slug: 'iva-en-compras-al-por-mayor',
    titulo: 'El IVA en las compras al por mayor: qué descuentas y qué pagas de verdad',
    resumen:
      'Por qué el IVA no es un costo si estás bien registrado, cómo afecta tu margen real y los errores que más plata cuestan al calcular precios.',
    fecha: '2026-11-10',
    minutos: 7,
    etiqueta: 'Finanzas',
    cuerpo: [
      {
        t: 'p',
        x: 'Muchos negocios calculan su margen sobre el precio con IVA incluido y creen que están ganando más de lo que ganan. Otros lo calculan sin IVA y creen que ganan menos. Entender dónde está el impuesto en tu cadena es lo que separa un precio bien puesto de uno que te deja trabajando para la DIAN.',
      },
      {
        t: 'p',
        x: 'Lo que sigue es cómo funciona en la práctica. Tu contador tiene la última palabra sobre tu caso: aquí va lo que necesitas entender para poner precios, no para declarar.',
      },
      { t: 'h2', x: 'El IVA que pagas al comprar no es tuyo, es un anticipo' },
      {
        t: 'p',
        x: 'Si eres responsable de IVA, el impuesto que pagas al mayorista no es un costo: es plata que después descuentas del IVA que le cobras a tus clientes. En la jerga se llama IVA descontable, y es la razón por la que dos negocios pueden comprar al mismo precio y tener márgenes distintos.',
      },
      {
        t: 'p',
        x: 'Si no eres responsable de IVA, la historia cambia por completo: el impuesto que pagas sí es costo, porque no lo puedes descontar. Tu precio de compra real es el precio con IVA, y así hay que calcular el margen.',
      },
      { t: 'h2', x: 'Calcula siempre el margen sobre valores sin IVA' },
      {
        t: 'p',
        x: 'Esta es la parte donde más gente se equivoca. Si compras algo en $119.000 con IVA incluido y lo vendes en $150.000 con IVA incluido, no ganaste $31.000.',
      },
      {
        t: 'ol',
        x: [
          'Tu costo sin IVA es $100.000 (119.000 ÷ 1,19).',
          'Tu venta sin IVA es $126.050 (150.000 ÷ 1,19).',
          'Tu margen real es $26.050, no $31.000.',
          'Los $4.950 de diferencia son IVA que recaudaste y tienes que entregar.',
        ],
      },
      {
        t: 'p',
        x: 'La regla es simple: quita el IVA de los dos lados antes de restar. Comparar un precio con IVA contra uno sin IVA infla el margen un 19 % que no existe.',
      },
      { t: 'h2', x: 'Pregunta siempre si el precio publicado incluye IVA' },
      {
        t: 'p',
        x: 'En Colombia unos mayoristas publican con IVA y otros sin IVA, y la diferencia es del 19 %. Un proveedor que parece más barato puede estar mostrando el precio sin impuesto. Es la comparación más frecuente que sale mal.',
      },
      {
        t: 'p',
        x: 'Antes de comparar dos cotizaciones, ponlas en la misma base. Si una viene con IVA y otra sin IVA, divide la primera entre 1,19 y ahí sí compara.',
      },
      { t: 'h2', x: 'No todo tiene 19 %' },
      {
        t: 'p',
        x: 'No todos los productos llevan la tarifa general. Hay bienes exentos y excluidos, y varios insumos agropecuarios tienen tratamiento distinto. Si tu negocio mezcla líneas —ferretería con agro, por ejemplo—, no apliques el mismo porcentaje a todo el inventario.',
      },
      {
        t: 'p',
        x: 'La factura del proveedor dice la tarifa de cada ítem. Vale la pena revisarla la primera vez que compras una línea nueva, porque un supuesto equivocado se repite en todos los precios que calcules después.',
      },
      { t: 'h2', x: 'Tres errores que cuestan plata todos los meses' },
      {
        t: 'ul',
        x: [
          'Poner el precio de venta aplicando el margen sobre el costo con IVA. El precio queda corto y el margen real es menor al que crees.',
          'Olvidar que el IVA recaudado no es tuyo. Se ve plata en caja que ya está comprometida con la declaración.',
          'Comparar proveedores sin verificar si publican con o sin impuesto. Una diferencia del 19 % cambia cuál conviene.',
        ],
      },
      {
        t: 'cita',
        x: 'El margen se calcula sin IVA, de los dos lados. Todo lo demás es contarse un cuento.',
      },
    ],
  },

  {
    slug: 'como-ser-distribuidor-en-colombia',
    titulo: 'Cómo volverte distribuidor: qué piden los mayoristas en Colombia',
    resumen:
      'Los requisitos reales para abrir cuenta con un mayorista, qué documentos tener listos y cómo conseguir mejores condiciones desde el primer pedido.',
    fecha: '2026-11-11',
    minutos: 6,
    etiqueta: 'Guías',
    cuerpo: [
      {
        t: 'p',
        x: 'Comprar al por mayor no exige ser una empresa grande, pero sí exige estar en orden. La mayoría de los mayoristas no piden volúmenes imposibles: piden que puedas facturar, que te puedan ubicar y que el primer pedido no sea un salto al vacío para ninguno de los dos.',
      },
      { t: 'h2', x: 'Lo que casi siempre te van a pedir' },
      {
        t: 'ul',
        x: [
          'RUT actualizado. Es el documento base: dice quién eres ante la DIAN y si eres responsable de IVA.',
          'Cámara de comercio, si estás constituido como empresa. Para persona natural con establecimiento, el registro mercantil.',
          'Datos de contacto y dirección de despacho reales. Suena obvio, pero es donde más se traba el primer pedido.',
          'Cuenta bancaria a nombre del negocio, si vas a pedir plazo de pago.',
        ],
      },
      {
        t: 'p',
        x: 'Con eso basta para abrir cuenta en la mayoría. Lo que no suele pedirse —y mucha gente cree que sí— es un volumen mínimo mensual ni un local grande.',
      },
      { t: 'h2', x: 'Persona natural o empresa: cuál te conviene' },
      {
        t: 'p',
        x: 'Si estás arrancando, persona natural con RUT y registro mercantil es más rápido y más barato. Si vas a manejar volumen, buscar crédito o vender a empresas que exigen factura electrónica con todas las de la ley, constituirte conviene más.',
      },
      {
        t: 'p',
        x: 'No es una decisión que tengas que tomar hoy: casi todos empiezan como persona natural y se constituyen cuando el volumen lo pide. Lo que sí conviene desde el día uno es tener el RUT al día.',
      },
      { t: 'h2', x: 'El plazo de pago no se pide: se gana' },
      {
        t: 'p',
        x: 'Casi nadie da crédito en el primer pedido, y es razonable. La forma de conseguirlo es previsible: compra de contado dos o tres veces, paga puntual, y pide plazo en la cuarta. Un historial corto pero limpio pesa más que un discurso sobre tus proyecciones.',
      },
      {
        t: 'p',
        x: 'Cuando lo pidas, pide poco: ocho o quince días sobre un pedido mediano. Es más fácil que te den quince días y luego treinta, que treinta de entrada.',
      },
      { t: 'h2', x: 'Cómo conseguir mejor precio sin tener volumen todavía' },
      {
        t: 'ol',
        x: [
          'Concentra. Comprar lo mismo en tres proveedores te deja sin peso en ninguno; concentrar te da con qué negociar.',
          'Pregunta por el precio escalonado. Muchos bajan el precio por cantidad y no lo publican.',
          'Agrupa pedidos. En vez de pedir cada semana, pide cada quince días: menos fletes y mejor escalón de precio.',
          'Sé predecible. Un cliente que pide lo mismo todos los meses vale más que uno que pide el doble una vez al año.',
        ],
      },
      { t: 'h2', x: 'La señal de que elegiste bien' },
      {
        t: 'p',
        x: 'No es el catálogo ni el precio de la primera cotización. Es qué pasa cuando algo sale mal: cuando llega incompleto, cuando el producto sale defectuoso, cuando necesitas algo con afán. Ahí se ve si tienes un proveedor o solo una lista de precios.',
      },
      {
        t: 'cita',
        x: 'Al mayorista no lo convences con proyecciones. Lo convences pagando puntual tres veces seguidas.',
      },
    ],
  },

  {
    slug: 'que-surtir-en-un-almacen-agro',
    titulo: 'Qué surtir en un almacén agro: lo que de verdad rota en el campo',
    resumen:
      'Las líneas que sostienen un almacén agropecuario, por qué el empaque y la cuerda se venden todo el año y cómo manejar lo estacional.',
    fecha: '2026-11-12',
    minutos: 7,
    etiqueta: 'Agro',
    cuerpo: [
      {
        t: 'p',
        x: 'El almacén agro tiene un problema que otros negocios no: su cliente compra según el calendario de la cosecha, no según el calendario comercial. Surtir bien es entender qué se vende todas las semanas y qué se vende tres veces al año.',
      },
      { t: 'h2', x: 'Lo que se vende todo el año es lo que sostiene el negocio' },
      {
        t: 'p',
        x: 'Hay una base que rota sin importar la temporada: empaque, cuerda, herramienta de mano y elementos de riego. No es lo más emocionante del catálogo ni lo que deja mejor margen por unidad, pero es lo que paga el arriendo en los meses flojos.',
      },
      {
        t: 'p',
        x: 'El saco de polipropileno es el caso típico: nadie lo exhibe con orgullo y se vende todas las semanas. Lo mismo la cuerda y el lazo: productos de consumo constante que el campesino repone sin pensarlo.',
      },
      { t: 'h2', x: 'Las cuatro líneas que no pueden faltar' },
      {
        t: 'ol',
        x: [
          'Empaque: sacos, lonas y mallas. Consumo constante y margen estable. Es lo primero que se acaba.',
          'Cuerda y amarre: lazo, hilo de polipropileno, alambre. Barato por unidad, altísima rotación.',
          'Herramienta de mano: machetes, palas, azadones, limas. Se desgasta y se repone; marcas reconocidas rotan mejor.',
          'Riego y conducción: manguera, acoples, aspersores. Depende del clima, pero nunca se detiene del todo.',
        ],
      },
      { t: 'h2', x: 'Lo estacional se compra distinto' },
      {
        t: 'p',
        x: 'Las motobombas, las fumigadoras y los equipos se venden en picos: cuando empieza la lluvia, cuando se prepara el terreno, cuando hay plata de la cosecha. Comprar esos equipos por anticipado es financiar bodega durante meses.',
      },
      {
        t: 'p',
        x: 'Para esas líneas la estrategia es tener una unidad de exhibición y un proveedor que despache rápido. Cuando llega el pico, pides; no antes. El campesino que necesita una motobomba la necesita esta semana, no la compra con tres meses de anticipación.',
      },
      { t: 'h2', x: 'La marca pesa más de lo que uno cree' },
      {
        t: 'p',
        x: 'En el campo la recomendación circula de vecino a vecino, y una herramienta que se partió se recuerda por años. Marcas con trayectoria —Bellota en herramienta, por ejemplo— se venden con menos explicación, aunque cuesten más.',
      },
      {
        t: 'p',
        x: 'Eso no significa descartar lo económico: significa tener las dos. Una línea reconocida para el que valora durabilidad y una alternativa más barata para el que compra por precio. Lo que no funciona es tener solo lo barato y que te devuelvan la herramienta partida.',
      },
      { t: 'h2', x: 'Errores que se repiten en almacenes agro' },
      {
        t: 'ul',
        x: [
          'Cargar agroquímicos sin rotación clara. Vencen, y un producto vencido es pérdida total más un problema de manejo.',
          'Surtir equipos caros antes de la temporada. Inmoviliza el capital que necesitas para la base que sí rota.',
          'No tener repuestos de lo que vendes. Vender una fumigadora y no tener el empaque de repuesto manda al cliente a otro lado.',
          'Comprar empaque al menudeo. Es justo la línea donde el precio por volumen más cambia el margen.',
        ],
      },
      {
        t: 'cita',
        x: 'En el agro, lo aburrido es lo que paga el arriendo. Lo emocionante es lo que lo pone en riesgo.',
      },
    ],
  },

  {
    slug: 'cuanto-cuesta-traer-la-mercancia-fletes',
    titulo: 'Fletes: cómo saber cuánto te cuesta de verdad traer la mercancía',
    resumen:
      'Por qué el producto más barato puede salir más caro, cómo calcular el costo real por unidad y cuándo conviene agrupar pedidos.',
    fecha: '2026-11-13',
    minutos: 6,
    etiqueta: 'Operación',
    cuerpo: [
      {
        t: 'p',
        x: 'El flete es el costo que más se olvida y el que más cambia el resultado. Dos proveedores con el mismo precio de lista pueden dejarte márgenes muy distintos según desde dónde despachen, cómo cobren el envío y cada cuánto te toque pedir.',
      },
      { t: 'h2', x: 'El costo real es el precio puesto en tu bodega' },
      {
        t: 'p',
        x: 'Deja de comparar precios de lista. Lo que importa es cuánto te cuesta cada unidad cuando ya está en tu estantería: precio del producto, más flete, dividido entre las unidades del pedido.',
      },
      {
        t: 'p',
        x: 'Un ejemplo: 100 unidades a $5.000 con flete de $120.000 te cuestan $6.200 cada una. Las mismas 100 unidades a $5.400 con flete incluido te cuestan $5.400. El proveedor "más caro" es un 13 % más barato.',
      },
      { t: 'h2', x: 'El peso volumétrico es la trampa clásica' },
      {
        t: 'p',
        x: 'Las transportadoras cobran por peso o por volumen, lo que resulte mayor. Un bulto de espuma pesa poco y ocupa mucho: te cobran por el espacio. Un bulto de tornillos pesa mucho y ocupa poco: te cobran por el peso.',
      },
      {
        t: 'p',
        x: 'Por eso traer plástico, colchones o cajas vacías sale desproporcionadamente caro, y traer herramienta o ferretería sale relativamente barato. Si tu negocio mezcla líneas, conviene agruparlas en el mismo despacho: el producto pesado y el voluminoso se compensan.',
      },
      { t: 'h2', x: 'Cuándo conviene agrupar pedidos' },
      {
        t: 'ol',
        x: [
          'Si el flete es fijo por despacho, agrupar siempre conviene: el mismo costo repartido entre más unidades.',
          'Si el flete es por peso, agrupar ayuda menos, pero suele haber tarifa escalonada por encima de cierto tonelaje.',
          'Si tienes espacio de bodega y el producto no vence, pedir cada quince días en vez de cada semana baja el costo por unidad.',
          'Si tu capital es ajustado, pedir seguido cuesta más en flete pero libera caja. Es una decisión financiera, no logística.',
        ],
      },
      { t: 'h2', x: 'Qué preguntar antes de cerrar' },
      {
        t: 'ul',
        x: [
          '¿El precio incluye flete o va aparte? Y si va aparte, ¿cuánto para mi ciudad?',
          '¿Hay monto mínimo para flete gratis? A veces subir un poco el pedido sale más barato que pagar el envío.',
          '¿Quién responde si llega averiado? En línea blanca y vidrio esto define si el riesgo es tuyo o del proveedor.',
          '¿Cuántos días de tránsito? El flete barato que tarda ocho días puede costarte ventas.',
        ],
      },
      { t: 'h2', x: 'La cuenta que conviene tener a mano' },
      {
        t: 'p',
        x: 'Antes de cada pedido, divide el flete entre las unidades que vas a traer y súmalo al costo. Si ese número sube mucho respecto al pedido anterior, es señal de que estás pidiendo poco o muy seguido.',
      },
      {
        t: 'p',
        x: 'Es una cuenta de treinta segundos que cambia decisiones: a veces conviene esperar dos días y agrupar, y a veces conviene cambiar de proveedor aunque el precio de lista sea peor.',
      },
      {
        t: 'cita',
        x: 'No compares precios de lista. Compara cuánto te cuesta cada unidad ya puesta en tu estantería.',
      },
    ],
  },

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
