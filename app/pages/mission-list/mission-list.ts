import {Page, NavController} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {MissionService} from '../../providers/mission-service/mission-service';
import {DatePicker} from 'ionic-native';
import {MissionDetailsPage} from '../mission-details/mission-details';

/*
  Generated class for the MissionListPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/mission-list/mission-list.html',
})
export class MissionListPage {
    projectTarget:string;
    isEmployer:boolean;
    themeColor:string;

    employer:any;
    jobyer:any;
    society:string;
    missionsList:any;
    missionListTitle:string;
    
    
    constructor(public gc: GlobalConfigs, 
                public nav: NavController, 
                private missionService:MissionService) {
        
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        
        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        
        // Set local variables and messages
        this.themeColor = config.themeColor;
        this.missionListTitle = "Gestion des missions";
        this.isEmployer = (this.projectTarget=='employer');
        //get missions
        
        missionService.getMissions().then(results =>{
            var jsonData = JSON.parse(results);
            //var jsonData = results;
            if(jsonData){
                this.missionsList = jsonData;
            }
        });
        
        
    }
    
    goToMissionDetailsPage(mission){
        this.nav.push(MissionDetailsPage,{mission:mission});
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
