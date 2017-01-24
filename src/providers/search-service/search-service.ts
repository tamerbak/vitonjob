import {} from "ionic-angular";
import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";
import "rxjs/add/operator/map";
import {Configs} from "../../configurations/configs";
import {Storage} from "@ionic/storage";

/**
 * @author jakjoud abdeslam
 * @description web service access point for semantic and regular search
 * @module Search
 */
@Injectable()
export class SearchService {
    data: any = null;
    configuration: any;


    constructor(public http: Http, public db:Storage) {

    }


    /**
     * @description Performs a natural language search on the database and returns offers
     * @param textQuery
     * @param referenceOffer
     * @return JSON results in form of offers
     */
    semanticSearch(textQuery: string, referenceOffer: number, projectTarget: string) {

        //  Start by identifying the wanted table and prepare the pay load
        let searchType = projectTarget == 'jobyer' ? 'employeur' : 'jobyer';
        let bean =  {
            class :"com.vitonjob.callouts.recherche.model.RequeteRecherche",
            sentence :textQuery,
            type :searchType
        };

        let payload = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            id: 10046,
            args: [
                {
                    class: 'fr.protogen.masterdata.model.CCalloutArguments',
                    label: 'Requete de recherche',
                    value: btoa(JSON.stringify(bean))
                }
            ]
        };

        // don't have the data yet
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpJsonHeaders();
            this.http.post(Configs.calloutURL, JSON.stringify(payload), {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.data = data;
                    resolve(this.data);
                });
        });
    }

    /**
     * @description Correct bias parameter of job probability
     * @param index search request identifier
     * @param idJob actual job to consider
     * @returns {Promise<T>|Promise}    Just a status to indicate if the indexation was successful
     */
    correctIndexation(index, idJob){
        let bean =  {
            class :"com.vitonjob.callouts.recherche.model.RequeteIndexation",
            idIndex :index,
            idJob :idJob
        };

        let payload = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            id: 10048,
            args: [
                {
                    class: 'fr.protogen.masterdata.model.CCalloutArguments',
                    label: 'Correction des indexes',
                    value: btoa(JSON.stringify(bean))
                }
            ]
        };

        // don't have the data yet
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpJsonHeaders();
            this.http.post(Configs.calloutURL, JSON.stringify(payload), {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
        });
    }

    /**
     * @description Make search by criteria and return a promise of results
     * @param searchQuery The filters of the search
     * @param projectTarget project configuration (jobyer/employer)
     * @return a promise of data results in the same format of the semantic search
     */
    criteriaSearch(searchQuery: any, projectTarget: string) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);

        //  Prepare payload
        var query = JSON.stringify(searchQuery);

        var payload = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            id: 11,
            args: [
                {
                    class: 'fr.protogen.masterdata.model.CCalloutArguments',
                    label: 'Requete de recherche',
                    value: btoa(query)
                }
            ]
        };

        // don't have the data yet
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpJsonHeaders();
            this.http.post(Configs.calloutURL, JSON.stringify(payload), {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
        });
    }

    /**
     * @description Advanced search allowing to fetch result count as a stand alone service
     * as well as multi criteria and offer based search
     * @param searchQuery JSON Object of the query
     * @returns {Promise<T>|Promise}
     */
    advancedSearch(searchQuery: any) {
        //  Prepare payload
        var query = JSON.stringify(searchQuery);

        var payload = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            id: 10047,//10045,
            args: [
                {
                    class: 'fr.protogen.masterdata.model.CCalloutArguments',
                    label: 'Requete de recherche',
                    value: btoa(query)
                }
            ]
        };

        // don't have the data yet
        return new Promise(resolve => {
            let headers = Configs.getHttpJsonHeaders();
            this.http.post(Configs.calloutURL, JSON.stringify(payload), {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    this.data = data;
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

    /**
     * @description Get the last results from search
     * @return List of results or a void array
     */
    retrieveLastSearch() {
        return this.db.get('LAST_RESULTS');

    }

    /**
     * @description Persists the last indexation of semantic search
     * @param indexData details about indexation
     */
    setLastIndexation(indexData){
        this.db.set('LAST_INDEX', JSON.stringify(indexData));
    }

    /**
     * @description Loads the last indexed query if it exists
     * @returns {Promise<any>}
     */
    retrieveLastIndexation(){
        return this.db.get('LAST_INDEX');
    }
}

