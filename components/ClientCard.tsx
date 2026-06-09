'use client'

import Link from 'next/link'
import { Client, ClientMetricsSummary, HealthFlag } from '@/lib/types'
import HealthIndicator from './HealthIndicator'
import TrendBadge from './TrendBadge'

interface Props {
  client: Client
  summary: ClientMetricsSummary | null
  health: 'red' | 'yellow' | 'green'
  flags: HealthFlag[]
  loading: boolean
  error?: string
}

function fmt(n: number, prefix = '', decimals = 0) {
  if (n === 0) return '—'
  return prefix + n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export default function ClientCard({ client, summary, health, flags, loading, error }: Props) {
  const statusColors = {
    active: 'bg-emerald-500/20 text-emerald-400',
    launching: 'bg-yellow-500/20 text-yellow-400',
    paused: 'bg-zinc-700 text-zinc-400',
  }

  return (
    <Link href={`/client/${client.id}`}>
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-all cursor-pointer group"
        style={{ borderLeftColor: client.color, borderLeftWidth: 3 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-white font-semibold text-lg group-hover:text-indigo-400 transition-colors">
              {client.name}
            </h2>
            <p className="text-zinc-500 text-sm">{client.niche}</p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[client.status]}`}>
            {client.status === 'launching' ? 'Launching' : client.status.charAt(0).toUpperCase() + client.status.slice(1)}
          </span>
        </div>

        {loading && (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-zinc-800 rounded w-3/4" />
            <div className="h-4 bg-zinc-800 rounded w-1/2" />
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {!loading && !error && summary && (
          <>
            {/* Key metrics grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-zinc-500 text-xs uppercase tracking-wider">CPL</p>
                <p className="text-white text-xl font-semibold">{summary.cpl > 0 ? `$${summary.cpl.toFixed(2)}` : '—'}</p>
                {summary.cplTrend && <TrendBadge trend={summary.cplTrend} higherIsBad />}
              </div>
              <div>
                <p className="text-zinc-500 text-xs uppercase tracking-wider">Leads</p>
                <p className="text-white text-xl font-semibold">{summary.leads > 0 ? summary.leads : '—'}</p>
                {summary.spendTrend && <TrendBadge trend={summary.spendTrend} higherIsBad={false} />}
              </div>
              <div>
                <p className="text-zinc-500 text-xs uppercase tracking-wider">Frequency</p>
                <p className={`text-xl font-semibold ${summary.frequency >= 3.5 ? 'text-red-400' : summary.frequency >= 2.5 ? 'text-yellow-400' : 'text-white'}`}>
                  {summary.frequency > 0 ? summary.frequency.toFixed(2) : '—'}
                </p>
                {summary.frequencyTrend && <TrendBadge trend={summary.frequencyTrend} higherIsBad />}
              </div>
              <div>
                <p className="text-zinc-500 text-xs uppercase tracking-wider">Spend</p>
                <p className="text-white text-xl font-semibold">{fmt(summary.spend, '$')}</p>
              </div>
            </div>

            {/* Hook rate + CTR */}
            <div className="flex gap-4 mb-4 text-sm">
              <div>
                <span className="text-zinc-500">Hook Rate </span>
                <span className="text-white">{summary.hookRate > 0 ? `${summary.hookRate.toFixed(1)}%` : '—'}</span>
                {summary.hookRateTrend && <span className="ml-1"><TrendBadge trend={summary.hookRateTrend} higherIsBad={false} /></span>}
              </div>
              <div>
                <span className="text-zinc-500">CTR </span>
                <span className="text-white">{summary.ctr > 0 ? `${summary.ctr.toFixed(2)}%` : '—'}</span>
              </div>
            </div>

            {/* Health */}
            <div className="border-t border-zinc-800 pt-3">
              <HealthIndicator health={health} flags={flags} compact={flags.length === 0} />
            </div>
          </>
        )}

        {!loading && !error && !summary && (
          <p className="text-zinc-500 text-sm">No data for this period.</p>
        )}

        {/* Footer */}
        <p className="text-zinc-600 text-xs mt-3">
          Started {new Date(client.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {client.contact}
        </p>
      </div>
    </Link>
  )
}
