# PRD - FlashCards

## Vision

Clone simplifié d'Anki en Svelte. Interface moderne flat design, import JSON, sessions configurables avec QCM et réponse exacte.

---

## Palette de couleurs

| Rôle | Hex |
|------|-----|
| Fond clair / surface | `#e5e7e6` |
| Fond cartes / sections | `#EEE6D8` |
| Accent principal (boutons, highlights) | `#DAAB3A` |
| Accent secondaire (hover, bordures) | `#B67332` |
| Accent fort (erreurs, titres) | `#93441A` |

---

## Format JSON d'import

```json
{
  "name": "Capitales du monde",
  "description": "Les capitales des pays du monde",
  "cards": [
    {
      "question": "Quelle est la capitale de la France ?",
      "answer": "Paris"
    },
    {
      "question": "Quelle est la capitale du Japon ?",
      "answer": "Tokyo"
    }
  ]
}
```

- `name` (string, requis) : nom du jeu de cartes
- `description` (string, optionnel) : description du jeu
- `cards` (array, requis) : liste des cartes, minimum 4 cartes (pour générer les choix QCM)
- `cards[].question` (string, requis) : la question
- `cards[].answer` (string, requis) : la réponse

---

## Fonctionnalités

### F1 - Gestion des utilisateurs

- Écran d'accueil : champ texte pour saisir un pseudo
- Pas de mot de passe, pas d'authentification
- Le pseudo est stocké en BDD et persiste via localStorage côté client
- Sélection d'un utilisateur existant ou création d'un nouveau
- Bouton "changer d'utilisateur" accessible depuis le header

### F2 - Import de jeux de cartes

- Bouton d'import sur la page principale
- Accepte un fichier `.json` respectant le format ci-dessus
- Validation du JSON à l'import :
  - Présence des champs requis (`name`, `cards`)
  - Chaque carte a `question` et `answer`
  - Minimum 4 cartes par jeu
- Affichage d'un message d'erreur clair si le format est invalide
- Le jeu importé est stocké en BDD et disponible pour tous les utilisateurs

### F3 - Gestion des jeux de cartes

- Page listant tous les jeux de cartes disponibles
- Pour chaque jeu : nom, description, nombre de cartes
- Possibilité de supprimer un jeu de cartes
- Pas d'édition des cartes (uniquement import/suppression)

### F4 - Lancement d'une session

Configuration avant de démarrer :

1. **Sélection des jeux** : cocher un ou plusieurs jeux de cartes
2. **Nombre de cartes** : slider ou champ numérique (min 1, max = total des cartes sélectionnées)
3. **Mode de jeu** :
   - "Deviner la réponse" : la question est affichée, il faut trouver la réponse
   - "Deviner la question" : la réponse est affichée, il faut trouver la question
4. **Type de question** :
   - QCM (4 choix générés à partir des autres cartes du pool)
   - Réponse exacte (champ texte, comparaison insensible à la casse et aux accents)

Les cartes sont mélangées aléatoirement pour chaque session.

### F5 - Déroulement d'une session

- Affichage d'une carte à la fois
- Barre de progression (carte X sur Y)
- **Mode QCM** :
  - 4 boutons de choix (1 bonne réponse + 3 distracteurs pris au hasard dans le pool)
  - Feedback immédiat : vert si correct, rouge si incorrect (avec la bonne réponse affichée)
- **Mode réponse exacte** :
  - Champ texte + bouton valider
  - Comparaison insensible à la casse et aux accents
  - Feedback immédiat identique au QCM
- Bouton "Suivant" pour passer à la carte suivante après feedback
- Écran de résultat en fin de session :
  - Score : X / Y bonnes réponses
  - Pourcentage de réussite
  - Indication si c'est un nouveau record
  - Bouton "Rejouer" et "Retour à l'accueil"

### F6 - Progression et historique

- Pour chaque utilisateur, stocker par jeu de cartes :
  - Nombre de sessions jouées
  - Meilleur score (record) en nombre de bonnes réponses et total de cartes
  - Date du dernier jeu
- Page "Historique" accessible depuis le header :
  - Liste des jeux avec le record pour chaque jeu
  - Statistiques globales : total de sessions, taux de réussite moyen

---

## Architecture technique

### Stack

- **Frontend** : SvelteKit (SSR + client)
- **BDD** : SQLite via `better-sqlite3` (fichier local, zéro config)
- **ORM** : Drizzle ORM (léger, type-safe)
- **Style** : CSS custom (flat design, pas de framework CSS)

### Schéma BDD

```
users
  id          INTEGER PRIMARY KEY
  username    TEXT UNIQUE NOT NULL
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP

decks
  id          INTEGER PRIMARY KEY
  name        TEXT NOT NULL
  description TEXT
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP

cards
  id          INTEGER PRIMARY KEY
  deck_id     INTEGER REFERENCES decks(id) ON DELETE CASCADE
  question    TEXT NOT NULL
  answer      TEXT NOT NULL

user_stats
  id          INTEGER PRIMARY KEY
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE
  deck_id     INTEGER REFERENCES decks(id) ON DELETE CASCADE
  sessions    INTEGER DEFAULT 0
  best_score  INTEGER DEFAULT 0
  best_total  INTEGER DEFAULT 0
  last_played DATETIME
  UNIQUE(user_id, deck_id)
```

### Pages / Routes

| Route | Description |
|-------|-------------|
| `/` | Écran de connexion (choix/création de pseudo) |
| `/home` | Page principale : liste des jeux, import, lancer session |
| `/session` | Configuration + déroulement de la session |
| `/history` | Historique et records de l'utilisateur |

---

## UI / UX

- **Layout** : centré, max-width 800px, responsive mobile-first
- **Flat design** : pas d'ombres, bordures fines, coins arrondis (8px)
- **Typographie** : police sans-serif système (Inter si disponible)
- **Fond de page** : `#e5e7e6`
- **Cartes/conteneurs** : fond `#EEE6D8`, bordure `#B67332`
- **Boutons principaux** : fond `#DAAB3A`, texte `#93441A`, hover `#B67332`
- **Texte** : `#93441A` pour les titres, `#333` pour le corps
- **Feedback correct** : bordure/fond vert atténué
- **Feedback incorrect** : bordure/fond `#93441A` atténué
- **Transitions** : animations CSS subtiles (fade, slide) sur les cartes

---

## Hors scope

- Authentification / mots de passe
- Édition manuelle des cartes (uniquement import JSON)
- Algorithme de répétition espacée (type Anki)
- Mode multijoueur
- Export de données
- Déploiement (app locale uniquement)
