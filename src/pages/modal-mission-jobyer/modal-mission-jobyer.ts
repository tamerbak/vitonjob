import {
  NavController,
  NavParams,
  ActionSheetController,
  LoadingController,
  Platform,
  ModalController,
  PickerController,
  AlertController,
  ToastController, ViewController
} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {MissionService} from "../../providers/mission-service/mission-service";
import {PushNotificationService} from "../../providers/push-notification-service/push-notification-service";
import {Component} from "@angular/core";
import {GlobalService} from "../../providers/global-service/global-service";
import {NotationService} from "../../providers/notation-service/notation-service";
import {FinanceService} from "../../providers/finance-service/finance-service";
import {Storage} from "@ionic/storage";
import {isUndefined} from "ionic-angular/util/util";
import {DatePicker} from "ionic-native";
import {Utils} from "../../utils/utils";
import {DateUtils} from "../../utils/date-utils";
import {HeureMission} from "../../dto/heureMission";

@Component({
  templateUrl: 'modal-mission-jobyer.html',
  selector: 'modal-mission-jobyer'
})
export class ModalMissionJobyerPage {
  public projectTarget: string;
  public isEmployer: boolean;
  public themeColor: string;

  public contract: any;

  //records of user_heure_mission of a contract
  public missionHours = [];
  public initialMissionHours = [];

  //two dimensional array of pauses of mission days
  public isNewMission = true;
  //public contractSigned = false;

  public invoiceReady: boolean = false;

  public rating: number = 0;
  public starsText: string = '';

  public optionMission: string;
  public backgroundImage: string;

  public enterpriseName: string = "--";
  public jobyerName: string = "--";
  public currentUserVar: string;
  public currentUser: any;

  /*
   *   Invoice management
   */
  public invoiceId: number;
  public isInvoiceAvailable: boolean = false;
  public isReleveAvailable: boolean = false;

  /*
   * PREREQUIS
   */
  public prerequisObligatoires: any = [];

  public isSignContractClicked: boolean = false;
  public missionPauses = [];
  public hasJobyerSigned: boolean;

  public isPointing: boolean;
  public canPoint: boolean;
  public isEmpReleveGenerated: boolean;

  public day: HeureMission;
  public isStart: boolean;

  constructor(private platform: Platform,
              public gc: GlobalConfigs,
              public nav: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController,
              private missionService: MissionService,
              private globalService: GlobalService,
              private pushNotificationService: PushNotificationService,
              private notationService: NotationService,
              private financeService: FinanceService,
              public alert: AlertController,
              public loading: LoadingController,
              public toast: ToastController,
              public actionSheet: ActionSheetController,
              public picker: PickerController,
              public modal: ModalController, public db: Storage) {

    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);

    // Set store variables and messages
    this.themeColor = config.themeColor;
    this.isEmployer = (this.projectTarget == 'employer');
    this.backgroundImage = config.backgroundImage;
    this.currentUserVar = config.currentUserVar;

    this.contract = navParams.get('contract');
    this.day = navParams.get('day');
    this.isStart = navParams.get('isStart');

    this.refreshGraphicalData();

