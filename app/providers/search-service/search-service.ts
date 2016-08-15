import {Storage, SqlStorage} from 'ionic-angular';
import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import {Configs} from '../../configurations/configs';

/**
 * @author jakjoud abdeslam
 * @description web service access point for semantic and regular search
 * @module Search
 */
@Injectable()
export class SearchService {
  data: any = null;
  configuration : any;
  db : any;
  constructor(public http: Http) {
    this.db = new Storage(SqlStorage);
  }


  /**
   * @description Performs a natural language search on the database and returns offers
   * @param textQuery
   * @param referenceOffer
   * @return JSON results in form of offers
     */
  semanticSearch(textQuery : string, referenceOffer : number, projectTarget : string){

    //  Start by identifying the wanted table and prepare the pay load
    var table = projectTarget == 'jobyer'?'user_entreprise':'user_jobyer';
    var query = table+';'+textQuery;

    var payload = {
      'class' : 'fr.protogen.masterdata.model.CCallout',
      id : 226,
      args : [
        {
          class : 'fr.protogen.masterdata.model.CCalloutArguments',
          label : 'Requete de recherche',
          value : btoa(query)
        },
        {
          class : 'fr.protogen.masterdata.model.CCalloutArguments',
          label : 'ID Offre',
          value : btoa(referenceOffer+'')
        },
        {
          class : 'fr.protogen.masterdata.model.CCalloutArguments',
          label : 'Ordre de tri',
          value : 'TkQ='
        }
      ]
    };

    console.log(JSON.stringify(payload));

    // don't have the data yet
    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      let headers = new Headers();
      headers.append("Content-Type", 'application/json');
      this.http.post(Configs.calloutURL, JSON.stringify(payload), {headers:headers})
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
   * @description Make search by criteria and return a promise of results
   * @param searchQuery The filters of the search
   * @param projectTarget project configuration (jobyer/employer)
   * @return a promise of data results in the same format of the semantic search
     */
  criteriaSearch(searchQuery : any, projectTarget : string){
    //  Init project parameters
    this.configuration = Configs.setConfigs(projectTarget);

    //  Prepare payload
    var query = JSON.stringify(searchQuery);

    var payload = {
      'class' : 'fr.protogen.masterdata.model.CCallout',
      id : 188,
      args : [
        {
          class : 'fr.protogen.masterdata.model.CCalloutArguments',
          label : 'Requete de recherche',
          value : btoa(query)
        }
      ]
    };

    // don't have the data yet
    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      let headers = new Headers();
      headers.append("Content-Type", 'application/json');
      this.http.post(Configs.calloutURL, JSON.stringify(payload), {headers:headers})
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
  persistLastSearch(data){
    this.db.set('LAST_RESULTS', JSON.stringify(data));
  }

  /**
   * @description Get the last results from search
   * @return List of results or a void array
   */
  retrieveLastSearch(){
    return this.db.get('LAST_RESULTS');

  }

}

