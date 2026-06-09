'use client'

import { useState, useEffect, useCallback } from 'react'
import { CLIENTS } from '@/lib/clients'
import { getHealthFlags, getOverallHealth } from '@/lib/health'
import { ClientMetricsSummary, DatePreset, HealthFlag } from '@/lib/types'
import ClientCard from '@/components/ClientCard'
import DateFilter from '@/components/DateFilter'

interface ClientState {
  summary: ClientMetricsSummary | null
  health: 'red' | 'yellow' | 'green'
  flags: HealthFlag[]
  loading: boolean
  error?: string
}

export default function Dashboard() {
  const [datePreset, setDatePreset] = useState<DatePreset>('last_7d')
  const [clientData, setClientData] = useState<Record<string, ClientState>>(
    Object.fromEntries(
      CLIENTS.map((c) => [c.id, { summary: null, health: 'green', flags: [], loading: true }])
    )
  )

  const fetchAll = useCallback(async (preset: DatePreset) => {
    setClientData((prev) =>
      Object.fromEntries(
        CLIENTS.map((c) => [c.id, { ...prev[c.id], loading: true, error: undefined }])
      )
    )

    await Promise.all(
      CLIENTS.map(async (client) => {
        try {
          const res = await fetch(`/api/insights?accountId=${client.adAccountId}&datePreset=${preset}`)
          const json = await res.json()

          if (!res.ok || json.error) {
            setClientData((prev) => ({
              ...prev,
              [client.id]: { summary: null, health: 'green', flags: [], loading: false, error: json.error || 'Failed to load' },
            }))
            return
          }

          const summary: ClientMetricsSummary = json.summary
          const flags = getHealthFlags(summary)
          const health = getOverallHealth(flags)

          setClientData((prev) => ({
            ...prev,
            [client.id]: { summary, health, flags, loading: false },
          }))
        } catch {
          setClientData((prev) => ({
            ...prev,
            [client.id]: { summary: null, health: 'green', flags: [], loading: false, error: 'Network error' },
          }))
        }
      })
    )
  }, [])

  useEffect(() => {
    fetchAll(datePreset)
  }, [datePreset, fetchAll])

  const allLoaded = CLIENTS.every((c) => !clientData[c.id]?.loading)
  const redCount = CLIENTS.filter((c) => clientData[c.id]?.health === 'red').length
  const yellowCount = CLIENTS.filter((c) => clientData[c.id]?.health === 'yellow').length

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Gone Creative</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Campaign Performance Dashboard</p>
          </div>
          {allLoaded && (
            <div className="flex items-center gap-4 text-sm">
              {redCount > 0 && (
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {redCount} need{redCount === 1 ? 's' : ''} action
                </span>
              )}
              {yellowCount > 0 && (
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  {yellowCount} to watch
                </span>
              )}
              {redCount === 0 && yellowCount === 0 && (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  All healthy
                </span>
              )}
            </div>
          )}
        </div>

        {/* Date Filter */}
        <div className="mb-6">
          <DateFilter value={datePreset} onChange={setDatePreset} />
        </div>

        {/* Client Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CLIENTS.map((client) => {
            const state = clientData[client.id]
            return (
              <ClientCard
                key={client.id}
                client={client}
                summary={state?.summary || null}
                health={state?.health || 'green'}
                flags={state?.flags || []}
                loading={state?.loading ?? true}
                error={state?.error}
              />
            )
          })}
        </div>

        <p className="text-zinc-700 text-xs mt-8 text-center">
          Data from Meta Ads API · Trends compare to prior period · Last refreshed {new Date().toLocaleTimeString()}
        </p>
      </div>
    </main>
  )
}
