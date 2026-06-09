'use client'

import { useState } from 'react'
import { Note } from '@/lib/types'

interface Props {
  clientId: string
}

function getKey(clientId: string) {
  return `gc_notes_${clientId}`
}

function loadNotes(clientId: string): Note[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(getKey(clientId)) || '[]')
  } catch {
    return []
  }
}

function saveNotes(clientId: string, notes: Note[]) {
  localStorage.setItem(getKey(clientId), JSON.stringify(notes))
}

export default function Notes({ clientId }: Props) {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes(clientId))
  const [input, setInput] = useState('')

  function add() {
    if (!input.trim()) return
    const updated = [
      { id: Date.now().toString(), text: input.trim(), date: new Date().toISOString() },
      ...notes,
    ]
    setNotes(updated)
    saveNotes(clientId, updated)
    setInput('')
  }

  function remove(id: string) {
    const updated = notes.filter((n) => n.id !== id)
    setNotes(updated)
    saveNotes(clientId, updated)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Log a change, observation, or note..."
          rows={2}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
        />
        <button
          onClick={add}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors self-end"
        >
          Log
        </button>
      </div>

      {notes.length === 0 && (
        <p className="text-zinc-500 text-sm">No notes yet. Log budget changes, creative refreshes, observations.</p>
      )}

      <ul className="space-y-2">
        {notes.map((n) => (
          <li key={n.id} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 group">
            <div className="flex items-start justify-between gap-2">
              <p className="text-zinc-300 text-sm whitespace-pre-wrap flex-1">{n.text}</p>
              <button
                onClick={() => remove(n.id)}
                className="text-zinc-700 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                ✕
              </button>
            </div>
            <p className="text-zinc-600 text-xs mt-1">
              {new Date(n.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