    this.db.get(this.currentUserVar).then((value) => {
      if (!Utils.isEmpty(value)) {
        this.currentUser = JSON.parse(value);
      }
    });
  }


  sendPushNotification(message, objectifNotif, who) {
    let id = (who == "toJobyer" ? this.contract.fk_user_jobyer : this.contract.fk_user_entreprise);
    this.pushNotificationService.getToken(id, who).then(token => {
      this.pushNotificationService.sendPushNotification(token, message, this.contract, objectifNotif).then((data: any) => {
        this.globalService.showAlertValidation("Vit-On-Job", "Notification envoyée.");
      });
    });
  }

  sendInfoBySMS(message, who) {
    if (who == "toJobyer") {
      this.missionService.getTelByJobyer(this.contract.fk_user_jobyer).then((data: {data: Array<any>}) => {
        this.missionService.sendInfoBySMS(data.data[0]["telephone"], message);
      });
    } else {
      this.missionService.getTelByEmployer(this.contract.fk_user_entreprise).then((data: {data: Array<any>}) => {
        this.missionService.sendInfoBySMS(data.data[0]["telephone"], message);
      });
    }
  }

  presentToast(message: string, duration: number) {
    let toast = this.toast.create({
      message: message,
      duration: duration * 1000
    });
    toast.present();
  }

  modifyPointedHour(day, isStart){
    DatePicker.show({
      date: new Date(),
      mode: 'datetime',
      is24Hour: true,
      doneButtonLabel: 'Ok', cancelButtonLabel: 'Annuler', locale: 'fr_FR'
    }).then(newHour => {
          console.log("Got date: ", newHour);
         //debugger;
          if(Utils.isEmpty(newHour)){
            return;
          }
          //let myNewHour: number = newHour.getHours() * 60 + newHour.getMinutes();
          let myNewHour = DateUtils.sqlfyWithHours(new Date(newHour));
          this.missionService.saveModifiedPointing(day.id, myNewHour, true, isStart).then((data: any) => {
            if(data && data.status == "success"){
              if(isStart){
                this.day.date_debut_pointe_modifie = myNewHour;
              }else{
                this.day.date_fin_pointe_modifie = myNewHour;
              }
            }
          })
        },
        err => console.log('Error occurred while getting date: ', err));
  }

  pointHour(day, isStart) {
    day.pointe = DateUtils.sqlfyWithHours(new Date());

    this.missionService.savePointing(day, isStart, false).then((data: any) => {
      if(data && data.status == "success") {
        if(isStart){
          this.day.date_debut_pointe = day.pointe;
        }else{
          this.day.date_fin_pointe = day.pointe;
        }

        let msg = "Contrat n°" + this.contract.numero + " : " + this.currentUser.titre + " " + this.currentUser.prenom + " " + this.currentUser.nom + " a pointé l'heure de " + (isStart ? "début " : "fin ") + "de travail de la journée du " + DateUtils.simpleDateFormat(new Date(day.jour_debut)) + ". Vous pouvez à présent valider son horaire.";
        let who = "toEmployer";
        this.sendInfoBySMS(msg, who);
      }
    });
  }

  setColorForPointedHours(day: HeureMission, isStart){
    if(isStart){
      if(!this.isEmpty(day.date_debut_pointe_modifie)){
        return 'primary';
      }else{
        return 'dark';
      }
    }else {
      if (!this.isEmpty(day.date_fin_pointe_modifie)) {
        return 'primary';
      } else {
        return 'dark';
      }
    }
  }

  setColorForValidatedHours(day: HeureMission, isStart){
    if(isStart){
      //si l'meployeur a refusé l'heure pointé/modifié par le jobyer
      if(day.is_heure_debut_corrigee.toUpperCase() == 'OUI'){
        return "danger";
      }else{
        //si l'employeur a accepté l'heure pointé/modifié par le jobyer
        if(day.is_heure_debut_corrigee.toUpperCase() == 'NON'){
          if(!this.isEmpty(day.date_debut_pointe_modifie)){
            return 'orange';
          }else{
            return 'secondary';
          }
        }else{
          //si l'employeur n'a pas encore donné son avis sur l'heure pointé/modifié par le jobyer
          return 'dark';
        }
      }
    }else{
      //si l'meployeur a refusé l'heure pointé/modifié par le jobyer
      if(day.is_heure_fin_corrigee.toUpperCase() == 'OUI'){
        return "danger";
      }else{
        //si l'employeur a accepté l'heure pointé/modifié par le jobyer
        if(day.is_heure_fin_corrigee.toUpperCase() == 'NON'){
          if(!this.isEmpty(day.date_fin_pointe_modifie)){
            return 'orange';
          }else{
            return 'secondary';
          }
        }else{
          //si l'employeur n'a pas encore donné son avis sur l'heure pointé/modifié par le jobyer
          return 'dark';
        }
      }
    }
  }

  refreshGraphicalData() {
    this.hasJobyerSigned = (this.contract.signature_jobyer.toUpperCase() == "OUI");
    this.isPointing = (this.contract.option_mission != 1);
    this.canPoint = (!this.isEmployer && this.hasJobyerSigned && this.isPointing);
    this.isEmpReleveGenerated = (this.contract.releve_employeur.toUpperCase() == 'OUI');

  }

  /**
   * @description : Closing the modal page :
   */
  closeModal() {
    this.viewCtrl.dismiss();
  }

  upperCase(str) {
    if (str == null || !str || isUndefined(str))
      return '';
    return str.toUpperCase();
  }

  isEmpty(str) {
    return Utils.isEmpty(str);
  }
}