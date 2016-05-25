import {Storage, SqlStorage} from 'ionic-angular';
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
  db : any;
  listSectors : any;
  listJobs : any;
  listLanguages : any;
  listQualities : any;
  data : any;
  offerJob : any;
  offerLangs : any;
  offerQuelities : any;

  constructor(public http: Http) {
    this.count = 0;
    this.db = new Storage(SqlStorage);
  }

  /**
   * Calculating the number of candidates corresponding to each offer
   * @param jobId the practice job id is used to deduce the convenient job
   * @param projectTarget Identifying if it is the jobyer version of the employer version
   * @return {Promise<T>|Promise<R>|Promise} 
     */
  getBadgeCount(jobId : number, projectTarget : string){
    //  Init project parameters
    this.configuration = Configs.setConfigs(projectTarget);

    //  Constructing the query
    var table = projectTarget == "jobyer"?'user_offre_entreprise':'user_offre_jobyer';
    var sql = 'select count(pk_'+table+') from '+table+' as nbBadge where pk_'+table+' in (select fk_'+table+' from user_pratique_job where fk_user_job=(select fk_user_job from user_pratique_job where pk_user_pratique_job='+jobId+'))';
    console.log(sql);
    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      let headers = new Headers();
      headers.append("Content-Type", 'text/plain');
      this.http.post(Configs.sqlURL, sql, {headers:headers})
          .map(res => res.json())
          .subscribe(data => {
            // we've got back the raw data, now generate the core schedule data
            // and save the data for later reference
            console.log(data);
            this.count = data.data[0].count;
            console.log(this.count);
            resolve(this.count);
          });
    });
  }

    /**
     * @description Get the corresponding candidates of a specific offer
     * @param offer the reference offer
     * @param projectTarget the project target configuration (jobyer/employer)
     * @return {Promise<T>|Promise<R>|Promise} a promise of returning the candidates
     */
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
      metier : '',
      lieu : '',
      nom : '',
      entreprise : '',
      date : '',
      table : projectTarget == 'jobyer'?'user_offre_entreprise':'user_offre_jobyer',
      idOffre :offerId
    };
    console.log(searchQuery);
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
      this.http.post(Configs.calloutURL, JSON.stringify(payload), {headers:headers})
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

    /**
     * @description     Returning the persisted offers list from the local data base
     * @return {any}    A promise of getting serialized data from SQLite phone database
     */
  loadOffersList(){
    return this.db.get('currentEmployer');
  }

    /**
     * @description     loading sector list
     * @return sector list in the format {id : X, libelle : X}
     */
  loadSectors(projectTarget : string){
    //  Init project parameters
    this.configuration = Configs.setConfigs(projectTarget);

    var sql = 'select pk_user_metier as id, libelle as libelle from user_metier';
    console.log(sql);
    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      let headers = new Headers();
      headers.append("Content-Type", 'text/plain');
      this.http.post(Configs.sqlURL, sql, {headers:headers})
          .map(res => res.json())
          .subscribe(data => {
            // we've got back the raw data, now generate the core schedule data
            // and save the data for later reference
            console.log(data);
            this.listSectors = data.data;
            resolve(this.listSectors );
          });
    });
  }

    /**
     * loading jobs list from server
     * @return jobs list in the format {id : X, idsector : X, libelle : X}
     */
  loadJobs(projectTarget : string, idSector: number){
    //  Init project parameters
    this.configuration = Configs.setConfigs(projectTarget);

        let sql = "";
        if (idSector && idSector > 0)
            sql = 'SELECT pk_user_job as id, user_job.libelle as libelle, fk_user_metier as idsector, user_metier.libelle as libelleSector  ' +
                'FROM user_job, user_metier ' +
                'WHERE fk_user_metier = pk_user_metier ' +
                'AND fk_user_metier ='+idSector;
        else
            sql = 'SELECT pk_user_job as id, user_job.libelle as libelle, fk_user_metier as idsector, user_metier.libelle as libelleSector ' +
                'FROM user_job, user_metier ' +
                'WHERE fk_user_metier = pk_user_metier';

        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(data);
                    this.listJobs = data.data;
                    resolve(this.listJobs);
                });
        });
    }


    /**
     * loading sector by its Id
     * @return sector in the format {id : X, libelle : X}
     */
    loadSectorById(projectTarget:string, idSector:number) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);

        let sql = "";
        if (idSector && idSector > 0)
            sql = 'SELECT pk_user_metier as id, libelle as libelle ' +
                'FROM user_metier ' +
                'WHERE pk_user_metier ='+idSector;
        else
            return ;

        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(data);
                    this.listJobs = data.data;
                    resolve(this.listJobs);
                });
        });
    }

    /**
     * @description     loading languages list
     * @return languages list in the format {id : X, libelle : X}
     */
  loadLanguages(projectTarget : string){
    //  Init project parameters
    this.configuration = Configs.setConfigs(projectTarget);
    var sql = 'select pk_user_langue as id, libelle as libelle, 2 as idlevel, \'junior\' as level from user_langue';
    console.log(sql);
    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      let headers = new Headers();
      headers.append("Content-Type", 'text/plain');
      this.http.post(Configs.sqlURL, sql, {headers:headers})
          .map(res => res.json())
          .subscribe(data => {
            // we've got back the raw data, now generate the core schedule data
            // and save the data for later reference
            console.log(data);
            this.listLanguages = data.data;
            resolve(this.listLanguages );
          });
    });
  }

    /**
     * @description     loading qualities list
     * @return qualities list in the format {id : X, libelle : X}
     */
  loadQualities(projectTarget : string){
    //  Init project parameters
    this.configuration = Configs.setConfigs(projectTarget);
    var sql = 'select pk_user_indispensable as id, libelle as libelle from user_indispensable';
    console.log(sql);
    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      let headers = new Headers();
      headers.append("Content-Type", 'text/plain');
      this.http.post(Configs.sqlURL, sql, {headers:headers})
          .map(res => res.json())
          .subscribe(data => {
            // we've got back the raw data, now generate the core schedule data
            // and save the data for later reference
            console.log(data);
            this.listQualities = data.data;
            resolve(this.listQualities );
          });
    });
  }

  /**
   * @description getting details of a specific job from an offer
   * @param idOffer
   * @param offerTable as user_offre_jobyer or user_offre_entreprise
   * @return the promise of job propositions
     */
  getOffersJob(idOffer : number, offerTable : string){
    var sql = "select job.pk_user_job as id, job.libelle as libellejob, metier.pk_user_metier as idmetier, metier.libelle as libellemetier " +
        "from user_job job, user_metier metier where job.fk_user_metier = metier.pk_user_metier and " +
        "job.pk_user_job in (select fk_user_job from user_pratique_job where fk_"+offerTable+" = "+idOffer+")";
    console.log(sql);
    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      let headers = new Headers();
      headers.append("Content-Type", 'text/plain');
      this.http.post(Configs.sqlURL, sql, {headers:headers})
          .map(res => res.json())
          .subscribe(data => {
            // we've got back the raw data, now generate the core schedule data
            // and save the data for later reference
            console.log(data);
            this.offerJob = data.data;
            resolve(this.offerJob);
          });
    });
  }

  /**
   * @description listing languages related to a set of offers
   * @param idOffers list of offers ID
   * @param offerTable offerTable as user_offre_jobyer or user_offre_entreprise
   * @return the proposition of grouped languages
   */
  getOffersLanguages(idOffers : any, offerTable : string){
    let ids = '('+idOffers[0];
    for(var i = 1 ; i < idOffers.length; i++)
      ids = ids+','+idOffers[i];
    ids = ids+')';
    var sql = "select pk_user_langue as id, libelle from user_langue where " +
        "pk_user_langue in (select fk_user_langue from user_pratique_langue where fk_"+offerTable+" in "+ids+")" +
        " group by id, libelle";
    console.log(sql);
    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      let headers = new Headers();
      headers.append("Content-Type", 'text/plain');
      this.http.post(Configs.sqlURL, sql, {headers:headers})
          .map(res => res.json())
          .subscribe(data => {
            // we've got back the raw data, now generate the core schedule data
            // and save the data for later reference
            console.log(data);
            this.offerLangs = data.data;
            resolve(this.offerLangs);
          });
    });
  }

  /**
   * @description listing qualities related to a set of offers
   * @param idOffers list of offers ID
   * @param offerTable offerTable as user_offre_jobyer or user_offre_entreprise
   * @return the proposition of grouped qualities
   */
  getOffersQualities(idOffers : any, offerTable : string){
    let ids = '('+idOffers[0];
    for(var i = 1 ; i < idOffers.length; i++)
      ids = ids+','+idOffers[i];
    ids = ids+')';
    var sql = "select pk_user_indispensable as id, libelle from user_indispensable where " +
        "pk_user_indispensable in (select fk_user_indispensable from user_pratique_indispensable where fk_"+offerTable+" in "+ids+")" +
        " group by id, libelle";
    console.log(sql);
    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      let headers = new Headers();
      headers.append("Content-Type", 'text/plain');
      this.http.post(Configs.sqlURL, sql, {headers:headers})
          .map(res => res.json())
          .subscribe(data => {
            // we've got back the raw data, now generate the core schedule data
            // and save the data for later reference
            console.log(data);
            this.offerQuelities = data.data;
            resolve(this.offerQuelities);
          });
    });
  }
}

