"use client"

import { useEffect, useRef, useState } from "react"
import { GitPullRequest, GitMerge, MessageSquare, CheckCircle2, Clock, AlertCircle, Zap, GitCommit, Eye, Terminal } from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────

type ReviewLineItem = 
  | { type: "code"; text: string; author?: string }
  | { type: "comment" | "approve" | "change"; text: string; author?: string }
  | { type: "prop"; key: string; val: string };

// ── Data ─────────────────────────────────────────────────────────────────────

const ALL_PRS = [
  { id: 145, title: "feat: multi-agent orchestration v2",      agent: "orchestrator",    status: "review",  comments: 2,  additions: 57,  deletions: 4,  branch: "feat/orchestration-v2", time: "Just now" },
  { id: 144, title: "fix: memory context window overflow",     agent: "analyst-agent",   status: "review",  comments: 1,  additions: 18,  deletions: 3,  branch: "fix/ctx-overflow",      time: "1m ago" },
  { id: 143, title: "feat: streaming tool response",           agent: "monitor-agent",   status: "merged",  comments: 4,  additions: 93,  deletions: 11, branch: "feat/stream-tools",     time: "1m ago" },
  { id: 142, title: "feat: add memory context to executor",    agent: "executor-agent",  status: "merged",  comments: 3,  additions: 84,  deletions: 12, branch: "feat/memory-ctx",       time: "2m ago" },
  { id: 141, title: "fix: rate limit backoff strategy",        agent: "monitor-agent",   status: "approved",comments: 1,  additions: 31,  deletions: 8,  branch: "fix/rate-backoff",      time: "8m ago" },
  { id: 140, title: "feat: parallel tool execution",           agent: "researcher-agent",status: "review",  comments: 5,  additions: 142, deletions: 27, branch: "feat/parallel-tools",   time: "22m ago" },
  { id: 139, title: "refactor: orchestrator pipeline",         agent: "analyst-agent",   status: "merged",  comments: 7,  additions: 209, deletions: 88, branch: "refactor/pipeline",     time: "1h ago" },
]

const ALL_REVIEW_FILES = [
  { file: "agent/executor.ts",    pct: 72 },
  { file: "lib/tools/index.ts",   pct: 45 },
  { file: "core/planner.ts",      pct: 88 },
  { file: "utils/retry.ts",       pct: 31 },
  { file: "agent/memory.ts",      pct: 60 },
]

const ALL_REVIEW_LINES: ReviewLineItem[] = [
  { type: "code",    text: 'const ctx = await memory.load(task.id)' },
  { type: "prop",    key: "scope", val: "global" },
  { type: "comment", text: "Should we cache this per agent run?", author: "analyst-agent" },
  { type: "code",    text: 'return researcher.execute(task, ctx)' },
  { type: "approve", text: "LGTM — memory scope looks correct", author: "monitor-agent" },
  { type: "prop",    key: "retries", val: "3" },
  { type: "code",    text: 'export const run = async (task) => {' },
  { type: "change",  text: "Consider adding retry logic here", author: "executor-agent" },
  { type: "code",    text: '  const plan = await planner.run(goal)' },
  { type: "approve", text: "Approved — ship it", author: "orchestrator" },
  { type: "prop",    key: "timeout", val: "120s" },
  { type: "code",    text: '  await ctx.memory.save(result)' },
  { type: "comment", text: "Add error boundary here", author: "monitor-agent" },
  { type: "code",    text: 'return { status: "done", result }' },
  { type: "approve", text: "All checks pass", author: "analyst-agent" },
]

const COMMITS = [
  { hash: "a3f8c21", msg: "fix: memory leak in long-running agents",    time: "Just now" },
  { hash: "b7d2e09", msg: "feat: streaming response for analyst",        time: "4m ago"   },
  { hash: "c9a1f34", msg: "chore: bump @agentic/sdk to 2.4.1",          time: "12m ago"  },
  { hash: "d4e6b78", msg: "perf: reduce token overhead by 18%",          time: "31m ago"  },
  { hash: "e2c9d56", msg: "feat: add guardrails to executor-agent",      time: "1h ago"   },
]

