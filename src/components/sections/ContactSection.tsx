"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, Github, Linkedin, Twitter, CheckCircle2, AlertCircle, ArrowUpRight, MessageSquare } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { HeroData } from "@/lib/types";

interface ContactSectionProps {
  hero: HeroData;
}

export default function ContactSection({ hero }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website_hp: "", // Honeypot field
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to deliver message");
      }

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "", website_hp: "" });

      // Trigger subtle celebratory liquid confetti on-demand
      try {
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#38bdf8", "#818cf8", "#e2e8f0"],
        });
      } catch { }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An error occurred. Please try again.");
    }
  };


  return (
    <section id="contact" className="relative py-28 px-4 md:px-8 lg:px-16 overflow-hidden">
      {/* Background Liquid Ambient Glow */}
      <div className="liquid-glow-1 bottom-1/4 right-1/4 h-[500px] w-[500px] opacity-15" />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Column: Direct Inquiries & Socials */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              {hero.contactBadge && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-cyan-400 mb-4">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{hero.contactBadge}</span>
                </div>
              )}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
                {hero.contactHeadingPrefix || "Let’s Build"} <br />
                <span className="text-gradient-cyan">
                  {hero.contactHeadingGradient || "Something Visionary."}
                </span>
              </h2>
              {hero.contactSubtitle && (
                <p className="text-slate-400 text-sm sm:text-base mt-4 font-light leading-relaxed">
                  {hero.contactSubtitle}
                </p>
              )}
            </div>

            {/* Direct Email Card */}
            <GlassCard className="p-6 border border-white/10 space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                {hero.contactDirectEmailLabel || "Direct Email"}
              </span>
              <a
                href={`mailto:${hero.email || "contact@monugupta.design"}`}
                className="text-lg sm:text-xl font-bold text-white hover:text-cyan-400 transition-colors flex items-center gap-2"
              >
                <span>{hero.email || "contact@monugupta.design"}</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </GlassCard>

            {/* Social Network Channels */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Verified Channels</span>
              <div className="flex flex-wrap gap-3">
                {hero.showGithubLink !== false && hero.githubUrl && (
                  <a
                    href={hero.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </a>
                )}
                {hero.showLinkedinLink !== false && hero.linkedinUrl && (
                  <a
                    href={hero.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {hero.showTwitterLink !== false && hero.twitterUrl && (
                  <a
                    href={hero.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all"
                  >
                    <Twitter className="h-4 w-4" />
                    <span>X (Twitter)</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Luxury Frosted Glass Form */}
          <div className="lg:col-span-7">
            <GlassCard elevated className="p-8 sm:p-10 border border-white/15">
              <h3 className="text-xl font-bold text-white tracking-tight mb-2 flex items-center gap-2.5">
                <MessageSquare className="h-5 w-5 text-cyan-400" />
                <span>{hero.contactFormTitle || "Send a Message"}</span>
              </h3>
              <p className="text-xs text-slate-400 font-light mb-8">
                {hero.contactFormSubtitle ||
                  "Have a project in mind, a question, or a collaboration opportunity? Reach out anytime."}
              </p>

              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3"
                >
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                  <h4 className="text-lg font-bold text-white">Message Sent Successfully</h4>
                  <p className="text-xs text-slate-300 font-light max-w-md mx-auto">
                    Thank you for reaching out! I have received your message and will respond as soon as possible.
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-4 px-5 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-xs font-medium text-white transition-colors"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Anti-spam honeypot */}
                  <input
                    type="text"
                    name="website_hp"
                    value={formData.website_hp}
                    onChange={(e) => setFormData({ ...formData, website_hp: e.target.value })}
                    style={{ display: "none" }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div className="space-y-2">
                      <label htmlFor="contact-name" className="block text-xs font-mono uppercase text-slate-300">
                        Your Name <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Monu Gupta"
                        className="w-full px-4 py-3 rounded-xl glass-input text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="contact-email" className="block text-xs font-mono uppercase text-slate-300">
                        Your Email <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. monu@example.com"
                        className="w-full px-4 py-3 rounded-xl glass-input text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label htmlFor="contact-subject" className="block text-xs font-mono uppercase text-slate-300">
                      Subject / Project Scope
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. New Web App & 3D Interface Design"
                      className="w-full px-4 py-3 rounded-xl glass-input text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label htmlFor="contact-message" className="block text-xs font-mono uppercase text-slate-300">
                      Your Message <span className="text-cyan-400">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your vision, timeline, or requirements..."
                      className="w-full px-4 py-3 rounded-xl glass-input text-sm resize-none focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>


                  {/* Error Notification */}
                  {status === "error" && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 text-slate-950 font-semibold text-sm transition-all duration-300 hover:shadow-glow-accent hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {status === "submitting" ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        Sending Message...
                      </span>
                    ) : (
                      <>
                        <span>{hero.contactSubmitButtonText || "Send Message"}</span>
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </GlassCard>
          </div>

        </div>
      </div>
    </section>
  );
}
