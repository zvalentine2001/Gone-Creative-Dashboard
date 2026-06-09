import { CampaignInsights, ClientMetricsSummary, DatePreset, MetaInsights, Trend } from './types'

const GRAPH_API = 'https://graph.facebook.com/v21.0'

// campaign_id and campaign_name are returned automatically at level=campaign
// leads come via actions{action_type:lead}, CPL via cost_per_action_type
const FIELDS = [
  'campaign_id',
  'campaign_name',
  'spend',
  'impressions',
  'reach',
  'frequency',
  'ctr',
  'cpc',
  'cpm',
  'actions',
  'cost_per_action_type',
  'video_continuous_2_sec_watched_actions',
].join(',')

export async function fetchInsights(
  accountId: string,
  datePreset: DatePreset,
  token: string
): Promise<CampaignInsights[]> {
  const url = new URL(`${GRAPH_API}/act_${accountId}/insights`)
  url.searchParams.set('fields', FIELDS)
  url.searchParams.set('date_preset', datePreset)
  url.searchParams.set('level', 'campaign')
  url.searchParams.set('access_token', token)

  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err?.error?.message || 'Meta API error')
  }

  const json = await res.json()
  const data: MetaInsights[] = json.data || []

  return data.map((d) => {
    const impressions = parseFloat(d.impressions || '0')
    const twoSecViews = parseFloat(
      d.video_continuous_2_sec_watched_actions?.[0]?.value || '0'
    )
    const hookRate = impressions > 0 ? (twoSecViews / impressions) * 100 : 0

    // Leads come via actions array, keyed by action_type
    const LEAD_TYPES = ['lead', 'onsite_conversion.lead_grouped']
    const actions: { action_type: string; value: string }[] = (d as any).actions || []
    const costPerAction: { action_type: string; value: string }[] = (d as any).cost_per_action_type || []
    const leadAction = actions.find((a) => LEAD_TYPES.includes(a.action_type))
    const cplAction = costPerAction.find((a) => LEAD_TYPES.includes(a.action_type))
    const leads = parseFloat(leadAction?.value || '0')
    const cpl = parseFloat(cplAction?.value || '0')

    return {
      id: (d as any).campaign_id || '',
      name: (d as any).campaign_name || 'Unknown Campaign',
      status: '',
      spend: parseFloat(d.spend || '0'),
      impressions,
      reach: parseFloat(d.reach || '0'),
      frequency: parseFloat(d.frequency || '0'),
      ctr: parseFloat(d.ctr || '0'),
      cpc: parseFloat(d.cpc || '0'),
      cpm: parseFloat(d.cpm || '0'),
      leads,
      cpl,
      hookRate,
    }
  })
}

// Get the equivalent "previous period" preset
export function getPreviousPreset(preset: DatePreset): DatePreset {
  const map: Record<DatePreset, DatePreset> = {
    last_7d: 'last_14d',
    last_14d: 'last_30d',
    last_30d: 'last_month',
    this_month: 'last_month',
    last_month: 'last_month',
    maximum: 'maximum',
  }
  return map[preset]
}

export function sumInsights(campaigns: CampaignInsights[]): Omit<ClientMetricsSummary, 'cplTrend' | 'frequencyTrend' | 'ctrTrend' | 'hookRateTrend' | 'spendTrend'> {
  if (campaigns.length === 0) {
    return { spend: 0, impressions: 0, leads: 0, cpl: 0, frequency: 0, ctr: 0, cpc: 0, cpm: 0, hookRate: 0 }
  }

  const spend = campaigns.reduce((s, c) => s + c.spend, 0)
  const impressions = campaigns.reduce((s, c) => s + c.impressions, 0)
  const leads = campaigns.reduce((s, c) => s + c.leads, 0)
  const cpl = leads > 0 ? spend / leads : 0
  const frequency = campaigns.reduce((s, c) => s + c.frequency, 0) / campaigns.length
  const ctr = impressions > 0 ? (campaigns.reduce((s, c) => s + c.ctr * c.impressions, 0) / impressions) : 0
  const cpc = campaigns.reduce((s, c) => s + c.cpc, 0) / campaigns.length
  const cpm = campaigns.reduce((s, c) => s + c.cpm, 0) / campaigns.length
  const hookRate = campaigns.reduce((s, c) => s + c.hookRate, 0) / campaigns.length

  return { spend, impressions, leads, cpl, frequency, ctr, cpc, cpm, hookRate }
}

export function calcTrend(current: number, previous: number): Trend {
  if (previous === 0) return { percentChange: 0, direction: 'flat' }
  const pct = ((current - previous) / previous) * 100
  if (Math.abs(pct) < 2) return { percentChange: Math.abs(pct), direction: 'flat' }
  return { percentChange: Math.abs(pct), direction: pct > 0 ? 'up' : 'down' }
}

export function buildSummary(
  current: CampaignInsights[],
  previous: CampaignInsights[]
): ClientMetricsSummary {
  const cur = sumInsights(current)
  const prev = sumInsights(previous)

  return {
    ...cur,
    cplTrend: calcTrend(cur.cpl, prev.cpl),
    frequencyTrend: calcTrend(cur.frequency, prev.frequency),
    ctrTrend: calcTrend(cur.ctr, prev.ctr),
    hookRateTrend: calcTrend(cur.hookRate, prev.hookRate),
    spendTrend: calcTrend(cur.spend, prev.spend),
  }
}
