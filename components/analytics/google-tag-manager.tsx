import Script from 'next/script'

/**
 * Contenedor de Google Tag Manager.
 *
 * Se monta solo si existe NEXT_PUBLIC_GTM_ID, que se define en Vercel y no en
 * local: así las visitas de desarrollo no ensucian las analíticas del cliente.
 * Para probar en local basta con ponerla en .env.local.
 *
 * Desde el contenedor se agregan Analytics, Ads o lo que haga falta sin volver
 * a tocar el código.
 */
export function GoogleTagManager({ id }: { id: string }) {
  return (
    <>
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');`}
      </Script>
      {/* Respaldo para quien navega sin JavaScript */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${id}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  )
}
