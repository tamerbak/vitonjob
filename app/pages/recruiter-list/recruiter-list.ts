import {NavController, Modal, ViewController} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {RecruiterService} from '../../providers/recruiter-service/recruiter-service';
import {Component} from "@angular/core";
import {Storage, SqlStorage} from 'ionic-angular';
import {ModalRecruiterRepertoryPage} from '../modal-recruiter-repertory/modal-recruiter-repertory';
import {ModalRecruiterManualPage} from '../modal-recruiter-manual/modal-recruiter-manual';
import {GlobalService} from "../../providers/global.service";

@Component({
    templateUrl: 'build/pages/recruiter-list/recruiter-list.html',
	providers: [RecruiterService, GlobalService]
})

export class RecruiterListPage {
    projectTarget:string;
    isEmployer:boolean;
    themeColor:string;
	recruiterList: any;
	currentUser: any;
	contactsTemp = [];
	
    constructor(public gc: GlobalConfigs,
                public nav: NavController,
				private globalService: GlobalService,
				private recruiterService: RecruiterService){
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        let config = Configs.setConfigs(this.projectTarget);
        this.themeColor = config.themeColor;
        this.isEmployer = (this.projectTarget=='employer');
		this.storage = new Storage(SqlStorage);
		//if db local contains recruiter list, retrieve it
		this.storage.get("RECRUITER_LIST").then((value) => {
			if(value){
				this.recruiterList = JSON.parse(value);
			//if db local does not contain recruiter list, retrieve it from server
			}
		});
		this.storage.get("currentUser").then((value) => {
			if(value){
				this.currentUser = JSON.parse(value);
				console.log(this.recruiterList);
				if(!this.recruiterList || this.recruiterList.length == 0){
					this.recruiterService.loadRecruiters(this.currentUser.employer.id).then((data)=>{
						if(data && data.status == "success"){
							this.recruiterList = data.data;
							this.storage.set('RECRUITER_LIST', JSON.stringify(this.recruiterList));
						}
					});
				}
			}
		});
	}	
	
	showRecruiterRepertoryModal(){
		let modal = Modal.create(ModalRecruiterRepertoryPage);
		this.nav.present(modal);
		modal.onDismiss(contacts => {
			this.recruiterService.insertRecruiters(contacts, this.currentUser.employer.id).then((data) => {
				if(!data || data.status == 'failure'){
					this.globalService.showAlertValidation("VitOnJob", "Une erreur est survenue lors de la sauvegarde des données.");
				}else{
					console.log("recruiter saved successfully");
					this.contactsTemp = data;
					this.updateRecruiterListInLocal(this.contactsTemp);
				}
			});
        });
	}
	
	showRecruiterManualModal(contact){
		let modal = Modal.create(ModalRecruiterManualPage, {contact:contact});
		this.nav.present(modal);
		modal.onDismiss(data => {
			/*this.recruiterService.insertRecruiters(data).then((data) => {
				this.contactsTemp = data;				
			});*/
        });
	}
	
	updateRecruiterListInLocal(contacts){
		this.storage.get("RECRUITER_LIST").then((value) => {
			if(value){
				this.recruiterList = JSON.parse(value);
				for(var i = 0; i < contacts.length; i++){
					this.recruiterList.push(contacts[i]);
				}
				this.storage.set('RECRUITER_LIST', JSON.stringify(this.recruiterList));
			}
		});
	}
}