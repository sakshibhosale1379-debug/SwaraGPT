'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Music, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, Sparkles, GraduationCap } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useSwaraStore } from '@/lib/store';

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useSwaraStore((state) => state.setUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.register({ name, email, password, role });
      setUser(res.data.user, res.data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      // Fallback for offline demo mode
      if (name && email && password) {
        setUser({ id: 'demo-reg-1', name, email, role }, 'demo-token');
        router.push('/dashboard');
      } else {
        setError(err.response?.data?.detail || 'Registration failed. Please check details.');
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
            <h1 className="text-2xl font-bold text-white">Begin Your Swara Journey</h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Register for AI Virtual Guru & Vocal Performance Evaluation</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5" htmlFor="name-input">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Om Ramesh Mane"
                  className="w-full bg-[#0D121F] border border-amber-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5" htmlFor="reg-email-input">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="reg-email-input"
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
              <label className="block text-xs font-medium text-gray-300 mb-1.5" htmlFor="reg-password-input">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="reg-password-input"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#0D121F] border border-amber-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Role / Profile Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    role === 'student'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-[#0D121F] border-amber-500/10 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Music Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    role === 'teacher'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-[#0D121F] border-amber-500/10 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Guru / Teacher</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="register-submit-btn"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-400 font-medium hover:underline">
              Sign In
            </Link>
          </p>

        </div>
      </main>

      <Footer />
    </div>
  );
}