const ACTIVITY_SEED = Array.from({ length: 35 }, () => ({
  level: Math.random() > 0.4 ? Math.floor(Math.random() * 4) + 1 : 0,
}))

// ── Sub-components ────────────────────────────────────────────────────────────

function MiniBarGraph({ seed }: { seed: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)
  const barsRef   = useRef<number[]>([])

  useEffect(() => {
    const N = 20
    barsRef.current = Array.from({ length: N }, (_, i) => 0.2 + 0.8 * Math.abs(Math.sin((i + seed) * 1.3)))
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const draw = () => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight
      canvas.width  = W * devicePixelRatio; canvas.height = H * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
      ctx.clearRect(0, 0, W, H)
      barsRef.current = barsRef.current.map((v, i) => {
        const target = 0.15 + 0.85 * Math.abs(Math.sin(Date.now() / 3000 + i * 0.8 + seed))
        return v + (target - v) * 0.012
      })
      const gap = 2, bw = (W - gap * (N - 1)) / N
      barsRef.current.forEach((v, i) => {
        ctx.beginPath(); ctx.roundRect(i * (bw + gap), H - (v * H), bw, v * H, 2)
        ctx.fillStyle = `rgba(17,17,17,${0.12 + v * 0.65})`; ctx.fill()
      })
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [seed])
  return <canvas ref={canvasRef} style={{ width: "100%", height: 28, display: "block" }} />
}

function LiveSparkline({ seed }: { seed?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)
  const ptsRef    = useRef<number[]>([])

  useEffect(() => {
    const N = 24
    ptsRef.current = Array.from({ length: N }, (_, i) => 0.1 + 0.7 * Math.abs(Math.sin(i * 0.6 + (seed ?? 0))))
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const draw = () => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight
      canvas.width  = W * devicePixelRatio; canvas.height = H * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
      ctx.clearRect(0, 0, W, H)
      const last = ptsRef.current[ptsRef.current.length - 1]
      const target = 0.1 + 0.85 * (0.5 + 0.5 * Math.sin(Date.now() / 2200 + (seed ?? 0)))
      ptsRef.current = [...ptsRef.current.slice(1), last + (target - last) * 0.04]
      const step = W / (N - 1)
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, "rgba(17,17,17,0.10)"); grad.addColorStop(1, "rgba(17,17,17,0)")
      ctx.beginPath(); ctx.moveTo(0, H)
      ptsRef.current.forEach((v, i) => ctx.lineTo(i * step, H - v * H * 0.9))
      ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = grad; ctx.fill()
      ctx.beginPath(); ptsRef.current.forEach((v, i) => { const x = i * step, y = H - v * H * 0.9; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) })
      ctx.strokeStyle = "rgba(17,17,17,0.75)"; ctx.lineWidth = 1.5; ctx.stroke()
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [seed])
  return <canvas ref={canvasRef} style={{ width: "100%", height: 28, display: "block" }} />
}

