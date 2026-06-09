import { Trend } from '@/lib/types'
import TrendBadge from './TrendBadge'

interface Props {
  label: string
  value: string
  trend?: Trend
  higherIsBad?: boolean
  sub?: string
}

export default function MetricCard({ label, value, trend, higherIsBad, sub }: Props) {
  return (
    <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-4">
      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white text-2xl font-semibold">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        {trend && <TrendBadge trend={trend} higherIsBad={higherIsBad} />}
        {sub && <span className="text-zinc-600 text-xs">{sub}</span>}
      </div>
    </div>
  )
}
