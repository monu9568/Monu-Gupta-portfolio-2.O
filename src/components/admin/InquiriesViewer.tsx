"use client";

import React, { useState, useEffect } from "react";
import { Mail, Trash2, CheckCircle2, RefreshCw, Clock, ExternalLink, Inbox } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { MessageData } from "@/lib/types";

export default function InquiriesViewer() {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact");
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch {
      console.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleStatusChange = async (id: string, newStatus: "UNREAD" | "READ" | "ARCHIVED") => {
    try {
      await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
    } catch {
      alert("Failed to update message status");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this inquiry?")) {
      try {
        await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
        setMessages((prev) => prev.filter((m) => m.id !== id));
      } catch {
        alert("Failed to delete message");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Contact Inquiries Inbox</h2>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Client collaboration requests and messages received through the contact form.
          </p>
        </div>

        <button
          onClick={fetchMessages}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs text-slate-300 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {messages.length === 0 ? (
        <GlassCard className="p-12 text-center border border-white/10 space-y-3">
          <Inbox className="h-10 w-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-medium text-white">No inquiries yet</h3>
          <p className="text-xs text-slate-400 font-light">
            When prospective clients or collaborators send messages via the portfolio contact form, they will appear here.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <GlassCard
              key={msg.id}
              elevated={msg.status === "UNREAD"}
              className={`p-6 border transition-all ${
                msg.status === "UNREAD" ? "border-cyan-400/40 bg-cyan-950/10" : "border-white/10"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-white/[0.08] flex items-center justify-center text-white font-bold text-xs">
                    {msg.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{msg.name}</span>
                      {msg.status === "UNREAD" && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-cyan-500 text-slate-950 font-bold">
                          NEW
                        </span>
                      )}
                    </h3>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <span>{msg.email}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {msg.subject && (
                <div className="text-xs font-semibold text-white mb-2">
                  Scope: <span className="text-slate-300 font-normal">{msg.subject}</span>
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed font-light whitespace-pre-wrap bg-white/[0.02] p-4 rounded-xl border border-white/5 mb-4">
                {msg.message}
              </p>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || "Collaboration Inquiry")}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 text-xs font-medium"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Reply via Email</span>
                </a>

                <div className="flex items-center gap-2">
                  {msg.status === "UNREAD" ? (
                    <button
                      onClick={() => handleStatusChange(msg.id, "READ")}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-slate-300"
                    >
                      Mark Read
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(msg.id, "UNREAD")}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-slate-300"
                    >
                      Mark Unread
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                    title="Delete message"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
