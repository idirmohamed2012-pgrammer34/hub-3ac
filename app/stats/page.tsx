"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { SUBJECTS } from "@/lib/subjects";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function StatsPage() {
  const attempts = useLiveQuery(() => db.attempts.toArray(), []) ?? [];

  const data = SUBJECTS.map((s) => {
    const a = attempts.filter((x) => x.subject === s.slug);
    const score = a.reduce((acc, x) => acc + x.score, 0);
    const total = a.reduce((acc, x) => acc + x.total, 0);
    return {
      name: s.name.split(" ")[0],
      moyenne: total ? Math.round((score / total) * 100) : 0,
    };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">📊 Statistiques</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="moyenne" fill="#06b6d4" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">📜 Historique récent</h2>
        <div className="space-y-2">
          {attempts.length === 0 && (
            <p className="text-slate-500">Aucun quiz encore.</p>
          )}
          {attempts
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 10)
            .map((a) => (
              <div
                key={a.id}
                className="flex justify-between items-center p-3 bg-slate-800 rounded-lg text-sm"
              >
                <span>
                  {SUBJECTS.find((s) => s.slug === a.subject)?.name}
                </span>
                <span className="font-mono">
                  {a.score}/{a.total}
                </span>
                <span className="text-slate-400">
                  {new Date(a.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
