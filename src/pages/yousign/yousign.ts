import {NavController, NavParams, LoadingController} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {ContractService} from "../../providers/contract-service/contract-service";
import {SmsService} from "../../providers/sms-service/sms-service";
import {UserService} from "../../providers/user-service/user-service";
import {MissionListPage} from "../mission-list/mission-list";
import {MissionListJobyerPage} from "../mission-list-jobyer/mission-list-jobyer";
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
              pushNotificationService: PushNotificationService,
              public loading: LoadingController) {

    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);

    // Set local variables and messages
    //get the currentEmployer & call youssign service
    //this.pushNotificationService = pushNotificationService;
    this.themeColor = config.themeColor;
    this.yousignTitle = "Contrat de mission";
    this.isEmployer = (this.projectTarget == 'employer');
    this.jobyer = navParams.get('jobyer');
    this.contractData = navParams.get('contractData');
    if (navParams.get("currentOffer") && !isUndefined(navParams.get("currentOffer"))) {
      this.currentOffer = navParams.get("currentOffer");
    }
    this.notSigned = false;
  }

  ngOnInit(){
    this.userService.getCurrentUser(this.projectTarget).then(results => {
      this.currentUser = JSON.parse(results);
      let currentEmployer = this.currentUser.employer;
      if (currentEmployer) {
        this.employer = currentEmployer;
        this.setDocusignFrame();
      }
    });
  }

  setDocusignFrame(){
    //change jobyer 'contacted' status
    let link = "";
    if(this.isEmployer) {
      this.jobyer.contacted = true;
      this.jobyer.date_invit = new Date();
      link = this.contractData.partnerEmployerLink;
    }else{
      link = this.contractData.partnerJobyerLink;
    }

    let browser = new InAppBrowser(link, '_blank', 'hardwareback=no');
    browser.on('exit').subscribe(()=>{
      this.missionService.checkSignature(this.contractData.id, this.projectTarget).then((signed:boolean)=>{
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

  goToPayment() {
    this.nav.push(WalletCreatePage);
  }

  goToMissionsList() {
    if(this.isEmployer){
      this.nav.push(MissionListPage);
    }else{
      this.nav.push(MissionListJobyerPage);
    }
  }

  checkDocusignSignatureState(){

  }
}
