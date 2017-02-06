import {
  NavController,
  NavParams,
  ActionSheetController,
  LoadingController,
  Platform,
  ModalController,
  PickerController,
  AlertController,
  ToastController
} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {MissionService} from "../../providers/mission-service/mission-service";
import {PushNotificationService} from "../../providers/push-notification-service/push-notification-service";
import {Component, NgZone} from "@angular/core";
import {GlobalService} from "../../providers/global-service/global-service";
import {NotationService} from "../../providers/notation-service/notation-service";
import {ModalTrackMissionPage} from "../modal-track-mission/modal-track-mission";
import {FinanceService} from "../../providers/finance-service/finance-service";
import {MissionEndInvoicePage} from "../mission-end-invoice/mission-end-invoice";
import {MissionEndRelevePage} from "../mission-end-releve/mission-end-releve";
import {PickerColumnOption} from "ionic-angular/components/picker/picker-options";
import {Storage} from "@ionic/storage";
import {isUndefined} from "ionic-angular/util/util";
import {DatePicker, InAppBrowser} from "ionic-native";
import {Utils} from "../../utils/utils";

//declare let cordova;

/*
 Generated class for the MissionDetailsPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  templateUrl: 'mission-details.html',
  selector: 'mission-details'
})
export class MissionDetailsPage {
  public projectTarget: string;
  public isEmployer: boolean;
  public themeColor: string;

  public contract: any;
  public missionDetailsTitle: string;

  //public missionIndex: number;
  //public missionDayIndex: number;
  //public missionTimeIsFirst: boolean;
  //public missionTimeIsStart: boolean;

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

  constructor(private platform: Platform,
              public gc: GlobalConfigs,
              public nav: NavController,
              public navParams: NavParams,
              private missionService: MissionService,
              private globalService: GlobalService,
              private pushNotificationService: PushNotificationService,
              private notationService: NotationService,
              private financeService: FinanceService,
              private zone: NgZone,
              public alert: AlertController,
              public loading: LoadingController,
              public toast: ToastController,
              public actionSheet: ActionSheetController,
              public picker: PickerController,
              public modal: ModalController, public db: Storage) {

    this.platform = platform;
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);

    // Set store variables and messages
    this.themeColor = config.themeColor;
    this.missionDetailsTitle = "Gestion de la mission";
    this.isEmployer = (this.projectTarget == 'employer');
    this.backgroundImage = config.backgroundImage;
    this.currentUserVar = config.currentUserVar;
    //get missions
    this.contract = navParams.get('contract');
    console.log(JSON.stringify(this.contract));

    //verify if the mission has already pauses
    this.isNewMission = (this.contract.vu.toUpperCase() === 'NON');
    this.hasJobyerSigned = (this.contract.signature_jobyer.toUpperCase() == 'OUI');
    let forPointing = this.contract.option_mission != "1.0" ? true : false;
    this.missionService.listMissionHours(this.contract, forPointing).then((data: {data: any}) => {
      if (data.data) {
        this.initialMissionHours = data.data;
        //initiate pauses array
        let array = this.missionService.constructMissionHoursArray(this.initialMissionHours);
        this.missionHours = array[0];
        this.missionPauses = array[1];
      }
    });

    this.missionService.getCosignersNames(this.contract).then((data: {data: Array<any>}) => {

      if (data.data) {
        let cosigners = data.data[0];
        this.enterpriseName = cosigners.enterprise;
        this.jobyerName = cosigners.jobyer;
      }
    });


    if (this.contract.numero_de_facture && this.contract.numero_de_facture != 'null')
      this.invoiceReady = true;

    this.getOptionMission();

    //  Getting contract score
    this.notationService.loadContractNotation(this.contract, this.projectTarget).then((score: {value: number}) => {
      this.rating = score.value;
      this.starsText = this.writeStars(this.rating);
    });


    console.log(JSON.stringify(this.contract));
    this.financeService.checkInvoice(this.contract.pk_user_contrat).then((invoice: {pk_user_facture_voj: any, releve_signe_employeur: any,releve_signe_jobyer: any,facture_signee: any}) => {

      if (invoice) {
        this.invoiceId = invoice.pk_user_facture_voj;

        if (this.projectTarget == 'employer')
          this.isReleveAvailable = invoice.releve_signe_employeur == 'Non';
        else
          this.isReleveAvailable = invoice.releve_signe_jobyer == 'Non';

        this.isInvoiceAvailable = invoice.facture_signee == 'Non' && this.projectTarget == 'employer';
      }
    });

    /*
     * Prerequis
     */
    if (this.isNewMission) {
      this.missionService.getPrerequisObligatoires(this.contract.pk_user_contrat).then((data: any) => {
        this.prerequisObligatoires = data;
      });
    } else {
      this.prerequisObligatoires = [];
    }
  }


  onCardClick(dayIndex) {
    if (!this.isNewMission || !this.isEmployer || this.contract.signature_jobyer.toUpperCase() == 'Non'.toUpperCase()) {
      return;
    }
    //open action sheet menu
    let actionSheet = this.actionSheet.create({
      title: 'Actions',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Ajouter une pause',
          icon: 'add-circle',
          handler: () => {
            this.addPause(dayIndex);
          }
        },
        {
          text: 'Annuler',
          role: 'cancel', // will always sort to be on the bottom
          icon: 'close',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  onPauseClick(dayIndex, pauseIndex) {
    if (!this.isNewMission || !this.isEmployer) {
      return;
    }
    //open action sheet menu
    let actionSheet = this.actionSheet.create({
      title: 'Actions',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Supprimer la pause',
          icon: 'trash',
          handler: () => {
            this.deletePause(dayIndex, pauseIndex);
          }
        },
        {
          text: 'Annuler',
          role: 'cancel', // will always sort to be on the bottom
          icon: 'close',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  addPause(dayIndex) {
    if (!this.missionPauses[dayIndex]) {
      this.missionPauses[dayIndex] = [{}];
    } else {
      this.missionPauses[dayIndex].push([{}]);
    }
  }

  deletePause(dayIndex, pauseIndex) {
    this.missionPauses[dayIndex].splice(pauseIndex, 1);
    this.missionPauses[dayIndex].splice(pauseIndex, 1);
  }

  validatePauses() {
    //verify if there are empty pause hours
    for (let i = 0; i < this.missionHours.length; i++) {
      if (this.missionPauses[i]) {
        for (let j = 0; j < this.missionPauses[i].length; j++) {
          if (this.isEmpty(this.missionPauses[i][j].pause_debut) || this.isEmpty(this.missionPauses[i][j].pause_fin)) {
            this.globalService.showAlertValidation("Vit-On-Job", "Veuillez renseigner toutes les heures de pauses avant de valider.");
            return;
          }
        }
      }
    }
      let loading = this.loading.create({content:"Merci de patienter..."});
    loading.present().then(() => {
      this.missionService.addPauses(this.missionHours, this.missionPauses, this.contract.pk_user_contrat).then((data: {status: string,error: string}) => {
        if (!data || data.status == "failure") {
          console.log(data.error);
          loading.dismiss();
          this.globalService.showAlertValidation("Vit-On-Job", "Erreur lors de la sauvegarde des données");
          return;
        } else {
          // data saved
          console.log("pauses saved successfully : " + data.status);
        }
      });
      loading.dismiss();
      let message = "Horaire du contrat numéro " + this.contract.numero + " validé";
      let objectifNotif = "MissionDetailsPage";
      this.sendPushNotification(message, objectifNotif, "toJobyer");
      this.sendInfoBySMS(message, "toJobyer");
      if (this.contract.option_mission != "1.0") {
        this.missionService.schedulePointeuse(this.contract, this.missionHours, this.missionPauses);
      }
      this.nav.pop();
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

  checkPauseHours(i, j, isStartPause, isStartMission) {
    let startMission = this.missionHours[i].heure_debut;
    let endMission = this.missionHours[i].heure_fin;
    let startPause: any;
    let endPause: any;
    if (j >= 0) {
      startPause = this.missionService.convertHoursToMinutes(this.missionPauses[i][j].pause_debut);
      endPause = this.missionService.convertHoursToMinutes(this.missionPauses[i][j].pause_fin);
    }

    if (isStartPause) {
      if (startMission >= startPause) {
        this.missionPauses[i][j].pause_debut = "";
        this.globalService.showAlertValidation("Vit-On-Job", "L'heure de début de pause doit être supérieure à l'heure de début de travail.");
        return;
      }
      if (endMission <= startPause) {
        this.missionPauses[i][j].pause_debut = "";
        this.globalService.showAlertValidation("Vit-On-Job", "L'heure de début de pause doit être inférieure à l'heure de fin de travail.");
        return;
      }
      if (endPause <= startPause && endPause.toString() != "") {
        this.missionPauses[i][j].pause_debut = "";
        this.globalService.showAlertValidation("Vit-On-Job", "L'heure de début de pause doit être inférieure à l'heure de fin de pause.");
        return;
      }
      for (let k = 0; k < this.missionPauses[i].length; k++) {
        let startOtherPause = this.missionPauses[i][k].pause_debut;
        let endOtherPause = this.missionPauses[i][k].pause_fin;
        if (j < k && ((startPause >= startOtherPause && startOtherPause != "") || (startPause >= endOtherPause && endOtherPause != ""))) {
          this.missionPauses[i][j].pause_debut = "";
          this.globalService.showAlertValidation("Vit-On-Job", "L'heure de début de pause doit être inférieure aux heures de pauses postérieurs.");
          return;
        }
        if (j > k && ((startPause <= startOtherPause && startOtherPause != "") || (startPause <= endOtherPause && endOtherPause != ""))) {
          this.missionPauses[i][j].pause_debut = "";
          this.globalService.showAlertValidation("Vit-On-Job", "L'heure de début de pause doit être supérieure aux heures de pauses antérieurs.");
          return;
        }
      }
    } else {
      if (j >= 0) {
        if (startMission >= endPause && startMission != "") {
          this.missionPauses[i][j].pause_fin = "";
          this.globalService.showAlertValidation("Vit-On-Job", "L'heure de fin de pause doit être supérieure à l'heure de début de travail.");
          return;
        }
        if (endMission <= endPause && endMission != "") {
          this.missionPauses[i][j].pause_fin = "";
          this.globalService.showAlertValidation("Vit-On-Job", "L'heure de fin de pause doit être inférieure à l'heure de fin de travail.");
          return;
        }
        if (endPause <= startPause && startPause.toString() != "") {
          this.missionPauses[i][j].pause_fin = "";
          this.globalService.showAlertValidation("Vit-On-Job", "L'heure de fin de pause doit être supérieure à l'heure de début de pause.");
          return;
        }
        for (let k = 0; k < this.missionPauses[i].length; k++) {
          let startOtherPause = this.missionPauses[i][k].pause_debut;
          let endOtherPause = this.missionPauses[i][k].pause_fin;
          if (j < k && ((endPause >= startOtherPause && startOtherPause != "") || (endPause >= endOtherPause && endOtherPause != ""))) {
            this.missionPauses[i][j].pause_fin = "";
            this.globalService.showAlertValidation("Vit-On-Job", "L'heure de fin de pause doit être inférieure aux heures de pauses postérieurs.");
            return;
          }
          if (j > k && ((endPause <= startOtherPause && startOtherPause != "") || (endPause <= endOtherPause && endOtherPause != ""))) {
            this.missionPauses[i][j].pause_fin = "";
            this.globalService.showAlertValidation("Vit-On-Job", "L'heure de fin de pause doit être supérieure aux heures de pauses antérieurs.");
            return;
          }
        }
      }
    }
  }

  checkPointedHours(i, j, isStartPause, isStartMission) {
    let startMission = this.missionHours[i].heure_debut_pointe;
    let endMission = this.missionHours[i].heure_fin_pointe;
    let startPause: any;
    let endPause: any;
    if (j >= 0) {
      startPause = this.missionPauses[i][j].pause_debut_pointe;
      endPause = this.missionPauses[i][j].pause_fin_pointe;
    }

    if (isStartPause) {
      if (startMission >= startPause && startMission != "") {
        this.missionPauses[i][j].pause_debut_pointe = "";
        this.globalService.showAlertValidation("Vit-On-Job", "L'heure de début de pause doit être supérieure à l'heure de début de travail.");
        return;
      }
      if (endMission <= startPause && endMission != "") {
        this.missionPauses[i][j].pause_debut_pointe = "";
        this.globalService.showAlertValidation("Vit-On-Job", "L'heure de début de pause doit être inférieure à l'heure de fin de travail.");
        return;
      }
      if (endPause <= startPause && endPause != "") {
        this.missionPauses[i][j].pause_debut_pointe = "";
        this.globalService.showAlertValidation("Vit-On-Job", "L'heure de début de pause doit être inférieure à l'heure de fin de pause.");
        return;
      }
      for (let k = 0; k < this.missionPauses[i].length; k++) {
        let startOtherPause = this.missionPauses[i][k].pause_debut_pointe;
        let endOtherPause = this.missionPauses[i][k].pause_fin_pointe;
        if (j < k && ((startPause >= startOtherPause && startOtherPause != "") || (startPause >= endOtherPause && endOtherPause != ""))) {
          this.missionPauses[i][j].pause_debut_pointe = "";
          this.globalService.showAlertValidation("Vit-On-Job", "L'heure de début de pause doit être inférieure aux heures de pauses postérieurs.");
          return;
        }
        if (j > k && ((startPause <= startOtherPause && startOtherPause != "") || (startPause <= endOtherPause && endOtherPause != ""))) {
          this.missionPauses[i][j].pause_debut_pointe = "";
          this.globalService.showAlertValidation("Vit-On-Job", "L'heure de début de pause doit être supérieure aux heures de pauses antérieurs.");
          return;
        }
      }
    } else {
      if (j >= 0) {
        if (startMission >= endPause && startMission != "") {
          this.missionPauses[i][j].pause_fin_pointe = "";
          this.globalService.showAlertValidation("Vit-On-Job", "L'heure de fin de pause doit être supérieure à l'heure de début de travail.");
          return;
        }
        if (endMission <= endPause && endMission != "") {
          this.missionPauses[i][j].pause_fin_pointe = "";
          this.globalService.showAlertValidation("Vit-On-Job", "L'heure de fin de pause doit être inférieure à l'heure de fin de travail.");
          return;
        }
        if (endPause <= startPause && startPause != "") {
          this.missionPauses[i][j].pause_fin_pointe = "";
          this.globalService.showAlertValidation("Vit-On-Job", "L'heure de fin de pause doit être supérieure à l'heure de début de pause.");
          return;
        }
        for (let k = 0; k < this.missionPauses[i].length; k++) {
          let startOtherPause = this.missionPauses[i][k].pause_debut_pointe;
          let endOtherPause = this.missionPauses[i][k].pause_fin_pointe;
          if (j < k && ((endPause >= startOtherPause && startOtherPause != "") || (endPause >= endOtherPause && endOtherPause != ""))) {
            this.missionPauses[i][j].pause_fin_pointe = "";
            this.globalService.showAlertValidation("Vit-On-Job", "L'heure de fin de pause doit être inférieure aux heures de pauses postérieurs.");
            return;
          }
          if (j > k && ((endPause <= startOtherPause && startOtherPause != "") || (endPause <= endOtherPause && endOtherPause != ""))) {
            this.missionPauses[i][j].pause_fin_pointe = "";
            this.globalService.showAlertValidation("Vit-On-Job", "L'heure de fin de pause doit être supérieure aux heures de pauses antérieurs.");
            return;
          }
        }
      }
    }
    if (isStartMission) {
      if (startMission >= endMission && endMission != "") {
        this.missionHours[i].heure_debut_pointe = "";
        this.globalService.showAlertValidation("Vit-On-Job", "L'heure de début de travail doit être inférieure à l'heure de fin de travail.");
        return;
      }
      for (let k = 0; k < this.missionPauses[i].length; k++) {
        let startOtherPause = this.missionPauses[i][k].pause_debut_pointe;
        let endOtherPause = this.missionPauses[i][k].pause_fin_pointe;
        if ((startMission >= startOtherPause && startOtherPause != "") || (startMission >= endOtherPause && endOtherPause != "")) {
          this.missionHours[i].heure_debut_pointe = "";
          this.globalService.showAlertValidation("Vit-On-Job", "L'heure de début de travail doit être inférieure aux heures de pauses.");
          return;
        }
      }
    } else {
      if ((!j && j != 0) || j < 0) {
        if (startMission >= endMission && startMission != "") {
          this.missionHours[i].heure_fin_pointe = "";
          this.globalService.showAlertValidation("Vit-On-Job", "L'heure de fin de travail doit être supérieure à l'heure de début de travail.");
          return;
        }
        for (let k = 0; k < this.missionPauses[i].length; k++) {
          let startOtherPause = this.missionPauses[i][k].pause_debut_pointe;
          let endOtherPause = this.missionPauses[i][k].pause_fin_pointe;
          if ((endMission <= startOtherPause && startOtherPause != "") || (endMission <= endOtherPause && endOtherPause != "")) {
            this.missionHours[i].heure_fin_pointe = "";
            this.globalService.showAlertValidation("Vit-On-Job", "L'heure de fin de travail doit être supérieure aux heures de pauses.");
            return;
          }
        }
      }
    }
  }

  isHourValid(i, j, isStartPause, isStartMission, newHour) {
    let startMission = this.isEmpty(this.missionHours[i].heure_debut_new) ? this.missionHours[i].heure_debut : this.missionHours[i].heure_debut_new;
    let endMission = this.isEmpty(this.missionHours[i].heure_fin_new) ? this.missionHours[i].heure_fin : this.missionHours[i].heure_fin_new;
    let startPause: any;
    let endPause: any;
    if (j >= 0) {
      startPause = this.isEmpty(this.missionPauses[i][j].pause_debut_new) ? this.missionService.convertHoursToMinutes(this.missionPauses[i][j].pause_debut) : this.missionPauses[i][j].pause_debut_new;
      endPause = this.isEmpty(this.missionPauses[i][j].pause_fin_new) ? this.missionService.convertHoursToMinutes(this.missionPauses[i][j].pause_fin) : this.missionPauses[i][j].pause_fin_new;
    }

    if (isStartPause) {
      if (startMission >= newHour && startMission != "") {
        this.globalService.showAlertValidation("Vit-On-Job", "L'heure de début de pause doit être supérieure à l'heure de début de travail.");
        return false;
      }
      if (endMission <= newHour && endMission != "") {
        this.globalService.showAlertValidation("Vit-On-Job", "L'heure de début de pause doit être inférieure à l'heure de fin de travail.");
        return false;
      }
      if (endPause <= newHour && endPause != "") {
        this.globalService.showAlertValidation("Vit-On-Job", "L'heure de début de pause doit être inférieure à l'heure de fin de pause.");
        return false;
      }
      for (let k = 0; k < this.missionPauses[i].length; k++) {
        let startOtherPause = this.isEmpty(this.missionPauses[i][k].pause_debut_new) ? this.missionService.convertHoursToMinutes(this.missionPauses[i][k].pause_debut) : this.missionPauses[i][k].pause_debut_new;
        let endOtherPause = this.isEmpty(this.missionPauses[i][k].pause_fin_new) ? this.missionService.convertHoursToMinutes(this.missionPauses[i][k].pause_fin) : this.missionPauses[i][k].pause_fin_new;
        if (j < k && ((newHour >= startOtherPause && startOtherPause != "") || (newHour >= endOtherPause && endOtherPause != ""))) {
          this.globalService.showAlertValidation("Vit-On-Job", "L'heure de début de pause doit être inférieure aux heures de pauses postérieurs.");
          return false;
        }
        if (j > k && ((newHour <= startOtherPause && startOtherPause != "") || (newHour <= endOtherPause && endOtherPause != ""))) {
          this.globalService.showAlertValidation("Vit-On-Job", "L'heure de début de pause doit être supérieure aux heures de pauses antérieurs.");
          return false;
        }
      }
    } else {
      if (j >= 0) {
        if (startMission >= newHour && startMission != "") {
          this.globalService.showAlertValidation("Vit-On-Job", "L'heure de fin de pause doit être supérieure à l'heure de début de travail.");
          return false;
        }
        if (endMission <= newHour && endMission != "") {
          this.globalService.showAlertValidation("Vit-On-Job", "L'heure de fin de pause doit être inférieure à l'heure de fin de travail.");
          return false;
        }
        if (newHour <= startPause && startPause != "") {
          this.globalService.showAlertValidation("Vit-On-Job", "L'heure de fin de pause doit être supérieure à l'heure de début de pause.");
          return false;
        }
        for (let k = 0; k < this.missionPauses[i].length; k++) {
          let startOtherPause = this.isEmpty(this.missionPauses[i][k].pause_debut_new) ? this.missionService.convertHoursToMinutes(this.missionPauses[i][k].pause_debut) : this.missionPauses[i][k].pause_debut_new;
          let endOtherPause = this.isEmpty(this.missionPauses[i][k].pause_fin_new) ? this.missionService.convertHoursToMinutes(this.missionPauses[i][k].pause_fin) : this.missionPauses[i][k].pause_fin_new;
          if (j < k && ((newHour >= startOtherPause && startOtherPause != "") || (newHour >= endOtherPause && endOtherPause != ""))) {
            this.globalService.showAlertValidation("Vit-On-Job", "L'heure de fin de pause doit être inférieure aux heures de pauses postérieurs.");
            return false;
          }
          if (j > k && ((newHour <= startOtherPause && startOtherPause != "") || (newHour <= endOtherPause && endOtherPause != ""))) {
            this.globalService.showAlertValidation("Vit-On-Job", "L'heure de fin de pause doit être supérieure aux heures de pauses antérieurs.");
            return false;
          }
        }
      }
    }

    if (isStartMission) {
      if (newHour >= endMission && endMission != "") {
        this.globalService.showAlertValidation("Vit-On-Job", "L'heure de début de travail doit être inférieure à l'heure de fin de travail.");
        return false;
      }
      if (this.missionPauses[i]) {
        for (let k = 0; k < this.missionPauses[i].length; k++) {
          let startOtherPause = this.isEmpty(this.missionPauses[i][k].pause_debut_new) ? this.missionService.convertHoursToMinutes(this.missionPauses[i][k].pause_debut) : this.missionPauses[i][k].pause_debut_new;
          let endOtherPause = this.isEmpty(this.missionPauses[i][k].pause_fin_new) ? this.missionService.convertHoursToMinutes(this.missionPauses[i][k].pause_fin) : this.missionPauses[i][k].pause_fin_new;
          if ((newHour >= startOtherPause && startOtherPause != "") || (newHour >= endOtherPause && endOtherPause != "")) {
            this.globalService.showAlertValidation("Vit-On-Job", "L'heure de début de travail doit être inférieure aux heures de pauses.");
            return false;
          }
        }
      }
    } else {
      if ((!j && j != 0) || j < 0) {
        if (startMission >= newHour && startMission != "") {
          this.globalService.showAlertValidation("Vit-On-Job", "L'heure de fin de travail doit être supérieure à l'heure de début de travail.");
          return false;
        }
        if (this.missionPauses[i]) {
          for (let k = 0; k < this.missionPauses[i].length; k++) {
            let startOtherPause = this.isEmpty(this.missionPauses[i][k].pause_debut_new) ? this.missionService.convertHoursToMinutes(this.missionPauses[i][k].pause_debut) : this.missionPauses[i][k].pause_debut_new;
            let endOtherPause = this.isEmpty(this.missionPauses[i][k].pause_fin_new) ? this.missionService.convertHoursToMinutes(this.missionPauses[i][k].pause_fin) : this.missionPauses[i][k].pause_fin_new;
            if ((newHour <= startOtherPause && startOtherPause != "") || (newHour <= endOtherPause && endOtherPause != "")) {
              this.globalService.showAlertValidation("Vit-On-Job", "L'heure de fin de travail doit être supérieure aux heures de pauses.");
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  saveCorrectedHours(i, j, isStartPause, isStartMission) {
    if (isStartPause) {
      this.missionPauses[i][j].pause_debut_corrigee = this.missionPauses[i][j].pause_debut_pointe;
      this.missionPauses[i][j].is_pause_debut_corrigee = 'oui';
      return;
    } else {
      if (j >= 0) {
        this.missionPauses[i][j].pause_fin_corrigee = this.missionPauses[i][j].pause_fin_pointe;
        this.missionPauses[i][j].is_pause_fin_corrigee = 'oui';
        return;
      }
    }
    if (isStartMission) {
      this.missionHours[i].heure_debut_corrigee = this.missionHours[i].heure_debut_pointe;
      this.missionHours[i].is_heure_debut_corrigee = 'oui';
      return;
    } else {
      if (!j && j != 0) {
        this.missionHours[i].heure_fin_corrigee = this.missionHours[i].heure_fin_pointe;
        this.missionHours[i].is_heure_fin_corrigee = 'oui';
        return;
      }
    }
  }

  checkHour(i, j, isStartPause, pointing, isStartMission) {
    if (pointing) {
      //after checking hour validity, save corrected hours
      this.checkPointedHours(i, j, isStartPause, isStartMission);
      this.saveCorrectedHours(i, j, isStartPause, isStartMission);
    } else {
      this.checkPauseHours(i, j, isStartPause, isStartMission);
    }
  }

  generateTimesheet() {
    this.missionService.saveCorrectedMissions(this.contract.pk_user_contrat, this.missionHours, this.missionPauses).then((data: {status: string}) => {
      if (data && data.status == "success") {
        console.log("timesheet saved");
        let message = "Le relevé d'heure du contrat numéro : " + this.contract.numero + "vous a été envoyé";
        let objectifNotif = "MissionDetailsPage";
        this.sendPushNotification(message, objectifNotif, "toJobyer");
        this.sendInfoBySMS(message, "toJobyer");
        this.nav.pop();
      }
    });
  }

  signSchedule() {
      let loading = this.loading.create({content:"Merci de patienter..."});

    loading.present().then(() => {
      this.missionService.signSchedule(this.contract).then((data: {status: string, error: string}) => {
        if (!data || data.status == "failure") {
          console.log(data.error);
          loading.dismiss();
          this.globalService.showAlertValidation("Vit-On-Job", "Erreur lors de la sauvegarde des données");
          return;
        } else {
          // data saved
          console.log("schedule signed : " + data.status);
          if (this.contract.option_mission == "2.0" && !this.isEmployer) {
            let message = "Le relevé d'heure du contrat numéro " + this.contract.numero + " a été signé.";
            let objectifNotif = "MissionDetailsPage";
            this.sendPushNotification(message, objectifNotif, "toEmployer");
            this.sendInfoBySMS(message, "toEmployer");
          }
        }
      });
      loading.dismiss();
      this.nav.pop();
    });
  }

  displaySignAlert() {
    let confirm = this.alert.create({
      title: "Vit-On-Job",
      message: "Signature fin de mission",
      buttons: [
        {
          text: 'Annuler',
          handler: () => {
            console.log('No clicked');
          }
        },
        {
          text: 'Signer',
          handler: () => {
            console.log('Yes clicked');
            confirm.dismiss().then(() => {
              this.signSchedule();
            })
          }
        }
      ]
    });
    confirm.present();
  }

  validateWork() {
    /*this.store.set('CONTRACT_INVOICE', JSON.stringify(this.contract)).then((data:any) => {
     this.nav.push(ModalInvoicePage);
     });
     */
    let nbWorkHours = this.missionService.calculateNbWorkHours(this.missionHours);
    this.missionService.saveEndMission(this.contract.pk_user_contrat, nbWorkHours, this.contract.fk_user_jobyer).then(val => {
      this.missionService.endOfMission(this.contract.pk_user_contrat)
        .then((data: {
          id: any,
          offerId: any,
          rate: any,
          employerFirstName: string,
          employerLastName: string,
          employerEmail: string,
          employerPhone: string
          jobyerFirstName: string,
          jobyerLastName: string,
          jobyerEmail: string,
          jobyerPhone: string,

        }) => {

          let confirm = this.alert.create({
            title: "Vit-On-Job",
            message: "Les détails de cette missions sont en cours de traitements, vous serez contacté par SMS une fois la facturation effectuée",
            buttons: [
              {
                text: 'OK',
                handler: () => {
                  console.log('No clicked');
                }
              }
            ]
          });
          confirm.present();

          let idContrat = data.id;
          let idOffre = data.offerId;
          let rate = data.rate;
          this.financeService.loadInvoice(idContrat, idOffre, rate).then((invoiceData: {invoiceId: any}) => {
            let idInvoice = invoiceData.invoiceId;
            let bean = {
              "class": 'com.vitonjob.docusign.model.DSConfig',
              employerFirstName: data.employerFirstName,
              employerLastName: data.employerLastName,
              employerEmail: data.employerEmail,
              employerPhone: data.employerPhone,
              jobyerFirstName: data.jobyerFirstName,
              jobyerLastName: data.jobyerLastName,
              jobyerEmail: data.jobyerEmail,
              jobyerPhone: data.jobyerPhone,
              idContract: idContrat,
              idInvoice: idInvoice,
              idDocument: idInvoice,
              environnement: GlobalConfigs.env

            };
            this.missionService.signEndOfMission(bean).then(signatureData => {

              this.financeService.checkInvoice(this.contract.pk_user_contrat).then((invoice: {pk_user_facture_voj: any,releve_signe_employeur: any,releve_signe_jobyer: any, facture_signee: any}) => {

                if (invoice) {
                  this.invoiceId = invoice.pk_user_facture_voj;

                  if (this.projectTarget == 'employer')
                    this.isReleveAvailable = invoice.releve_signe_employeur == 'Non';
                  else
                    this.isReleveAvailable = invoice.releve_signe_jobyer == 'Non';

                  this.isInvoiceAvailable = invoice.facture_signee == 'Non' && this.projectTarget == 'employer';
                }
              });
            });
          });

        });
    });
  }

  resetForm() {
    let array = this.missionService.constructMissionHoursArray(this.initialMissionHours);
    this.missionHours = array[0];
    this.missionPauses = array[1];
  }

  goBack() {
    this.nav.pop();
  }

  watchSignedToggle(e) {
      let loading = this.loading.create({content:"Merci de patienter..."});
    loading.present().then(() => {
      this.missionService.signContract(this.contract.pk_user_contrat).then((data: {status: string, error: string}) => {
        if (!data || data.status == "failure") {
          console.log(data.error);
          loading.dismiss();
          this.globalService.showAlertValidation("Vit-On-Job", "Erreur lors de la sauvegarde des données");
          return;
        } else {
          // data saved
          console.log("contract signed : " + data.status);
          this.contract.signature_jobyer = 'Oui';
        }
      });
      if (this.contract.option_mission != "1.0") {
        this.missionService.schedulePointeuse(this.contract, this.missionHours, this.missionPauses);
      }
      loading.dismiss();
    });
  }

  launchContractPage() {
    this.isSignContractClicked = true;
    this.platform.ready().then(() => {
      //let browser = new InAppBrowser(this.contract.lien_jobyer, '_blank');
      InAppBrowser.open(this.contract.lien_jobyer, '_blank');
    });
  }

  disableTimesheetButton() {
    let disable;
    //let k = 0;
    for (let i = 0; i < this.missionHours.length; i++) {
      let m = this.missionHours[i];
      if (!m.heure_debut_pointe || m.heure_debut_pointe == "null" || !m.heure_fin_pointe || m.heure_fin_pointe == "null") {
        disable = true;
        return disable;
      } else {
        disable = false;
      }
      if (this.missionPauses[i]) {
        for (let j = 0; j < this.missionPauses[i].length; j++) {
          if (this.missionPauses[i][j].pause_debut_pointe == "" || this.missionPauses[i][j].pause_fin_pointe == "") {
            disable = true;
            return disable;
          } else {
            disable = false;
          }
        }
      }
    }
    return disable;
  }

  changeOption() {
    let modal = this.modal.create(ModalTrackMissionPage);
    modal.present();
    modal.onDidDismiss(selectedOption => {
      if (selectedOption) {
        this.missionService.updateOptionMission(selectedOption, this.contract.pk_user_contrat).then((data: {status: string}) => {
          if (!data || data.status == 'failure') {
            this.globalService.showAlertValidation("Vit-On-Job", "Une erreur est survenue lors de la sauvegarde des données.");
          } else {
            console.log("option mission saved successfully");
            this.contract.option_mission = selectedOption;
            this.optionMission = "Mode de suivi de mission n°" + selectedOption;
          }
        });
      }
    });
  }

  /**
   * Stars picker
   */
  setStarPicker() {
    if(!this.isReleveAvailable){
      return;
    }
    let picker = this.picker.create();
    let options: PickerColumnOption[] = new Array<PickerColumnOption>();
    for (let i = 1; i <= 5; i++) {
      options.push({
        value: i,
        text: this.writeStars(i)
      })
    }

    let column = {
      selectedIndex: this.rating,
      options: options
    };
    picker.addColumn(column);
    picker.addButton('Annuler');
    picker.addButton({
      text: 'OK',
      handler: data => {

        this.rating = data.undefined.value;
        this.starsText = this.writeStars(this.rating);
        this.notationService.saveContractNotation(this.contract, this.projectTarget, this.rating);
      }
    });
    picker.present();
  }

  /**
   * writing stars
   * @param number of stars writed
   */
  writeStars(number: number): string {
    let starText = '';
    for (let i = 0; i < number; i++) {
      starText += '\u2605'
    }
    return starText;
  }

  presentToast(message: string, duration: number) {
    let toast = this.toast.create({
      message: message,
      duration: duration * 1000
    });
    toast.present();
  }

  onPointedHourClick(i, j, isStartMission, isStartPause) {
    if (this.upperCase(this.contract.releve_employeur) == 'OUI') {
      return;
    }
    if (isStartPause) {
      if (!this.missionPauses[i][j].pause_debut_pointe)
        return;
    } else {
      if (j >= 0) {
        if (!this.missionPauses[i][j].pause_fin_pointe)
          return;
      }
    }
    if (isStartMission) {
      if (!this.missionHours[i].heure_debut_pointe)
        return;
    } else {
      if (!j && j != 0) {
        if (!this.missionHours[i].heure_fin_pointe)
          return;
      }
    }

    if(this.isEmployer){
      let actionSheet = this.actionSheet.create({
        title: 'Actions',
        cssClass: 'action-sheets-basic-page',
        buttons: [
          {
            text: 'Valider l\'heure pointée',
            icon: 'thumbs-up',
            handler: () => {
              console.log('Validate clicked');
              this.colorHour(i, j, isStartMission, isStartPause, true);
            }
          },
          {
            text: 'Refuser l\'heure pointée',
            icon: 'thumbs-down',
            handler: () => {
              console.log('Refuse clicked');
              this.colorHour(i, j, isStartMission, isStartPause, false);
            }
          },
          {
            text: 'Annuler',
            role: 'cancel', // will always sort to be on the bottom
            icon: 'close',
            handler: () => {
              console.log('Cancel clicked');
            }
          }
        ]
      });
      actionSheet.present();
    }else{
      this.modifyPointedHour(i, j, isStartPause, isStartMission);
    }
  }

  colorHour(i, j, isStartMission, isStartPause, valid) {
    let isCorrected = (valid ? 'Non' : 'Oui');
    let id;
    if (isStartPause) {
      this.missionPauses[i][j].is_pause_debut_corrigee = isCorrected;
      id = this.missionPauses[i][j].id;
    } else {
      if (j >= 0) {
        this.missionPauses[i][j].is_pause_fin_corrigee = isCorrected;
        id = this.missionPauses[i][j].id;
      }
    }
    if (isStartMission) {
      this.missionHours[i].is_heure_debut_corrigee = isCorrected;
      id = this.missionHours[i].id;
    } else {
      if (!j && j != 0) {
        this.missionHours[i].is_heure_fin_corrigee = isCorrected;
        id = this.missionHours[i].id;
      }
    }
    this.missionService.saveIsHourValid(i, j, isStartMission, isStartPause, isCorrected, id).then((data: any) => {
      console.log("is hour valid saved")
    });
  }

  onHourClick(i, j, isStartMission, isStartPause) {
    //jobyer cant edit scheduled hours and pauses
    if (!this.isEmployer || this.upperCase(this.contract.approuve) == 'OUI') {
      return;
    }
    //if schedule not yet validated
    if (this.upperCase(this.contract.vu) == 'NON' && (j || j == 0)) {
      this.addPauseHour(i, j, isStartPause);
      return;
    }
    //if schedule already validated
    let initialHour;
    let buttons = [
      {
        text: 'Modifier l\'heure prévue',
        icon: 'create',
        handler: () => {
          console.log('Modify clicked');
          this.modifyScheduledHour(i, j, isStartMission, isStartPause);
        }
      },
      {
        text: 'Annuler',
        role: 'cancel', // will always sort to be on the bottom
        icon: 'close',
        handler: () => {
          console.log('Cancel clicked');
        }
      }
    ];
    let eraseBtn = {
      text: 'Effacer la modification',
      icon: 'undo',
      handler: () => {
        console.log('Erase clicked');
        actionSheet.onDidDismiss(() => {
          this.undoNewHour(i, j, isStartMission, isStartPause);
        });
      }
    };
    //add erase button into the action sheet in case of : hour is not yet pointed and hour was already modified
    if (isStartPause) {
      if (this.missionPauses[i][j].pause_debut_pointe)
        return;
      if (this.missionPauses[i][j].pause_debut_new != 'null')
        buttons.push(eraseBtn);
      initialHour = this.missionPauses[i][j].pause_debut;
    } else {
      if (j >= 0) {
        if (this.missionPauses[i][j].pause_fin_pointe)
          return;
        if (this.missionPauses[i][j].pause_fin_new != 'null')
          buttons.push(eraseBtn);
        initialHour = this.missionPauses[i][j].pause_fin;
      }
    }
    if (isStartMission) {
      if (this.missionHours[i].heure_debut_pointe)
        return;
      if (this.missionHours[i].heure_debut_new != 'null')
        buttons.push(eraseBtn);
      initialHour = this.missionService.convertToFormattedHour(this.missionHours[i].heure_debut);
    } else {
      if (!j && j != 0) {
        if (this.missionHours[i].heure_fin_pointe)
          return;
        if (this.missionHours[i].heure_fin_new != 'null')
          buttons.push(eraseBtn);
        initialHour = this.missionService.convertToFormattedHour(this.missionHours[i].heure_fin);
      }
    }
    //display the action sheet
    let actionSheet = this.actionSheet.create({
      title: 'L\'heure initialement prévue : ' + initialHour,
      cssClass: 'action-sheets-basic-page',
      buttons: buttons
    });
    actionSheet.present();
  }

  modifyScheduledHour(i, j, isStartMission, isStartPause) {
    DatePicker.show({
      date: new Date(),
      mode: 'time',
      minuteInterval: 15,
      is24Hour: true,
      doneButtonLabel: 'Ok', cancelButtonLabel: 'Annuler', locale: 'fr_FR'
    }).then(newHour => {
        console.log("Got date: ", newHour);
        let myNewHour: number = newHour.getHours() * 60 + newHour.getMinutes();
        let isHourValid = this.isHourValid(i, j, isStartPause, isStartMission, myNewHour);
        if (!isHourValid) {
          return;
        }
        let id;
        if (isStartPause) {
          this.missionPauses[i][j].pause_debut_new = newHour;
          id = this.missionPauses[i][j].id;
        } else {
          if (j >= 0) {
            this.missionPauses[i][j].pause_fin_new = newHour;
            id = this.missionPauses[i][j].id;
          }
        }
        if (isStartMission) {
          this.missionHours[i].heure_debut_new = newHour;
          id = this.missionHours[i].id;
        } else {
          if (!j && j != 0) {
            this.missionHours[i].heure_fin_new = newHour;
            id = this.missionHours[i].id;
          }
        }
        this.missionService.saveNewHour(i, j, isStartMission, isStartPause, id, newHour).then((data: any) => {
          console.log("new hour saved")
        });
      },
      err => console.log('Error occurred while getting date: ', err));
  }

  modifyPointedHour(i, j, isStartPause, isStartMission){
    DatePicker.show({
      date: new Date(),
      mode: 'time',
      is24Hour: true,
      doneButtonLabel: 'Ok', cancelButtonLabel: 'Annuler', locale: 'fr_FR'
    }).then(newHour => {
          console.log("Got date: ", newHour);
         //debugger;
          if(Utils.isEmpty(newHour)){
            return;
          }
          let myNewHour: number = newHour.getHours() * 60 + newHour.getMinutes();
          /*let isHourValid = this.checkPointedHours(i, j, isStartPause, isStartMission, myNewHour);
          if (!isHourValid) {
            return;
          }*/
          let day = {pointe:myNewHour, id:0};
          let isStart;
          let isPause;
          if (isStartPause) {
            isStart = true;
            isPause = true;
            this.missionPauses[i][j].pause_debut_pointe = this.missionService.convertToFormattedHour(myNewHour);
            day.id = this.missionPauses[i][j].id;
          } else {
            if (j >= 0) {
              isStart = false;
              isPause = true;
              this.missionPauses[i][j].pause_fin_pointe = this.missionService.convertToFormattedHour(myNewHour);
              day.id = this.missionPauses[i][j].id;
            }
          }
          if (isStartMission) {
            isStart = true;
            isPause = false;
            this.missionHours[i].heure_debut_pointe = this.missionService.convertToFormattedHour(myNewHour);
            day.id = this.missionHours[i].id;
          } else {
            if (!j && j != 0) {
              isStart = false;
              isPause = false;
              this.missionHours[i].heure_fin_pointe = this.missionService.convertToFormattedHour(myNewHour);
              day.id = this.missionHours[i].id;
            }
          }
          this.missionService.savePointing(day, isStart, isPause);
        },
        err => console.log('Error occurred while getting date: ', err));
  }

  undoNewHour(i, j, isStartMission, isStartPause) {
    //get the initial hour
    let initialHour;
    if (isStartPause) {
      initialHour = this.missionService.convertHoursToMinutes(this.missionPauses[i][j].pause_debut);
    } else {
      if (j >= 0) {
        initialHour = this.missionService.convertHoursToMinutes(this.missionPauses[i][j].pause_fin);
      }
    }
    if (isStartMission) {
      initialHour = this.missionHours[i].heure_debut;
    } else {
      if (!j && j != 0) {
        initialHour = this.missionHours[i].heure_fin;
      }
    }

    let isHourValid = this.isHourValid(i, j, isStartPause, isStartMission, initialHour);
    if (!isHourValid) {
      return;
    }

    let id;
    if (isStartPause) {
      id = this.missionPauses[i][j].id;
      this.missionPauses[i][j].pause_debut_new = 'null';
    } else {
      if (j >= 0) {
        id = this.missionPauses[i][j].id;
        this.missionPauses[i][j].pause_fin_new = 'null';
      }
    }
    if (isStartMission) {
      id = this.missionHours[i].id;
      this.missionHours[i].heure_debut_new = 'null';
    } else {
      if (!j && j != 0) {
        id = this.missionHours[i].id;
        this.missionHours[i].heure_fin_new = 'null';
      }
    }
    this.missionService.deleteNewHour(i, j, isStartMission, isStartPause, id).then((data: any) => {
      console.log("new hour deleted")
    });
  }

  addPauseHour(i, j, isStartPause) {
    DatePicker.show({
      date: new Date(),
      mode: 'time',
      minuteInterval: 15,
      is24Hour: true,
      doneButtonLabel: 'Ok', cancelButtonLabel: 'Annuler', locale: 'fr_FR'
    }).then(pauseHour => {
        //verify if the entered pause hour is valid
        let myPauseHour = pauseHour.getHours() * 60 + pauseHour.getMinutes();
        let isHourValid = this.isHourValid(i, j, isStartPause, false, myPauseHour);
        if (!isHourValid) {
          return;
        }
        //if the pause hour is valid, take it
        if (isStartPause) {
          this.missionPauses[i][j].pause_debut = this.missionService.convertToFormattedHour(pauseHour);
        } else {
          this.missionPauses[i][j].pause_fin = this.missionService.convertToFormattedHour(pauseHour);
        }
      },
      err => console.log('Error occurred while getting date: ', err)
    );
  }

  eomReleve() {
    this.nav.push(MissionEndRelevePage, {idInvoice: this.invoiceId});
  }

  eomInvoice() {
    this.nav.push(MissionEndInvoicePage, {idInvoice: this.invoiceId});
  }

  getOptionMission() {
    if (this.isEmpty(this.contract.option_mission)) {
      this.optionMission = "Mode de suivi de mission n°1";
      this.contract.option_mission = "1.0";
    } else {
      this.optionMission = "Mode de suivi de mission n°" + this.contract.option_mission.substring(0, 1);
    }
  }

  refreshSignatureStatus() {
    this.missionService.getContract(this.contract.pk_user_contrat).then((data: {data: Array<any>}) => {
      this.contract = data.data[0];
      if (this.upperCase(this.contract.signature_jobyer) == 'NON') {
        this.isSignContractClicked = false;
      }
    })
  }

  pointHour(autoPointing, day, isStart, isPause) {
    //if (this.nextPointing) {
    let h = new Date().getHours();
    let m = new Date().getMinutes();
    let minutesNow = this.missionService.convertHoursToMinutes(h + ':' + m);
    day.pointe = minutesNow;
    this.missionService.savePointing(day, isStart, isPause).then((data: any) => {
      //retrieve mission hours of tody
      this.missionService.listMissionHours(this.contract, true).then((data: {data: any}) => {
        if (data.data) {
          let missionHoursTemp = data.data;
          let array = this.missionService.constructMissionHoursArray(missionHoursTemp);
          this.missionHours = array[0];
          this.missionPauses = array[1];
          //this.disableBtnPointing = true;
        }
      });
    });
    //}
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
