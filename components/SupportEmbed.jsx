'use client'
/* ============================================================
   SUPPORT EMBED — parent side of the Soori ticketing iframe
   Renders the separately-hosted ticketing app (Django REST +
   React, on support.<domain>) inside this site.

   ── The postMessage contract ──────────────────────────────
   Child → us, shaped { source: 'soori-embed', type, ...payload }:
     'height'         { height: number }  content height changed
     'unauthenticated'                    its session ended

   Us → child, shaped { source: 'soori-embed-host', type }:
     'host-ready'                         our listener is live

   A child message with a numeric `height` but no `type` is
   also accepted — older builds send that shape.

   The sender lives in the ticketing repo at
   soori_frontend/src/utils/iframeEmbed.js.
   ============================================================ */
import { useEffect, useRef, useState } from 'react'

// An iframe that can't load (DNS down, CSP refusing to be framed,
// service offline) still fires `load` in most browsers — it just
// renders a browser error page. So `load` proves nothing. The only
// trustworthy "it's alive" signal is the embed script introducing
// itself over postMessage, which can only happen if the real app
// booted. If that hasn't arrived by the time this elapses, we show
// the fallback instead of an indefinite blank box.
const HANDSHAKE_TIMEOUT_MS = 12000

// The baseline height of the embed, and the number to change if it
// should look taller or shorter.
//
// This side owns the baseline because the portal can't report one. Its
// screens are `min-height: 100vh`, and inside a frame `100vh` is the
// frame's own height — so a short screen fills whatever it's given and
// reports back exactly that. Its height messages therefore only ever
// mean "I need MORE than this", never less. We set the floor; it
// raises it when a screen genuinely overflows, and a `navigate`
// message brings it back down here.
const INITIAL_HEIGHT = 560

