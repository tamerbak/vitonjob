import {Component} from '@angular/core';
import {NavController, ViewController} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {Contacts} from 'ionic-native';

/*
  Generated class for the RecruiterRepertoryPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/modal-recruiter-repertory/modal-recruiter-repertory.html',
})
export class ModalRecruiterRepertoryPage {
	projectTarget:string;
    isEmployer:boolean;
    themeColor:string;
	currentUser: any;
	
	constructor(public nav: NavController,
				public gc: GlobalConfigs,
				private viewCtrl: ViewController) {
		// Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        // Set store variables and messages
        this.themeColor = config.themeColor;
        this.isEmployer = (this.projectTarget=='employer');			
		this.contactsfound = [];
		this.search = false;		
	}
	
	getContacts(ev) {
	  Contacts.find(['*'], {filter: ev.value}).then((contacts) => {
		  this.contactsfound = contacts;
		  console.log(contacts[0]);
	  })
	  this.search = true;    
	}
	
	selectContacts(){
		var contacts = [];
		for(var i = 0; i < this.contactsfound.length; i++){
			if(this.contactsfound[i].checked)
				contacts.push(this.contactsfound[i]);
		}
		this.viewCtrl.dismiss(contacts);
	}
	
	closeModal() {
		this.viewCtrl.dismiss();
	}
}