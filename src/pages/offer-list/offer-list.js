var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
define(["require", "exports", 'ionic-angular', "../../providers/search-service/search-service", "../../configurations/configs"], function (require, exports, ionic_angular_1, search_service_1, configs_1) {
    "use strict";
    /*
     Generated class for the OfferListPage page.

     See http://ionicframework.com/docs/v2/components/#navigation for more info on
     Ionic pages and navigation.
     */
    let OfferPage = class OfferPage {
        constructor(nav, gc, search) {
            this.nav = nav;
            this.gc = gc;
            this.search = search;
            // Set global configs
            // Get target to determine configs
            this.projectTarget = gc.getProjectTarget();
            // get config of selected target
            let config = configs_1.Configs.setConfigs(this.projectTarget);
            // Set local variables and messages
            this.isEmployer = (this.projectTarget == 'employer');
            this.phoneTitle = "Téléphone";
            this.loadPeople();
            // jQuery code for dragging components
            // console.log($( "#draggable" ).draggable());
        }

        // Testing a web service call
        loadPeople() {
            this.search.load()
                .then(data => {
                    this.people = data.results;
                });
        }
    };
    OfferPage = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/offer-list/offer-list.html',
            providers: [search_service_1.SearchService]
        })
    ], OfferPage);
    exports.OfferPage = OfferPage;
});
//# sourceMappingURL=offer-list.js.map