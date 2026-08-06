# Référence SQL complète — Codes & Explications

*Document de référence pour Mor Talla DIENG — Data Analyst*

Ce document couvre l'ensemble des commandes SQL essentielles, de la requête
la plus simple aux fonctions analytiques avancées utilisées en Business
Intelligence. Chaque commande est accompagnée d'un exemple concret et d'une
explication.

---

## Table des matières

1. [Les bases : SELECT, FROM, WHERE](#1-les-bases--select-from-where)
2. [Filtrer les données](#2-filtrer-les-données)
3. [Trier et limiter](#3-trier-et-limiter)
4. [Agrégations et GROUP BY](#4-agrégations-et-group-by)
5. [Les jointures (JOIN)](#5-les-jointures-join)
6. [Sous-requêtes](#6-sous-requêtes)
7. [CTE — WITH](#7-cte--with)
8. [Fonctions de fenêtrage (Window Functions)](#8-fonctions-de-fenêtrage-window-functions)
9. [CASE WHEN — logique conditionnelle](#9-case-when--logique-conditionnelle)
10. [Fonctions sur le texte](#10-fonctions-sur-le-texte)
11. [Fonctions sur les dates](#11-fonctions-sur-les-dates)
12. [Modifier les données (DML)](#12-modifier-les-données-dml)
13. [Créer et modifier des tables (DDL)](#13-créer-et-modifier-des-tables-ddl)
14. [Vues](#14-vues)
15. [Transactions](#15-transactions)
16. [Index et performance](#16-index-et-performance)
17. [Combiner des résultats : UNION, INTERSECT, EXCEPT](#17-combiner-des-résultats--union-intersect-except)
18. [Gérer les valeurs manquantes : COALESCE, NULLIF](#18-gérer-les-valeurs-manquantes--coalesce-nullif)
19. [EXISTS / NOT EXISTS](#19-exists--not-exists)
20. [Sous-totaux : ROLLUP et CUBE](#20-sous-totaux--rollup-et-cube)
21. [Agréger du texte : STRING_AGG](#21-agréger-du-texte--string_agg)
22. [Convertir des types : CAST](#22-convertir-des-types--cast)
23. [Erreurs fréquentes à éviter](#23-erreurs-fréquentes-à-éviter)
24. [Recettes utiles pour Data Analyst](#24-recettes-utiles-pour-data-analyst)

---

## 1. Les bases : SELECT, FROM, WHERE

```sql
SELECT nom, salaire
FROM employes
WHERE departement = 'Data';
```

**Explication :**
- `SELECT` liste les colonnes que vous voulez récupérer. `SELECT *` récupère toutes les colonnes (à éviter en production, coûteux en performance).
- `FROM` indique la table source.
- `WHERE` filtre les lignes selon une condition. Il s'exécute **avant** toute agrégation.

---

## 2. Filtrer les données

```sql
-- Comparaisons simples
WHERE salaire > 35000
WHERE date_embauche >= '2022-01-01'

-- Plusieurs conditions
WHERE departement = 'Data' AND salaire > 35000
WHERE departement = 'Data' OR departement = 'BI'

-- Dans une liste de valeurs
WHERE departement IN ('Data', 'BI', 'IT')

-- Entre deux valeurs (inclusif)
WHERE salaire BETWEEN 30000 AND 50000

-- Recherche de motif texte
WHERE nom LIKE 'Da%'        -- commence par "Da"
WHERE email LIKE '%@gmail.com'  -- se termine par ceci
WHERE nom LIKE '_ean'       -- "_" = un seul caractère quelconque

-- Valeurs manquantes
WHERE date_depart IS NULL       -- toujours actif
WHERE date_depart IS NOT NULL   -- a quitté l'entreprise

-- Négation
WHERE NOT departement = 'IT'
WHERE departement NOT IN ('IT', 'RH')
```

**Explication :** `IS NULL` / `IS NOT NULL` sont obligatoires pour tester les
valeurs manquantes — `= NULL` ne fonctionne jamais en SQL, car NULL signifie
"valeur inconnue", pas une valeur comparable.

---

## 3. Trier et limiter

```sql
SELECT nom, salaire
FROM employes
ORDER BY salaire DESC        -- décroissant (ASC = croissant, par défaut)
LIMIT 10;                    -- les 10 premières lignes (TOP 10 sous SQL Server)

-- Tri sur plusieurs colonnes
ORDER BY departement ASC, salaire DESC
```

**Explication :** `ORDER BY` s'exécute en tout dernier, après le filtrage et
les agrégations. `LIMIT` (MySQL/PostgreSQL) devient `TOP` (SQL Server) ou
`FETCH FIRST` (Oracle) selon le moteur utilisé.

---

## 4. Agrégations et GROUP BY

```sql
SELECT
    departement,
    COUNT(*) AS nb_employes,
    AVG(salaire) AS salaire_moyen,
    SUM(salaire) AS masse_salariale,
    MIN(salaire) AS salaire_min,
    MAX(salaire) AS salaire_max
FROM employes
GROUP BY departement
HAVING COUNT(*) > 5
ORDER BY salaire_moyen DESC;
```

**Explication :**
- `GROUP BY` regroupe les lignes ayant la même valeur dans la colonne indiquée, pour appliquer une agrégation par groupe.
- `HAVING` filtre **après** l'agrégation (contrairement à `WHERE`, qui filtre avant). On l'utilise pour filtrer sur le résultat d'un `COUNT`, `SUM`, etc.
- `COUNT(*)` compte toutes les lignes ; `COUNT(colonne)` ignore les valeurs NULL de cette colonne.

**Ordre d'exécution réel d'une requête SQL** (utile à connaître) :
```
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
```

---

## 5. Les jointures (JOIN)

```sql
-- INNER JOIN : uniquement les lignes qui correspondent dans les deux tables
SELECT e.nom, d.nom_departement
FROM employes e
INNER JOIN departements d ON e.departement_id = d.id;

-- LEFT JOIN : toutes les lignes de la table de gauche, correspondance ou non
SELECT e.nom, p.nom_projet
FROM employes e
LEFT JOIN projets p ON e.id = p.employe_id;
-- Les employés sans projet auront p.nom_projet = NULL

-- RIGHT JOIN : l'inverse du LEFT JOIN (peu utilisé, on préfère inverser les tables)

-- FULL OUTER JOIN : toutes les lignes des deux tables, correspondance ou non
SELECT e.nom, p.nom_projet
FROM employes e
FULL OUTER JOIN projets p ON e.id = p.employe_id;

-- SELF JOIN : joindre une table à elle-même (ex : trouver le manager de chacun)
SELECT emp.nom AS employe, mgr.nom AS manager
FROM employes emp
LEFT JOIN employes mgr ON emp.manager_id = mgr.id;
```

**Explication visuelle simplifiée :**

| Type de JOIN | Résultat |
|---|---|
| `INNER JOIN` | Intersection uniquement |
| `LEFT JOIN` | Tout à gauche + correspondances à droite |
| `RIGHT JOIN` | Tout à droite + correspondances à gauche |
| `FULL OUTER JOIN` | Tout des deux côtés |

**Piège fréquent :** un `INNER JOIN` peut faire disparaître silencieusement
des lignes si une correspondance n'existe pas — toujours vérifier le nombre
de lignes avant/après une jointure.

---

## 6. Sous-requêtes

```sql
-- Sous-requête dans le WHERE
SELECT nom, salaire
FROM employes
WHERE salaire > (SELECT AVG(salaire) FROM employes);

-- Sous-requête avec IN
SELECT nom
FROM employes
WHERE departement_id IN (
    SELECT id FROM departements WHERE budget > 100000
);

-- Sous-requête corrélée (dépend de la ligne externe)
SELECT nom, salaire
FROM employes e1
WHERE salaire > (
    SELECT AVG(salaire)
    FROM employes e2
    WHERE e2.departement_id = e1.departement_id
);
```

**Explication :** une sous-requête corrélée se réexécute pour chaque ligne
de la requête externe — puissante, mais potentiellement lente sur de gros
volumes. Une CTE ou une window function est souvent plus performante (voir
sections 7 et 8).

---

## 7. CTE — WITH

```sql
WITH ventes_par_mois AS (
    SELECT
        DATE_TRUNC('month', date_vente) AS mois,
        SUM(montant) AS total_ventes
    FROM ventes
    GROUP BY DATE_TRUNC('month', date_vente)
)
SELECT mois, total_ventes
FROM ventes_par_mois
WHERE total_ventes > 50000
ORDER BY mois;
```

**Explication :** une CTE (Common Table Expression, `WITH ... AS`) crée une
table temporaire nommée, valable uniquement pour la requête qui suit. Elle
rend le code plus lisible qu'une sous-requête imbriquée, et peut être
réutilisée plusieurs fois dans la même requête.

```sql
-- Plusieurs CTE enchaînées
WITH
etape1 AS (SELECT ... FROM ...),
etape2 AS (SELECT ... FROM etape1 ...)
SELECT * FROM etape2;
```

---

## 8. Fonctions de fenêtrage (Window Functions)

```sql
-- Numéroter les lignes
SELECT
    nom, departement, salaire,
    ROW_NUMBER() OVER (PARTITION BY departement ORDER BY salaire DESC) AS rang
FROM employes;

-- RANK vs DENSE_RANK (gèrent les égalités différemment)
SELECT
    nom, salaire,
    RANK() OVER (ORDER BY salaire DESC) AS rang_avec_trous,
    DENSE_RANK() OVER (ORDER BY salaire DESC) AS rang_sans_trous
FROM employes;

-- Valeur de la ligne précédente / suivante
SELECT
    mois, ventes,
    LAG(ventes) OVER (ORDER BY mois) AS ventes_mois_precedent,
    LEAD(ventes) OVER (ORDER BY mois) AS ventes_mois_suivant
FROM ventes_mensuelles;

-- Cumul / moyenne glissante
SELECT
    mois, ventes,
    SUM(ventes) OVER (ORDER BY mois) AS cumul_ventes,
    AVG(ventes) OVER (ORDER BY mois ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moyenne_glissante_3mois
FROM ventes_mensuelles;
```

**Explication :** contrairement à `GROUP BY`, une window function **ne
réduit pas** le nombre de lignes retournées — elle ajoute une colonne
calculée à chaque ligne, en se basant sur une "fenêtre" de lignes définie
par `PARTITION BY` (regroupement) et `ORDER BY` (ordre dans la fenêtre).
C'est l'outil le plus puissant pour du reporting analytique (classements,
cumuls, comparaisons N vs N-1).

---

## 9. CASE WHEN — logique conditionnelle

```sql
SELECT
    nom, salaire,
    CASE
        WHEN salaire < 30000 THEN 'Junior'
        WHEN salaire BETWEEN 30000 AND 50000 THEN 'Confirmé'
        ELSE 'Senior'
    END AS niveau
FROM employes;

-- Utile aussi pour "pivoter" des données (créer des colonnes depuis des lignes)
SELECT
    departement,
    SUM(CASE WHEN annee = 2023 THEN montant ELSE 0 END) AS ventes_2023,
    SUM(CASE WHEN annee = 2024 THEN montant ELSE 0 END) AS ventes_2024
FROM ventes
GROUP BY departement;
```

**Explication :** `CASE WHEN` est l'équivalent SQL d'un `SI` en Excel ou
d'un `IF/SWITCH` en DAX. Très utilisé pour créer des catégories ou
"dépivoter" des lignes en colonnes dans un rapport.

---

## 10. Fonctions sur le texte

```sql
SELECT
    UPPER(nom) AS nom_majuscule,
    LOWER(nom) AS nom_minuscule,
    LENGTH(nom) AS longueur,               -- LEN() sous SQL Server
    TRIM(nom) AS nom_sans_espaces,
    CONCAT(prenom, ' ', nom) AS nom_complet,   -- ou prenom || ' ' || nom
    SUBSTRING(nom, 1, 3) AS trois_premieres_lettres,
    REPLACE(email, '@gmail.com', '@entreprise.com') AS email_modifie
FROM employes;
```

**Explication :** ces fonctions sont indispensables pour nettoyer des
données textuelles issues de sources hétérogènes (export Excel, formulaires,
API) avant de les intégrer dans un modèle propre.

---

## 11. Fonctions sur les dates

```sql
SELECT
    date_vente,
    EXTRACT(YEAR FROM date_vente) AS annee,
    EXTRACT(MONTH FROM date_vente) AS mois,
    DATE_TRUNC('month', date_vente) AS debut_du_mois,
    CURRENT_DATE AS aujourdhui,
    date_vente + INTERVAL '30 days' AS date_plus_30j,
    AGE(CURRENT_DATE, date_embauche) AS anciennete
FROM ventes;
```

**Explication :** la syntaxe des fonctions de dates **varie fortement**
selon le moteur SQL (PostgreSQL, SQL Server, MySQL). Toujours vérifier la
documentation du moteur utilisé — c'est la famille de fonctions la moins
standardisée du langage.

| Besoin | PostgreSQL | SQL Server |
|---|---|---|
| Année en cours | `EXTRACT(YEAR FROM date)` | `YEAR(date)` |
| Ajouter des jours | `date + INTERVAL '30 days'` | `DATEADD(day, 30, date)` |
| Différence entre dates | `date2 - date1` | `DATEDIFF(day, date1, date2)` |

---

## 12. Modifier les données (DML)

```sql
-- Insérer une ligne
INSERT INTO employes (nom, departement, salaire)
VALUES ('Mor Talla Dieng', 'Data', 45000);

-- Insérer plusieurs lignes
INSERT INTO employes (nom, departement, salaire)
VALUES
    ('Alice', 'Data', 42000),
    ('Bruno', 'IT', 38000);

-- Modifier des lignes existantes
UPDATE employes
SET salaire = salaire * 1.05
WHERE departement = 'Data';

-- Supprimer des lignes
DELETE FROM employes
WHERE date_depart IS NOT NULL AND date_depart < '2020-01-01';
```

**⚠️ Attention :** un `UPDATE` ou un `DELETE` **sans `WHERE`** s'applique à
**toute la table**. Toujours tester le filtre avec un `SELECT` avant
d'exécuter la modification.

```sql
-- Bonne pratique : vérifier avant d'agir
SELECT * FROM employes WHERE date_depart < '2020-01-01';  -- ✅ je vérifie
DELETE FROM employes WHERE date_depart < '2020-01-01';    -- puis j'exécute
```

---

## 13. Créer et modifier des tables (DDL)

```sql
-- Créer une table
CREATE TABLE employes (
    id INT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    departement VARCHAR(50),
    salaire DECIMAL(10, 2),
    date_embauche DATE DEFAULT CURRENT_DATE
);

-- Ajouter une colonne
ALTER TABLE employes ADD COLUMN email VARCHAR(150);

-- Modifier le type d'une colonne
ALTER TABLE employes ALTER COLUMN salaire TYPE DECIMAL(12, 2);

-- Supprimer une colonne
ALTER TABLE employes DROP COLUMN email;

-- Supprimer une table entière
DROP TABLE employes;

-- Vider une table (plus rapide qu'un DELETE, mais irréversible)
TRUNCATE TABLE employes;
```

**Explication :** `DROP` supprime la table et sa structure ; `TRUNCATE` vide
son contenu mais garde la structure ; `DELETE` supprime des lignes une par
une (plus lent, mais peut être ciblé avec un `WHERE` et annulé dans une
transaction).

---

## 14. Vues

```sql
CREATE VIEW vue_salaires_data AS
SELECT nom, salaire, date_embauche
FROM employes
WHERE departement = 'Data';

-- Utilisation ensuite comme une table normale
SELECT * FROM vue_salaires_data WHERE salaire > 40000;
```

**Explication :** une vue est une requête sauvegardée, réutilisable comme
une table virtuelle. Elle ne stocke pas les données elle-même (contrairement
à une table), mais réexécute sa requête à chaque appel. Très utile pour
simplifier l'accès à une logique métier complexe et réutilisée (ex : un
référentiel unique de KPI pour un dashboard Power BI).

---

## 15. Transactions

```sql
BEGIN;

UPDATE comptes SET solde = solde - 100 WHERE id = 1;
UPDATE comptes SET solde = solde + 100 WHERE id = 2;

COMMIT;   -- valide les deux opérations ensemble
-- ROLLBACK;  -- annulerait tout si une erreur survenait
```

**Explication :** une transaction garantit que plusieurs opérations
s'exécutent **toutes ensemble ou pas du tout** (principe ACID). Essentiel
dès qu'une opération touche plusieurs tables liées (ex : un virement
bancaire, une commande avec mise à jour de stock).

---

## 16. Index et performance

```sql
-- Créer un index pour accélérer les recherches sur une colonne
CREATE INDEX idx_departement ON employes(departement);

-- Voir le plan d'exécution d'une requête (diagnostic de performance)
EXPLAIN SELECT * FROM employes WHERE departement = 'Data';
```

**Explication :** un index fonctionne comme l'index d'un livre — il évite au
moteur SQL de parcourir toute la table pour trouver les lignes qui
correspondent à un filtre. Utile sur les colonnes fréquemment utilisées dans
un `WHERE`, un `JOIN` ou un `ORDER BY`, mais un excès d'index ralentit les
écritures (`INSERT`/`UPDATE`).

---

## 17. Combiner des résultats : UNION, INTERSECT, EXCEPT

```sql
-- UNION : combine deux résultats en supprimant les doublons
SELECT nom, 'Client' AS type FROM clients
UNION
SELECT nom, 'Fournisseur' AS type FROM fournisseurs;

-- UNION ALL : combine sans supprimer les doublons (plus rapide)
SELECT nom FROM clients_2023
UNION ALL
SELECT nom FROM clients_2024;

-- INTERSECT : uniquement les lignes présentes dans les deux résultats
SELECT email FROM newsletter
INTERSECT
SELECT email FROM clients;

-- EXCEPT : lignes du premier résultat absentes du second
SELECT email FROM newsletter
EXCEPT
SELECT email FROM clients;
```

**Explication :** les deux requêtes combinées doivent avoir le **même nombre
de colonnes**, dans le même ordre, avec des types compatibles. `UNION ALL`
est presque toujours préférable à `UNION` si vous savez qu'il n'y a pas de
doublons à supprimer — la déduplication a un coût de performance.

---

## 18. Gérer les valeurs manquantes : COALESCE, NULLIF

```sql
-- COALESCE : retourne la première valeur non NULL de la liste
SELECT nom, COALESCE(telephone_mobile, telephone_fixe, 'Non renseigné') AS contact
FROM clients;

-- Très utile pour remplacer des NULL par une valeur par défaut dans un calcul
SELECT nom, COALESCE(remise, 0) AS remise_appliquee
FROM commandes;

-- NULLIF : retourne NULL si les deux valeurs sont égales (sinon la première)
-- Pratique pour éviter une division par zéro
SELECT
    ventes,
    objectif,
    ventes / NULLIF(objectif, 0) AS taux_atteinte
FROM performance;
```

**Explication :** `COALESCE` est l'équivalent SQL du `SIERREUR`/`IFERROR`
d'Excel pour les valeurs manquantes. `NULLIF(x, 0)` est le réflexe standard
pour sécuriser une division qui pourrait rencontrer un zéro.

---

## 19. EXISTS / NOT EXISTS

```sql
-- Clients ayant au moins une commande
SELECT nom
FROM clients c
WHERE EXISTS (
    SELECT 1 FROM commandes cmd WHERE cmd.client_id = c.id
);

-- Clients n'ayant jamais commandé
SELECT nom
FROM clients c
WHERE NOT EXISTS (
    SELECT 1 FROM commandes cmd WHERE cmd.client_id = c.id
);
```

**Explication :** `EXISTS` s'arrête dès qu'il trouve une ligne correspondante
(il ne compte pas, il vérifie juste la présence), ce qui le rend souvent plus
rapide qu'un `IN` avec une sous-requête sur de gros volumes. `NOT EXISTS`
est aussi plus fiable que `NOT IN`, qui se comporte mal en présence de NULL
dans la sous-requête.

---

## 20. Sous-totaux : ROLLUP et CUBE

```sql
-- ROLLUP : ajoute des sous-totaux hiérarchiques + un total général
SELECT departement, annee, SUM(montant) AS total
FROM ventes
GROUP BY ROLLUP(departement, annee)
ORDER BY departement, annee;
-- Résultat : un sous-total par département, + un total général en plus du détail

-- CUBE : ajoute TOUTES les combinaisons de sous-totaux possibles
SELECT departement, annee, SUM(montant) AS total
FROM ventes
GROUP BY CUBE(departement, annee)
ORDER BY departement, annee;
```

**Explication :** directement utile pour reproduire en SQL ce qu'un tableau
croisé dynamique (Excel) ou une matrice Power BI fait visuellement — obtenir
les totaux et sous-totaux dans la même requête, sans écrire plusieurs
`GROUP BY` séparés à combiner ensuite.

---

## 21. Agréger du texte : STRING_AGG

```sql
-- Regrouper plusieurs valeurs texte en une seule chaîne, séparées par une virgule
SELECT
    client_id,
    STRING_AGG(nom_produit, ', ') AS produits_commandes
FROM commandes
GROUP BY client_id;
```

**Explication :** utile pour transformer une liste de lignes en une seule
cellule lisible dans un rapport (ex : "Produits achetés : Clavier, Souris,
Écran"). Équivalent : `GROUP_CONCAT` sous MySQL, `LISTAGG` sous Oracle.

---

## 22. Convertir des types : CAST

```sql
SELECT CAST(salaire AS INT) AS salaire_arrondi FROM employes;
SELECT CAST('2024-01-15' AS DATE) AS date_convertie;
SELECT CAST(id AS VARCHAR) || ' - ' || nom AS identifiant_complet FROM clients;

-- Syntaxe alternative (identique en résultat)
SELECT salaire::INT FROM employes;   -- raccourci PostgreSQL uniquement
```

**Explication :** indispensable quand une colonne est stockée dans un type
qui empêche un calcul ou une comparaison directe (ex : un montant stocké en
texte suite à un import Excel mal formaté — situation très fréquente en
data cleaning).

---

## 23. Erreurs fréquentes à éviter

| Erreur | Pourquoi c'est un problème | Solution |
|---|---|---|
| `UPDATE`/`DELETE` sans `WHERE` | Modifie/supprime **toute** la table | Toujours tester avec un `SELECT` d'abord |
| `= NULL` au lieu de `IS NULL` | Ne retourne jamais de résultat | Utiliser `IS NULL` / `IS NOT NULL` |
| Oublier `GROUP BY` avec une agrégation | Erreur ou résultat incohérent selon le moteur | Toutes les colonnes non agrégées du `SELECT` doivent être dans le `GROUP BY` |
| `SELECT *` en production | Casse le code si les colonnes changent, lent | Toujours lister les colonnes nécessaires |
| `NOT IN` avec une sous-requête contenant des NULL | Peut retourner un résultat vide de façon inattendue | Préférer `NOT EXISTS` |
| Diviser sans sécuriser le zéro | Erreur d'exécution | `NULLIF(diviseur, 0)` |
| Confondre `WHERE` et `HAVING` | `WHERE` ne peut pas filtrer sur un agrégat | `HAVING` pour filtrer après `GROUP BY` |

---

## 24. Recettes utiles pour Data Analyst

**Trouver les doublons**
```sql
SELECT email, COUNT(*)
FROM clients
GROUP BY email
HAVING COUNT(*) > 1;
```

**Supprimer les doublons en gardant une seule ligne**
```sql
WITH doublons AS (
    SELECT id,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn
    FROM clients
)
DELETE FROM clients WHERE id IN (SELECT id FROM doublons WHERE rn > 1);
```

**Comparer un mois à N-1 (variation)**
```sql
WITH ventes_mois AS (
    SELECT DATE_TRUNC('month', date_vente) AS mois, SUM(montant) AS total
    FROM ventes
    GROUP BY DATE_TRUNC('month', date_vente)
)
SELECT
    mois, total,
    LAG(total) OVER (ORDER BY mois) AS mois_precedent,
    ROUND(100.0 * (total - LAG(total) OVER (ORDER BY mois)) / LAG(total) OVER (ORDER BY mois), 1) AS variation_pct
FROM ventes_mois;
```

**Top N par groupe** (ex : top 3 ventes par région)
```sql
WITH classement AS (
    SELECT region, produit, montant,
    ROW_NUMBER() OVER (PARTITION BY region ORDER BY montant DESC) AS rang
    FROM ventes
)
SELECT * FROM classement WHERE rang <= 3;
```

**Taux de remplissage d'une colonne (qualité de données)**
```sql
SELECT
    COUNT(*) AS total_lignes,
    COUNT(email) AS lignes_avec_email,
    ROUND(100.0 * COUNT(email) / COUNT(*), 1) AS taux_remplissage_pct
FROM clients;
```

---

## Aide-mémoire rapide

| Je veux… | Commande |
|---|---|
| Lire des données | `SELECT ... FROM ... WHERE ...` |
| Regrouper et calculer | `GROUP BY` + `COUNT/SUM/AVG` |
| Combiner deux tables | `JOIN ... ON` |
| Filtrer après agrégation | `HAVING` |
| Classer / comparer ligne à ligne | Window functions (`OVER`) |
| Simplifier une requête complexe | `WITH ...` (CTE) |
| Créer une catégorie | `CASE WHEN` |
| Ajouter des données | `INSERT INTO` |
| Modifier des données | `UPDATE ... SET ... WHERE` |
| Supprimer des données | `DELETE FROM ... WHERE` |
| Créer une structure | `CREATE TABLE` |
| Sécuriser plusieurs opérations liées | `BEGIN ... COMMIT` |

---

*Document constitué comme référence personnelle de travail — à compléter au
fil des requêtes rencontrées en environnement professionnel (Power BI, SQL
Server, PostgreSQL).*
