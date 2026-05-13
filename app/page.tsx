'use client'

import { useState, useEffect, useRef } from 'react'

type Priority = 'high' | 'medium' | 'low'
type Category = 'work' | 'private' | 'other'

type Todo = {
  id: string
  text: string
  completed: boolean
  createdAt: number
  priority: Priority
  deadline: string
  category: Category
}

const PRIORITY_LABEL: Record<Priority, string> = { high: '高', medium: '中', low: '低' }
const CATEGORY_LABEL: Record<Category, string> = { work: '仕事', private: 'プライベート', other: 'その他' }

const PRIORITY_BADGE: Record<Priority, string> = {
  high:   'bg-red-50 text-red-500 border border-red-200',
  medium: 'bg-amber-50 text-amber-500 border border-amber-200',
  low:    'bg-sky-50 text-sky-500 border border-sky-200',
}
const PRIORITY_LEFT: Record<Priority, string> = {
  high:   'border-l-red-400',
  medium: 'border-l-amber-400',
  low:    'border-l-sky-400',
}
const CATEGORY_BADGE: Record<Category, string> = {
  work:    'bg-emerald-100 text-emerald-700',
  private: 'bg-violet-100 text-violet-700',
  other:   'bg-slate-100 text-slate-500',
}

function CircularProgress({ pct }: { pct: number }) {
  const r = 36
  const circ = 2 * Math.PI * r
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#d1fae5" strokeWidth="9" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke="url(#grad)" strokeWidth="9"
          strokeDasharray={circ}
          strokeDashoffset={circ - (pct / 100) * circ}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-lg font-bold text-emerald-600 leading-none">{pct}%</div>
        <div className="text-[10px] text-slate-400 mt-0.5">完了</div>
      </div>
    </div>
  )
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [deadline, setDeadline] = useState('')
  const [category, setCategory] = useState<Category>('work')
  const [filterCat, setFilterCat] = useState<Category | 'all'>('all')
  const [filterPri, setFilterPri] = useState<Priority | 'all'>('all')
  const [newId, setNewId] = useState<string | null>(null)
  const [popId, setPopId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('todos-v3')
    if (saved) setTodos(JSON.parse(saved))
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) localStorage.setItem('todos-v3', JSON.stringify(todos))
  }, [todos, mounted])

  const addTodo = () => {
    const text = input.trim()
    if (!text) return
    const id = crypto.randomUUID()
    setTodos(prev => [
      { id, text, completed: false, createdAt: Date.now(), priority, deadline, category },
      ...prev,
    ])
    setNewId(id)
    setTimeout(() => setNewId(null), 400)
    setInput('')
    inputRef.current?.focus()
  }

  const toggleTodo = (id: string) => {
    setPopId(id)
    setTimeout(() => setPopId(null), 350)
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTodo = (id: string) => setTodos(prev => prev.filter(t => t.id !== id))

  const filtered = todos.filter(t => {
    if (filterCat !== 'all' && t.category !== filterCat) return false
    if (filterPri !== 'all' && t.priority !== filterPri) return false
    return true
  })

  const total = todos.length
  const done = todos.filter(t => t.completed).length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  const isOverdue = (d: string) => {
    if (!d) return false
    const today = new Date(); today.setHours(0, 0, 0, 0)
    return new Date(d) < today
  }

  const formatDate = (d: string) => {
    if (!d) return ''
    const [y, m, day] = d.split('-')
    return `${m}/${day}`
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-10 px-4">
      <div className="w-full max-w-2xl mx-auto space-y-4">

        {/* ── ヘッダー ── */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-emerald-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-emerald-700 tracking-tight">やること</h1>
              <p className="mt-1 text-sm text-slate-500">
                <span className="font-semibold text-emerald-500">{done}</span> / {total} 件完了
                {total > 0 && <span className="ml-2 text-slate-400">残り {total - done} 件</span>}
              </p>
            </div>
            <CircularProgress pct={pct} />
          </div>
          {/* 横プログレスバー */}
          <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          {/* 優先度別内訳 */}
          {total > 0 && (
            <div className="flex gap-3 mt-3 text-xs text-slate-500">
              {(['high', 'medium', 'low'] as Priority[]).map(p => {
                const cnt = todos.filter(t => t.priority === p && !t.completed).length
                return cnt > 0 ? (
                  <span key={p} className={`px-2 py-0.5 rounded-full ${PRIORITY_BADGE[p]}`}>
                    {PRIORITY_LABEL[p]}優先 {cnt}件
                  </span>
                ) : null
              })}
            </div>
          )}
        </div>

        {/* ── 入力フォーム ── */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-emerald-100 p-5">
          <div className="flex gap-2 mb-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
              placeholder="新しいタスクを入力..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition bg-white"
            />
            <button
              onClick={addTodo}
              disabled={!input.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow-sm hover:from-emerald-600 hover:to-teal-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              追加
            </button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* 優先度 */}
            <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1">
              {(['high', 'medium', 'low'] as Priority[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    priority === p
                      ? p === 'high'   ? 'bg-red-500 text-white shadow-sm'
                      : p === 'medium' ? 'bg-amber-400 text-white shadow-sm'
                      :                  'bg-sky-400 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-white'
                  }`}
                >
                  {PRIORITY_LABEL[p]}
                </button>
              ))}
            </div>

            {/* カテゴリ */}
            <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1">
              {(['work', 'private', 'other'] as Category[]).map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    category === c ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:bg-white'
                  }`}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>

            {/* 締め切り */}
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            />
          </div>
        </div>

        {/* ── フィルター ── */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-emerald-100 px-5 py-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-[11px] text-slate-400 font-medium mb-1.5">カテゴリ</p>
              <div className="flex gap-1">
                {(['all', 'work', 'private', 'other'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setFilterCat(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      filterCat === c
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    {c === 'all' ? 'すべて' : CATEGORY_LABEL[c]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium mb-1.5">優先度</p>
              <div className="flex gap-1">
                {(['all', 'high', 'medium', 'low'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setFilterPri(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      filterPri === p
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    {p === 'all' ? 'すべて' : PRIORITY_LABEL[p]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── タスクリスト ── */}
        {mounted && (
          <div>
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <div className="text-5xl mb-3">🌿</div>
                <p className="text-sm">
                  {todos.length === 0
                    ? 'タスクがありません。追加してみましょう！'
                    : 'フィルター条件に一致するタスクがありません'}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {filtered.map(todo => (
                  <li
                    key={todo.id}
                    className={`flex items-start gap-3 bg-white/80 backdrop-blur rounded-2xl px-4 py-3.5 shadow-sm border border-slate-100 border-l-4 group transition-all duration-200 hover:shadow-md ${
                      PRIORITY_LEFT[todo.priority]
                    } ${todo.id === newId ? 'animate-slide-in' : ''}`}
                  >
                    {/* チェックボタン */}
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        todo.completed
                          ? 'bg-emerald-400 border-emerald-400'
                          : 'border-slate-300 hover:border-emerald-400'
                      } ${todo.id === popId ? 'animate-check-pop' : ''}`}
                      aria-label={todo.completed ? '未完了に戻す' : '完了にする'}
                    >
                      {todo.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    {/* テキスト + バッジ */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed transition-all duration-300 ${
                        todo.completed ? 'line-through text-slate-400' : 'text-slate-700'
                      }`}>
                        {todo.text}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_BADGE[todo.category]}`}>
                          {CATEGORY_LABEL[todo.category]}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[todo.priority]}`}>
                          {PRIORITY_LABEL[todo.priority]}優先
                        </span>
                        {todo.deadline && (
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                            todo.completed
                              ? 'bg-slate-100 text-slate-400'
                              : isOverdue(todo.deadline)
                              ? 'bg-red-50 text-red-500 border border-red-200'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            📅 {formatDate(todo.deadline)}
                            {!todo.completed && isOverdue(todo.deadline) && <span>期限切れ</span>}
                          </span>
                        )}
                      </div>
                    </div>

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

            {todos.some(t => t.completed) && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setTodos(prev => prev.filter(t => !t.completed))}
                  className="text-xs text-slate-400 hover:text-red-400 transition-colors underline underline-offset-2"
                >
                  完了済みをすべて削除
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
