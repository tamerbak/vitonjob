import {Component} from '@angular/core';
import {NavController, Loading, Events} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {AuthenticationService} from "../../providers/authentication.service";
import {Storage, SqlStorage} from 'ionic-angular';
import {GlobalService} from "../../providers/global.service";
import {SettingPasswordPage} from "../setting-password/setting-password";
import {HomePage} from "../home/home";

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
				private globalService: GlobalService, events:Events) {
		this.projectTarget = gc.getProjectTarget();
		let config = Configs.setConfigs(this.projectTarget);
		this.options = config.options;
		this.currentUserVar = config.currentUserVar;
        this.isEmployer = (this.projectTarget === 'employer');
		this.storage = new Storage(SqlStorage);
		this.events = events;
	}
	
	logOut() {
		this.storage.set(this.currentUserVar, null);
		this.storage.set("RECRUITER_LIST", null);
		this.events.publish('user:logout');
		this.nav.setRoot(HomePage);
	}
	
	goToSettingPassword() {
		this.nav.push(SettingPasswordPage);
	}

	lockApp() {

	}
	
}
