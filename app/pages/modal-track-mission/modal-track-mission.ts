import {Component} from '@angular/core';
import {NavController, Toast, ViewController} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {Storage, SqlStorage} from 'ionic-angular';

@Component({
	templateUrl: 'build/pages/modal-track-mission/modal-track-mission.html'
})
export class ModalTrackMissionPage {
	projectTarget: string;
	storage:any;
	options;
	
	constructor(public nav: NavController, 
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
	}
	
	watchOption(e){
		this.viewCtrl.dismiss(this.options);
	}
	
	closeModal() {
		this.viewCtrl.dismiss();
	}
}