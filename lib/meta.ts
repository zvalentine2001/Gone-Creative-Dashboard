import { CampaignInsights, ClientMetricsSummary, DatePreset, Trend } from './types'

const GRAPH_API = 'https://graph.facebook.com/v21.0'

const FIELDS = [
  'campaign_id',
  'campaign_name',
  'spend',
  'impressions',
  'reach',
  'frequency',
  'ctr',                                    // CTR All
  'cpc',                                    // CPC All
  'cpm',
  'inline_link_clicks',                     // Link clicks
  'inline_link_click_ctr',                  // Link CTR
  'actions',                                // leads via action_type
  'cost_per_action_type',                   // CPL via action_type
  'video_continuous_2_sec_watched_actions', // Hook views
].join(',')

const LEAD_TYPES = ['lead', 'onsite_conversion.lead_grouped']

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
  const data: any[] = json.data || []

  return data.map((d) => {
    const spend = parseFloat(d.spend || '0')
    const impressions = parseFloat(d.impressions || '0')
    const linkClicks = parseFloat(d.inline_link_clicks || '0')
    const linkCtr = parseFloat(d.inline_link_click_ctr || '0')
    const hookViews = parseFloat(
      d.video_continuous_2_sec_watched_actions?.[0]?.value || '0'
    )

    const actions: { action_type: string; value: string }[] = d.actions || []
    const costPerAction: { action_type: string; value: string }[] = d.cost_per_action_type || []
    const leadAction = actions.find((a) => LEAD_TYPES.includes(a.action_type))
    const cplAction = costPerAction.find((a) => LEAD_TYPES.includes(a.action_type))
    const leads = parseFloat(leadAction?.value || '0')
    const cpl = parseFloat(cplAction?.value || '0')

    // 3-second video plays = standard Meta "video_view" action
    // Falls back to 2-sec continuous views if video_view not present
    const videoViewAction = actions.find((a) => a.action_type === 'video_view')
    const threeSecViews = parseFloat(videoViewAction?.value || '0')
    const effectiveHookViews = threeSecViews > 0 ? threeSecViews : hookViews

    const hookRate = impressions > 0 ? (effectiveHookViews / impressions) * 100 : 0
    const hookToLead = effectiveHookViews > 0 ? (leads / effectiveHookViews) * 100 : 0
    const optInRate = linkClicks > 0 ? (leads / linkClicks) * 100 : 0
    const cpcLink = linkClicks > 0 ? spend / linkClicks : 0

    return {
      id: d.campaign_id || '',
      name: d.campaign_name || 'Unknown Campaign',
      status: '',
      spend,
      impressions,
      reach: parseFloat(d.reach || '0'),
      frequency: parseFloat(d.frequency || '0'),
      ctr: parseFloat(d.ctr || '0'),
      cpc: parseFloat(d.cpc || '0'),
      cpm: parseFloat(d.cpm || '0'),
      leads,
      cpl,
      linkClicks,
      linkCtr,
      cpcLink,
      optInRate,
      hookViews: effectiveHookViews,
      hookRate,
      hookToLead,
    }
  })
}

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

export function sumInsights(campaigns: CampaignInsights[]) {
  if (campaigns.length === 0) {
    return {
      spend: 0, impressions: 0, leads: 0, cpl: 0, frequency: 0,
      ctr: 0, cpc: 0, cpm: 0, linkClicks: 0, linkCtr: 0,
      cpcLink: 0, optInRate: 0, hookRate: 0, hookToLead: 0,
    }
  }

  const spend = campaigns.reduce((s, c) => s + c.spend, 0)
  const impressions = campaigns.reduce((s, c) => s + c.impressions, 0)
  const leads = campaigns.reduce((s, c) => s + c.leads, 0)
  const linkClicks = campaigns.reduce((s, c) => s + c.linkClicks, 0)
  const hookViews = campaigns.reduce((s, c) => s + c.hookViews, 0)

  const cpl = leads > 0 ? spend / leads : 0
  const frequency = campaigns.reduce((s, c) => s + c.frequency, 0) / campaigns.length
  const ctr = impressions > 0 ? campaigns.reduce((s, c) => s + c.ctr * c.impressions, 0) / impressions : 0
  const cpc = campaigns.reduce((s, c) => s + c.cpc, 0) / campaigns.length
  const cpm = campaigns.reduce((s, c) => s + c.cpm, 0) / campaigns.length
  const linkCtr = impressions > 0 ? (linkClicks / impressions) * 100 : 0
  const cpcLink = linkClicks > 0 ? spend / linkClicks : 0
  const optInRate = linkClicks > 0 ? (leads / linkClicks) * 100 : 0
  const hookRate = impressions > 0 ? (hookViews / impressions) * 100 : 0
  const hookToLead = hookViews > 0 ? (leads / hookViews) * 100 : 0

  return { spend, impressions, leads, cpl, frequency, ctr, cpc, cpm, linkClicks, linkCtr, cpcLink, optInRate, hookRate, hookToLead }
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
    hookToLeadTrend: calcTrend(cur.hookToLead, prev.hookToLead),
    linkCtrTrend: calcTrend(cur.linkCtr, prev.linkCtr),
    optInRateTrend: calcTrend(cur.optInRate, prev.optInRate),
    spendTrend: calcTrend(cur.spend, prev.spend),
  }
}
