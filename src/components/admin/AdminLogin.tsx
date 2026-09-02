"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import GlassCard from "../ui/GlassCard";

interface AdminLoginProps {
  onLoginSuccess: (username: string) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      onLoginSuccess(data.username || username);
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050608] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="liquid-glow-1 top-1/4 left-1/4 h-[400px] w-[400px]" />
      <div className="liquid-glow-2 bottom-1/4 right-1/4 h-[450px] w-[450px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard elevated className="p-8 sm:p-10 border border-white/15 shadow-glass-elevated">
          {/* Lock Icon Monogram */}
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-accent">
              <ShieldCheck className="h-8 w-8" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">VisionOS Admin CMS</h1>
            <p className="text-xs text-slate-400 mt-1 font-light">
              Enter master credentials to access the portfolio engine.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase text-slate-300">
                Admin Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                placeholder="admin"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase text-slate-300">
                Master Passkey
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-sm transition-all duration-300 hover:shadow-glow-accent hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                <>
                  <span>Unlock CMS</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <span className="text-[11px] font-mono text-slate-500">
              Default Credentials: <code className="text-cyan-400">admin</code> / <code className="text-cyan-400">admin123</code>
            </span>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
