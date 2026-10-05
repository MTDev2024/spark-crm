# Domaine

Types dans [src/types/domain.ts](src/types/domain.ts).

## Fait, signal, hypothèse

`InfoKind` : `fact` (vérifié), `signal` (observable à portée commerciale), `hypothesis` (interprétation, toujours présentée comme telle).

## Statut d'une donnée

`DataStatus` : `confirmed`, `to_verify`, `missing`, `searched_not_found`, `not_applicable`. Un `DataPoint` conserve valeur, nature, statut, source, dates de collecte et de vérification, confiance éventuelle.

## Exploitabilité par canal

[src/lib/domain/readiness.ts](src/lib/domain/readiness.ts)

| Canal | Requiert |
| --- | --- |
| Appel | téléphone |
| Visite | adresse |
| Email | email |
| Message, rendez-vous | rien |
| Qualification | rien |

## Écosystème numérique

Les outils (Planity, Stripe, Brevo, CMS…) ne sont pas des champs fixes : un référentiel `DigitalTool` extensible relié aux prospects.

## Qualification

Schéma Zod dans [src/lib/validation/qualification.ts](src/lib/validation/qualification.ts) : faits, signaux et hypothèses séparés ; problème actif nullable ; grille savoir / faire / savoir-faire ; canal et prochaine action nullables. Le score éventuel reste secondaire.

## Actions et interactions

Une `Interaction` référence une prochaine action, ou porte `noNextAction = true`. Le formulaire d'interaction impose ce choix : aucune option n'est présélectionnée ([src/lib/validation/interaction.ts](src/lib/validation/interaction.ts)), et `addInteraction` crée l'interaction et son action en une seule écriture.

## Échéances

[src/lib/domain/actions.ts](src/lib/domain/actions.ts) : une action à faire est `overdue` (en retard), `today`, `upcoming` ou `no_date`. Tri : échéance la plus proche d'abord, sans échéance en dernier, puis priorité. Un prospect sans aucune action à faire déclenche une alerte sur le dashboard.

## Données saisies

Un `DataPoint` doit avoir une valeur s'il est « confirmé » ou « à vérifier » ; « manquant », « recherché, introuvable » et « non applicable » n'en ont pas. Une valeur inconnue est affichée « Inconnu », jamais complétée. La source est un texte libre en phase 2 ; elle deviendra un lien vers la table des sources en phase 4.
