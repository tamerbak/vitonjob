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
import {MedecineService} from "../../providers/medecine-service/medecine-service";
import {ParametersService} from "../../providers/parameters-service/parameters-service";
import {ContractualisationPage} from "../contractualisation/contractualisation";


/**
 * @author daoudi amine
 * @description Generate contract informations and call yousign service
 * @module Contract
 */
@Component({
    templateUrl: 'build/pages/contract/contract.html',
    providers:[UserService, ContractService, MedecineService, ParametersService]
})
export class ContractPage {

    numContrat :string = '';
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
    rate : number=0.0;
    recours : any;
    justificatifs : any;

    dateFormat(d){
        let m = d.getMonth()+1;
        let da = d.getDate();
        let sd = d.getFullYear()+"-"+(m<10?'0':'')+m+"-"+(da<10?'0':'')+da;
        return sd;
    }

    constructor(public gc: GlobalConfigs,
                public nav: NavController,
                private navParams:NavParams,
                private userService:UserService,
                private contractService : ContractService,
                private medecineService : MedecineService,
                private service : ParametersService) {

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
        this.jobyerBirthDate = this.dateFormat(bd);
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
            numero:"",
            centreMedecineEntreprise:"",
            adresseCentreMedecineEntreprise:"",
            centreMedecineETT:"181 - CMIE",
            adresseCentreMedecineETT:"80 RUE DE CLICHY 75009 PARIS",
            contact:this.employerFullName,
            indemniteFinMission : "0.00",
            indemniteCongesPayes : "0.00",
            moyenAcces : "",
            numeroTitreTravail : "",
            debutTitreTravail : "",
            finTitreTravail : "",
            periodesNonTravaillees : "",
            debutSouplesse : "",
            finSouplesse : "",
            equipements : "",

            interim:"Groupe 3S",
            missionStartDate: this.getStartDate(),
            missionEndDate:this.getEndDate(),
            trialPeriod: 5,
            termStartDate: this.getEndDate(),
            termEndDate: this.getEndDate(),
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
            companyName : '',
            titreTransport : 'NON',
            zonesTitre : '',
            risques : '',
            elementsCotisation : 0.0,
            elementsNonCotisation : 10.0,
            titre : ''
        };

        /*this.contractService.getNumContract().then(data =>{
            
           if(data && data.length>0){
               this.numContrat = this.formatNumContrat(data[0].numct);
               this.contractData.num = this.numContrat;
           }

        });*/

        //  Load recours list
        this.contractService.loadRecoursList().then(data=>{
           this.recours = data;
        });

