// All benchmark thresholds sourced from ads-mastery.md
// Each function returns a rating for a given metric value

export type RatingLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'na'

export interface Rating {
  level: RatingLevel
  label: string
}

const NA: Rating = { level: 'na', label: '—' }

// CPL: lower is better
export function rateCPL(cpl: number): Rating {
  if (cpl === 0) return NA
  if (cpl <= 30) return { level: 'excellent', label: 'Great' }
  if (cpl <= 50) return { level: 'good', label: 'Good' }
  if (cpl <= 80) return { level: 'fair', label: 'Poor' }
  return { level: 'poor', label: 'Bad' }
}

// Hook Rate % (2-sec views / impressions * 100): higher is better
export function rateHookRate(pct: number): Rating {
  if (pct === 0) return NA
  if (pct >= 30) return { level: 'excellent', label: 'Excellent' }
  if (pct >= 20) return { level: 'good', label: 'Good' }
  if (pct >= 10) return { level: 'fair', label: 'Fair' }
  return { level: 'poor', label: 'Poor' }
}

// Hook-to-Lead Efficiency % (leads / hook views * 100): higher is better
export function rateHookToLead(pct: number): Rating {
  if (pct === 0) return NA
  if (pct >= 50) return { level: 'excellent', label: 'Exceptional' }
  if (pct >= 40) return { level: 'excellent', label: 'Excellent' }
  if (pct >= 30) return { level: 'good', label: 'Good' }
  if (pct >= 20) return { level: 'fair', label: 'Fair' }
  return { level: 'poor', label: 'Poor' }
}

// Link CTR %: higher is better
export function rateLinkCTR(pct: number): Rating {
  if (pct === 0) return NA
  if (pct >= 1.2) return { level: 'excellent', label: 'Excellent' }
  if (pct >= 0.8) return { level: 'good', label: 'Good' }
  if (pct >= 0.5) return { level: 'fair', label: 'Fair' }
  return { level: 'poor', label: 'Poor' }
}

// Opt-in Rate % (leads / link clicks * 100): higher is better
export function rateOptInRate(pct: number): Rating {
  if (pct === 0) return NA
  if (pct >= 20) return { level: 'excellent', label: 'Excellent' }
  if (pct >= 10) return { level: 'good', label: 'Good' }
  if (pct >= 5) return { level: 'fair', label: 'Fair' }
  return { level: 'poor', label: 'Poor' }
}

// CPC Link ($): lower is better
export function rateCPCLink(cpc: number): Rating {
  if (cpc === 0) return NA
  if (cpc <= 1.5) return { level: 'excellent', label: 'Excellent' }
  if (cpc <= 3.0) return { level: 'good', label: 'Good' }
  if (cpc <= 5.0) return { level: 'fair', label: 'Fair' }
  return { level: 'poor', label: 'Poor' }
}

// CTR All %: higher is better
export function rateCTR(pct: number): Rating {
  if (pct === 0) return NA
  if (pct >= 2.5) return { level: 'excellent', label: 'Excellent' }
  if (pct >= 1.5) return { level: 'good', label: 'Good' }
  if (pct >= 1.0) return { level: 'fair', label: 'Fair' }
  return { level: 'poor', label: 'Poor' }
}

// Frequency: lower is better (after initial exposure)
export function rateFrequency(freq: number): Rating {
  if (freq === 0) return NA
  if (freq <= 2) return { level: 'excellent', label: 'Optimal' }
  if (freq <= 3) return { level: 'fair', label: 'Caution' }
  if (freq <= 5) return { level: 'poor', label: 'High Risk' }
  return { level: 'poor', label: 'Ad Fatigue' }
}

// CPM ($): lower is better
export function rateCPM(cpm: number): Rating {
  if (cpm === 0) return NA
  if (cpm <= 10) return { level: 'excellent', label: 'Excellent' }
  if (cpm <= 20) return { level: 'good', label: 'Good' }
  if (cpm <= 40) return { level: 'fair', label: 'Fair' }
  return { level: 'poor', label: 'Poor' }
}

// CPC All ($): lower is better
export function rateCPCAll(cpc: number): Rating {
  if (cpc === 0) return NA
  if (cpc <= 0.5) return { level: 'excellent', label: 'Excellent' }
  if (cpc <= 1.5) return { level: 'good', label: 'Good' }
  if (cpc <= 3.0) return { level: 'fair', label: 'Fair' }
  return { level: 'poor', label: 'Poor' }
}

// CSS color classes per rating level
export function ratingColor(level: RatingLevel): string {
  switch (level) {
    case 'excellent': return 'text-emerald-400'
    case 'good': return 'text-blue-400'
    case 'fair': return 'text-yellow-400'
    case 'poor': return 'text-red-400'
    default: return 'text-zinc-600'
  }
}

export function ratingBg(level: RatingLevel): string {
  switch (level) {
    case 'excellent': return 'bg-emerald-500/10 text-emerald-400'
    case 'good': return 'bg-blue-500/10 text-blue-400'
    case 'fair': return 'bg-yellow-500/10 text-yellow-400'
    case 'poor': return 'bg-red-500/10 text-red-400'
    default: return ''
  }
}
