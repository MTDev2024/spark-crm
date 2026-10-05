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
    dashboard/ actions/ parametres/
    prospects/         liste, nouveau/, [id]/ (fiche), [id]/modifier/
    bibliotheque/[section]/
  components/
    ui/                shadcn/ui
    layout/            shell, navigation (sidebar desktop, barre basse mobile)
    dashboard/         blocs du dashboard (live-blocks = données réelles)
    prospects/         liste, formulaire, fiche et ses panneaux
    actions/           ligne d'action réutilisable, page Actions
    shared/            en-tête de page, champs de formulaire, état vide…
  config/              navigation, libellés français
  lib/
    domain/            règles métier pures : exploitabilité par canal, échéances et tri des actions
    store/             crm-store : données locales (localStorage) + hook useCrm
    validation/        schémas Zod : formulaires et qualification
  types/domain.ts      types fondamentaux
```

Voir [DEVELOPMENT.md](DEVELOPMENT.md) pour le flux de données et les conventions.

Les dossiers `lib/supabase`, `lib/ai`, `lib/research`… seront créés quand ils auront du contenu.

## Décisions

| Décision | Raison |
| --- | --- |
| Navigation mobile en barre basse | usage terrain, pouce |
| Routes en français (`/bibliotheque`, `/parametres`) | cohérence avec l'interface |
| Bibliothèque en une route dynamique `[section]` | six sections au rendu identique pour l'instant |
| Vitest | léger, sans configuration lourde, tests de la logique métier |
| Pas de données fictives | tout bloc vide affiche un état vide explicite |
| Données en localStorage (phase 2) | permet d'avoir le workflow complet sans backend ; isolé dans `lib/store/crm-store.ts`, remplacé par Supabase en phase 3 |
| `useSyncExternalStore` pour le store | mécanisme React standard pour un état externe, sans dépendance supplémentaire |
| Formulaires en `FormData` + Zod | pas de bibliothèque de formulaires : peu de champs, validation centralisée dans `lib/validation` |
| Dates en `YYYY-MM-DD` local | échéances au jour près ; comparables comme du texte, sans piège de fuseau horaire |
| Suppression d'un prospect en cascade | actions, interactions et données rattachées sont supprimées, après confirmation |
| `eslint` audité mais non « fixé » | les alertes `npm audit` concernent l'outillage de lint, pas l'exécution ; `--force` rétrograderait Next |

## Prochaines couches

Supabase (schéma, RLS, Auth), puis `lib/ai` (client OpenAI serveur, contexte dynamique, journal des appels).
