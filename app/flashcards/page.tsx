"use client";

import { useState, useEffect } from "react";
import { Flashcard } from "@/lib/db";
import { getDueCards, reviewCard } from "@/lib/srs";
import { SUBJECTS } from "@/lib/subjects";
import FlashcardView from "@/components/flashcard/Flashcard";

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [current, setCurrent] = useState(0);
  const [subject, setSubject] = useState<string>("all");

  useEffect(() => {
    load();
  }, [subject]);

  async function load() {
    const c = await getDueCards(subject === "all" ? undefined : subject);
    setCards(c);
    setCurrent(0);
  }

  async function handleReview(quality: number) {
    if (!cards[current]) return;
    await reviewCard(cards[current], quality);
    if (current + 1 < cards.length) {
      setCurrent((c) => c + 1);
    } else {
      load();
    }
  }

  const card = cards[current];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold">🃏 Révision espacée</h1>
        <p className="text-slate-400 mt-1">
          {cards.length} carte(s) à réviser aujourd&apos;hui
        </p>
      </header>

      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="bg-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-500"
      >
        <option value="all">Toutes les matières</option>
        {SUBJECTS.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.name}
          </option>
        ))}
      </select>

      {card ? (
        <>
          <FlashcardView card={card} />
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleReview(1)}
              className="py-3 rounded-xl bg-red-600 hover:bg-red-500 font-semibold transition"
            >
              ❌ Oublié
            </button>
            <button
              onClick={() => handleReview(3)}
              className="py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 font-semibold transition"
            >
              🤔 Difficile
            </button>
            <button
              onClick={() => handleReview(5)}
              className="py-3 rounded-xl bg-green-600 hover:bg-green-500 font-semibold transition"
            >
              ✅ Facile
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-xl font-semibold">Tout est révisé !</p>
          <p className="text-slate-400 mt-2">
            Reviens demain pour de nouvelles cartes.
          </p>
        </div>
      )}
    </div>
  );
}
