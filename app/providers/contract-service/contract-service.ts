import {Injectable} from '@angular/core';
import {Configs} from '../../configurations/configs';
import {Http, Headers} from '@angular/http';
import {Helpers} from '../../providers/helpers.service.ts';


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
    getContracts(emplyerEntrpriseId:number,projectTarget:string){
		//  Init project parameters
		this.configuration = Configs.setConfigs(projectTarget);
        var sql = "SELECT pk_user_contrat,* FROM user_contrat where fk_user_entreprise ='"+emplyerEntrpriseId+"'";
                  
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
    saveContract(contract:any,jobyerId:Number,employerEntrepriseId:Number,projectTarget:string){
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
                  " fk_user_jobyer"+
                  ")"+
                  " VALUES ("
                  +"'"+ this.helpers.dateStrToSqlTimestamp(contract.missionStartDate) +"',"
                  +"'"+ this.helpers.dateStrToSqlTimestamp(contract.missionEndDate) +"',"
                  +"'"+ this.helpers.dateStrToSqlTimestamp(contract.termStartDate) +"',"
                  +"'"+ this.helpers.dateStrToSqlTimestamp(contract.termEndDate) +"',"
                  +"'"+ this.helpers.dateToSqlTimestamp(new Date())+"',"
                  +"'"+ this.helpers.timeStrToMinutes(contract.workStartHour) +"',"
                  +"'"+ this.helpers.timeStrToMinutes(contract.workEndHour) +"',"
                  +"'"+ contract.motif +"',"
                  +"'"+ contract.num +"',"
                  +"'"+ contract.trialPeriod +"',"
                  +"'"+ contract.baseSalary +"',"
                  +"'"+ contract.workTimeHours +"',"
                  +"'"+ employerEntrepriseId +"',"
                  +"'"+ jobyerId +"'"
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
    
    
    
    
    /**
     * @description call yousign service
     * @param employer
     * @param jobyer
     * @return JSON results in form of youSign Object
    */
    callYousign(user : any, employer:any, jobyer:any,contract:any,projectTarget:string){
        
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
            "dateNaissance" : contract.jobyerBirthDate,
            "lieuNaissance" : jobyer.lieuNaissance, 
            "nationalite" : jobyer.nationaliteLibelle,
            "adresseDomicile" : jobyer.address,
            "dateDebutMission" : contract.missionStartDate,
            "dateFinMission" : contract.missionEndDate,
            "periodeEssai" :  contract.trialPeriod == null ? "":( contract.trialPeriod == 1 ? "1 jour": (contract.trialPeriod + " jours")),
            "dateDebutTerme" : contract.termStartDate,
            "dateFinTerme" : contract.termEndDate,
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
        };

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
            'id': 93,
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

}

