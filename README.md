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

### Résilience Gemini

Le modèle principal est `gemini-3.8-flash`. En cas de surcharge temporaire (HTTP 429/500/502/503/504), le serveur réessaie automatiquement avec un délai progressif et bascule vers `gemini-3.5-flash-lite`, puis `gemini-3.6-flash`. Si tous les modèles sont indisponibles, un message clair invite à réessayer plus tard. Les erreurs permanentes (clé invalide, requête incorrecte) ne déclenchent pas de bascule.


## Protection par mot de passe

Le site est protégé par un mot de passe partagé. Ajoute ces variables dans **Vercel → Project → Settings → Environment Variables** :

- `HUB_SITE_PASSWORD` : le mot de passe choisi pour ouvrir le site.
- `HUB_AUTH_SECRET` : une clé aléatoire secrète d'au moins 32 caractères (génère-la avec `openssl rand -base64 48`).

Ne mets jamais ces valeurs dans Git ou dans le code côté navigateur. Après leur ajout, redéploie le projet. La session est stockée dans un cookie signé, HttpOnly, Secure en production et valable 7 jours. Le bouton **Déconnexion** supprime cette session.

Cette protection utilise un mot de passe commun à tous les visiteurs, pas des comptes individuels. Les données de révision restent stockées dans IndexedDB sur chaque navigateur/appareil ; la protection par mot de passe ne synchronise pas les données entre appareils.

## Impression des cartes mentales

Chaque carte mentale dispose du bouton **Imprimer / Enregistrer en PDF**. Le navigateur ouvre sa boîte d'impression avec une mise en page A4 paysage. Choisis une imprimante ou **Enregistrer au format PDF**. Les branches sont développées à l'affichage pour inclure le contenu complet.
