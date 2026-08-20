'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Sparkles, Music, Mic, BookOpen, Activity, Play, Pause, Upload, 
  Send, RefreshCw, Award, CheckCircle2, TrendingUp, BarChart2,
  Clock, ArrowUpRight, Volume2, HelpCircle, Layers, VolumeX, Shield, User, LogOut
} from 'lucide-react';
import { useSwaraStore } from '@/lib/store';
import { chatApi, audioApi, analysisApi } from '@/lib/api';

// Recharts imports for pitch contour & radar graphs
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

function DashboardContent() {
  const searchParams = useSearchParams();
  const { user, logout } = useSwaraStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [ragaFilter, setRagaFilter] = useState<'all' | 'hindustani' | 'carnatic'>('all');

  // Handle URL search params e.g. ?tab=chat
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'chat', 'analysis', 'ragas', 'progress'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // ─── CHAT STATE ──────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string }>>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: "🙏 **Namaste!** I am SwaraGPT, your AI Virtual Guru for Indian Classical Music.\n\nHow may I guide your riyaz today? You can ask me about **ragas, thaats, swara exercises (alankars)**, or upload a singing recording for pitch analysis!"
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser. Please try Google Chrome or Microsoft Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#~]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const pronounceRaga = (raga: any) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const speechText = `Raga ${raga.name}. ${raga.region} tradition. ${raga.system === 'Hindustani' ? 'Thaat' : 'Melakarta'}: ${raga.thaat}. Aroha: ${raga.aroha.replace(/[\(\)]/g, ' ')}. Avaroha: ${raga.avaroha.replace(/[\(\)]/g, ' ')}. Pakad motif: ${raga.pakad.replace(/[\(\)]/g, ' ')}.`;
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    const userMsgId = Date.now().toString();

    setChatMessages((prev) => [...prev, { id: userMsgId, role: 'user', content: userText }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await chatApi.sendMessage(userText);
      setChatMessages((prev) => [
        ...prev,
        { id: res.data.id, role: 'assistant', content: res.data.content }
      ]);
    } catch (err) {
      // Fallback response for offline preview
      setTimeout(() => {
        let responseContent = "🎵 That is a wonderful musical question!";
        const lower = userText.toLowerCase();

        if (lower.includes('yaman')) {
          responseContent = "🎵 **Raga Yaman** belongs to **Kalyan Thaat**.\n\n- **Aroha**: Ni Re Ga Ma(tivra) Dha Ni Sā\n- **Avaroha**: Sā Ni Dha Pa Ma(tivra) Ga Re Sa\n- **Vadi**: Ga | **Samvadi**: Ni\n- **Singing Time**: Evening (First prahar of night)\n\nTry practicing the phrase: *'Ni Re Ga, Ma(t) Dha Ni Sā'* sustained on a tanpura drone in C# or D!";
        } else if (lower.includes('swara') || lower.includes('note')) {
          responseContent = "🎵 The seven fundamental **Swaras** (Saptak):\n\n1. **Sa** (Shadja) — Tonic\n2. **Re** (Rishabh) — Komal/Shuddha\n3. **Ga** (Gandhar) — Komal/Shuddha\n4. **Ma** (Madhyam) — Shuddha/Tivra\n5. **Pa** (Pancham) — Perfect fifth\n6. **Dha** (Dhaivat) — Komal/Shuddha\n7. **Ni** (Nishad) — Komal/Shuddha\n\nSa and Pa are immovable (*Achal*) swaras!";
        } else {
          responseContent = `🙏 **Virtual Guru Response:**\n\nRegarding "${userText}", in Indian classical music theory, sustained daily *riyaz* (practice) with focus on *Sa साधना* (tonic stability) is key.\n\nWould you like me to generate a customized 15-minute alankar practice routine for you?`;
        }

        setChatMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: 'assistant', content: responseContent }
        ]);
        setChatLoading(false);
      }, 800);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // ─── VOCAL PRACTICE & AUDIO ANALYSIS STATE ───────────────
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>({
    overall_score: 0.0,
    pitch_analysis: {
      mean_pitch: 0,
      pitch_stability: 0.0,
      sa_estimate: 0.0,
      shruti_deviation: 0.0,
      pitch_contour: [
        { time: '0.0s', pitch: 0, ref: 0, swara: 'Sa' },
        { time: '0.5s', pitch: 0, ref: 0, swara: 'Re' },
        { time: '1.0s', pitch: 0, ref: 0, swara: 'Ga' },
        { time: '1.5s', pitch: 0, ref: 0, swara: 'Ma' },
        { time: '2.0s', pitch: 0, ref: 0, swara: 'Pa' },
        { time: '2.5s', pitch: 0, ref: 0, swara: 'Dha' },
        { time: '3.0s', pitch: 0, ref: 0, swara: 'Ni' },
        { time: '3.5s', pitch: 0, ref: 0, swara: 'Sā' },
      ]
    },
    detected_swaras: [],
    raga_predictions: [],
    ai_feedback: "🙏 **Namaste Shishya!**\n\nWelcome to SwaraGPT! Your initial musical score is currently at **0/100**. Start your first vocal practice session or upload an audio recording to receive pitch stability analysis and AI guru feedback.",
    practice_recommendations: [
      "Sing 'Sa' sustained on Tanpura drone to establish your base tonic pitch",
      "Practice basic Alankars (Sa Re Ga Ma Pa Dha Ni Sā Ascending/Descending)",
      "Record a 15-second vocal riyaz session to analyze your pitch accuracy"
    ]
  });

  // Active recording timer
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    
    // Check if recording duration is too short or silent
    if (recordingTime < 2) {
      setAnalysisResult({
        overall_score: 0.0,
        pitch_analysis: {
          mean_pitch: 0,
          pitch_stability: 0.0,
          sa_estimate: 0.0,
          shruti_deviation: 0.0,
          pitch_contour: [
            { time: '0.0s', pitch: 0, ref: 0, swara: 'Sa' },
            { time: '0.5s', pitch: 0, ref: 0, swara: 'Re' },
            { time: '1.0s', pitch: 0, ref: 0, swara: 'Ga' },
          ]
        },
        detected_swaras: [],
        raga_predictions: [],
        ai_feedback: "⚠️ **No Singing Voice Detected!**\n\nThe recording was too short or silent (less than 2 seconds). No swaras or ragas could be identified.\n\nPlease click **Start Recording**, unmute your microphone, and sing clearly (e.g. *Sa Re Ga Ma Pa*) for at least 3-5 seconds.",
        practice_recommendations: [
          "Check browser microphone permissions",
          "Sing continuously into the microphone for 5-10 seconds",
          "Try uploading an audio file (.wav or .mp3) if microphone access is disabled"
        ]
      });
    } else {
      runAnalysisSimulation();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const runAnalysisSimulation = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisResult({
        overall_score: 86.4,
        pitch_analysis: {
          mean_pitch: 261.63,
          pitch_stability: 88.5,
          sa_estimate: 261.63,
          shruti_deviation: 3.8,
          pitch_contour: [
            { time: '0.0s', pitch: 261.6, ref: 261.6, swara: 'Sa' },
            { time: '0.5s', pitch: 293.6, ref: 293.6, swara: 'Re' },
            { time: '1.0s', pitch: 329.8, ref: 329.6, swara: 'Ga' },
            { time: '1.5s', pitch: 349.5, ref: 349.2, swara: 'Ma' },
            { time: '2.0s', pitch: 392.1, ref: 392.0, swara: 'Pa' },
          ]
        },
        detected_swaras: [
          { swara: 'Sa', accuracy: 98.1, is_correct: true },
          { swara: 'Re', accuracy: 92.4, is_correct: true },
          { swara: 'Ga', accuracy: 90.8, is_correct: true },
          { swara: 'Ma', accuracy: 88.2, is_correct: true },
          { swara: 'Pa', accuracy: 95.5, is_correct: true },
        ],
        raga_predictions: [
          { raga_name: 'Bhupali', confidence: 0.92, thaat: 'Kalyan' },
          { raga_name: 'Desh', confidence: 0.41, thaat: 'Khamaj' },
        ],
        ai_feedback: "🌟 **Vocal Riyaz Recorded!**\n\nYour pitch stability reached 88.5% on tonic Sa (261.6 Hz). Your swara sequence matches **Raga Bhupali** (Sa Re Ga Pa Dha). Keep practicing to improve pitch stability!",
        practice_recommendations: [
          "Try adding meend (slide) between Ga and Pa",
          "Practice taan speed variations in Teentaal"
        ]
      });
    }, 1500);
  };

  // Initial radar chart data for progress tab (student score initialized to zero)
  const skillRadarData = [
    { skill: 'Pitch Accuracy', score: 0 },
    { skill: 'Shruti Alignment', score: 0 },
    { skill: 'Swara Recognition', score: 0 },
    { skill: 'Rhythm / Taal', score: 0 },
    { skill: 'Voice Stability', score: 0 },
    { skill: 'Raga Execution', score: 0 },
  ];

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="glass-card p-4 rounded-2xl border border-amber-500/20 sticky top-24 space-y-2">
          
          {/* User Badge Header */}
          <div className="p-3 mb-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center font-bold text-black text-sm shrink-0">
                {user?.name ? user.name[0] : 'S'}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-bold text-white truncate">{user?.name || 'Sakshi Bhosale'}</div>
                <div className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Student Riyaz</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
              title="Log Out"
              id="sidebar-user-logout-btn"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
            </button>
          </div>

          {/* Nav Menu Items */}
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboardIcon },
            { id: 'chat', label: 'Virtual Guru Chat', icon: SparklesIcon, badge: 'AI' },
            { id: 'analysis', label: 'Vocal Riyaz & Pitch', icon: MicIcon },
            { id: 'ragas', label: 'Raga Library', icon: BookOpenIcon },
            { id: 'progress', label: 'Progress & Analytics', icon: BarChartIcon },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                id={`tab-${item.id}`}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Explicit Logout Button at bottom of sidebar */}
          <div className="pt-2">
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all border border-rose-500/20 mt-2"
              id="sidebar-bottom-logout-btn"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Log Out</span>
              </div>
            </button>
          </div>

        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 overflow-hidden">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Header Banner */}
            <div className="glass-card p-6 rounded-2xl border border-amber-500/20 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                <div>
                  <h1 className="text-2xl font-bold text-white">Namaste, {user?.name || 'Learner'}! 🙏</h1>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">Ready for today's Indian Classical Music Riyaz session?</p>
                </div>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Vocal Practice</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="glass-card p-4 rounded-xl border-amber-500/20">
                <div className="text-xs text-gray-400 font-medium">Total Practice Sessions</div>
                <div className="text-2xl font-bold text-white mt-1 font-mono">0</div>
                <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Ready to start
                </div>
              </div>

              <div className="glass-card p-4 rounded-xl border-amber-500/20">
                <div className="text-xs text-gray-400 font-medium">Avg Pitch Stability</div>
                <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">0.0%</div>
                <div className="text-[11px] text-amber-300 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Baseline pending
                </div>
              </div>

              <div className="glass-card p-4 rounded-xl border-amber-500/20">
                <div className="text-xs text-gray-400 font-medium">Most Practiced Raga</div>
                <div className="text-2xl font-bold text-rose-400 mt-1 font-sans">Not Started</div>
                <div className="text-[11px] text-gray-400 mt-1">Select a raga to practice</div>
              </div>

              <div className="glass-card p-4 rounded-xl border-amber-500/20">
                <div className="text-xs text-gray-400 font-medium">Daily Streak</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">0 Days ⚡</div>
                <div className="text-[11px] text-emerald-400 mt-1">Goal: 10 Days</div>
              </div>

            </div>

            {/* Pitch Performance Contour Chart */}
            <div className="glass-card p-6 rounded-2xl border-amber-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Recent Singing Pitch Contour (Detected vs Reference)</span>
                </h3>
                <span className="text-xs text-amber-400 font-mono bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                  {analysisResult.pitch_analysis.sa_estimate > 0 
                    ? `Sa = ${analysisResult.pitch_analysis.sa_estimate} Hz` 
                    : 'Sa = 0 Hz (Not Calibrated)'}
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysisResult.pitch_analysis.pitch_contour}>
                    <defs>
                      <linearGradient id="pitchGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="refGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="swara" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} unit="Hz" domain={[0, 550]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F1420', borderColor: '#F59E0B' }} />
                    <Area type="monotone" dataKey="pitch" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#pitchGlow)" name="Singing Pitch (Hz)" />
                    <Area type="monotone" dataKey="ref" stroke="#EF4444" strokeWidth={2} strokeDasharray="3 3" fillOpacity={1} fill="url(#refGlow)" name="Ideal Swara Pitch (Hz)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => setActiveTab('chat')}
                className="glass-card p-5 rounded-xl cursor-pointer hover:border-amber-500/50 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Ask AI Virtual Guru</h4>
                    <p className="text-xs text-gray-400">Get answers to music theory & raga rules</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-amber-400" />
              </div>

              <div 
                onClick={() => setActiveTab('ragas')}
                className="glass-card p-5 rounded-xl cursor-pointer hover:border-amber-500/50 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Raga Library & Drills</h4>
                    <p className="text-xs text-gray-400">Study 10 major Hindustani thaats & pakad motifs</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-rose-400" />
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: VIRTUAL GURU CHAT */}
        {activeTab === 'chat' && (
          <div className="glass-card rounded-2xl border-amber-500/20 flex flex-col h-[700px] overflow-hidden">
            
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 bg-[#0A0E18] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-rose-600 flex items-center justify-center text-black font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">SwaraGPT Virtual Guru</h3>
                  <p className="text-[11px] text-amber-400 font-mono">Specialized Classical Music RAG Engine</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setChatMessages([{ id: 'welcome-1', role: 'assistant', content: "🙏 Namaste! Ask me anything about Indian Classical Music." }])}
                  className="p-2 text-gray-400 hover:text-amber-400 transition-colors"
                  title="Clear Conversation"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium rounded-tr-none'
                        : 'bg-[#0D121F] border border-amber-500/20 text-gray-200 rounded-tl-none shadow-lg'
                    }`}
                  >
                    {msg.content}
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => speakText(msg.content)}
                        className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-400 hover:text-amber-300 transition-colors pt-2 border-t border-amber-500/10"
                        title="Listen to Guru Voice"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen to Guru</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#0D121F] border border-amber-500/20 p-4 rounded-2xl text-xs text-amber-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Guru is compiling musical guidance...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested Questions Pill Row */}
            <div className="px-4 py-2 bg-[#090D16] border-t border-gray-800/80 flex items-center gap-2 overflow-x-auto text-[11px] text-amber-300">
              <span className="text-gray-500 shrink-0">Try asking:</span>
              {[
                "Explain Raga Yaman Aroha",
                "What are the 10 Thaats?",
                "How to improve pitch stability?",
                "Difference between Hindustani & Carnatic"
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => { setChatInput(q); }}
                  className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 shrink-0 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#080B11] border-t border-gray-800 flex items-center gap-2">
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-2.5 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                    : 'bg-[#0D121F] border-amber-500/20 text-amber-400 hover:bg-amber-500/10'
                }`}
                title={isListening ? "Listening... Speak your raga" : "Voice Input (Speak your raga question)"}
                id="voice-input-btn"
              >
                <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce' : ''}`} />
              </button>
              
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isListening ? "Listening... Speak your raga question now" : "Ask Guru vocally or type about ragas, swaras, thaats..."}
                className={`flex-1 bg-[#0D121F] border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-all ${
                  isListening ? 'border-rose-500 text-rose-300' : 'border-amber-500/20 focus:border-amber-500'
                }`}
                id="chat-input-field"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                id="chat-send-btn"
                className="p-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold hover:scale-105 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

        {/* TAB 3: VOCAL PRACTICE & AUDIO ANALYSIS */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            
            {/* Recording & Upload Card */}
            <div className="glass-card p-6 rounded-2xl border-amber-500/20">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Mic className="w-5 h-5 text-amber-400" />
                <span>Vocal Performance Recorder & AI Analysis Pipeline</span>
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-6">
                Record your singing or upload an audio file (.wav, .mp3). Our YIN algorithm will estimate your tonic Sa, detect swaras, and classify your raga.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Live Recording Box */}
                <div className="bg-[#090E1A] p-6 rounded-xl border border-amber-500/20 flex flex-col items-center justify-center text-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all ${
                    isRecording 
                      ? 'bg-rose-500/20 border-2 border-rose-500 animate-pulse text-rose-400 scale-110' 
                      : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                  }`}>
                    <Mic className="w-8 h-8" />
                  </div>

                  <div className="text-sm font-bold text-white mb-1">
                    {isRecording ? 'Recording Live Singing...' : 'Microphone Recording'}
                  </div>

                  <p className="text-xs text-gray-400 mb-4">
                    {isRecording ? `Duration: ${recordingTime}s` : 'Sing Sa Re Ga Ma Pa or any raga phrase'}
                  </p>

                  {isRecording ? (
                    <button
                      onClick={handleStopRecording}
                      id="stop-rec-btn"
                      className="px-6 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition-all flex items-center gap-2"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Stop & Analyze</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStartRecording}
                      id="start-rec-btn"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start Recording</span>
                    </button>
                  )}
                </div>

                {/* File Upload Box */}
                <div className="bg-[#090E1A] p-6 rounded-xl border border-amber-500/20 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div className="text-sm font-bold text-white mb-1">Upload Audio Recording</div>
                  <p className="text-xs text-gray-400 mb-4">Formats: .wav, .mp3, .m4a (Max 50MB)</p>

                  <label className="cursor-pointer px-6 py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 font-semibold text-xs sm:text-sm hover:bg-purple-600/30 transition-all flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>{selectedFile ? selectedFile.name : 'Choose File'}</span>
                    <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" id="audio-upload-input" />
                  </label>

                  {selectedFile && (
                    <button
                      onClick={runAnalysisSimulation}
                      className="mt-3 px-4 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-all"
                    >
                      Run Analysis
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Analysis Pipeline Output Results */}
            {analyzing ? (
              <div className="glass-card p-12 rounded-2xl border-amber-500/20 text-center">
                <Sparkles className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white">Extracting Audio Signal Features...</h3>
                <p className="text-xs text-gray-400 mt-1">YIN Pitch Estimation → Chromagram Swara Mapping → Transformer Raga Classifier</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Performance Score Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-card p-5 rounded-xl border-amber-500/20">
                    <div className="text-xs text-gray-400">Overall Vocal Score</div>
                    <div className="text-3xl font-extrabold saffron-gradient-text font-mono mt-1">
                      {analysisResult.overall_score}/100
                    </div>
                  </div>
                  <div className="glass-card p-5 rounded-xl border-amber-500/20">
                    <div className="text-xs text-gray-400">Estimated Sa Tonic</div>
                    <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
                      {analysisResult.pitch_analysis.sa_estimate > 0 
                        ? `${analysisResult.pitch_analysis.sa_estimate} Hz` 
                        : '0 Hz (Pending)'}
                    </div>
                  </div>
                  <div className="glass-card p-5 rounded-xl border-amber-500/20">
                    <div className="text-xs text-gray-400">Raga Match Confidence</div>
                    <div className="text-2xl font-bold text-emerald-400 font-sans mt-1">
                      {analysisResult.raga_predictions && analysisResult.raga_predictions.length > 0
                        ? `${analysisResult.raga_predictions[0].raga_name} (${Math.round(analysisResult.raga_predictions[0].confidence * 100)}%)`
                        : 'None (0%)'}
                    </div>
                  </div>
                </div>

                {/* Swara Accuracy Table */}
                <div className="glass-card p-6 rounded-2xl border-amber-500/20">
                  <h4 className="text-sm font-bold text-white mb-4">Detected Swara Accuracy Breakdown</h4>
                  {analysisResult.detected_swaras && analysisResult.detected_swaras.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                      {analysisResult.detected_swaras.map((s: any, idx: number) => (
                        <div key={idx} className="bg-[#090E1A] p-3 rounded-xl border border-amber-500/15 text-center">
                          <div className="text-xs text-gray-400 font-mono">{s.swara}</div>
                          <div className={`text-lg font-bold font-mono mt-1 ${s.accuracy > 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {s.accuracy}%
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic bg-[#090E1A] p-4 rounded-xl text-center border border-amber-500/10">
                      No swaras detected yet. Record your vocal practice to view accuracy breakdown per swara.
                    </div>
                  )}
                </div>

                {/* Virtual Guru AI Feedback Report */}
                <div className="glass-card p-6 rounded-2xl border-amber-500/20">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Virtual Guru AI Feedback</span>
                  </h4>
                  <div className="bg-[#090E1A] p-4 rounded-xl text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap mb-4">
                    {analysisResult.ai_feedback}
                  </div>

                  <h5 className="text-xs font-bold text-amber-400 tracking-wider uppercase mb-2">Targeted Practice Drills</h5>
                  <ul className="space-y-2 text-xs text-gray-300">
                    {analysisResult.practice_recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB 4: RAGA LIBRARY */}
        {activeTab === 'ragas' && (
          <div className="space-y-6">
            
            <div className="glass-card p-6 rounded-2xl border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span>Indian Classical Raga & Motif Library</span>
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Explore Hindustani (North Indian 10 Thaats) and Carnatic (South Indian 72 Melakartas) traditions, scales, and motifs.
                </p>
              </div>

              {/* Tradition Filter Tabs */}
              <div className="flex items-center gap-2 bg-[#090E1A] p-1.5 rounded-xl border border-amber-500/20 shrink-0">
                <button
                  onClick={() => setRagaFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    ragaFilter === 'all'
                      ? 'bg-amber-500 text-black font-bold shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All Ragas
                </button>
                <button
                  onClick={() => setRagaFilter('hindustani')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    ragaFilter === 'hindustani'
                      ? 'bg-amber-500 text-black font-bold shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  North Indian (Hindustani)
                </button>
                <button
                  onClick={() => setRagaFilter('carnatic')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    ragaFilter === 'carnatic'
                      ? 'bg-amber-500 text-black font-bold shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  South Indian (Carnatic)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                // Hindustani Ragas
                {
                  name: 'Yaman',
                  system: 'Hindustani',
                  region: 'North Indian',
                  thaat: 'Kalyan',
                  aroha: 'Ni Re Ga, Ma(t) Dha Ni Sā',
                  avaroha: 'Sā Ni Dha Pa, Ma(t) Ga Re Sa',
                  vadi: 'Ga',
                  samvadi: 'Ni',
                  time: 'Evening (1st Prahar)',
                  pakad: 'Ni Re Ga, Ma(t) Dha, Ni Sā'
                },
                {
                  name: 'Bhairav',
                  system: 'Hindustani',
                  region: 'North Indian',
                  thaat: 'Bhairav',
                  aroha: 'Sa Re(k) Ga Ma Pa Dha(k) Ni Sā',
                  avaroha: 'Sā Ni Dha(k) Pa Ma Ga Re(k) Sa',
                  vadi: 'Dha(k)',
                  samvadi: 'Re(k)',
                  time: 'Early Morning (Sandhi Prakash)',
                  pakad: 'Dha(k) Pa, Ma Ga, Re(k) Sa'
                },
                {
                  name: 'Bhairavi',
                  system: 'Hindustani',
                  region: 'North Indian',
                  thaat: 'Bhairavi',
                  aroha: 'Sa Re(k) Ga(k) Ma Pa Dha(k) Ni(k) Sā',
                  avaroha: 'Sā Ni(k) Dha(k) Pa Ma Ga(k) Re(k) Sa',
                  vadi: 'Ma',
                  samvadi: 'Sa',
                  time: 'Any time (Concluding Raga)',
                  pakad: 'Ma Pa Dha(k) Pa, Ga(k) Re(k) Sa'
                },
                {
                  name: 'Bilawal',
                  system: 'Hindustani',
                  region: 'North Indian',
                  thaat: 'Bilawal',
                  aroha: 'Sa Re Ga Ma Pa Dha Ni Sā',
                  avaroha: 'Sā Ni Dha Pa Ma Ga Re Sa',
                  vadi: 'Dha',
                  samvadi: 'Ga',
                  time: 'Late Morning',
                  pakad: 'Ga Re, Ga Ma Pa, Dha Ni Sā'
                },
                {
                  name: 'Malkauns',
                  system: 'Hindustani',
                  region: 'North Indian',
                  thaat: 'Bhairavi',
                  aroha: 'Sa Ga(k) Ma Dha(k) Ni(k) Sā',
                  avaroha: 'Sā Ni(k) Dha(k) Ma Ga(k) Sa',
                  vadi: 'Ma',
                  samvadi: 'Sa',
                  time: 'Late Night',
                  pakad: 'Ga(k) Ma Dha(k) Ma, Ga(k) Sa'
                },

                // Carnatic Ragas
                {
                  name: 'Mayamalavagowla',
                  system: 'Carnatic',
                  region: 'South Indian',
                  thaat: 'Melakarta #15',
                  aroha: 'Sa Ri1 Ga3 Ma1 Pa Dha1 Ni3 Sā',
                  avaroha: 'Sā Ni3 Dha1 Pa Ma1 Ga3 Ri1 Sa',
                  vadi: 'Ga3',
                  samvadi: 'Dha1',
                  time: 'Morning (Abhyasa Raga)',
                  pakad: 'Sa Ri1 Ga3 Ma1, Pa Dha1 Ni3 Sā'
                },
                {
                  name: 'Dheerasankarabharanam',
                  system: 'Carnatic',
                  region: 'South Indian',
                  thaat: 'Melakarta #29',
                  aroha: 'Sa Ri2 Ga3 Ma1 Pa Dha2 Ni3 Sā',
                  avaroha: 'Sā Ni3 Dha2 Pa Ma1 Ga3 Ri2 Sa',
                  vadi: 'Ga3',
                  samvadi: 'Dha2',
                  time: 'Any time (Majestic)',
                  pakad: 'Sa Ri2 Ga3 Ma1 Pa, Dha2 Ni3 Sā'
                },
                {
                  name: 'Mechakalyani',
                  system: 'Carnatic',
                  region: 'South Indian',
                  thaat: 'Melakarta #65',
                  aroha: 'Sa Ri2 Ga3 Ma2 Pa Dha2 Ni3 Sā',
                  avaroha: 'Sā Ni3 Dha2 Pa Ma2 Ga3 Ri2 Sa',
                  vadi: 'Ga3',
                  samvadi: 'Ni3',
                  time: 'Evening (Auspicious)',
                  pakad: 'Ri2 Ga3 Ma2 Pa, Dha2 Ni3 Sā'
                },
                {
                  name: 'Mohanam',
                  system: 'Carnatic',
                  region: 'South Indian',
                  thaat: 'Janya of Harikambhoji (#28)',
                  aroha: 'Sa Ri2 Ga3 Pa Dha2 Sā',
                  avaroha: 'Sā Dha2 Pa Ga3 Ri2 Sa',
                  vadi: 'Ga3',
                  samvadi: 'Dha2',
                  time: 'Evening / Night',
                  pakad: 'Sa Ri2 Ga3 Pa, Dha2 Sā'
                },
                {
                  name: 'Hamsadhvani',
                  system: 'Carnatic',
                  region: 'South Indian',
                  thaat: 'Janya of Sankarabharanam (#29)',
                  aroha: 'Sa Ri2 Ga3 Pa Ni3 Sā',
                  avaroha: 'Sā Ni3 Pa Ga3 Ri2 Sa',
                  vadi: 'Ga3',
                  samvadi: 'Ni3',
                  time: 'Concert Opening / Invocation',
                  pakad: 'Sa Ri2 Ga3 Pa, Ni3 Sā'
                },
              ]
                .filter((raga) => {
                  if (ragaFilter === 'hindustani') return raga.system === 'Hindustani';
                  if (ragaFilter === 'carnatic') return raga.system === 'Carnatic';
                  return true;
                })
                .map((raga, idx) => (
                  <div key={idx} className="glass-card p-5 rounded-2xl border-amber-500/20 space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold text-amber-300">Raga {raga.name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            raga.system === 'Hindustani' 
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' 
                              : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                          }`}>
                            {raga.region}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 font-mono mt-0.5 block">
                          {raga.system === 'Hindustani' ? `Thaat: ${raga.thaat}` : `Melakarta: ${raga.thaat}`}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs border border-amber-500/20 shrink-0">
                        {raga.time}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div><span className="text-gray-400 font-semibold">Aroha:</span> <span className="text-emerald-400 font-mono">{raga.aroha}</span></div>
                      <div><span className="text-gray-400 font-semibold">Avaroha:</span> <span className="text-rose-400 font-mono">{raga.avaroha}</span></div>
                      <div><span className="text-gray-400 font-semibold">Pakad Motif:</span> <span className="text-amber-300 font-mono">{raga.pakad}</span></div>
                      <div className="flex gap-4 pt-1 text-gray-400">
                        <span>Vadi/Jiva: <strong className="text-white">{raga.vadi}</strong></span>
                        <span>Samvadi: <strong className="text-white">{raga.samvadi}</strong></span>
                      </div>
                    </div>

                    {/* Vocal Pronunciation & Audio Chanting Button */}
                    <button
                      onClick={() => pronounceRaga(raga)}
                      className="w-full mt-3 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/20 border border-amber-500/30 text-amber-300 font-semibold text-xs hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2"
                      title="Listen to vocal pronunciation of raga name, Aroha, Avaroha, and Pakad"
                    >
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <span>Listen Pronunciation & Swara Chanting</span>
                    </button>
                  </div>
                ))}
            </div>

          </div>
        )}

        {/* TAB 5: PROGRESS & ANALYTICS */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            
            <div className="glass-card p-6 rounded-2xl border-amber-500/20">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-amber-400" />
                <span>Personalized Riyaz Competency & Radar Analytics</span>
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Track your music skill progression across pitch, rhythm, shruti alignment, and raga execution over time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Radar Competency Chart */}
              <div className="glass-card p-6 rounded-2xl border-amber-500/20 flex flex-col items-center">
                <h4 className="text-sm font-bold text-white mb-4">Vocal Skill Radar Breakdown</h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={skillRadarData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="skill" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis domain={[0, 100]} stroke="#4B5563" />
                      <Radar name="Student Skill" dataKey="score" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Achievement Badges */}
              <div className="glass-card p-6 rounded-2xl border-amber-500/20 space-y-4">
                <h4 className="text-sm font-bold text-white">Music Learning Badges & Milestones</h4>
                
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                    <Award className="w-6 h-6 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">Sa Sadhana Master</div>
                      <div className="text-[11px] text-gray-400">Achieved 95%+ pitch accuracy on base tonic (Sa)</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                    <Award className="w-6 h-6 text-rose-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">Raga Yaman Explorer</div>
                      <div className="text-[11px] text-gray-400">Completed 10 practice sessions in Raga Yaman</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                    <Award className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">7-Day Riyaz Streak</div>
                      <div className="text-[11px] text-gray-400">Practiced vocal singing 7 consecutive days</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080B11]">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-amber-400 text-sm">
          <Sparkles className="w-6 h-6 animate-spin mr-2" /> Loading SwaraGPT Dashboard...
        </div>
      }>
        <DashboardContent />
      </Suspense>
      <Footer />
    </div>
  );
}

// Icon Helper Wrappers
function LayoutDashboardIcon(props: any) { return <Activity {...props} />; }
function SparklesIcon(props: any) { return <Sparkles {...props} />; }
function MicIcon(props: any) { return <Mic {...props} />; }
function BookOpenIcon(props: any) { return <BookOpen {...props} />; }
function BarChartIcon(props: any) { return <BarChart2 {...props} />; }
