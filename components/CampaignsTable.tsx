import { CampaignInsights } from '@/lib/types'

interface Props {
  campaigns: CampaignInsights[]
}

const statusColors: Record<string, string> = {
  ACTIVE: 'text-emerald-400',
  PAUSED: 'text-zinc-500',
  ARCHIVED: 'text-zinc-600',
  DELETED: 'text-zinc-600',
}

export default function CampaignsTable({ campaigns }: Props) {
  if (campaigns.length === 0) {
    return <p className="text-zinc-500 text-sm">No campaign data for this period.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
            <th className="text-left pb-3 pr-4">Campaign</th>
            <th className="text-right pb-3 px-3">Status</th>
            <th className="text-right pb-3 px-3">Spend</th>
            <th className="text-right pb-3 px-3">Leads</th>
            <th className="text-right pb-3 px-3">CPL</th>
            <th className="text-right pb-3 px-3">Frequency</th>
            <th className="text-right pb-3 px-3">Hook Rate</th>
            <th className="text-right pb-3 px-3">CTR</th>
            <th className="text-right pb-3 pl-3">CPM</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {campaigns.map((c) => (
            <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
              <td className="py-3 pr-4 text-white font-medium max-w-xs truncate">{c.name}</td>
              <td className={`py-3 px-3 text-right text-xs font-medium ${statusColors[c.status] || 'text-zinc-400'}`}>
                {c.status}
              </td>
              <td className="py-3 px-3 text-right text-zinc-300">${c.spend.toFixed(2)}</td>
              <td className="py-3 px-3 text-right text-zinc-300">{c.leads || '—'}</td>
              <td className="py-3 px-3 text-right text-zinc-300">{c.cpl > 0 ? `$${c.cpl.toFixed(2)}` : '—'}</td>
              <td className={`py-3 px-3 text-right font-medium ${c.frequency >= 3.5 ? 'text-red-400' : c.frequency >= 2.5 ? 'text-yellow-400' : 'text-zinc-300'}`}>
                {c.frequency > 0 ? c.frequency.toFixed(2) : '—'}
              </td>
              <td className="py-3 px-3 text-right text-zinc-300">{c.hookRate > 0 ? `${c.hookRate.toFixed(1)}%` : '—'}</td>
              <td className="py-3 px-3 text-right text-zinc-300">{c.ctr > 0 ? `${c.ctr.toFixed(2)}%` : '—'}</td>
              <td className="py-3 pl-3 text-right text-zinc-300">{c.cpm > 0 ? `$${c.cpm.toFixed(2)}` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
