import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";
import "rxjs/add/operator/map";
import {Configs} from "../../configurations/configs";
import {Storage} from "@ionic/storage";
import {Utils} from "../../utils/utils";
import {Offer} from "../../dto/offer";
import {CCalloutArguments} from "../../dto/generium/ccallout-arguments";
import {CCallout} from "../../dto/generium/ccallout";
import {HttpRequestHandler} from "../../http/http-request-handler";
import {CalendarSlot} from "../../dto/calendar-slot";
import {Quality} from "../../dto/quality";
import {Language} from "../../dto/language";
import {Requirement} from "../../dto/requirement";

const SAVE_OFFER_CALLOUT_ID = 40020;

/**
 * @author jakjoud abdeslam
 * @description services related to getting the right candidates to an offer
 * @module Offers
 */
@Injectable()
export class OffersService {
    configuration;
    count;
    offersList: any = null;

    listSectors: any;
    listJobs: any;
    listLanguages: any;
    listQualities: any;
    data: any;
    offerJob: any;
    offerLangs: any;
    offerQuelities: any;
    offerList: any;
    addedOffer: any;
    lienVideo: string;
    convention: any;

    constructor(public http: Http, public db: Storage, public httpRequest:HttpRequestHandler) {
        this.count = 0;


        this.convention = {
            id: 0,
            code: '',
            libelle: ''
        };
    }