function MiniDotGraph({ seed }: { seed?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)
  const ptsRef    = useRef<number[]>([])

  useEffect(() => {
    const N = 18
    ptsRef.current = Array.from({ length: N }, (_, i) => 0.1 + 0.8 * Math.abs(Math.sin(i * 0.9 + (seed ?? 2))))
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const draw = () => {
      const W = canvas.offsetWidth, H = canvas.offsetHeight
      canvas.width  = W * devicePixelRatio; canvas.height = H * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
      ctx.clearRect(0, 0, W, H)
      const last = ptsRef.current[ptsRef.current.length - 1]
      const target = 0.1 + 0.85 * (0.5 + 0.5 * Math.sin(Date.now() / 2800 + (seed ?? 2) * 1.5))
      ptsRef.current = [...ptsRef.current.slice(1), last + (target - last) * 0.03]
      const step = W / (N - 1)
      ctx.beginPath(); ptsRef.current.forEach((v, i) => { const x = i * step, y = H - v * H * 0.88; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) })
      ctx.strokeStyle = "rgba(17,17,17,0.15)"; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([])
      ptsRef.current.forEach((v, i) => { ctx.beginPath(); ctx.arc(i * step, H - v * H * 0.88, 2.2, 0, Math.PI * 2); ctx.fillStyle = `rgba(17,17,17,${0.2 + v * 0.65})`; ctx.fill() })
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [seed])
  return <canvas ref={canvasRef} style={{ width: "100%", height: 28, display: "block" }} />
}

function StatusBadge({ status }: { status: string }) {
  const cfg = {
    merged:   { bg: "rgba(130,80,255,0.1)",  color: "#8250df", icon: <GitMerge style={{ width: 9, height: 9 }} />,  label: "Merged"   },
    approved: { bg: "rgba(40,167,69,0.1)",   color: "#28a745", icon: <CheckCircle2 style={{ width: 9, height: 9 }} />, label: "Approved" },
    review:   { bg: "rgba(201,169,110,0.12)",color: "#b07d30", icon: <Eye style={{ width: 9, height: 9 }} />,       label: "In Review"},
  }[status] ?? { bg: "#eee", color: "#666", icon: null, label: status }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 8, padding: "2px 7px", borderRadius: 99, background: cfg.bg, color: cfg.color, fontFamily: "monospace", fontWeight: 600 }}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

function Bar({ pct, color = "rgba(0,0,0,0.75)" }: { pct: number; color?: string }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(pct), 600); return () => clearTimeout(t) }, [pct])
  return (
    <div style={{ height: 2, background: "rgba(0,0,0,0.07)", borderRadius: 99, width: "100%", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 99, transition: "width 1.4s cubic-bezier(0.16,1,0.3,1)" }} />
    </div>
  )
}

function Counter({ to }: { to: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let s: number | null = null
    const f = (ts: number) => {
      if (!s) s = ts
      const p = Math.min((ts - s) / 1100, 1)
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * to))
      if (p < 1) requestAnimationFrame(f)
    }
    requestAnimationFrame(f)
  }, [to])
  return <>{val}</>
}

function HeatCell({ level, animDelay }: { level: number; animDelay: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), animDelay); return () => clearTimeout(t) }, [animDelay])
  const colors = ["rgba(0,0,0,0.05)", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.32)", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.8)"]
  return <div style={{ width: 9, height: 9, borderRadius: 2, background: colors[level], opacity: visible ? 1 : 0, transition: `opacity 0.4s ease` }} />
}

