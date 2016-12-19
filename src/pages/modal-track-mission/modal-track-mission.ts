import {Component} from "@angular/core";
import {NavController, NavParams, ViewController} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Storage} from "@ionic/storage";

@Component({
  templateUrl: 'modal-track-mission.html'
})
export class ModalTrackMissionPage {
  public projectTarget: string;
  public options;
  public initialOpt;
  public isEmployer: boolean;

  constructor(public nav: NavController,
              navParams: NavParams,
              public gc: GlobalConfigs,
              private viewCtrl: ViewController, public storage:Storage) {
    this.nav = nav;
    // Set global configs
    this.projectTarget = gc.getProjectTarget();
    // get config of selected target
    //let config = Configs.setConfigs(this.projectTarget);
    // Set local variables and messages
    this.isEmployer = (this.projectTarget == 'employer');

    this.initialOpt = navParams.get('optionMission');
  }

  watchOption(e) {
    this.viewCtrl.dismiss(this.options);
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }
}
