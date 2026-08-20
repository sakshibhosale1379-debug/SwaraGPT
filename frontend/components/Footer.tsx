import React from 'react';
import Link from 'next/link';
import { Music, Heart, GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-amber-500/10 bg-[#06080D] py-12 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        {/* Brand Info */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-black font-bold">
              <Music className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">SwaraGPT</span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm max-w-md leading-relaxed">
            An AI-Powered Virtual Guru for personalized Indian Classical Music learning. Combining Artificial Intelligence, Pitch Estimation (YIN/FFT), Speech Processing (Whisper), and LLMs to preserve and elevate classical music heritage.
          </p>
          <div className="flex items-center gap-2 text-xs text-amber-400/80 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 w-fit">
            <GraduationCap className="w-4 h-4" />
            <span>Walchand College of Engineering, Sangli (WCE)</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold text-sm tracking-wider uppercase">Features</h3>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li><Link href="/dashboard?tab=chat" className="hover:text-amber-400 transition-colors">AI Virtual Guru</Link></li>
            <li><Link href="/dashboard?tab=analysis" className="hover:text-amber-400 transition-colors">Swara & Pitch Analysis</Link></li>
            <li><Link href="/dashboard?tab=ragas" className="hover:text-amber-400 transition-colors">Raga Recognition Engine</Link></li>
            <li><Link href="/dashboard?tab=progress" className="hover:text-amber-400 transition-colors">Personalized Riyaz Tracker</Link></li>
          </ul>
        </div>

        {/* Project Team */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold text-sm tracking-wider uppercase">Development Team</h3>
          <ul className="space-y-1.5 text-xs text-gray-400">
            <li className="text-gray-300 font-medium">Om Ramesh Mane (245100006)</li>
            <li className="text-gray-300 font-medium">Sakshi Jayant Bhosale (245100191)</li>
            <li className="text-gray-300 font-medium">Gauri Dattatray Dhole (245100023)</li>
            <li className="pt-2 text-amber-400/80 text-[11px]">Guide: Prof. P. D. Mundada</li>
            <li className="text-amber-400/80 text-[11px]">HOD: Dr. A. R. Surve</li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
        <p>© 2026 SwaraGPT — Indian Classical Music Educational Technology.</p>
        <p className="flex items-center gap-1">
          Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Indian Classical Music Learners
        </p>
      </div>
    </footer>
  );
}
