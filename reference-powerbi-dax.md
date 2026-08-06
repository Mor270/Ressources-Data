# Référence Power BI & DAX — Modélisation, Codes & Explications

*Document de référence pour Mor Talla DIENG — Data Analyst, Power BI Specialist*

Ce document part du principe fondamental de Power BI : **90% des problèmes
de DAX viennent d'un mauvais modèle de données, pas d'une mauvaise
formule.** On commence donc par la modélisation, avant même d'écrire une
seule ligne de DAX.

---

## Table des matières

1. [La modélisation des données](#1-la-modélisation-des-données)
2. [Relations : cardinalité et direction de filtre](#2-relations--cardinalité-et-direction-de-filtre)
3. [Power Query — préparer les données](#3-power-query--préparer-les-données)
4. [Colonnes calculées vs Mesures vs Tables calculées](#4-colonnes-calculées-vs-mesures-vs-tables-calculées)
5. [Syntaxe DAX de base](#5-syntaxe-dax-de-base)
6. [Le concept clé : contexte de ligne vs contexte de filtre](#6-le-concept-clé--contexte-de-ligne-vs-contexte-de-filtre)
7. [CALCULATE — la fonction la plus importante](#7-calculate--la-fonction-la-plus-importante)
8. [Fonctions de table : FILTER, ALL, ALLEXCEPT, VALUES](#8-fonctions-de-table--filter-all-allexcept-values)
9. [Relations manuelles : RELATED et RELATEDTABLE](#9-relations-manuelles--related-et-relatedtable)
10. [Fonctions itératives (X) : SUMX, AVERAGEX, RANKX](#10-fonctions-itératives-x--sumx-averagex-rankx)
11. [Variables : VAR / RETURN](#11-variables--var--return)
12. [Time Intelligence](#12-time-intelligence)
13. [Recettes utiles pour Data Analyst](#13-recettes-utiles-pour-data-analyst)
14. [Erreurs fréquentes à éviter](#14-erreurs-fréquentes-à-éviter)
15. [Power BI Desktop : l'interface et les rapports](#15-power-bi-desktop--linterface-et-les-rapports)
16. [Fonctionnalités avancées de rapport](#16-fonctionnalités-avancées-de-rapport)
17. [Sécurité au niveau des lignes (RLS)](#17-sécurité-au-niveau-des-lignes-rls)
18. [Power BI Service : publier et partager](#18-power-bi-service--publier-et-partager)
19. [Power Query avancé : fusionner, ajouter, paramétrer](#19-power-query-avancé--fusionner-ajouter-paramétrer)
20. [Optimiser les performances d'un modèle](#20-optimiser-les-performances-dun-modèle)
21. [Licences et cycle de déploiement](#21-licences-et-cycle-de-déploiement)
22. [Bonnes pratiques de design de rapport](#22-bonnes-pratiques-de-design-de-rapport)
23. [Aide-mémoire rapide](#23-aide-mémoire-rapide)

---

## 1. La modélisation des données

### Le schéma en étoile (star schema)

C'est le standard en Business Intelligence. Il repose sur deux types de
tables :

- **Tables de faits** (fact tables) : contiennent les événements mesurables — une ligne de vente, une transaction, un audit énergétique. Beaucoup de lignes, peu de colonnes texte, beaucoup de colonnes numériques et de clés étrangères.
- **Tables de dimensions** (dimension tables) : contiennent le contexte descriptif — la liste des clients, des produits, des dates, des régions. Peu de lignes, beaucoup de colonnes texte.

```
        Dim_Client              Dim_Date
             \                      /
              \                    /
               Table_Faits_Ventes
              /                    \
             /                      \
        Dim_Produit             Dim_Region
```

**Pourquoi c'est important :** les dimensions rayonnent autour de la table
de faits, comme une étoile. Chaque dimension filtre la table de faits via
une relation. C'est ce schéma qui rend le DAX simple, rapide et prévisible.

### Pourquoi éviter un modèle "à plat" (une seule grande table)

Un tableau Excel unique avec toutes les colonnes (client, produit, date,
région, montant mélangés) semble plus simple au premier abord, mais :
- Il duplique énormément de données (le nom du client répété sur chaque ligne de vente)
- Il rend les filtres croisés entre plusieurs axes impossibles à gérer proprement
- Il empêche d'utiliser une vraie table de dates pour le Time Intelligence
- Il devient rapidement énorme et lent à charger

### Pourquoi éviter un modèle en flocon (snowflake) sans raison

Un schéma en flocon découpe une dimension en plusieurs sous-tables liées
entre elles (ex : Dim_Produit → Dim_SousCategorie → Dim_Categorie). Il est
parfois nécessaire, mais ajoute des relations et de la complexité. **Règle
générale : préférer une dimension "aplatie" en une seule table quand c'est
possible**, et ne découper que si le volume ou un vrai besoin métier
l'exige.

### La table de dates : indispensable

Toute analyse temporelle sérieuse dans Power BI nécessite une **table de
dates dédiée**, reliée à la table de faits par la colonne date. Elle ne doit
**pas** être générée à partir de la table de faits elle-même.

```dax
Dim_Date =
CALENDAR (DATE(2020, 1, 1), DATE(2026, 12, 31))
```

Puis on enrichit avec des colonnes calculées : `Année`, `Mois`, `NomMois`,
`Trimestre`, `JourSemaine`... Enfin, dans le modèle, on la marque comme
**"Table de dates"** (clic droit sur la table → Marquer comme table de
dates), ce qui active les fonctions de Time Intelligence (section 12).

---

## 2. Relations : cardinalité et direction de filtre

### Cardinalité

| Type | Signification | Exemple |
|---|---|---|
| **Un-à-plusieurs (1:*)** | Le cas normal en schéma étoile | Un client → plusieurs ventes |
| **Plusieurs-à-plusieurs (*:*)** | À éviter sauf nécessité réelle, complique le modèle | Deux tables de faits reliées directement |
| **Un-à-un (1:1)** | Rare, signifie souvent que les deux tables devraient être fusionnées | — |

### Direction de filtre (cross-filter direction)

- **Unique (single)** : le filtre circule seulement de la dimension vers la table de faits. **C'est le réglage par défaut recommandé dans 90% des cas.**
- **Les deux sens (both)** : le filtre circule dans les deux sens. À utiliser avec prudence — peut créer des résultats ambigus ou ralentir le modèle, surtout avec plusieurs tables de faits.

**Règle pratique :** commencer toujours en filtre unique (dimension → fait).
Ne passer en bidirectionnel que si un besoin précis l'impose, et en ayant
compris pourquoi.

### Éviter les relations inactives non nécessaires

Une table ne peut avoir qu'une seule relation **active** vers une autre.
Les relations supplémentaires doivent être marquées inactives et activées
ponctuellement dans une mesure avec `USERELATIONSHIP`. À réserver aux cas
où plusieurs dates ont un sens différent (ex : date de commande vs date de
livraison).

---

## 3. Power Query — préparer les données

Power Query (le "M Language" en arrière-plan) est l'étape **avant** la
modélisation : c'est ici qu'on nettoie et structure les données brutes.

**Bonnes pratiques :**
- Filtrer les lignes et colonnes inutiles **le plus tôt possible** dans les étapes (améliore la performance)
- Renommer les colonnes et tables clairement dès l'import, pas après
- Séparer la logique de nettoyage (Power Query) de la logique de calcul (DAX) — ne pas faire les deux au même endroit
- Utiliser des **paramètres** pour les éléments configurables (chemin de fichier, date de référence)
- Désactiver le chargement des requêtes intermédiaires qui ne servent qu'à construire une autre requête (clic droit → "Activer le chargement" à décocher)

```
// Exemple de logique M (générée automatiquement par l'interface, rarement écrite à la main)
let
    Source = Excel.Workbook(File.Contents("ventes.xlsx"), null, true),
    Table1 = Source{[Item="Ventes",Kind="Table"]}[Data],
    FiltreLignes = Table.SelectRows(Table1, each [Montant] > 0)
in
    FiltreLignes
```

---

## 4. Colonnes calculées vs Mesures vs Tables calculées

| | Colonne calculée | Mesure | Table calculée |
|---|---|---|---|
| **Calculée** | Au chargement des données | À l'affichage, selon le filtre actif | Au chargement des données |
| **Stockée** | Oui, occupe de la mémoire | Non, calculée à la volée | Oui, occupe de la mémoire |
| **Contexte** | Contexte de ligne | Contexte de filtre | Contexte de ligne (au moment de la création) |
| **Usage typique** | Catégoriser une ligne (ex : tranche d'âge) | Agréger un KPI (ex : Total Ventes) | Créer une table de dates, une table de correspondance |

**Règle générale : privilégier les mesures autant que possible.** Une
colonne calculée gonfle la taille du modèle et se recalcule à chaque
rafraîchissement ; une mesure reste légère et s'adapte dynamiquement au
contexte du visuel.

```dax
-- Colonne calculée (stockée ligne par ligne dans la table)
Tranche Age = IF(Employes[Age] < 30, "Junior", "Senior")

-- Mesure (calculée à la volée selon le filtre du visuel)
Total Ventes = SUM(Ventes[Montant])
```

---

## 5. Syntaxe DAX de base

```dax
-- Une mesure simple
Total Ventes = SUM(Ventes[Montant])

-- Référencer une autre mesure
Marge % = DIVIDE([Total Marge], [Total Ventes])

-- DIVIDE gère automatiquement la division par zéro (retourne un blanc par défaut)
Marge % Securisee = DIVIDE([Total Marge], [Total Ventes], 0)

-- Référencer une colonne : Table[Colonne]
-- Référencer une mesure : [NomMesure] (sans nom de table)
```

**Convention de nommage recommandée :** noms de mesures en langage naturel
avec espaces (`Total Ventes`, pas `TotalVentes` ni `total_ventes`) — c'est
ce qui s'affichera directement dans les visuels et rapports.

---

## 6. Le concept clé : contexte de ligne vs contexte de filtre

C'est **le** concept qui débloque la compréhension du DAX.

- **Contexte de ligne** : existe quand DAX évalue une formule ligne par ligne (dans une colonne calculée, ou à l'intérieur d'un `SUMX`/`FILTER`). DAX "sait" sur quelle ligne il se trouve.
- **Contexte de filtre** : l'ensemble des filtres actifs au moment où une mesure est évaluée — venant des slicers, des filtres de page, des lignes/colonnes d'une matrice, ou d'un `CALCULATE`.

```dax
-- Dans une colonne calculée : contexte de ligne uniquement
Marge Ligne = Ventes[PrixVente] - Ventes[CoutAchat]
-- DAX regarde la ligne courante, comme une formule Excel tirée vers le bas

-- Dans une mesure placée dans une matrice par Produit :
Total Ventes = SUM(Ventes[Montant])
-- DAX applique le contexte de filtre "Produit = X" venant de la matrice,
-- puis fait la somme sur toutes les lignes qui correspondent
```

**Le piège classique :** un contexte de ligne ne filtre PAS automatiquement
une table entière. Pour transformer un contexte de ligne en contexte de
filtre, DAX utilise la **transition de contexte**, qui se produit
automatiquement à l'intérieur de `CALCULATE` (et de toute mesure appelée
depuis un contexte de ligne, comme dans un `SUMX`).

---

## 7. CALCULATE — la fonction la plus importante

`CALCULATE` modifie le contexte de filtre dans lequel une expression est
évaluée. C'est la fonction la plus puissante — et la plus centrale — du
langage DAX.

```dax
-- Syntaxe de base
CALCULATE(<expression>, <filtre1>, <filtre2>, ...)

-- Exemple : ventes uniquement pour la catégorie "Data"
Ventes Categorie Data =
CALCULATE(
    SUM(Ventes[Montant]),
    Produits[Categorie] = "Data"
)

-- Exemple : ventes de l'année précédente (ignore le filtre d'année actuel)
Ventes Annee Precedente =
CALCULATE(
    SUM(Ventes[Montant]),
    PREVIOUSYEAR(Dim_Date[Date])
)

-- Retirer un filtre existant avec ALL
Pourcentage du Total =
DIVIDE(
    SUM(Ventes[Montant]),
    CALCULATE(SUM(Ventes[Montant]), ALL(Ventes))
)
```

**Explication :** chaque argument de filtre dans `CALCULATE` **remplace** le
filtre existant sur cette colonne (il ne s'ajoute pas dessus). C'est ce
mécanisme qui permet de calculer un "% du total" en comparant une valeur
filtrée à une valeur non filtrée dans la même visualisation.

---

## 8. Fonctions de table : FILTER, ALL, ALLEXCEPT, VALUES

```dax
-- FILTER : renvoie une table réduite selon une condition
Ventes Grosses Commandes =
CALCULATE(
    SUM(Ventes[Montant]),
    FILTER(Ventes, Ventes[Montant] > 1000)
)

-- ALL : retire tous les filtres d'une table ou colonne (utile pour un % du total)
Total General =
CALCULATE(SUM(Ventes[Montant]), ALL(Ventes))

-- ALLEXCEPT : retire tous les filtres SAUF ceux précisés
Total Par Categorie Seulement =
CALCULATE(
    SUM(Ventes[Montant]),
    ALLEXCEPT(Produits, Produits[Categorie])
)

-- VALUES : renvoie la liste des valeurs distinctes visibles dans le contexte actuel
Nombre Categories Visibles = COUNTROWS(VALUES(Produits[Categorie]))
```

**Explication :** `FILTER` s'utilise presque toujours **à l'intérieur** d'un
`CALCULATE`, car seul, il renvoie une table et non une valeur. Attention à
la performance : filtrer une table entière ligne par ligne avec `FILTER`
est plus coûteux que d'utiliser un filtre simple directement sur une
colonne quand c'est possible.

---

## 9. Relations manuelles : RELATED et RELATEDTABLE

```dax
-- RELATED : récupère une valeur depuis la table "1" d'une relation 1:*
-- (utilisable dans une colonne calculée côté table "plusieurs")
CategorieProduit = RELATED(Produits[Categorie])

-- RELATEDTABLE : récupère les lignes liées depuis la table "plusieurs"
-- (utilisable côté table "1")
NombreVentes = COUNTROWS(RELATEDTABLE(Ventes))
```

**Explication :** ces deux fonctions suivent une relation existante dans le
modèle — elles ne fonctionnent que s'il y a une relation active entre les
deux tables concernées.

---

## 10. Fonctions itératives (X) : SUMX, AVERAGEX, RANKX

Les fonctions terminant par `X` parcourent une table **ligne par ligne**
avant d'agréger le résultat — indispensables dès qu'un calcul ne peut pas se
faire directement sur une colonne existante.

```dax
-- SUMX : calcule une expression pour chaque ligne, puis fait la somme
Chiffre Affaires =
SUMX(Ventes, Ventes[Quantite] * Ventes[PrixUnitaire])

-- AVERAGEX : moyenne d'une expression calculée ligne par ligne
Panier Moyen =
AVERAGEX(VALUES(Ventes[NumeroCommande]), [Total Ventes])

-- RANKX : classement d'une valeur par rapport aux autres lignes
Rang Produit =
RANKX(ALL(Produits), [Total Ventes])
```

**Explication :** `SUM(Ventes[Montant])` fonctionne uniquement si la colonne
`Montant` existe déjà. `SUMX` est nécessaire dès que le calcul doit se faire
**avant** l'agrégation, ligne par ligne (typiquement : quantité × prix
unitaire, quand aucune colonne "montant" n'existe déjà dans la table).

---

## 11. Variables : VAR / RETURN

```dax
Marge % =
VAR TotalVentes = SUM(Ventes[Montant])
VAR TotalCouts = SUM(Ventes[Cout])
VAR Marge = TotalVentes - TotalCouts
RETURN
    DIVIDE(Marge, TotalVentes)
```

**Explication :** les variables (`VAR`) rendent une mesure DAX beaucoup plus
lisible, évitent de recalculer plusieurs fois la même expression (gain de
performance), et facilitent le débogage puisqu'on peut isoler chaque étape
du calcul.

---

## 12. Time Intelligence

Ces fonctions nécessitent une vraie table de dates marquée comme telle dans
le modèle (voir section 1).

```dax
-- Cumul depuis le début de l'année
Ventes YTD = TOTALYTD(SUM(Ventes[Montant]), Dim_Date[Date])

-- Valeur de la même période l'année précédente
Ventes N-1 = CALCULATE(SUM(Ventes[Montant]), SAMEPERIODLASTYEAR(Dim_Date[Date]))

-- Évolution en %
Evolution % = DIVIDE([Total Ventes] - [Ventes N-1], [Ventes N-1])

-- Cumul depuis le début du mois
Ventes MTD = TOTALMTD(SUM(Ventes[Montant]), Dim_Date[Date])

-- Valeur sur les 12 derniers mois glissants
Ventes 12 Mois Glissants =
CALCULATE(
    SUM(Ventes[Montant]),
    DATESINPERIOD(Dim_Date[Date], MAX(Dim_Date[Date]), -12, MONTH)
)
```

**Explication :** ces fonctions manipulent en réalité des tables de dates en
arrière-plan (`SAMEPERIODLASTYEAR` renvoie une table de dates décalée d'un
an) puis les injectent dans un `CALCULATE`. C'est pourquoi une table de
dates continue et correctement marquée est indispensable — sans elle, ces
fonctions produisent des résultats incorrects ou des erreurs.

---

## 13. Recettes utiles pour Data Analyst

**% du total général**
```dax
Pct Du Total =
DIVIDE(
    SUM(Ventes[Montant]),
    CALCULATE(SUM(Ventes[Montant]), ALL(Ventes))
)
```

**Top N dynamique (ex : top 5 produits, avec slicer)**
```dax
Ventes Top 5 Produits =
CALCULATE(
    SUM(Ventes[Montant]),
    TOPN(5, ALL(Produits), CALCULATE(SUM(Ventes[Montant])), DESC)
)
```

**Nombre de clients actifs (distincts) sur la période filtrée**
```dax
Clients Actifs = DISTINCTCOUNT(Ventes[ClientID])
```

**Comparer deux périodes sélectionnées par l'utilisateur (paramètre de champ ou slicer)**
```dax
Ventes Periode Comparee =
CALCULATE(
    SUM(Ventes[Montant]),
    Dim_Date[Date] >= SELECTEDVALUE(Parametres[DateDebut])
        && Dim_Date[Date] <= SELECTEDVALUE(Parametres[DateFin])
)
```

**Indicateur "Nouveau client" (première commande dans la période filtrée)**
```dax
Nouveaux Clients =
VAR ClientsPeriode = VALUES(Ventes[ClientID])
VAR PremiereCommande =
    FILTER(
        ClientsPeriode,
        CALCULATE(MIN(Ventes[DateCommande]), ALL(Dim_Date))
            >= MIN(Dim_Date[Date])
    )
RETURN
    COUNTROWS(PremiereCommande)
```

**Objectif atteint (feu tricolore)**
```dax
Statut Objectif =
VAR Taux = DIVIDE([Total Ventes], [Objectif])
RETURN
    SWITCH(
        TRUE(),
        Taux >= 1, "🟢 Atteint",
        Taux >= 0.8, "🟠 Proche",
        "🔴 En retard"
    )
```

---

## 14. Erreurs fréquentes à éviter

| Erreur | Pourquoi c'est un problème | Solution |
|---|---|---|
| Modèle "à plat" (une seule grande table) | Empêche le Time Intelligence, gonfle le fichier | Passer en schéma étoile (faits + dimensions) |
| Table de dates absente ou générée depuis les faits | Fonctions de Time Intelligence peu fiables | Créer une vraie table `CALENDAR`, continue, marquée comme table de dates |
| Trop de colonnes calculées | Modèle lourd, recalcul à chaque rafraîchissement | Préférer les mesures dès que possible |
| Diviser avec `/` au lieu de `DIVIDE()` | Erreur si le dénominateur est zéro | Toujours utiliser `DIVIDE(num, denom, valeur_si_zero)` |
| Relations bidirectionnelles par défaut | Résultats ambigus, modèle lent | Garder en filtre unique sauf besoin précis |
| `FILTER` sur une table entière quand un filtre simple suffit | Coût de performance inutile | Filtrer directement une colonne quand c'est possible |
| Confondre `SUM` et `SUMX` | Erreur si le calcul n'existe pas déjà en colonne | `SUMX` pour un calcul ligne par ligne avant somme |
| Oublier `VAR` sur les mesures complexes | Formule illisible, recalculs redondants | Structurer avec `VAR ... RETURN` |

---

## 15. Power BI Desktop : l'interface et les rapports

### Les trois vues

- **Vue Rapport** : construction des visuels et de la mise en page destinée aux utilisateurs finaux.
- **Vue Données** : inspection des tables telles que chargées en mémoire (après Power Query).
- **Vue Modèle** : gestion des relations entre tables — c'est ici qu'on dessine le schéma en étoile (section 1).

### Le volet Filtres — trois niveaux

| Niveau | Portée |
|---|---|
| **Filtre de niveau visuel** | S'applique uniquement au visuel sélectionné |
| **Filtre de niveau page** | S'applique à tous les visuels de la page |
| **Filtre de niveau rapport** | S'applique à toutes les pages du rapport |

### Interactions entre visuels

Par défaut, cliquer sur un élément d'un visuel (ex : une barre d'un
graphique) filtre automatiquement les autres visuels de la page. Ce
comportement se personnalise visuel par visuel via **Format → Modifier les
interactions**, avec trois modes possibles : filtrer, surligner, ou aucune
interaction. À revoir systématiquement sur un rapport complexe pour éviter
des filtrages croisés qui n'ont pas de sens métier.

### Choisir le bon visuel

| Besoin | Visuel recommandé |
|---|---|
| Comparer des catégories | Graphique à barres/colonnes |
| Évolution dans le temps | Graphique en courbes |
| Répartition d'un tout | Graphique en anneau (avec parcimonie — un tableau est souvent plus lisible que 8 tranches de camembert) |
| Détail chiffré exact | Table ou matrice |
| KPI unique mis en avant | Carte (Card) ou indicateur KPI |
| Relation entre deux mesures numériques | Nuage de points (scatter) |
| Répartition géographique | Carte (map) ou carte remplie (filled map) |

**Règle générale :** privilégier les visuels les plus simples à lire
rapidement. Un visuel "impressionnant" mais difficile à interpréter en 3
secondes échoue à son objectif en reporting décisionnel.

---

## 16. Fonctionnalités avancées de rapport

### Signets (Bookmarks)

Capturent un état précis du rapport (filtres actifs, visuels visibles/
masqués, mise en page) pour créer une navigation guidée ou des vues
alternatives accessibles en un clic (via un bouton lié au signet).

### Drill-through

Permet de créer une page de détail accessible par clic droit depuis un
visuel, en filtrant automatiquement sur l'élément cliqué (ex : depuis "Total
par région", clic droit sur une région → page de détail des ventes de cette
région uniquement).

### Info-bulles personnalisées (tooltips)

Une page de rapport dédiée, redimensionnée en petit format, peut être
utilisée comme info-bulle enrichie affichée au survol d'un visuel — utile
pour ajouter un mini-graphique contextuel sans surcharger la page
principale.

### Paramètres What-if

Créent un curseur interactif injecté dans une mesure DAX, pour simuler des
scénarios (ex : "et si le prix augmentait de X% ?").

```dax
-- Généré automatiquement par Power BI lors de la création du paramètre
Parametre Augmentation = GENERATESERIES(0, 0.2, 0.01)

-- Utilisation dans une mesure
Ventes Simulees =
[Total Ventes] * (1 + SELECTEDVALUE('Parametre Augmentation'[Parametre Augmentation Value]))
```

### Regroupement (Bins)

Regrouper automatiquement des valeurs numériques ou des catégories texte en
intervalles (ex : tranches d'âge de 10 ans), directement depuis l'interface,
sans écrire de DAX.

---

## 17. Sécurité au niveau des lignes (RLS)

La RLS restreint les lignes visibles selon l'identité de l'utilisateur
connecté — essentiel dès qu'un rapport est partagé avec des utilisateurs qui
ne doivent voir qu'une partie des données (ex : chaque manager régional ne
voit que sa région).

```dax
-- RLS statique : un rôle "Region Nord" avec un filtre fixe
[Region] = "Nord"

-- RLS dynamique : basée sur l'utilisateur connecté, via une table de correspondance
[Email] = USERPRINCIPALNAME()
```

**Mise en place :**
1. Modélisation → Gérer les rôles → créer un rôle et définir son filtre DAX
2. Publier le rapport sur Power BI Service
3. Dans les paramètres du dataset → Sécurité → assigner des utilisateurs/groupes à chaque rôle

**Piège fréquent :** la RLS filtre les lignes des tables, mais ne masque pas
automatiquement les mesures agrégées si elles utilisent `ALL` sans
précaution — un `CALCULATE(..., ALL(Table))` peut recontourner la RLS dans
certains cas. Toujours tester un rôle avec **"Afficher en tant que"** avant
publication.

---

## 18. Power BI Service : publier et partager

### Espaces de travail (Workspaces)

Zone collaborative où sont publiés les rapports, dataflows et datasets
d'une équipe. Distinct de "Mon espace de travail" (personnel, non
partageable).

### Applications (Apps)

Package en lecture seule d'un ou plusieurs rapports d'un espace de travail,
distribué à des utilisateurs qui n'ont pas besoin d'accéder à l'espace de
travail lui-même (généralement les destinataires finaux du reporting,
direction, partenaires).

### Actualisation planifiée (Scheduled Refresh)

Configure la fréquence à laquelle le dataset se resynchronise avec les
sources de données. Nécessite une **passerelle de données (gateway)**
installée localement si les sources sont on-premises (fichiers Excel sur un
serveur interne, base SQL Server locale, etc.) — pas nécessaire pour des
sources déjà cloud (SharePoint Online, Azure SQL).

### Partage direct vs Application

| | Partage direct | Application |
|---|---|---|
| Granularité | Rapport par rapport | Ensemble de rapports groupés |
| Usage typique | Collaboration ponctuelle | Diffusion large et régulière |
| Contrôle de version | Immédiat | Publication contrôlée (mise à jour explicite) |

### Certification et promotion de dataset

Un dataset largement réutilisé par plusieurs rapports peut être marqué
"Promu" ou "Certifié" par un administrateur, signalant aux autres créateurs
de rapports qu'il s'agit d'une source fiable et gouvernée à privilégier —
central dans une stratégie de gouvernance BI à l'échelle d'une organisation.

---

## 19. Power Query avancé : fusionner, ajouter, paramétrer

```
// Fusionner deux requêtes (équivalent d'une jointure SQL)
= Table.NestedJoin(Ventes, "ClientID", Clients, "ID", "ClientsInfo", JoinKind.LeftOuter)

// Ajouter (empiler) deux requêtes de même structure (équivalent UNION ALL)
= Table.Combine({Ventes2023, Ventes2024})

// Créer une fonction personnalisée réutilisable
(cheminFichier as text) =>
let
    Source = Csv.Document(File.Contents(cheminFichier))
in
    Source
```

**Paramètres Power Query :** permettent de rendre une requête configurable
sans modifier le code — un chemin de dossier, une date de référence, un
environnement (dev/prod). Se créent via **Accueil → Gérer les paramètres**,
puis se référencent dans les étapes de requête à la place d'une valeur en
dur.

**Requêtes fonction :** une requête marquée comme fonction peut être
appliquée à chaque ligne d'une autre table (ex : importer automatiquement
tous les fichiers d'un dossier avec la même structure) — le mécanisme
derrière "Combiner les fichiers" quand on importe un dossier entier.

---

## 20. Optimiser les performances d'un modèle

- **Réduire la cardinalité** des colonnes : une colonne avec des millions de valeurs uniques (ex : un identifiant de transaction en texte) coûte cher en mémoire. Convertir en entier quand possible, ou exclure du modèle si elle n'est pas nécessaire aux visuels.
- **Désactiver la détection automatique de date/heure** (Options → Chargement de données) pour éviter la création silencieuse de tables de dates cachées et redondantes derrière chaque colonne date.
- **Limiter les colonnes calculées**, leur préférer les mesures (section 4).
- **Préférer `VAR`** dans les mesures complexes pour éviter les recalculs redondants.
- **Utiliser l'Analyseur de performances** (Affichage → Analyseur de performances) pour identifier quel visuel ou quelle requête DAX ralentit un rapport.
- **DAX Studio** (outil externe gratuit) permet d'analyser en détail le temps d'exécution d'une mesure DAX et son plan de requête — indispensable pour du diagnostic avancé.
- **Agrégations** : sur de très gros volumes, définir une table d'agrégats pré-calculée (ex : ventes par jour plutôt que par transaction) que Power BI utilise automatiquement quand la granularité du visuel le permet.
- **Mode de stockage** : Import (rapide, données en mémoire) vs DirectQuery (données requêtées en temps réel à la source, plus lent mais toujours à jour) vs Composite (mélange des deux) — choisir selon le compromis fraîcheur/performance recherché.

---

## 21. Licences et cycle de déploiement

| Licence | Ce qu'elle permet |
|---|---|
| **Gratuite (Free)** | Créer des rapports dans Power BI Desktop, usage individuel non partagé |
| **Pro** | Partager des rapports, publier dans des espaces de travail, actualisation jusqu'à 8 fois/jour |
| **Premium Per User (PPU)** | Fonctionnalités Premium (plus gros volumes, actualisations plus fréquentes) pour un utilisateur donné |
| **Premium (par capacité)** | Capacité dédiée pour toute une organisation, partage possible avec des utilisateurs sans licence Pro |

### Pipelines de déploiement

Permettent de faire progresser un rapport à travers trois environnements
distincts (**Développement → Test → Production**) de façon contrôlée,
plutôt que de modifier directement le rapport utilisé en production —
pratique DevOps appliquée à la BI, essentielle dès qu'un rapport devient
critique pour l'organisation.

---

## 22. Bonnes pratiques de design de rapport

- **Hiérarchie visuelle claire** : le KPI le plus important en haut à gauche (zone lue en premier), le détail en dessous ou en drill-through.
- **Cohérence des couleurs** : une couleur = une signification constante dans tout le rapport (ex : toujours la même couleur pour "Objectif non atteint"), jamais réutilisée arbitrairement pour autre chose.
- **Limiter le nombre de visuels par page** : 4 à 6 visuels denses valent mieux que 12 visuels illisibles.
- **Nommer clairement les mesures et les visuels** : un titre de visuel doit se comprendre sans avoir besoin d'ouvrir le rapport pour deviner ce qu'il montre.
- **Prévoir la mise en page mobile** (vue Mobile dans Power BI Desktop) dès que le rapport sera consulté sur téléphone.
- **Accessibilité** : contraste suffisant, ordre de tabulation logique, textes alternatifs sur les visuels — vérifiable via le Vérificateur d'accessibilité intégré.
- **Éviter la surcharge de couleurs vives** : un fond neutre avec 2-3 couleurs d'accent bien choisies communique mieux qu'une palette arc-en-ciel.

---

## 23. Aide-mémoire rapide

| Je veux… | Approche |
|---|---|
| Structurer mes tables correctement | Schéma en étoile : faits + dimensions |
| Analyser par date, année, mois | Table de dates dédiée, marquée comme telle |
| Créer un KPI dynamique | Une mesure (pas une colonne calculée) |
| Changer le filtre appliqué à un calcul | `CALCULATE` |
| Calculer avant d'agréger (ligne par ligne) | `SUMX` / `AVERAGEX` / fonctions en `X` |
| Ignorer un filtre existant | `ALL` / `ALLEXCEPT` |
| Comparer à l'année précédente | `SAMEPERIODLASTYEAR` + `CALCULATE` |
| Cumul depuis le début de l'année | `TOTALYTD` |
| Sécuriser une division | `DIVIDE(num, denom, valeur_par_défaut)` |
| Rendre une mesure lisible | `VAR ... RETURN` |
| Classer des éléments | `RANKX` |
| Restreindre les données par utilisateur | Sécurité au niveau des lignes (RLS) |
| Diffuser un rapport sans partager l'espace de travail | Créer une Application (Power BI Service) |
| Actualiser automatiquement depuis une source locale | Passerelle de données + actualisation planifiée |
| Diagnostiquer un rapport lent | Analyseur de performances / DAX Studio |
| Faire progresser un rapport en production sans risque | Pipeline de déploiement |

---

*Document constitué comme référence personnelle de travail — à compléter au
fil des modèles et rapports rencontrés en environnement professionnel
(Power BI Desktop, Power BI Service, Azure).*
