# Mesures DAX — Tableau de bord Ventes & Performance Budgétaire

Toutes les mesures ci-dessous sont prêtes à copier-coller directement dans
Power BI Desktop, après avoir importé les données et créé les relations
(voir README.md pour la mise en place complète).

Organisées en 5 niveaux, du plus simple au plus avancé — construisez-les
dans l'ordre, chaque niveau s'appuie sur le précédent.

---

## Niveau 1 — Mesures de base

```dax
Chiffre d'Affaires = SUM(Fact_Sales[SalesAmount])
```

```dax
Coût Total = SUM(Fact_Sales[CostAmount])
```

```dax
Marge = [Chiffre d'Affaires] - [Coût Total]
```

```dax
Marge % = DIVIDE([Marge], [Chiffre d'Affaires])
```

```dax
Quantité Vendue = SUM(Fact_Sales[Quantity])
```

```dax
Nombre de Ventes = COUNTROWS(Fact_Sales)
```

```dax
Panier Moyen = DIVIDE([Chiffre d'Affaires], [Nombre de Ventes])
```

```dax
Nombre de Clients Actifs = DISTINCTCOUNT(Fact_Sales[CustomerID])
```

---

## Niveau 2 — Time Intelligence

*Nécessite que `Dim_Date` soit marquée comme "Table de dates" dans le modèle
(clic droit sur la table → Marquer comme table de dates).*

```dax
CA Année Précédente =
CALCULATE([Chiffre d'Affaires], SAMEPERIODLASTYEAR(Dim_Date[Date]))
```

```dax
Croissance CA % =
DIVIDE([Chiffre d'Affaires] - [CA Année Précédente], [CA Année Précédente])
```

```dax
CA Cumul Annuel (YTD) =
TOTALYTD([Chiffre d'Affaires], Dim_Date[Date])
```

```dax
CA Cumul Mensuel (MTD) =
TOTALMTD([Chiffre d'Affaires], Dim_Date[Date])
```

```dax
CA 12 Mois Glissants =
CALCULATE(
    [Chiffre d'Affaires],
    DATESINPERIOD(Dim_Date[Date], MAX(Dim_Date[Date]), -12, MONTH)
)
```

```dax
CA Mois Précédent =
CALCULATE([Chiffre d'Affaires], DATEADD(Dim_Date[Date], -1, MONTH))
```

```dax
Variation vs Mois Précédent % =
DIVIDE([Chiffre d'Affaires] - [CA Mois Précédent], [CA Mois Précédent])
```

---

## Niveau 3 — Budget vs Réel

*C'est le cœur d'un vrai tableau de bord de pilotage stratégique — celui
qu'on présente en Comité de Direction.*

```dax
Budget =
CALCULATE(
    SUM(Dim_Budget[BudgetAmount]),
    TREATAS(VALUES(Dim_Product[Category]), Dim_Budget[Category]),
    TREATAS(VALUES(Dim_Date[Annee]), Dim_Budget[Annee]),
    TREATAS(VALUES(Dim_Date[Mois]), Dim_Budget[Mois])
)
```

```dax
Écart Budget = [Chiffre d'Affaires] - [Budget]
```

```dax
Écart Budget % = DIVIDE([Écart Budget], [Budget])
```

```dax
Taux d'Atteinte Budget = DIVIDE([Chiffre d'Affaires], [Budget])
```

```dax
Statut Budget =
VAR Taux = [Taux d'Atteinte Budget]
RETURN
    SWITCH(
        TRUE(),
        ISBLANK(Taux), "Pas de donnée",
        Taux >= 1, "🟢 Objectif atteint",
        Taux >= 0.9, "🟠 Proche de l'objectif",
        "🔴 En dessous de l'objectif"
    )
```

> **Note technique** : `Budget` utilise `TREATAS` pour relier virtuellement
> `Dim_Budget[Category/Annee/Mois]` aux colonnes équivalentes filtrées par
> `Dim_Product` et `Dim_Date` — sans créer de relation physique dans le
> modèle. C'est indispensable ici car `Dim_Budget` a un grain différent
> (mensuel par catégorie) de `Fact_Sales` (transaction), donc aucune
> relation directe n'est possible entre les deux tables.

---

## Niveau 4 — Classements et analyses comparatives

