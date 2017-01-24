import {Component} from "@angular/core";
import {NavController, Events, ModalController} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {AuthenticationService} from "../../providers/authentication-service/authentication-service";
import {GlobalService} from "../../providers/global-service/global-service";
import {SettingPasswordPage} from "../setting-password/setting-password";
import {HomePage} from "../home/home";
import {ModalTrackMissionPage} from "../modal-track-mission/modal-track-mission";
import {MissionService} from "../../providers/mission-service/mission-service";
import {Storage} from "@ionic/storage";
/*
 Generated class for the SettingsPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  templateUrl: 'settings.html',
  selector: 'settings'
})
export class SettingsPage {
  public options: any;
  public projectTarget: string;
  public isEmployer: boolean;
  //public password1: string;
  //public password2: string;
  public currentUser: any;
  public events: any;
  public currentUserVar: string;
  public profilPictureVar: string;
  public themeColor:string;

  constructor(public nav: NavController, gc: GlobalConfigs,
              private authService: AuthenticationService,
              private globalService: GlobalService, events: Events,
              private missionService: MissionService, public modal: ModalController, public storage:Storage) {
    this.projectTarget = gc.getProjectTarget();
    let config = Configs.setConfigs(this.projectTarget);
    this.options = config.options;
    this.currentUserVar = config.currentUserVar;
    this.profilPictureVar = config.profilPictureVar;
    this.themeColor = config.themeColor;
    this.isEmployer = (this.projectTarget === 'employer');

    this.events = events;
  }

  logOut() {
    this.storage.set('connexion', null);
    this.storage.set(this.currentUserVar, null);
    this.storage.set(this.profilPictureVar, null);
    this.storage.set("RECRUITER_LIST", null);
    this.storage.set('OPTION_MISSION', null);
    this.storage.set('PROFIL_PICTURE', null);
    this.events.publish('user:logout');
    this.nav.setRoot(HomePage);
  }

  goToSettingPassword() {
    this.nav.push(SettingPasswordPage);
  }

  lockApp() {

  }

  changeOption() {
    this.storage.get(this.currentUserVar).then((value) => {
      if (value) {
        this.currentUser = JSON.parse(value);
        this.missionService.getOptionMission(this.currentUser.id).then((opt: any) => {
          let modal = this.modal.create(ModalTrackMissionPage, {optionMission: opt.data[0].option_mission});
          modal.present();
          modal.onDidDismiss(selectedOption => {
            if (selectedOption) {
              this.storage.set('OPTION_MISSION', selectedOption).then(() => {
                this.missionService.updateDefaultOptionMission(selectedOption, this.currentUser.id, this.currentUser.employer.entreprises[0].id).then((data: any) => {
                  if (!data || data.status == 'failure') {
                    this.globalService.showAlertValidation("Vit-On-Job", "Une erreur est survenue lors de la sauvegarde des données.");
                  } else {
                    console.log("default option mission saved successfully");
                  }
                });
              });
            }
          });
        });
      }
    });
  }
}
