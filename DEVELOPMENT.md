# Guide de développement

Ce document explique comment le code est organisé et par où commencer pour le relire.

## Lancer le projet

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck && npm run lint && npm test && npm run build   # vérifications avant commit
```

## Où se trouve quoi

| Je cherche… | Fichier |
| --- | --- |
| Les types du métier (prospect, action…) | `src/types/domain.ts` |
| Les libellés français affichés | `src/config/labels.ts` |
| Les entrées du menu | `src/config/navigation.ts` |
| Où sont enregistrées les données | `src/lib/store/crm-store.ts` |
| Les règles métier (échéances, tri, exploitabilité) | `src/lib/domain/` |
| La validation des formulaires | `src/lib/validation/` |
| Une page | `src/app/<route>/page.tsx` |
| Un écran / panneau | `src/components/<domaine>/` |

## Comment circulent les données (phase 2)

```text
Formulaire (composant client)
  → parseForm(schéma Zod)      validation, "" devient null
  → fonction du store           addProspect, addAction, addInteraction…
  → commit()                    met à jour l'état + localStorage + prévient React
  → useCrm()                    les composants abonnés se redessinent
```

- **Lecture** : `const { state, hydrated } = useCrm()`.
- **Écriture** : on appelle les fonctions exportées du store, jamais le localStorage directement.
- **`hydrated`** : faux pendant le rendu serveur, car le serveur n'a pas accès au navigateur. `LoadingGate` évite d'afficher « aucun prospect » avant que les données soient lues.
- Quand Supabase arrivera (phase 3), seul `crm-store.ts` sera remplacé : les écrans gardent les mêmes appels.

## Règles à respecter quand on ajoute du code

1. **Inconnu = `null`.** Un champ vide d'un formulaire devient `null` (`optionalText` dans `validation/form.ts`), jamais une valeur inventée. L'interface affiche « Inconnu ».
2. **Logique métier dans `src/lib/`**, pas dans les composants : elle reste testable.
3. **Chaque règle métier a un test** (`*.test.ts` à côté du fichier).
4. **Une interaction débouche sur une action ou sur « aucune »** : voir `interactionFormSchema` et `addInteraction`.
5. **Aucune donnée fictive** dans l'application.
6. **Aucun secret dans le code.** Les clés vont dans `.env.local` (ignoré par Git).

## Ajouter un champ à un prospect (exemple)

1. Ajouter le champ dans `Prospect` (`src/types/domain.ts`).
2. L'ajouter au schéma `prospectFormSchema` (`src/lib/validation/prospect.ts`).
3. L'ajouter au formulaire (`prospect-form.tsx`) et à la fiche (`prospect-detail.tsx`).
4. Ajuster le test de validation si besoin.

## Conventions

- Interface et commentaires en français ; identifiants du code en anglais.
- Dates : chaînes `YYYY-MM-DD` en jour local (se comparent comme du texte).
- Commits : `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, message décrivant uniquement le travail réalisé.
