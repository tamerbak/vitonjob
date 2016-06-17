import {Storage, SqlStorage} from 'ionic-angular';
import { NavController, NavParams, Loading,ActionSheet,Alert} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {ContractService} from '../../providers/contract-service/contract-service';
import {SmsService} from "../../providers/sms-service/sms-service";
import {UserService} from "../../providers/user-service/user-service";
import {PaymentPage} from "../payment/payment";
import {CivilityPage} from '../civility/civility';
import {JobAddressPage} from '../job-address/job-address';
import {PersonalAddressPage} from '../personal-address/personal-address';
import {MissionListPage} from '../mission-list/mission-list';
import {Component} from "@angular/core";
import {isUndefined} from "ionic-angular/util";
import {PushNotificationService} from "../../providers/push-notification-service/push-notification-service";


/**
 * @author daoudi amine
 * @description Generate contract informations and call yousign service
 * @module Contract
 */
@Component({
  templateUrl: 'build/pages/yousign/yousign.html',
    providers : [PushNotificationService]
})
export class YousignPage {
    
    projectTarget:string;
    isEmployer:boolean;
    themeColor:string;
    
    employer:any;
    currentUser:any;
    jobyer:any;
    yousignTitle:string;
    dataObject:any;
    contractData:any;

    currentOffer : any = null;
    pushNotificationService:PushNotificationService;
    
    constructor(public gc: GlobalConfigs, 
                public nav: NavController, 
                private navParams:NavParams,
                private contractService:ContractService,
                private userService:UserService,
                private smsService:SmsService,
                pushNotificationService : PushNotificationService ) {
        
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        
        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        
        // Set local variables and messages
        //get the currentEmployer & call youssign service
        this.pushNotificationService = pushNotificationService;
        userService.getCurrentUser().then(results =>{
            this.currentUser = JSON.parse(results);
            let currentEmployer = this.currentUser.employer;
            
            if(currentEmployer){
                this.employer = currentEmployer;
                this.callYousign();
            }
            console.log(currentEmployer);
        });
        
        this.themeColor = config.themeColor;
        this.yousignTitle = "Contrat de Mission";
        this.isEmployer = (this.projectTarget=='employer');
        this.jobyer = navParams.get('jobyer');
        this.contractData = navParams.get('contractData');
        if(navParams.get("currentOffer") && !isUndefined(navParams.get("currentOffer"))){
            this.currentOffer = navParams.get("currentOffer");
        }
    }
    
    goToPayment() {
        this.nav.push(PaymentPage);
    }
    
    goToMissionsList() {
        this.nav.push(MissionListPage);
    }
    
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
        
        this.contractService.callYousign(this.currentUser, this.employer, this.jobyer,this.contractData, this.projectTarget).then((data) => {
            loading.dismiss();
            debugger;
            console.log(JSON.stringify(this.employer));
            if (data == null || data.length == 0) {
                console.log("Yousign result is null");
                return;
            }
            
            let dataValue = data[0]['value'];
            let yousignData = JSON.parse(dataValue);
            console.log(yousignData);
            
            //change jobyer 'contacted' status
            this.jobyer.contacted = true;
            this.jobyer.date_invit = new Date();
            
            //get the link yousign of the contract for the employer
            let yousignEmployerLink = yousignData.iFrameURLs[0].iFrameURL;
            
            //Create to Iframe to show the contract in the NavPage
            let iframe = document.createElement('iframe');
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
            let yousignJobyerLink = yousignData.iFrameURLs[1].iFrameURL;
            let jobyerPhoneNumber = this.jobyer.tel;
            
            // Send sms to jobyer
            /*this.smsService.sendSms(jobyerPhoneNumber, 'Une demande de signature de contrat vous a été adressée : '+yousignJobyerLink).then((dataSms) => {
                 console.log("The message was sent successfully");
            }).catch(function(err) {
                 console.log(err);
            });*/
            // send notification to jobyer
            this.pushNotificationService.getTokenByJobyerId(this.jobyer.id).then(token => {
                var message = "Une demande de signature de contrat vous a été adressée : " + yousignJobyerLink;
                console.log('message notification : '+message);
                this.pushNotificationService.sendPushNotification(token, message).then(data => {
                    console.log('Notification sent : '+JSON.stringify(data));
                });
            });

            //save contract in Database
            this.contractService.getJobyerId(this.jobyer,this.projectTarget).then(
                (jobyerData) => {
                   this.contractService.saveContract(this.contractData,jobyerData.data[0].pk_user_jobyer,this.employer.entreprises[0].id,this.projectTarget).then(
                    (data) => {
                        if(this.currentOffer && this.currentOffer != null){
                            let idContract = 0;
                            if(data && data.data && data.data.length>0)
                                idContract = data.data[0].pk_user_contrat;
                            this.contractService.generateMission(idContract, this.currentOffer)
                        }


                    },
                    (err) => {
                        console.log(err);
                    })
                },
                (err) => {
                    console.log(err);
                })
        }).catch(function(err) {
            console.log(err);
        });
    }
    
    
}
