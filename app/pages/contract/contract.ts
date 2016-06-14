import { NavController, NavParams, ActionSheet, Alert, Modal} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {UserService} from "../../providers/user-service/user-service";
import {CivilityPage} from '../civility/civility';
import {JobAddressPage} from '../job-address/job-address';
import {PersonalAddressPage} from '../personal-address/personal-address';
import {YousignPage} from '../yousign/yousign';
import {isUndefined} from "ionic-angular/util";
import {ModalOffersPage} from "../modal-offers/modal-offers";
import {ContractService} from "../../providers/contract-service/contract-service";
import {Component} from "@angular/core";


/**
 * @author daoudi amine
 * @description Generate contract informations and call yousign service
 * @module Contract
 */
@Component({
    templateUrl: 'build/pages/contract/contract.html',
    providers:[UserService][ContractService]
})
export class ContractPage {

    projectTarget:string;
    isEmployer:boolean;
    themeColor:string;

    employer:any;
    jobyer:any;
    companyName:string;
    currentUser:any;
    employerFullName:string;
    jobyerFirstName:string;
    jobyerLastName:string;
    contractTitle:string;
    dataObject:any;
    contractData:any;
    currentOffer:any;
    workAdress:string;
    jobyerBirthDate:string;
    hqAdress:string;

    constructor(public gc: GlobalConfigs,
                public nav: NavController,
                private navParams:NavParams,
                private userService:UserService,
                private contractService : ContractService) {

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
        let bd = new Date(this.jobyer.dateNaissance);
        this.jobyerBirthDate = bd.getDate()+'/'+(bd.getMonth()+1)+'/'+bd.getFullYear();
        this.jobyer.id = 0;
        this.jobyer.numSS = '';
        this.jobyer.nationaliteLibelle = '';

        this.contractService.getJobyerComplementData(this.jobyer, this.projectTarget).then((data)=>{
            if(data && !isUndefined(data)){
                let datum = data[0];
                this.jobyer.id = datum.id;
                this.jobyer.numSS = datum.numss;
                this.jobyer.nationaliteLibelle = datum.nationalite;
            }
        });

        // initialize contract data
        this.contractData = {
            num:"",
            interim:"Groupe 3S",
            missionStartDate: this.getStartDate(),
            missionEndDate:this.getEndDate(),
            trialPeriod: 5,
            termStartDate: "",
            termEndDate: "",
            motif: "",
            justification: "",
            qualification: "",
            characteristics:"",
            workTimeHours: 0,
            workTimeVariable: 0,
            usualWorkTimeHours : "8H00/17H00 variables",
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
            interimAddress:"",
            customer: "",
            primes: "",
            headOffice : "",
            missionContent : "",
            category: "",
            sector : "",
            companyName : ''
        };


        // get the currentEmployer
        userService.getCurrentUser().then(results =>{
            this.currentUser = JSON.parse(results);

            if(this.currentUser){
                this.employer = this.currentUser.employer;
                this.companyName = this.employer.entreprises[0].nom;
                this.workAdress=this.employer.entreprises[0].workAdress.fullAdress;
                this.hqAdress=this.employer.entreprises[0].siegeAdress.fullAdress;
                let civility = this.currentUser.titre;
                this.employerFullName = civility + " " + this.currentUser.nom + " " + this.currentUser.prenom;
                
            }

            //  check if there is a current offer
            if(navParams.get("currentOffer") && !isUndefined(navParams.get("currentOffer"))){
                this.currentOffer = navParams.get("currentOffer");
                this.initContract();
            }
        });


    }

    getStartDate(){
        let d = new Date();
        let sd =  d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
        if(!this.currentOffer || isUndefined(this.currentOffer))
            return sd;
        if(!this.currentOffer.calendarData || this.currentOffer.calendarData.length == 0)
            return sd;
        let minDate = this.currentOffer.calendarData[0].date;
        for(let i = 1 ; i<this.currentOffer.calendarData.length ; i++)
            if(this.currentOffer.calendarData[i].date < minDate)
                minDate = this.currentOffer.calendarData[i].date;
        d=new Date(minDate);
        sd =  d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
        return sd;
    }

    getEndDate(){
        let d = new Date();
        let sd =  d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
        if(!this.currentOffer || isUndefined(this.currentOffer))
            return sd;
        if(!this.currentOffer.calendarData || this.currentOffer.calendarData.length == 0)
            return sd;
        let maxDate = this.currentOffer.calendarData[0].date;

        for(let i = 1 ; i<this.currentOffer.calendarData.length ; i++)
            if(this.currentOffer.calendarData[i].date > maxDate)
                maxDate = this.currentOffer.calendarData[i].date;
        d=new Date(maxDate);
        sd =  d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
        return sd;
    }

    selectOffer(){
        let m = new Modal(ModalOffersPage);
        m.onDismiss(data => {
            this.currentOffer = data;
            this.initContract();
        });
        this.nav.present(m);
    }

    initContract(){
        this.contractData = {
            num:"",
            interim:"Groupe 3S",
            missionStartDate: this.getStartDate(),
            missionEndDate:this.getEndDate(),
            trialPeriod: 5,
            termStartDate: "",
            termEndDate: "",
            motif: "",
            justification: "",
            qualification: this.currentOffer.title,
            characteristics:"",
            workTimeHours: this.calculateOfferHours(),
            workTimeVariable: 0,
            usualWorkTimeHours : "8H00/17H00 variables",
            workStartHour: "00:00",
            workEndHour:"00:00",
            workHourVariable:"",
            postRisks:"",
            medicalSurv:"",
            epi:"",
            baseSalary: (this.currentOffer.jobData.remuneration).toFixed(2),
            MonthlyAverageDuration: "0",
            salaryNHours: (this.currentOffer.jobData.remuneration).toFixed(2)+" € B/H",
            salarySH35: "+00%",
            salarySH43: "+00%",
            restRight: "00%",
            interimAddress:"",
            customer: "",
            primes: "",
            headOffice : this.hqAdress,
            missionContent : "",
            category: this.currentOffer.jobData.job,
            sector : this.currentOffer.jobData.sector,
            companyName : this.companyName,
            workAdress : this.workAdress,
            jobyerBirthDate : this.jobyerBirthDate
        };
    }

    calculateOfferHours(){
        if(!this.currentOffer || isUndefined(this.currentOffer))
            return 0;
        let h = 0;
        for(let i = 0 ; i < this.currentOffer.calendarData.length ; i++){
            let calendarEntry = this.currentOffer.calendarData[i];
            h = h + Math.abs(calendarEntry.endHour - calendarEntry.startHour)/60;
        }
        return h.toFixed(0);
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

}
