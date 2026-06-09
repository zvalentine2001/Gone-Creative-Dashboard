import { ClientMetricsSummary, HealthFlag } from './types'

export function getHealthFlags(metrics: ClientMetricsSummary): HealthFlag[] {
  const flags: HealthFlag[] = []

  // Frequency checks
  if (metrics.frequency >= 3.5) {
    flags.push({ level: 'red', message: `Frequency at ${metrics.frequency.toFixed(1)} — creative is burning out. New ads needed now.` })
  } else if (metrics.frequency >= 2.5) {
    flags.push({ level: 'yellow', message: `Frequency at ${metrics.frequency.toFixed(1)} — creative fatigue incoming. Prep reserve ads.` })
  }

  // CPL trend checks
  if (metrics.cplTrend.direction === 'up' && metrics.cplTrend.percentChange >= 30) {
    flags.push({ level: 'red', message: `CPL up ${metrics.cplTrend.percentChange.toFixed(0)}% vs prior period — test new creative or tighten targeting.` })
  } else if (metrics.cplTrend.direction === 'up' && metrics.cplTrend.percentChange >= 15) {
    flags.push({ level: 'yellow', message: `CPL up ${metrics.cplTrend.percentChange.toFixed(0)}% vs prior period — keep watching.` })
  }

  // Hook rate decline
  if (metrics.hookRateTrend.direction === 'down' && metrics.hookRateTrend.percentChange >= 20) {
    flags.push({ level: 'yellow', message: `Hook rate down ${metrics.hookRateTrend.percentChange.toFixed(0)}% — audience may have seen this creative.` })
  }

  // CTR declining
  if (metrics.ctrTrend.direction === 'down' && metrics.ctrTrend.percentChange >= 25) {
    flags.push({ level: 'yellow', message: `CTR down ${metrics.ctrTrend.percentChange.toFixed(0)}% vs prior period.` })
  }

  // No leads
  if (metrics.leads === 0 && metrics.spend > 0) {
    flags.push({ level: 'red', message: 'No leads recorded this period despite active spend.' })
  }

  return flags
}

export function getOverallHealth(flags: HealthFlag[]): 'red' | 'yellow' | 'green' {
  if (flags.some((f) => f.level === 'red')) return 'red'
  if (flags.some((f) => f.level === 'yellow')) return 'yellow'
  return 'green'
}
