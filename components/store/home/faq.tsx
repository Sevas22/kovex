import { CompanyHeading } from './company-heading'
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { COMPANY } from '@/lib/company'

export function Faq({ whatsappUrl }: { whatsappUrl: string }) {
  return (
    <section id="preguntas" className="scroll-mt-32 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:py-24 lg:grid-cols-[1fr_1.7fr] lg:gap-16">
        <div className="reveal-children flex flex-col items-start gap-5">
          <CompanyHeading>Preguntas frecuentes</CompanyHeading>
          <p className="max-w-sm leading-relaxed text-muted-foreground">
            Lo que más nos preguntan antes de la primera compra. Si tu duda no está aquí, escríbenos.
          </p>
          <Button
            variant="outline"
            size="xl"
            nativeButton={false}
            render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}
          >
            <WhatsAppIcon data-icon="inline-start" className="text-whatsapp-600" />
            Hablar con un asesor
          </Button>
        </div>
        <Accordion className="reveal border-t">
          {COMPANY.faq.map((item) => (
            <AccordionItem key={item.q} value={item.q} className="border-b">
              <AccordionTrigger className="py-4 text-base font-semibold text-brand-navy hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
