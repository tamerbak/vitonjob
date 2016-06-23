import {Storage, SqlStorage} from 'ionic-angular';
import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import {Configs} from '../../configurations/configs';
import {isUndefined} from "ionic-angular/util";

/**
 * @author jakjoud abdeslam
 * @description services related to getting the right candidates to an offer
 * @module Offers
 */
@Injectable()
export class OffersService {
    configuration;
    count;
    offersList:any = null;
    db:any;
    listSectors:any;
    listJobs:any;
    listLanguages:any;
    listQualities:any;
    data:any;
    offerJob:any;
    offerLangs:any;
    offerQuelities:any;
    offerList:any;
    addedOffer:any;

    constructor(public http:Http) {
        this.count = 0;
        this.db = new Storage(SqlStorage);
    }

    /**
     * Calculating the number of candidates corresponding to each offer
     * @param jobId the practice job id is used to deduce the convenient job
     * @param projectTarget Identifying if it is the jobyer version of the employer version
     * @return {Promise<T>|Promise<R>|Promise}
     */
    getBadgeCount(jobId:number, projectTarget:string) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);

        //  Constructing the query
        var table = projectTarget == "jobyer" ? 'user_offre_entreprise' : 'user_offre_jobyer';
        var sql = 'select count(pk_' + table + ') from ' + table + ' as nbBadge where pk_' + table + ' in (select fk_' + table + ' from user_pratique_job where fk_user_job=(select fk_user_job from user_pratique_job where pk_user_pratique_job=' + jobId + '))';
        console.log(sql);
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
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
     * @Author TEL
     * @Description Loading offer list according to user type
     */
    loadOfferList(projectTarget:string) {

        /*Returning a promise*/
        return new Promise(resolve => {
            // Loading user
            this.loadCurrentUser()
                .then(data => {
                    switch (projectTarget) {
                        case 'employer' :
                            let employerData = JSON.parse((data)).employer;
                            console.log(employerData.entreprises);
                            if (employerData && employerData.entreprises && employerData.entreprises[0].offers) {
                                this.offerList = employerData.entreprises[0].offers;
                            }
                            break;
                        case 'jobyer' :
                            let jobyerData = JSON.parse((data)).jobyer;
                            if (jobyerData && jobyerData.offers) {
                                this.offerList = jobyerData.offers;
                            }
                            break;
                    }
                    resolve(this.offerList);
                });
        });
    }

    /**
     * @Author : TEL
     * @Description : Sending the offer to the local dataBase
     * @param offerData : offer data
     * @param projectTarget : project target (jobyer/employer)
     *
     */
    setOfferInLocal(offerData:any, projectTarget:string) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);
        let offers:any;
        let result:any;
        return this.db.get('currentUser').then(data => {
            if (data) {
                data = JSON.parse((data));
                if (projectTarget === 'employer') {
                    let rawData = data.employer;
                    //console.log(rawData.entreprises);
                    if (rawData && rawData.entreprises && rawData.entreprises[0].offers) {
                        //adding userId for remote storing
                        offerData.identity = rawData.entreprises[0].id;
                        offers = rawData.entreprises[0].offers;
                        offers.push(offerData);
                        // Save new offer list in SqlStorage :
                        this.db.set('currentUser', JSON.stringify(data));
                    }
                } else { // jobyer
                    let rawData = data.jobyer;
                    if (rawData && rawData.offers) {
                        //adding userId for remote storing
                        offerData.identity = rawData.jobyerId;
                        offers = rawData.offers;
                        offers.push(offerData);
                        // Save new offer list in SqlStorage :
                        this.db.set('currentUser', JSON.stringify(data));
                    }
                }
            }
        });

    };


    /**
     * @Author TEL
     * @Description Sending the offer to the remote dataBase
     * @param projectTarget : project target (jobyer/employer)
     * @param offerData
     * @caution ALWAYS CALLED AFTER setOfferInLocal()!
     */
    setOfferInRemote(offerData:any, projectTarget:string) {
        


        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);

        // Testing if a user hasn't chose a quality :
        if (offerData.qualityData.length == 0){
            offerData.qualityData.push({
                "class": "com.vitonjob.callouts.auth.model.QualityData",
                idQuality: 0,
                libelle: ""
            });
        }
        // Testing if a user hasn't chose a language :
        if (offerData.languageData.length == 0){
            offerData.languageData.push({
                "class": "com.vitonjob.callouts.auth.model.LanguageData",
                idLanguage: 0,
                level: "",
                libelle: ""
            });
        }
        offerData.class = 'com.vitonjob.callouts.auth.model.OfferData';
        offerData.idOffer = 0;
        offerData.jobyerId = 0;
        offerData.entrepriseId = 0;

        switch (projectTarget) {
            case 'employer' :
                offerData.entrepriseId = offerData.identity;
                break;
            case 'jobyer':
                offerData.jobyerId = offerData.idendity;
                break;
        }
        //remove identity key/value from offerData object

        delete offerData['identity'];
        delete offerData.jobData['idLevel'];

        // store in remote database
        let stringData = JSON.stringify(offerData);
        console.log('Adding offer payload : '+stringData);
        
        let encoded = btoa(stringData);

        let payload = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            id: 133,
            args: [{
                'class': 'fr.protogen.masterdata.model.CCalloutArguments',
                label: 'creation offre',
                value: encoded
            },
                {
                    'class': 'fr.protogen.masterdata.model.CCalloutArguments',
                    label: 'type utilisateur',
                    value: (projectTarget === 'employer') ? btoa('employeur') : btoa('jobyer')
                }]
        };

        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            
            console.log('offer payload : '+JSON.stringify(payload));
            headers.append("Content-Type", 'application/json');
            this.http.post(Configs.calloutURL, JSON.stringify(payload), {headers: headers})

                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.addedOffer = data;
                    console.log('ADDED OFFER IN SERVER : ' + JSON.stringify(this.addedOffer));
                    resolve(this.addedOffer);
                });
        });

    }

    /**
     *
     * @param offerData delete Offer from local
     * @param projectTarget
     */
    deleteOfferFromLocal(offerData:any, projectTarget:string) {
        switch (projectTarget) {
            case 'employer' :

                break;
            case 'jobyer':

                break;
        }
    }

    /**
     * @description Delete offer from remote
     * @param offerData
     * @param projectTarget
     */
    deleteOfferFromRemote(offerData:any, projectTarget: string) {
        switch (projectTarget) {
            case 'employer' :

                break;
            case 'jobyer':

                break;
        }
    }

    /**
     * @modification TEL 26052016
     * @description Get the corresponding candidates of a specific offer
     * @param offer the reference offer
     * @param projectTarget the project target configuration (jobyer/employer)
     * @return {Promise<T>|Promise<R>|Promise} a promise of returning the candidates
     */
    getCorrespondingOffers(offer:any, projectTarget:string) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);

        //  Get job and offer reference
        let job = offer.jobData.job;
        let sector = offer.jobData.sector;
        let offerId = offer.idOffer;

        let searchQuery = {
            class: 'com.vitonjob.callouts.recherche.SearchQuery',
            job: job,
            metier: '',
            lieu: '',
            nom: '',
            entreprise: '',
            date: '',
            table: (projectTarget === 'jobyer') ? 'user_offre_entreprise' : 'user_offre_jobyer',
            idOffre: offerId
        };
        console.log(searchQuery);
        //  Prepare payload
        let query = JSON.stringify(searchQuery);

        let payload = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            id: 129,
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
            headers.append("Content-Type", 'application/json');
            this.http.post(Configs.calloutURL, JSON.stringify(payload), {headers: headers})
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
    loadCurrentUser() {
        return this.db.get('currentUser');
    }

    /**
     * @description     loading sector list
     * @return sector list in the format {id : X, libelle : X}
     */
    loadSectors(projectTarget:string) {
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
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(data);
                    this.listSectors = data.data;
                    resolve(this.listSectors);
                });
        });
    }

    /**
     * loading jobs list from server
     * @return jobs list in the format {id : X, idsector : X, libelle : X}
     */
    loadJobs(projectTarget:string, idSector:number) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);

        let sql = "";
        if (idSector && idSector > 0)
            sql = 'SELECT pk_user_job as id, user_job.libelle as libelle, fk_user_metier as idsector, user_metier.libelle as libelleSector  ' +
                'FROM user_job, user_metier ' +
                'WHERE fk_user_metier = pk_user_metier ' +
                'AND fk_user_metier =' + idSector;
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
                'WHERE pk_user_metier =' + idSector;
        else
            return;

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
    loadLanguages(projectTarget:string) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);
        var sql = 'select pk_user_langue as \"idLanguage\", libelle as libelle, \'junior\' as level from user_langue';
        console.log(sql);
        return new Promise(resolve => {

            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(data);

                    this.listLanguages = data.data;
                    resolve(this.listLanguages);
                });
        });
    }

    /**
     * @description     loading qualities list
     * @return qualities list in the format {id : X, libelle : X}
     */
    loadQualities(projectTarget:string) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);
        var sql = 'select pk_user_indispensable as \"idQuality\", libelle as libelle from user_indispensable';
        console.log(sql);
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(data);
                    this.listQualities = data.data;
                    resolve(this.listQualities);
                });
        });
    }

    /**
     * @description getting details of a specific job from an offer
     * @param idOffer
     * @param offerTable as user_offre_jobyer or user_offre_entreprise
     * @return the promise of job propositions
     */
    getOffersJob(idOffer:number, offerTable:string) {
        var sql = "select job.pk_user_job as id, job.libelle as libellejob, metier.pk_user_metier as idmetier, metier.libelle as libellemetier " +
            "from user_job job, user_metier metier where job.fk_user_metier = metier.pk_user_metier and " +
            "job.pk_user_job in (select fk_user_job from user_pratique_job where fk_" + offerTable + " = " + idOffer + ")";
        console.log(sql);
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
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
    getOffersLanguages(idOffers:any, offerTable:string) {
        let ids = '(' + idOffers[0];
        for (var i = 1; i < idOffers.length; i++)
            ids = ids + ',' + idOffers[i];
        ids = ids + ')';
        var sql = "select pk_user_langue as id, libelle from user_langue where " +
            "pk_user_langue in (select fk_user_langue from user_pratique_langue where fk_" + offerTable + " in " + ids + ")" +
            " group by id, libelle";
        console.log(sql);
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
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
    getOffersQualities(idOffers:any, offerTable:string) {
        let ids = '(' + idOffers[0];
        for (var i = 1; i < idOffers.length; i++)
            ids = ids + ',' + idOffers[i];
        ids = ids + ')';
        var sql = "select pk_user_indispensable as id, libelle from user_indispensable where " +
            "pk_user_indispensable in (select fk_user_indispensable from user_pratique_indispensable where fk_" + offerTable + " in " + ids + ")" +
            " group by id, libelle";
        console.log(sql);
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
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

    /*
     *  Update offer statut, job and title
     */

	updateOfferStatut(offerId, statut, projectTarget){
		//  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);

        //  Constructing the query
        var table = projectTarget == "jobyer" ? 'user_offre_entreprise' : 'user_offre_jobyer';
        var sql = "update " + table + " set publiee = '" + statut + "' where pk_" + table + " = '" + offerId + "';";

	    return new Promise(resolve => {
			let headers = new Headers();
			headers.append("Content-Type", 'text/plain');
			this.http.post(this.configuration.sqlURL, sql, {headers:headers})
			.map(res => res.json())
			.subscribe(
			data => resolve(data),
			err => console.log(err)
			)
		});
	}

    updateOfferJob(offer, projectTarget){

        this.db.get('currentUser').then(data => {
            if (data) {
                data = JSON.parse((data));
                if (projectTarget === 'employer') {
                    let rawData = data.employer;
                    //console.log(rawData.entreprises);
                    if (rawData && rawData.entreprises && rawData.entreprises[0].offers) {
                        //adding userId for remote storing
                        for(let i = 0 ; i < data.employer.entreprises[0].offers.length ; i++){
                            if(data.employer.entreprises[0].offers[i].idOffer == offer.idOffer){
                                data.employer.entreprises[0].offers[i] = offer;
                                break;
                            }
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set('currentUser', JSON.stringify(data));
                    }
                } else { // jobyer
                    let rawData = data.jobyer;
                    if (rawData && rawData.offers) {

                        for(let i = 0; i < data.jobyer.offers.length ; i++){
                            if(data.jobyer.offers[i].idOffer == offer.idOffer){
                                data.jobyer.offers[i] = offer;
                                break;
                            }
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set('currentUser', JSON.stringify(data));
                    }
                }
            }
        });

        if(projectTarget == 'jobyer'){
            this.updateOfferJobyerJob(offer).then(data => {
                this.updateOfferJobyerTitle(offer);
            });
        } else {
            this.updateOfferEntrepriseJob(offer).then(data => {
                this.updateOfferEntrepriseTitle(offer);
            });
        }
    }

    updateOfferJobyerJob(offer){
        let sql = "update user_pratique_job set fk_user_job="+offer.jobData.idJob+", fk_user_niveau="+(offer.jobData.level=='junior'?1:2)+" " +
            "where fk_user_offre_jobyer="+offer.idOffer;
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));

                    resolve(data);
                });
        });
    }

    updateOfferJobyerTitle(offer){
        let sql = "update user_offre_jobyer set titre='"+offer.title+"' where pk_user_offre_jobyer="+offer.idOffer;

        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));

                    resolve(data);
                });
        });
    }

    updateOfferEntrepriseJob(offer){
        let sql = "update user_pratique_job set fk_user_job="+offer.jobData.idJob+", fk_user_niveau="+(offer.jobData.level=='junior'?1:2)+" " +
            "where fk_user_offre_entreprise="+offer.idOffer;
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));

                    resolve(data);
                });
        });
    }

    updateOfferEntrepriseTitle(offer){
        let sql = "update user_offre_entreprise set titre='"+offer.title+"' where pk_user_offre_entreprise="+offer.idOffer;

        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));

                    resolve(data);
                });
        });
    }

    /*
     *  Update offer qualities
     */

    updateOfferQualities(offer, projectTarget){
        let table = projectTarget == 'jobyer'?'user_offre_jobyer':'user_offre_entreprise';
        this.deleteQualities(offer, table);
        this.attachQualities(offer, table);
        this.db.get('currentUser').then(data => {
            if (data) {
                data = JSON.parse((data));
                if (projectTarget === 'employer') {
                    let rawData = data.employer;
                    //console.log(rawData.entreprises);
                    if (rawData && rawData.entreprises && rawData.entreprises[0].offers) {
                        //adding userId for remote storing
                        for(let i = 0 ; i < data.employer.entreprises[0].offers.length ; i++){
                            if(data.employer.entreprises[0].offers[i].idOffer == offer.idOffer){
                                data.employer.entreprises[0].offers[i] = offer;
                                break;
                            }
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set('currentUser', JSON.stringify(data));
                    }
                } else { // jobyer
                    let rawData = data.jobyer;
                    if (rawData && rawData.offers) {

                        for(let i = 0; i < data.jobyer.offers.length ; i++){
                            if(data.jobyer.offers[i].idOffer == offer.idOffer){
                                data.jobyer.offers[i] = offer;
                                break;
                            }
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set('currentUser', JSON.stringify(data));
                    }
                }
            }
        });
    }

    deleteQualities(offer, table){
        let sql = "delete from user_pratique_indispensable where fk_"+table+"="+offer.idOffer;
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));

                    resolve(data);
                });
        });
    }

    attachQualities(offer, table){
        for(let i = 0 ; i < offer.qualityData.length ; i++){
            let q = offer.qualityData[i];
            this.attacheQuality(offer.idOffer, table, q.idQuality);
        }
    }

    attacheQuality(idOffer, table, idQuality){
        let sql = "insert into user_pratique_indispensable (fk_"+table+", fk_user_indispensable) values ("+idOffer+", "+idQuality+")";
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));

                    resolve(data);
                });
        });
    }

    /*
     *  Update Offer languages
     */

    updateOfferLanguages(offer, projectTarget){
        let table = projectTarget == 'jobyer'?'user_offre_jobyer':'user_offre_entreprise';
        this.deleteLanguages(offer, table);
        this.attacheLanguages(offer, table);

        this.db.get('currentUser').then(data => {
            if (data) {
                data = JSON.parse((data));
                if (projectTarget === 'employer') {
                    let rawData = data.employer;
                    //console.log(rawData.entreprises);
                    if (rawData && rawData.entreprises && rawData.entreprises[0].offers) {
                        //adding userId for remote storing
                        for(let i = 0 ; i < data.employer.entreprises[0].offers.length ; i++){
                            if(data.employer.entreprises[0].offers[i].idOffer == offer.idOffer){
                                data.employer.entreprises[0].offers[i] = offer;
                                break;
                            }
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set('currentUser', JSON.stringify(data));
                    }
                } else { // jobyer
                    let rawData = data.jobyer;
                    if (rawData && rawData.offers) {

                        for(let i = 0; i < data.jobyer.offers.length ; i++){
                            if(data.jobyer.offers[i].idOffer == offer.idOffer){
                                data.jobyer.offers[i] = offer;
                                break;
                            }
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set('currentUser', JSON.stringify(data));
                    }
                }
            }
        });
    }

    deleteLanguages(offer, table){
        let sql = "delete from user_pratique_langue where fk_"+table+"="+offer.idOffer;
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));

                    resolve(data);
                });
        });
    }

    attacheLanguages(offer, table){
        for(let i = 0 ; i < offer.languageData.length ; i++){
            let l = offer.languageData[i];
            this.attacheLanguage(offer.idOffer, table, l.idLanguage, l.level);
        }
    }

    attacheLanguage(idOffer, table, idLanguage, level){
        let sql = "insert into user_pratique_langue (fk_"+table+", fk_user_langue, fk_user_niveau) values ("+idOffer+", "+idLanguage+", "+((level=='Débutant')?1:2)+")";
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));

                    resolve(data);
                });
        });
    }

    /*
     *  Update offer calendar
     */
    updateOfferCalendar(offer, projectTarget){
        let table = projectTarget == 'jobyer'?'user_offre_jobyer':'user_offre_entreprise';
        this.deleteCalendar(offer, table);
        this.attacheCalendar(offer, table);

        this.db.get('currentUser').then(data => {
            if (data) {
                data = JSON.parse((data));
                if (projectTarget === 'employer') {
                    let rawData = data.employer;
                    //console.log(rawData.entreprises);
                    if (rawData && rawData.entreprises && rawData.entreprises[0].offers) {
                        //adding userId for remote storing
                        for(let i = 0 ; i < data.employer.entreprises[0].offers.length ; i++){
                            if(data.employer.entreprises[0].offers[i].idOffer == offer.idOffer){
                                data.employer.entreprises[0].offers[i] = offer;
                                break;
                            }
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set('currentUser', JSON.stringify(data));
                    }
                } else { // jobyer
                    let rawData = data.jobyer;
                    if (rawData && rawData.offers) {

                        for(let i = 0; i < data.jobyer.offers.length ; i++){
                            if(data.jobyer.offers[i].idOffer == offer.idOffer){
                                data.jobyer.offers[i] = offer;
                                break;
                            }
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set('currentUser', JSON.stringify(data));
                    }
                }
            }
        });
    }

    deleteCalendar(offer, table){
        let sql = "delete from user_disponibilites_des_offres where fk_"+table+"="+offer.idOffer;
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));

                    resolve(data);
                });
        });
    }

    attacheCalendar(offer, table){
        for(let i = 0 ; i < offer.calendarData.length ; i++){
            let l = offer.calendarData[i];
            this.attacheDay(offer.idOffer, table, l);
        }
    }

    attacheDay(idOffer, table, day){
        let d = new Date(day.date);
        
        let sdate = this.sqlfy(d);
        let sql = "insert into user_disponibilites_des_offres (fk_"+table+", jour, heure_debut, heure_fin) values ("+idOffer+", '"+sdate+"', "+day.startHour+", "+day.endHour+")";
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));

                    resolve(data);
                });
        });
    }

    /**
     * Delete offer
     * @param offer to be deleted
     */
    deleteOffer(offer, projectTarget){

        this.db.get('currentUser').then(data => {
            if (data) {
                data = JSON.parse((data));
                if (projectTarget === 'employer') {
                    let rawData = data.employer;
                    //console.log(rawData.entreprises);
                    if (rawData && rawData.entreprises && rawData.entreprises[0].offers) {
                        //adding userId for remote storing
                        let index = -1;
                        for(let i = 0 ; i < data.employer.entreprises[0].offers.length ; i++){
                            if(data.employer.entreprises[0].offers[i].idOffer == offer.idOffer){
                                index = i;
                                break;
                            }
                        }
                        if(index>=0){
                            data.employer.entreprises[0].offers.splice(index,1);
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set('currentUser', JSON.stringify(data));
                    }
                } else { // jobyer
                    let rawData = data.jobyer;
                    if (rawData && rawData.offers) {

                        let index = -1;
                        for(let i = 0; i < data.jobyer.offers.length ; i++){
                            if(data.jobyer.offers[i].idOffer == offer.idOffer){
                                index = i;
                                break;
                            }
                        }
                        if(index>=0){
                            data.employer.entreprises[0].offers.splice(index,1);
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set('currentUser', JSON.stringify(data));
                    }
                }
            }
        });


        let table = projectTarget == 'jobyer'?'user_offre_jobyer':'user_offre_entreprise';
        let sql = "update "+table+" set dirty='Y' where pk_"+table+"="+offer.idOffer;
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));

                    resolve(data);
                });
        });
    }

    sqlfy(d){
        return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+" 00:00:00+00";
    }
}

