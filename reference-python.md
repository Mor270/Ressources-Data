# Référence Python — Codes & Explications

*Document de référence pour Mor Talla DIENG — Data Analyst*

Ce document couvre Python pour l'analyse de données : bases du langage,
structures de données, puis **Pandas** et **NumPy**, les deux librairies
centrales du métier de Data Analyst en Python.

---

## Table des matières

1. [Bases du langage](#1-bases-du-langage)
2. [Structures de données natives](#2-structures-de-données-natives)
3. [Fonctions et compréhensions de liste](#3-fonctions-et-compréhensions-de-liste)
4. [Lire et écrire des fichiers](#4-lire-et-écrire-des-fichiers)
5. [NumPy — calcul vectorisé](#5-numpy--calcul-vectorisé)
6. [Pandas — Series et DataFrame](#6-pandas--series-et-dataframe)
7. [Pandas — sélectionner et filtrer](#7-pandas--sélectionner-et-filtrer)
8. [Pandas — nettoyer les données](#8-pandas--nettoyer-les-données)
9. [Pandas — agréger avec groupby](#9-pandas--agréger-avec-groupby)
10. [Pandas — fusionner des données](#10-pandas--fusionner-des-données)
11. [Pandas — dates et séries temporelles](#11-pandas--dates-et-séries-temporelles)
12. [Visualisation avec Matplotlib](#12-visualisation-avec-matplotlib)
13. [Scikit-learn — bases du Machine Learning](#13-scikit-learn--bases-du-machine-learning)
14. [Recettes utiles pour Data Analyst](#14-recettes-utiles-pour-data-analyst)
15. [Erreurs fréquentes à éviter](#15-erreurs-fréquentes-à-éviter)
16. [Aide-mémoire rapide](#16-aide-mémoire-rapide)

---

## 1. Bases du langage

```python
# Variables — pas besoin de déclarer le type
nom = "Mor Talla"
age = 30
salaire = 45000.50
actif = True

# Types de base
type(nom)       # str
type(age)       # int
type(salaire)   # float
type(actif)     # bool

# f-strings : la façon moderne d'insérer des variables dans du texte
print(f"{nom} a {age} ans et gagne {salaire} €")

# Conditions
if salaire > 40000:
    niveau = "Confirmé"
elif salaire > 25000:
    niveau = "Junior"
else:
    niveau = "Stagiaire"

# Boucles
for i in range(5):          # 0, 1, 2, 3, 4
    print(i)

annees = [2022, 2023, 2024]
for annee in annees:
    print(annee)

# Boucle while
compteur = 0
while compteur < 3:
    compteur += 1
```

**Explication :** Python utilise l'**indentation** (espaces en début de
ligne) pour délimiter les blocs de code, contrairement à d'autres langages
qui utilisent des accolades `{}`. C'est une source d'erreurs fréquente pour
les débutants venus d'autres langages ou d'Excel/VBA.

---

## 2. Structures de données natives

```python
# Liste : ordonnée, modifiable, autorise les doublons
ventes = [120, 340, 210, 340]
ventes.append(500)          # ajouter un élément
ventes[0]                   # premier élément → 120
ventes[-1]                  # dernier élément → 500
ventes[1:3]                 # tranche (slice) → [340, 210]

# Dictionnaire : paires clé-valeur, très utilisé pour représenter un enregistrement
employe = {
    "nom": "Dieng",
    "departement": "Data",
    "salaire": 45000
}
employe["nom"]               # → "Dieng"
employe["anciennete"] = 3    # ajouter une clé

# Tuple : comme une liste, mais non modifiable une fois créé
coordonnees = (48.8566, 2.3522)

# Set : collection non ordonnée de valeurs uniques (utile pour dédupliquer)
departements = {"Data", "IT", "Data", "RH"}   # → {"Data", "IT", "RH"}
```

**Explication :** le choix de structure dépend du besoin : **liste** pour
une séquence ordonnée modifiable, **dictionnaire** pour associer des clés à
des valeurs (l'équivalent Python d'un objet JSON), **tuple** pour une
donnée fixe (ex : des coordonnées GPS), **set** pour garantir l'unicité.

---

## 3. Fonctions et compréhensions de liste

```python
# Définir une fonction
def calculer_prime(salaire, taux=0.1):
    return salaire * taux

calculer_prime(45000)          # utilise le taux par défaut → 4500
calculer_prime(45000, 0.15)    # taux personnalisé → 6750

# Fonction lambda (anonyme, sur une ligne)
double = lambda x: x * 2

# Compréhension de liste : créer une liste en une ligne
carres = [x**2 for x in range(10)]

# Avec une condition
pairs = [x for x in range(20) if x % 2 == 0]

# Compréhension de dictionnaire
salaires = {"Alice": 42000, "Bruno": 38000, "Chloe": 51000}
primes = {nom: sal * 0.1 for nom, sal in salaires.items()}
```

**Explication :** les compréhensions de liste remplacent une boucle `for`
classique pour créer une nouvelle liste — plus concises et généralement plus
rapides. À ne pas abuser cependant : au-delà de deux conditions imbriquées,
une boucle classique reste plus lisible.

---

## 4. Lire et écrire des fichiers

```python
# Lire un fichier texte
with open("donnees.txt", "r", encoding="utf-8") as fichier:
    contenu = fichier.read()

# Écrire dans un fichier
with open("resultat.txt", "w", encoding="utf-8") as fichier:
    fichier.write("Bonjour")

# Lire un fichier CSV sans Pandas (rarement nécessaire, Pandas le fait mieux)
import csv
with open("donnees.csv", "r", encoding="utf-8") as fichier:
    lecteur = csv.reader(fichier)
    for ligne in lecteur:
        print(ligne)
```

**Explication :** le mot-clé `with` garantit que le fichier se ferme
correctement même en cas d'erreur pendant sa lecture — toujours préférable à
un `open()`/`close()` manuel. En pratique, pour de la donnée tabulaire, on
utilise directement Pandas (`pd.read_csv`, section 6) plutôt que le module
`csv` natif.

---

## 5. NumPy — calcul vectorisé

```python
import numpy as np

# Créer un tableau NumPy
tableau = np.array([10, 20, 30, 40])

# Opérations vectorisées : s'appliquent à tous les éléments d'un coup,
# sans boucle — beaucoup plus rapide qu'une boucle Python classique
tableau * 2                  # → [20, 40, 60, 80]
tableau + 5                  # → [15, 25, 35, 45]
tableau[tableau > 20]        # filtrer → [30, 40]

# Statistiques
np.mean(tableau)             # moyenne
np.median(tableau)           # médiane
np.std(tableau)              # écart-type
np.sum(tableau)              # somme

# Tableau à deux dimensions (matrice)
matrice = np.array([[1, 2, 3], [4, 5, 6]])
matrice.shape                # → (2, 3) : 2 lignes, 3 colonnes

# Générer des séquences
np.arange(0, 10, 2)          # → [0, 2, 4, 6, 8]
np.linspace(0, 1, 5)         # 5 valeurs régulièrement espacées entre 0 et 1
```

**Explication :** NumPy est la base sur laquelle Pandas est construit. Sa
force est la **vectorisation** : appliquer une opération à un tableau entier
sans écrire de boucle explicite, ce qui est à la fois plus rapide (calcul en
code compilé C en arrière-plan) et plus lisible.

---

## 6. Pandas — Series et DataFrame

```python
import pandas as pd

# Series : une colonne unique, indexée
ventes = pd.Series([120, 340, 210], index=["Jan", "Fev", "Mar"])

# DataFrame : un tableau à deux dimensions (l'équivalent d'une feuille Excel)
df = pd.DataFrame({
    "nom": ["Alice", "Bruno", "Chloe"],
    "departement": ["Data", "IT", "Data"],
    "salaire": [42000, 38000, 51000]
})

# Lire des données depuis un fichier
df = pd.read_csv("employes.csv")
df = pd.read_excel("employes.xlsx", sheet_name="Feuille1")
df = pd.read_sql("SELECT * FROM employes", connexion)

# Écrire des données
df.to_csv("export.csv", index=False)
df.to_excel("export.xlsx", index=False)

# Explorer un DataFrame
df.head()          # 5 premières lignes
df.tail(3)          # 3 dernières lignes
df.shape            # (nombre de lignes, nombre de colonnes)
df.columns           # liste des noms de colonnes
df.dtypes            # type de chaque colonne
df.info()            # résumé complet : types, valeurs manquantes, mémoire
df.describe()         # statistiques descriptives des colonnes numériques
```

**Explication :** un `DataFrame` est la structure centrale de Pandas —
équivalent d'un tableau Excel ou d'une table SQL, mais manipulable par du
code. `index=False` dans `to_csv`/`to_excel` évite d'exporter l'index Pandas
comme colonne supplémentaire inutile.

---

## 7. Pandas — sélectionner et filtrer

```python
# Sélectionner une colonne
df["salaire"]
df.salaire              # équivalent, mais à éviter si le nom contient des espaces

# Sélectionner plusieurs colonnes
df[["nom", "salaire"]]

# Filtrer des lignes selon une condition
df[df["salaire"] > 40000]
df[(df["salaire"] > 40000) & (df["departement"] == "Data")]   # ET → &
df[(df["departement"] == "Data") | (df["departement"] == "IT")]  # OU → |

# loc : sélection par label (nom de colonne / index)
df.loc[0, "nom"]                    # valeur ligne 0, colonne "nom"
df.loc[df["salaire"] > 40000, "nom"]  # filtrer puis sélectionner une colonne

# iloc : sélection par position numérique (comme un tableau)
df.iloc[0]           # première ligne
df.iloc[0:3]          # 3 premières lignes
df.iloc[:, 0]         # première colonne, toutes les lignes
```

**Explication :** `&` et `|` remplacent `and`/`or` pour combiner des
conditions sur un DataFrame — **toujours entourer chaque condition de
parenthèses**, sinon Python interprète mal la priorité des opérateurs.
`.loc` filtre par nom, `.iloc` filtre par position — confondre les deux est
une source d'erreur fréquente.

---

## 8. Pandas — nettoyer les données

```python
# Détecter les valeurs manquantes
df.isna().sum()                 # nombre de NaN par colonne
df[df["salaire"].isna()]        # lignes où salaire est manquant

# Remplacer les valeurs manquantes
df["salaire"] = df["salaire"].fillna(0)
df["salaire"] = df["salaire"].fillna(df["salaire"].mean())   # par la moyenne

# Supprimer les lignes avec des valeurs manquantes
df = df.dropna()                        # supprime toute ligne avec au moins un NaN
df = df.dropna(subset=["salaire"])      # uniquement si "salaire" est manquant

# Détecter et supprimer les doublons
df.duplicated().sum()
df = df.drop_duplicates()
df = df.drop_duplicates(subset=["email"])   # doublons sur une colonne précise

# Convertir un type de colonne
df["salaire"] = df["salaire"].astype(float)
df["date_embauche"] = pd.to_datetime(df["date_embauche"])

# Renommer des colonnes
df = df.rename(columns={"nom": "nom_complet"})

# Nettoyer du texte
df["nom"] = df["nom"].str.strip()          # espaces en trop
df["nom"] = df["nom"].str.upper()          # majuscules
df["email"] = df["email"].str.lower()      # minuscules
```

**Explication :** le nettoyage de données occupe généralement la majorité
du temps réel d'un projet Data Analyst. `NaN` (Not a Number) est la façon
dont Pandas représente une valeur manquante, y compris pour du texte —
toujours vérifier `df.isna().sum()` en tout début d'analyse.

---

## 9. Pandas — agréger avec groupby

```python
# Agrégation simple par groupe
df.groupby("departement")["salaire"].mean()
df.groupby("departement")["salaire"].sum()
df.groupby("departement").size()            # nombre de lignes par groupe

# Plusieurs agrégations en même temps
df.groupby("departement")["salaire"].agg(["mean", "sum", "count", "min", "max"])

# Agrégations différentes par colonne
df.groupby("departement").agg({
    "salaire": "mean",
    "nom": "count"
})

# Regrouper sur plusieurs colonnes
df.groupby(["departement", "annee"])["salaire"].sum()

# Tableau croisé dynamique (équivalent d'un TCD Excel)
pd.pivot_table(
    df,
    values="salaire",
    index="departement",
    columns="annee",
    aggfunc="sum"
)
```

**Explication :** `groupby` reproduit exactement la logique d'un `GROUP BY`
en SQL (voir le document de référence SQL). `pivot_table` reproduit un
tableau croisé dynamique Excel ou une matrice Power BI directement en
Python — très utile pour restructurer des données avant export ou
visualisation.

---

## 10. Pandas — fusionner des données

```python
# merge : équivalent d'un JOIN SQL
resultat = pd.merge(
    ventes, produits,
    left_on="produit_id", right_on="id",
    how="left"            # "inner", "left", "right", "outer"
)

# concat : empiler ou juxtaposer des DataFrames
ventes_totales = pd.concat([ventes_2023, ventes_2024])          # empiler (comme UNION ALL)
combine = pd.concat([df1, df2], axis=1)                          # juxtaposer par colonnes

# join : fusion basée sur l'index plutôt que sur une colonne
resultat = df1.join(df2, how="left")
```

**Explication :** `how="left"` (comme un `LEFT JOIN` SQL) est le choix le
plus sûr par défaut — il conserve toutes les lignes de la table de gauche
même sans correspondance. Toujours vérifier `resultat.shape` avant/après une
fusion pour détecter une explosion inattendue du nombre de lignes (signe
d'une relation multiple mal anticipée).

---

## 11. Pandas — dates et séries temporelles

```python
df["date"] = pd.to_datetime(df["date"])

df["annee"] = df["date"].dt.year
df["mois"] = df["date"].dt.month
df["nom_jour"] = df["date"].dt.day_name()
df["trimestre"] = df["date"].dt.quarter

# Filtrer sur une plage de dates
df[(df["date"] >= "2024-01-01") & (df["date"] <= "2024-12-31")]

# Regrouper par mois (utile pour une évolution temporelle)
df.groupby(df["date"].dt.to_period("M"))["montant"].sum()

# Définir la date comme index pour du rééchantillonnage temporel
df = df.set_index("date")
df.resample("M")["montant"].sum()      # agrégation mensuelle
df.resample("W")["montant"].sum()      # agrégation hebdomadaire
```

**Explication :** l'accesseur `.dt` donne accès à toutes les propriétés
d'une colonne de type date (année, mois, jour de semaine...). `resample`
est l'outil le plus puissant pour ré-agréger une série temporelle à une
fréquence différente (jour → mois, par exemple), équivalent d'un
`DATE_TRUNC` + `GROUP BY` en SQL.

---

## 12. Visualisation avec Matplotlib

```python
import matplotlib.pyplot as plt

# Graphique en courbes
df.groupby("mois")["ventes"].sum().plot(kind="line")
plt.title("Évolution des ventes par mois")
plt.xlabel("Mois")
plt.ylabel("Ventes (€)")
plt.show()

# Graphique en barres
df.groupby("departement")["salaire"].mean().plot(kind="bar")
plt.show()

# Histogramme (distribution d'une variable)
df["salaire"].plot(kind="hist", bins=20)
plt.show()

# Nuage de points (relation entre deux variables)
plt.scatter(df["anciennete"], df["salaire"])
plt.xlabel("Ancienneté")
plt.ylabel("Salaire")
plt.show()
```

**Explication :** Pandas intègre un raccourci direct vers Matplotlib via
`.plot()`, pratique pour une exploration rapide. Pour des graphiques plus
soignés (rapport, présentation), la librairie **Seaborn** (basée sur
Matplotlib) offre des styles plus lisibles par défaut.

---

## 13. Scikit-learn — bases du Machine Learning

Scikit-learn est la librairie de référence pour le Machine Learning "classique"
en Python (hors deep learning). Toutes ses méthodes suivent la même logique :
**préparer les données → entraîner un modèle → évaluer → prédire.**

### Séparer les données : entraînement vs test

```python
from sklearn.model_selection import train_test_split

X = df[["anciennete", "age", "niveau_diplome"]]   # variables explicatives
y = df["salaire"]                                  # variable à prédire

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
```

**Explication :** on n'évalue jamais un modèle sur les données qui ont servi
à l'entraîner — cela donnerait une performance artificiellement optimiste.
`random_state` fixe le tirage aléatoire pour que le résultat soit
reproductible d'une exécution à l'autre.

### Prétraiter les données

```python
from sklearn.preprocessing import StandardScaler, OneHotEncoder

# Standardiser des variables numériques (moyenne 0, écart-type 1)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)   # transform seul, pas fit, sur le test

# Encoder une variable catégorielle en colonnes binaires (0/1)
encoder = OneHotEncoder(sparse_output=False)
departement_encode = encoder.fit_transform(df[["departement"]])
```

**Explication clé :** `fit_transform` sur l'entraînement, mais **`transform`
seul** sur le test — le modèle ne doit jamais "apprendre" quoi que ce soit à
partir des données de test, y compris leurs statistiques de normalisation.

### Régression : prédire une valeur numérique

```python
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor

modele = LinearRegression()
modele.fit(X_train, y_train)
predictions = modele.predict(X_test)

# Une alternative plus robuste, moins sensible aux valeurs aberrantes
modele_foret = RandomForestRegressor(n_estimators=100, random_state=42)
modele_foret.fit(X_train, y_train)
```

### Classification : prédire une catégorie

```python
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

modele = LogisticRegression()
modele.fit(X_train, y_train)
predictions = modele.predict(X_test)
probabilites = modele.predict_proba(X_test)   # probabilité de chaque classe
```

### Évaluer un modèle

```python
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    accuracy_score, precision_score, recall_score, confusion_matrix
)

# Pour une régression
mean_absolute_error(y_test, predictions)
r2_score(y_test, predictions)          # proportion de variance expliquée (0 à 1)

# Pour une classification
accuracy_score(y_test, predictions)     # % de prédictions correctes
confusion_matrix(y_test, predictions)   # détail des erreurs par catégorie
```

**Explication :** en régression, le **R²** indique la part de variance
expliquée par le modèle (proche de 1 = bon modèle). En classification,
l'**accuracy** seule peut être trompeuse sur des données déséquilibrées
(ex : 95% de "non-fraude") — toujours regarder aussi la matrice de
confusion, la précision et le rappel.

### Pipeline : enchaîner prétraitement et modèle proprement

```python
from sklearn.pipeline import Pipeline

pipeline = Pipeline([
    ("normalisation", StandardScaler()),
    ("modele", RandomForestRegressor(random_state=42))
])

pipeline.fit(X_train, y_train)
predictions = pipeline.predict(X_test)
```

**Explication :** un `Pipeline` regroupe toutes les étapes de traitement et
le modèle final en un seul objet — évite d'oublier une étape, et garantit
que le même traitement est appliqué de façon identique à l'entraînement et
à la prédiction.

### Validation croisée

```python
from sklearn.model_selection import cross_val_score

scores = cross_val_score(modele, X, y, cv=5, scoring="r2")
scores.mean()   # performance moyenne sur 5 découpages différents
```

**Explication :** plutôt qu'un seul découpage train/test, la validation
croisée entraîne et évalue le modèle sur plusieurs découpages successifs
(5 dans cet exemple) et moyenne les résultats — donne une estimation plus
fiable de la performance réelle du modèle.

---

## 14. Recettes utiles pour Data Analyst

**Taux de remplissage d'une colonne**
```python
taux_remplissage = df["email"].notna().mean() * 100
```

**Top N par groupe**
```python
df.sort_values("montant", ascending=False).groupby("region").head(3)
```

**Variation en % d'une période à l'autre**
```python
df = df.sort_values("date")
df["variation_pct"] = df["ventes"].pct_change() * 100
```

**Créer une catégorie à partir d'une valeur numérique**
```python
df["tranche_age"] = pd.cut(
    df["age"],
    bins=[0, 25, 35, 50, 100],
    labels=["-25", "25-35", "35-50", "50+"]
)
```

**Détecter les valeurs aberrantes (outliers) avec l'IQR**
```python
q1 = df["salaire"].quantile(0.25)
q3 = df["salaire"].quantile(0.75)
iqr = q3 - q1
outliers = df[(df["salaire"] < q1 - 1.5 * iqr) | (df["salaire"] > q3 + 1.5 * iqr)]
```

**Exporter un résumé formaté vers Excel avec plusieurs feuilles**
```python
with pd.ExcelWriter("rapport.xlsx") as writer:
    df.to_excel(writer, sheet_name="Détail", index=False)
    df.groupby("departement")["salaire"].mean().to_excel(writer, sheet_name="Résumé")
```

**Appliquer une fonction personnalisée à chaque ligne**
```python
def categoriser(row):
    if row["salaire"] > 50000 and row["anciennete"] > 5:
        return "Senior confirmé"
    return "Standard"

df["categorie"] = df.apply(categoriser, axis=1)
```

---

## 15. Erreurs fréquentes à éviter

| Erreur | Pourquoi c'est un problème | Solution |
|---|---|---|
| Modifier un DataFrame filtré sans `.copy()` | `SettingWithCopyWarning`, comportement imprévisible | `sous_df = df[condition].copy()` avant modification |
| Utiliser `and`/`or` au lieu de `&`/`|` sur un DataFrame | Erreur `ValueError` | Toujours `&`/`|` avec parenthèses sur chaque condition |
| Confondre `.loc` et `.iloc` | Sélectionne la mauvaise ligne/colonne | `.loc` = par nom, `.iloc` = par position |
| Oublier `index=False` à l'export | Colonne d'index parasite dans le fichier exporté | `df.to_csv(..., index=False)` |
| Ne pas vérifier les types après import | Une colonne "montant" lue comme texte casse les calculs | `df.dtypes` puis `astype()` si nécessaire |
| Boucler ligne par ligne avec `for` sur un DataFrame | Très lent sur de gros volumes | Préférer les opérations vectorisées ou `.apply()` |
| Ignorer les NaN avant un calcul | Résultats faux silencieusement | `df.isna().sum()` systématique en début d'analyse |

---

## 16. Aide-mémoire rapide

| Je veux… | Approche |
|---|---|
| Charger des données | `pd.read_csv()` / `pd.read_excel()` / `pd.read_sql()` |
| Explorer rapidement | `.head()`, `.info()`, `.describe()` |
| Filtrer des lignes | `df[condition]` ou `.loc[condition]` |
| Calculer sans boucle | Opérations vectorisées NumPy/Pandas |
| Regrouper et agréger | `.groupby()` |
| Reproduire un TCD Excel | `pd.pivot_table()` |
| Combiner deux tables | `pd.merge()` (JOIN) ou `pd.concat()` (UNION) |
| Nettoyer les valeurs manquantes | `.isna()`, `.fillna()`, `.dropna()` |
| Travailler sur des dates | `pd.to_datetime()` + accesseur `.dt` |
| Visualiser rapidement | `.plot(kind=...)` |
| Exporter un résultat | `.to_csv()` / `.to_excel()` |
| Séparer entraînement / test | `train_test_split()` |
| Prédire une valeur numérique | `LinearRegression` / `RandomForestRegressor` |
| Prédire une catégorie | `LogisticRegression` / `RandomForestClassifier` |
| Évaluer un modèle | `r2_score`, `accuracy_score`, `confusion_matrix` |
| Fiabiliser l'évaluation | `cross_val_score` |

---

*Document constitué comme référence personnelle de travail — à compléter au
fil des scripts et analyses rencontrés en environnement professionnel
(Pandas, NumPy, automatisation de reporting).*
