"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import { IntroAnimation, INTRO_DURATION_MS, HERO_REVEAL_MS } from "@/components/intro-animation"
import { AgentInterface } from "@/components/agent-interface"
import { PixelIcon } from "@/components/pixel-icon"
import { LiveAgentFeed, LiveAgentCounter } from "@/components/live-agent-feed"
import { RevealText } from "@/components/reveal-text"
import { StackingAgentCards } from "@/components/stacking-agent-cards"
import { MobileNav } from "@/components/mobile-nav"
import { DevExSection } from "@/components/devex-section"

// ─── Intersection Observer hook ──────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// ─── Animated counter ────────────────────────────────────────────────────────
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView()
  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1800
    const step = 16
    const increment = end / (duration / step)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, step)
    return () => clearInterval(timer)
  }, [inView, end])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ─── Bento card ──────────────────────────────────────────────────────────────
function BentoCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView(0.1)
  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-black/[0.07] bg-white overflow-hidden transition-all duration-700 hover:border-black/[0.15] hover:bg-[#fafaf8] ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms, border-color 0.3s ease, background-color 0.3s ease`,
      }}
    >
      {/* Hover glow spot */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,0,0,0.03), transparent 60%)" }}
      />
      {children}
    </div>
  )
}

// ─── Pill tag ─────────────────────────────────────────────────────────────────
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-widest font-sans text-black/40 bg-black/[0.04]">
      {children}
    </span>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AgenticPage() {
  const [email, setEmail] = useState("")
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false)
  const [heroReady, setHeroReady] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const handleIntroDone = useCallback(() => {
    setHeroReady(true)
  }, [])

  // Start video zoom slightly before hero content reveals, for seamless overlap
  useEffect(() => {
    setMounted(true)
    const t = setTimeout(() => setVideoReady(true), HERO_REVEAL_MS)
    return () => clearTimeout(t)

  }, [])

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`)
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`)
  }

  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen font-sans antialiased">

      {/* ── INTRO ANIMATION ───────────────────────────────────────────────── */}
      <IntroAnimation onDone={handleIntroDone} />

      {/* ── STICKY NAV ────────────────────────────────────────────────────── */}
      <MobileNav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative h-screen overflow-hidden">

        {/* Video background — zooms in once intro is done */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/agentic-hero-9yW3wnTNMfn2U6lsVhTTZSJFEvAoSj.mp4"
          style={{
            transform: videoReady ? "scale(1.05)" : "scale(0.85)",
            transition: "transform 2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />



        {/* Progressive blur + light gradient rising from bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "65%", background: "linear-gradient(to top, #F5F4F0 0%, #F5F4F0 18%, rgba(245,244,240,0.85) 35%, rgba(245,244,240,0.5) 55%, rgba(245,244,240,0.15) 75%, transparent 100%)" }} />
        {/* Backdrop blur layers — progressively lighter toward top */}
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "20%", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "38%", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "55%", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />

        {/* Spacer so hero content doesn't sit under the fixed nav */}
        <div className="h-20" />

       {/* Title + metrics — Now using flex-1 and padding for mobile safety */}
<div className="relative z-30 flex flex-col justify-end min-h-[80vh] px-6 md:px-12 pb-12 max-w-5xl">
  {/* Title */}
  <h1
    className="text-5xl sm:text-7xl md:text-8xl font-light text-[#111] leading-[1.1] md:leading-[1.0] tracking-tight mb-8 md:mb-10"
    style={{
      fontFamily: '"IBM Plex Sans", sans-serif',
      opacity: heroReady ? 1 : 0,
      filter: heroReady ? "blur(0px)" : "blur(24px)",
      transform: heroReady ? "translateY(0px)" : "translateY(32px)",
      transition: "opacity 1s cubic-bezier(0.16,1,0.3,1) 0ms, filter 1s cubic-bezier(0.16,1,0.3,1) 0ms, transform 1s cubic-bezier(0.16,1,0.3,1) 0ms",
    }}
  >
    {/* Simplified line breaks for mobile responsiveness */}
    A Developer <br className="hidden sm:block" /> 
    Specialising in <br />
    Crafting Digital <br className="sm:hidden" /> Experiences.
  </h1>

  {/* 3 metrics — flex-wrap added for small phones */}
  <div className="flex flex-wrap gap-x-8 gap-y-6 sm:gap-12">
    {[
      { value: "2+", label: "Years(Experience)" },
      { value: "2+", label: "Projects(Completed)" },
      { value: "180+", label: "Fullstack (capabilities)" },
    ].map((stat, i) => (
      <div
        key={i}
        className="min-w-[100px] sm:min-w-0"
        style={{
          opacity: heroReady ? 1 : 0,
          filter: heroReady ? "blur(0px)" : "blur(16px)",
          transform: heroReady ? "translateY(0px)" : "translateY(20px)",
          transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms`,
        }}
      >
        <div className="text-2xl sm:text-4xl text-[#111] font-light tracking-tight" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>{stat.value}</div>
        <div className="text-[10px] sm:text-xs text-black/40 tracking-widest uppercase mt-1" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>{stat.label}</div>
      </div>
    ))}
  </div>
</div>
      </section>

      {/* ── PLATFORM OVERVIEW (bento) ──────────────────────────────────────── */}
      <section id="work" className="py-32 px-6 md:px-12 lg:px-20 bg-[#f5f4f0]">
  <div className="max-w-6xl mx-auto">
    {/* Section Header */}
    <div className="mb-16">
      <PixelIcon type="platform" size={40} />
      <div className="mt-4"><Tag>SELECTED WORK</Tag></div>
      <RevealText className="mt-5 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05]">
        {"Digital products built\nwith precision & scale."}
      </RevealText>
    </div>

    {/* Balanced Grid: Both cards now take equal 6-column width on desktop */}
    <div className="grid grid-cols-12 gap-6" onMouseMove={handleMouse}>
      
      {/* PROJECT 1: Naires Media */}
      <BentoCard className="col-span-12 md:col-span-6 p-8 min-h-[450px] flex flex-col justify-end relative overflow-hidden group rounded-3xl border border-black/5" delay={0}>
        {/* Link Icon Overlay - Now always visible slightly, brightens on hover */}
        <div className="absolute top-6 right-6 z-30">
           <a href="https://nairesmedia.com" target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-lg flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>
           </a>
        </div>

        {/* Project Image - Grayscale REMOVED for clarity */}
        <img
          src="images/naires.png" 
          alt="Naires Media"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ objectPosition: "center top" }}
        />
        
        {/* Clearer Gradient: Replaces the heavy blur to make text readable */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Content Wrapper - Text is now white for maximum readability against the image */}
        <div className="relative z-20">
          <div className="w-10 h-10 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center mb-4">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">Naires Media</h3>
          <p className="text-sm text-white/80 leading-relaxed max-w-sm">
            High-performance digital marketing architecture and brand scaling. Optimized for conversion and cinematic brand identity.
          </p>
        </div>
      </BentoCard>

      {/* PROJECT 2: FRZN Society */}
      <BentoCard className="col-span-12 md:col-span-6 p-8 min-h-[450px] flex flex-col justify-end relative overflow-hidden group rounded-3xl border border-black/5" delay={120}>
        <div className="absolute top-6 right-6 z-30">
           <a href="https://frznsociety.net" target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-lg flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>
           </a>
        </div>
        
        <img
          src="images/frzn-hero.png" 
          alt="FRZN Society"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ objectPosition: "center top" }}
        />
        
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="relative z-20">
          <div className="w-10 h-10 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">FRZN Society</h3>
          <p className="text-sm text-white/80 leading-relaxed max-w-sm">
            Lifestyle and community-driven web platform. Engineered for a seamless .net experience and modern aesthetics.
          </p>
        </div>
      </BentoCard>

    </div>
  </div>
</section>
      {/* ── BUILD YOUR AGENTS (4 cards) ───────────────────────────────────── */}
      <section id="stack" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
  <div className="max-w-6xl mx-auto">
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
      <div>
        <PixelIcon type="agents" size={40} />
        <div className="mt-4"><Tag>TECHNICAL STACK</Tag></div>
        <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
          {"The tools I use to\nbuild the future."}
        </RevealText>
      </div>
      <p className="text-sm text-black/45 leading-relaxed max-w-xs">
        A curated selection of modern frameworks and languages focused on performance, scalability, and exceptional user experience.
      </p>
    </div>

    {/* This component handles the "Horizontal/Sticky" stacking effect shown in your screenshots */}
    <StackingAgentCards />
  </div>
</section>

      {/* ── ABOUT ──────────────────────────────────────────────────── */}
      <section id="about" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] overflow-hidden bg-[#fdfcfb]">
  <div className="max-w-6xl mx-auto">
    <div className="mb-20">
      <PixelIcon type="workflow" size={40} />
      <div className="mt-4"><Tag>PROFILE & METHOD</Tag></div>
      <RevealText className="mt-5 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05]">
        {"Bridging the gap between\ndesign & engineering."}
      </RevealText>
      
      {/* ── NEW BIOGRAPHY & PHOTO GRID ── */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Your B&W Photo (Col 1-5) */}
        <div className="lg:col-span-5 relative group flex justify-center lg:justify-start">
          {/* Subtle decorative glow on hover */}
          <div 
            className="absolute -inset-6 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-1000"
            style={{ background: 'linear-gradient(to tr, #3b82f6, #10b981)' }}
          />
          
          <img
            src="images/him.png" // Change to your edited B&W filename
            alt="Eugine Odera"
            className="relative rounded-full aspect-square w-full max-w-[280px] md:max-w-[340px] object-cover shadow-2xl border border-black/5"
            style={{
              /* The established vibe: grayscale, high-contrast */
              filter: "grayscale(100%) contrast(1.15) brightness(0.95)",
              
              // Smooth entry animation synced with RevealText
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? "translateY(0px) scale(1)" : "translateY(20px) scale(0.95)",
              transition: "opacity 1.2s cubic-bezier(0.16,1,0.3,1) 150ms, transform 1.2s cubic-bezier(0.16,1,0.3,1) 150ms, filter 0.5s ease",
            }}
          />
          
          {/* Inner glassy depth overlay */}
          <div className="absolute inset-0 rounded-full border border-black/5 pointer-events-none group-hover:shadow-[inset_0_0_80px_rgba(0,0,0,0.1)] transition-shadow duration-500" />
        </div>

        {/* Your LinkedIn Bio Integration (Col 6-12) */}
        <div className="lg:col-span-7 space-y-6">
          <p className="text-xl md:text-2xl text-black/70 leading-snug font-light tracking-tight">
            I&apos;m a passionate <span className="text-black font-medium">frontend developer & UI/UX designer</span> with hands-on experience in tools like <span className="text-emerald-700/80">Figma</span> and <span className="text-blue-700/80">Framer</span>. I love turning ideas into functional, visually appealing digital products.
          </p>
          <div className="h-[1px] w-1/3 bg-black/[0.06]" />
          <p className="text-base text-black/50 leading-relaxed font-light">
            After completing my training at <span className="text-black/80 font-medium">Moringa School</span>, I&apos;ve worked on various projects designing interfaces, collaborating with teams, and practicing real-world development workflows. I&apos;m excited to grow in the tech industry, contribute to impactful products, and keep learning.
          </p>
          
          {/* Key Capabilities Pills */}
          <div className="pt-4 flex flex-wrap gap-2.5">
             {["UI Architecture", "Next.js", "Framer Motion", "Modular Systems"].map((cap, i) => (
               <span key={cap} className="px-3.5 py-1.5 rounded-full border border-black/[0.04] bg-white text-[10px] tracking-widest font-bold text-black/50 uppercase">
                 {cap}
               </span>
             ))}
          </div>
        </div>
      </div>
    </div>

    {/* ── WORKFLOW STEPS ── */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" onMouseMove={handleMouse}>
      {[
        { 
          n: "01", 
          title: "Strategy",  
          desc: "I start by understanding the business logic and user needs. Good code begins with clear intent and strategic planning.", 
          delay: 0,   
          img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/define-5aafAmGBrxZpOqJ3XLHY3n3qzC2I5K.png" 
        },
        { 
          n: "02", 
          title: "Architecture", 
          desc: "Building for scale using Next.js. My systems are designed to be modular, readable, and highly maintainable.", 
          delay: 80,  
          img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/compose-5RT5VR4f1Y3GoFmovqTKLTG4UXp3g2.png" 
        },
        { 
          n: "03", 
          title: "Execution",    
          desc: "Translating complex designs into fluid interfaces. Specialized in high-performance Framer Motion animations.", 
          delay: 140, 
          img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test-zm8guZwxJHtwWsJ7XO4B0CF7GzlNK8.png" 
        },
        { 
          n: "04", 
          title: "Reliability",  
          desc: "Ensuring production-grade quality through rigorous testing. If it isn&apos;t fast and accessible, it isn&apos;t finished.", 
          delay: 200, 
          img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deploy-an8fgHSLzniojkcmRyGGIFQUJF9T5J.png" 
        },
      ].map((step, idx) => (
        <BentoCard 
          key={`workflow-step-${step.n}-${idx}`} // Unique key to prevent hydration/key errors
          className="relative overflow-hidden flex flex-col min-h-[340px] group transition-all duration-500 hover:shadow-xl hover:shadow-black/5" 
          delay={step.delay}
        >
          <div className="absolute inset-x-0 top-0 h-48 pointer-events-none">
            <img
              src={step.img}
              alt={step.title}
              className="w-full h-full object-cover object-top opacity-60 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                maskImage: "linear-gradient(to bottom, black 0%, black 20%, transparent 90%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 20%, transparent 90%)",
              }}
            />
          </div>
          <div className="relative z-10 p-7">
            <span className="font-mono text-[10px] text-black/20 tracking-[0.3em] font-bold block">{step.n}</span>
          </div>
          <div className="relative z-10 px-7 pb-7 mt-auto">
            <h3 className="text-lg font-medium mb-3 tracking-tight group-hover:translate-x-1 transition-transform">{step.title}</h3>
            <p className="text-[13px] text-black/45 leading-relaxed">{step.desc}</p>
          </div>
        </BentoCard>
      ))}
    </div>
  </div>
</section>
      {/* ── INTEGRATIONS ──────────────────────────────────────────────────── */}
      <section id="integrations" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
  <div className="max-w-6xl mx-auto">
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
      <div>
        <PixelIcon type="integrations" size={40} />
        <div className="mt-4"><Tag>CONNECTIVITY</Tag></div>
        <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
          {"Seamlessly connecting\ndigital ecosystems."}
        </RevealText>
      </div>
      <p className="text-sm text-black/45 leading-relaxed max-w-xs">
        Expertise in bridging diverse platforms through custom APIs, webhooks, and secure data pipelines. Building the glue that holds modern software together.
      </p>
    </div>

    {/* Full-width image block with glass cards */}
    <div className="rounded-3xl overflow-hidden border border-black/[0.07] flex flex-col md:block md:relative shadow-sm" onMouseMove={handleMouse}>
      {/* Background Architecture Image */}
      <div className="relative w-full h-[300px] md:h-[520px] shrink-0">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Org%20Arc%20-%20Upscaled-Sk90jShfu7nltLnhoQbaMJC1YaQKuU.png"
          alt="System Integration Architecture"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Subtle overlay to help card contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent md:block hidden" />
      </div>

      {/* Glass Cards - Positioned right on desktop */}
      <div className="flex flex-col gap-4 p-4 md:absolute md:top-1/2 md:-translate-y-1/2 md:right-8 md:p-0 md:w-80 z-20">
        
        {/* Card 1: Custom SDK/Tooling */}
        <div
          className="rounded-2xl border border-white/60 p-6 shadow-xl"
          style={{
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            background: "rgba(255,255,255,0.75)",
          }}
        >
          <Tag>ENGINEERING</Tag>
          <h3 className="mt-4 text-xl font-medium mb-2">Internal Tooling</h3>
          <p className="text-xs text-black/50 leading-relaxed mb-4">Architecting custom internal tools and SDKs to automate business workflows and data ingestion.</p>
          
          {/* Real Developer Code Snippet */}
          <div className="bg-black/[0.03] rounded-xl border border-black/[0.05] p-4 font-mono text-[11px] text-black/60 leading-tight">
            <span className="text-black/30">// init integration</span><br />
            <span className="text-blue-600/80">const</span> service = <span className="text-blue-600/80">await</span> init({"{"}<br />
            {"  "}provider: <span className="text-green-700/80">&apos;OneAcre_API&apos;</span>,<br />
            {"  "}secure: <span className="text-amber-700/80">true</span>,<br />
            {"  "}sync: <span className="text-black/40">(data) =&gt;</span> map(data)<br />
            {"})"}
          </div>
        </div>

        {/* Card 2: Real-time Data */}
        <div
          className="rounded-2xl border border-white/60 p-6 shadow-xl"
          style={{
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            background: "rgba(255,255,255,0.75)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-black/40 tracking-[0.2em] uppercase">Real-Time Data</span>
          </div>
          <p className="text-sm text-black/50 leading-relaxed">
            Implementing WebSockets and Server-Sent Events (SSE) for live tracking and low-latency system updates.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* ── SECURITY & OBSERVABILITY ──────────────────────────────────��──── */}
      <section id="standards" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
  <div className="max-w-6xl mx-auto">
    <div className="mb-16">
      <PixelIcon type="platform" size={40} />
      <div className="mt-4"><Tag>RELIABILITY</Tag></div>
      <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
        {"Architecture designed\nto be resilient."}
      </RevealText>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Left side — Engineering Values */}
      <div className="space-y-8">
        <p className="text-base text-black/50 leading-relaxed max-w-md">
          Great digital products require more than just a clean UI. I focus on the invisible details—type safety, system observability, and scalable patterns—that keep applications running smoothly under pressure.
        </p>

        <div className="space-y-6">
          {[
            { label: "Type-Safe Development", desc: "Using TypeScript across the stack to eliminate runtime errors before they reach production." },
            { label: "State Management", desc: "Architecting efficient data flows that remain performant as applications grow in complexity." },
            { label: "Performance Audit", desc: "Rigorous optimization for Core Web Vitals, ensuring sub-second load times and 60fps interactions." },
          ].map((item) => (
            <div key={item.label} className="flex gap-5 group">
              <div className="w-1 bg-black/5 group-hover:bg-blue-500/40 transition-colors rounded-full shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-black/80 mb-1">{item.label}</h3>
                <p className="text-sm text-black/40 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Professional Standards */}
        <div className="pt-8 flex flex-wrap gap-x-6 gap-y-3">
          {["Modular UI", "Git Flow", "Performance First", "SEO Optimized"].map((badge) => (
            <div key={badge} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] font-bold text-black/25">
              <span className="w-1.5 h-1.5 rounded-full bg-black/10" />
              {badge}
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Interactive "System Health" Visual */}
      <div className="relative group h-full min-h-[350px]">
        <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/[0.05] to-transparent rounded-3xl blur-sm" />
        <div className="relative bg-white/50 backdrop-blur-xl border border-black/[0.05] rounded-2xl p-8 shadow-sm h-full flex flex-col justify-between overflow-hidden">
           
           {/* System Status Mockup */}
           <div>
              <div className="flex items-center justify-between mb-8">
                 <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                 </div>
                 <span className="text-[10px] font-mono text-black/30">LHR_NODE_01</span>
              </div>

              <div className="space-y-5">
                 <div className="h-1 w-full bg-black/[0.03] rounded-full overflow-hidden">
                    <div className="h-full w-[94%] bg-black/20" />
                 </div>
                 <div className="flex justify-between text-[11px] font-mono text-black/40">
                    <span>Build Integrity</span>
                    <span>94%</span>
                 </div>

                 <div className="h-1 w-full bg-black/[0.03] rounded-full overflow-hidden">
                    <div className="h-full w-[98%] bg-emerald-500/40" />
                 </div>
                 <div className="flex justify-between text-[11px] font-mono text-black/40">
                    <span>Performance Score</span>
                    <span>98/100</span>
                 </div>
              </div>
           </div>

           {/* Code Terminal Output */}
           <div className="mt-12 font-mono text-[11px] text-black/30 leading-relaxed bg-black/[0.02] p-4 rounded-xl border border-black/[0.03]">
              <div><span className="text-blue-500/50">info</span> - Collecting page data...</div>
              <div><span className="text-emerald-500/50">success</span> - Compiled successfully.</div>
              <div className="animate-pulse">_</div>
           </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* ── DEVELOPER EXPERIENCE ──────────────────────────────────────────── */}
      <DevExSection />

      {/* ── MARQUEE CAPABILITIES ──────────────────────────────────────────── */}
      <section className="py-0 border-t border-black/[0.06] overflow-hidden select-none">
        <div className="flex border-b border-black/[0.06]" style={{ animation: "marqueeLeft 28s linear infinite" }}>
          {[...Array(3)].map((_, rep) => (
            <div key={rep} className="flex shrink-0">
              {["Web Research", "Code Generation", "Email Drafting", "Data Analysis", "PR Reviews", "Scheduling", "SQL Queries", "API Calls", "File Processing", "Monitoring"].map((cap) => (
                <div key={cap} className="flex items-center gap-6 px-10 py-5 border-r border-black/[0.06] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0" />
                  <span className="text-sm text-black/45 whitespace-nowrap tracking-wide">{cap}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex" style={{ animation: "marqueeRight 22s linear infinite" }}>
          {[...Array(3)].map((_, rep) => (
            <div key={rep} className="flex shrink-0">
              {["Report Writing", "Slack Summaries", "Lead Scoring", "Image Tagging", "Test Running", "Deployment", "Log Parsing", "Invoice Processing", "Meeting Notes", "Sentiment Analysis"].map((cap) => (
                <div key={cap} className="flex items-center gap-6 px-10 py-5 border-r border-black/[0.06] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/12 shrink-0" />
                  <span className="text-sm text-black/30 whitespace-nowrap tracking-wide">{cap}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE AGENTS ��──────────────────────────────────────────────────── */}
      <section id="live" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
  <div className="max-w-6xl mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
      <div>
        <PixelIcon type="platform" size={40} />
        <div className="mt-4"><Tag>LIVE SYSTEM STATUS</Tag></div>
        <RevealText className="mt-5 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05]">
          {"Code that never\nsleeps. Verified."}
        </RevealText>
        <p className="mt-6 text-base text-black/40 leading-relaxed max-w-sm">
          A real-time monitor of my current build activity, deployments, and repository health across the production edge.
        </p>
        <div className="mt-10 flex flex-col gap-1">
          <LiveAgentCounter />
          <span className="text-black/30 text-xs tracking-[0.2em] uppercase font-bold ml-1">Lines of code pushed today</span>
        </div>
      </div>
      <div className="relative">
        {/* Decorative background glow */}
        <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/5 to-emerald-500/5 blur-3xl rounded-full" />
        <LiveAgentFeed />
      </div>
    </div>
  </div>
</section>

      {/* ── PRICING ───────────────────────────────────���────������─────────────── */}
      <section id="pricing" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
  <div className="max-w-5xl mx-auto">
    <div className="text-center mb-16 flex flex-col items-center">
      <PixelIcon type="pricing" size={40} />
      <div className="mt-4"><Tag>SERVICE PRICING</Tag></div>
      <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
        {"Transparent investment\nfor digital excellence."}
      </RevealText>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" onMouseMove={handleMouse}>
      {[
        {
          name: "Lander",
          price: "Inquire",
          sub: "High-conversion landing pages",
          features: ["Single page build", "Next.js + Framer Motion", "SEO Optimization", "Mobile Responsive", "Delivery in 5 days"],
          delay: 0,
        },
        {
          name: "Professional",
          price: "Inquire",
          period: "+",
          sub: "Full-scale business platforms",
          features: ["Multi-page architecture", "CMS Integration", "Custom API Connections", "Advanced Animations", "Priority Support", "Performance Audit"],
          highlight: true,
          delay: 80,
        },
        {
          name: "Custom",
          price: "Inquire",
          sub: "Complex web applications",
          features: ["Fullstack Dashboards", "Authentication Systems", "Database Design", "Scalable Infrastructure", "Retainer Options", "Ongoing Maintenance"],
          delay: 140,
        },
      ].map((plan) => (
        <BentoCard
          key={plan.name}
          className={`p-10 flex flex-col rounded-3xl transition-all duration-500 ${
            plan.highlight 
              ? "border-black/10 bg-[#F0EEE8] shadow-2xl scale-[1.02] z-10" 
              : "bg-white/40 border-black/[0.05]"
          }`}
          delay={plan.delay}
        >
          <div className="mb-8">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40 mb-6">{plan.name}</div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-5xl font-light tracking-tighter text-black/90">{plan.price}</span>
              {plan.period && <span className="text-black/30 text-xl">{plan.period}</span>}
            </div>
            <p className="text-xs text-black/40 font-medium">{plan.sub}</p>
          </div>
          
          <ul className="space-y-4 flex-1 mb-10">
            {plan.features.map(f => (
              <li key={f} className="flex items-start gap-3 text-[13px] text-black/60 leading-tight">
                <div className="w-1.5 h-1.5 rounded-full bg-black/10 mt-1 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <button className={`w-full py-4 rounded-2xl text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-300 ${
            plan.highlight
              ? "bg-[#111] text-white hover:bg-black hover:shadow-lg active:scale-95"
              : "border border-black/10 text-black/60 hover:bg-black/5 hover:border-black/20"
          }`}>
            {plan.name === "Custom" ? "GET A QUOTE" : "START PROJECT"}
          </button>
        </BentoCard>
      ))}
    </div>
    
    <p className="mt-12 text-center text-xs text-black/30 italic">
      * All projects include a 20% deposit. Prices vary based on complexity and timeline.
    </p>
  </div>
</section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section id="contact" className="relative py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] overflow-hidden bg-[#fdfcfb]">
  {/* Glass panels image — anchored to bottom center */}
  <img
    src="/images/footer.png"
    alt=""
    aria-hidden="true"
    className="absolute bottom-0 left-0 w-full object-cover object-bottom pointer-events-none select-none opacity-40"
  />
  
  {/* Progressive blur & color fade for depth */}
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      maskImage: "linear-gradient(to top, transparent 0%, black 55%)",
      WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 55%)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      background: "linear-gradient(to top, rgb(253,252,251) 0%, transparent 60%)",
    }}
  />

  <div className="relative z-10 max-w-2xl mx-auto text-center">
    <div className="mb-6 flex justify-center">
      <Tag>HIRE ME</Tag>
    </div>
    <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] mb-6 text-black/90">
      Let&apos;s build something<br />exceptional together.
    </h2>
    <p className="text-sm text-black/45 leading-relaxed mb-10 max-w-md mx-auto">
      Currently accepting new projects for Q2 2026. Send me a message and let&apos;s discuss your vision.
    </p>

    {/* Email Form with Hydration Guard */}
    {/* {mounted && (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // Open user's email client with your address
          window.location.href = `mailto:yourname@email.com?subject=Project Inquiry&body=Hi, I'm reaching out regarding...`;
        }}
        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
      >
        <input
          type="email"
          placeholder="your@email.com"
          required
          data-lpignore="true" // Tells LastPass to ignore this field
          className="flex-1 bg-white/80 border border-black/10 rounded-xl px-5 py-4 text-sm text-[#111] placeholder:text-black/25 focus:outline-none focus:border-black/30 transition-all shadow-sm"
        />
        <button
          type="submit"
          className="px-8 py-4 bg-[#111] text-white text-[11px] font-bold rounded-xl hover:bg-black hover:shadow-xl active:scale-95 transition-all tracking-[0.2em] uppercase"
        >
          CONTACT ME
        </button>
      </form>
    )} */}
  </div>
</section>

<div className="max-w-6xl mx-auto px-6 mb-20">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* GitHub Card */}
    <a 
      href="https://github.com/odera2004" 
      target="_blank" 
      className="group relative flex items-center justify-between p-8 rounded-3xl border border-black/[0.08] bg-white hover:bg-black transition-all duration-500"
    >
      <div className="relative z-10">
        <span className="text-[10px] font-bold tracking-[0.2em] text-black/30 group-hover:text-white/40 uppercase">Codebase</span>
        <h3 className="text-2xl font-light text-black group-hover:text-white mt-1">GitHub</h3>
      </div>
      <div className="w-12 h-12 rounded-full border border-black/5 flex items-center justify-center group-hover:border-white/20 transition-colors">
        <svg className="w-5 h-5 fill-current text-black group-hover:text-white" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
      </div>
    </a>

    {/* LinkedIn Card */}
    <a 
      href="https://www.linkedin.com/in/odera-eugene-60b518343/" 
      target="_blank" 
      className="group relative flex items-center justify-between p-8 rounded-3xl border border-black/[0.08] bg-white hover:bg-blue-600 transition-all duration-500"
    >
      <div className="relative z-10">
        <span className="text-[10px] font-bold tracking-[0.2em] text-black/30 group-hover:text-white/40 uppercase">Network</span>
        <h3 className="text-2xl font-light text-black group-hover:text-white mt-1">LinkedIn</h3>
      </div>
      <div className="w-12 h-12 rounded-full border border-black/5 flex items-center justify-center group-hover:border-white/20 transition-colors">
        <svg className="w-5 h-5 fill-current text-black group-hover:text-white" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
      </div>
    </a>

    {/* CV Card */}
    <a 
      href="/Eugine_Odera_Resume.pdf" 
      download
      className="group relative flex items-center justify-between p-8 rounded-3xl border border-black/[0.08] bg-[#F0EEE8] hover:bg-black transition-all duration-500"
    >
      <div className="relative z-10">
        <span className="text-[10px] font-bold tracking-[0.2em] text-black/30 group-hover:text-white/40 uppercase">Resume</span>
        <h3 className="text-2xl font-light text-black group-hover:text-white mt-1">Download CV</h3>
      </div>
      <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center group-hover:border-white/20 transition-colors">
        <svg className="w-5 h-5 stroke-current text-black group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    </a>
  </div>
</div>

{/* ── FOOTER ────────────────────────────────────────────────────────── */}
<footer className="py-12 px-6 md:px-12 lg:px-20 border-t border-black/[0.04] bg-[#fdfcfb]">
  <div className="max-w-6xl mx-auto">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-sm font-bold tracking-[0.3em] text-black/80">PORTFOLIO</span>
        <span className="text-[10px] text-black/30 tracking-widest uppercase">Based in Nairobi, Kenya</span>
      </div>

      {/* Nav sections — Updated to match new IDs */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        {[
          { label: "About",        href: "#about" },
          { label: "Protocol",     href: "#protocol" },
          { label: "Standards",    href: "#standards" },
          { label: "Connectivity", href: "#integrations" },
          { label: "Status",       href: "#live" },
          { label: "Pricing",      href: "#pricing" },
        ].map((link, idx) => (
          <a 
            key={`footer-nav-${idx}`} 
            href={link.href} 
            className="text-[11px] font-medium text-black/40 hover:text-black transition-colors tracking-widest uppercase"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Social/External Links */}
      
    </div>

    <div className="mt-16 pt-8 border-t border-black/[0.03] flex flex-col md:flex-row justify-between gap-4">
      <span className="text-[10px] text-black/20 tracking-wider">
        © 2026 Developed by [Your Name]. All rights reserved.
      </span>
      <span className="text-[10px] text-black/20 tracking-wider">
        Built with Next.js, Framer Motion & Love.
      </span>
    </div>
  </div>
</footer>
    </div>
  )
}
