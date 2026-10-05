# IA

État : aucune intégration IA pour l'instant. Ce document fixe le cadre.

## Capacités prévues (ordre)

Qualification structurée → préparation d'appel → débrief → relances → recherche/enrichissement → orchestrateur.

## Règles

- Appels OpenAI côté serveur uniquement.
- Contexte construit dynamiquement par tâche (prospect, données pertinentes, historique, objectif, canal, méthodes, règles, offres, réalisations, sources), jamais toute la base.
- Sorties critiques validées par Zod ; une sortie invalide est rejetée, pas corrigée silencieusement.
- Faits, signaux et hypothèses restent distincts ; les champs inconnus restent `null`.
- L'IA ne modifie pas les méthodes validées ni les règles, ne supprime pas de données importantes, n'envoie aucun message et ne prend aucune décision irréversible sans validation.
- Chaque outil d'agent déclare objectif, paramètres, permissions, résultat structuré et gestion d'erreur.

## Traçabilité (à implémenter)

Par génération : modèle, version du prompt, méthodes et versions utilisées, durée, statut, erreur, date.
