import {Page, NavController, NavParams, ActionSheet, Alert, Modal} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {UserService} from "../../providers/user-service/user-service";
import {CivilityPage} from '../civility/civility';
import {JobAddressPage} from '../job-address/job-address';
import {PersonalAddressPage} from '../personal-address/personal-address';
import {YousignPage} from '../yousign/yousign';
import {isUndefined} from "ionic-angular/util";
import {ModalOffersPage} from "../modal-offers/modal-offers";


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
    currentOffer:any;


    constructor(public gc: GlobalConfigs,
                public nav: NavController,
                private navParams:NavParams,
                private userService:UserService ) {

        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);


        this.themeColor = config.themeColor;
        this.contractTitle = "Contrat de Mission";
        this.isEmployer = (this.projectTarget=='employer');

        this.jobyer = navParams.get('jobyer');
        this.jobyerFirstName = this.jobyer.prenom;
        this.jobyerLastName = this.jobyer.nom;

        // initialize contract data
        this.contractData = {
            num:"",
            interim:"",
            missionStartDate: "",
            missionEndDate:"",
            trialPeriod: 5,
            termStartDate: "",
            termEndDate: "",
            motif: "",
            justification: "",
            qualification: "",
            characteristics:"",
            workTimeHours: 0,
            workTimeVariable: 0,
            workStartHour: "00:00",
            workEndHour:"00:00",
            workHourVariable:"",
            postRisks:"",
            medicalSurv:"",
            epi:"",
            baseSalary:0,
            MonthlyAverageDuration: "0",
            salaryNHours: "00,00€ B/H",
            salarySH35: "+00%",
            salarySH43: "+00%",
            restRight: "00%",
            interimAddress:"0",
            customer: "0",
            primes: "",
            headOffice : "",
            missionContent : "",
            category: "",
            sector : "",
        };


        // get the currentEmployer
        userService.getCurrentEmployer().then(results =>{
            var currentEmployer = JSON.parse(results);
            if(currentEmployer){
                this.employer = currentEmployer;
                this.society = this.employer.entreprises[0].name;
                var civility = this.employer.titre;
                this.employerFullName = civility + " " + this.employer.nom + " " + this.employer.prenom;
            }
            console.log(currentEmployer);
            //  check if there is a current offer
            if(navParams.get("currentOffer") && !isUndefined(navParams.get("currentOffer"))){
                this.currentOffer = navParams.get("currentOffer");
                this.initContract();
            } else {
                let m = new Modal(ModalOffersPage);
                m.onDismiss(data => {
                    this.currentOffer = data;
                    this.initContract();
                });
            }
        });


    }

    initContract(){
        console.log(this.currentOffer);
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
                    text: 'Annuler',
                    handler: data => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'OK',
                    handler: data => {
                        this.contractData[item] = data.value;
                    }
                }
            ]
        });

        this.nav.present(prompt);
    };

}
