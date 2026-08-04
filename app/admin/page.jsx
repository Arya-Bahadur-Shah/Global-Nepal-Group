import Link from 'next/link'
import { getCounts, listLeads } from '@/lib/admin-data'

export const metadata = { title: 'Dashboard — Admin' }

const CARDS = [
  { key: 'brands', label: 'Brands', href: '/admin/brands', gradient: 'from-ocean to-marine' },
  { key: 'products', label: 'Products', href: '/admin/products', gradient: 'from-crimson to-crimsonBright' },
  { key: 'solutions', label: 'Software Solutions', href: '/admin/solutions', gradient: 'from-marine to-steel' },
  { key: 'industrialSolutions', label: 'Industrial Solutions', href: '/admin/industrial-solutions', gradient: 'from-crimsonDeep to-ocean' },
  { key: 'industries', label: 'Industries', href: '/admin/industries', gradient: 'from-marine to-crimson' },
  { key: 'posts', label: 'Blog posts', href: '/admin/posts', gradient: 'from-crimson to-rose' },
  { key: 'leads', label: 'Leads', href: '/admin/leads', gradient: 'from-ocean to-crimson' },
]

export default function AdminDashboard() {
  const counts = getCounts()
  const recentLeads = listLeads().slice(0, 5)

  return (
    <div>
      <h1 className="font-display font-bold text-ocean text-2xl">Dashboard</h1>
      <p className="mt-1 text-sm text-steel">Manage content and see the latest inquiries.</p>

      {/* User Manual Banner */}
      <div className="admin-fade-in mt-6 rounded-2xl border border-cloud bg-gradient-to-r from-ocean via-marine to-crimsonDeep p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">New Feature</span>
            <span className="text-xs text-white/80">⚡ Automatic URL Slugs Active</span>
          </div>
          <h2 className="font-display font-bold text-xl text-white">User Manual & Media Placement Guide</h2>
          <p className="text-xs text-white/80 max-w-xl">
            Need to know what photo or video goes where? Check the media guide for recommended image sizes, aspect ratios, video specs, and automatic slug creation tips.
          </p>
        </div>
        <Link
          href="/admin/guide"
          className="flex-shrink-0 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-ocean hover:bg-mist hover:text-crimson transition-all shadow-sm flex items-center gap-2"
        >
          <span>Open User Manual</span>
          <span>→</span>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {CARDS.map((c, i) => (
          <Link
            key={c.key}
            href={c.href}
            className={`admin-fade-in admin-card-hover admin-fade-in-${Math.min(i + 1, 5)} group relative overflow-hidden rounded-2xl border border-cloud bg-white p-5`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 transition-opacity duration-200 group-hover:opacity-[0.06]`} />
            <p className={`relative bg-gradient-to-br ${c.gradient} bg-clip-text text-3xl font-display font-bold text-transparent`}>
              {counts[c.key]}
            </p>
            <p className="relative mt-1 text-sm text-steel">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-ocean text-lg">Recent leads</h2>
          <Link href="/admin/leads" className="text-sm font-semibold text-azure hover:text-ocean transition-colors">View all →</Link>
        </div>
        <div className="admin-fade-in mt-4 rounded-2xl border border-cloud bg-white overflow-hidden shadow-sm">
          {recentLeads.length === 0 ? (
            <p className="p-6 text-sm text-steel">No leads yet — they&rsquo;ll show up here as soon as someone submits the contact form or requests a demo.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {recentLeads.map((l) => (
                  <tr key={l.id} className="border-b border-cloud last:border-0 transition-colors hover:bg-mist/60">
                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${l.type === 'demo' ? 'bg-rose text-crimsonDeep' : 'bg-mist text-steel'}`}>
                        {l.type === 'demo' ? 'Demo' : 'Contact'}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-ocean">{l.name}</td>
                    <td className="p-4 text-steel">{l.email}</td>
                    <td className="p-4 text-steel whitespace-nowrap">{new Date(l.at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
