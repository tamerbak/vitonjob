import {Component} from "@angular/core";
import {NavController, NavParams, ViewController, Storage, SqlStorage} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";

@Component({
    templateUrl: 'build/pages/modal-track-mission/modal-track-mission.html'
})
export class ModalTrackMissionPage {
    projectTarget: string;
    storage: any;
    options;
    initialOpt;

    constructor(public nav: NavController,
                navParams: NavParams,
                public gc: GlobalConfigs,
                private viewCtrl: ViewController) {
        this.nav = nav;
        // Set global configs
        this.projectTarget = gc.getProjectTarget();
        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        // Set local variables and messages
        this.isEmployer = (this.projectTarget == 'employer');
        this.storage = new Storage(SqlStorage);
        this.initialOpt = navParams.get('optionMission');
    }

    watchOption(e) {
        this.viewCtrl.dismiss(this.options);
    }

    closeModal() {
        this.viewCtrl.dismiss();
    }
}