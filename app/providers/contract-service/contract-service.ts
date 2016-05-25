import {Injectable} from 'angular2/core';
import {Configs} from '../../configurations/configs';
import {Http, Headers} from 'angular2/http';


/**
 * @author daoudi amine
 * @description services for contracts yousign
 * @module Contract
 */
@Injectable()
export class ContractService {
    data: any = null;
    configuration : any;

    
    constructor(public http: Http) {
        

    }


        /**
     * @description call yousign service
     * @param employer
     * @param jobyer
     * @return JSON results in form of youSign Object
         */
    callYousign(employer:any, jobyer:any,contract:any,projectTarget:string){
        
        //get configuration
        this.configuration = Configs.setConfigs(projectTarget);
        
        var jsonData = {
            "titre" : employer.titre,
            "prenom":  employer.prenom,
            "nom":  employer.nom,
            "entreprise" : employer.entreprises[0] == null ? "":employer.entreprises[0].name,
            "adresseEntreprise" : employer.entreprises[0] == null || employer.entreprises[0].adresses[0] == null ? "":employer.entreprises[0].adresses[0].fullAdress,
            "jobyerPrenom" : jobyer.prenom,
            "jobyerNom" : jobyer.nom,
            "nss" : jobyer.numSS,
            "dateNaissance" : jobyer.dateNaissance,
            "lieuNaissance" : jobyer.lieuNaissance, 
            "nationalite" : jobyer.nationalite, 
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
            "HeureDebutMission" : "22H",
            "HeureFinMission" : "23H"
        };

        var dataSign =JSON.stringify(
        {
            'class': 'com.vitonjob.yousign.callouts.YousignConfig',
            'employerFirstName': employer.prenom,
            'employerLastName':employer.nom,
            'employerEmail': employer.email,
            'employerPhone': employer.tel,
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
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
        });
  }

}

