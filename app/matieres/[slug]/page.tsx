"use client";

import { useParams } from "next/navigation";
import { SUBJECTS } from "@/lib/subjects";
import Link from "next/link";

export default function MatierePage() {
  const params = useParams();
  const slug = params.slug as string;
  const subject = SUBJECTS.find((s) => s.slug === slug);

  if (!subject) {
    return (
      <div className="text-center py-20">
        <p className="text-xl">Matière introuvable</p>
        <Link href="/" className="text-cyan-400 mt-4 inline-block">
          ← Retour au dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="text-5xl">{subject.icon}</span>
        <div>
          <h1 className="text-3xl font-bold">{subject.name}</h1>
          <p className="text-slate-400">{subject.chapters} chapitres</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
        <p className="text-slate-400 mb-4">
          Page matière en construction.
        </p>
        <p className="text-sm text-slate-500">
          Ici tu pourras ajouter tes leçons, voir ta progression, générer des quiz spécifiques, etc.
        </p>
        <Link
          href="/quiz"
          className="inline-block mt-6 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 rounded-xl font-semibold transition"
        >
          Aller au Quiz IA →
        </Link>
      </div>
    </div>
  );
}
