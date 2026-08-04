/* ============================================================
   HOME SCENE 4 — THE JOURNEY  ("world -> Nepal -> traceable")
   The narrative core. A vertical, scroll-revealed 4-step path
   that tells the company story: global brands come in, we
   integrate, products get marked & tracked, and industry gains
   one-click traceability. A connecting line "draws" down the steps.
   ============================================================ */
import { Reveal, SectionKicker } from '@/components/ui'

/* Each step = one beat of the story. Icons are inline SVG (no deps). */
const JOURNEY = [
  {
    no: '01', title: 'We bring the world in',
    body: 'Global Nepal Group is the authorized bridge for Zebra, Rynan, HID and Yesmark — the identification technology the world runs on, delivered to Nepal.',
    icon: (<><circle cx="24" cy="24" r="15" /><ellipse cx="24" cy="24" rx="6" ry="15" /><path d="M9 24h30M24 9c6 4 6 26 0 30" /></>),
  },
  {
    no: '02', title: 'We integrate it locally',
    body: 'Our engineers install and connect scanners, printers and RFID to your line and systems — configured for your products, not a generic template.',
    icon: (<><path d="M24 6v6M24 36v6M6 24h6M36 24h6" /><circle cx="24" cy="24" r="8" /><path d="M24 18v6l4 3" /></>),
  },
  {
    no: '03', title: 'Every product gets an identity',
    body: 'Codes, labels and RFID tags are applied and verified at line speed, so each unit, batch and pallet carries a trusted, machine-readable identity.',
    icon: (<><rect x="10" y="12" width="28" height="24" rx="2" /><path d="M16 12v24M22 12v24M28 12v24M32 12v24" /></>),
  },
  {
    no: '04', title: 'Industry gains one-click traceability',
    body: 'From the factory floor to the customer, our software shows the full journey of any item in a single click — the payoff we deliver to Nepali industry.',
    icon: (<><path d="M8 24l8 8 24-24" /><circle cx="24" cy="24" r="18" opacity="0.35" /></>),
  },
]

export default function JourneySteps() {
  return (
    <section className="relative bg-paper py-24 overflow-hidden">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <Reveal className="text-center max-w-2xl mx-auto">
          <div className="flex justify-center"><SectionKicker>How it works</SectionKicker></div>
          <h2 className="mt-3 font-display font-extrabold text-ocean text-4xl sm:text-5xl tracking-tight">
            From the world&rsquo;s technology to Nepal&rsquo;s traceability
          </h2>
          <p className="mt-4 text-steel">One connected path — the story of what we actually do.</p>
        </Reveal>

        <div className="relative mt-16 max-w-3xl mx-auto">
          {/* vertical connecting line behind the steps */}
          <div className="absolute left-[27px] sm:left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-azure via-marine to-cloud sm:-translate-x-1/2" aria-hidden="true" />
          <div className="space-y-10">
            {JOURNEY.map((step, i) => (
              <Reveal key={step.no} delay={i * 0.05}>
                <div className={`relative flex items-start gap-6 sm:gap-10 ${i % 2 ? 'sm:flex-row-reverse sm:text-right' : ''}`}>
                  {/* node marker */}
                  <div className="relative z-10 shrink-0 grid place-items-center h-14 w-14 rounded-2xl bg-ocean text-white shadow-lg">
                    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">{step.icon}</svg>
                  </div>
                  {/* card */}
                  <div className="flex-1 rounded-2xl border border-cloud bg-white p-6 shadow-sm">
                    <div className="font-mono text-xs tracking-widest text-azure">{step.no}</div>
                    <h3 className="mt-1 font-display font-bold text-ocean text-xl">{step.title}</h3>
                    <p className="mt-2 text-steel leading-relaxed">{step.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
