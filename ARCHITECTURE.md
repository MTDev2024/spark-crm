# Architecture

## Principes

- Simple et modulaire : pas d'abstraction avant le besoin.
- Logique métier dans `src/lib/`, jamais dispersée dans les composants.
- Sorties IA validées par schémas Zod.
- Secrets et appels IA uniquement côté serveur.

## Structure actuelle

```text
src/
  app/                 routes (App Router)
    dashboard/ prospects/ actions/ parametres/
    bibliotheque/[section]/
  components/
    ui/                shadcn/ui
    layout/            shell, navigation (sidebar desktop, barre basse mobile)
    dashboard/ shared/
  config/navigation.ts navigation principale et sections de la bibliothèque
  lib/
    domain/            règles métier pures (exploitabilité par canal)
    validation/        schémas Zod (qualification)
  types/domain.ts      types fondamentaux
```

Les dossiers `lib/supabase`, `lib/ai`, `lib/research`… seront créés quand ils auront du contenu.

## Décisions

| Décision | Raison |
| --- | --- |
| Navigation mobile en barre basse | usage terrain, pouce |
| Routes en français (`/bibliotheque`, `/parametres`) | cohérence avec l'interface |
| Bibliothèque en une route dynamique `[section]` | six sections au rendu identique pour l'instant |
| Vitest | léger, sans configuration lourde, tests de la logique métier |
| Pas de données fictives | tout bloc vide affiche un état vide explicite |
| `eslint` audité mais non « fixé » | les alertes `npm audit` concernent l'outillage de lint, pas l'exécution ; `--force` rétrograderait Next |

## Prochaines couches

Supabase (schéma, RLS, Auth), puis `lib/ai` (client OpenAI serveur, contexte dynamique, journal des appels).
