'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Sparkles, Music, Mic, Award, ArrowRight, Play, CheckCircle2, 
  BrainCircuit, Activity, BookOpen, ShieldCheck, Zap
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080B11]">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-amber-500/10">
        
        {/* Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/20 via-rose-500/10 to-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-medium mb-8 animate-bounce-slow">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI-Powered Virtual Guru for Indian Classical Music</span>
            <span className="bg-amber-500/20 px-2 py-0.5 rounded text-[11px] font-mono text-amber-200">v1.0</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.15] mb-6">
            Master <span className="saffron-gradient-text">Swaras & Ragas</span> with Instant AI Vocal Feedback
          </h1>

          {/* Subtitle */}
          <p className="text-gray-300 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
            Elevate your Hindustani & Carnatic singing. SwaraGPT combines digital signal processing, YIN pitch detection, and LLMs to analyze your voice, identify swaras, recognize ragas, and provide personalized guru guidance.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <Link
              href="/dashboard?tab=chat"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-bold text-base shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group"
              id="hero-chat-cta"
            >
              <Sparkles className="w-5 h-5" />
              <span>Ask Virtual Guru</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/dashboard?tab=analysis"
              className="w-full sm:w-auto px-8 py-4 rounded-xl glass-card text-amber-300 font-semibold text-base border border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500/60 transition-all flex items-center justify-center gap-2"
              id="hero-vocal-cta"
            >
              <Mic className="w-5 h-5 text-amber-400" />
              <span>Record & Analyze Singing</span>
            </Link>
          </div>

          {/* Audio Wave Visualizer Simulation */}
          <div className="max-w-4xl mx-auto glass-card p-6 sm:p-8 rounded-2xl border border-amber-500/20 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400">Live AI Audio Pipeline Demo</span>
              </div>
              <div className="text-xs text-gray-400 font-mono">Sample: Raga Yaman Aroha</div>
            </div>

            <div className="flex items-center justify-center gap-1.5 h-20 mb-6">
              {[40, 65, 80, 45, 90, 75, 100, 60, 85, 95, 50, 70, 85, 60, 95, 40, 75, 90, 80, 55, 100, 65].map((height, i) => (
                <div
                  key={i}
                  className="w-2 rounded-full bg-gradient-to-t from-amber-600 via-amber-400 to-rose-500 animate-wave-bar"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${i * 0.08}s`
                  }}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="bg-[#0D121F] p-3 rounded-xl border border-amber-500/10">
                <div className="text-[10px] text-gray-400 font-mono">Detected Sa (Tonic)</div>
                <div className="text-sm font-bold text-amber-400">261.6 Hz (C3)</div>
              </div>
              <div className="bg-[#0D121F] p-3 rounded-xl border border-amber-500/10">
                <div className="text-[10px] text-gray-400 font-mono">Swara Sequence</div>
                <div className="text-sm font-bold text-emerald-400">Sa Re Ga Ma(t) Pa</div>
              </div>
              <div className="bg-[#0D121F] p-3 rounded-xl border border-amber-500/10">
                <div className="text-[10px] text-gray-400 font-mono">Raga Match</div>
                <div className="text-sm font-bold text-amber-300">Yaman (89% Match)</div>
              </div>
              <div className="bg-[#0D121F] p-3 rounded-xl border border-amber-500/10">
                <div className="text-[10px] text-gray-400 font-mono">Pitch Stability</div>
                <div className="text-sm font-bold text-rose-400">92.4% Accurate</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need for Dedicated <span className="saffron-gradient-text">Riyaz</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Designed according to classical music pedagogy and modern AI engineering standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="glass-card p-8 rounded-2xl relative group hover:border-amber-500/40">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Virtual Guru Chat</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Ask questions about music theory, ragas, thaats, bandish compositions, or vocal practice routines. Powered by specialized classical music RAG pipelines.
              </p>
              <Link href="/dashboard?tab=chat" className="text-xs font-semibold text-amber-400 flex items-center gap-1 hover:underline">
                Chat with Guru <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-8 rounded-2xl relative group hover:border-amber-500/40">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">YIN Pitch & Swara Analyzer</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                High-precision fundamental frequency (F0) tracking that automatically estimates your base tonic (Sa) and maps pitches to correct swaras with shruti deviation metrics.
              </p>
              <Link href="/dashboard?tab=analysis" className="text-xs font-semibold text-rose-400 flex items-center gap-1 hover:underline">
                Analyze Pitch <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-8 rounded-2xl relative group hover:border-amber-500/40">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Raga & Motif Identifier</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Recognize ragas based on aroha, avaroha, vadi/samvadi swaras, and pakad motifs across 10+ major Hindustani scales with confidence scoring.
              </p>
              <Link href="/dashboard?tab=ragas" className="text-xs font-semibold text-purple-400 flex items-center gap-1 hover:underline">
                Explore Ragas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ACADEMIC & RESEARCH IMPACT SECTION */}
      <section className="py-16 bg-[#0B0F1A] border-y border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 text-amber-300 text-xs font-mono">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Research Foundation & Sustainable Impact</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Built on Modern AI Research & SDG Education Alignment
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              SwaraGPT integrates literature benchmarks from OpenAI Whisper, AudioLM, and MIR pitch estimators to promote SDG 4 (Quality Education) and SDG 9 (Industry, Innovation & Infrastructure).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="glass-card p-4 rounded-xl text-center border-amber-500/20">
              <div className="text-2xl font-bold text-amber-400 font-mono">SDG 4</div>
              <div className="text-xs text-gray-300 mt-1">Quality Music Education</div>
            </div>
            <div className="glass-card p-4 rounded-xl text-center border-amber-500/20">
              <div className="text-2xl font-bold text-rose-400 font-mono">SDG 9</div>
              <div className="text-xs text-gray-300 mt-1">AI & EdTech Innovation</div>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
