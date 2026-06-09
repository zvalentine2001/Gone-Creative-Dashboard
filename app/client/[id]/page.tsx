'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getClient } from '@/lib/clients'
import { getHealthFlags, getOverallHealth } from '@/lib/health'
import { buildSummary } from '@/lib/meta'
import { CampaignInsights, ClientMetricsSummary, DatePreset, HealthFlag } from '@/lib/types'
import DateFilter from '@/components/DateFilter'
import MetricCard from '@/components/MetricCard'
import HealthIndicator from '@/components/HealthIndicator'
import CampaignsTable from '@/components/CampaignsTable'
import TodoList from '@/components/TodoList'
import Notes from '@/components/Notes'

export default function ClientPage() {
  const params = useParams()
  const clientId = params.id as string
  const client = getClient(clientId)

  const [datePreset, setDatePreset] = useState<DatePreset>('last_7d')
  const [campaigns, setCampaigns] = useState<CampaignInsights[]>([])
  const [summary, setSummary] = useState<ClientMetricsSummary | null>(null)
  const [flags, setFlags] = useState<HealthFlag[]>([])
  const [health, setHealth] = useState<'red' | 'yellow' | 'green'>('green')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'notes' | 'todos'>('overview')

  const fetchData = useCallback(async (preset: DatePreset) => {
    if (!client) return
    setLoading(true)
    setError(undefined)
    try {
      const res = await fetch(`/api/insights?accountId=${client.adAccountId}&datePreset=${preset}`)
      const json = await res.json()

      if (!res.ok || json.error) {
        setError(json.error || 'Failed to load')
        setLoading(false)
        return
      }

      const s: ClientMetricsSummary = json.summary
      const c: CampaignInsights[] = json.campaigns || []
      const f = getHealthFlags(s)
      const h = getOverallHealth(f)

      setSummary(s)
      setCampaigns(c)
      setFlags(f)
      setHealth(h)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => {
    fetchData(datePreset)
  }, [datePreset, fetchData])

  if (!client) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Client not found.</p>
          <Link href="/" className="text-indigo-400 hover:underline">Back to dashboard</Link>
        </div>
      </main>
    )
  }

  const statusColors = {
    active: 'bg-emerald-500/20 text-emerald-400',
    launching: 'bg-yellow-500/20 text-yellow-400',
    paused: 'bg-zinc-700 text-zinc-400',
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'notes', label: 'Change Log' },
    { id: 'todos', label: 'To-Do' },
  ] as const

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Back nav */}
        <Link href="/" className="text-zinc-500 hover:text-white text-sm flex items-center gap-1 mb-6 transition-colors">
          ← All clients
        </Link>

        {/* Client header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-10 rounded-full" style={{ backgroundColor: client.color }} />
            <div>
              <h1 className="text-2xl font-bold text-white">{client.name}</h1>
              <p className="text-zinc-500 text-sm">{client.niche} · Contact: {client.contact}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[client.status]}`}>
              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
            </span>
            <div className="text-right">
              <p className="text-zinc-500 text-xs">Campaign start</p>
              <p className="text-zinc-300 text-sm font-medium">
                {new Date(client.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Date filter */}
        <div className="mb-6">
          <DateFilter value={datePreset} onChange={setDatePreset} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-zinc-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-white border-indigo-500'
                  : 'text-zinc-500 border-transparent hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-24 bg-zinc-800 rounded-lg" />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && summary && activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Health */}
            {flags.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <h3 className="text-white font-medium mb-3">Health Check</h3>
                <HealthIndicator health={health} flags={flags} />
              </div>
            )}

            {/* Primary metrics */}
            <div>
              <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Primary KPIs</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard
                  label="CPL"
                  value={summary.cpl > 0 ? `$${summary.cpl.toFixed(2)}` : '—'}
                  trend={summary.cplTrend}
                  higherIsBad
                  sub="vs prior period"
                />
                <MetricCard
                  label="Leads"
                  value={summary.leads > 0 ? summary.leads.toString() : '—'}
                />
                <MetricCard
                  label="Spend"
                  value={summary.spend > 0 ? `$${summary.spend.toFixed(0)}` : '—'}
                  trend={summary.spendTrend}
                />
                <MetricCard
                  label="Impressions"
                  value={summary.impressions > 0 ? summary.impressions.toLocaleString() : '—'}
                />
              </div>
            </div>

            {/* Secondary metrics */}
            <div>
              <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Creative & Delivery</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard
                  label="Frequency"
                  value={summary.frequency > 0 ? summary.frequency.toFixed(2) : '—'}
                  trend={summary.frequencyTrend}
                  higherIsBad
                  sub={summary.frequency >= 2.5 ? 'Watch this' : undefined}
                />
                <MetricCard
                  label="Hook Rate"
                  value={summary.hookRate > 0 ? `${summary.hookRate.toFixed(1)}%` : '—'}
                  trend={summary.hookRateTrend}
                  higherIsBad={false}
                />
                <MetricCard
                  label="CTR"
                  value={summary.ctr > 0 ? `${summary.ctr.toFixed(2)}%` : '—'}
                  trend={summary.ctrTrend}
                  higherIsBad={false}
                />
                <MetricCard
                  label="CPM"
                  value={summary.cpm > 0 ? `$${summary.cpm.toFixed(2)}` : '—'}
                  higherIsBad
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
              <MetricCard label="CPC" value={summary.cpc > 0 ? `$${summary.cpc.toFixed(2)}` : '—'} higherIsBad />
              <MetricCard label="Reach" value={summary.impressions > 0 ? summary.impressions.toLocaleString() : '—'} />
            </div>
          </div>
        )}

        {!loading && !error && activeTab === 'campaigns' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-medium mb-4">Campaign Breakdown</h3>
            <CampaignsTable campaigns={campaigns} />
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-medium mb-1">Change Log</h3>
            <p className="text-zinc-500 text-xs mb-4">Budget changes, creative refreshes, observations. Stored locally in your browser.</p>
            <Notes clientId={clientId} />
          </div>
        )}

        {activeTab === 'todos' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-medium mb-1">To-Do</h3>
            <p className="text-zinc-500 text-xs mb-4">Tasks for this client. Stored locally in your browser.</p>
            <TodoList clientId={clientId} />
          </div>
        )}

      </div>
    </main>
  )
}
