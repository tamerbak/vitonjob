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
    callYousign(employer:any, jobyer:any,projectTarget:string){
        
        //get configuration
        this.configuration = Configs.setConfigs(projectTarget);
        
        
        var jsonData = {
            "titre" : "M.",
            "prenom": "Didier",
            "nom": "MONTEGUT",
            "entreprise" : "GROUPEMENT INTERACTIF DU DEGIVRAGE ET DU DENEIGEMENT (G.I.D)",
            "adresseEntreprise" : "Paris",
            "jobyerPrenom" : jobyer.prenom,
            "jobyerNom" : jobyer.nom,
            "nss" : jobyer.numSS,
            "dateNaissance" : jobyer.dateNaissance,
            "lieuNaissance" : jobyer.lieuNaissance, 
            "nationalite" : jobyer.nationalite, 
            "adresseDomicile" : jobyer.address,
            "dateDebutMission" : "23/01/2016",
            "dateFinMission" : "23/01/2016",
            "periodeEssai" : "3 jours",
            "dateDebutTerme" : "23/01/2016",
            "dateFinTerme" : "23/01/2016",
            "motifRecours" : "Remplacement Maladie",
            "justificationRecours" : "Mme Martin Monique",
            "qualification" : "Magasinier confirmé",
            "caracteristiquePoste" : "Gestion du stock pièces",
            "tempsTravail" : {
            "nombreHeures" : "35H Hebdo",
            "variables" : "Oui"
            },
            "horaireHabituel" : {
            "debut" : "22H00",
            "fin" : "23H00",
            "variables" : "Oui"
            },
            "posteARisque" : "Non",
            "surveillanceMedicale" : "Non",
            "epi" : "chaussures de sécurité",
            "salaireBase" : "13,00 euros B/H",
            "dureeMoyenneMensuelle" : "35H Hebdo",
            "salaireHN" : "115,00€ B/H",
            "salaireHS": {
            "35h" : "+25%",
            "43h" : "+50%"
            },
            "droitRepos" : "> 41H 50%",
            "adresseInterim" : "",
            "client" : "",
            "primeDiverses" : "néant",
            "SiegeSocial" : "31 rue du Moulin 31320 CASTANET TOLOSAN",
            "ContenuMission" : "d opérateur déneigement et dégivrage – coefficient 185",
            "categorie" : "ouvrier",
            "filiere" : "exploitation",
            "HeureDebutMission" : "22H",
            "HeureFinMission" : "23H"
        };

        var dataSign =JSON.stringify(
        {
            'class': 'com.vitonjob.yousign.callouts.YousignConfig',
            'employerFirstName': employer.nom,
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

