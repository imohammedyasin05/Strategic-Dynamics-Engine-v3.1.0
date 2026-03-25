/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { Send, ShieldAlert, Zap, MessageSquare, CornerDownRight, Loader2, History, Trash2, X, Clock, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

interface AnalysisResult {
  situationRead: string;
  action: "Reply" | "Leave on read" | "React with emoji" | "Delay reply";
  reason: string;
  isEliteUsed?: boolean;
  replyData?: {
    text: string;
    replies: {
      bestOption: string;
      playful: string;
      teasing: string;
      confident: string;
      calmMasculine: string;
      flirty: string;
      direct: string;
    };
  };
  emojiData?: {
    emoji: string;
  };
  delayData?: {
    when: string;
  };
}

interface HistoryItem {
  id: string;
  timestamp: number;
  input: string;
  mode: 'situation' | 'reply';
  result: AnalysisResult;
}

type Result = AnalysisResult;

export default function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [mode, setMode] = useState<'situation' | 'reply'>('situation');
  const [isElite, setIsElite] = useState<'off' | 'on' | 'auto'>('auto');
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [lastInput, setLastInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('move_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('move_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (result && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [result]);

  const processInput = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;
    
    setLastInput(prompt);
    setInput("");
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: prompt, isElite }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const data = await response.json();
      setResult(data);

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        input: prompt,
        mode,
        result: data
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 50)); // Keep last 50
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Analysis failed. The engine encountered an error.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processInput();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    if (window.confirm("Clear all history?")) {
      setHistory([]);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setMode(item.mode);
    setResult(item.result);
    setShowHistory(false);
  };

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#050505] text-[#E4E3E0] font-sans flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-xs font-mono tracking-[0.5em] uppercase text-[#F27D26]">The Move</h1>
            <h2 className="text-7xl font-light tracking-tighter italic font-serif leading-none">
              Stop guessing. <br />
              <span className="text-[#F27D26]">Start winning.</span>
            </h2>
          </div>
          <p className="text-lg text-white/40 leading-relaxed max-w-lg mx-auto">
            Elite strategic dating analysis for the modern man. Blunt, psychologically grounded, and outcome-focused.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button 
              onClick={() => setView('app')}
              className="bg-[#F27D26] text-black px-8 py-4 rounded-full font-medium hover:scale-105 transition-all"
            >
              Analyze My Situation
            </button>
          </div>
        </motion.div>
        <footer className="absolute bottom-10 opacity-20 text-[10px] font-mono tracking-widest uppercase">
          Strategic Dynamics Engine v3.1.0
        </footer>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#050505] text-[#E4E3E0] font-sans selection:bg-[#F27D26] selection:text-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <button onClick={() => setView('landing')} className="text-[10px] font-mono tracking-[0.3em] uppercase opacity-50 hover:opacity-100 transition-opacity">Strategic Dynamics</button>
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setShowHistory(true)}
            className="p-2 text-white/40 hover:text-white transition-colors relative"
            title="History"
          >
            <History className="w-4 h-4" />
            {history.length > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#F27D26] rounded-full" />
            )}
          </button>
          <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10">
            <button 
              onClick={() => { setMode('situation'); setResult(null); setInput(""); }}
              className={`px-3 py-1 text-[9px] sm:text-[10px] uppercase font-mono tracking-widest rounded-md transition-all ${mode === 'situation' ? 'bg-[#F27D26] text-black' : 'text-white/40 hover:text-white/60'}`}
            >
              Situation
            </button>
            <button 
              onClick={() => { setMode('reply'); setResult(null); setInput(""); }}
              className={`px-3 py-1 text-[9px] sm:text-[10px] uppercase font-mono tracking-widest rounded-md transition-all ${mode === 'reply' ? 'bg-[#F27D26] text-black' : 'text-white/40 hover:text-white/60'}`}
            >
              Replies
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-3xl mx-auto px-6 py-8 md:py-12 pb-64">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="analysis-result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12 md:space-y-16"
              >
                {/* Situation Read */}
                <section ref={scrollRef} className="space-y-4 scroll-mt-24">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/30">
                      <ShieldAlert className="w-3 h-3 text-red-500/50" />
                      Situation Read
                      {result.isEliteUsed && <span className="ml-2 px-1.5 py-0.5 bg-[#F27D26]/20 text-[#F27D26] rounded text-[8px] border border-[#F27D26]/30">Elite Analysis</span>}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(result.situationRead)}
                      className="text-[8px] uppercase font-mono text-white/40 hover:text-white transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <p className={`text-2xl md:text-3xl font-light tracking-tight italic font-serif leading-tight border-l-2 border-[#F27D26] pl-6 md:pl-8 transition-all ${result.isEliteUsed ? 'bg-[#F27D26]/5 py-6 rounded-r-2xl' : ''}`}>
                    {result.situationRead}
                  </p>
                </section>

                {/* Action & Reason */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/30">
                    <CornerDownRight className="w-3 h-3 text-[#F27D26]" />
                    The Move — <span className="text-[#F27D26]">{result.action}</span>
                    {result.isEliteUsed && <span className="ml-2 px-1.5 py-0.5 bg-[#F27D26]/20 text-[#F27D26] rounded text-[8px] border border-[#F27D26]/30">Elite Analysis</span>}
                  </div>
                  <div className={`transition-all duration-500 p-6 md:p-8 rounded-2xl space-y-4 ${result.isEliteUsed ? 'bg-[#F27D26]/10 border border-[#F27D26]/40 shadow-[0_0_30px_rgba(242,125,38,0.1)]' : 'bg-white/5 border border-white/10'}`}>
                    <p className="text-base md:text-lg font-medium text-white/90 leading-relaxed">
                      {result.reason}
                    </p>
                  </div>
                </section>

                {/* Conditional Action Details */}
                {(result.action === "Reply" || result.action === "Delay reply") && result.delayData && (
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#F27D26]">
                      <Zap className="w-3 h-3 fill-[#F27D26]" />
                      Optimal Delay
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-lg font-mono tracking-tight text-white text-center">
                      Wait <span className="text-[#F27D26]">{result.delayData.when}</span> before sending.
                    </div>
                  </section>
                )}

                {result.action === "Reply" && result.replyData && (
                  <div className="space-y-12">
                    {/* Main Reply */}
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#F27D26]">
                          <Zap className="w-3 h-3 fill-[#F27D26]" />
                          Text
                          {result.isEliteUsed && <span className="ml-2 px-1.5 py-0.5 bg-[#F27D26]/20 text-[#F27D26] rounded text-[8px] border border-[#F27D26]/30">Elite Analysis</span>}
                        </div>
                        <button 
                          onClick={() => copyToClipboard(result.replyData!.text)}
                          className="text-[8px] uppercase font-mono bg-[#F27D26] text-black px-2 py-1 rounded hover:scale-105 transition-transform active:scale-95"
                        >
                          Copy
                        </button>
                      </div>
                      <div className={`p-8 md:p-10 rounded-2xl text-xl md:text-2xl font-mono tracking-tight text-white text-center transition-all duration-500 ${result.isEliteUsed ? 'bg-[#F27D26]/20 border-2 border-[#F27D26] shadow-[0_0_60px_rgba(242,125,38,0.2)]' : 'bg-[#F27D26]/10 border-2 border-[#F27D26] shadow-[0_0_40px_rgba(242,125,38,0.1)]'}`}>
                        "{result.replyData.text}"
                      </div>
                    </section>

                    {/* All Reply Options */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/30">
                        <MessageSquare className="w-3 h-3" />
                        Alternative Replies
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(result.replyData.replies).map(([key, value]) => (
                          <div key={key} className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-mono uppercase tracking-widest text-[#F27D26]">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <button 
                                onClick={() => copyToClipboard(value as string)}
                                className="text-[8px] uppercase font-mono text-white/40 hover:text-white transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                            <p className="text-sm font-mono text-white/80 leading-snug">
                              "{value}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {result.action === "React with emoji" && result.emojiData && (
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#F27D26]">
                      <Zap className="w-3 h-3 fill-[#F27D26]" />
                      Emoji
                    </div>
                    <div className="bg-white/5 border border-white/10 p-10 rounded-2xl text-6xl text-center">
                      {result.emojiData.emoji}
                    </div>
                  </section>
                )}

                {result.action === "Leave on read" && (
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-red-500">
                      <ShieldAlert className="w-3 h-3 fill-red-500" />
                      Final Action
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-xl md:text-2xl font-mono tracking-tight text-red-400 text-center uppercase">
                      Leave on read
                    </div>
                  </section>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20 py-20 md:py-40"
              >
                <Zap className="w-12 h-12" />
                <p className="text-sm font-mono uppercase tracking-[0.2em]">
                  {mode === 'situation' ? "Awaiting Situation Data" : "Awaiting Message Data"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Universal Fixed Bottom Input */}
      <div className="fixed bottom-0 left-0 w-full z-40 px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Elite Toggle */}
          <div className="flex justify-center">
            <div className="flex bg-white/5 border border-white/10 p-1 rounded-full">
              <button 
                onClick={() => setIsElite('off')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all ${isElite === 'off' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
              >
                Standard
              </button>
              <button 
                onClick={() => setIsElite('auto')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all ${isElite === 'auto' ? 'bg-[#F27D26]/20 text-[#F27D26]' : 'text-white/40 hover:text-white/60'}`}
              >
                Auto
              </button>
              <button 
                onClick={() => setIsElite('on')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all ${isElite === 'on' ? 'bg-[#F27D26] text-white shadow-[0_0_15px_rgba(242,125,38,0.4)]' : 'text-white/40 hover:text-white/60'}`}
              >
                Elite
              </button>
            </div>
          </div>

          {/* Input Bar */}
          <div className="relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-[#F27D26]/50 transition-all backdrop-blur-xl">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === 'situation' ? "Describe situation..." : "Paste message..."}
              className="flex-1 bg-transparent border-none p-3 text-base focus:outline-none resize-none max-h-32 min-h-[48px] placeholder:opacity-20"
              rows={1}
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
            <button
              onClick={processInput}
              disabled={loading || !input.trim()}
              className="bg-[#F27D26] text-black p-3 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shrink-0"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg"
            >
              <div className="flex items-center gap-2 text-red-400 text-[10px]">
                <ShieldAlert className="w-3 h-3" />
                Error occurred
              </div>
              <button 
                onClick={() => setInput(lastInput)}
                className="text-[9px] font-mono uppercase tracking-widest text-[#F27D26]"
              >
                Restore
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Desktop Footer */}
      <footer className="hidden md:flex fixed bottom-0 w-full p-6 justify-center pointer-events-none">
        <div className="bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest text-white/40">
          Strategic Dynamics Engine v3.1.0
        </div>
      </footer>

      {/* History Sidebar/Overlay */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0A0A0A] border-l border-white/10 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#F27D26]" />
                  <h2 className="text-xs font-mono uppercase tracking-widest">Analysis History</h2>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                    <Clock className="w-8 h-8" />
                    <p className="text-[10px] font-mono uppercase tracking-widest">No history yet</p>
                  </div>
                ) : (
                  history.map((item) => {
                    const isExpanded = expandedId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`w-full text-left bg-white/5 border border-white/10 rounded-xl transition-all group relative overflow-hidden ${isExpanded ? 'border-[#F27D26]/50' : 'hover:border-[#F27D26]/30'}`}
                      >
                        <div 
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="p-4 cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[8px] font-mono uppercase tracking-widest text-[#F27D26]">
                              {item.mode} • {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={(e) => deleteHistoryItem(item.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                              {isExpanded ? <ChevronUp className="w-3 h-3 text-white/40" /> : <ChevronDown className="w-3 h-3 text-white/40" />}
                            </div>
                          </div>
                          <p className={`text-xs text-white/80 font-serif italic ${isExpanded ? '' : 'line-clamp-2'} mb-3`}>
                            "{item.input}"
                          </p>
                          {!isExpanded && (
                            <div className="flex items-center gap-2 text-[8px] font-mono uppercase tracking-widest text-white/30">
                              <CornerDownRight className="w-2 h-2 text-[#F27D26]" />
                              {item.result.action}
                            </div>
                          )}
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4"
                            >
                              <div className="space-y-1">
                                <span className="text-[7px] font-mono uppercase tracking-widest text-white/30">Situation Read</span>
                                <p className="text-[11px] text-white/70 leading-relaxed italic">
                                  {item.result.situationRead}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[7px] font-mono uppercase tracking-widest text-white/30">The Move</span>
                                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#F27D26]">
                                  {item.result.action}
                                </div>
                                <p className="text-[10px] text-white/60 leading-relaxed">
                                  {item.result.reason}
                                </p>
                              </div>
                              <button
                                onClick={() => loadHistoryItem(item)}
                                className="w-full py-2 bg-[#F27D26] text-black text-[9px] font-mono uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Load into View
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>

              {history.length > 0 && (
                <div className="p-4 border-t border-white/10">
                  <button 
                    onClick={clearHistory}
                    className="w-full py-3 text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear All History
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
