# Référence Git & GitHub — Codes & Explications

*Document de référence pour Mor Talla DIENG — Data Analyst*

Ce document couvre Git (le système de contrôle de version) et GitHub (la
plateforme qui l'héberge), du cycle de travail quotidien jusqu'aux workflows
de collaboration et à l'automatisation.

---

## Table des matières

1. [Concepts fondamentaux](#1-concepts-fondamentaux)
2. [Configuration initiale](#2-configuration-initiale)
3. [Créer et cloner un dépôt](#3-créer-et-cloner-un-dépôt)
4. [Le cycle de base : add, commit, status](#4-le-cycle-de-base--add-commit-status)
5. [Consulter l'historique : log et diff](#5-consulter-lhistorique--log-et-diff)
6. [Les branches](#6-les-branches)
7. [Fusionner : merge et rebase](#7-fusionner--merge-et-rebase)
8. [Travailler avec un dépôt distant](#8-travailler-avec-un-dépôt-distant)
9. [.gitignore — exclure des fichiers](#9-gitignore--exclure-des-fichiers)
10. [Annuler des changements](#10-annuler-des-changements)
11. [Stash — mettre de côté temporairement](#11-stash--mettre-de-côté-temporairement)
12. [Tags — marquer une version](#12-tags--marquer-une-version)
13. [GitHub : dépôts, issues, pull requests](#13-github--dépôts-issues-pull-requests)
14. [Collaborer : le workflow fork + pull request](#14-collaborer--le-workflow-fork--pull-request)
15. [Résoudre un conflit de fusion](#15-résoudre-un-conflit-de-fusion)
16. [GitHub CLI (gh)](#16-github-cli-gh)
17. [GitHub Actions — intégration continue](#17-github-actions--intégration-continue)
18. [GitHub Pages](#18-github-pages)
19. [SSH vs HTTPS](#19-ssh-vs-https)
20. [Alias Git utiles](#20-alias-git-utiles)
21. [Erreurs fréquentes à éviter](#21-erreurs-fréquentes-à-éviter)
22. [Aide-mémoire rapide](#22-aide-mémoire-rapide)

---

## 1. Concepts fondamentaux

Avant les commandes, trois notions à bien comprendre :

- **Dépôt (repository / repo)** : le dossier de votre projet, avec tout son historique de versions stocké dans un sous-dossier caché `.git`.
- **Commit** : une "photo" figée de l'état de vos fichiers à un instant donné, avec un message décrivant ce qui a changé. L'historique Git est une suite de commits.
- **Zone de staging (index)** : une zone intermédiaire entre vos fichiers modifiés et l'historique. On y "ajoute" (`git add`) les changements qu'on veut inclure dans le prochain commit, avant de les valider (`git commit`).

```
Répertoire de travail  →  Zone de staging  →  Historique (commits)
   (git add)                  (git commit)
   fichiers modifiés          prêts à valider      sauvegardés définitivement
```

**Git ≠ GitHub :** Git est l'outil qui gère l'historique de version **sur
votre machine**, en local, sans besoin d'internet. GitHub est un service en
ligne qui héberge une copie de vos dépôts Git, et ajoute des fonctionnalités
collaboratives (pull requests, issues, Actions). On peut utiliser Git sans
jamais toucher à GitHub.

---

## 2. Configuration initiale

```bash
# Identité utilisée pour vos commits (à faire une seule fois par machine)
git config --global user.name "Mor Talla DIENG"
git config --global user.email "diengmortalla4@gmail.com"

# Voir la configuration actuelle
git config --list

# Éditeur par défaut pour les messages de commit longs
git config --global core.editor "nano"

# Nom de branche par défaut lors d'un git init (main plutôt que master)
git config --global init.defaultBranch main
```

**Explication :** `--global` applique le réglage à tous vos dépôts sur cette
machine. Sans cette option, la configuration ne s'applique qu'au dépôt
courant — utile si vous utilisez un email professionnel différent selon le
projet.

---

## 3. Créer et cloner un dépôt

```bash
# Créer un nouveau dépôt Git dans le dossier courant
git init

# Cloner un dépôt existant depuis GitHub (copie complète avec historique)
git clone https://github.com/Mor270/portfolio-pro.git

# Cloner dans un dossier au nom personnalisé
git clone https://github.com/Mor270/portfolio-pro.git mon-dossier
```

**Explication :** `git init` démarre un nouvel historique vide dans un
dossier existant. `git clone` récupère un dépôt **déjà existant** ailleurs
(sur GitHub par exemple), avec tout son historique — c'est ce qu'on utilise
pour récupérer le travail de quelqu'un d'autre ou reprendre un projet sur
une nouvelle machine.

---

## 4. Le cycle de base : add, commit, status

```bash
# Voir l'état actuel : fichiers modifiés, ajoutés, non suivis
git status

# Ajouter un fichier précis à la zone de staging
git add organizer.py

# Ajouter tous les fichiers modifiés/nouveaux du dossier courant
git add .

# Ajouter une partie seulement d'un fichier (mode interactif)
git add -p fichier.py

# Valider les changements ajoutés, avec un message descriptif
git commit -m "Ajout de la fonction de tri par date"

# Ajouter ET valider en une seule commande (uniquement pour les fichiers déjà suivis)
git commit -am "Correction du bug d'affichage"
```

**Explication :** un bon message de commit décrit **ce qui a changé et
pourquoi**, à l'impératif présent (convention courante) : "Ajoute", "Corrige",
"Renomme" — pas "Ajouté" ni "J'ai corrigé". Un commit doit idéalement
regrouper un changement logique cohérent, pas un mélange de plusieurs sujets
sans rapport.

---

## 5. Consulter l'historique : log et diff

```bash
# Historique complet des commits
git log

# Version condensée, un commit par ligne
git log --oneline

# Avec un graphique des branches
git log --oneline --graph --all

# Voir les changements non encore ajoutés (working directory vs staging)
git diff

# Voir les changements déjà ajoutés mais pas encore commités
git diff --staged

# Voir le contenu exact d'un commit précis
git show a1b2c3d

# Qui a modifié quelle ligne d'un fichier, et dans quel commit
git blame fichier.py
```

**Explication :** `git diff` sans option compare le répertoire de travail à
la zone de staging ; `git diff --staged` compare la zone de staging au
dernier commit. C'est une distinction fréquemment confondue par les
débutants.

---

## 6. Les branches

Une branche est une ligne de développement indépendante — elle permet de
travailler sur une fonctionnalité sans affecter le code déjà stable (souvent
sur la branche `main`).

```bash
# Lister les branches (l'étoile indique la branche active)
git branch

# Créer une nouvelle branche
git branch nouvelle-fonctionnalite

# Basculer sur une branche existante
git checkout nouvelle-fonctionnalite

# Créer ET basculer en une seule commande
git checkout -b nouvelle-fonctionnalite
# Équivalent moderne :
git switch -c nouvelle-fonctionnalite

# Revenir sur la branche principale
git checkout main

# Supprimer une branche (après fusion, pour faire le ménage)
git branch -d nouvelle-fonctionnalite

# Renommer la branche courante
git branch -m nouveau-nom
```

**Bonne pratique :** ne jamais travailler directement sur `main` pour une
nouvelle fonctionnalité risquée — créer une branche dédiée, valider son
travail dessus, puis fusionner dans `main` une fois testé et validé.

---

## 7. Fusionner : merge et rebase

```bash
# Fusionner une branche dans la branche actuelle
git checkout main
git merge nouvelle-fonctionnalite

# Rebase : rejoue les commits d'une branche par-dessus une autre,
# pour garder un historique linéaire (sans commit de fusion)
git checkout nouvelle-fonctionnalite
git rebase main
```

**Différence clé :**

| | `merge` | `rebase` |
|---|---|---|
| Historique résultant | Préserve l'historique réel, avec un commit de fusion | Historique linéaire, réécrit les commits |
| Sécurité | Sûr sur des branches déjà partagées | À éviter sur des commits déjà poussés et partagés avec d'autres |
| Cas d'usage typique | Intégrer une fonctionnalité terminée dans `main` | Nettoyer son historique local avant de partager |

**Règle d'or :** ne jamais faire de `rebase` sur des commits que
d'autres personnes ont déjà récupérés — cela réécrit l'historique et casse
la synchronisation pour tout le monde.

---

## 8. Travailler avec un dépôt distant

```bash
# Voir les dépôts distants configurés
git remote -v

# Ajouter un dépôt distant (fait automatiquement par gh repo create)
git remote add origin https://github.com/Mor270/projet.git

# Envoyer les commits locaux vers le dépôt distant
git push origin main

# Première fois : lie la branche locale à la branche distante
git push -u origin main
# Ensuite, un simple "git push" suffit

# Récupérer les changements distants ET les fusionner localement
git pull

# Récupérer les changements distants SANS les fusionner (juste regarder)
git fetch
git log origin/main    # voir ce qui a changé avant de décider de fusionner
```

**Explication :** `git pull` = `git fetch` + `git merge` en une seule
commande. En équipe, `git fetch` seul est plus prudent : il permet
d'inspecter les changements distants avant de les intégrer à son propre
travail.

---

## 9. .gitignore — exclure des fichiers

```
# Contenu type d'un fichier .gitignore
__pycache__/
*.pyc
.DS_Store
node_modules/
.env
*.log
```

**Explication :** ce fichier liste les fichiers et dossiers que Git doit
**ignorer** — fichiers temporaires, dépendances régénérables, secrets
(clés API, mots de passe), fichiers spécifiques à votre système
d'exploitation. Un `.env` contenant des identifiants ne doit **jamais**
être committé, même par accident.

```bash
# Si un fichier est déjà suivi par Git avant d'être ajouté au .gitignore
git rm --cached fichier_a_ignorer.txt
```

---

## 10. Annuler des changements

```bash
# Annuler les modifications non ajoutées d'un fichier (retour à la dernière version commitée)
git checkout -- fichier.py
# Équivalent moderne :
git restore fichier.py

# Retirer un fichier de la zone de staging (sans perdre les modifications)
git restore --staged fichier.py

# Modifier le dernier commit (message ou contenu)
git commit --amend -m "Nouveau message corrigé"

# Revenir à un commit précédent en gardant l'historique (crée un nouveau commit inverse)
git revert a1b2c3d

# Revenir à un commit précédent en réécrivant l'historique (dangereux si déjà partagé)
git reset --soft a1b2c3d    # garde les changements en staging
git reset --mixed a1b2c3d   # garde les changements dans le répertoire de travail (défaut)
git reset --hard a1b2c3d    # supprime tout, retour exact à cet état
```

**Explication :** `git revert` est la méthode **sûre** pour annuler un
commit déjà partagé — elle ajoute un nouveau commit qui annule les
changements, sans réécrire l'historique. `git reset --hard` **supprime
définitivement** les changements non sauvegardés ailleurs — à utiliser avec
une extrême prudence, uniquement sur des commits purement locaux.

---

## 11. Stash — mettre de côté temporairement

```bash
# Mettre de côté les modifications en cours (répertoire de travail redevient propre)
git stash

# Voir la liste des stash enregistrés
git stash list

# Récupérer le dernier stash et le supprimer de la liste
git stash pop

# Récupérer un stash sans le supprimer de la liste
git stash apply

# Supprimer tous les stash
git stash clear
```

**Explication :** utile quand on doit changer de branche en urgence (ex :
corriger un bug critique) alors qu'un travail en cours n'est pas prêt à être
commité — le stash le met de côté proprement, récupérable plus tard.

---

## 12. Tags — marquer une version

```bash
# Créer un tag simple sur le commit actuel
git tag v1.0

# Créer un tag annoté (avec message, recommandé pour les vraies versions)
git tag -a v1.0 -m "Première version stable"

# Envoyer les tags vers GitHub (par défaut, git push ne les envoie pas)
git push origin v1.0
git push origin --tags     # tous les tags d'un coup

# Lister les tags
git tag
```

**Explication :** les tags marquent des points précis de l'historique comme
des versions officielles (ex : `v1.0`, `v2.1.3`), souvent utilisés en lien
avec les **Releases** GitHub, pour distribuer une version stable et
téléchargeable d'un projet.

---

## 13. GitHub : dépôts, issues, pull requests

### Issues

Un ticket pour suivre un bug, une idée de fonctionnalité, ou une tâche.
Peut être assigné, étiqueté (label), lié à une pull request qui le résout
(en écrivant `Fixes #12` dans le message de la pull request, qui ferme
automatiquement l'issue n°12 une fois fusionnée).

### Pull Requests (PR)

Une demande de fusion d'une branche vers une autre, avec :
- Un espace de discussion et de revue de code (commentaires ligne par ligne)
- Un affichage automatique du diff (différences) entre les deux branches
- La possibilité de bloquer la fusion tant que des vérifications automatiques (tests, CI) n'ont pas réussi

### Fork

Une copie complète d'un dépôt vers votre propre compte GitHub, indépendante
de l'original — utilisée pour contribuer à un projet qu'on ne possède pas
(open source), en proposant ensuite ses changements via une pull request
vers le dépôt d'origine.

---

## 14. Collaborer : le workflow fork + pull request

```bash
# 1. Fork le dépôt depuis l'interface GitHub (bouton "Fork")

# 2. Cloner votre fork en local
git clone https://github.com/votre-compte/projet-original.git

# 3. Ajouter le dépôt original comme second remote, pour rester à jour
git remote add upstream https://github.com/compte-original/projet-original.git

# 4. Créer une branche dédiée à votre contribution
git checkout -b ma-contribution

# 5. Travailler, commiter, puis pousser vers VOTRE fork
git push origin ma-contribution

# 6. Ouvrir une pull request depuis l'interface GitHub, de votre branche vers le dépôt original

# 7. Rester synchronisé avec le projet original pendant que la PR est en attente
git fetch upstream
git merge upstream/main
```

**Explication :** ce workflow est le standard de l'open source — on ne
pousse jamais directement sur un dépôt qu'on ne possède pas, on propose ses
changements via une pull request que les mainteneurs du projet peuvent
relire et accepter (ou demander des modifications).

---

## 15. Résoudre un conflit de fusion

Un conflit survient quand Git ne peut pas fusionner automatiquement deux
versions différentes d'une même partie de fichier.

```bash
git merge une-branche
# Auto-merging fichier.py
# CONFLICT (content): Merge conflict in fichier.py
```

Git insère des marqueurs directement dans le fichier concerné :

```python
<<<<<<< HEAD
salaire_base = 40000
=======
salaire_base = 42000
>>>>>>> une-branche
```

**Pour résoudre :**
1. Ouvrir le fichier, choisir la version à garder (ou fusionner les deux manuellement)
2. Supprimer les marqueurs `<<<<<<<`, `=======`, `>>>>>>>`
3. `git add fichier.py` pour marquer le conflit comme résolu
4. `git commit` pour finaliser la fusion (le message est souvent pré-rempli automatiquement)

**En cas de doute**, on peut toujours abandonner une fusion en cours :
```bash
git merge --abort
```

---

## 16. GitHub CLI (gh)

```bash
# S'authentifier
gh auth login

# Créer un dépôt sur GitHub directement depuis le dossier local
gh repo create mon-projet --public --source=. --remote=origin

# Cloner un dépôt
gh repo clone Mor270/portfolio-pro

# Lister vos dépôts
gh repo list

# Créer une pull request depuis le Terminal
gh pr create --title "Ma contribution" --body "Description du changement"

# Lister les pull requests d'un dépôt
gh pr list

# Voir le statut de vos issues
gh issue list

# Ouvrir le dépôt actuel dans le navigateur
gh repo view --web
```

**Explication :** `gh` évite les allers-retours entre le Terminal et le
navigateur pour les actions GitHub courantes — particulièrement utile pour
automatiser des scripts qui créent des dépôts ou des pull requests.

---

## 17. GitHub Actions — intégration continue

Un workflow automatisé qui s'exécute à chaque événement défini (push,
pull request, planification). Défini par un fichier YAML dans
`.github/workflows/`.

```yaml
# .github/workflows/test.yml
name: Tests Python

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -r requirements.txt
      - run: pytest
```

**Explication :** ce fichier déclenche automatiquement l'exécution des
tests à chaque `push` ou pull request vers `main` — évite de fusionner du
code qui casse les tests. C'est le même mécanisme qui a construit
automatiquement votre site avec **GitHub Pages** (section 18).

---

## 18. GitHub Pages

Héberge gratuitement un site statique (HTML/CSS/JS) directement depuis un
dépôt GitHub.

**Activation :** Settings → Pages → choisir la branche (`main`) et le
dossier (`/root` ou `/docs`) → Save.

```bash
# Si le déploiement échoue à cause du moteur Jekyll par défaut
# (fréquent avec des fichiers Markdown non prévus pour un blog)
touch .nojekyll
git add .nojekyll
git commit -m "Desactiver Jekyll"
git push
```

**URL générée :** `https://<utilisateur>.github.io/<nom-du-depot>/`

---

## 19. SSH vs HTTPS

Deux façons de s'authentifier auprès de GitHub pour `push`/`pull`.

| | HTTPS | SSH |
|---|---|---|
| Configuration initiale | Plus simple (mot de passe / token) | Nécessite de générer une paire de clés |
| Usage au quotidien | Peut redemander une authentification | Aucune saisie une fois configuré |
| Recommandé pour | Débuter, usage occasionnel | Usage régulier, plusieurs dépôts |

```bash
# Générer une paire de clés SSH
ssh-keygen -t ed25519 -C "diengmortalla4@gmail.com"

# Afficher la clé publique à copier dans GitHub (Settings → SSH Keys)
cat ~/.ssh/id_ed25519.pub

# Cloner en SSH plutôt qu'en HTTPS
git clone git@github.com:Mor270/portfolio-pro.git

# Changer l'URL d'un remote existant de HTTPS vers SSH
git remote set-url origin git@github.com:Mor270/portfolio-pro.git
```

---

## 20. Alias Git utiles

```bash
# Créer des raccourcis pour les commandes fréquentes
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm "commit -m"
git config --global alias.lg "log --oneline --graph --all"

# Utilisation ensuite
git st        # au lieu de git status
git lg        # historique graphique condensé
```

---

## 21. Erreurs fréquentes à éviter

| Erreur | Pourquoi c'est un problème | Solution |
|---|---|---|
| Committer un fichier `.env` ou une clé API | Fuite de secrets, visible dans tout l'historique même supprimé après coup | `.gitignore` dès la création du projet ; en cas de fuite, révoquer la clé immédiatement |
| `git push --force` sur une branche partagée | Écrase l'historique des autres, perte de commits | Utiliser `--force-with-lease`, et seulement sur ses propres branches |
| Commits géants regroupant plusieurs sujets | Historique illisible, difficile à annuler sélectivement | Un commit = un changement logique cohérent |
| Oublier `git pull` avant de commencer à travailler | Divergence inutile, conflits évitables | `git pull` en début de session sur un projet partagé |
| Travailler directement sur `main` | Casse la branche stable en cas d'erreur | Toujours une branche dédiée par fonctionnalité |
| Message de commit "fix", "wip", "update" sans détail | Historique inutilisable pour comprendre les changements passés | Décrire précisément ce qui a changé et pourquoi |
| `git add .` sans vérifier `git status` avant | Ajoute des fichiers indésirables (temporaires, secrets) | Toujours `git status` avant un `git add .` |

---

## 22. Aide-mémoire rapide

| Je veux… | Commande |
|---|---|
| Démarrer un suivi de version | `git init` |
| Récupérer un dépôt existant | `git clone <url>` |
| Voir l'état actuel | `git status` |
| Préparer des changements | `git add .` |
| Valider des changements | `git commit -m "message"` |
| Voir l'historique | `git log --oneline` |
| Créer une branche | `git switch -c nom-branche` |
| Changer de branche | `git switch nom-branche` |
| Fusionner une branche | `git merge nom-branche` |
| Envoyer vers GitHub | `git push` |
| Récupérer depuis GitHub | `git pull` |
| Annuler un fichier non ajouté | `git restore fichier` |
| Annuler un commit (sûr) | `git revert <hash>` |
| Mettre de côté temporairement | `git stash` |
| Marquer une version | `git tag -a v1.0 -m "message"` |
| Créer un dépôt GitHub depuis le Terminal | `gh repo create` |
| Automatiser des tests/déploiements | GitHub Actions (`.github/workflows/`) |
| Publier un site gratuitement | GitHub Pages |

---

*Document constitué comme référence personnelle de travail — à compléter au
fil des workflows Git rencontrés en environnement professionnel et
collaboratif.*
