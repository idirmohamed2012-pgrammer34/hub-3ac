# 🎓 Hub 3AC — Révisions Personnelles

Tableau de bord de révisions intelligent pour la **3ème année collège (Maroc)**.

**Stack** : Next.js 14 • Tailwind • Dexie (IndexedDB) • Gemini 1.5 Flash • SM-2 • **PWA**

---

## ✨ Fonctionnalités

| Feature | Description |
|---------|-------------|
| 📊 Dashboard | Progression par matière + stats |
| 📚 Leçons | Créer, consulter, marquer maîtrisé |
| ⚡ Quiz IA | Génération QCM à partir d'une leçon (Gemini) |
| 💡 Résumé IA | Résumé automatique d'une leçon |
| 🃏 Flashcards SRS | Répétition espacée (SM-2) + génération IA |
| 📈 Stats | Graphiques + historique |
| 📱 PWA | Installable + offline |
| 🌱 Seed | Données d'exemple en 1 clic |

---

## 🚀 Installation

```bash
git clone https://github.com/idirmohamed2012-pgrammer34/hub-3ac.git
cd hub-3ac
npm install
```

Crée `.env.local` :

```env
GEMINI_API_KEY=ta_clé_ici
```

> Clé gratuite : [Google AI Studio](https://aistudio.google.com/apikey)

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000)

---

## 📱 PWA

```bash
npm run build && npm start
```

Puis installe l'app depuis Chrome / Safari.

---

## 📁 Structure clé

```
app/
  matieres/[slug]/          # Liste des leçons d'une matière
  matieres/[slug]/lecon/[id]/ # Détail leçon + actions IA
  quiz/                     # Générateur QCM
  flashcards/               # Révision SRS
  stats/
  api/
    quiz/                   # Gemini → QCM
    summary/                # Gemini → résumé
    flashcards/             # Gemini → flashcards
lib/
  db.ts                     # Dexie schema
  srs.ts                    # SM-2
  seed.ts                   # Données d'exemple
  subjects.ts
```

---

## 🎯 Comment utiliser

1. Clique sur **« Charger données d'exemple »** sur le dashboard (première visite)
2. Ouvre une matière → ajoute tes propres leçons
3. Dans une leçon :
   - **Résumer avec IA**
   - **Générer flashcards**
   - **Faire un quiz**
4. Révise tes flashcards chaque jour (algorithme SM-2)

---

Fait avec ❤️ pour les collégiens marocains.
