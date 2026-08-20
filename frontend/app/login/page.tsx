'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Music, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useSwaraStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useSwaraStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      setUser(res.data.user, res.data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      // Fallback for offline demo mode
      if (email && password) {
        setUser({ id: 'demo-123', name: email.split('@')[0], email, role: 'student' }, 'demo-token');
        router.push('/dashboard');
      } else {
        setError(err.response?.data?.detail || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080B11]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md glass-card p-8 rounded-2xl border border-amber-500/20 shadow-2xl relative">
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-black font-bold mx-auto mb-4">
              <Music className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome Back to Riyaz</h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Sign in to continue your music practice with SwaraGPT</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5" htmlFor="email-input">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@wce.ac.in"
                  className="w-full bg-[#0D121F] border border-amber-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5" htmlFor="password-input">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0D121F] border border-amber-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="login-submit-btn"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <button
              onClick={() => {
                setUser({ id: 'demo-student-1', name: 'Sakshi Bhosale', email: 'sakshi@wce.ac.in', role: 'student' }, 'demo-jwt-token');
                router.push('/dashboard');
              }}
              id="quick-demo-btn"
              className="w-full py-2 px-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Explore Instant Guest Demo</span>
            </button>

            <p className="text-xs text-gray-500 mt-4">
              Don't have an account?{' '}
              <Link href="/register" className="text-amber-400 font-medium hover:underline">
                Create one now
              </Link>
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
