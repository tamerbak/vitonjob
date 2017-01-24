# VitOnJob
Le projet vit-on-job sur Github ne contient que les parties de développement qui seront modifiées par les différents
collaborateurs du projet.

## CE PROJET EST ARCHIVE

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
$ ionic plugin add cordova-sms-plugin
$ ionic plugin add cordova-plugin-inappbrowser
$ ionic plugin add cordova-plugin-app-version
$ ionic plugin add cordova-plugin-googlemaps --variable API_KEY_FOR_ANDROID="AIzaSyA8uYwoQcLR4D72jRErKXIalRZ_F1koHRg" --variable API_KEY_FOR_IOS="AIzaSyA8uYwoQcLR4D72jRErKXIalRZ_F1koHRg"
$ cordova plugin add com.lampa.startapp
$ cordova plugin add https://github.com/lampaa/com.lampa.startapp.git
$ ionic plugin add cordova-plugin-contacts
	- si l'app plante lors de la recherche d'un contact, il faut alors supprimer le plugin et réinstaller la version 0.2.16:
		$ cordova plugin remove cordova-plugin-contacts
		$ cordova plugin add org.apache.cordova.contacts@0.2.16
	
$ ionic plugin add de.appplant.cordova.plugin.local-notification
$ npm install croppie
$ npm install diacritics
```

##Notification Push
````
1- installer les composantes : 
	$ ionic add ionic-platform-web-client
	$ ionic plugin add phonegap-plugin-push --variable SENDER_ID="GCM_PROJECT_NUMBER"
	avec GCM_PROJECT_NUMBER = "693415120998". Ce numéro est généré lors de l'activation du projet sur Google Developers Console.

2- exécuter la commande ci dessous pour identifier l'application chez ionic: 
	$ ionic io init	

3- désactiver la fonctionnalité limité push : 
	$ ionic config set dev_push false
````

## Environnement

Le projet est compatible avec Ionic 2 la version Beta 10 et Angular2 version rc3. (Voir package.json)


