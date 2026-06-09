import { NextRequest, NextResponse } from 'next/server'
import { fetchInsights, buildSummary, getPreviousPreset } from '@/lib/meta'
import { DatePreset } from '@/lib/types'

export async function GET(req: NextRequest) {
  const token = process.env.META_ACCESS_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'META_ACCESS_TOKEN not configured' }, { status: 500 })
  }

  const { searchParams } = req.nextUrl
  const accountId = searchParams.get('accountId')
  const datePreset = (searchParams.get('datePreset') as DatePreset) || 'last_7d'
  const mode = searchParams.get('mode') || 'summary' // 'summary' | 'campaigns'

  if (!accountId) {
    return NextResponse.json({ error: 'accountId is required' }, { status: 400 })
  }

  try {
    const [current, previous] = await Promise.all([
      fetchInsights(accountId, datePreset, token),
      fetchInsights(accountId, getPreviousPreset(datePreset), token),
    ])

    if (mode === 'campaigns') {
      return NextResponse.json({ campaigns: current })
    }

    const summary = buildSummary(current, previous)
    return NextResponse.json({ summary, campaigns: current })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch insights' }, { status: 500 })
  }
}
