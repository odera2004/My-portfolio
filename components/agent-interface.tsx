"use client"

import { useEffect, useRef, useState } from "react"
import { GitPullRequest, GitMerge, MessageSquare, CheckCircle2, Clock, AlertCircle, Zap, GitCommit, Eye, Terminal } from "lucide-react"

// ── 1. Strict Type Definitions ──────────────────────────────────────────────

type ReviewLineItem = 
  | { type: "code"; text: string; author?: string }
  | { type: "comment" | "approve" | "change"; text: string; author?: string }
  | { type: "prop"; key: string; val: string }; // Strictly define prop shape

// ── 2. Data ──────────────────────────────────────────────────────────────────

const ALL_PRS = [
  { id: 145, title: "feat: multi-agent orchestration v2", agent: "orchestrator", status: "review", comments: 2, additions: 57, deletions: 4, branch: "feat/orchestration-v2", time: "Just now" },
  { id: 144, title: "fix: memory context window overflow", agent: "analyst-agent", status: "review", comments: 1, additions: 18, deletions: 3, branch: "fix/ctx-overflow", time: "1m ago" },
  { id: 143, title: "feat: streaming tool response", agent: "monitor-agent", status: "merged", comments: 4, additions: 93, deletions: 11, branch: "feat/stream-tools", time: "1m ago" },
  { id: 142, title: "feat: add memory context to executor", agent: "executor-agent", status: "merged", comments: 3, additions: 84, deletions: 12, branch: "feat/memory-ctx", time: "2m ago" },
]

const ALL_REVIEW_FILES = [
  { file: "agent/executor.ts", pct: 72 },
  { file: "lib/tools/index.ts", pct: 45 },
  { file: "core/planner.ts", pct: 88 },
  { file: "utils/retry.ts", pct: 31 },
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
  { type: "prop",    key: "timeout", val: "120s" },
  { type: "code",    text: 'return { status: "done", result }' },
  { type: "approve", text: "All checks pass", author: "analyst-agent" },
]

const COMMITS = [
  { hash: "a3f8c21", msg: "fix: memory leak in long-running agents", time: "Just now" },
  { hash: "b7d2e09", msg: "feat: streaming response for analyst", time: "4m ago" },
  { hash: "c9a1f34", msg: "chore: bump @agentic/sdk to 2.4.1", time: "12m ago" },
]

// ── 3. Helper Components ─────────────────────────────────────────────────────

function Bar({ pct, color = "rgba(0,0,0,0.75)" }: { pct: number; color?: string }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(pct), 600); return () => clearTimeout(t) }, [pct])
  return (
    <div style={{ height: 2, background: "rgba(0,0,0,0.07)", borderRadius: 99, width: "100%", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 99, transition: "width 1.4s cubic-bezier(0.16,1,0.3,1)" }} />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cfg = {
    merged:   { bg: "rgba(130,80,255,0.1)",  color: "#8250df", icon: <GitMerge size={9} />,  label: "Merged"   },
    approved: { bg: "rgba(40,167,69,0.1)",   color: "#28a745", icon: <CheckCircle2 size={9} />, label: "Approved" },
    review:   { bg: "rgba(201,169,110,0.12)",color: "#b07d30", icon: <Eye size={9} />,       label: "In Review"},
  }[status] ?? { bg: "#eee", color: "#666", icon: null, label: status }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 8, padding: "2px 7px", borderRadius: 99, background: cfg.bg, color: cfg.color, fontFamily: "monospace", fontWeight: 600 }}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

// ── 4. The Critical Component (Fixed for TS) ─────────────────────────────────

