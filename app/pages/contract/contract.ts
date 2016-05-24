import {Storage, SqlStorage} from 'ionic-angular';
import {Page, NavController, NavParams, Loading,ActionSheet,Alert} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {ContractService} from '../../providers/contract-service/contract-service';
import {SmsService} from "../../providers/sms-service/sms-service";
import {UserService} from "../../providers/user-service/user-service";
import {CivilityPage} from '../civility/civility';
import {JobAddressPage} from '../job-address/job-address';
import {PersonalAddressPage} from '../personal-address/personal-address';
import {YousignPage} from '../yousign/yousign';


/**
 * @author daoudi amine
 * @description Generate contract informations and call yousign service
 * @module Contract
 */
@Page({
  templateUrl: 'build/pages/contract/contract.html',
})
export class ContractPage {
    
    projectTarget:string;
    isEmployer:boolean;
    themeColor:string;

    employer:any;
    jobyer:any;
    society:string;
    employerFullName:string;
    jobyerFirstName:string;
    jobyerLastName:string;
    contractTitle:string;
    dataObject:any;
    contractData:any;
    
    
    constructor(public gc: GlobalConfigs, 
                public nav: NavController, 
                private navParams:NavParams,
                private userService:UserService ) {
        
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        
        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        
        // Set local variables and messages
        //get the currentEmployer
        userService.getCurrentEmployer().then(results =>{
            var currentEmployer = JSON.parse(results);
            if(currentEmployer){
                this.employer = currentEmployer;
                this.society = this.employer.entreprises[0].name;
                var civility = this.employer.titre;
                this.employerFullName = civility + " " + this.employer.nom + " " + this.employer.prenom;
            }
            console.log(currentEmployer);
        });
        
        this.themeColor = config.themeColor;
        this.contractTitle = "Contrat de Mission";
        this.isEmployer = (this.projectTarget=='employer');

        this.jobyer = navParams.get('jobyer');
        this.jobyerFirstName = this.jobyer.prenom;
        this.jobyerLastName = this.jobyer.nom;
        
        //to verify
        this.contractData = {
            num:"VB0902005",
            interim:"Test1",
            missionStartDate: "01/02/2009",
            missionEndDate:"30/04/2009",
            trialPeriod: 5,
            termStartDate: "20/04/2009",
            termEndDate: "10/05/2009",
            motif: "Remplacement Maladie",
            justification: "Mme MARTIN Monique",
            qualification: "Magasinier qualifie",
            characteristics:"Gestion du stock pièces",
            workTimeHours: 30,
            workTimeVariable: 35,
            workStartHour: "08:00",
            workEndHour:"17:00",
            workHourVariable:"???",
            postRisks:"non",
            medicalSurv:"non",
            epi:"chaussures de sécurité",
            baseSalary:"15,00€ B/H",
            MonthlyAverageDuration: "35h",
            salaryNHours: "15,00€ B/H",
            salarySH35: "+25%",
            salarySH43: "+50%",
            restRight: "50%",
            interimAddress:"ASMIS 77 RUE DEBAUSSAUX 80000 AMIENS",
            customer: "ASMIS",
            primes: "néant",
        };
    }
    
    goToYousignPage() {
        this.nav.push(YousignPage,{
            jobyer:this.jobyer,
            contractData:this.contractData
        });
    }
    
    /**
     * @author daoudi amine
     * @description show the menu to edit employer's informations
     */
    showMenuToEditContract() {
        let actionSheet = ActionSheet.create({
            title: 'Editer le contrat',
            buttons: [
                {
                    text: 'Civilité',
                    icon: 'md-person',
                    handler: () => {
                        this.nav.push(CivilityPage);
                    }
                },{
                    text: 'Siège social',
                    icon: 'md-locate',
                    handler: () => {
                        this.nav.push(JobAddressPage);
                    }
                },{
                    text: 'Adresse de travail',
                    icon: 'md-locate',
                    handler: () => {
                        this.nav.push(PersonalAddressPage);
                    }
                },{
                    text: 'Annuler',
                    role: 'cancel',
                    icon: 'md-close',
                    handler: () => {

                    }
                }
            ]
        });
        
        this.nav.present(actionSheet);
    };
    
    /**
     * @author daoudi amine
     * @param item name of the param
     * @title description of the param 
     * @description change a contractData parametre
     */
    changeContractData(item,title) {
        
        
        let prompt = Alert.create({
            title: title,
            message: "Veuillez saisir la nouvelle valeur",
            inputs: [
                {
                    name: 'value',
                },
            ],
            buttons: [
                {
                    text: 'Cancel',
                    handler: data => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Save',
                    handler: data => {
                        this.contractData[item] = data.value;
                    }
                }
            ]
        });
        
        this.nav.present(prompt);
    };
    
}
