"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db, Lesson } from "@/lib/db";
import { SUBJECTS } from "@/lib/subjects";
import Link from "next/link";
import MindMap, { MindNode } from "@/components/mindmap/MindMap";
import {
  ArrowLeft,
  Sparkles,
  Layers,
  CheckCircle2,
  Loader2,
  Zap,
  Network,
} from "lucide-react";

export default function LeconPage() {
  const params = useParams();
  const slug = params.slug as string;
  const id = Number(params.id);
  const subject = SUBJECTS.find((s) => s.slug === slug);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);
  const [loadingMindmap, setLoadingMindmap] = useState(false);
  const [mindmap, setMindmap] = useState<MindNode | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    db.lessons.get(id).then((l) => {
      if (l) setLesson(l);
    });
  }, [id]);

  if (!lesson || !subject) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Chargement...</p>
      </div>
    );
  }

  async function generateSummary() {
    setLoadingSummary(true);
    setMessage(null);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: lesson!.content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await db.lessons.update(id, {
        summary: data.summary,
        updatedAt: Date.now(),
      });
      setLesson((prev) => (prev ? { ...prev, summary: data.summary } : prev));
      setMessage("Résumé généré avec succès !");
    } catch (e: any) {
      setMessage(e.message || "Erreur");
    } finally {
      setLoadingSummary(false);
    }
  }

  async function generateFlashcards() {
    setLoadingCards(true);
    setMessage(null);
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: lesson!.content, subject: slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const now = Date.now();
      for (const card of data.cards) {
        await db.flashcards.add({
          subject: slug,
          front: card.front,
          back: card.back,
          ease: 2.5,
          interval: 0,
          repetitions: 0,
          dueDate: now,
          createdAt: now,
        });
      }
      setMessage(`${data.cards.length} flashcards créées ! Va les réviser.`);
    } catch (e: any) {
      setMessage(e.message || "Erreur");
    } finally {
      setLoadingCards(false);
    }
  }

  async function generateMindmap() {
    setLoadingMindmap(true);
    setMessage(null);
    setMindmap(null);
    try {
      const res = await fetch("/api/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: lesson!.content,
          title: lesson!.title,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMindmap(data);
      setMessage("Carte mentale générée !");
    } catch (e: any) {
      setMessage(e.message || "Erreur");
    } finally {
      setLoadingMindmap(false);
    }
  }

  async function toggleMastered() {
    const newVal = !lesson.mastered;
    await db.lessons.update(id, { mastered: newVal, updatedAt: Date.now() });
    setLesson((prev) => (prev ? { ...prev, mastered: newVal } : prev));
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Nav */}
      <div className="flex items-center gap-3">
        <Link
          href={`/matieres/${slug}`}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"
        >
          <ArrowLeft size={20} />
        </Link>
        <span className="text-sm text-slate-500">
          {subject.icon} {subject.name}
        </span>
      </div>

      {/* Title */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
        <button
          onClick={toggleMastered}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition shrink-0 ${
            lesson.mastered
              ? "bg-green-500/20 text-green-400 border border-green-500/40"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <CheckCircle2 size={16} />
          {lesson.mastered ? "Maîtrisé" : "Marquer maîtrisé"}
        </button>
      </div>

      {/* Actions IA */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={generateSummary}
          disabled={loadingSummary}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-xl text-sm font-medium transition disabled:opacity-50"
        >
          {loadingSummary ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          Résumer avec IA
        </button>

        <button
          onClick={generateFlashcards}
          disabled={loadingCards}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-sm font-medium transition disabled:opacity-50"
        >
          {loadingCards ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Layers size={16} />
          )}
          Générer flashcards
        </button>

        <button
          onClick={generateMindmap}
          disabled={loadingMindmap}
          className="flex items-center gap-2 px-4 py-2.5 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 rounded-xl text-sm font-medium transition disabled:opacity-50"
        >
          {loadingMindmap ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Network size={16} />
          )}
          Carte mentale
        </button>

        <Link
          href="/quiz"
          className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 rounded-xl text-sm font-medium transition"
        >
          <Zap size={16} />
          Faire un quiz
        </Link>
      </div>

      {message && (
        <p className="text-sm p-3 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          {message}
        </p>
      )}

      {/* Mind Map */}
      {mindmap && (
        <div className="space-y-3">
          <h2 className="font-semibold text-pink-300 flex items-center gap-2">
            <Network size={18} /> Carte mentale
          </h2>
          <MindMap data={mindmap} />
        </div>
      )}

      {/* Summary */}
      {lesson.summary && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6">
          <h2 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
            <Sparkles size={18} /> Résumé IA
          </h2>
          <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
            {lesson.summary}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="font-semibold mb-4 text-slate-300">Contenu de la leçon</h2>
        <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed">
          {lesson.content}
        </div>
      </div>
    </div>
  );
}
