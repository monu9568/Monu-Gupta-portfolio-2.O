"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, Check, Sparkles, Terminal, ArrowUp, ArrowDown } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { SkillData } from "@/lib/types";

interface SkillsEditorProps {
  skills: SkillData[];
  onSaveSkill: (skill: Partial<SkillData>) => Promise<void>;
  onDeleteSkill: (id: string) => Promise<void>;
  onReorderSkills?: (skills: SkillData[]) => Promise<void>;
}

export default function SkillsEditor({
  skills,
  onSaveSkill,
  onDeleteSkill,
  onReorderSkills,
}: SkillsEditorProps) {
  const [editingSkill, setEditingSkill] = useState<Partial<SkillData> | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCreate = () => {
    setEditingSkill({
      name: "",
      category: "Frontend & 3D",
      level: 90,
      icon: "Sparkles",
      highlight: false,
      description: "",
      order: skills.length + 1,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;
    setSaving(true);
    try {
      await onSaveSkill(editingSkill);
      setEditingSkill(null);
    } catch {
      alert("Failed to save skill");
    } finally {
      setSaving(false);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...skills];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;

    if (onReorderSkills) {
      await onReorderSkills(reordered);
    } else {
      await onSaveSkill({ id: reordered[index - 1].id, order: index });
      await onSaveSkill({ id: reordered[index].id, order: index + 1 });
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index >= skills.length - 1) return;
    const reordered = [...skills];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;

    if (onReorderSkills) {
      await onReorderSkills(reordered);
    } else {
      await onSaveSkill({ id: reordered[index].id, order: index + 1 });
      await onSaveSkill({ id: reordered[index + 1].id, order: index + 2 });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Technical Skills Ecosystem</h2>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Manage proficiency levels, categories, shift up/down reorder, and descriptions for technical capabilities.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>New Skill</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill, idx) => (
          <GlassCard key={skill.id} className="p-4 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white">{skill.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400">{skill.level}%</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 block mb-2">{skill.category}</span>
              {skill.description && (
                <p className="text-xs text-slate-300 font-light line-clamp-2 mb-4">{skill.description}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              {/* Order Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveUp(idx)}
                  className="p-1 rounded bg-white/[0.05] hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 disabled:opacity-20 transition-all"
                  title="Shift Up"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <span className="text-[10px] font-mono text-slate-500">{idx + 1}</span>
                <button
                  type="button"
                  disabled={idx === skills.length - 1}
                  onClick={() => handleMoveDown(idx)}
                  className="p-1 rounded bg-white/[0.05] hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 disabled:opacity-20 transition-all"
                  title="Shift Down"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingSkill({ ...skill })}
                  className="p-1.5 rounded-lg bg-white/[0.05] text-slate-300 hover:text-white"
                  title="Edit Skill"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete skill "${skill.name}"?`)) onDeleteSkill(skill.id);
                  }}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                  title="Delete Skill"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {editingSkill && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
          <div data-lenis-prevent="true" className="w-full max-w-md rounded-2xl bg-[#090b10] border border-white/15 p-6 shadow-glass-elevated">
            <h3 className="text-base font-bold text-white mb-4">
              {editingSkill.id ? "Edit Skill" : "Add New Skill"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-300">Skill Name</label>
                <input
                  type="text"
                  required
                  value={editingSkill.name || ""}
                  onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-300">Category</label>
                <select
                  value={editingSkill.category || "Frontend & 3D"}
                  onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm bg-[#090b10]"
                >
                  <option value="Frontend & 3D">Frontend & 3D</option>
                  <option value="Backend & Cloud">Backend & Cloud</option>
                  <option value="AI & Data">AI & Data</option>
                  <option value="Spatial & Design">Spatial & Design</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>Proficiency Level</span>
                  <span>{editingSkill.level || 90}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={editingSkill.level || 90}
                  onChange={(e) => setEditingSkill({ ...editingSkill, level: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-300">Description / Focus</label>
                <textarea
                  rows={2}
                  value={editingSkill.description || ""}
                  onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                  placeholder="GLSL Shaders, R3F, Post-processing"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingSkill(null)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-semibold text-xs"
                >
                  {saving ? "Saving..." : "Save Skill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
