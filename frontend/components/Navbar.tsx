'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Music, Mic, BookOpen, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useSwaraStore } from '@/lib/store';

export default function Navbar() {
  const { user, logout } = useSwaraStore();

  return (
    <header className="sticky top-0 z-50 border-b border-amber-500/10 glass-panel bg-[#080B11]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group" id="nav-logo-link">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-rose-600 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
            <Music className="w-5 h-5 text-black" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight saffron-gradient-text">SwaraGPT</span>
            <span className="text-[10px] text-amber-400/70 tracking-widest uppercase font-mono">Virtual Guru AI</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link href="/" className="hover:text-amber-400 transition-colors flex items-center gap-1.5" id="nav-home">
            Home
          </Link>
          <Link href="/dashboard" className="hover:text-amber-400 transition-colors flex items-center gap-1.5" id="nav-dashboard">
            <LayoutDashboard className="w-4 h-4 text-amber-400" />
            Dashboard
          </Link>
          <Link href="/dashboard?tab=chat" className="hover:text-amber-400 transition-colors flex items-center gap-1.5" id="nav-guru-chat">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Virtual Guru Chat
          </Link>
          <Link href="/dashboard?tab=analysis" className="hover:text-amber-400 transition-colors flex items-center gap-1.5" id="nav-vocal-analysis">
            <Mic className="w-4 h-4 text-amber-400" />
            Vocal Practice
          </Link>
          <Link href="/dashboard?tab=ragas" className="hover:text-amber-400 transition-colors flex items-center gap-1.5" id="nav-ragas">
            <BookOpen className="w-4 h-4 text-amber-400" />
            Raga Library
          </Link>
        </nav>

        {/* User CTA Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium hover:bg-amber-500/20 transition-all">
                <User className="w-4 h-4" />
                <span>{user.name}</span>
              </Link>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                title="Log Out"
                id="btn-logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                id="nav-login-btn"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-semibold text-black rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 shadow-md shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
                id="nav-register-btn"
              >
                Start Free Riyaz
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
