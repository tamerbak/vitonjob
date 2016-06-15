import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {ContractService} from '../../providers/contract-service/contract-service';
import {DatePicker} from 'ionic-native';
import {MissionDetailsPage} from '../mission-details/mission-details';
import {Storage, SqlStorage} from 'ionic-angular';
import {DateConverter} from '../../pipes/date-converter/date-converter';

/*
  Generated class for the MissionListPage page.
  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/mission-list/mission-list.html',
  pipes: [DateConverter]
})
export class MissionListPage {
    projectTarget:string;
    isEmployer:boolean;
    themeColor:string;

    employer:any;
    jobyer:any;
    society:string;
    contractList:any;
    missionListTitle:string;
    
    
    constructor(public gc: GlobalConfigs, 
                public nav: NavController, 
                private contractService:ContractService) {
        
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        
        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        
        // Set local variables and messages
        this.themeColor = config.themeColor;
        this.missionListTitle = "Suivi des missions";
        this.isEmployer = (this.projectTarget=='employer');
		this.storage = new Storage(SqlStorage);
		
        //get contracts
        this.storage.get("currentUser").then((value) => {
			if(value){
				this.currentUser = JSON.parse(value);
				var entrepriseId = this.currentUser.employer.entreprises[0].id;
				this.contractService.getContracts(entrepriseId, this.projectTarget).then(data => {
					if(data.data){
						this.contractList = data.data;
					}
				});	
			}
		});
    }
    
    goToMissionDetailsPage(contract){
        this.nav.push(MissionDetailsPage,{contract:contract});
    }
    
    showI(){
        DatePicker.show({
            date: new Date(),
            mode: 'time',
            is24Hour:true
        }).then(
            date => console.log("Got date: ", date),
            err => console.log("Error occurred while getting date:", err)
        );
    }
}
