import {Injectable} from '@angular/core';
import {Configs} from '../../configurations/configs';
import {Http, Headers} from '@angular/http';
import {Helpers} from '../../providers/helpers.service.ts';
import {isUndefined} from "ionic-angular/util";


/**
 * @author daoudi amine
 * @description services for contracts yousign
 * @module Contract
 */
@Injectable()
export class ContractService {
    data: any = null;
    configuration : any;


    constructor(public http: Http,private helpers:Helpers) {

    }

    getNumContract(){
        let sql = "select nextval('sequence_num_contrat') as numct";
        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    this.data = data.data;
                    resolve(this.data);
                });
        });
    }

    //to remove after correction Jobyer object in api service
    getJobyerId(jobyer:any,projectTarget:string){
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);
        var dt = new Date();
        var sql = "select pk_user_jobyer from user_jobyer where fk_user_account in (select pk_user_account from user_account where email='"+ jobyer.email +"' or telephone='"+ jobyer.tel +"') limit 1";

        console.log(sql);


        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    this.data = data;
                    resolve(this.data);
                });
        });
    }

    getJobyerComplementData(jobyer:any,projectTarget:string){
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);
        var dt = new Date();
        var sql = "select user_jobyer.pk_user_jobyer as id, user_jobyer.numero_securite_sociale as numss, user_pays.nom as nationalite from user_jobyer, user_pays " +
            " where user_jobyer.fk_user_pays=user_pays.pk_user_pays " +
            " and fk_user_account in (select pk_user_account from user_account where email='"+ jobyer.email +"' or telephone='"+ jobyer.tel +"') limit 1";

        console.log(sql);


        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    console.log('retrieved data : '+JSON.stringify(data));
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
    getContracts(id:number,projectTarget:string){
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);
        if(projectTarget == 'employer'){
            var sql = "SELECT c.pk_user_contrat,c.*, j.nom, j.prenom FROM user_contrat as c, user_jobyer as j where c.fk_user_jobyer = j.pk_user_jobyer and c.fk_user_entreprise ='"+id+"' order by c.pk_user_contrat";
        }else{
            var sql = "SELECT c.pk_user_contrat,c.*, e.nom_ou_raison_sociale as nom FROM user_contrat as c, user_entreprise as e where c.fk_user_entreprise = e.pk_user_entreprise and c.fk_user_jobyer ='"+id+"' order by c.pk_user_contrat";
        }

        console.log(sql);

        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
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
    saveContract(contract:any,jobyerId:Number,employerEntrepriseId:Number,projectTarget:string, yousignJobyerLink){
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);
        var dt = new Date();
        var sql = "INSERT INTO user_contrat ("+
            " date_de_debut,"+
            " date_de_fin,"+
            " date_debut_terme,"+
            " date_fin_terme,"+
            " date_signature,"+
            " heure_debut,"+
            " heure_fin,"+
            " motif_de_recours,"+
            " numero,"+
            " periode_essai,"+
            " tarif_heure,"+
            " nombre_heures,"+
            " fk_user_entreprise,"+
            " fk_user_jobyer," +
            " lien_jobyer," +
            " signature_employeur," +
            " signature_jobyer," +
            " taux_indemnite_fin_de_mission," +
            " taux_conges_payes," +
            " titre_transport,"+
            " zones_transport,"+
            " surveillance_medicale_renforcee,"+
            " debut_souplesse,"+
            " fin_souplesse,"+
            " organisation_particuliere,"+
            " elements_soumis_a_des_cotisations,"+
            " elements_non_soumis_a_des_cotisations,"+
            " recours"+
            ")"+
            " VALUES ("
            +"'"+ contract.missionStartDate +"',"
            +"'"+ contract.missionEndDate +"',"
            +"'"+ contract.termStartDate +"',"
            +"'"+ contract.termEndDate +"',"
            +"'"+ this.helpers.dateToSqlTimestamp(new Date())+"',"
            +"'"+ this.helpers.timeStrToMinutes(contract.workStartHour) +"',"
            +"'"+ this.helpers.timeStrToMinutes(contract.workEndHour) +"',"
            +"'"+ contract.motif +"',"
            +"'"+ contract.num +"',"
            +"'"+ contract.trialPeriod +"',"
            +"'"+ contract.baseSalary +"',"
            +"'"+ contract.workTimeHours +"',"
            +"'"+ employerEntrepriseId +"',"
            +"'"+ jobyerId +"',"
            +"'"+yousignJobyerLink+"',"
            +"'OUI',"
            +"'NON',"
            +"10,"
            +"10,"
            +"'"+contract.titreTransport+"',"
            +"'"+contract.zonesTitre+"',"
            +"'"+contract.medicalSurv+"',"
            +""+this.checkNull(contract.debutSouplesse)+","
            +""+this.checkNull(contract.finSouplesse)+","
            +"'"+contract.usualWorkTimeHours+"',"
            +"'"+contract.elementsCotisation+"',"
            +"'"+contract.elementsNonCotisation+"',"
            +"'"+contract.justification+"'"
            +")"
            +" RETURNING pk_user_contrat";

        console.log(sql);


        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    this.data = data;
                    resolve(this.data);
                });
        });
    }

    checkNull(date){
        if(!date || isUndefined(date) || date.length =='')
            return 'null';
        return "'"+date+"'";
    }

    setOffer(idContract, idOffer){
        let sql = "update user_contrat set fk_user_offre_entreprise = "+idOffer+" where pk_user_contrat="+idContract;
        console.log(sql);


        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    this.data = data;
                    resolve(this.data);
                });
        });
    }

    /**
     * @Description Converts a timeStamp to date string :
     * @param date : a timestamp date
     * @param options Date options
     */
    toDateString(date:number, options:any) {
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
    toHourString(time:number) {
        let minutes = (time % 60) < 10 ? "0" + (time % 60).toString() : (time % 60).toString();
        let hours = Math.trunc(time / 60) < 10 ? "0" + Math.trunc(time / 60).toString() : Math.trunc(time / 60).toString();
        return hours + ":" + minutes;
    }

    prepareHoraire(calendar){
        let html = "<ul>";

        if(calendar && calendar.length>0) {
            for (let i = 0; i < calendar.length; i++) {
                let c = calendar[i];
                html = html + "<li><span style='font-weight:bold'>"+this.toDateString(c.date, '')+"</span>&nbsp;&nbsp; de "+this.toHourString(c.startHour)+" à "+this.toHourString(c.endHour)+"</li>";
            }
        }

        html = html + "</ul>";
        return html;
    }

    /**
     * @description call yousign service
     * @param employer
     * @param jobyer
     * @return JSON results in form of youSign Object
     */
    callYousign(user : any, employer:any, jobyer:any,contract:any,projectTarget:string, currentOffer : any){

        let horaires = '';
        debugger;
        if(currentOffer){
            horaires = this.prepareHoraire(currentOffer.calendarData);
        }
        //get configuration
        this.configuration = Configs.setConfigs(projectTarget);
        var jsonData = {
            "titre" : employer.titre,
            "prenom":  employer.prenom,
            "nom":  employer.nom,
            "entreprise" : contract.companyName,
            "adresseEntreprise" : contract.workAdress,
            "jobyerPrenom" : jobyer.prenom,
            "jobyerNom" : jobyer.nom,
            "nss" : jobyer.numSS,
            "dateNaissance" : this.helpers.parseDate(contract.jobyerBirthDate),
            "lieuNaissance" : jobyer.lieuNaissance,
            "nationalite" : jobyer.nationaliteLibelle,
            "adresseDomicile" : jobyer.address,
            "dateDebutMission" : this.helpers.parseDate(contract.missionStartDate),
            "dateFinMission" : this.helpers.parseDate(contract.missionEndDate),
            "periodeEssai" :  contract.trialPeriod == null ? "":( contract.trialPeriod == 1 ? "1 jour": (contract.trialPeriod + " jours")),
            "dateDebutTerme" : this.helpers.parseDate(contract.termStartDate),
            "dateFinTerme" : this.helpers.parseDate(contract.termEndDate),
            "motifRecours" : contract.motif,
            "justificationRecours" : contract.justification,
            "qualification" : contract.qualification,
            "caracteristiquePoste" : contract.characteristics,
            "tempsTravail" : {
                "nombreHeures" : contract.workTimeHours,
                "variables" : contract.workTimeVariable,
            },
            "horaireHabituel" : {
                "debut" : contract.workStartHour,
                "fin" : contract.workEndHour,
                "variables" : contract.workHourVariable,
            },
            "posteARisque" : contract.postRisks,
            "surveillanceMedicale" : contract.medicalSurv,
            "epi" : contract.epi,
            "salaireBase" : contract.baseSalary,
            "dureeMoyenneMensuelle" : contract.MonthlyAverageDuration,
            "salaireHN" : contract.salaryNHours,
            "salaireHS": {
                "35h" : contract.salarySH35,
                "43h" : contract.salarySH43,
            },
            "droitRepos" : contract.restRight,
            "adresseInterim" : contract.interimAddress,
            "client" : contract.customer,
            "primeDiverses" : contract.primes,
            "SiegeSocial" : contract.headOffice,
            "ContenuMission" : contract.headOffice,
            "categorie" : contract.category,
            "filiere" : contract.sector,
            "HeureDebutMission" : contract.workStartHour,
            "HeureFinMission" : contract.workEndHour,
            "num"  : contract.num,

            "numero" : contract.num,
            "contact": contract.contact,
            "indemniteFinMission" : contract.indemniteFinMission,
            "indemniteCongesPayes" : contract.indemniteCongesPayes,
            "moyenAcces" : contract.moyenAcces,
            "numeroTitreTravail" : contract.numeroTitreTravail,
            "debutTitreTravail" : this.helpers.parseDate(contract.debutTitreTravail),
            "finTitreTravail" : this.helpers.parseDate(contract.finTitreTravail),
            "periodesNonTravaillees" : contract.periodesNonTravaillees,
            "debutSouplesse" : this.helpers.parseDate(contract.debutSouplesse),
            "finSouplesse" : this.helpers.parseDate(contract.finSouplesse),
            "equipements" : contract.equipements,
            "centreMedecineEntreprise":contract.centreMedecineEntreprise,
            "adresseCentreMedecineEntreprise":contract.adresseCentreMedecineEntreprise,
            "centreMedecineETT":contract.centreMedecineETT,
            "adresseCentreMedecineETT":contract.adresseCentreMedecineETT,
            "risques" : contract.postRisks,
            "titreTransport" :  contract.titreTransport,
            "zonesTitre" : contract.zonesTitre,
            "elementsCotisation" : contract.elementsCotisation,
            "elementsNonCotisation" : contract.elementsNonCotisation,
            "horaires":horaires
        };
        debugger;
        console.log(JSON.stringify(jsonData));

        var dataSign =JSON.stringify(
            {
                'class': 'com.vitonjob.yousign.callouts.YousignConfig',
                'employerFirstName': user.prenom,
                'employerLastName':user.nom,
                'employerEmail': user.email,
                'employerPhone': user.tel,
                'jobyerFirstName': jobyer.prenom,
                'jobyerLastName': jobyer.nom,
                'jobyerEmail': jobyer.email,
                'jobyerPhone': jobyer.tel,
                'data': btoa(unescape(encodeURIComponent(JSON.stringify(jsonData))))
            });

        var payload = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            'id': 201,
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

            this.http.post('http://ns389914.ovh.net:8080/vitonjobv1/api/callout', JSON.stringify(payload), {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    debugger;
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
        });
    }

    generateMission(idContract, offer){
        let calendar = offer.calendarData;
        if(calendar && calendar.length>0){
            for(let i = 0 ; i < calendar.length ; i++){
                let c = calendar[i];
                this.generateMissionHour(idContract, c);
            }
        }
    }

    generateMissionHour(idContract, c){
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
            "("+idContract+", " +
            "'"+this.helpers.dateToSqlTimestamp(d)+"', "+
            "'"+this.helpers.dateToSqlTimestamp(d)+"', " +
            ""+c.startHour+", " +
            ""+c.endHour+"," +
            "'NON', " +
            "'NON')";
        console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    console.log(JSON.stringify(data));
                    resolve(data);
                });
        });
    }
}

