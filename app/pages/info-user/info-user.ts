import {NavController, App, NavParams} from 'ionic-angular';
import {CivilityPage} from '../civility/civility';
import {PersonalAddressPage} from '../personal-address/personal-address';
import {JobAddressPage} from '../job-address/job-address';
import {Component} from "@angular/core";

/**
	* @author Amal ROCHD
	* @description tabs of user information entry : civility, personal address and job address
	* @module Authentication
*/
@Component({
	templateUrl: 'build/pages/info-user/info-user.html'
})
export class InfoUserPage {
	civilityRoot: any;
	pAddressRoot: any;
	jAddressRoot: any;
	civilityTabTitle : string;
	pAddressTabTitle: string;
	jAddressTabTitle: string;
	
	/**
		* @description While constructing the tabs, we bind each tab to its page
	*/
	constructor(public nav: NavController,
	app: App,
	navParams: NavParams) {
		// set the root pages for each tab
		this.civilityRoot = CivilityPage;
		this.pAddressRoot = PersonalAddressPage;
		this.jAddressRoot = JobAddressPage;
		
		this.nav = nav;
		this.navParams = navParams;
		this.dataParams = this.navParams.data; 
		
		this.civilityTabTitle = "Civilité";
		this.pAddressTabTitle = "A. personnelle";
		this.jAddressTabTitle = "A. départ au travail";	
	}
}