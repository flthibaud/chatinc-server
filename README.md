# ChatInc Server

ChatInc Server est une application basée sur AdonisJS, un framework Node.js, conçue pour gérer les fonctionnalités de chat en temps réel.

## Table des matières

- [Installation](#installation)
- [Fonctionnalités](#fonctionnalités)
- [Utilisation](#utilisation)
- [Contribution](#contribution)
- [Licence](#licence)

## Installation

1. Clonez ce dépôt :
   ```
   git clone https://github.com/flthibaud/chatinc-server.git
   ```

2. Installez les dépendances :
   ```
   yarn install
   ```

3. Copiez le fichier `.env.example` vers `.env` et configurez les variables d'environnement selon vos besoins.

4. Lancez le serveur :
   ```
   yarn start
   ```

## Fonctionnalités

- **Authentification** : Gestion de l'authentification des utilisateurs.
- **Connexion via Google** : Permet aux utilisateurs de se connecter via leur compte Google.
- **Gestion des groupes** : Création, modification et suppression de groupes de chat.
- **Gestion des messages** : Envoi, réception et gestion des messages en temps réel.
- **Utilisateurs en ligne** : Affiche la liste des utilisateurs actuellement en ligne.

## Utilisation

Après avoir lancé le serveur, vous pouvez accéder à l'application via `http://localhost:3333` (ou l'URL que vous avez configurée).

## Contribution

Les contributions sont les bienvenues ! Veuillez consulter les [issues](https://github.com/flthibaud/chatinc-server/issues) pour voir les fonctionnalités demandées ou signaler un bug.

## Licence

Ce projet est sous licence GPL-3.0. Voir le fichier `LICENCE` pour plus de détails.
