import Link from 'next/link'

export const metadata = { title: 'User Manual & Media Guide — Admin' }

const MEDIA_GUIDE = [
  {
    category: 'Brands',
    badge: 'Hardware & Brand Pages',
    items: [
      {
        title: 'Brand Logo',
        type: 'Image',
        specs: 'PNG / SVG (Transparent background recommended)',
        dimension: '400 × 300 px (4:3 aspect ratio)',
        where: 'Displayed on Brand cards in /hardware directory & Brand detail header.',
        note: 'Keep logos centered with padding around edges for clean rendering on light backgrounds.',
      },
      {
        title: 'Brand Hero Image',
        type: 'Image',
        specs: 'JPG / WebP (High quality)',
        dimension: '1920 × 1080 px (16:9 aspect ratio)',
        where: 'Featured as the top hero background image on the individual Brand detail page (/hardware/[brand]).',
        note: 'Used as fallback if no video is uploaded. Choose clear, high-resolution brand product photography.',
      },
      {
        title: 'Brand Hero Video',
        type: 'Video',
        specs: 'MP4 (Video codec H.264, max size 15-20 MB)',
        dimension: '1080p Full HD (16:9 horizontal)',
        where: 'Loops smoothly in the background of the Brand detail hero header.',
        note: 'Audio is muted automatically. Use short, high-energy product clip sequences.',
      },
    ],
  },
  {
    category: 'Products',
    badge: 'Product Catalog',
    items: [
      {
        title: 'Main Product Image',
        type: 'Image',
        specs: 'PNG / WebP (Isolated white or transparent background)',
        dimension: '800 × 800 px (1:1 square ratio)',
        where: 'Main image shown on /hardware product grid, brand listing tabs, and top product detail page.',
        note: 'Ensure product is centered and clearly lit.',
      },
      {
        title: 'Gallery Images',
        type: 'Multi-Image',
        specs: 'JPG / PNG / WebP',
        dimension: '800 × 800 px or 1200 × 800 px',
        where: 'Thumbnails & slideshow gallery on the Product detail page.',
        note: 'Upload angle shots, ports, accessories, or product in use.',
      },
      {
        title: 'Spec Sheet / Brochure',
        type: 'PDF Document',
        specs: 'PDF document (max size 10 MB)',
        dimension: 'Standard A4 / Letter document',
        where: 'Linked via a "Download Datasheet" button on the Product detail page.',
        note: 'You can upload a PDF directly or paste an external brochure URL.',
      },
    ],
  },
  {
    category: 'Software & Industrial Solutions',
    badge: 'Enterprise Solutions',
    items: [
      {
        title: 'Solution Logo / Icon',
        type: 'Image',
        specs: 'PNG / SVG (Transparent)',
        dimension: '200 × 200 px (1:1 square)',
        where: 'Displayed on Solution tab cards on homepage & Solution detail header.',
        note: 'Use simple, clean vector icon logos.',
      },
      {
        title: 'Solution Visual Image',
        type: 'Image',
        specs: 'JPG / WebP / PNG',
        dimension: '1200 × 800 px (3:2 ratio)',
        where: 'Main hero illustration banner on /software-solutions and /industrial-solutions detail pages.',
        note: 'Showcases system dashboard, software screenshot, or operational industrial graphic.',
      },
    ],
  },
  {
    category: 'Blog Posts',
    badge: 'Articles & News',
    items: [
      {
        title: 'Cover Image',
        type: 'Image',
        specs: 'JPG / WebP',
        dimension: '1200 × 675 px (16:9 aspect ratio)',
        where: 'Article card cover on /blog & hero banner of the individual Blog Post page.',
        note: 'Vibrant, engaging cover images boost readership.',
      },
    ],
  },
]

