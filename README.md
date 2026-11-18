# Hub 3AC — Révisions 3ème collège (Maroc)

## Fonctionnalités

| Module | Description |
|--------|-------------|
| **Dashboard** | Stats, progression, raccourcis |
| **Matières / Leçons** | CRUD + import texte / PDF / photo OCR |
| **Quiz IA** | QCM Gemini depuis une leçon |
| **Examen blanc** | QCM chronométré |
| **Flashcards** | SM-2 + création manuelle + IA |
| **خطاطات / Mind maps** | IA FR ou AR + sauvegarde + plein écran |
| **Résumé IA** | Synthèse d'une leçon |
| **Stats** | Graphiques + historique |
| **Paramètres** | Export / import JSON, seed, reset |
| **PWA** | Installable + offline |

## Installation

```bash
npm install
```

Crée un fichier `.env.local` :

```env
GEMINI_API_KEY=ta_cle_google_ai_studio
# Facultatif : le modèle par défaut est gemini-3.8-flash
GEMINI_MODEL=gemini-3.8-flash
```

Obtiens une clé sur [Google AI Studio](https://aistudio.google.com/apikey), puis lance :

```bash
npm run dev
```

## Déploiement Vercel

Dans **Project → Settings → Environment Variables**, ajoute `GEMINI_API_KEY` pour Production, Preview et Development. Tu peux aussi définir `GEMINI_MODEL` ; si elle est absente, le projet utilise `gemini-3.8-flash`.

Après avoir ajouté ou modifié les variables, redéploie le projet.

## Parcours type

1. Dashboard → **Charger données d'exemple** (ou ouvrir une matière)
2. Matière → **Nouvelle leçon** (coller / PDF / photo)
3. Ouvrir la leçon → Résumer / Flashcards / خطاطة / Quiz
4. Réviser dans Flashcards + Examen blanc

## Architecture IA

Toutes les fonctions IA passent par `lib/ai.ts` et le SDK officiel `@google/genai` via l'API Interactions : résumé, quiz, flashcards, cartes mentales, OCR photo et extraction PDF. La clé reste côté serveur ; elle n'est jamais envoyée au navigateur.

Si `GEMINI_API_KEY` est absente ou invalide, les routes IA retournent une erreur explicite.