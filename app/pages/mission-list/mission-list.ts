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
    missionNow : any;
    missionFutur:any;
    missionPast:any;
    missionListTitle:string;
	currentUserVar: string;
    inversedThemeColor: string;
    backgroundImage: any;
    badgeColor:any;
	isMissionNowLoaded = false;
	isMissionFuturLoaded = false;
	isMissionPastLoaded = false;

    constructor(public gc: GlobalConfigs, 
                public nav: NavController, 
                private contractService:ContractService) {
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        
        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
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
		this.contractList = [];
        this.missionNow = [];
        this.missionFutur = [];
        this.missionPast = [];
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
                        //debugger;
						this.contractList = data.data;
                        for (let i=0; i<this.contractList.length; i++) {
                            let item = this.contractList[i];
                            if (item.date_de_debut) {
                                if ((this.dayDifference(item.date_de_debut) == 0) || (this.dayDifference(item.date_de_debut) < 0 && this.dayDifference(item.date_de_fin) >= 0))
                                // Mission en cours
                                    this.missionNow.push(item);
                                else if (this.dayDifference(item.date_de_debut) > 0)
                                // Mission in futur
                                    this.missionFutur.push(item);
                                else
                                // Mission in past
                                    this.missionPast.push(item);
                            }
                        }

                        this.missionNow = this.missionNow.sort((a, b) => {
                            return this.dayDifference(b.date_de_debut, a.date_de_debut)
                        });

                        this.missionFutur = this.missionFutur.sort((a, b) => {
                            return this.dayDifference(a.date_de_debut, b.date_de_debut)
                        });

                        this.missionPast = this.missionPast.sort((a, b) => {
                            return this.dayDifference(b.date_de_debut, a.date_de_debut)
                        });
					}
					this.isMissionNowLoaded = true;
					this.isMissionFuturLoaded = true;
					this.isMissionPastLoaded = true;
				});	
			}
		});
    }

    dayDifference(first, second) {
        if (first)
            first = new Date (first).getTime();
        else
            first = new Date().getTime();
        if (second)
            second = new Date (second).getTime();
        else
            second = new Date().getTime();
        return Math.round((first-second)/(1000*60*60*24)) + 1;
    }

    toStringDate(date: any) {
        if (date)
            date = new Date (date);
        else
            date = new Date();
        return date.getDate() + '/' + (parseInt(date.getMonth())+1) + '/' + date.getFullYear();
    }
    
    goToMissionDetailsPage(contract){
        this.nav.push(MissionDetailsPage,{contract:contract});
    }
	
	goToMissionPointingPage(contract){
		this.nav.push(MissionPointingPage,{contract:contract});
	}
}
