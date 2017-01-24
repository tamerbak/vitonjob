var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
define(["require", "exports", 'ionic-angular', '../../configurations/configs', '../../configurations/globalConfigs', "../../providers/search-service/search-service", "../logins/logins", "../search-results/search-results"], function (require, exports, ionic_angular_1, configs_1, globalConfigs_1, search_service_1, logins_1, search_results_1) {
    "use strict";
    let HomePage = class HomePage {
        constructor(gc, app, nav, navParams, ss) {
            this.gc = gc;
            this.app = app;
            this.nav = nav;
            this.navParams = navParams;
            this.ss = ss;
            // Get target to determine configs
            this.projectTarget = gc.getProjectTarget();
            // get config of selected target
            let config = configs_1.Configs.setConfigs(this.projectTarget);
            //Initialize controller variables :
            this.projectName = config.projectName;
            this.themeColor = config.themeColor;
            this.imageURL = config.imageURL;
            this.highlightSentence = config.highlightSentence;
            this.isEmployer = this.projectTarget == 'employer';
            this.searchPlaceHolder = "Veuillez saisir votre recherche...";
            this.nav = nav;
            // If we navigated to this page, we will have an item available as a nav param
            this.selectedItem = navParams.get('item');
            this.search = ss;
        }

        static get parameters() {
            return [[globalConfigs_1.GlobalConfigs], [ionic_angular_1.IonicApp], [ionic_angular_1.NavController], [ionic_angular_1.NavParams], [search_service_1.SearchService]];
        }

        onFocus() {
            if (this.projectTarget == 'employer')
                this.searchPlaceHolder = "Ex : Je cherche un serveur débutant disponible demain sur Villepinte";
            else
                this.searchPlaceHolder = "Ex : Je cherche une offre d'emploi pour serveur débutant demain sur Villepinte";
        }

        onBlur() {
            this.searchPlaceHolder = "Veuillez saisir votre recherche...";
        }

        openLoginsPage() {
            this.nav.push(logins_1.LoginsPage);
        }

        /**
         * @author abdeslam jakjoud
         * @description perform semantic search and pushes the results view
         */
        doSemanticSearch() {
            console.log('Initiating search for ' + this.scQuery);
            this.ss.semanticSearch(this.scQuery, 0, this.projectTarget).then((data) => {
                this.ss.persistLastSearch(data);
                this.nav.push(search_results_1.SearchResultsPage);
            });
        }

        /**
         * @author abdeslam jakjoud
         * @description checking whether the user used the enter button to startup the semantic search
         * @param e Key Up javascript event allowing us to access the keyboard used key
         */
        checkForEnterKey(e) {
            if (e.code != "Enter")
                return;
            this.doSemanticSearch();
        }
    };
    HomePage = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/home/home.html',
            providers: [globalConfigs_1.GlobalConfigs]
        })
    ], HomePage);
    exports.HomePage = HomePage;
});
//# sourceMappingURL=home.js.map