    /**
     * Calculating the number of candidates corresponding to each offer
     * @param jobId the practice job id is used to deduce the convenient job
     * @param projectTarget Identifying if it is the jobyer version of the employer version
     * @return {Promise<T>|Promise<R>|Promise}
     */
    getBadgeCount(jobId: number, projectTarget: string) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);

        //  Constructing the query
        let table = projectTarget == "jobyer" ? 'user_offre_entreprise' : 'user_offre_jobyer';
        let sql = 'select count(pk_' + table + ') from ' + table + ' as nbBadge where pk_' + table + ' in (select fk_' + table + ' from user_pratique_job where fk_user_job=(select fk_user_job from user_pratique_job where pk_user_pratique_job=' + jobId + '))';
        console.log(sql);
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
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
    loadOfferList(projectTarget: string) {

        /*Returning a promise*/
        return new Promise(resolve => {
            // Loading user
            this.loadCurrentUser(projectTarget)
                .then((data: any) => {
                    switch (projectTarget) {
                        case 'employer' :
                            let employerData = JSON.parse((data)).employer;
                            console.log(employerData.entreprises);
                            if (employerData && employerData.entreprises && employerData.entreprises[0].offers) {
                                this.offerList = employerData.entreprises[0].offers;
                            }
                            for (let i = 0; i < this.offerList.length; i++) {
                                this.offerList[i].jobData.nbPoste = this.offerList[i].nbPoste;
                                this.loadOfferPrerequisObligatoires(this.offerList[i].idOffer).then((data: any) => {
                                    this.offerList[i].jobData.prerequisObligatoires = [];
                                    if (data)
                                        for (let j = 0; j < data.length; j++)
                                            this.offerList[i].jobData.prerequisObligatoires.push(data[j]);
                                });
                            }
                            break;
                        case 'jobyer' :
                            let jobyerData = JSON.parse((data)).jobyer;
                            if (jobyerData && jobyerData.offers) {
                                this.offerList = jobyerData.offers;
                            }
                            for (let i = 0; i < this.offerList.length; i++) {
                                this.loadOfferNecessaryDocuments(this.offerList[i].idOffer).then((data: any) => {
                                    if (data && data.length > 0) {
                                        this.offerList[i].jobData.prerequisObligatoires = [];
                                        for (let j = 0; j < data.length; j++)
                                            this.offerList[i].jobData.prerequisObligatoires.push(data[j].libelle);
                                    }
                                });
                            }
                            break;
                    }
                    resolve(this.offerList);
                });
        });
    }

    loadOfferPrerequisObligatoires(oid) {
        let sql = "select libelle, pk_user_prerquis from user_prerquis where pk_user_prerquis in (select fk_user_prerquis from user_prerequis_obligatoires where fk_user_offre_entreprise=" + oid + ")";
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(data);
                    resolve(data.data);
                });
        });
    }

    loadOfferNecessaryDocuments(oid) {
        let sql = "select libelle from user_prerquis where pk_user_prerquis in (select fk_user_prerquis from user_prerequis_jobyer where fk_user_offre_jobyer=" + oid + ")";
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(data);
                    resolve(data.data);
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
    setOfferInLocal(offerData: any, projectTarget: string) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);
        let offers: any;
        let currentUserVar = this.configuration.currentUserVar;
        offerData.jobData.job = Utils.sqlfyText(offerData.jobData.job);
        return this.db.get(currentUserVar).then((data: any) => {

            if (data) {
                data = JSON.parse((data));
                if (projectTarget === 'employer') {
                    let rawData = data.employer;
                    //console.log(rawData.entreprises);
                    if (rawData && rawData.entreprises && rawData.entreprises[0].offers) {
                        //adding userId for remote storing
                        offerData.identity = rawData.entreprises[0].id;
                        offers = rawData.entreprises[0].offers;
                        offerData.nbPoste = offerData.jobData.nbPoste;
                        offerData.contact = offerData.jobData.contact;
                        offerData.telephone = offerData.jobData.telephone;
                        offers.push(offerData);
                        // Save new offer list in SqlStorage :
                        this.db.set(currentUserVar, JSON.stringify(data));
                    }
                } else { // jobyer
                    let rawData = data.jobyer;
                    if (rawData)
                        offerData.identity = rawData.id;
                    if (rawData && rawData.offers) {
                        //adding userId for remote storing
                        offers = rawData.offers;
                        offers.push(offerData);
                        // Save new offer list in SqlStorage :
                        this.db.set(currentUserVar, JSON.stringify(data));
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
    setOfferInRemote(offerData: any, projectTarget: string) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);
        // transforming ancient offer
        offerData = this.convertOfferToDTO(offerData, projectTarget);
        // store in remote database
        let payloadFinal = new CCallout(SAVE_OFFER_CALLOUT_ID, [
            new CCalloutArguments('Création/Edition offre', offerData),
            new CCalloutArguments('Configuration', {
                'class': 'com.vitonjob.callouts.offer.model.CalloutConfiguration',
                'mode': offerData.idOffer == 0 ? 'creation' : 'edition',
                'userType': (projectTarget === 'employer') ? 'employeur' : 'jobyer'
            })
        ]);

        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            this.httpRequest.sendCallOut(payloadFinal, this)
                .subscribe((data: any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    if (!data)
                        return;
                    this.addedOffer = data;
                    //save the video link
                    let idOffer = data.idOffer;
                    this.updateVideoLink(idOffer, offerData.videolink, projectTarget);
                    //attach id offer to the offer in local
                    offerData.idOffer = idOffer;
                    this.attachIdOfferInLocal(offerData, projectTarget);
                    console.log('ADDED OFFER IN SERVER : ' + JSON.stringify(this.addedOffer));
                    resolve(this.addedOffer);
                });
        });

    }

    convertOfferToDTO(offerData: any, projectTarget: string): Offer {
        let myOffer = new Offer();

        //############################### Ancient code part :
        offerData.class = 'com.vitonjob.callouts.auth.model.OfferData';
        offerData.idOffer = 0;
        offerData.jobData.job = Utils.sqlfyText(offerData.jobData.job);
        offerData.jobyerId = 0;
        offerData.entrepriseId = 0;
        offerData.status = "OUI";
        offerData.visible = true;
        offerData.publiee = "OUI";//idHunter

        switch (projectTarget) {
            case 'employer' :
                offerData.entrepriseId = offerData.identity;
                break;
            case 'jobyer':
                offerData.jobyerId = offerData.identity;
                break;
        }
        //remove identity key/value from offerData object
        delete offerData['identity'];
        delete offerData.jobData['idLevel'];
        //###############################################################

        // Ancient offer object is ready, now preparing the new offer DTO object:
        // Job part
        myOffer.jobData = offerData.jobData;
        delete myOffer.jobData['pharmaSoftwares'];
        delete myOffer.jobData['adress'];
        delete myOffer.jobData['nbPoste'];
        delete myOffer.jobData['contact'];
        delete myOffer.jobData['telephone'];
        myOffer.jobData.epi = [];
        myOffer.jobData.class = 'com.vitonjob.callouts.offer.model.JobData';

        // Calendar part
        //myOffer.calendarData = offerData.calendarData;
        for (let i = 0; i < offerData.calendarData.length; i++) {
            let calendarSlot = new CalendarSlot();
            calendarSlot = JSON.parse(JSON.stringify(offerData.calendarData[i]));
            calendarSlot.class = 'com.vitonjob.callouts.offer.model.CalendarData';
            calendarSlot.pause = false; // ????
            myOffer.calendarData.push(calendarSlot);
        }

        // Quality part
        //myOffer.qualityData = offerData.qualityData;
        for (let i = 0; i < offerData.qualityData.length; i++) {
            let quality = new Quality();
            quality.id = offerData.qualityData[i].idQuality;
            quality.class = 'com.vitonjob.callouts.offer.model.QualityData';
            myOffer.qualityData.push(quality);
        }

        // Language part
        for (let i = 0; i < offerData.languageData.length; i++) {
            let language = new Language();
            language.class ='com.vitonjob.callouts.offer.model.LanguageData';
            language.id = offerData.languageData[i].idLanguage;
            language.level = (offerData.languageData[i].level === 'junior') ? 1 : 2;
            myOffer.languageData.push(language);
        }

        // Requirement part
        for (let i = 0; i < offerData.jobData.prerequisObligatoires.length; i++) {
            let requirement = new Requirement();
            requirement.class = 'com.vitonjob.callouts.offer.model.RequirementData';
            requirement.id = offerData.jobData.prerequisObligatoires[i].id;
            myOffer.requirementData.push(requirement);
        }


        // Offer part
        myOffer.nbPoste = offerData.jobData.nbPoste;
        myOffer.contact = offerData.jobData.contact;
        myOffer.telephone = offerData.jobData.telephone;
        myOffer.status = offerData.status;
        myOffer.title = offerData.title;
        myOffer.videolink = offerData.videoLink;
        myOffer.visible = offerData.visible;
        myOffer.jobyerId = offerData.jobyerId;
        myOffer.entrepriseId = offerData.entrepriseId;

        return myOffer;
    }

    updateNbPoste(nbPoste, offerId) {
        let sql = "update user_offre_entreprise set nombre_de_postes = " + nbPoste + " where pk_user_offre_entreprise = " + offerId;
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data.data);
                });
        });
    }


    saveOfferAdress(offer, offerAddress, streetNumberOA, streetOA,
                    cityOA, zipCodeOA, nameOA, countryOA, idTiers, type) {

        let addressData = {
            'class': 'com.vitonjob.localisation.AdressToken',
            'street': streetOA,
            'cp': zipCodeOA,
            'ville': cityOA,
            'pays': countryOA,
            'name': nameOA,
            'streetNumber': streetNumberOA,
            'role': type,
            'id': "" + idTiers,
            'type': 'travaille'
        };

        let addressDataStr = JSON.stringify(addressData);
        let encodedAddress = btoa(addressDataStr);
        let data = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            'id': 239,
            'args': [{
                'class': 'fr.protogen.masterdata.model.CCalloutArguments',
                label: 'Adresse',
                value: encodedAddress
            }]
        };
        var stringData = JSON.stringify(data);

        return new Promise(resolve => {
            let headers = Configs.getHttpJsonHeaders();
            this.http.post(Configs.calloutURL, stringData, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {

                    let id = data.id;
                    this.updateOfferAdress(id, offer.idOffer, type);
                    resolve(data);
                });
        });

    }

    updateOfferAdress(id, idOffer, type) {
        let table = type == 'jobyer' ? 'user_offre_jobyer' : 'user_offre_entreprise';
        let field = type == 'jobyer' ? 'fk_user_adresse_jobyer' : 'fk_user_adresse_entreprise';

        let sql = "update " + table + " set " + field + "=" + id + " where pk_" + table + "=" + idOffer;

        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {

                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference

                    resolve(data);
                });
        });
    }

    loadOfferAdress(idOffer, type) {
        let to = type == 'jobyer' ? 'user_offre_jobyer' : 'user_offre_entreprise';
        let table = type == 'jobyer' ? 'user_adresse_jobyer' : 'user_adresse_entreprise';
        let sql = "select adresse_google_maps from user_adresse where pk_user_adresse in (" +
            "select fk_user_adresse from " + table + " where pk_" + table + " in (" +
            "select fk_" + table + " from " + to + " where pk_" + to + "=" + idOffer + "" +
            ")" +
            ")";

        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {

                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    let adr = '';
                    if (data && data.data && data.data.length > 0)
                        adr = data.data[0].adresse_google_maps;
                    resolve(adr);
                });
        });
    }

    updatePrerequisObligatoires(idOffer, plist) {
        let sql = "delete from user_prerequis_obligatoires where fk_user_offre_entreprise=" + idOffer;
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {

                    for (let i = 0; i < plist.length; i++) {
                        this.getPrerequis(plist[i]).then(id => {
                            if (id > 0) {
                                this.doUpdatePrerequisObligatoire(idOffer, id);
                            } else {
                                this.insertPrerequis(plist[i]).then(id => {
                                    this.doUpdatePrerequisObligatoire(idOffer, id);
                                });
                            }
                        });
                    }
                    resolve(data);
                });
        });
    }

    updateNecessaryDocuments(idOffer, plist) {
        let sql = "delete from user_prerequis_jobyer where fk_user_offre_jobyer=" + idOffer;
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {

                    for (let i = 0; i < plist.length; i++) {
                        this.getPrerequis(plist[i]).then(id => {
                            if (id > 0) {
                                this.doUpdateNecessaryDocuments(idOffer, id);
                            } else {
                                this.insertPrerequis(plist[i]).then(id => {
                                    this.doUpdateNecessaryDocuments(idOffer, id);
                                });
                            }
                        });
                    }
                    resolve(data);
                });
        });
    }

    getPrerequis(p) {
        let sql = "select pk_user_prerquis as id from user_prerquis where lower_unaccent(libelle) = lower_unaccent('" + p + "')";
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {

                    let id = -1;
                    if (data.data && data.data.length > 0)
                        id = data.data[0].id;
                    resolve(id);
                });
        });
    }

    insertPrerequis(p) {
        let sql = "insert into user_prerquis (libelle) values ('" + p + "') returning pk_user_prerquis";
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {

                    let id = -1;
                    if (data.data && data.data.length > 0)
                        id = data.data[0].pk_user_prerquis;
                    resolve(id);
                });
        });
    }

    doUpdatePrerequisObligatoire(idOffer, idp) {
        let sql = "insert into user_prerequis_obligatoires (fk_user_offre_entreprise, fk_user_prerquis) values (" + idOffer + "," + idp + ")";
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {

                    resolve(data);
                });
        });
    }

    doUpdateNecessaryDocuments(idOffer, idp) {
        let sql = "insert into user_prerequis_jobyer (fk_user_offre_jobyer, fk_user_prerquis) values (" + idOffer + "," + idp + ")";
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {

                    resolve(data);
                });
        });
    }

    attachIdOfferInLocal(offer, projectTarget) {
        this.configuration = Configs.setConfigs(projectTarget);
        let currentUserVar = this.configuration.currentUserVar;
        this.db.get(currentUserVar).then((data: any) => {
            if (data) {
                data = JSON.parse((data));
                if (projectTarget === 'employer') {
                    let rawData = data.employer;
                    //console.log(rawData.entreprises);
                    if (rawData && rawData.entreprises && rawData.entreprises[0].offers) {
                        for (let i = data.employer.entreprises[0].offers.length - 1; i >= 0; i--) {
                            if (!data.employer.entreprises[0].offers[i].idOffer) {
                                data.employer.entreprises[0].offers[i] = offer;
                                break;
                            }
                        }
                        // Save new offer list in SqlStorage :
                        this.db.set(currentUserVar, JSON.stringify(data));
                    }
                } else { // jobyer
                    let rawData = data.jobyer;
                    if (rawData && rawData.offers) {
                        for (let i = data.jobyer.offers.length - 1; i >= 0; i--) {
                            if (!data.jobyer.offers[i].idOffer) {
                                data.jobyer.offers[i] = offer;
                                break;
                            }
                        }
                        // Save new offer list in SqlStorage :
                        this.db.set(currentUserVar, JSON.stringify(data));
                    }
                }
            }
        });
    }

    /**
     *
     * @param offerData delete Offer from local
     * @param projectTarget
     */
    deleteOfferFromLocal(offerData: any, projectTarget: string) {
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
    deleteOfferFromRemote(offerData: any, projectTarget: string) {
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
    getCorrespondingOffers(offer: any, projectTarget: string) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);

        //  Get job and offer reference
        let job = offer.jobData.job;

        let table = (projectTarget === 'jobyer') ? 'user_offre_entreprise' : 'user_offre_jobyer';
        let sql = "select pk_" + table + " from " + table + " where dirty='N' and pk_" + table + " in (select fk_" + table + " from user_pratique_job where fk_user_job in ( select pk_user_job from user_job where lower_unaccent(libelle) % lower_unaccent('" + this.sqlfyText(job) + "')))";
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.clear();
                    console.log(JSON.stringify(data));
                    this.offerList = data.data;
                    console.log(this.offerList);
                    resolve(this.offerList);
                });
        });

    }

    countCorrespondingOffers(offers, projectTarget) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);

        let table = (projectTarget === 'jobyer') ? 'user_offre_entreprise' : 'user_offre_jobyer';
        let sql = "";
        for (var i = 0; i < offers.length; i++) {
            var offer = offers[i];
            //  Get job and offer reference
            let job = offer.jobData.job;

            sql = sql + " select count(*) from " + table + " where pk_" + table + " in (select fk_" + table + " from user_pratique_job where fk_user_job in ( select pk_user_job from user_job where lower_unaccent(libelle) % lower_unaccent('" + this.sqlfyText(job) + "')));";
        }
        return new Promise(resolve => {
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    console.log(data);
                    resolve(data);
                });
        });
    }

    /**
     * @description     Returning the persisted offers list from the local data base
     * @return {any}    A promise of getting serialized data from SQLite phone database
     */
    loadCurrentUser(projectTarget) {
        this.configuration = Configs.setConfigs(projectTarget);
        let currentUserVar = this.configuration.currentUserVar;
        return this.db.get(currentUserVar);
    }

    loadSectorsToLocal() {
        let sql = "select pk_user_metier as id, libelle as libelle from user_metier where dirty='N' order by libelle asc";
        console.log(sql);
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.listSectors = data.data;
                    this.db.set('SECTOR_LIST', JSON.stringify(this.listSectors));
                    resolve(this.listSectors);
                });
        });
    }

    loadJobsToLocal() {
        let sql = "select pk_user_job as id, j.libelle as libelle, fk_user_metier as idSector, m.libelle as sector from user_job j, user_metier m where fk_user_metier = pk_user_metier and j.dirty='N' order by j.libelle asc";
        console.log(sql);
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.listJobs = data.data;
                    this.db.set('JOB_LIST', JSON.stringify(this.listJobs));
                    resolve(this.listJobs);
                });
        });
    }

    loadAllJobs() {
        let sql = "select pk_user_job as id, j.libelle as libelle, fk_user_metier as idSector, m.libelle as sector from user_job j, user_metier m where fk_user_metier = pk_user_metier and j.dirty='N' order by j.libelle asc";
        console.log(sql);
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.listJobs = data.data;
                    this.db.set('JOB_LIST', JSON.stringify(this.listJobs));
                    resolve(this.listJobs);
                });
        });
    }

    autocompleteJobs(job : string){
        let sql = "select pk_user_job as id, j.libelle as libelle, fk_user_metier as idSector, m.libelle as sector " +
            " from user_job j, user_metier m " +
            "where fk_user_metier = pk_user_metier and j.dirty='N' and (lower_unaccent(j.libelle) like  lower_unaccent('%"+job+"%')) " +
            "order by j.libelle asc limit 5";


        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));
                    this.listJobs = data.data;
                    resolve(this.listJobs);
                });
        });
    }

    autocompleteJobsSector(job : string, idSector : number){
        let sql = "select pk_user_job as id, j.libelle as libelle, fk_user_metier as idSector, m.libelle as sector " +
            " from user_job j, user_metier m " +
            "where fk_user_metier = pk_user_metier and j.dirty='N' and (lower_unaccent(j.libelle) like  lower_unaccent('%"+job+"%')) " +
            "order by j.libelle asc limit 5";

        if(idSector>0){
            sql = "select pk_user_job as id, j.libelle as libelle, fk_user_metier as idSector, m.libelle as sector " +
                " from user_job j, user_metier m " +
                "where fk_user_metier = pk_user_metier and j.dirty='N' and (lower_unaccent(j.libelle) like  lower_unaccent('%"+job+"%')) and fk_user_metier="+idSector +
                "order by j.libelle asc limit 5";
        }


        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));
                    this.listJobs = data.data;
                    resolve(this.listJobs);
                });
        });
    }

    /**
     * @description     loading sector list
     * @return sector list in the format {id : X, libelle : X}
     */
    loadSectors(projectTarget: string) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);

        var sql = "select pk_user_metier as id, libelle as libelle from user_metier where dirty='N'";
        console.log(sql);
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
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
    loadJobs(projectTarget: string, idSector: number) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);

        let sql = "";
        if (idSector && idSector > 0)
            sql = 'SELECT pk_user_job as id, user_job.libelle as libelle, fk_user_metier as idsector, user_metier.libelle as libelleSector  ' +
                'FROM user_job, user_metier ' +
                'WHERE fk_user_metier = pk_user_metier ' +
                'AND fk_user_metier =' + idSector +
                "AND user_job.dirty='N'";
        else
            sql = 'SELECT pk_user_job as id, user_job.libelle as libelle, fk_user_metier as idsector, user_metier.libelle as libelleSector ' +
                'FROM user_job, user_metier ' +
                'WHERE fk_user_metier = pk_user_metier' +
                "AND user_job.dirty='N'";

        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(this.configuration.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
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
    loadSectorById(projectTarget: string, idSector: number) {
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
            headers = Configs.getHttpTextHeaders();
            this.http.post(this.configuration.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
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
    loadLanguages(projectTarget: string) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);
        let sql = "select pk_user_langue as \"idLanguage\", libelle as libelle, \'junior\' as level from user_langue where dirty='N' order by libelle asc";
        console.log(sql);
        return new Promise(resolve => {

            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
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
    loadQualities(projectTarget: string) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);
        let type = (projectTarget != "jobyer") ? 'jobyer' : 'employeur';
        let sql = "select pk_user_indispensable as \"idQuality\", libelle as libelle from user_indispensable where type='" + type + "' and dirty='N'";
        console.log(sql);
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
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
    getOffersJob(idOffer: number, offerTable: string) {

        var sql = "select job.pk_user_job as id, job.libelle as libellejob, metier.pk_user_metier as idmetier, metier.libelle as libellemetier " +
            "from user_job job, user_metier metier where job.fk_user_metier = metier.pk_user_metier and " +
            "job.pk_user_job in (select fk_user_job from user_pratique_job where fk_" + offerTable + " = " + idOffer + ")";
        console.log(sql);
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {

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
    getOffersLanguages(idOffers: any, offerTable: string) {
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
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
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
    getOffersQualities(idOffers: any, offerTable: string) {
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
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(data);
                    this.offerQuelities = data.data;
                    resolve(this.offerQuelities);
                });
        });
    }

    /*********************************************************************************************************************
     *  COLLECTIVE CONVENTIONS MANAGEMENT
     *********************************************************************************************************************/

    /**
     * load collective convention based on job ID
     * @param idjob
     * @returns {Promise<T>}
     */
    getConvention(id) {
        let sql = "select pk_user_convention_collective as id, code, libelle " +
            "from user_convention_collective " +
            "where pk_user_convention_collective =" + id + "";

        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {

                    if (data.data && data.data.length > 0) {
                        this.convention = data.data[0];
                    }
                    resolve(this.convention);
                });
        });
    }

    /**
     * Loading all convention levels given convention ID
     * @param idConvention
     * @returns {Promise<T>}
     */
    getConventionNiveaux(idConvention) {
        let sql = "select pk_user_niveau_convention_collective as id, code, libelle from user_niveau_convention_collective where fk_user_convention_collective=" + idConvention;
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    let list = [];
                    if (data.data && data.data.length > 0)
                        list = data.data;
                    resolve(list);
                });
        });
    }

    /**
     * Loading all convention category given convention ID
     * @param idConvention
     * @returns {Promise<T>}
     */
    getConventionCategory(idConvention) {
        let sql = "select pk_user_categorie_convention as id, code, libelle from user_categorie_convention where fk_user_convention_collective=" + idConvention;
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    let list = [];
                    if (data.data && data.data.length > 0)
                        list = data.data;
                    resolve(list);
                });
        });
    }

    /**
     * Loading all convention echelons given convention ID
     * @param idConvention
     * @returns {Promise<T>}
     */
    getConventionEchelon(idConvention) {
        let sql = "select pk_user_echelon_convention as id, code, libelle from user_echelon_convention where fk_user_convention_collective=" + idConvention;
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    let list = [];
                    if (data.data && data.data.length > 0)
                        list = data.data;
                    resolve(list);
                });
        });
    }

    /**
     * Loading all convention coefficients given convention ID
     * @param idConvention
     * @returns {Promise<T>}
     */
    getConventionCoefficients(idConvention) {
        let sql = "select pk_user_coefficient_convention as id, code, libelle from user_coefficient_convention where fk_user_convention_collective=" + idConvention;
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    let list = [];
                    if (data.data && data.data.length > 0)
                        list = data.data;
                    resolve(list);
                });
        });
    }

    /**
     * Loading convention parameters
     * @param idConvention
     * @returns {Promise<T>}
     */
    getConventionParameters(idConvention) {
        let sql = "select pk_user_parametrage_convention as id, remuneration_de_reference as rate, " +
            "fk_user_convention_collective as idcc, fk_user_categorie_convention as idcat, " +
            "fk_user_echelon_convention as idechelon, fk_user_coefficient_convention as idcoeff, fk_user_niveau_convention_collective as idniv " +
            "from user_parametrage_convention where fk_user_convention_collective=" + idConvention;

        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    let list = [];
                    if (data.data && data.data.length > 0)
                        list = data.data;
                    resolve(list);
                });
        });
    }

    /*********************************************************************************************************************
     *  COLLECTIVE CONVENTIONS ADVANTAGES
     *********************************************************************************************************************/
    getHoursCategories(idConv) {
        let sql = "select chc.pk_user_coefficient_heure_conventionnee as id, chc.libelle as libelle, cat.code as code from user_coefficient_heure_conventionnee chc, user_categorie_heures_conventionnees cat where chc.fk_user_categorie_heures_conventionnees=cat.pk_user_categorie_heures_conventionnees and fk_user_convention_collective=" + idConv;
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    let list = [];
                    if (data.data && data.data.length > 0)
                        list = data.data;
                    resolve(list);
                });
        });
    }

    getHoursMajoration(idConv) {
        let sql = "select m.pk_user_majoration_heure_conventionnee as id, m.libelle as libelle, c.code as code from user_majoration_heure_conventionnee m, user_categorie_majoration_heure c where m.fk_user_categorie_majoration_heure=c.pk_user_categorie_majoration_heure and fk_user_convention_collective=" + idConv;
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    let list = [];
                    if (data.data && data.data.length > 0)
                        list = data.data;
                    resolve(list);
                });
        });
    }

    getIndemnites(idConv) {
        let sql = "select pk_user_indemnite_conventionnee as id, i.libelle as libelle, t.code as code from user_indemnite_conventionnee i, user_type_indemnite t where i.fk_user_type_indemnite = t.pk_user_type_indemnite and fk_user_convention_collective=" + idConv;
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    let list = [];
                    if (data.data && data.data.length > 0)
                        list = data.data;
                    resolve(list);
                });
        });
    }


    /*
     *  Update offer statut, job and title
     */

    updateOfferStatut(offerId, statut, projectTarget) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);

        //  Constructing the query
        var table = projectTarget == "jobyer" ? 'user_offre_jobyer' : 'user_offre_entreprise';
        var sql = "update " + table + " set publiee = '" + statut + "' where pk_" + table + " = '" + offerId + "';";

        return new Promise(resolve => {
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(this.configuration.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(
                    data => resolve(data),
                    err => console.log(err)
                )
        });
    }

    updateOfferInLocal(offer, projectTarget) {
        this.configuration = Configs.setConfigs(projectTarget);
        let currentUserVar = this.configuration.currentUserVar;
        this.db.get(currentUserVar).then((data: any) => {
            if (data) {
                data = JSON.parse((data));
                if (projectTarget === 'employer') {
                    let rawData = data.employer;
                    //console.log(rawData.entreprises);
                    if (rawData && rawData.entreprises && rawData.entreprises[0].offers) {
                        //adding userId for remote storing
                        for (let i = 0; i < data.employer.entreprises[0].offers.length; i++) {
                            if (data.employer.entreprises[0].offers[i].idOffer == offer.idOffer) {
                                data.employer.entreprises[0].offers[i] = offer;
                                break;
                            }
                        }
                        // Save new offer list in SqlStorage :
                        this.db.set(currentUserVar, JSON.stringify(data));
                    }
                } else { // jobyer
                    let rawData = data.jobyer;
                    if (rawData && rawData.offers) {
                        for (let i = 0; i < data.jobyer.offers.length; i++) {
                            if (data.jobyer.offers[i].idOffer == offer.idOffer) {
                                data.jobyer.offers[i] = offer;
                                break;
                            }
                        }
                        // Save new offer list in SqlStorage :
                        this.db.set(currentUserVar, JSON.stringify(data));
                    }
                }
            }
        });
    }

    updateOfferJob(offer, projectTarget) {
        this.configuration = Configs.setConfigs(projectTarget);
        let currentUserVar = this.configuration.currentUserVar;
        this.db.get(currentUserVar).then((data: any) => {
            if (data) {
                data = JSON.parse((data));
                if (projectTarget === 'employer') {
                    let rawData = data.employer;
                    //console.log(rawData.entreprises);
                    if (rawData && rawData.entreprises && rawData.entreprises[0].offers) {
                        //adding userId for remote storing
                        for (let i = 0; i < data.employer.entreprises[0].offers.length; i++) {
                            if (data.employer.entreprises[0].offers[i].idOffer == offer.idOffer) {
                                data.employer.entreprises[0].offers[i] = offer;
                                break;
                            }
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set(currentUserVar, JSON.stringify(data));
                    }
                } else { // jobyer
                    let rawData = data.jobyer;
                    if (rawData && rawData.offers) {

                        for (let i = 0; i < data.jobyer.offers.length; i++) {
                            if (data.jobyer.offers[i].idOffer == offer.idOffer) {
                                data.jobyer.offers[i] = offer;
                                break;
                            }
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set(currentUserVar, JSON.stringify(data));
                    }
                }
            }
        });

        if (projectTarget == 'jobyer') {
            this.updateOfferJobyerJob(offer).then((data: any) => {
                this.updateOfferJobyerTitle(offer);

            });

        } else {
            this.updateOfferEntrepriseJob(offer).then((data: any) => {
                this.updateOfferEntrepriseTitle(offer);
            });
        }

    }

    updateOfferJobyerJob(offer) {
        let sql = "update user_pratique_job set fk_user_job=" + offer.jobData.idJob + ", fk_user_niveau=" + (offer.jobData.level == 'junior' ? 1 : 2) + " " +
            "where fk_user_offre_jobyer=" + offer.idOffer;
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));
                    console.log(JSON.stringify(data));
                    if (offer.jobData.prerequisObligatoires) {

                        this.updateNecessaryDocuments(offer.idOffer, offer.jobData.prerequisObligatoires);
                    }
                    resolve(data);
                });
        });
    }

    updateOfferJobyerTitle(offer) {
        let sql = "update user_offre_jobyer set titre='" + offer.title.replace("'", "''") + "', tarif_a_l_heure='" + offer.jobData.remuneration + "' where pk_user_offre_jobyer=" + offer.idOffer;

        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));

                    resolve(data);
                });
        });
    }

    updateOfferEntrepriseJob(offer) {
        let sql = "update user_pratique_job set fk_user_job=" + offer.jobData.idJob + ", fk_user_niveau=" + (offer.jobData.level == 'junior' ? 1 : 2) + " " +
            "where fk_user_offre_entreprise=" + offer.idOffer;
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));
                    if (offer.jobData.prerequisObligatoires) {

                        this.updatePrerequisObligatoires(offer.idOffer, offer.jobData.prerequisObligatoires);
                    }
                    resolve(data);
                });
        });
    }

    updateOfferEntrepriseTitle(offer) {
        let sql = "update user_offre_entreprise set titre='" + this.sqlfyText(offer.title) +
            "', tarif_a_l_heure='" + offer.jobData.remuneration +
            "', nombre_de_postes = " + offer.nbPoste +
            ", contact_sur_place = '" + offer.contact +
            "', telephone_contact = '" + offer.telephone +
            "' where pk_user_offre_entreprise=" + offer.idOffer;

        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
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

    updateOfferQualities(offer, projectTarget) {
        let table = projectTarget == 'jobyer' ? 'user_offre_jobyer' : 'user_offre_entreprise';
        this.deleteQualities(offer, table);
        this.attachQualities(offer, table);
        this.configuration = Configs.setConfigs(projectTarget);
        let currentUserVar = this.configuration.currentUserVar;
        this.db.get(currentUserVar).then((data: any) => {
            if (data) {
                data = JSON.parse((data));
                if (projectTarget === 'employer') {
                    let rawData = data.employer;
                    //console.log(rawData.entreprises);
                    if (rawData && rawData.entreprises && rawData.entreprises[0].offers) {
                        //adding userId for remote storing
                        for (let i = 0; i < data.employer.entreprises[0].offers.length; i++) {
                            if (data.employer.entreprises[0].offers[i].idOffer == offer.idOffer) {
                                data.employer.entreprises[0].offers[i] = offer;
                                break;
                            }
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set(currentUserVar, JSON.stringify(data));
                    }
                } else { // jobyer
                    let rawData = data.jobyer;
                    if (rawData && rawData.offers) {

                        for (let i = 0; i < data.jobyer.offers.length; i++) {
                            if (data.jobyer.offers[i].idOffer == offer.idOffer) {
                                data.jobyer.offers[i] = offer;
                                break;
                            }
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set(currentUserVar, JSON.stringify(data));
                    }
                }
            }
        });
    }

    deleteQualities(offer, table) {
        let sql = "delete from user_pratique_indispensable where fk_" + table + "=" + offer.idOffer;
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));

                    resolve(data);
                });
        });
    }

    attachQualities(offer, table) {
        for (let i = 0; i < offer.qualityData.length; i++) {
            let q = offer.qualityData[i];
            this.attacheQuality(offer.idOffer, table, q.idQuality);
        }
    }

    attacheQuality(idOffer, table, idQuality) {
        let sql = "insert into user_pratique_indispensable (fk_" + table + ", fk_user_indispensable) values (" + idOffer + ", " + idQuality + ")";
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
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

    updateOfferLanguages(offer, projectTarget) {
        let table = projectTarget == 'jobyer' ? 'user_offre_jobyer' : 'user_offre_entreprise';
        this.deleteLanguages(offer, table);
        this.attacheLanguages(offer, table);

        this.configuration = Configs.setConfigs(projectTarget);
        let currentUserVar = this.configuration.currentUserVar;
        this.db.get(currentUserVar).then((data: any) => {
            if (data) {
                data = JSON.parse((data));
                if (projectTarget === 'employer') {
                    let rawData = data.employer;
                    //console.log(rawData.entreprises);
                    if (rawData && rawData.entreprises && rawData.entreprises[0].offers) {
                        //adding userId for remote storing
                        for (let i = 0; i < data.employer.entreprises[0].offers.length; i++) {
                            if (data.employer.entreprises[0].offers[i].idOffer == offer.idOffer) {
                                data.employer.entreprises[0].offers[i] = offer;
                                break;
                            }
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set(currentUserVar, JSON.stringify(data));
                    }
                } else { // jobyer
                    let rawData = data.jobyer;
                    if (rawData && rawData.offers) {

                        for (let i = 0; i < data.jobyer.offers.length; i++) {
                            if (data.jobyer.offers[i].idOffer == offer.idOffer) {
                                data.jobyer.offers[i] = offer;
                                break;
                            }
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set(currentUserVar, JSON.stringify(data));
                    }
                }
            }
        });
    }

    deleteLanguages(offer, table) {
        let sql = "delete from user_pratique_langue where fk_" + table + "=" + offer.idOffer;
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));

                    resolve(data);
                });
        });
    }

    attacheLanguages(offer, table) {
        for (let i = 0; i < offer.languageData.length; i++) {
            let l = offer.languageData[i];
            this.attacheLanguage(offer.idOffer, table, l.idLanguage, l.level);
        }
    }

    attacheLanguage(idOffer, table, idLanguage, level) {
        let sql = "insert into user_pratique_langue (fk_" + table + ", fk_user_langue, fk_user_niveau) values (" + idOffer + ", " + idLanguage + ", " + ((level == 'junior') ? 1 : 2) + ")";
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
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
    updateOfferCalendar(offer, projectTarget) {
        let table = projectTarget == 'jobyer' ? 'user_offre_jobyer' : 'user_offre_entreprise';
        this.deleteCalendar(offer, table);
        this.attacheCalendar(offer, table);

        this.configuration = Configs.setConfigs(projectTarget);
        let currentUserVar = this.configuration.currentUserVar;
        this.db.get(currentUserVar).then((data: any) => {
            if (data) {
                data = JSON.parse((data));
                if (projectTarget === 'employer') {
                    let rawData = data.employer;
                    //console.log(rawData.entreprises);
                    if (rawData && rawData.entreprises && rawData.entreprises[0].offers) {
                        //adding userId for remote storing
                        for (let i = 0; i < data.employer.entreprises[0].offers.length; i++) {
                            if (data.employer.entreprises[0].offers[i].idOffer == offer.idOffer) {
                                data.employer.entreprises[0].offers[i] = offer;
                                break;
                            }
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set(currentUserVar, JSON.stringify(data));
                    }
                } else { // jobyer
                    let rawData = data.jobyer;
                    if (rawData && rawData.offers) {

                        for (let i = 0; i < data.jobyer.offers.length; i++) {
                            if (data.jobyer.offers[i].idOffer == offer.idOffer) {
                                data.jobyer.offers[i] = offer;
                                break;
                            }
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set(currentUserVar, JSON.stringify(data));
                    }
                }
            }
        });
    }

    deleteCalendar(offer, table) {
        let sql = "delete from user_disponibilites_des_offres where fk_" + table + "=" + offer.idOffer;
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));

                    resolve(data);
                });
        });
    }

    attacheCalendar(offer, table) {
        for (let i = 0; i < offer.calendarData.length; i++) {
            let l = offer.calendarData[i];
            this.attacheDay(offer.idOffer, table, l);
        }
    }

    attacheDay(idOffer, table, day) {
        let d = new Date(day.date);

        let sdate = this.sqlfy(d);
        let sql = "insert into user_disponibilites_des_offres (fk_" + table + ", jour, heure_debut, heure_fin) values (" + idOffer + ", '" + sdate + "', " + day.startHour + ", " + day.endHour + ")";
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
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
    deleteOffer(offer, projectTarget) {
        this.configuration = Configs.setConfigs(projectTarget);
        let currentUserVar = this.configuration.currentUserVar;
        this.db.get(currentUserVar).then((data: any) => {
            if (data) {
                data = JSON.parse((data));
                if (projectTarget === 'employer') {
                    let rawData = data.employer;
                    //console.log(rawData.entreprises);
                    if (rawData && rawData.entreprises && rawData.entreprises[0].offers) {
                        //adding userId for remote storing
                        let index = -1;
                        for (let i = 0; i < data.employer.entreprises[0].offers.length; i++) {
                            if (data.employer.entreprises[0].offers[i].idOffer == offer.idOffer) {
                                index = i;
                                break;
                            }
                        }
                        if (index >= 0) {
                            data.employer.entreprises[0].offers.splice(index, 1);
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set(currentUserVar, JSON.stringify(data));
                    }
                } else { // jobyer
                    let rawData = data.jobyer;
                    if (rawData && rawData.offers) {

                        let index = -1;
                        for (let i = 0; i < data.jobyer.offers.length; i++) {
                            if (data.jobyer.offers[i].idOffer == offer.idOffer) {
                                index = i;
                                break;
                            }
                        }
                        if (index >= 0) {
                            data.jobyer.offers.splice(index, 1);
                        }

                        // Save new offer list in SqlStorage :
                        this.db.set(currentUserVar, JSON.stringify(data));
                    }
                }
            }
        });


        let table = projectTarget == 'jobyer' ? 'user_offre_jobyer' : 'user_offre_entreprise';
        let sql = "update " + table + " set dirty='Y' where pk_" + table + "=" + offer.idOffer;
        console.log(sql);
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));

                    resolve(data);
                });
        });
    }

    getOfferVideo(idOffre, table) {
        let sql = "select lien_video as video from " + table + " where pk_" + table + "=" + idOffre;
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));
                    this.lienVideo = null;
                    if (data.data && data.data.length > 0)
                        this.lienVideo = data.data[0];

                    resolve(this.lienVideo);
                });
        });
    }

    updateVideoLink(idOffer, youtubeLink, projectTarget) {
        let table = projectTarget == 'jobyer' ? "user_offre_jobyer" : "user_offre_entreprise";
        let sql = "update " + table + " set lien_video='" + this.sqlfyText(youtubeLink) + "' where pk_" + table + "=" + idOffer;
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));
                    this.lienVideo = youtubeLink;
                    resolve(this.lienVideo);
                });
        });
    }

    saveAutoSearchMode(projectTarget, idOffer, mode) {
        let table = projectTarget == 'jobyer' ? "user_offre_jobyer" : "user_offre_entreprise";
        let sql = "update " + table + " set recherche_automatique='" + mode + "' where pk_" + table + "=" + idOffer;
        console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    console.log(data);
                    resolve(data);
                });
        });
    }

    selectPrerequis(kw) {
        let sql = "select libelle, pk_user_prerquis as id from user_prerquis where lower_unaccent(libelle) like lower_unaccent('%" + kw + "%') or lower_unaccent(libelle) % lower_unaccent('" + kw + "')";
        console.log(sql);
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    console.log(data.data);
                    resolve(data.data);
                });
        });
    }

    isPrerequisExist(kw) {
        let sql = "select libelle from user_prerquis where lower_unaccent(libelle) = lower_unaccent('" + kw + "')";
        console.log(sql);
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    console.log(data.data);
                    resolve(data.data);
                });
        });
    }

    saveSoftwares(offerId, softwares) {
        let sql = "";
        for (let i = 0; i < softwares.length; i++) {
            sql = sql + " insert into user_logiciels_des_offres (" +
                "fk_user_offre_entreprise, " +
                "fk_user_logiciels_pharmaciens" +
                ") values (" +
                offerId + ", " +
                "'" + softwares[i].id + "'" +
                "); ";
        }
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    resolve(data);
                });
        });
    }

    sqlfy(d) {
        return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " 00:00:00+00";
    }

    sqlfyText(text) {
        if (!text || text.length == 0)
            return "";
        return text.replace(/'/g, "''")
    }

    convertToFormattedHour(value) {
        var hours = Math.floor(value / 60);
        var minutes = value % 60;
        if (!hours && !minutes) {
            return '';
        } else {
            return ((hours < 10 ? ('0' + hours) : hours) + ':' + (minutes < 10 ? ('0' + minutes) : minutes));
        }
    }

    convertHoursToMinutes(hour) {
        if (hour) {
            var hourArray = hour.split(':');
            return hourArray[0] * 60 + parseInt(hourArray[1]);
        }
    }

    getOfferByIdFromLocal(currentUser, offerId) {
        let offers = currentUser.employer.entreprises[0].offers;
        for (let i = 0; i < offers.length; i++) {
            if (offers[i].idOffer == offerId) {
                return offers[i];
            }
        }
        return null;
    }

    selectJobs(kw) {
        let sql = "select pk_user_job as id, libelle from user_job where ( lower_unaccent(libelle) like lower_unaccent('%" + this.sqlfyText(kw) + "%') or lower_unaccent(libelle) % lower_unaccent('" + this.sqlfyText(kw) + "')) order by similarity(lower_unaccent(libelle),lower_unaccent('" + this.sqlfyText(kw) + "')) desc";
        console.log(sql);
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    resolve(data.data);
                });
        });
    }
}

