# Connaissances commerciales

## Où ça se trouve dans l'application

Menu **Bibliothèque** : Méthodes, Offres, Réalisations, Arguments, Objections, Sources, Règles. Chaque section permet d'ajouter, modifier et supprimer des éléments. L'application ne contient **aucun contenu préchargé** : tout est saisi par l'utilisateur à partir de ses propres sources.

Les champs de chaque type sont décrits dans `src/config/library.ts` ; la base est définie dans `supabase/migrations/20261006000000_commercial_library.sql`.

## Règles de validation implémentées

- Une méthode **validée** doit avoir une source (vérifié dans le formulaire **et** par une contrainte SQL).
- Une source utilisée par une méthode ne peut pas être supprimée.
- Une méthode dont la source n'est pas « Validée pour utilisation » affiche un avertissement.
- Les listes (règles, contextes, questions…) se saisissent une valeur par ligne.
- Un champ laissé vide reste vide (inconnu) : rien n'est complété automatiquement.

Pas encore implémenté : liens entre méthodes liées (`relatedMethods`), versionnage détaillé des méthodes (un numéro de version texte est enregistré), utilisation par l'IA (phases suivantes).

## Méthodes

Chaque méthode (SPIN, SONCAS(E), AIDA, CAB, BANT, Challenger Sale, objections, closing, setting, relance, négociation) est une connaissance structurée : nom, description, objectif, source, auteur, version, contextes applicables ou non, étapes, règles, exemples, limites, méthodes liées, statut.

Une méthode n'est opérationnelle que si elle a une **source identifiable** et le statut `validated`. Son contenu n'est jamais reconstitué de mémoire par le modèle.

## Playbooks

Les scénarios propres à l'activité de l'utilisateur sont séparés des méthodes générales.

## Sources

Statuts : source brute → analysée → principes extraits → validée → validée pour utilisation ; ou à revoir / rejetée.

## Scalezia

Source méthodologique, pas une vérité absolue. Les principes sont adaptés au produit ; les chiffres et résultats cités par la source restent des données contextuelles et ne deviennent jamais des règles algorithmiques.

## Règles commerciales (exemples)

Ne pas dénigrer les outils existants · ne pas vendre systématiquement un site · partir du problème · ne pas inventer · ne pas utiliser une réalisation non pertinente · adapter au canal · privilégier la conversation au premier contact.
