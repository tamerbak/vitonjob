var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", 'ionic-angular', 'angular2/core', 'angular2/http', '../../configurations/configs', 'rxjs/add/operator/map'], function (require, exports, ionic_angular_1, core_1, http_1, configs_1) {
    "use strict";
    /**
     * @author jakjoud abdeslam
     * @description web service access point for semantic and regular search
     * @module Search
     */
    let SearchService = class SearchService {
        constructor(http) {
            this.http = http;
            this.data = null;
        }
        /**
         * @description Performs a natural language search on the database and returns offers
         * @param textQuery
         * @param referenceOffer
         * @return JSON results in form of offers
           */
        semanticSearch(textQuery, referenceOffer, projectTarget) {
            //  Init project parameters
            this.configuration = configs_1.Configs.setConfigs(projectTarget);
            this.db = new ionic_angular_1.Storage(ionic_angular_1.SqlStorage);
            //  Start by identifying the wanted table and prepare the pay load
            var table = projectTarget == 'jobyer' ? 'user_jobyer' : 'user_entreprise';
            var query = table + ';' + textQuery;
            var payload = {
                'class': 'fr.protogen.masterdata.model.CCallout',
                id: 102,
                args: [
                    {
                        class: 'fr.protogen.masterdata.model.CCalloutArguments',
                        label: 'Requete de recherche',
                        value: btoa(query)
                    },
                    {
                        class: 'fr.protogen.masterdata.model.CCalloutArguments',
                        label: 'ID Offre',
                        value: btoa(referenceOffer + '')
                    },
                    {
                        class: 'fr.protogen.masterdata.model.CCalloutArguments',
                        label: 'Ordre de tri',
                        value: 'TkQ='
                    }
                ]
            };
            /*
            * Performing search directly on server
            */
            console.log(JSON.stringify(payload));
            if (this.data) {
                // already loaded data
                return Promise.resolve(this.data);
                console.log(this.data);
            }
            // don't have the data yet
            return new Promise(resolve => {
                // We're using Angular Http provider to request the data,
                // then on the response it'll map the JSON data to a parsed JS object.
                // Next we process the data and resolve the promise with the new data.
                let headers = new http_1.Headers();
                headers.append("Content-Type", 'application/json');
                this.http.post(this.configuration.calloutURL, JSON.stringify(payload), { headers: headers })
                    .map(res => res.json())
                    .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
            });
        }
        /**
         * @description Persists the last results into phone data base for quick access and history management
         * @param data results of the last search
           */
        persistLastSearch(data) {
            this.db.set('LAST_RESULTS', JSON.stringify(data));
        }
    };
    SearchService = __decorate([
        core_1.Injectable()
    ], SearchService);
    exports.SearchService = SearchService;
});
//# sourceMappingURL=search-service.js.map