import {Storage, SqlStorage} from 'ionic-angular';
import {Injectable} from 'angular2/core';
import {Http, Headers} from 'angular2/http';
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
    

  }


  /**
   * @description Performs a natural language search on the database and returns offers
   * @param textQuery
   * @param referenceOffer
   * @return JSON results in form of offers
     */
  semanticSearch(textQuery : string, referenceOffer : number, projectTarget : string){

    //  Init project parameters
    this.configuration = Configs.setConfigs(projectTarget);
    this.db = new Storage(SqlStorage);

    //  Start by identifying the wanted table and prepare the pay load
    var table = projectTarget == 'jobyer'?'user_jobyer':'user_entreprise';
    var query = table+';'+textQuery;

    var payload = {
      'class' : 'fr.protogen.masterdata.model.CCallout',
      id : 102,
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
      let headers = new Headers();
      headers.append("Content-Type", 'application/json');
      this.http.post(this.configuration.calloutURL, JSON.stringify(payload), {headers:headers})
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
}