export default function SupportEmbed({ appUrl, path = '/login' }) {
  const frameRef = useRef(null)
  const [height, setHeight] = useState(INITIAL_HEIGHT)
  // 'connecting' -> 'ready' (handshake received) | 'unreachable' (timed out)
  const [status, setStatus] = useState('connecting')
  const [sessionEnded, setSessionEnded] = useState(false)
  // The frame is only created once someone asks for it. Signing in is a
  // deliberate act by an invited client, not something every visitor to
  // this page is doing — and loading a second app's whole bundle for
  // everyone else is wasted bytes. It also means the portal's own
  // marketing landing page never renders inside our page.
  const [launched, setLaunched] = useState(false)

  // The origin half of appUrl — the only sender we'll trust. Any
  // page can postMessage into this window, so without this check a
  // third-party frame or opener could drive our layout.
  const expectedOrigin = (() => {
    try {
      return new URL(appUrl).origin
    } catch {
      return null
    }
  })()

  // Deep-link straight to the sign-in screen rather than the portal
  // root. Its root is that product's own landing page; after a
  // successful login it routes a customer on to the new-ticket form by
  // itself, so this is the shortest path to raising a ticket.
  const frameSrc = expectedOrigin ? new URL(path, appUrl).toString() : appUrl

  useEffect(() => {
    // No listener and — importantly — no timeout until the frame
    // actually exists, or the "unreachable" timer would fire while the
    // page is sitting idle waiting for a click.
    if (!expectedOrigin || !launched) return

    function onMessage(event) {
      if (event.origin !== expectedOrigin) return
      const data = event.data
      if (!data || data.source !== 'soori-embed') return

      // Any valid message doubles as proof the app is alive.
      setStatus('ready')

      if (data.type === 'unauthenticated') {
        setSessionEnded(true)
        return
      }

      // Moving to another screen: drop back to the compact baseline.
      // The portal can only ever ask to GROW (its screens are
      // 100vh, so inside a frame they fill whatever they're given and
      // can never report needing less). Without this reset, one long
      // ticket list would leave the frame stuck tall for the rest of
      // the session. The height message that follows re-grows it if
      // the new screen actually needs the room.
      if (data.type === 'navigate') {
        setHeight(INITIAL_HEIGHT)
        return
      }

      // 'height', or a legacy message that just carries a number.
      if (typeof data.height === 'number' && Number.isFinite(data.height)) {
        setSessionEnded(false)
        // Guard against a transient 0 during the app's own re-render,
        // which would otherwise collapse the frame to nothing.
        setHeight(Math.max(data.height, 200))
      }
    }

    window.addEventListener('message', onMessage)
    // Tell the embed we're listening. This page is server-rendered, so
    // the browser starts loading the iframe while parsing the HTML —
    // the embedded app is small and reliably boots and broadcasts its
    // height BEFORE this bundle finishes hydrating. Without a ping,
    // that first broadcast is lost, ResizeObserver stays quiet because
    // the content already settled, and a perfectly healthy service
    // reads as an outage. Verified: the embed's posts land before this
    // effect runs.
    ping()
    const timer = setTimeout(() => {
      setStatus((s) => (s === 'connecting' ? 'unreachable' : s))
    }, HANDSHAKE_TIMEOUT_MS)

    return () => {
      window.removeEventListener('message', onMessage)
      clearTimeout(timer)
    }
  }, [expectedOrigin, launched])

  // A ping sent before the frame has a document goes nowhere, so this
  // fires again on load — between the two, one always lands whichever
  // side wins the race.
  function ping() {
    const win = frameRef.current?.contentWindow
    if (!win || !expectedOrigin) return
    win.postMessage({ source: 'soori-embed-host', type: 'host-ready' }, expectedOrigin)
  }

  if (!expectedOrigin) {
    return <EmbedNotice title="Support is not configured" body="NEXT_PUBLIC_TICKETING_APP_URL is missing or not a valid URL." />
  }

  if (status === 'unreachable') {
    return (
      <EmbedNotice
        title="Support portal unavailable"
        body="We couldn't reach the ticketing service. It may be temporarily down — please try again shortly, or contact us directly."
        action={{ href: frameSrc, label: 'Open the portal directly' }}
      />
    )
  }

  if (!launched) {
    return (
      <div className="rounded-2xl border border-cloud bg-mist p-8 sm:p-12 text-center">
        <h2 className="font-display font-bold text-ocean text-xl">Already a client?</h2>
        <p className="mt-2 text-steel text-[15px] max-w-md mx-auto">
          Sign in with the credentials we issued you to raise a ticket and track it through to resolution.
          Accounts are created by our team — there's no public sign-up.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setLaunched(true)}
            className="inline-flex items-center rounded-xl bg-crimson px-6 py-3 text-sm font-bold text-white hover:bg-crimsonD shadow-md shadow-crimson/30 transition-colors"
          >
            Log in to create a ticket
          </button>
          <a
            href="/contact"
            className="inline-flex items-center rounded-xl border border-cloud bg-white px-6 py-3 text-sm font-bold text-ocean hover:border-steel transition-colors"
          >
            Not a client yet?
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {status === 'connecting' && (
        <div className="absolute inset-x-0 top-0 grid place-items-center py-16 pointer-events-none">
          <p className="font-mono text-[11px] tracking-widest uppercase text-steel">Loading support portal…</p>
        </div>
      )}

      {sessionEnded && (
        <p className="mb-4 rounded-lg bg-rose border border-roseMid px-3.5 py-2.5 text-sm text-crimsonDeep">
          Your support session expired. Sign in again below to continue.
        </p>
      )}

      <iframe
        ref={frameRef}
        src={frameSrc}
        title="Support Tickets"
        onLoad={ping}
        // Same-site (a subdomain of this one), so this is a first-party
        // embed — but the allowances are still listed explicitly rather
        // than left to the default, so widening them is a deliberate edit.
        // 'allow-same-origin' is what lets it reach its own API and keep
        // its own storage; without it the app can't authenticate at all.
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
        className="w-full block border-0 bg-white"
        // Exactly the content height the portal reports — no more. Tall
        // screens (a long ticket list) grow the frame instead of
        // scrolling inside it; short ones stay compact.
        style={{ height: `${height}px` }}
      />
    </div>
  )
}

/* Shared shell for the "can't show the embed" states, so a configuration
   problem and an outage read the same way to a visitor. */
function EmbedNotice({ title, body, action }) {
  return (
    <div className="rounded-2xl border border-cloud bg-mist p-8 sm:p-12 text-center">
      <h2 className="font-display font-bold text-ocean text-xl">{title}</h2>
      <p className="mt-2 text-steel text-[15px] max-w-md mx-auto">{body}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {action && (
          <a
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-xl bg-crimson px-5 py-2.5 text-sm font-bold text-white hover:bg-crimsonD transition-colors"
          >
            {action.label}
          </a>
        )}
        <a
          href="/contact"
          className="inline-flex items-center rounded-xl border border-cloud bg-white px-5 py-2.5 text-sm font-bold text-ocean hover:border-steel transition-colors"
        >
          Contact us instead
        </a>
      </div>
    </div>
  )
}
