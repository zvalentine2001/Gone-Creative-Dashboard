export interface Client {
  id: string
  name: string
  adAccountId: string
  startDate: string
  contact: string
  status: 'active' | 'launching' | 'paused'
  niche: string
  color: string
}

export interface MetaInsights {
  spend: string
  impressions: string
  reach: string
  frequency: string
  ctr: string
  cpc: string
  cpm: string
  leads: string
  cost_per_lead: string
  video_continuous_2_sec_watched_actions?: { action_type: string; value: string }[]
}

export interface CampaignInsights {
  id: string
  name: string
  status: string
  spend: number
  impressions: number
  reach: number
  frequency: number
  ctr: number
  cpc: number
  cpm: number
  leads: number
  cpl: number
  hookRate: number
}

export interface ClientMetricsSummary {
  spend: number
  impressions: number
  leads: number
  cpl: number
  frequency: number
  ctr: number
  cpc: number
  cpm: number
  hookRate: number
  cplTrend: Trend
  frequencyTrend: Trend
  ctrTrend: Trend
  hookRateTrend: Trend
  spendTrend: Trend
}

export interface Trend {
  percentChange: number
  direction: 'up' | 'down' | 'flat'
}

export interface HealthFlag {
  level: 'red' | 'yellow' | 'green'
  message: string
}

export type DatePreset = 'last_7d' | 'last_14d' | 'last_30d' | 'this_month' | 'last_month' | 'maximum'

export interface Note {
  id: string
  text: string
  date: string
}

export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: string
}
