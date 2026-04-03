# FlashCards

Application web de révision par cartes flash. Les utilisateurs importent des jeux de cartes (JSON), configurent une session, répondent aux questions (QCM ou réponse exacte), et consultent leur historique de scores.

## Stack

| Couche | Technologie |
|--------|-------------|
| Framework | SvelteKit 2 + Svelte 5 (runes) |
| Base de données | PostgreSQL via [Neon](https://neon.tech) (serverless) |
| ORM | Drizzle ORM |
| Langage | TypeScript |
| Build | Vite |

## Installation

```bash
npm install
cp .env.example .env
# Renseigner DATABASE_URL dans .env
npm run db:push   # applique le schéma en base
npm run dev
```

## Structure des fichiers

```
src/
├── hooks.server.ts          # Middleware : lit les cookies userId/username → locals
├── app.d.ts                 # Types globaux (locals.userId, locals.username)
│
├── lib/
│   └── server/
│       └── db/
│           ├── index.ts     # Connexion Drizzle + Neon
│           └── schema.ts    # Tables : users, decks, cards, user_stats
│
└── routes/
    ├── +layout.server.ts    # Passe userId/username à toutes les pages
    ├── +layout.svelte       # Header nav (affiché si connecté)
    │
    ├── +page.server.ts      # Actions : login (crée ou récupère user), select, logout
    ├── +page.svelte         # Page de connexion / sélection de profil
    │
    ├── home/
    │   ├── +page.server.ts  # Load : liste des decks. Actions : import JSON, delete deck
    │   └── +page.svelte     # Sélection des decks + configuration de session
    │
    ├── session/
    │   ├── +page.server.ts  # Load : tire les cartes aléatoirement selon les params URL
    │   │                    # Action : saveResult → écrit dans user_stats
    │   └── +page.svelte     # Moteur de jeu (QCM ou saisie exacte, score, résultats)
    │
    └── history/
        ├── +page.server.ts  # Load : user_stats jointure decks pour l'utilisateur courant
        └── +page.svelte     # Tableau des meilleurs scores par deck
```

## Schéma de base de données

```
users          decks          cards               user_stats
─────────      ──────         ──────              ───────────
id             id             id                  id
username       name           deck_id ──→ decks   user_id ──→ users
created_at     description    question             deck_id ──→ decks
               created_at     answer               sessions
                                                   best_score
                                                   best_total
                                                   last_played
```

`cards.deck_id` et `user_stats.deck_id/user_id` ont un `onDelete: cascade`.
`user_stats` a une contrainte `unique(user_id, deck_id)`.

## Authentification

Sans mot de passe. On entre un pseudo :
- S'il n'existe pas → création en base.
- S'il existe → connexion directe.

L'identité est stockée dans deux cookies (`userId`, `username`, durée 1 an).
`hooks.server.ts` peuple `event.locals` à chaque requête. Les pages protégées font `if (!locals.userId) throw redirect(302, '/')`.

## Flux d'une session

1. **`/home`** — l'utilisateur coche un ou plusieurs decks, règle le nombre de cartes, le mode (*deviner la réponse* ou *deviner la question*) et le type (*QCM* ou *réponse exacte*).
2. Le lien "Démarrer la session" navigue vers **`/session?decks=1,2&count=10&mode=answer&type=qcm`**.
3. **`session/+page.server.ts`** (load) :
   - Récupère toutes les cartes des decks sélectionnés.
   - Mélange et tronque à `count`.
   - Génère le pool de distracteurs QCM (`allAnswers`).
4. **`session/+page.svelte`** gère entièrement le jeu côté client (état Svelte 5).
5. À la fin, le formulaire `?/saveResult` envoie score + total → upsert dans `user_stats`.

## Format d'import JSON

```json
{
  "name": "Nom du jeu",
  "description": "Description optionnelle",
  "cards": [
    { "question": "...", "answer": "..." }
  ]
}
```

Contrainte : minimum 4 cartes (nécessaire pour le mode QCM à 4 choix).

## Commandes utiles

```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run db:push      # Applique le schéma sans migration (dev)
npm run db:generate  # Génère les fichiers de migration
npm run db:migrate   # Applique les migrations
npm run db:studio    # Interface Drizzle Studio (inspection BDD)
npm run check        # Vérification TypeScript + Svelte
```
