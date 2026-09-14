import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { QuoteView } from "@/components/quote-view"

export const metadata: Metadata = {
  title: "Mi cotización | KOVEX Colombia",
  description: "Revisa tu cotización y envíala por WhatsApp a KOVEX Colombia.",
}

export default function CotizacionPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <QuoteView />
      </main>
      <SiteFooter />
    </div>
  )
}
