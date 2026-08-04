/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      /* ============================================================
         BRAND PALETTE — sampled directly from the Global Nepal Group logo.
         Change these values to re-skin the entire site in one place.
         ============================================================ */
      colors: {
        // --- CHARCOAL / GUNMETAL TONAL RAMP (sampled from GNG logo 'G's) ---
        abyss:         '#101216',   // near-black charcoal — footers, dark full-bleed bands
        ocean:         '#1C2026',   // primary brand gunmetal — headings, dark card surfaces
        marine:        '#2E3540',   // mid gunmetal — interactive surfaces, cards, dark borders
        steel:         '#5C6470',   // muted steel grey — captions, secondary details
        cloud:         '#D5DAE2',   // crisp border grey
        mist:          '#F0F2F5',   // light silver-gray tint — pill fills, secondary badges
        paper:         '#F8F9FA',   // clean light page background
        ink:           '#101216',   // body text
        navbar:        '#F4F6F8',   // light neutral navbar surface

        // --- BRAND RED TONAL RAMP (sampled from GNG logo 'N' & handshake) ---
        crimsonDeep:   '#8C0B20',   // deep maroon — high-contrast text on light rose
        crimsonD:      '#9E0D22',   // darker brand red — hover states, dark shadows
        crimson:       '#C8102E',   // primary brand red from logo
        crimsonBright: '#E52E4D',   // vibrant red — gradient stops, active glows
        roseMid:       '#F4BFC6',   // mid rose tint — tag borders, highlighted cards
        rose:          '#FDF0F2',   // light rose tint — soft badge fills, pill backgrounds

        // --- LEGACY ALIASES (re-pointed to exact red/charcoal ramp tones) ---
        gold:          '#C8102E',   // brand red (replaces fake gold)
        goldHi:        '#E52E4D',   // bright red (replaces fake yellow gold)
        azure:         '#C8102E',   // brand red accent
      },
      fontFamily: {
        // display = headlines, body = paragraphs, mono = data/labels
        display: ['var(--font-sora)', 'Sora', 'sans-serif'],
        body:    ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono:    ['var(--font-ibm-plex-mono)', '"IBM Plex Mono"', 'monospace'],
      },
      maxWidth: { content: '80rem' }, // 1280px — shared page width
    },
  },
  plugins: [],
}
