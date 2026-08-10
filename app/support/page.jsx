import { Reveal, SectionKicker } from '@/components/ui'
import SupportEmbed from '@/components/SupportEmbed'

export const metadata = {
  title: 'Support — Global Nepal Group',
  // The ticketing app is behind a login and lives on its own domain, so
  // there's nothing here for a crawler to usefully index.
  robots: { index: false, follow: false },
}

/* The ticketing system is a separate service (Django REST + React) on its
   own subdomain, embedded here. Its URL is an env var rather than a
   constant so Preview deployments can point at a staging instance
   instead of live customer ticket data — see .env.local.example. */
export default function SupportPage() {
  const appUrl = process.env.NEXT_PUBLIC_TICKETING_APP_URL

  return (
    <section className="bg-white pt-[68px]">
      <div className="mx-auto max-w-content px-5 sm:px-8 py-14">
        <Reveal>
          <SectionKicker>Support</SectionKicker>
          <h1 className="mt-3 font-display font-extrabold text-ocean text-4xl sm:text-5xl tracking-tight">
            Raise a support ticket
          </h1>
          <p className="mt-4 text-steel max-w-xl">
            Log a fault, track work in progress, and review past service reports — all in one place.
          </p>
        </Reveal>

        <div className="mt-10">
          <SupportEmbed appUrl={appUrl} />
        </div>
      </div>
    </section>
  )
}
