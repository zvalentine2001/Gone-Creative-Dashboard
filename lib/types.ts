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

export interface CampaignInsights {
  id: string
  name: string
  status: string
  spend: number
  impressions: number
  reach: number
  frequency: number
  ctr: number          // CTR All
  cpc: number          // CPC All
  cpm: number
  leads: number
  cpl: number
  linkClicks: number
  linkCtr: number      // Link CTR (inline_link_click_ctr)
  cpcLink: number      // CPC Link (spend / linkClicks)
  optInRate: number    // leads / linkClicks * 100
  hookViews: number    // 2-sec video views
  hookRate: number     // hookViews / impressions * 100
  hookToLead: number   // leads / hookViews * 100
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
  linkClicks: number
  linkCtr: number
  cpcLink: number
  optInRate: number
  hookRate: number
  hookToLead: number
  // Trends
  cplTrend: Trend
  frequencyTrend: Trend
  ctrTrend: Trend
  hookRateTrend: Trend
  hookToLeadTrend: Trend
  linkCtrTrend: Trend
  optInRateTrend: Trend
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
