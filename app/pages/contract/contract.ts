import {Storage, SqlStorage} from 'ionic-angular';
import {Page, NavController, NavParams, Loading,ActionSheet} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {ContractService} from '../../providers/contract-service/contract-service';
import {SmsService} from "../../providers/sms-service/sms-service";
import {UserService} from "../../providers/user-service/user-service";
import {PaymentPage} from "../payment/payment";
import {CivilityPage} from '../civility/civility';
import {JobAddressPage} from '../job-address/job-address';
import {PersonalAddressPage} from '../personal-address/personal-address';


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
    isIFrameHidden:boolean;
    
    
    constructor(public gc: GlobalConfigs, 
                public nav: NavController, 
                private navParams:NavParams,
                private contractService:ContractService,
                private userService:UserService,
                private smsService:SmsService ) {
        
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
        this.isIFrameHidden = true;
        this.jobyer = navParams.get('jobyer');
        this.jobyerFirstName = this.jobyer.prenom;
        this.jobyerLastName = this.jobyer.nom;
        
    }
    
    goToPayment() {
        this.nav.push(PaymentPage);
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
     * @description call yousign service and send sms to the jobyer
     */
    callYousign(){
        let loading = Loading.create({
            content: ` 
                <div>
                    <img src='img/loading.gif' />
                </div>
                `,
            spinner : 'hide'
        });
        this.nav.present(loading);
        
        this.contractService.callYousign(this.employer, this.jobyer, this.projectTarget).then((data) => {
            loading.dismiss();
            
            if (data == null || data.length == 0) {
                console.log("Yousign result is null");
                return;
            }
            
            var dataValue = data[0]['value'];
            var yousignData = JSON.parse(dataValue);
            console.log(yousignData);
            
            //get the link yousign of the contract for the employer
            var yousignEmployerLink = yousignData.iFrameURLs[0].iFrameURL;
            
            this.isIFrameHidden = false;
            
            //Create to Iframe to show the contract in the NavPage
            var iframe = document.createElement('iframe');
            iframe.frameBorder = "0";
            iframe.width = "100%";
            iframe.height = "100%";
            iframe.id = "youSign";
            iframe.style.overflow = "hidden";
            iframe.style.height = "100%";
            iframe.style.width = "100%";
            iframe.setAttribute("src", yousignEmployerLink);
            
            document.getElementById("iframPlaceHolder").appendChild(iframe);

            // get the yousign link of the contract and the phoneNumber of the jobyer
            var yousignJobyerLink = yousignData.iFrameURLs[1].iFrameURL;
            var jobyerPhoneNumber = this.jobyer.tel;
            
            // Send sms to jobyer
            this.smsService.sendSms(jobyerPhoneNumber, yousignJobyerLink).then((dataSms) => {
                console.log("The message was sent successfully");
            }).catch(function(err) {
                console.log(err);
            });
            
            
        }).catch(function(err) {
            console.log(err);
        });
    }
    
    
}
