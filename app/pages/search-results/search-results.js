var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", 'ionic-angular'], function (require, exports, ionic_angular_1) {
    "use strict";
    /*
      Generated class for the SearchResultsPage page.
    
      See http://ionicframework.com/docs/v2/components/#navigation for more info on
      Ionic pages and navigation.
    */
    let SearchResultsPage = class SearchResultsPage {
        constructor(nav) {
            this.nav = nav;
        }
    };
    SearchResultsPage = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/search-results/search-results.html',
        })
    ], SearchResultsPage);
    exports.SearchResultsPage = SearchResultsPage;
});
//# sourceMappingURL=search-results.js.map