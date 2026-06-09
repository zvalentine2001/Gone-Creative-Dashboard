import { ClientMetricsSummary, HealthFlag } from './types'

export function getHealthFlags(metrics: ClientMetricsSummary): HealthFlag[] {
  const flags: HealthFlag[] = []

  // CPL
  if (metrics.cpl > 80) {
    flags.push({ level: 'red', message: `CPL $${metrics.cpl.toFixed(2)} — Major problem. Check CTR, hook-to-lead efficiency, opt-in rate, CPC, and CPM.` })
  } else if (metrics.cpl > 50) {
    flags.push({ level: 'yellow', message: `CPL $${metrics.cpl.toFixed(2)} — Inefficient. Review key metrics for bottlenecks.` })
  }

  // CPL trend
  if (metrics.cplTrend.direction === 'up' && metrics.cplTrend.percentChange >= 30) {
    flags.push({ level: 'red', message: `CPL up ${metrics.cplTrend.percentChange.toFixed(0)}% vs prior period — test new creative or tighten targeting.` })
  } else if (metrics.cplTrend.direction === 'up' && metrics.cplTrend.percentChange >= 15) {
    flags.push({ level: 'yellow', message: `CPL trending up ${metrics.cplTrend.percentChange.toFixed(0)}% — keep watching.` })
  }

  // Frequency
  if (metrics.frequency > 5) {
    flags.push({ level: 'red', message: `Frequency ${metrics.frequency.toFixed(1)} — Ad fatigue. Change creatives, adjust targeting, or lower budget now.` })
  } else if (metrics.frequency > 3) {
    flags.push({ level: 'red', message: `Frequency ${metrics.frequency.toFixed(1)} — High risk. Expect lower CTR and higher CPC. Prep new creatives.` })
  } else if (metrics.frequency > 2) {
    flags.push({ level: 'yellow', message: `Frequency ${metrics.frequency.toFixed(1)} — Caution zone. Watch for engagement drops.` })
  }

  // Hook Rate
  if (metrics.hookRate > 0 && metrics.hookRate < 10) {
    flags.push({ level: 'red', message: `Hook Rate ${metrics.hookRate.toFixed(1)}% — Ad is being ignored. Rework the hook immediately.` })
  } else if (metrics.hookRate > 0 && metrics.hookRate < 20) {
    flags.push({ level: 'yellow', message: `Hook Rate ${metrics.hookRate.toFixed(1)}% — Below average. Hook may not be strong enough.` })
  }

  // Hook-to-Lead Efficiency
  if (metrics.hookToLead > 0 && metrics.hookToLead < 20) {
    flags.push({ level: 'red', message: `Hook-to-Lead ${metrics.hookToLead.toFixed(1)}% — Hook isn't converting viewers. Fix hook alignment, urgency, and CTA.` })
  } else if (metrics.hookToLead > 0 && metrics.hookToLead < 30) {
    flags.push({ level: 'yellow', message: `Hook-to-Lead ${metrics.hookToLead.toFixed(1)}% — Room to improve. Review hook alignment and CTA.` })
  }

  // Link CTR
  if (metrics.linkCtr > 0 && metrics.linkCtr < 0.5) {
    flags.push({ level: 'red', message: `Link CTR ${metrics.linkCtr.toFixed(2)}% — Ad is not compelling enough to drive clicks. Fix offer, creative, or targeting.` })
  } else if (metrics.linkCtr > 0 && metrics.linkCtr < 0.8) {
    flags.push({ level: 'yellow', message: `Link CTR ${metrics.linkCtr.toFixed(2)}% — Fair. Refine ad creative or targeting.` })
  }

  // Opt-in Rate
  if (metrics.optInRate > 0 && metrics.optInRate < 5) {
    flags.push({ level: 'red', message: `Opt-in Rate ${metrics.optInRate.toFixed(1)}% — People click but don't convert. Fix offer, form, or landing page.` })
  } else if (metrics.optInRate > 0 && metrics.optInRate < 10) {
    flags.push({ level: 'yellow', message: `Opt-in Rate ${metrics.optInRate.toFixed(1)}% — Below ideal. Small improvements to form and offer could help.` })
  }

  // CTR All
  if (metrics.ctr > 0 && metrics.ctr < 1.0) {
    flags.push({ level: 'red', message: `CTR (All) ${metrics.ctr.toFixed(2)}% — Ad is being ignored. Major creative or targeting issues.` })
  } else if (metrics.ctr > 0 && metrics.ctr < 1.5) {
    flags.push({ level: 'yellow', message: `CTR (All) ${metrics.ctr.toFixed(2)}% — Decent, but stronger visuals or hook could help.` })
  }

  // CPM
  if (metrics.cpm > 40) {
    flags.push({ level: 'red', message: `CPM $${metrics.cpm.toFixed(2)} — Too high. Fix targeting, ad quality, and competition factors.` })
  } else if (metrics.cpm > 20) {
    flags.push({ level: 'yellow', message: `CPM $${metrics.cpm.toFixed(2)} — Higher than ideal. Test new audiences, creatives, or placements.` })
  }

  // CPC Link
  if (metrics.cpcLink > 5) {
    flags.push({ level: 'red', message: `CPC Link $${metrics.cpcLink.toFixed(2)} — Too high. Fix offer clarity, creative, and targeting.` })
  } else if (metrics.cpcLink > 3) {
    flags.push({ level: 'yellow', message: `CPC Link $${metrics.cpcLink.toFixed(2)} — Slightly high. Review audience targeting and creatives.` })
  }

  // No leads
  if (metrics.leads === 0 && metrics.spend > 0) {
    flags.push({ level: 'red', message: 'No leads recorded this period despite active spend.' })
  }

  // High CTR All but Low Link CTR (engagement without conversion)
  if (metrics.ctr > 2 && metrics.linkCtr > 0 && metrics.linkCtr < 0.5) {
    flags.push({ level: 'yellow', message: 'High CTR (All) but low Link CTR — people engage but don\'t click the link. Fix CTA.' })
  }

  return flags
}

export function getOverallHealth(flags: HealthFlag[]): 'red' | 'yellow' | 'green' {
  if (flags.some((f) => f.level === 'red')) return 'red'
  if (flags.some((f) => f.level === 'yellow')) return 'yellow'
  return 'green'
}
