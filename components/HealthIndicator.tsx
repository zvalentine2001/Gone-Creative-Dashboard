import { HealthFlag } from '@/lib/types'

interface Props {
  health: 'red' | 'yellow' | 'green'
  flags: HealthFlag[]
  compact?: boolean
}

export default function HealthIndicator({ health, flags, compact = false }: Props) {
  const dot = {
    green: 'bg-emerald-500',
    yellow: 'bg-yellow-400',
    red: 'bg-red-500',
  }[health]

  const label = {
    green: 'Healthy',
    yellow: 'Watch',
    red: 'Action Needed',
  }[health]

  if (compact) {
    return (
      <span className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <span className="text-xs text-zinc-400">{label}</span>
      </span>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${dot}`} />
        <span className="text-sm font-medium text-white">{label}</span>
      </div>
      {flags.length > 0 && (
        <ul className="space-y-1">
          {flags.map((flag, i) => (
            <li
              key={i}
              className={`text-xs px-2 py-1 rounded ${
                flag.level === 'red'
                  ? 'bg-red-500/10 text-red-400'
                  : flag.level === 'yellow'
                  ? 'bg-yellow-500/10 text-yellow-400'
                  : 'bg-emerald-500/10 text-emerald-400'
              }`}
            >
              {flag.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
