import {Injectable} from "@angular/core";
import {Configs} from "../../configurations/configs";
import {Http, Headers} from "@angular/http";
import {Helpers} from "../helpers-service/helpers-service";
import {isUndefined} from "ionic-angular/util/util";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {HttpRequestHandler} from "../../http/http-request-handler";
import {Utils} from "../../utils/utils";
import {Contract} from "../../dto/contract";

declare let unescape;

/**
 * @author daoudi amine
 * @description services for contracts yousign
 * @module Contract
 */
@Injectable()
export class ContractService {
  data: any = null;
  configuration: any;


  constructor(public http: Http, private helpers: Helpers, private httpRequest : HttpRequestHandler) {

  }

  getNumContract() {
    let sql = "select nextval('sequence_num_contrat') as numct";
    return new Promise(resolve => {
      this.httpRequest.sendSql(sql, this, true).subscribe(data => {
        this.data = data.data;
          resolve(this.data);
        });
    });
  }

  dayDifference(first, second) {
    if (first)
      first = new Date(first).getTime();
    else
      first = new Date().getTime();
    if (second)
      second = new Date(second).getTime();
    else
      second = new Date().getTime();
    return Math.round((first - second) / (1000 * 60 * 60 * 24)) + 1;
  }

  //to remove after correction Jobyer object in api service
  getJobyerId(jobyer: any, projectTarget: string) {
    //  Init project parameters
    this.configuration = Configs.setConfigs(projectTarget);
    //let dt = new Date();
    let sql = "select pk_user_jobyer from user_jobyer where fk_user_account in (select pk_user_account from user_account where email='" + jobyer.email + "' or telephone='" + jobyer.tel + "') limit 1";

    console.log(sql);


    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  getJobyerComplementData(jobyer: any, projectTarget: string) {
    //  Init project parameters
    this.configuration = Configs.setConfigs(projectTarget);
    //let dt = new Date();
    let sql = "select user_jobyer.pk_user_jobyer as id, user_jobyer.numero_securite_sociale as numss, user_pays.nom as nationalite, cni, numero_titre_sejour, debut_validite, fin_validite from user_jobyer, user_pays " +
      " where user_jobyer.fk_user_pays=user_pays.pk_user_pays " +
      " and fk_user_account in (select pk_user_account from user_account where email='" + jobyer.email + "' or telephone='" + jobyer.tel + "') limit 1";

    console.log(sql);


    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          console.log('retrieved data : ' + JSON.stringify(data));
          this.data = data.data;
          resolve(this.data);
        });
    });
  }

  /**
   * @description get employer Entreprise contracts
   * @param employerEntrepriseId
   * @return JSON results in form of created contract Id
   */
  getContracts(id: number, projectTarget: string) {
    //  Init project parameters
    this.configuration = Configs.setConfigs(projectTarget);
    let sql: string="";
    if (projectTarget == 'employer') {
      sql = "SELECT c.pk_user_contrat,c.*, j.nom, j.prenom FROM user_contrat as c, user_jobyer as j where c.fk_user_jobyer = j.pk_user_jobyer and c.fk_user_entreprise ='" + id + "' order by c.pk_user_contrat";
    } else {
      sql = "SELECT c.pk_user_contrat,c.*, e.nom_ou_raison_sociale as nom FROM user_contrat as c, user_entreprise as e where c.fk_user_entreprise = e.pk_user_entreprise and c.fk_user_jobyer ='" + id + "' order by c.pk_user_contrat";
    }

    console.log(sql);

    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  /**
   * @description save a contract into database
   * @param contract object
   * @param jobyerId
   * @param employerEntrepriseId
   * @return JSON results in form of created contract Id
   */
  saveContract(contract: Contract, jobyerId: Number, employerEntrepriseId: Number, projectTarget: string, accountId, offerId) {
    //  Init project parameters
    this.configuration = Configs.setConfigs(projectTarget);
    //let dt = new Date();
    let epi = (contract.epi ? 'OUI' : 'NON');
    let isScheduleFixed = (contract.isScheduleFixed == 'true' ? 'OUI' : 'NON');
    let sql = "INSERT INTO user_contrat (" +
      " created," +
      " date_de_debut," +
      " date_de_fin," +
      " date_debut_terme," +
      " date_fin_terme," +
      " date_signature," +
      " heure_debut," +
      " heure_fin," +
      " motif_de_recours," +
      " numero," +
      " periode_essai," +
      " tarif_heure," +
      " nombre_heures," +
      " fk_user_entreprise," +
      " fk_user_jobyer," +
      //" lien_jobyer," +
      " signature_employeur," +
      " signature_jobyer," +
      " taux_indemnite_fin_de_mission," +
      " taux_conges_payes," +
      " titre_transport," +
      " zones_transport," +
      " surveillance_medicale_renforcee," +
      " debut_souplesse," +
      " fin_souplesse," +
      " organisation_particuliere," +
      " elements_soumis_a_des_cotisations," +
      " elements_non_soumis_a_des_cotisations," +
      " recours," +
      " titre," +
      " demande_employeur," +
      " demande_jobyer," +
      " option_mission," +
      //" lien_employeur," +
      " equipements_fournis_par_l_ai," +
      " fk_user_periodicite_des_paiements," +
      " embauche_autorise," +
      " rapatriement_a_la_charge_de_l_ai," +
      " horaires_fixes," +
      " liste_epi," +
      " moyen_d_acces," +
      " contact_sur_place," +
      " telephone_contact," +
      " caracteristiques_du_poste," +
      " duree_moyenne_mensuelle," +
      " siege_social," +
      " statut," +
      " filiere," +
      " contact," +
      " indemnite_fin_de_mission," +
      " n_titre_travail," +
      " periodes_non_travaillees," +
      " centre_de_medecine_entreprise," +
      " adresse_centre_de_medecine_entreprise," +
      " risques," +
      " fk_user_offre_entreprise," +
      " epi" +
      ")" +
      " VALUES ("
      + "'" + new Date().toISOString() + "',"
      + "'" + contract.missionStartDate + "',"
      + "'" + contract.missionEndDate + "',"
      + "'" + contract.termStartDate + "',"
      + "'" + contract.termEndDate + "',"
      + "'" + this.helpers.dateToSqlTimestamp(new Date()) + "',"
      + "'" + this.helpers.timeStrToMinutes(contract.workStartHour) + "',"
      + "'" + this.helpers.timeStrToMinutes(contract.workEndHour) + "',"
      + "'" + Utils.sqlfyText(contract.motif) + "',"
      + "'" + Utils.sqlfyText(contract.num) + "',"
      + "'" + contract.trialPeriod + "',"
      + "'" + contract.baseSalary + "',"
      + "'" + contract.workTimeHours + "',"
      + "'" + employerEntrepriseId + "',"
      + "'" + jobyerId + "',"
      //+ "'" + this.sqlfyText(yousignJobyerLink) + "',"
      + "'NON',"
      + "'NON',"
      + "10,"
      + "10,"
      + "'" + Utils.sqlfyText(contract.titreTransport) + "',"
      + "'" + Utils.sqlfyText(contract.zonesTitre) + "',"
      + "'" + Utils.sqlfyText(contract.medicalSurv) + "',"
      + "" + this.checkNull(contract.debutSouplesse) + ","
      + "" + this.checkNull(contract.finSouplesse) + ","
      + "'" + Utils.sqlfyText(contract.usualWorkTimeHours) + "',"
      + "'" + contract.elementsCotisation + "',"
      + "'" + contract.elementsNonCotisation + "',"
      + "'" + Utils.sqlfyText(contract.justification) + "',"
      + "'" + Utils.sqlfyText(contract.titre) + "',"
      + "'" + Utils.sqlfyText(contract.demandeEmployer) + "',"
      + "'" + Utils.sqlfyText(contract.demandeJobyer) + "',"
      + "(select option_mission :: numeric from user_account where pk_user_account = '" + accountId + "'),"
      //+ "'" + this.sqlfyText(yousignEmployerLink) + "',"
      + "'" + epi + "',"
      + "'" + contract.periodicite + "',"
      + "'OUI',"
      + "'OUI',"
      + "'" + isScheduleFixed + "',"
      + "'" + Utils.sqlfyText(contract.equipements) + "',"
      + "'" + Utils.sqlfyText(contract.moyenAcces) + "',"
      + "'" + Utils.sqlfyText(contract.offerContact) + "',"
      + "'" + Utils.sqlfyText(contract.contactPhone) + "',"
      + "'" + Utils.sqlfyText(contract.characteristics) + "',"
      + "'" + contract.MonthlyAverageDuration + "',"
      + "'" + Utils.sqlfyText(contract.headOffice) + "',"
      + "'" + Utils.sqlfyText(contract.category) + "',"
      + "'" + Utils.sqlfyText(contract.sector) + "',"
      + "'" + Utils.sqlfyText(contract.contact) + "',"
      + "'" + contract.indemniteFinMission + "',"
      + "'" + Utils.sqlfyText(contract.numeroTitreTravail) + "',"
      + "'" + Utils.sqlfyText(contract.periodesNonTravaillees) + "',"
      + "'" + Utils.sqlfyText(contract.centreMedecineEntreprise) + "',"
      + "'" + Utils.sqlfyText(contract.adresseCentreMedecineEntreprise) + "',"
      + "'" + Utils.sqlfyText(contract.postRisks) + "',"
      + "'" + offerId + "',"
      + "'" + Utils.sqlfyText(contract.epiProvidedBy) + "'"
      + ")"
      + " RETURNING pk_user_contrat";

    console.log(sql);

    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data;

          resolve(this.data);
        });
    });
  }

  checkNull(date) {
    if (!date || isUndefined(date) || date.length == '')
      return 'null';
    return "'" + date + "'";
  }

  setOffer(idContract, idOffer) {
    let sql = "update user_contrat set fk_user_offre_entreprise = " + idOffer + " where pk_user_contrat=" + idContract;
    console.log(sql);


    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data;
          resolve(this.data);
        });
    });
  }

  /**
   * Load predefined recours list
   */
  loadRecoursList() {
    let sql = "select pk_user_recours as id, libelle from user_recours";
    console.log(sql);


    return new Promise(resolve => {
      let headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data.data;
          resolve(this.data);
        });
    });
  }

  loadPeriodicites() {
    let sql = "select pk_user_periodicite_des_paiements as id, libelle from user_periodicite_des_paiements";
    console.log(sql);


    return new Promise(resolve => {
      let headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          this.data = data.data;
          resolve(this.data);
        });
    });
  }

  /**
   * Loading justification list
   * @param idRecours identifier of recours
   */
  loadJustificationsList(idRecours) {
    let sql = "select pk_user_justificatifs_de_recours as id, libelle from user_justificatifs_de_recours where fk_user_recours=" + idRecours;
    console.log(sql);


    return new Promise(resolve => {
      this.httpRequest.sendSql(sql, this).subscribe(data => {
          this.data = data.data;
          resolve(this.data);
        });
    });
  }

  /**
   * @Description Converts a timeStamp to date string :
   * @param date : a timestamp date
   * @param options Date options
   */
  toDateString(date: number, options: any) {
    options = (options) ? options : '';
    //console.log(JSON.stringify(this.slots));
    //console.log('Calendar slot in ms: ' + date);
    //console.log('Calendar slot in date format: ' + new Date(date));
    return new Date(date).toLocaleDateString('fr-FR', options);
  }


  /**
   * @Description Converts a timeStamp to date string
   * @param time : a timestamp date
   */
  toHourString(time: number) {
    let minutes = (time % 60) < 10 ? "0" + (time % 60).toString() : (time % 60).toString();
    let hours = Math.trunc(time / 60) < 10 ? "0" + Math.trunc(time / 60).toString() : Math.trunc(time / 60).toString();
    return hours + ":" + minutes;
  }

  prepareHoraire(calendar,prerequis, epis, address, moyen, contact, phone) {

    let html = "<br><p><b>Calendrier de travail</b></p><ul>";

    if (calendar && calendar.length > 0) {
      let slots = [];
      for (let i = 0; i < calendar.length; i++) {
        let c = calendar[i];
        slots.push(c);
      }
      for(let i = 0 ; i < slots.length-1 ; i++)
        for(let j = i ; j < slots.length ; j++){
          if(slots[i].date>slots[j].date){
            let tmp = slots[i];
            slots[i] = slots[j];
            slots[j] = tmp;
          }
        }
      for (let i = 0; i < slots.length; i++) {
        let c = slots[i];
        if(c.date == c.dateEnd)
          html = html + "<li><span style='font-weight:bold'>" + this.toDateString(c.date, '') + "</span>&nbsp;&nbsp; de " + this.toHourString(c.startHour) + " à " + this.toHourString(c.endHour) + "</li>";
        else
          html = html + "<li><span style='font-weight:bold'>" + this.toDateString(c.date, '') +" au " + this.toDateString(c.dateEnd, '') + "</span>&nbsp;&nbsp; de " + this.toHourString(c.startHour) + " à " + this.toHourString(c.endHour) + "</li>";
      }

    }

    html = html + "</ul>";

    if(prerequis && prerequis.length > 0){
      html = html + "<br><p><b>Formations et habilitations</b></p><ul>";
      for (let i = 0; i < prerequis.length; i++) {
        let p = prerequis[i];
        html = html + "<li>"+ p + "</li>";
      }
      html = html + "</ul>";
    }


    if(epis && epis.length>0){
      html = html + "<br><p><b>Equipements de protection individuels</b></p>";
      html = html + epis ;
    }

    html = html + "<br><p><b>Adresse de la mission : </b>"+address+"</p>";
    html = html + "<br><p><b>Moyen d'accès : </b>"+moyen+"</p>";
    if(contact && contact.length>0)
      html = html + "<br><p><b>Contact sur place : </b>"+contact+"</p>";
    if(phone && phone.length>0)
      html = html + "<br><p><b>N° Téléphone : </b>"+phone+"</p>";
    return html;
  }

  /**
   * @description call yousign service
   * @param employer
   * @param jobyer
   * @return JSON results in form of youSign Object
   */
  callYousign(user: any, employer: any, jobyer: any, contract: any, projectTarget: string, currentOffer: any, idQuote: any) {

    let horaires = '';

    if (currentOffer) {
      horaires = this.prepareHoraire(currentOffer.calendarData, contract.prerequis,
        contract.equipements,
        contract.adresseInterim,
        contract.moyenAcces,
        contract.offerContact,
        contract.contactPhone);
    }

    let sh = 'Horaires variables selon planning';
    let eh = '';
    if(contract.isScheduleFixed == 'true'){
      sh = contract.workStartHour;
      eh = " à " + contract.workEndHour;
    }

    //get configuration
    this.configuration = Configs.setConfigs(projectTarget);
    let jsonData = {
      "titre": employer.titre,
      "prenom": employer.prenom,
      "nom": employer.nom,
      "entreprise": contract.companyName,
      "adresseEntreprise": contract.workAdress,
      "jobyerPrenom": jobyer.prenom,
      "jobyerNom": jobyer.titre + " " + jobyer.nom,
      "nss": jobyer.numSS,
      "dateNaissance": this.helpers.parseDate(contract.jobyerBirthDate),
      "lieuNaissance": jobyer.lieuNaissance,
      "nationalite": jobyer.nationaliteLibelle,
      "adresseDomicile": jobyer.address,
      "dateDebutMission": this.helpers.parseDate(contract.missionStartDate),
      "dateFinMission": this.helpers.parseDate(contract.missionEndDate),
      "periodeEssai": contract.trialPeriod == null ? "" : ( contract.trialPeriod == 1 ? "1 jour" : (contract.trialPeriod + " jours")),
      "dateDebutTerme": this.helpers.parseDate(contract.termStartDate),
      "dateFinTerme": this.helpers.parseDate(contract.termEndDate),
      "motifRecours": contract.motif,
      "justificationRecours": contract.justification,
      "qualification": contract.qualification,
      "caracteristiquePoste": contract.characteristics,
      "tempsTravail": {
        "nombreHeures": contract.workTimeHours,
        "variables": contract.workTimeVariable,
      },
      "horaireHabituel": {
        "debut": sh,
        "fin": eh,
        "variables": contract.workHourVariable,
      },
      "posteARisque": "Non",
      "surveillanceMedicale": contract.medicalSurv,
      "epi": contract.epi,
      "salaireBase": contract.baseSalary,
      "dureeMoyenneMensuelle": contract.MonthlyAverageDuration,
      "salaireHN": contract.salaryNHours,
      "salaireHS": {
        "35h": contract.salarySH35,
        "43h": contract.salarySH43,
      },
      "droitRepos": contract.restRight,
      "adresseInterim": contract.interimAddress,
      "client": contract.customer,
      "primeDiverses": contract.primes,
      "SiegeSocial": contract.headOffice,
      "ContenuMission": contract.headOffice,
      "categorie": contract.category,
      "filiere": contract.sector,
      "HeureDebutMission": sh,
      "HeureFinMission": eh,
      "num": contract.num,

      "numero": contract.num,
      "contact": contract.contact,
      "indemniteFinMission": contract.indemniteFinMission,
      "indemniteCongesPayes": contract.indemniteCongesPayes,
      "moyenAcces": contract.moyenAcces,
      "numeroTitreTravail": contract.numeroTitreTravail,
      "debutTitreTravail": this.helpers.parseDate(contract.debutTitreTravail),
      "finTitreTravail": this.helpers.parseDate(contract.finTitreTravail),
      "periodesNonTravaillees": contract.periodesNonTravaillees,
      "debutSouplesse": this.helpers.parseDate(contract.debutSouplesse),
      "finSouplesse": this.helpers.parseDate(contract.finSouplesse),
      "equipements": contract.equipements,
      "centreMedecineEntreprise": contract.centreMedecineEntreprise,
      "adresseCentreMedecineEntreprise": contract.adresseCentreMedecineEntreprise,
      "centreMedecineETT": contract.centreMedecineETT,
      "adresseCentreMedecineETT": contract.adresseCentreMedecineETT,
      "risques": contract.postRisks,
      "titreTransport": contract.titreTransport,
      "zonesTitre": contract.zonesTitre,
      "elementsCotisation": contract.elementsCotisation,
      "elementsNonCotisation": contract.elementsNonCotisation,
      "horaires": horaires,
      "organisationParticuliere": ""
      //"organisationParticuliere": contract.usualWorkTimeHours
    };

    console.log(JSON.stringify(jsonData));

    let dataSign = JSON.stringify(
      {
        'class': 'com.vitonjob.docusign.model.DSConfig',
        'employerFirstName': user.prenom,
        'employerLastName': user.nom,
        'employerEmail': user.email,
        'employerPhone': user.tel,
        'jobyerFirstName': jobyer.prenom,
        'jobyerLastName': jobyer.nom,
        'jobyerEmail': jobyer.email,
        'jobyerPhone': jobyer.tel,
        'idQuote': idQuote,
        'idDocument': idQuote,
        'data': btoa(unescape(encodeURIComponent(JSON.stringify(jsonData)))),
        'environnement': GlobalConfigs.env
      });

    // Compute ID according to env
    let callOutId: number = 10337; // 338 ?????
    if (GlobalConfigs.env == 'PROD') {
      callOutId = 10537;
    }

    let payload = {
      'class': 'fr.protogen.masterdata.model.CCallout',
      'id': callOutId,
      'args': [
        {
          'class': 'fr.protogen.masterdata.model.CCalloutArguments',
          label: 'Signature electronique',
          value: btoa(dataSign)
        }
      ]
    };

    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      let headers = new Headers();
      headers.append("Content-Type", 'application/json');

      this.http.post(Configs.yousignURL, JSON.stringify(payload), {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {

          // we've got back the raw data, now generate the core schedule data
          // and save the data for later reference
          this.data = data;
          console.log(this.data);
          resolve(this.data);
        });
    });
  }

  generateMission(idContract, offer) {
    let calendar = offer.calendarData;
    if (calendar && calendar.length > 0) {
      for (let i = 0; i < calendar.length; i++) {
        let c = calendar[i];
        this.generateMissionHour(idContract, c);
      }
    }
  }

  generateMissionHour(idContract, c) {
    let d = new Date(c.date);
    let sql = "insert into user_heure_mission " +
      "(fk_user_contrat, " +
      "jour_debut, " +
      "jour_fin, " +
      "heure_debut, " +
      "heure_fin, " +
      "validation_jobyer, " +
      "validation_employeur) " +
      "values " +
      "(" + idContract + ", " +
      "'" + this.helpers.dateToSqlTimestamp(d) + "', " +
      "'" + this.helpers.dateToSqlTimestamp(d) + "', " +
      "" + c.startHour + ", " +
      "" + c.endHour + "," +
      "'NON', " +
      "'NON')";
    console.log(sql);
    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          console.log(JSON.stringify(data));
          resolve(data);
        });
    });
  }

  prepareRecruitement(entrepriseId, email, tel, idOffer, jobyerId){
    let bean = {
      class: "com.vitonjob.gcr.model.Query",
      entrepriseId : entrepriseId,
      email : email,
      tel : tel,
      idOffer : idOffer,
      jobyerId: jobyerId
    };

    let body = {
      'class': 'fr.protogen.masterdata.model.CCallout',
      id: 20053,
      args: [
        {
          class: 'fr.protogen.masterdata.model.CCalloutArguments',
          label: 'Préparation du recrutement',
          value: btoa(JSON.stringify(bean))
        }
      ]
    };


    return new Promise(resolve => {
      this.httpRequest.sendCallOut(body, this).subscribe((data: any) => {
        resolve(data);
      });
    });
  }

  getContractsByOffer(offerId) {
    let sql = 'select * from user_contrat where fk_user_offre_entreprise=' + offerId;
    return new Promise(resolve => {
      let headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        });
    });
  }

  updateContract(contractData, projectTarget) {
    //  Init project parameters
    this.configuration = Configs.setConfigs(projectTarget);
    let sql = "UPDATE user_contrat SET " +
      "lien_jobyer = '" + Utils.sqlfyText(contractData.partnerJobyerLink)
      + "', lien_employeur = '" + Utils.sqlfyText(contractData.partnerEmployerLink)
      + "', demande_jobyer = '" + Utils.sqlfyText(contractData.demandeJobyer)
      + "', demande_employeur = '" + Utils.sqlfyText(contractData.demandeEmployer)
      + "', enveloppe_employeur = '" + Utils.sqlfyText(contractData.enveloppeEmployeur)
      + "', enveloppe_jobyer = '" + Utils.sqlfyText(contractData.enveloppeJobyer)
      + "' WHERE pk_user_contrat = '" + contractData.id + "'" ;
    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe(data => {
          this.data = data;

          resolve(this.data);
        });
    });
  }

  getNonSignedContracts(entrepriseId){
    let sql = 'select c.pk_user_contrat as id, c.numero as num, c.fk_user_offre_entreprise as \"idOffer\", c.created, c.tarif_heure as \"baseSalary\", c.horaires_fixes as \"isScheduleFixed\", c.heure_debut as \"workStartHour\", c.heure_fin as \"workEndHour\", c.date_de_debut as \"missionStartDate\", c.date_de_fin as \"missionEndDate\", c.date_debut_terme as \"termStartDate\", c.date_fin_terme as \"termEndDate\", c.periode_essai as \"trialPeriod\", c.motif_de_recours as motif, c.recours as justification, c.surveillance_medicale_renforcee as \"medicalSurv\", c.equipements_fournis_par_l_ai as epi, c.elements_non_soumis_a_des_cotisations as \"elementsNonCotisation\", c.elements_soumis_a_des_cotisations as \"elementsCotisation\", c.zones_transport as \"zonesTitre\", c.titre_transport as \"titreTransport\", c.debut_souplesse as \"debutSouplesse\", c.fin_souplesse as \"finSouplesse\", c.liste_epi as \"epiString\", c.moyen_d_acces as \"moyenAcces\", c.contact_sur_place as \"offerContact\", c.telephone_contact as \"contactPhone\", c.caracteristiques_du_poste as characteristics, c.duree_moyenne_mensuelle as \"MonthlyAverageDuration\", c.siege_social as \"headOffice\", c.statut as category, c.filiere as sector, c.contact, c.indemnite_fin_de_mission as \"indemniteFinMission\", c.n_titre_travail as \"numeroTitreTravail\", c.periodes_non_travaillees as \"periodesNonTravaillees\", c.centre_de_medecine_entreprise as \"centreMedecineEntreprise\", c.adresse_centre_de_medecine_entreprise as \"adresseCentreMedecineEntreprise\", c.risques as \"postRisks\", c.lien_employeur as \"partnerEmployerLink\", ' +
      ' j.nom, j.prenom, j.numero_securite_sociale as \"numSS\", j.lieu_de_naissance as \"lieuNaissance\",j.date_de_naissance as \"jobyerBirthDate\", j.pk_user_jobyer as \"jobyerId\", j.debut_validite as \"debutTitreTravail\", j.fin_validite as \"finTitreTravail\", ' +
      ' n.libelle as \"nationaliteLibelle\", ' +
      ' a.email, a.telephone as tel, ' +
      ' o.titre as qualification ' +
      ' from user_contrat as c, user_jobyer as j, user_nationalite as n, user_account as a, user_offre_entreprise as o ' +
      ' where c.fk_user_entreprise=' + entrepriseId + " and upper(c.signature_employeur) = 'NON' " +
      " and c.fk_user_jobyer = j.pk_user_jobyer and j.fk_user_nationalite = n.pk_user_nationalite and a.pk_user_account = j.fk_user_account and o.pk_user_offre_entreprise = c.fk_user_offre_entreprise " +
      " order by c.created desc";

    return new Promise(resolve => {
      let headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        });
    });
  }

  getNonSignedJobyerContracts(jobyerId){
    let sql = "SELECT minHM.fk_user_contrat, minHM.jour, minHM.heure_debut, " +
      'c.pk_user_contrat as id, c.numero as num, c.created, c.en_brouillon as "isDraft",c.signature_employeur, c.lien_jobyer as \"partnerJobyerLink\", ' +
      "e.nom, e.prenom " +
      "FROM " +
      "(SELECT MIN(uhm.jour_debut)as jour, " +
      "MIN(uhm.heure_debut) as heure_debut, " +
      "uhm.fk_user_contrat " +
      "FROM user_heure_mission as uhm " +
      "GROUP BY uhm.fk_user_contrat " +
      "ORDER BY uhm.fk_user_contrat " +
      ") minHM, user_contrat as c, user_entreprise as ent, user_employeur as e " +
      "WHERE minHM.fk_user_contrat = c.pk_user_contrat " +
      "AND c.fk_user_jobyer = " + jobyerId + " " +
      "AND upper(c.signature_employeur) = 'OUI' " +
      "AND upper(c.signature_jobyer) = 'NON' " +
      "AND c.dirty = 'N' " +
      "AND c.fk_user_entreprise = ent.pk_user_entreprise " +
      "AND ent.fk_user_employeur = e.pk_user_employeur " +
      "ORDER BY c.created DESC";

    return new Promise(resolve => {
      let headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        });
    });
  }

  getJobyerAdress(id){
    let sql = "SELECT    user_adresse_jobyer.fk_user_jobyer,    user_adresse_jobyer.personnelle,    " +
      "user_adresse.nom AS lieu_dit,    user_adresse.numero AS numero,    user_code_postal.code AS cp,    " +
      "user_rue.nom AS rue,    user_ville.nom AS ville " +
      "FROM    public.user_adresse_jobyer,    public.user_adresse,    " +
      "public.user_code_postal,    public.user_rue,    public.user_ville " +
      "WHERE    user_adresse.pk_user_adresse = user_adresse_jobyer.fk_user_adresse AND   " +
      "user_code_postal.pk_user_code_postal = user_adresse.fk_user_code_postal AND   " +
      "user_rue.pk_user_rue = user_adresse.fk_user_rue AND   " +
      "user_ville.pk_user_ville = user_adresse.fk_user_ville AND   " +
      "lower_unaccent(user_adresse_jobyer.personnelle)='oui' AND   " +
      "user_adresse_jobyer.dirty ='N' AND   " +
      "user_adresse_jobyer.fk_user_jobyer= "+ id;

    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data:any) => {
          let adr = '';
          if(data.data && data.data.length>0){
            let row = data.data[0];
            adr = row.lieu_dit+" ";
            adr = adr + row.numero+" ";
            adr = adr + row.rue+" ";
            adr = adr + row.cp+" ";
            adr = adr + row.ville+" ";
            adr = adr.trim();
          }
          resolve(adr);
        });
    });
  }

  //type = 0 : missions en cours
  //type = 2 : missions terminées
  getContractsByType(type:number, offset:number, limit:number, id: number, projectTarget: string) {
    //  Init project parameters
    let sqlComm = "SELECT " +
      "distinct (SELECT COUNT(*) FROM user_heure_mission WHERE fk_user_contrat = c.pk_user_contrat AND (date_debut_pointe IS NULL OR date_fin_pointe IS NULL)) as pointages_a_faire, ";
    let employerSql = sqlComm +
      "c.*, " +
      "j.nom, j.prenom, " +
      "a.telephone, " +
      "f.releve_signe_employeur " +
      "FROM user_jobyer as j, user_account as a, user_contrat as c " +
      "LEFT JOIN user_facture_voj as f ON c.pk_user_contrat = f.fk_user_contrat " +
      "WHERE c.fk_user_jobyer = j.pk_user_jobyer " +
      "AND j.fk_user_account = a.pk_user_account " +
      "AND c.fk_user_entreprise ='" + id + "'";

    var jobyerSql = sqlComm +
      "c.pk_user_contrat,c.*, " +
      "e.nom_ou_raison_sociale as nom, " +
      "f.releve_signe_jobyer " +
      "FROM user_entreprise as e, user_contrat as c " +
      "LEFT JOIN user_facture_voj as f ON c.pk_user_contrat = f.fk_user_contrat " +
      "where c.fk_user_entreprise = e.pk_user_entreprise " +
      "and c.fk_user_jobyer ='" + id + "'";

    var typeSql ="";
    if(type ==0){
      typeSql = " and c.date_de_debut is not null and upper(c.signature_jobyer) = 'OUI' and upper(c.releve_employeur)='NON' and c.annule_par is null";
    }else if(type ==1){
      typeSql = " and c.date_de_debut is not null and upper(c.signature_jobyer) = 'NON' and c.annule_par is null";
    }else if(type ==2){
      typeSql =  " and c.date_de_debut is not null and upper(c.releve_employeur) = 'OUI' and c.annule_par is null";
    }else if(type ==3){
      typeSql =  " and c.date_de_debut is not null and c.annule_par is not null";
    }

    var orderBySql = " AND c.dirty = 'N' ORDER BY c.date_de_debut DESC ";
    var rangeSql = " LIMIT "+limit +" OFFSET "+offset;

    this.configuration = Configs.setConfigs(projectTarget);
    if (projectTarget == 'employer') {
      orderBySql += ', j.nom ASC ';
      var sql = employerSql + typeSql + orderBySql + rangeSql;
    } else {
      var sql = jobyerSql + typeSql + orderBySql + rangeSql;
    }

    //console.log(sql);
    return new Promise(resolve => {
      let headers = new Headers();
      headers = Configs.getHttpTextHeaders();
      this.http.post(this.configuration.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe(data => {

          this.data = data;
          resolve(this.data);
        });
    });
  }
}

