'use client'

import { useState, useEffect, useRef } from 'react'

type Todo = {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('todos')
    if (saved) setTodos(JSON.parse(saved))
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos, mounted])

  const addTodo = () => {
    const text = input.trim()
    if (!text) return
    setTodos(prev => [
      { id: crypto.randomUUID(), text, completed: false, createdAt: Date.now() },
      ...prev,
    ])
    setInput('')
    inputRef.current?.focus()
  }

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  const remaining = todos.filter(t => !t.completed).length

  return (
    <main className="min-h-screen flex items-start justify-center pt-16 pb-16 px-4">
      <div className="w-full max-w-lg">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            やること
          </h1>
          {mounted && todos.length > 0 && (
            <p className="mt-2 text-sm text-slate-500">
              残り <span className="font-semibold text-indigo-500">{remaining}</span> 件
            </p>
          )}
        </div>

        {/* 入力フォーム */}
        <div className="flex gap-2 mb-6">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder="新しいタスクを入力..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm text-slate-700 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          />
          <button
            onClick={addTodo}
            disabled={!input.trim()}
            className="px-5 py-3 rounded-xl bg-indigo-500 text-white text-sm font-medium shadow-sm hover:bg-indigo-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
          >
            追加
          </button>
        </div>

        {/* タスクリスト */}
        {mounted && (
          <>
            {todos.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <div className="text-5xl mb-3">📝</div>
                <p className="text-sm">タスクがありません。追加してみましょう！</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {todos.map(todo => (
                  <li
                    key={todo.id}
                    className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 shadow-sm border border-slate-100 group transition-all duration-200 hover:shadow-md"
                  >
                    {/* チェックボックス */}
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        todo.completed
                          ? 'bg-emerald-400 border-emerald-400'
                          : 'border-slate-300 hover:border-indigo-400'
                      }`}
                      aria-label={todo.completed ? '未完了に戻す' : '完了にする'}
                    >
                      {todo.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    {/* テキスト */}
                    <span
                      className={`flex-1 text-sm leading-relaxed transition-all duration-200 ${
                        todo.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-700'
                      }`}
                    >
                      {todo.text}
                    </span>

                    {/* 削除ボタン */}
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-50 transition-all duration-150"
                      aria-label="削除"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* 完了済みを一括削除 */}
            {todos.some(t => t.completed) && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setTodos(prev => prev.filter(t => !t.completed))}
                  className="text-xs text-slate-400 hover:text-red-400 transition-colors duration-150 underline underline-offset-2"
                >
                  完了済みをすべて削除
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
