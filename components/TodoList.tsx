'use client'

import { useState } from 'react'
import { Todo } from '@/lib/types'

interface Props {
  clientId: string
}

function getKey(clientId: string) {
  return `gc_todos_${clientId}`
}

function loadTodos(clientId: string): Todo[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(getKey(clientId)) || '[]')
  } catch {
    return []
  }
}

function saveTodos(clientId: string, todos: Todo[]) {
  localStorage.setItem(getKey(clientId), JSON.stringify(todos))
}

export default function TodoList({ clientId }: Props) {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos(clientId))
  const [input, setInput] = useState('')

  function add() {
    if (!input.trim()) return
    const updated = [
      ...todos,
      { id: Date.now().toString(), text: input.trim(), completed: false, createdAt: new Date().toISOString() },
    ]
    setTodos(updated)
    saveTodos(clientId, updated)
    setInput('')
  }

  function toggle(id: string) {
    const updated = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    setTodos(updated)
    saveTodos(clientId, updated)
  }

  function remove(id: string) {
    const updated = todos.filter((t) => t.id !== id)
    setTodos(updated)
    saveTodos(clientId, updated)
  }

  const open = todos.filter((t) => !t.completed)
  const done = todos.filter((t) => t.completed)

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Add a task..."
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={add}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Add
        </button>
      </div>

      {open.length === 0 && done.length === 0 && (
        <p className="text-zinc-500 text-sm">No tasks yet.</p>
      )}

      <ul className="space-y-1">
        {open.map((t) => (
          <li key={t.id} className="flex items-start gap-2 group">
            <button
              onClick={() => toggle(t.id)}
              className="mt-0.5 w-4 h-4 rounded border border-zinc-600 hover:border-indigo-500 flex-shrink-0 transition-colors"
            />
            <span className="text-zinc-300 text-sm flex-1">{t.text}</span>
            <button
              onClick={() => remove(t.id)}
              className="text-zinc-700 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {done.length > 0 && (
        <details className="mt-2">
          <summary className="text-zinc-500 text-xs cursor-pointer hover:text-zinc-400">
            {done.length} completed
          </summary>
          <ul className="space-y-1 mt-2">
            {done.map((t) => (
              <li key={t.id} className="flex items-start gap-2 group">
                <button
                  onClick={() => toggle(t.id)}
                  className="mt-0.5 w-4 h-4 rounded border border-zinc-700 bg-zinc-700 flex-shrink-0"
                />
                <span className="text-zinc-600 text-sm line-through flex-1">{t.text}</span>
                <button
                  onClick={() => remove(t.id)}
                  className="text-zinc-700 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
