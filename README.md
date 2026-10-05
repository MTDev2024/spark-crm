# Spark CRM

Copilote IA de prospection commerciale. « Spark CRM » est un nom de travail technique ; le nom commercial sera choisi ultérieurement.

Question centrale : *quelle est la meilleure action commerciale à effectuer maintenant sur ce prospect, et comment la conduire ?*

## Stack

Next.js (App Router), TypeScript strict, Tailwind CSS 4, shadcn/ui, Zod, Vitest. Prévu : Supabase (PostgreSQL, Auth, RLS), API OpenAI côté serveur, Vercel.

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

Phase 0 et 1 : socle technique, shell applicatif, navigation, dashboard (blocs vides, sans donnée fictive), pages principales, types de domaine. Pas encore de persistance ni d'IA. Voir [ROADMAP.md](ROADMAP.md).

## Documentation

[PRODUCT.md](PRODUCT.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [DOMAIN.md](DOMAIN.md) · [AI.md](AI.md) · [KNOWLEDGE.md](KNOWLEDGE.md) · [ROADMAP.md](ROADMAP.md)

## Sécurité

Aucun secret dans le code. Les clés (Supabase service, OpenAI) restent côté serveur, dans `.env.local` (ignoré par Git).