function ReviewLine({ item, delay }: { item: ReviewLineItem; delay: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])
  if (!visible) return null

  if (item.type === "code") {
    return (
      <div style={{ padding: "3px 10px", background: "rgba(0,0,0,0.04)", borderLeft: "2px solid rgba(0,0,0,0.08)", margin: "2px 0", animation: "logIn 0.2s ease forwards", opacity: 0 }}>
        <code style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(0,0,0,0.55)" }}>{item.text}</code>
      </div>
    )
  }

  if (item.type === "prop") {
    return (
      <div style={{ padding: "2px 10px", display: "flex", gap: 4, fontFamily: "monospace", fontSize: 9, animation: "logIn 0.2s ease forwards", opacity: 0 }}>
        <span style={{ color: "#2563eb" }}>{item.key}</span>
        <span style={{ color: "#111" }}>: </span>
        <span style={{ color: "#16a34a" }}>{item.val}</span>
        <span style={{ color: "#111" }}>,</span>
      </div>
    )
  }

  const iconCfg = {
    approve: { icon: <CheckCircle2 style={{ width: 9, height: 9, color: "#28a745" }} />, color: "#28a745" },
    change:  { icon: <AlertCircle  style={{ width: 9, height: 9, color: "#b07d30" }} />, color: "#b07d30" },
    comment: { icon: <MessageSquare style={{ width: 9, height: 9, color: "rgba(0,0,0,0.35)" }} />, color: "rgba(0,0,0,0.5)" },
  }[item.type]

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-start", padding: "4px 0", animation: "logIn 0.2s ease forwards", opacity: 0 }}>
      {iconCfg.icon}
      <div>
        <span style={{ fontSize: 9, color: iconCfg.color, fontFamily: "monospace" }}>{item.text}</span>
        {item.author && <span style={{ fontSize: 8, color: "rgba(0,0,0,0.3)", marginLeft: 5, fontFamily: "monospace" }}>— {item.author}</span>}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AgentInterface({ revealDelay = 0 }: { revealDelay?: number }) {
  const [revealed, setRevealed]       = useState(false)
  const [mounted, setMounted]         = useState(false)
  const [reqCount, setReqCount]       = useState(1847)
  const [cursor, setCursor]           = useState(true)
  const [prOffset, setPrOffset]       = useState(0)
  const [reviewFileIdx, setReviewFileIdx] = useState(0)
  const [reviewFilePcts, setReviewFilePcts] = useState([72, 45, 88, 31, 60])
  const [reviewLineIdx, setReviewLineIdx]   = useState(0)
  const [activity, setActivity]       = useState(ACTIVITY_SEED)

  useEffect(() => { setTimeout(() => setRevealed(true), revealDelay) }, [revealDelay])
  useEffect(() => { setTimeout(() => setMounted(true), revealDelay + 300) }, [revealDelay])
  useEffect(() => { const t = setInterval(() => setReqCount(v => v + Math.floor(Math.random() * 8 + 2)), 1600); return () => clearInterval(t) }, [])
  useEffect(() => { if (!mounted) return; const t = setInterval(() => setPrOffset(v => (v + 1) % (ALL_PRS.length - 3)), 4000); return () => clearInterval(t) }, [mounted])
  useEffect(() => { if (!mounted) return; const t = setInterval(() => setReviewFilePcts(p => p.map((v, i) => Math.max(10, Math.min(99, v + (i === reviewFileIdx ? Math.random() * 5 : (Math.random() - 0.5)))))), 800); return () => clearInterval(t) }, [mounted, reviewFileIdx])
  useEffect(() => { if (!mounted) return; const t = setInterval(() => setReviewFileIdx(v => (v + 1) % ALL_REVIEW_FILES.length), 2800); return () => clearInterval(t) }, [mounted])
  useEffect(() => { if (!mounted) return; const t = setInterval(() => setReviewLineIdx(p => (p >= ALL_REVIEW_LINES.length ? 0 : p + 1)), 650); return () => clearInterval(t) }, [mounted])
  useEffect(() => { const t = setInterval(() => setCursor(c => !c), 530); return () => clearInterval(t) }, [])

  const anim = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(10px)",
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  })

  const panel: React.CSSProperties = { background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 10, overflow: "hidden" }

  return (
    <div className="relative z-10 flex items-center justify-center pointer-events-none select-none px-3 md:px-8 w-full md:absolute md:inset-0" style={{ paddingTop: "16px", paddingBottom: "16px" }}>
      <div style={{
        width: "100%", maxWidth: 900, background: "rgba(246,245,242,0.96)", border: "1px solid rgba(0,0,0,0.1)", backdropFilter: "blur(32px)", borderRadius: 18, overflow: "hidden",
        boxShadow: "0 28px 70px rgba(0,0,0,0.25)", opacity: revealed ? 1 : 0, transform: revealed ? "translateY(0)" : "translateY(72px)", transition: "all 0.9s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", padding: "9px 14px", borderBottom: "1px solid rgba(0,0,0,0.07)", background: "rgba(255,255,255,0.65)", position: "relative" }}>
          <div style={{ display: "flex", gap: 5 }}>{[ "#ff5f56","#ffbd2e","#27c93f" ].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}</div>
          <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontSize: 10, letterSpacing: "0.18em", color: "rgba(0,0,0,0.28)", fontFamily: "monospace" }}>agentic / platform — main</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          {[
            { label: "PRs Merged", val: 18, icon: <GitMerge size={11} />, graph: <MiniBarGraph seed={0} /> },
            { label: "Reviews", val: 34, icon: <Eye size={11} />, graph: <MiniBarGraph seed={5} /> },
            { label: "Commits", val: 127, icon: <GitCommit size={11} />, graph: <MiniDotGraph seed={2} /> },
            { label: "Tasks/min", val: reqCount, icon: <Zap size={11} />, graph: <LiveSparkline seed={7} /> },
          ].map((m, i) => (
            <div key={i} style={{ padding: "9px 12px", height: 82, borderRight: i < 3 ? "1px solid rgba(0,0,0,0.06)" : "none", ...anim(60 + i * 45) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <span style={{ color: "rgba(0,0,0,0.32)" }}>{m.icon}</span>
                <span style={{ fontSize: 7.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(0,0,0,0.32)", fontFamily: "monospace" }}>{m.label}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "monospace" }}>{mounted ? <Counter to={m.val} /> : "—"}</div>
              {mounted && m.graph}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 0.85fr", gap: 8, padding: 8, height: 340 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, ...anim(160) }}>
            <span style={{ fontSize: 8.5, letterSpacing: "0.13em", color: "rgba(0,0,0,0.38)", fontFamily: "monospace", padding: "0 2px" }}>PULL REQUESTS</span>
            <div style={{ flex: 1, overflow: "hidden" }}>
              {ALL_PRS.slice(prOffset, prOffset + 4).map((pr, i) => (
                <div key={`${pr.id}-${prOffset}`} style={{ ...panel, padding: "8px 10px", marginBottom: 5, animation: i === 0 ? "prSlideIn 0.4s ease both" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 600 }}>{pr.title}</div>
                    <StatusBadge status={pr.status} />
                  </div>
                  <div style={{ fontSize: 7.5, color: "rgba(0,0,0,0.4)", fontFamily: "monospace" }}>{pr.branch} · {pr.agent}</div>
                </div>
              ))}
            </div>
            <div style={{ ...panel, padding: "8px 10px", height: 76 }}>
              <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {activity.map((a, i) => <HeatCell key={i} level={a.level} animDelay={i * 10} />)}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5, ...anim(210) }}>
            <span style={{ fontSize: 8.5, letterSpacing: "0.13em", color: "rgba(0,0,0,0.38)", fontFamily: "monospace", padding: "0 2px" }}>CODE REVIEW</span>
            <div style={{ ...panel, flex: 1, padding: "9px 10px", display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: 9 }}>
                {ALL_REVIEW_FILES.map((f, i) => (
                  <div key={f.file} style={{ marginBottom: 6, opacity: i === reviewFileIdx ? 1 : 0.4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7.5, fontFamily: "monospace", marginBottom: 2 }}>
                      <span>{f.file}</span><span>{Math.round(reviewFilePcts[i])}%</span>
                    </div>
                    <Bar pct={reviewFilePcts[i]} color={i === reviewFileIdx ? "#111" : "#ccc"} />
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: 7, flex: 1, overflow: "hidden" }}>
                {ALL_REVIEW_LINES.slice(0, reviewLineIdx).slice(-5).map((item, i) => (
                  <ReviewLine key={`${reviewLineIdx}-${i}`} item={item} delay={0} />
                ))}
                <span style={{ display: "inline-block", width: 4, height: 9, background: cursor ? "rgba(0,0,0,0.3)" : "transparent" }} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5, ...anim(260) }}>
            <span style={{ fontSize: 8.5, letterSpacing: "0.13em", color: "rgba(0,0,0,0.38)", fontFamily: "monospace", padding: "0 2px" }}>RECENT COMMITS</span>
            <div style={{ ...panel }}>
              {COMMITS.slice(0, 4).map((c) => (
                <div key={c.hash} style={{ padding: "7px 10px", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: 8.5, fontWeight: 500 }}>{c.msg}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7.5, fontFamily: "monospace", color: "#8250df" }}>
                    <span>{c.hash}</span><span style={{ color: "#999" }}>{c.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
