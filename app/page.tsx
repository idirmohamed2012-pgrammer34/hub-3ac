"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { SUBJECTS } from "@/lib/subjects";
import SubjectCard from "@/components/dashboard/SubjectCard";
import StatsOverview from "@/components/dashboard/StatsOverview";
import UpcomingReviews from "@/components/dashboard/UpcomingReviews";
import SeedButton from "@/components/dashboard/SeedButton";

export default function Dashboard() {
  const attempts = useLiveQuery(() => db.attempts.toArray(), []) ?? [];
  const lessons = useLiveQuery(() => db.lessons.toArray(), []) ?? [];
  const cards = useLiveQuery(() => db.flashcards.toArray(), []) ?? [];

  const totalScore = attempts.reduce((a, t) => a + t.score, 0);
  const totalQ = attempts.reduce((a, t) => a + t.total, 0);
  const avg = totalQ ? Math.round((totalScore / totalQ) * 100) : 0;

  const dueToday = cards.filter((c) => c.dueDate <= Date.now()).length;

  function progressFor(slug: string) {
    const subjectLessons = lessons.filter((l) => l.subject === slug);
    if (!subjectLessons.length) return 0;
    return Math.round(
      (subjectLessons.filter((l) => l.mastered).length / subjectLessons.length) * 100
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bonjour 👋</h1>
          <p className="text-slate-400 mt-1">
            {dueToday > 0
              ? `🕐 ${dueToday} carte(s) à réviser aujourd'hui !`
              : "Tout est à jour, continue comme ça 🚀"}
          </p>
        </div>
        {lessons.length === 0 && <SeedButton />}
      </div>

      <StatsOverview
        averageScore={avg}
        totalAttempts={attempts.length}
        totalLessons={lessons.length}
        dueCards={dueToday}
      />

      <section>
        <h2 className="text-xl font-semibold mb-4">📚 Mes matières</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUBJECTS.map((s) => (
            <SubjectCard key={s.slug} {...s} progress={progressFor(s.slug)} />
          ))}
        </div>
      </section>

      <UpcomingReviews />
    </div>
  );
}
