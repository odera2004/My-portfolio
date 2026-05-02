"use client"

import { useEffect, useState, useRef } from "react"

const REPOS = ["portfolio-v3", "nexus-api", "framer-motion-utils", "auth-provider", "db-optimizer"]
const ACTIONS = [
  "Pushed commit to main",
  "Optimized image assets",
  "Refactored API middleware",
  "Updated tailwind.config",
  "Compressed production build",
  "Synced database schema",
  "Resolved 3 security alerts",
  "Merged branch 'feature/ui'",
]
const BRANCHES = ["main", "dev", "v2-stable", "patch-01"]
const STATUSES = [
  { label: "success", color: "#10b981" },
  { label: "building", color: "#f59e0b" },
  { label: "deployed", color: "#3b82f6" },
]

type ActivityRow = {
  id: string
  repo: string
  action: string
  branch: string
  status: typeof STATUSES[number]
  progress: number
  key: number
}

function randomRow(key: number): ActivityRow {
  return {
    id: Math.random().toString(36).slice(2, 6).toLowerCase(),
    repo: REPOS[Math.floor(Math.random() * REPOS.length)],
    action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
    branch: BRANCHES[Math.floor(Math.random() * BRANCHES.length)],
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
    progress: Math.floor(Math.random() * 85 + 10),
    key,
  }
}

function ProgressBar({ initial }: { initial: number }) {
  const [pct, setPct] = useState(initial)
  useEffect(() => {
    const t = setInterval(() => {
      setPct(p => (p < 99 ? p + 1 : 100))
    }, 100)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="w-full h-[2px] bg-black/[0.05] rounded-full overflow-hidden">
      <div 
        className="h-full bg-black/30 transition-all duration-500 ease-linear"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function LiveAgentFeed() {
  const [rows, setRows] = useState<ActivityRow[]>([])
  const keyRef = useRef(0)

  useEffect(() => {
    setRows(Array.from({ length: 6 }, (_, i) => randomRow(i)))
    const t = setInterval(() => {
      keyRef.current++
      setRows(prev => [...prev.slice(1), randomRow(keyRef.current)])
    }, 3500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white/70 overflow-hidden shadow-sm backdrop-blur-md">
      {/* Table Header */}
      <div className="grid grid-cols-[100px_1fr_80px_70px] px-4 py-2 bg-black/[0.02] border-bottom border-black/[0.06]">
        {["REPOSITORY", "ACTIVITY", "BRANCH", "STATUS"].map(h => (
          <span key={h} className="text-[8px] font-mono tracking-widest text-black/30">{h}</span>
        ))}
      </div>

      <div className="divide-y divide-black/[0.04]">
        {rows.map((row) => (
          <div key={row.key} className="grid grid-cols-[100px_1fr_80px_70px] px-4 py-3 gap-2 items-center animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
              <div className="text-[10px] font-mono font-bold text-black/60 truncate">{row.repo}</div>
              <div className="text-[8px] font-mono text-black/20">ref: {row.id}</div>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-black/50 truncate mb-1.5">{row.action}</div>
              <ProgressBar initial={row.progress} />
            </div>
            <div className="text-[9px] font-mono text-black/30">/{row.branch}</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: row.status.color }} />
              <span className="text-[9px] font-mono text-black/40">{row.status.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LiveAgentCounter() {
  const [count, setCount] = useState(14200)
  useEffect(() => {
    const t = setInterval(() => setCount(v => v + Math.floor(Math.random() * 5)), 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <span className="font-mono text-6xl md:text-8xl font-light tracking-tighter text-black/80">
      {count.toLocaleString()}
    </span>
  )
}