function ReviewLine({ item, delay }: { item: ReviewLineItem; delay: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { 
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t) 
  }, [delay])

  if (!visible) return null

  // Block 1: Handle Properties (The Error Fix)
  if (item.type === "prop") {
    return (
      <div style={{ padding: "2px 10px", display: "flex", gap: 4, fontFamily: "monospace", fontSize: 9 }}>
        <span style={{ color: "#2563eb" }}>{item.key}</span>
        <span style={{ color: "#111" }}>: </span>
        <span style={{ color: "#16a34a" }}>{item.val}</span>
        <span style={{ color: "#111" }}>,</span>
      </div>
    )
  }

  // Block 2: Handle Code
  if (item.type === "code") {
    return (
      <div style={{ padding: "3px 10px", background: "rgba(0,0,0,0.04)", borderLeft: "2px solid rgba(0,0,0,0.08)", margin: "2px 0" }}>
        <code style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(0,0,0,0.55)" }}>{item.text}</code>
      </div>
    )
  }

  // Block 3: Handle Status/Comments
  const iconCfg = {
    approve: { icon: <CheckCircle2 size={9} color="#28a745" />, color: "#28a745" },
    change:  { icon: <AlertCircle  size={9} color="#b07d30" />, color: "#b07d30" },
    comment: { icon: <MessageSquare size={9} color="rgba(0,0,0,0.35)" />, color: "rgba(0,0,0,0.5)" },
  }[item.type]

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-start", padding: "4px 0" }}>
      {iconCfg.icon}
      <div>
        <span style={{ fontSize: 9, color: iconCfg.color, fontFamily: "monospace" }}>{item.text}</span>
        {item.author && <span style={{ fontSize: 8, color: "rgba(0,0,0,0.3)", marginLeft: 5, fontFamily: "monospace" }}>— {item.author}</span>}
      </div>
    </div>
  )
}

// ── 5. Main Component ────────────────────────────────────────────────────────

export function AgentInterface() {
  const [mounted, setMounted] = useState(false)
  const [prOffset, setPrOffset] = useState(0)
  const [reviewFileIdx, setReviewFileIdx] = useState(0)
  const [reviewLineIdx, setReviewLineIdx] = useState(0)

  useEffect(() => { 
    setMounted(true)
    const i1 = setInterval(() => setPrOffset(o => (o + 1) % 2), 4000)
    const i2 = setInterval(() => setReviewFileIdx(i => (i + 1) % 4), 3000)
    const i3 = setInterval(() => setReviewLineIdx(i => (i >= ALL_REVIEW_LINES.length ? 0 : i + 1)), 800)
    return () => { clearInterval(i1); clearInterval(i2); clearInterval(i3); }
  }, [])

  if (!mounted) return null

  return (
    <div style={{ padding: 20, background: "#f9f9f9", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 800, background: "#fff", border: "1px solid #ddd", borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
        
        {/* Header */}
        <div style={{ padding: "12px 16px", background: "#fcfcfc", borderBottom: "1px solid #eee", display: "flex", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27c93f" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
          
          {/* PR Section */}
          <div style={{ padding: 16, borderRight: "1px solid #eee" }}>
            <h3 style={{ fontSize: 10, color: "#999", marginBottom: 12, letterSpacing: "0.1em" }}>ACTIVE PULL REQUESTS</h3>
            {ALL_PRS.slice(prOffset, prOffset + 3).map(pr => (
              <div key={pr.id} style={{ padding: 10, border: "1px solid #eee", borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{pr.title}</div>
                <StatusBadge status={pr.status} />
              </div>
            ))}
          </div>

          {/* Review Section */}
          <div style={{ padding: 16 }}>
            <h3 style={{ fontSize: 10, color: "#999", marginBottom: 12, letterSpacing: "0.1em" }}>AGENT CODE REVIEW</h3>
            <div style={{ marginBottom: 12 }}>
              {ALL_REVIEW_FILES.map((f, i) => (
                <div key={f.file} style={{ marginBottom: 8, opacity: i === reviewFileIdx ? 1 : 0.3 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontFamily: "monospace", marginBottom: 2 }}>
                    <span>{f.file}</span><span>{f.pct}%</span>
                  </div>
                  <Bar pct={f.pct} color={i === reviewFileIdx ? "#2563eb" : "#ccc"} />
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
              {ALL_REVIEW_LINES.slice(0, reviewLineIdx).slice(-4).map((line, idx) => (
                <ReviewLine key={idx} item={line} delay={0} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
