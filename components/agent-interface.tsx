"use client"

import { useEffect, useRef, useState } from "react"
import { GitPullRequest, GitMerge, MessageSquare, CheckCircle2, Clock, AlertCircle, Zap, GitCommit, Eye, Terminal } from "lucide-react"

// ── 1. STRUCT TYPES (This prevents your build error) ─────────────────────────

type CodeLine = { type: "code"; text: string };
type StatusLine = { type: "comment" | "approve" | "change"; text: string; author: string };
type PropLine = { type: "prop"; key: string; val: string };

type ReviewLineItem = CodeLine | StatusLine | PropLine;

// ── 2. DATA ──────────────────────────────────────────────────────────────────

const ALL_PRS = [
  { id: 145, title: "feat: multi-agent orchestration v2", agent: "orchestrator", status: "review", branch: "feat/orch-v2" },
  { id: 144, title: "fix: memory context window overflow", agent: "analyst-agent", status: "review", branch: "fix/ctx" },
  { id: 143, title: "feat: streaming tool response", agent: "monitor-agent", status: "merged", branch: "feat/stream" },
];

const ALL_REVIEW_LINES: ReviewLineItem[] = [
  { type: "code",    text: 'const ctx = await memory.load(task.id)' },
  { type: "prop",    key: "scope", val: '"global"' },
  { type: "comment", text: "Should we cache this?", author: "analyst-agent" },
  { type: "code",    text: 'return researcher.execute(task, ctx)' },
  { type: "prop",    key: "timeout", val: "120s" },
  { type: "approve", text: "LGTM — scope looks correct", author: "monitor-agent" },
];

// ── 3. COMPONENTS ────────────────────────────────────────────────────────────

function MiniBarGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 15; i++) {
        const h = 5 + Math.abs(Math.sin(frame * 0.05 + i)) * 15;
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(i * 6, 25 - h, 4, h);
      }
      frame++;
      requestAnimationFrame(draw);
    };
    draw();
  }, []);
  return <canvas ref={canvasRef} width={100} height={25} style={{ width: 100, height: 25 }} />;
}

/**
 * FIXED REVIEW LINE COMPONENT
 * Uses explicit type checking to satisfy the Next.js Build Worker.
 */
function ReviewLine({ item }: { item: ReviewLineItem }) {
  // Narrow to Property Line
  if (item.type === "prop") {
    return (
      <div className="flex gap-1 py-0.5 font-mono text-[10px]">
        <span className="text-blue-600">{item.key}</span>
        <span className="text-gray-400">:</span>
        <span className="text-green-600">{item.val}</span>
        <span className="text-gray-400">,</span>
      </div>
    );
  }

  // Narrow to Code Line
  if (item.type === "code") {
    return (
      <div className="my-0.5 border-l-2 border-gray-100 bg-gray-50/50 px-2 py-1">
        <code className="font-mono text-[10px] text-gray-500">{item.text}</code>
      </div>
    );
  }

  // Narrow to Status/Comment Line
  const color = item.type === "approve" ? "text-green-600" : item.type === "change" ? "text-amber-600" : "text-gray-400";
  return (
    <div className="flex items-start gap-2 py-1">
      <MessageSquare size={10} className="mt-0.5 text-gray-300" />
      <div className="flex flex-col">
        <span className={`font-mono text-[10px] leading-tight ${color}`}>{item.text}</span>
        <span className="text-[8px] text-gray-300">— {item.author}</span>
      </div>
    </div>
  );
}

// ── 4. MAIN INTERFACE ────────────────────────────────────────────────────────

export default function AgentInterface() {
  const [mounted, setMounted] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setLineIdx(prev => (prev >= ALL_REVIEW_LINES.length ? 1 : prev + 1));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdfdfd] p-4 text-slate-900">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        
        {/* Header Strip */}
        <div className="flex items-center justify-between border-bottom border-black/5 bg-gray-50/50 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <div className="font-mono text-[10px] tracking-widest text-gray-400">AGENTIC_CORE // PR_MONITOR</div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            <span className="font-mono text-[9px] text-green-600">LIVE_SYNC</span>
          </div>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-4 border-b border-black/5">
          {[
            { label: "Merged", val: "12", icon: <GitMerge size={12}/> },
            { label: "Commits", val: "148", icon: <GitCommit size={12}/> },
            { label: "Review Time", val: "2m", icon: <Clock size={12}/> },
            { label: "Efficiency", val: "98%", icon: <Zap size={12}/> },
          ].map((m, i) => (
            <div key={i} className="flex flex-col border-r border-black/5 p-4 last:border-r-0">
              <div className="flex items-center gap-2 text-gray-400">
                {m.icon}
                <span className="font-mono text-[8px] uppercase tracking-wider">{m.label}</span>
              </div>
              <div className="mt-1 flex items-end justify-between">
                <span className="font-mono text-xl font-bold">{m.val}</span>
                <MiniBarGraph />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-12 gap-px bg-black/5">
          
          {/* PR List */}
          <div className="col-span-5 bg-white p-4">
            <div className="mb-4 flex items-center gap-2 text-gray-400">
              <GitPullRequest size={12} />
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest">Active Pull Requests</span>
            </div>
            <div className="space-y-2">
              {ALL_PRS.map(pr => (
                <div key={pr.id} className="group rounded-lg border border-black/5 p-3 transition-colors hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <span className="font-sans text-[11px] font-semibold text-gray-800">{pr.title}</span>
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[8px] font-bold uppercase ${pr.status === 'merged' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'}`}>
                      {pr.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 font-mono text-[9px] text-gray-400">
                    <span>{pr.branch}</span>
                    <span>•</span>
                    <span>{pr.agent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Review Feed */}
          <div className="col-span-7 bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Terminal size={12} />
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest">Live Agent Review</span>
              </div>
              <span className="font-mono text-[9px] text-blue-500">ID: #145_EXEC</span>
            </div>
            
            <div className="rounded-xl border border-black/5 bg-gray-50/30 p-4 min-h-[220px]">
              {ALL_REVIEW_LINES.slice(0, lineIdx).map((item, i) => (
                <ReviewLine key={i} item={item} />
              ))}
              <div className="mt-2 h-3 w-1.5 animate-pulse bg-gray-300" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
