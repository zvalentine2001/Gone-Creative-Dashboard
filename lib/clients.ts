import { Client } from './types'

export const CLIENTS: Client[] = [
  {
    id: 'dexafit',
    name: 'DexaFit Cleveland',
    adAccountId: '1121640146267372',
    startDate: '2025-05-01',
    contact: 'Ben White',
    status: 'active',
    niche: 'Body Composition Studio',
    color: '#6366f1',
  },
  {
    id: 'platinum-garages',
    name: 'Platinum Garages',
    adAccountId: '849570969975872',
    startDate: '2025-06-01',
    contact: 'Tim / Nilsa / Kiril',
    status: 'active',
    niche: 'Garage Building & Electrical',
    color: '#0ea5e9',
  },
  {
    id: 'goodtime-iii',
    name: 'Good Time III',
    adAccountId: '96545513',
    startDate: '2025-06-09',
    contact: 'Rick Fryan',
    status: 'launching',
    niche: 'Boat Charters',
    color: '#10b981',
  },
]

export function getClient(id: string): Client | undefined {
  return CLIENTS.find((c) => c.id === id)
}
