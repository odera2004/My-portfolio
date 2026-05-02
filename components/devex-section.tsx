"use client"

import { useState, useEffect } from "react"

const STEPS = [
  {
    num: "01",
    title: "Environment",
    desc: "Modular project architecture",
    file: "terminal",
    lang: "bash",
    code: [
      { type: "comment", text: "# Initialize high-performance Next.js 15 stack" },
      { type: "command", text: "npx create-next-app@latest --typescript --tailwind" },
      { type: "gap" },
      { type: "comment", text: "# Installing motion and state management" },
      { type: "command", text: "npm install framer-motion gsap zustand" },
      { type: "gap" },
      { type: "output", text: "✓ Architecture: Atomic Design Pattern" },
      { type: "output", text: "✓ Strict Type-Checking: Enabled" },
      { type: "output", text: "✓ Ready for development" },
    ],
  },
  {
    num: "02",
    title: "UI Logic",
    desc: "Clean, reusable components",
    file: "components/MotionWrapper.tsx",
    lang: "typescript",
    code: [
      { type: "comment", text: "// Standardizing fluid interactions" },
      { type: "keyword", text: "import", after: " { motion } ", keyword2: "from", string: " 'framer-motion'" },
      { type: "gap" },
      { type: "keyword", text: "export const", after: " FadeIn ", keyword2: "=", keyword3: " ({ children }) => { " },
      { type: "gap" },
      { type: "keyword", text: "  return", after: " ( ", keyword2: "", keyword3: "", fn: "motion.div", args: "initial={{ opacity: 0 }} animate={{ opacity: 1 }} />" },
      { type: "plain", text: "  );" },
      { type: "plain", text: "};" },
    ],
  },
  {
    num: "03",
    title: "Optimization",
    desc: "Performance & SEO auditing",
    file: "utils/performance.ts",
    lang: "typescript",
    code: [
      { type: "comment", text: "// Fine-tuning for Core Web Vitals" },
      { type: "keyword", text: "export const", after: " config ", keyword2: "=", keyword3: " { " },
      { type: "prop", key: "  strategy", val: "'isr'" },
      { type: "prop", key: "  compression", val: "true" },
      { type: "prop", key: "  imageOptimization", val: "true" },
      { type: "plain", text: "};" },
      { type: "gap" },
      { type: "comment", text: "// Result: 100/100 Lighthouse Score" },
      { type: "output", text: "LCP: 0.8s | CLS: 0.01 | FID: 12ms" },
    ],
  },
  {
    num: "04",
    title: "Production",
    desc: "Automated CI/CD deployment",
    file: "terminal",
    lang: "bash",
    code: [
      { type: "comment", text: "# Push to production edge nodes" },
      { type: "command", text: "git push origin main" },
      { type: "gap" },
      { type: "output", text: "  Running Vercel build..." },
      { type: "output", text: "  Generating static assets..." },
      { type: "output", text: "  Assigning custom domain..." },
      { type: "gap" },
      { type: "success", text: "✓ Deployment successful" },
      { type: "url", text: "  → https://portfolio.dev/live-status" },
    ],
  },
]

function CodeLine({ line }: { line: (typeof STEPS)[0]["code"][0] }) {
  if (line.type === "gap") return <div className="h-3" />
  if (line.type === "comment") return <div className="text-[#9ca3af]">{line.text}</div>
  if (line.type === "output") return <div className="text-[#6b7280]">{line.text}</div>
  if (line.type === "success") return <div className="text-[#16a34a]">{line.text}</div>
  if (line.type === "url") return <div className="text-[#2563eb] underline">{line.text}</div>
  if (line.type === "command") return (
    <div>
      <span className="text-[#16a34a]">$ </span>
      <span className="text-[#111]">{line.text}</span>
    </div>
  )
  if (line.type === "plain") return <div className="text-[#111]">{line.text}</div>
  if (line.type === "prop") return (
    <div>
      <span className="text-[#2563eb]">{line.key}</span>
      <span className="text-[#111]">: </span>
      <span className="text-[#16a34a]">{line.val}</span>
      <span className="text-[#111]">,</span>
    </div>
  )
  if (line.type === "keyword") return (
    <div>
      <span className="text-[#7c3aed]">{line.text}</span>
      <span className="text-[#111]">{line.after}</span>
      <span className="text-[#7c3aed]">{line.keyword2}</span>
      {line.keyword3 && <span className="text-[#7c3aed]">{line.keyword3}</span>}
      {line.fn && <span className="text-[#b45309]">{line.fn}</span>}
      {line.args && <span className="text-[#111]">{line.args}</span>}
      {line.string && <span className="text-[#16a34a]">{line.string}</span>}
    </div>
  )
  return null
}

export function DevExSection() {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(true)

  function selectStep(i: number) {
    if (i === active) return
    setVisible(false)
    setTimeout(() => {
      setActive(i)
      setVisible(true)
    }, 180)
  }

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setActive(prev => (prev + 1) % STEPS.length)
        setVisible(true)
      }, 180)
    }, 3800)
    return () => clearInterval(t)
  }, [active])

  const step = STEPS[active]

  return (
    <section id="protocol" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] bg-[#fdfcfb]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.04] border border-black/[0.06] text-[10px] tracking-widest text-black/40 uppercase font-bold">
            Development Protocol
          </div>
          <h2 className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
            Engineering standards<br />focused on longevity.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Left Buttons */}
          <div className="flex flex-col gap-3">
            {STEPS.map((s, i) => (
              <button
                key={s.num}
                onClick={() => selectStep(i)}
                className="flex-1 text-left rounded-2xl border transition-all duration-300 p-6 group"
                style={{
                  background: active === i ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.4)",
                  borderColor: active === i ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.04)",
                  boxShadow: active === i ? "0 10px 30px -10px rgba(0,0,0,0.05)" : "none",
                }}
              >
                <div className="flex gap-4 items-start">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold shrink-0 transition-all duration-300"
                    style={{
                      background: active === i ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.04)",
                      color: active === i ? "white" : "rgba(0,0,0,0.3)",
                    }}
                  >
                    {s.num}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-medium transition-colors duration-300"
                      style={{ color: active === i ? "black" : "rgba(0,0,0,0.4)" }}
                    >
                      {s.title}
                    </p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: "rgba(0,0,0,0.3)" }}>{s.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right Code Panel */}
          <div
            className="lg:col-span-2 rounded-3xl border border-black/[0.06] p-2 flex flex-col relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(20px)",
              minHeight: "420px",
            }}
          >
            <div className="bg-white rounded-[20px] p-8 h-full shadow-sm border border-black/[0.03] flex flex-col">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div
                  className="font-mono text-[10px] tracking-widest uppercase transition-all duration-300"
                  style={{
                    opacity: visible ? 1 : 0,
                    color: "rgba(0,0,0,0.4)",
                  }}
                >
                  {step.file}
                </div>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map(d => (
                    <div
                      key={d}
                      className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                      style={{
                        background: d === active ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.1)",
                        transform: d === active ? "scale(1.2)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex-1 rounded-xl p-6 bg-[#f9f9f8] border border-black/[0.03] overflow-hidden">
                <div
                  className="font-mono text-[13px] leading-7"
                  style={{
                    opacity: visible ? 1 : 0,
                    filter: visible ? "blur(0px)" : "blur(8px)",
                    transform: visible ? "translateX(0)" : "translateX(10px)",
                    transition: "all 300ms cubic-bezier(0.16,1,0.3,1)",
                  }}
                >
                  {step.code.map((line, i) => (
                    <CodeLine key={i} line={line} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}