export default function AdminGuidePage() {
  return (
    <div className="max-w-4xl space-y-10 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-ocean via-marine to-crimsonDeep p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold uppercase tracking-wider mb-3">
            Admin Documentation
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
            User Manual & Media Guide
          </h1>
          <p className="mt-2 text-white/80 max-w-2xl text-base">
            Everything you need to know about managing content, media asset locations, video guidelines, and automatic slug creation.
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <a href="#media-locations" className="group rounded-2xl border border-cloud bg-white p-5 shadow-sm hover:border-crimson/30 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-rose flex items-center justify-center text-crimson mb-3 group-hover:scale-110 transition-transform">
            📸
          </div>
          <h3 className="font-display font-bold text-ocean text-base">Media Placement Guide</h3>
          <p className="mt-1 text-xs text-steel">Where photos and videos stay on the website & image specs.</p>
        </a>
        <a href="#automatic-slugs" className="group rounded-2xl border border-cloud bg-white p-5 shadow-sm hover:border-azure/30 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-mist flex items-center justify-center text-azure mb-3 group-hover:scale-110 transition-transform">
            ⚡
          </div>
          <h3 className="font-display font-bold text-ocean text-base">Automatic Slugs</h3>
          <p className="mt-1 text-xs text-steel">How URL slugs are generated automatically without manual typing.</p>
        </a>
        <a href="#admin-features" className="group rounded-2xl border border-cloud bg-white p-5 shadow-sm hover:border-marine/30 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-cloud/40 flex items-center justify-center text-marine mb-3 group-hover:scale-110 transition-transform">
            🛠️
          </div>
          <h3 className="font-display font-bold text-ocean text-base">Content Management</h3>
          <p className="mt-1 text-xs text-steel">Step-by-step instructions for publishing & editing items.</p>
        </a>
      </div>

      {/* Section 1: Media Placement Guide */}
      <section id="media-locations" className="space-y-6">
        <div className="border-b border-cloud pb-3">
          <h2 className="font-display font-bold text-ocean text-2xl">📸 Where Photos & Videos Stay</h2>
          <p className="mt-1 text-sm text-steel">Exact specs, aspect ratios, and visual placement map for all media upload fields.</p>
        </div>

        <div className="space-y-8">
          {MEDIA_GUIDE.map((section) => (
            <div key={section.category} className="rounded-2xl border border-cloud bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-cloud/60 pb-3">
                <h3 className="font-display font-bold text-ocean text-xl">{section.category}</h3>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-mist text-steel">{section.badge}</span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {section.items.map((item) => (
                  <div key={item.title} className="rounded-xl border border-cloud/80 bg-mist/30 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-ocean text-base">{item.title}</h4>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        item.type === 'Video' ? 'bg-crimson/10 text-crimson' :
                        item.type === 'Multi-Image' ? 'bg-marine/10 text-marine' :
                        item.type === 'PDF Document' ? 'bg-azure/10 text-azure' : 'bg-ocean/10 text-ocean'
                      }`}>
                        {item.type}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-steel">
                      <p><span className="font-semibold text-ocean">Recommended Size:</span> {item.dimension}</p>
                      <p><span className="font-semibold text-ocean">Format:</span> {item.specs}</p>
                    </div>

                    <div className="pt-2 border-t border-cloud/60">
                      <p className="text-xs font-medium text-ocean">📍 Where it is shown:</p>
                      <p className="text-xs text-steel mt-0.5">{item.where}</p>
                    </div>

                    <div className="rounded-lg bg-white p-2.5 border border-cloud/60 text-[11px] text-steel italic">
                      💡 {item.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Automatic Slugs */}
      <section id="automatic-slugs" className="rounded-2xl border border-cloud bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-azure/10 text-azure flex items-center justify-center font-bold">⚡</div>
          <div>
            <h2 className="font-display font-bold text-ocean text-xl">Automatic URL Slugs</h2>
            <p className="text-xs text-steel">No manual slug entry required!</p>
          </div>
        </div>

        <div className="text-sm text-steel space-y-3 leading-relaxed">
          <p>
            When adding a new Brand, Product, Solution, or Blog Post, <strong className="text-ocean">you do not need to create or type a URL slug</strong>. The system automatically creates a clean, web-safe URL slug directly from the title or name you type!
          </p>

          <div className="rounded-xl bg-mist p-4 font-mono text-xs text-ocean space-y-2 border border-cloud">
            <p className="font-bold text-steel uppercase text-[10px] tracking-wider font-sans">Examples of automatic generation:</p>
            <p>Title: <span className="text-crimson">Zebra ZT411 Printer</span> ➔ Slug: <span className="text-azure">zebra-zt411-printer</span></p>
            <p>Title: <span className="text-crimson">Smart Warehouse RFID</span> ➔ Slug: <span className="text-azure">smart-warehouse-rfid</span></p>
            <p>Title: <span className="text-crimson">Cubix POS Solution</span> ➔ Slug: <span className="text-azure">cubix-pos-solution</span></p>
          </div>

          <p className="text-xs text-steel">
            If you edit an existing item, its existing URL slug is automatically preserved so links shared with customers continue to work smoothly.
          </p>
        </div>
      </section>

      {/* Section 3: Content Management Walkthrough */}
      <section id="admin-features" className="rounded-2xl border border-cloud bg-white p-6 shadow-sm space-y-6">
        <div className="border-b border-cloud pb-3">
          <h2 className="font-display font-bold text-ocean text-2xl">🛠️ Content Management Walkthrough</h2>
          <p className="mt-1 text-sm text-steel">Quick guide to managing your website catalog and lead inquiries.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <h3 className="font-bold text-ocean text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose text-crimson font-bold text-xs flex items-center justify-center">1</span>
              Creating New Items
            </h3>
            <p className="text-steel text-xs leading-relaxed">
              Navigate to Brands, Products, Solutions, or Blog Posts using the sidebar menu. Click the <strong className="text-ocean">+ New</strong> button. Fill in the title, details, and upload images/videos according to the Media Guide above, then click <strong className="text-ocean">Publish / Save</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-ocean text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose text-crimson font-bold text-xs flex items-center justify-center">2</span>
              Editing Existing Content
            </h3>
            <p className="text-steel text-xs leading-relaxed">
              Find any existing item in the table list and click <strong className="text-azure">Edit</strong>. Modify any text or upload a replacement file. If you leave a file field empty, the current photo or video will be kept.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-ocean text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose text-crimson font-bold text-xs flex items-center justify-center">3</span>
              Viewing Customer Leads
            </h3>
            <p className="text-steel text-xs leading-relaxed">
              Click <strong className="text-ocean">Leads</strong> in the sidebar to view all contact form submissions and demo requests. Details include customer name, email, phone, message, and timestamp.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-ocean text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose text-crimson font-bold text-xs flex items-center justify-center">4</span>
              Admin Account Management
            </h3>
            <p className="text-steel text-xs leading-relaxed">
              Manage administrator access under <strong className="text-ocean">Admin Users</strong>. You can create additional admin user accounts or update admin credentials securely.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-cloud flex justify-end">
          <Link href="/admin" className="rounded-xl bg-ocean px-5 py-2.5 text-sm font-semibold text-white hover:bg-crimson transition-colors">
            Return to Dashboard →
          </Link>
        </div>
      </section>
    </div>
  )
}