```dax
Rang Produit (par CA) =
RANKX(ALL(Dim_Product[ProductName]), [Chiffre d'Affaires])
```

```dax
Top 5 Produits CA =
CALCULATE(
    [Chiffre d'Affaires],
    TOPN(5, ALL(Dim_Product[ProductName]), [Chiffre d'Affaires])
)
```

```dax
% du Total Général =
DIVIDE([Chiffre d'Affaires], CALCULATE([Chiffre d'Affaires], ALL(Fact_Sales)))
```

```dax
CA par Client Moyen =
AVERAGEX(VALUES(Fact_Sales[CustomerID]), [Chiffre d'Affaires])
```

```dax
Nouveaux Clients =
VAR ClientsPeriode = VALUES(Fact_Sales[CustomerID])
VAR PremiersAchats =
    FILTER(
        ClientsPeriode,
        VAR DatePremierAchat = CALCULATE(MIN(Fact_Sales[Date]), ALL(Dim_Date))
        RETURN
            DatePremierAchat >= MIN(Dim_Date[Date]) && DatePremierAchat <= MAX(Dim_Date[Date])
    )
RETURN
    COUNTROWS(PremiersAchats)
```

---

## Niveau 5 — Analyses avancées

**Classification ABC (Pareto 80/20)** — identifie les produits qui génèrent
80% du chiffre d'affaires, technique classique de priorisation stratégique.

```dax
% Cumulé CA Produit =
VAR CAProduitCourant = [Chiffre d'Affaires]
VAR RangCourant = [Rang Produit (par CA)]
VAR CACumule =
    SUMX(
        FILTER(
            ALL(Dim_Product[ProductName]),
            [Rang Produit (par CA)] <= RangCourant
        ),
        [Chiffre d'Affaires]
    )
VAR CATotal = CALCULATE([Chiffre d'Affaires], ALL(Dim_Product))
RETURN
    DIVIDE(CACumule, CATotal)
```

```dax
Classe ABC =
VAR Cumul = [% Cumulé CA Produit]
RETURN
    SWITCH(
        TRUE(),
        Cumul <= 0.8, "A — Prioritaire",
        Cumul <= 0.95, "B — Standard",
        "C — Secondaire"
    )
```

**Taux de rétention client simplifié** — clients actifs sur les 12 derniers
mois qui l'étaient déjà sur les 12 mois précédents.

```dax
Clients Actifs 12M =
CALCULATE(
    DISTINCTCOUNT(Fact_Sales[CustomerID]),
    DATESINPERIOD(Dim_Date[Date], MAX(Dim_Date[Date]), -12, MONTH)
)
```

```dax
Clients Actifs 12M Précédents =
CALCULATE(
    DISTINCTCOUNT(Fact_Sales[CustomerID]),
    DATESINPERIOD(Dim_Date[Date], DATEADD(MAX(Dim_Date[Date]), -12, MONTH), -12, MONTH)
)
```

```dax
Clients Retenus =
VAR ClientsActuels = CALCULATETABLE(VALUES(Fact_Sales[CustomerID]), DATESINPERIOD(Dim_Date[Date], MAX(Dim_Date[Date]), -12, MONTH))
VAR ClientsPrecedents = CALCULATETABLE(VALUES(Fact_Sales[CustomerID]), DATESINPERIOD(Dim_Date[Date], DATEADD(MAX(Dim_Date[Date]), -12, MONTH), -12, MONTH))
RETURN
    COUNTROWS(INTERSECT(ClientsActuels, ClientsPrecedents))
```

```dax
Taux de Rétention % = DIVIDE([Clients Retenus], [Clients Actifs 12M Précédents])
```

---

## Récapitulatif — 25 mesures au total

| Niveau | Nombre de mesures | Compétence démontrée |
|---|---|---|
| 1 — Base | 8 | Agrégations fondamentales |
| 2 — Time Intelligence | 7 | `CALCULATE`, fonctions temporelles |
| 3 — Budget vs Réel | 5 | `TREATAS`, `SWITCH`, logique métier |
| 4 — Classements | 4 | `RANKX`, `TOPN`, `AVERAGEX` |
| 5 — Avancé | 5 (ABC + rétention) | `SUMX` imbriqué, `INTERSECT`, analyse Pareto |
