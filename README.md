# Spark CRM

Copilote IA de prospection commerciale. « Spark CRM » est un nom de travail technique ; le nom commercial sera choisi ultérieurement.

Question centrale : *quelle est la meilleure action commerciale à effectuer maintenant sur ce prospect, et comment la conduire ?*

## Stack

Next.js (App Router), TypeScript strict, Tailwind CSS 4, shadcn/ui, Zod, Vitest, Supabase (PostgreSQL, Auth, RLS). Prévu : API OpenAI côté serveur, Vercel.

## Démarrage

```bash
npm install
npm run dev        # http://localhost:3000
```

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` | build de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | vérification TypeScript |
| `npm test` | tests unitaires (Vitest) |

## État actuel

Phases 0 à 2 : socle technique, shell et navigation, gestion des prospects (création, modification, suppression, recherche), fiche prospect (données avec provenance, exploitabilité par canal, historique, actions), page Actions, dashboard alimenté (À faire aujourd'hui, alertes, prospects récents).

Phase 4 : base commerciale (Bibliothèque : méthodes avec étapes et source obligatoire pour être validées, offres, réalisations, arguments, objections, sources, règles), sans contenu préchargé.

Phase 3 : authentification (email + mot de passe, inscriptions fermées) et persistance dans Supabase, avec isolation des données par utilisateur (RLS). Pas encore d'IA. Voir [ROADMAP.md](ROADMAP.md).

## Configuration

Copier `.env.example` en `.env.local` et renseigner l'URL et la clé publishable du projet Supabase. La procédure complète (base, utilisateur, réglages) est dans [DEVELOPMENT.md](DEVELOPMENT.md).

## Documentation

[DEVELOPMENT.md](DEVELOPMENT.md) (par où commencer) · [PRODUCT.md](PRODUCT.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [DOMAIN.md](DOMAIN.md) · [AI.md](AI.md) · [KNOWLEDGE.md](KNOWLEDGE.md) · [ROADMAP.md](ROADMAP.md)

## Sécurité

Aucun secret dans le code. Les clés (Supabase service, OpenAI) restent côté serveur, dans `.env.local` (ignoré par Git).
