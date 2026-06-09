import { Trend } from '@/lib/types'

interface Props {
  trend: Trend
  // For some metrics, up is bad (CPL, frequency). For others, up is good (CTR, hookRate).
  higherIsBad?: boolean
}

export default function TrendBadge({ trend, higherIsBad = false }: Props) {
  if (trend.direction === 'flat') {
    return <span className="text-zinc-500 text-xs">—</span>
  }

  const isUp = trend.direction === 'up'
  const isBad = higherIsBad ? isUp : !isUp

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isBad ? 'text-red-400' : 'text-emerald-400'
      }`}
    >
      {isUp ? '↑' : '↓'} {trend.percentChange.toFixed(0)}%
    </span>
  )
}
