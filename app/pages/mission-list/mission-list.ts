import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {ContractService} from '../../providers/contract-service/contract-service';
import {DatePicker} from 'ionic-native';
import {MissionDetailsPage} from '../mission-details/mission-details';
import {Storage, SqlStorage} from 'ionic-angular';
import {DateConverter} from '../../pipes/date-converter/date-converter';
import {MissionPointingPage} from "../mission-pointing/mission-pointing";
/*
  Generated class for the MissionListPage page.
  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/mission-list/mission-list.html',
  pipes: [DateConverter],
  providers: [ContractService]
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
	currentUserVar: string;
    inversedThemeColor: string;
    backgroundImage: any;
    badgeColor:any;

    constructor(public gc: GlobalConfigs, 
                public nav: NavController, 
                private contractService:ContractService) {
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        
        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        this.contractList = [];
        // Set store variables and messages
        this.themeColor = config.themeColor;
        this.inversedThemeColor = config.inversedThemeColor;
		this.currentUserVar = config.currentUserVar;
        this.backgroundImage = config.backgroundImage;
        this.missionListTitle = "Suivi des missions";
        this.isEmployer = (this.projectTarget=='employer');
		this.storage = new Storage(SqlStorage);
	}
	
	onPageWillEnter() {
        console.log('••• On Init');
		//get contracts
        this.storage.get(this.currentUserVar).then((value) => {
			if(value){
				this.currentUser = JSON.parse(value);
				var id;
				if(this.isEmployer){
					id = this.currentUser.employer.entreprises[0].id;
				}else{
					id = this.currentUser.jobyer.id;
				}
				this.contractService.getContracts(id, this.projectTarget).then(data => {
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
	
	goToMissionPointingPage(contract){
		this.nav.push(MissionPointingPage,{contract:contract});
	}
}
