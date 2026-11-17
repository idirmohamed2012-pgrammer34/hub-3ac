"use client";

import { useState, useRef } from "react";
import {
  Type,
  FileText,
  Camera,
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";

type Tab = "paste" | "file" | "photo";

interface Props {
  subject: string;
  onSave: (title: string, content: string) => Promise<void>;
  onCancel: () => void;
}

export default function ImportLessonForm({ subject, onSave, onCancel }: Props) {
  const [tab, setTab] = useState<Tab>("paste");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(title.trim(), content.trim());
    } catch (err: any) {
      setError(err.message || "Erreur");
    } finally {
      setSaving(false);
    }
  }

  /** Lecture fichier .txt / .md */
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!file.name.match(/\.(txt|md|text)$/i)) {
      setError("Formats acceptés : .txt, .md");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setContent(text);
      if (!title) {
        setTitle(file.name.replace(/\.(txt|md|text)$/i, ""));
      }
    };
    reader.readAsText(file, "UTF-8");
  }

  /** Photo → OCR via Gemini Vision */
  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Choisis une image (JPG, PNG, WEBP...)");
      return;
    }

    // Preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    setExtracting(true);
    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          mimeType: file.type,
          subject,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de l'extraction");

      setContent(data.text);
      if (!title) {
        setTitle("Leçon depuis photo");
      }
    } catch (err: any) {
      setError(err.message || "Erreur d'extraction");
      setPreview(null);
    } finally {
      setExtracting(false);
    }
  }

  const tabs: { id: Tab; label: string; icon: typeof Type }[] = [
    { id: "paste", label: "Coller", icon: Type },
    { id: "file", label: "Fichier", icon: FileText },
    { id: "photo", label: "Photo", icon: Camera },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Ajouter une leçon</h2>
        <button type="button" onClick={onCancel} className="p-1 text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-800 rounded-xl">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
              tab === id
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Title always visible */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre de la leçon"
        className="w-full p-3 rounded-xl bg-slate-800 outline-none focus:ring-2 focus:ring-cyan-500"
        required
      />

      {/* Tab content */}
      {tab === "paste" && (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Colle ici le contenu de ta leçon (texte, notes, résumé...)"
          className="w-full h-52 p-3 rounded-xl bg-slate-800 resize-none outline-none focus:ring-2 focus:ring-cyan-500"
          required
        />
      )}

      {tab === "file" && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-36 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-cyan-300 transition"
          >
            <Upload size={28} />
            <span className="text-sm">Clique pour choisir un fichier</span>
            <span className="text-xs text-slate-500">.txt ou .md</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.text,text/plain,text/markdown"
            onChange={handleFile}
            className="hidden"
          />
          {content && (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-40 p-3 rounded-xl bg-slate-800 resize-none outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
            />
          )}
        </div>
      )}

      {tab === "photo" && (
        <div className="space-y-3">
          {!preview ? (
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              disabled={extracting}
              className="w-full h-36 border-2 border-dashed border-slate-700 hover:border-pink-500/50 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-pink-300 transition disabled:opacity-50"
            >
              {extracting ? (
                <>
                  <Loader2 size={28} className="animate-spin" />
                  <span className="text-sm">Extraction du texte...</span>
                </>
              ) : (
                <>
                  <Camera size={28} />
                  <span className="text-sm">Photo du cahier / manuel</span>
                  <span className="text-xs text-slate-500">JPG, PNG, WEBP</span>
                </>
              )}
            </button>
          ) : (
            <div className="relative">
              <img
                src={preview}
                alt="Aperçu"
                className="w-full max-h-48 object-contain rounded-xl bg-slate-800"
              />
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setContent("");
                  if (photoRef.current) photoRef.current.value = "";
                }}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 rounded-lg text-slate-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhoto}
            className="hidden"
          />

          {extracting && (
            <p className="text-sm text-pink-300 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Gemini lit ta photo...
            </p>
          )}

          {content && !extracting && (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-40 p-3 rounded-xl bg-slate-800 resize-none outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
              placeholder="Texte extrait — tu peux le corriger"
            />
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {error}
        </p>
      )}

      {content && (
        <p className="text-xs text-slate-500 text-right">
          {content.length} caractères
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || !title.trim() || !content.trim() || extracting}
          className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold transition"
        >
          {saving ? "Enregistrement..." : "Enregistrer la leçon"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
