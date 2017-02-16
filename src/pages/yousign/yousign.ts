import {NavController, NavParams, LoadingController} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {ContractService} from "../../providers/contract-service/contract-service";
import {SmsService} from "../../providers/sms-service/sms-service";
import {UserService} from "../../providers/user-service/user-service";
import {MissionListPage} from "../mission-list/mission-list";
import {Component} from "@angular/core";
import {isUndefined} from "../../../node_modules/ionic-angular/util/util";
import {PushNotificationService} from "../../providers/push-notification-service/push-notification-service";
import {WalletCreatePage} from "../wallet-create/wallet-create";
import {FinanceService} from "../../providers/finance-service/finance-service";
import {InAppBrowser} from "ionic-native";
import {MissionService} from "../../providers/mission-service/mission-service";


/**
 * @author daoudi amine
 * @description Generate contract informations and call yousign service
 * @module Contract
 */
@Component({
  templateUrl: 'yousign.html'
})
export class YousignPage {

  public projectTarget: string;
  public isEmployer: boolean;
  public themeColor: string;

  public employer: any;
  public currentUser: any;
  public jobyer: any;
  public yousignTitle: string;
  //public dataObject: any;
  public contractData: any;

  public currentOffer: any = null;
  public pushNotificationService: PushNotificationService;
  public notSigned : boolean;


  constructor(public gc: GlobalConfigs,
              public nav: NavController,
              private navParams: NavParams,
              private contractService: ContractService,
              private userService: UserService,
              private smsService: SmsService,
              private financeService: FinanceService,
              private missionService: MissionService,
              pushNotificationService: PushNotificationService, public loading: LoadingController) {

    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);

    // Set local variables and messages
    //get the currentEmployer & call youssign service
    this.pushNotificationService = pushNotificationService;
    userService.getCurrentUser(this.projectTarget).then(results => {
      this.currentUser = JSON.parse(results);
      let currentEmployer = this.currentUser.employer;

      if (currentEmployer) {
        this.employer = currentEmployer;
        this.callYousign();
      }
      console.log(currentEmployer);
    });

    this.themeColor = config.themeColor;
    this.yousignTitle = "Contrat de Mission";
    this.isEmployer = (this.projectTarget == 'employer');
    this.jobyer = navParams.get('jobyer');
    this.contractData = navParams.get('contractData');
    if (navParams.get("currentOffer") && !isUndefined(navParams.get("currentOffer"))) {
      this.currentOffer = navParams.get("currentOffer");
    }
    this.notSigned = false;
  }

  goToPayment() {
    this.nav.push(WalletCreatePage);
  }

  goToMissionsList() {
    this.nav.push(MissionListPage);
  }

  /**
   * @author daoudi amine
   * @description call yousign service and send sms to the jobyer
   */
  callYousign() {
      let loading = this.loading.create({content:"Merci de patienter..."});
    loading.present();
    this.financeService.loadQuote(this.currentOffer.idOffer, this.contractData.baseSalary).then((data: any) => {
      //  Now Let us calculate contract values
      this.financeService.loadPrevQuote(this.currentOffer.idOffer).then((results: any) => {
        let lines = results.lignes;
        let cfix = 0;
        let cotis = 0;
        for (let i = 0; i < lines.length; i++) {
          let l = lines[i];
          if (l.unite == 'IJ' || l.unite == 'IH' || l.unite == 'I')
            cfix += l.valeur;
          else if (l.unite == 'H' && l.nbUnite > 0) {
            cotis += l.valeur / l.nbUnite;
          }
        }
        this.contractData.elementsCotisation = cotis;
        this.contractData.elementsNonCotisation = cfix;
        this.contractService.callYousign(this.currentUser, this.employer, this.jobyer, this.contractData, this.projectTarget, this.currentOffer, data.quoteId).then((data: any) => {
          loading.dismiss();
          console.clear();
          console.log(data);

          console.log(JSON.stringify(this.employer));
          if (data == null || data.length == 0) {
            console.log("Yousign result is null");
            return;
          }

          let dataValue = data;//[0]['value'];
          let yousignData = dataValue;
          console.log(yousignData);

          //change jobyer 'contacted' status
          this.jobyer.contacted = true;
          this.jobyer.date_invit = new Date();

          //get the link yousign of the contract for the employer
          let yousignEmployerLink = yousignData.Employeur.url;


          // get the yousign link of the contract and the phoneNumber of the jobyer
          let yousignJobyerLink = yousignData.Jobyer.url;
          let jobyerPhoneNumber = this.jobyer.tel;

          this.contractData.demandeJobyer = yousignData.Jobyer.idContrat;
          this.contractData.demandeEmployer = yousignData.Employeur.idContrat;

          // TEL23082016 : Navigate to credit card page directly :

          // Send sms to jobyer

          this.smsService.sendSms(jobyerPhoneNumber, 'Une demande de signature de contrat vous a été adressée. Contrat numéro : ' + this.contractData.numero).then((dataSms) => {

            console.log("The message was sent successfully");
          }).catch(function (err) {

            console.log(err);
          });
          // send notification to jobyer
          console.log('jobyer id : ' + this.jobyer.id);


          //save contract in Database
          this.contractService.getJobyerId(this.jobyer, this.projectTarget).then(
            (jobyerData: any) => {
              this.contractService.saveContract(this.contractData, jobyerData.data[0].pk_user_jobyer, this.employer.entreprises[0].id, this.projectTarget, yousignJobyerLink, yousignEmployerLink, this.currentUser.id).then(
                (data: any) => {
                  if (this.currentOffer && this.currentOffer != null) {
                    let idContract = 0;
                    if (data && data.data && data.data.length > 0)
                      idContract = data.data[0].pk_user_contrat;
                    let contract = {
                      pk_user_contrat: idContract
                    };
                    this.contractService.setOffer(idContract, this.currentOffer.idOffer);
                    this.pushNotificationService.getToken(this.jobyer.id, "toJobyer").then((token: any) => {
                      if (token.data && token.data.length > 0) {
                        let tk = token;
                        var message = "Une demande de signature de contrat vous a été adressée";
                        console.log('message notification : ' + message);
                        console.log('token : ' + tk);
                        this.pushNotificationService.sendPushNotification(tk, message, contract, "MissionDetailsPage").then((data: any) => {
                          console.log('Notification sent : ' + JSON.stringify(data));
                        });
                      }

                    });
                    this.contractService.generateMission(idContract, this.currentOffer);

                    let browser = new InAppBrowser(yousignEmployerLink, '_blank');
                    browser.on('exit').subscribe(()=>{
                      this.missionService.checkSignature(idContract, 'employer').then((signed:boolean)=>{
                        if(signed)
                          this.goToPayment();
                        else {
                          this.notSigned = true;
                        }
                      });
                    }, (err)=>{
                      console.log(err);
                      this.notSigned = true;
                    });
                  }
                },
                (err) => {
                  console.log(err);
                })
            },
            (err) => {
              console.log(err);
            });
        }).catch(function (err) {
          console.log(err);
        });
      });


    });

  }


}
