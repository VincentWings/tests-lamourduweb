# Personnalisation d'un thème Shopify (Dawn) - Gestion des Promotions et Réductions

## 📌 Introduction

Ce projet vise à tester mes compétences en **développement Shopify** à travers **quatre exercices pratiques**. L'objectif est d'améliorer et d'automatiser certaines fonctionnalités clés d'une boutique Shopify en utilisant des **bonnes pratiques de développement**, de **gestion de version** et d'optimisation de l'affichage des promotions et réductions.

## 🛠️ Technologies et outils utilisés

- **Shopify Liquid** : Personnalisation des templates du thème.
- **JavaScript (AJAX, Fetch API)** : Gestion dynamique du panier et mises à jour en temps réel.
- **Shopify Flow** : Automatisation de la gestion de stock.
- **Shopify CLI** : Développement et prévisualisation du thème en local.
- **Git & GitHub** : Gestion de version et collaboration.
- **Métafields Shopify** : Gestion dynamique des promotions.

## Exercice 1 : Personnalisation du cart drawer

### 🎯 Objectif

Ajouter **des messages promotionnels dynamiques** et **un produit cadeau automatique** lorsque le panier atteint un certain montant.

## Demo
[![Voir la vidéo](https://img.youtube.com/vi/IOKT8MbMwj8/maxresdefault.jpg)](https://youtu.be/IOKT8MbMwj8)
https://youtu.be/IOKT8MbMwj8

### 📝 Implémentation

1. **Messages dynamiques** :
   - Ajout d'une section affichant les **messages incitatifs** en fonction du montant du panier.
   - Mise à jour **en temps réel** avec JavaScript.

2. **Ajout automatique d'un produit cadeau** :
   - Surveillance du total du panier avec **l'API AJAX Shopify**.
   - Ajout automatique du produit **lorsque le seuil est atteint**.
   - Affichage d'un **message de confirmation** sans rechargement de la page.

3. **Snippet spécifique `cart-promotions.liquid`** :
   - Utilisé pour gérer **l'affichage des promotions** dans le cart drawer.
   - Vérifie si la livraison gratuite ou le cadeau offert doit être affiché.

### Fichiers modifiés

- `sections/cart-drawer.liquid`
- `snippets/cart-promotions.liquid`
- `assets/cart.js`

### Instructions de test

1. **Ajouter des produits au panier** et observer les messages qui s'affichent dynamiquement.
2. Une fois **le seuil de 100 € atteint**, vérifier que **le produit cadeau est ajouté automatiquement**.
3. Vérifier que **les messages changent** une fois la condition remplie.

## Exercice 2 : Automatisation de la gestion des stocks avec Shopify Flow

### 🎯 Objectif

Automatiser **la gestion du stock** du produit cadeau en utilisant Shopify Flow.

## Demo
[![Voir la vidéo](https://img.youtube.com/vi/lZQna_F9h8s/maxresdefault.jpg)](https://youtu.be/lZQna_F9h8s)
https://youtu.be/lZQna_F9h8s

### 📝 Implémentation

1. **Déclencheur** : Quand une commande est passée.
2. **Condition** : Vérifier si la commande contient **le produit cadeau**.
3. **Action** : Déduire automatiquement le stock du produit cadeau.

### Instructions de test

1. **Passer une commande** contenant le produit cadeau.
2. Vérifier dans **Shopify Admin** que **le stock a été mis à jour automatiquement**.

## Exercice 3 : Gestion de version avec Shopify CLI et GitHub

### 🎯 Objectif

Mettre en place **une gestion de version propre** et un **workflow efficace**.

### 📝 Implémentation

1. **Utilisation de Shopify CLI** :
   - Clonage du thème **Dawn** et configuration de l'environnement local.
   - Utilisation de :
     ```sh
     shopify theme dev
     ```
     pour tester en local.
   
2. **Gestion de version avec Git** :
   - Création de **branches dédiées** (`feature/`, `fix/`, `docs/`...).
   - **Messages de commit clairs et détaillés**.
   - Documentation centralisée dans `README.md`.

### Instructions de test

1. **Cloner le dépôt** :
   ```sh
   git clone https://github.com/VincentWings/tests-lamourduweb.git
   cd tests-lamourduweb
   ```
2. **Lancer l'environnement Shopify** :
   ```sh
   shopify theme dev
   ```

## Exercice 4 : Application d'une réduction automatique de 10%

### 🎯 Objectif

Appliquer **automatiquement une réduction de 10 %** aux produits d'une collection spécifique et afficher **les prix barrés**.

### 📝 Implémentation

1. **Détection des produits concernés** :
   - Vérification si un produit appartient à la collection **`Promotions`**.
   - Application automatique d'une réduction de **10 %**.

2. **Affichage des prix barrés** :
   - Affichage du **prix original barré** et du **prix remisé**.
   - Mises à jour **dynamiques** lors de l'ajout au panier.

3. **Utilisation des Métachamps Shopify** :
   - Ajout d'un champ personnalisé `custom.titre_promotion` dans les collections.
   - Permet d'afficher **un nom de promotion personnalisé**.

### Fichiers modifiés

- `snippets/price.liquid`
- `snippets/cart-product.liquid`

### Instructions de test

1. Vérifier que **les produits de la collection `Promotions`** ont bien leur **prix barré** et le bon libellé de promotion.
2. Ajouter un produit au panier et s'assurer que **la réduction est bien appliquée**.

## 📜 Conclusion

Ce projet m'a permis de travailler sur plusieurs aspects essentiels du **développement Shopify** :

- **Personnalisation du front-end** : Ajout de promotions dynamiques et gestion des prix barrés.  
- **Automatisation des processus métier** : Gestion du stock du produit cadeau avec **Shopify Flow**.  
- **Gestion de version et CI/CD** : Utilisation de **Git**, **GitHub** et **Shopify CLI** pour un workflow structuré.  
- **Optimisation du code Liquid** : Réduction du nombre de lignes inutiles et meilleures performances.  

## 🔗 Dépôt GitHub

**Lien du dépôt GitHub** : [https://github.com/VincentWings/tests-lamourduweb](https://github.com/VincentWings/tests-lamourduweb.git)
