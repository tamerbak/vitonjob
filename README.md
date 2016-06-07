# VitOnJob

Le projet vitonjob sur Github ne contient que les parties de développement qui seront modifiées par les différents
collaborateurs du projet.

## La structure du projet :

```
 vitonjob/
 |
 ├── app/                               * Working directory
 │   ├── pages/                         * Contains all of our pages
 │   │   ├── home/                      * Home tab page
 │   │   │    ├── home.html             * HomePage template
 │   │   │    └── home.js               * HomePage code
 │   │   │    └── home.scss             * HomePage stylesheet
 │   │   │
 │   │   │── logins/                    * Logins Tab page
 │   │   │    ├── logins.html           * LoginPage Tab template
 │   │   │    └── logins.js             * LoginPage Tab code
 │   │   │    └── logins.scss           * LoginPage Tab stylesheet
 │   │   │
 │   │   │── mail/                      * Mail connexion page
 │   │   │    ├── mail.html             * Mail connexion template
 │   │   │    └── mail.js               * Mail connexion code
 │   │   │    └── mail.scss             * Mail connexion stylesheet
 │   │   │
 │   │   │── phone/                     * Mail connexion page
 │   │   │    ├── phone.html            * Mail connexion template
 │   │   │    └── phone.js              * Mail connexion code
 │   │   │    └── phone.scss            * Mail connexion stylesheet
 │   │   │
 │   │   │── Offer/                     * Offer page
 │   │        ├── offer.html            * offer template
 │   │        └── offer.js              * offer code
 │   │        └── offer.scss            * offer stylesheet
 │   │
 │   │
 │   ├── providers/                     * Contains all Injectables
 │   │   ├── search-service.js          * Search service code
 │   │
 │   ├── theme/                         * App theme files
 │   │   ├── app.core.scss              * App Shared Sass Imports
 │   │   ├── app.ios.scss               * iOS Sass Imports & Variables
 │   │   ├── app.md.scss                * Material Design Sass Imports & Variables
 │   │   ├── app.variables.scss         * App Shared Sass Variables
 │   │   └── app.wp.scss                * Windows Sass Imports & Variables
 │   │
 │   ├── menu.html                      * Application menu template
 │   ├── menu.html                      * Application stylesheet
 │   └── app.js                         * Main Application configuration
 │
 ├── node_modules/                      * Node dependencies (To be added from a blank ionic template)
 |
 ├── platforms/                         * Cordova generated native platform code (To be added from a blank ionic template)
 |
 ├── plugins/                           * Cordova native plugins go (To be added from a blank ionic template)
 |
 ├── resources/                         * Images for splash screens and icons
 |
 ├── www/                               * Folder that is copied over to platforms www directory
 │   │
 │   ├── build/                         * Contains AUTO-GENERATED compiled content
 │   │     ├── css/                     * Compiled CSS
 │   │     ├── fonts/                   * Copied Fonts
 │   │     ├── js/                      * ES5 compiled JavaScript
 │   │     ├── pages/                   * Copied html pages
 │   │     └── app.html                 * Copied app entry point
 │   │
 │   ├── scripts/                       * Contains scripts used for the app
 │   │     └── ...                      * scripts
 │   │
 │   ├── img/                           * App images
 │   │
 │   └── index.html                     * Main entry point
 |
 ├── .editorconfig                      * Defines coding styles between editors
 ├── .gitignore                         * Example git ignore file
 ├── config.xml                         * Cordova configuration file
 ├── ionic.config.json                  * Ionic configuration file
 ├── package.json                       * Our javascript dependencies
 └── README.md                          * Documentation on contributing to this repo (This file)
 ```
Les parties manquantes du projet, vous pouvez les récupérer d'un projet template vide d'Ionic :
`$ ionic start test blank --v2 --ts`

Il faut alors copier les dossiers suivants : nodes_modules - plateforms - plugins
Le dossier www/build sera généré automatiquement lors de votre première execution de `ionic serve`.

## Les composantes natives à installer:

```
$ ionic plugin add cordova-plugin-datepicker
$ ionic plugin add cordova-plugin-network-information
$ ionic plugin add cordova-plugin-geolocation
$ cordova plugin add cordova-plugin-tts
$ cordova plugin add https://github.com/macdonst/SpeechRecognitionPlugin
$ ionic plugin add cordova-plugin-camera
$ cordova plugin add cordova-plugin-camera
$ cordova plugin add cordova-sms-plugin
```

## Environnement

Le projet est compatible avec Ionic la version Beta 8 (non officielle), qui contient 37 sujet d'amélioration. Il ne
reste que 3 pour passer à la version officielle.

Pour faire cette migration Il faut adapter la version courante (Beta 7) en suivant les règles suivantes :

1. Remplacer toutes les instances de `@Page` par `@Component` :

```
import {Page} from 'ionic-angular';

@Page({

})
```
devient :
```
import {Component} from '@angular/core';

@Component({

})
```
2. Dans le fichier app.ts, remplacer `@App` par `@Component`, ajouter la fonction `ionicBootstrap()` et déplacer
les paramètres `config` et `providers` dans cette nouvelle fonction :

```
import {App, Platform} from 'ionic-angular';

@App({
  templateUrl: 'build/app.html',
  providers: [GlobalConfigs, UserService],
  config: {
    backButtonText: 'Retour'
}
export class Hunter {

}
```
devient :
```
import {Component} from '@angular/core';
import {ionicBootstrap, Platform} from 'ionic-angular';

@Component({
  templateUrl: 'build/app.html',
})
export class Hunter {

}

ionicBootstrap(Hunter, [GlobalConfigs, UserService], {
  backButtonText: 'Retour'
});
```