import {Component} from '@angular/core';
import {NavController, Loading, Events, Modal} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {AuthenticationService} from "../../providers/authentication.service";
import {Storage, SqlStorage} from 'ionic-angular';
import {GlobalService} from "../../providers/global.service";
import {SettingPasswordPage} from "../setting-password/setting-password";
import {HomePage} from "../home/home";
import {ModalTrackMissionPage} from "../modal-track-mission/modal-track-mission";
import {MissionService} from '../../providers/mission-service/mission-service';
/*
	Generated class for the SettingsPage page.
	
	See http://ionicframework.com/docs/v2/components/#navigation for more info on
	Ionic pages and navigation.
*/
@Component({
	templateUrl: 'build/pages/settings/settings.html',
	providers: [AuthenticationService, GlobalService]
})
export class SettingsPage {
	options:any;
	projectTarget:string;
	isEmployer:boolean;
	password1: string;
	password2: string;
	currentUser: any;
	storage: any;
	events:any;
	currentUserVar: string;

	
	constructor(public nav: NavController, gc: GlobalConfigs,
				private authService: AuthenticationService,
				private globalService: GlobalService, events:Events,
				private missionService:MissionService) {
		this.projectTarget = gc.getProjectTarget();
		let config = Configs.setConfigs(this.projectTarget);
		this.options = config.options;
		this.currentUserVar = config.currentUserVar;
        this.isEmployer = (this.projectTarget === 'employer');
		this.storage = new Storage(SqlStorage);
		this.events = events;
	}
	
	logOut() {
		this.storage.set('connexion', null);
		this.storage.set(this.currentUserVar, null);
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
	
	changeOption(){
        let modal = Modal.create(ModalTrackMissionPage);
        this.nav.present(modal);
        modal.onDismiss(selectedOption => {
            if(selectedOption){
				this.storage.get(this.currentUserVar).then((value) => {
					if(value){
						this.currentUser = JSON.parse(value);
						this.storage.set('OPTION_MISSION', selectedOption).then(() =>{
							this.missionService.updateDefaultOptionMission(selectedOption, this.currentUser.id).then((data) => {
								if(!data || data.status == 'failure'){
									this.globalService.showAlertValidation("VitOnJob", "Une erreur est survenue lors de la sauvegarde des données.");
								}else{
									console.log("default option mission saved successfully");
								}
							});
						});
					}
				});
			}
		});
	}
}