        // get the currentEmployer
        userService.getCurrentUser(this.projectTarget).then(results =>{
            this.currentUser = JSON.parse(results);

            if(this.currentUser){
                this.employer = this.currentUser.employer;
                this.companyName = this.employer.entreprises[0].nom;
                this.workAdress=this.employer.entreprises[0].workAdress.fullAdress;
                this.hqAdress=this.employer.entreprises[0].siegeAdress.fullAdress;
                let civility = this.currentUser.titre;
                this.employerFullName = civility + " " + this.currentUser.nom + " " + this.currentUser.prenom;
                this.medecineService.getMedecine(this.employer.entreprises[0].id).then(data=>{
                    if(data && data !=null){
                       //debugger;
                        this.contractData.centreMedecineEntreprise = data.libelle;
                        this.contractData.adresseCentreMedecineEntreprise = data.adresse+' '+data.code_postal;
                    }

                });
            }

            //  check if there is a current offer
            
            if(navParams.get("currentOffer") && !isUndefined(navParams.get("currentOffer"))){
                this.currentOffer = navParams.get("currentOffer");
                this.service.getRates().then(data =>{
                   //debugger;
                    for(let i = 0 ; i < data.length ; i++){
                        if(this.currentOffer.jobData.remuneration < data[i].taux_horaire){
                            this.rate = parseFloat(data[i].coefficient) * this.currentOffer.jobData.remuneration;
                            this.contractData.elementsCotisation = this.rate;
                            break;
                        }
                    }


                });
                this.initContract();
            }
        });


    }

    recoursSelected(evt){
        debugger;
        let selectedRecoursLib = evt;
        let id = 40;
        for(let i = 0 ; i < this.recours.length ; i++)
            if(this.recours[i].libelle == selectedRecoursLib){
                id = this.recours[i].id;
                break;
            }

        this.justificatifs = [];
        this.contractService.loadJustificationsList(id).then(data=>{
           this.justificatifs = data;
        });
    }

    formatNumContrat(num){
        let snum = num+"";
        let zeros = 10-snum.length;
        if(zeros < 0)
           return snum;

        for(let i = 0 ; i < zeros ; i++)
            snum = "0"+snum;

        return snum;
    }

    getStartDate(){

        let d = new Date();
        let m = d.getMonth()+1;
        let da = d.getDate();
        let sd = d.getFullYear()+"-"+(m<10?'0':'')+m+"-"+(da<10?'0':'')+da;

        if(!this.currentOffer || isUndefined(this.currentOffer))
            return sd;
        if(!this.currentOffer.calendarData || this.currentOffer.calendarData.length == 0)
            return sd;
        let minDate = this.currentOffer.calendarData[0].date;
        for(let i = 1 ; i<this.currentOffer.calendarData.length ; i++)
            if(this.currentOffer.calendarData[i].date < minDate)
                minDate = this.currentOffer.calendarData[i].date;
        d=new Date(minDate);
        m = d.getMonth()+1;
        da = d.getDate();
        sd = d.getFullYear()+"-"+(m<10?'0':'')+m+"-"+(da<10?'0':'')+da;
        return sd;
    }

    getEndDate(){
        let d = new Date();
        let m = d.getMonth()+1;
        let da = d.getDate();
        let sd = d.getFullYear()+"-"+(m<10?'0':'')+m+"-"+(da<10?'0':'')+da;
        if(!this.currentOffer || isUndefined(this.currentOffer))
            return sd;
        if(!this.currentOffer.calendarData || this.currentOffer.calendarData.length == 0)
            return sd;
        let maxDate = this.currentOffer.calendarData[0].date;

        for(let i = 1 ; i<this.currentOffer.calendarData.length ; i++)
            if(this.currentOffer.calendarData[i].date > maxDate)
                maxDate = this.currentOffer.calendarData[i].date;
        d=new Date(maxDate);
        m = d.getMonth()+1;
        da = d.getDate();
        sd = d.getFullYear()+"-"+(m<10?'0':'')+m+"-"+(da<10?'0':'')+da;
        return sd;
    }

    selectOffer(){
       //debugger;
        let m = new Modal(ModalOffersPage);
        m.onDismiss(data => {
            this.currentOffer = data;
            console.log(JSON.stringify(data));
           //debugger;
            this.service.getRates().then(data =>{
               //debugger;
                for(let i = 0 ; i < data.length ; i++){
                    if(this.currentOffer.jobData.remuneration < data[i].taux_horaire){
                        this.rate = parseFloat(data[i].coefficient) * this.currentOffer.jobData.remuneration;
                        this.contractData.elementsCotisation = this.rate;
                        break;
                    }
                }


            });
            this.initContract();
        });
        this.nav.present(m);
    }

    initContract(){
        this.contractData = {
            num:this.numContrat,
            centreMedecineEntreprise:"",
            adresseCentreMedecineEntreprise:"",
            centreMedecineETT:"181 - CMIE",
            adresseCentreMedecineETT:"80 RUE DE CLICHY 75009 PARIS",

            numero:"",
            contact:this.employerFullName,
            indemniteFinMission : "0.00",
            indemniteCongesPayes : "0.00",
            moyenAcces : "",
            numeroTitreTravail : "",
            debutTitreTravail : "",
            finTitreTravail : "",
            periodesNonTravaillees : "",
            debutSouplesse : "",
            finSouplesse : "",
            equipements : "",
            interim:"Groupe 3S",
            missionStartDate: this.getStartDate(),
            missionEndDate:this.getEndDate(),
            trialPeriod: 5,
            termStartDate: this.getEndDate(),
            termEndDate: this.getEndDate(),
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
            baseSalary: this.parseNumber(this.currentOffer.jobData.remuneration).toFixed(2),
            MonthlyAverageDuration: "0",
            salaryNHours: this.parseNumber(this.currentOffer.jobData.remuneration).toFixed(2)+" € B/H",
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
            jobyerBirthDate : this.jobyerBirthDate,
            titreTransport : 'NON',
            zonesTitre : '',
            risques : '',
            elementsCotisation : this.rate,
            elementsNonCotisation : 10.0,
            titre : this.currentOffer.title
        };
        console.log(JSON.stringify(this.contractData));
       //debugger;
        this.medecineService.getMedecine(this.employer.entreprises[0].id).then(data=>{
            if(data && data !=null){
               //debugger;
                this.contractData.centreMedecineEntreprise = data.libelle;
                this.contractData.adresseCentreMedecineEntreprise = data.adresse+' '+data.code_postal;
            }

        });
    }

    parseNumber(str){
        try {
            return parseFloat(str);
        }
        catch(err) {
            return 0.0;
        }
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
       //debugger;
        this.contractService.getNumContract().then(data =>{
            
            if(data && data.length>0){
                this.numContrat = this.formatNumContrat(data[0].numct);
                this.contractData.num = this.numContrat;
                this.contractData.numero = this.numContrat;
                this.contractData.adresseInterim = this.workAdress;
            }
            this.nav.push(YousignPage,{ //ContractualisationPage
                jobyer:this.jobyer,
                contractData:this.contractData,
                currentOffer:this.currentOffer
            });
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
