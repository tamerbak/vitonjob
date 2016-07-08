import {Component} from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';

@Component({
  templateUrl: 'build/pages/modal-recruiter-manual/modal-recruiter-manual.html',
})
export class ModalRecruiterManualPage {
	projectTarget:string;
    isEmployer:boolean;
    themeColor:string;
	currentUser: any;
	modalTitle: string;
	lastname: string;
	firstname: string;
	phone: string;
	email: string;
	
	constructor(public nav: NavController,
				params: NavParams,
				public gc: GlobalConfigs,
				private viewCtrl: ViewController) {
		// Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        // Set store variables and messages
        this.themeColor = config.themeColor;
        this.isEmployer = (this.projectTarget=='employer');			
		this.initializeForm(params.data.contact);
	}
	initializeForm(contact){
		this.modalTitle = "Détail du contact"
		this.firstname = contact.prenom;
		this.lastname = contact.nom;
		this.phone = contact.phone;
		this.email = contact.email;
	}
	
	updateContact(){
		
	}
	
	isUpdateDisabled(){
		
	}
	
	closeModal() {
		this.viewCtrl.dismiss();
	}
}