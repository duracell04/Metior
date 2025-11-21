import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ = () => {
  const faqs = [
    {
      question: "Is MEΩ a stablecoin?",
      answer: "No. It's a yard-stick. Price floats with world money; supply is fixed by κ if tokenized.",
    },
    {
      question: "What happens in hyperinflation of a large fiat?",
      answer: "Its MCⱼ changes; MEΩ reweights; unit stays global.",
    },
    {
      question: "Why κ = 10⁻⁶ and not a power of two?",
      answer: "Decimal clarity for finance; binary fixed-point is feasible if ledgers require it.",
    },
    {
      question: "Can I hedge in MEΩ?",
      answer: "Yes—MEΩ futures/ETNs + component forwards span the main risk factors.",
    },
    {
      question: "How are weights determined?",
      answer: "Weights are capitalization-weighted and recomputed daily from open data feeds. Components must maintain ≥1% of total MEΩ market cap to remain included.",
    },
    {
      question: "What data sources are used?",
      answer: "FRED (Federal Reserve Economic Data), LBMA (London Bullion Market Association), CoinGecko, and other publicly auditable sources.",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
          <p className="text-center text-muted-foreground mb-12">
            Math + crypto answered
          </p>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
