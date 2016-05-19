import {Injectable} from 'angular2/core';
import {Http, Headers} from 'angular2/http';
import 'rxjs/add/operator/map';
import {Configs} from '../../configurations/configs';

/**
 * @author jakjoud abdeslam
 * @description services related to getting the right candidates to an offer
 * @module Offers
 */
@Injectable()
export class OffersService {
  configuration;
  count;
  offersList : any = null;
  constructor(public http: Http) {
    this.count = 0;
  }

  getBadgeCount(jobId : number, projectTarget : string){
    //  Init project parameters
    this.configuration = Configs.setConfigs(projectTarget);

    //  Constructing the query
    var table = projectTarget == "jobyer"?'user_offre_entreprise':'user_offre_jobyer';
    var sql = 'select count(pk_'+table+') as nbBadge where pk_'+table+' in (select fk_'+table+' from user_pratique_job where pk_user_job='+jobId+')';
    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      let headers = new Headers();
      headers.append("Content-Type", 'application/json');
      this.http.post(this.configuration.sqlURL, sql, {headers:headers})
          .map(res => res.json())
          .subscribe(data => {
            // we've got back the raw data, now generate the core schedule data
            // and save the data for later reference
            this.count = data.data[0].nbBadge;
            console.log(this.count);
            resolve(this.count);
          });
    });
  }

  getCorrespondingOffers(offer : any, projectTarget : string){
    //  Init project parameters
    this.configuration = Configs.setConfigs(projectTarget);

    //  Get job title and reference offer
    var job = offer.pricticesJob[0].job;
    var metier = offer.pricticesJob[0].metier;
    var offerId = offer.offerId;

    var searchQuery = {
      class : 'com.vitonjob.callouts.recherche.SearchQuery',
      job : job,
      metier : metier,
      lieu : '',
      nom : '',
      entreprise : '',
      date : '',
      table : projectTarget == 'jobyer'?'user_offre_jobyer':'user_offre_entreprise',
      idOffre :offerId
    };

    //  Prepare payload
    var query = JSON.stringify(searchQuery);

    var payload = {
      'class' : 'fr.protogen.masterdata.model.CCallout',
      id : 127,
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
      this.http.post(this.configuration.calloutURL, JSON.stringify(payload), {headers:headers})
          .map(res => res.json())
          .subscribe(data => {
            // we've got back the raw data, now generate the core schedule data
            // and save the data for later reference
            this.offersList = data;
            console.log(this.offersList);
            resolve(this.offersList);
          });
    });
  }
}

