# 🎓 Hub 3AC — Révisions Personnelles

Tableau de bord de révisions intelligent pour la **3ème année collège (Maroc)**.

**Stack** : Next.js 14 • Tailwind • Dexie (IndexedDB) • Gemini 1.5 Flash • SM-2 • **PWA complète**

---

## ✨ Fonctionnalités

- 📊 **Dashboard** avec progression par matière
- ⚡ **Quiz IA** générés par Gemini à partir de ta leçon
- 🃏 **Flashcards** avec algorithme de répétition espacée (SM-2)
- 📈 **Statistiques** + historique des quiz
- 📱 **PWA installable** + mode offline réel
- 🌙 Dark mode natif

---

## 🚀 Installation rapide

```bash
git clone https://github.com/idirmohamed2012-pgrammer34/hub-3ac.git
cd hub-3ac
npm install
```

Crée un fichier `.env.local` :

```env
GEMINI_API_KEY=ta_clé_ici
```

> Obtiens une clé gratuite sur [Google AI Studio](https://aistudio.google.com/apikey)

Puis lance :

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000)

---

## 📱 PWA (Progressive Web App)

L'application est **installable** et fonctionne **offline**.

### En production

```bash
npm run build
npm start
```

Ensuite :
1. Ouvre l'app dans Chrome / Edge / Safari
2. Clique sur « Installer » (icône dans la barre d'adresse)
3. L'app apparaît sur ton écran d'accueil

### Ce qui est inclus

| Feature | Status |
|---------|--------|
| `manifest.ts` | ✅ |
| Service Worker (Workbox) | ✅ |
| Offline fallback (`/offline`) | ✅ |
| Cache des pages + assets | ✅ |
| `skipWaiting` + `clientsClaim` | ✅ |
| Theme color + Apple Web App | ✅ |

> Le service worker est **désactivé en développement** (`disable: process.env.NODE_ENV === "development"`).

---

## 🗂️ Structure

```
hub-3ac/
├── app/
│   ├── layout.tsx          # Shell + metadata PWA
│   ├── page.tsx            # Dashboard
│   ├── offline/page.tsx    # Page offline
│   ├── quiz/
│   ├── flashcards/
│   ├── stats/
│   ├── api/quiz/
│   └── manifest.ts         # Web App Manifest
├── components/
├── lib/
│   ├── db.ts               # Dexie schema
│   ├── srs.ts              # SM-2
│   └── subjects.ts
├── public/icons/           # Icônes PWA (à remplacer)
└── next.config.mjs         # Config @ducanh2912/next-pwa
```

---

## 🎨 Icônes PWA

Remplace les fichiers dans `public/icons/` par tes propres icônes :

- `icon-192x192.png`
- `icon-512x512.png`

Tu peux les générer facilement avec [realfavicongenerator.net](https://realfavicongenerator.net) ou [pwa-asset-generator](https://github.com/onderceylan/pwa-asset-generator).

---

## 🛣️ Roadmap

- [ ] Auth + Supabase (sync multi-appareils)
- [ ] Import PDF → quiz
- [ ] Générateur de flashcards IA
- [ ] Mode examen blanc (timer)
- [ ] Notifications push (rappels de révision)

---

Fait avec ❤️ pour les collégiens marocains.
