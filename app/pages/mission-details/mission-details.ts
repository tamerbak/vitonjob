import {Page, NavController,NavParams} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {MissionService} from '../../providers/mission-service/mission-service';
import {DatePicker} from 'ionic-native';
import {HomePage} from '../home/home';

/*
  Generated class for the MissionDetailsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/mission-details/mission-details.html',
})
export class MissionDetailsPage {
    projectTarget:string;
    isEmployer:boolean;
    themeColor:string;

    mission:any;
    missionDetailsTitle:string;
    
    missionIndex:number;
    missionDayIndex:number;
    missionTimeIsFirst:boolean;
    missionTimeIsStart:boolean;
    
    
    constructor(public gc: GlobalConfigs, 
                public nav: NavController,
                public navParams:NavParams, 
                private missionService:MissionService) {
        
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        
        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        
        // Set local variables and messages
        this.themeColor = config.themeColor;
        this.missionDetailsTitle = "Gestion de la mission";
        this.isEmployer = (this.projectTarget=='employer');
        //get missions
        
        this.mission = navParams.get('mission');
        
        
    }
    
    /**
     * @author daoudi amine
     * @param currentTime string the current time value of the item 
     * @param missionIndex number index of the selected mission 
     * @param dayIndex number index of the day in the mission
     * @param isFirst boolean define if the selected time is the first object 
     * @param isStart boolean define if the selected time is 'start' or 'end' value 
     * @description fake function to change time value in a mission
     */
    
    updateTime(currentTime,missionIndex,dayIndex,isFirst,isStart){
       this.missionIndex = missionIndex;
       this.missionDayIndex = dayIndex;
       this.missionTimeIsFirst = isFirst;
       this.missionTimeIsStart = isStart;
       
       var timeParts = currentTime.split(":");
       var date = new Date();
       date.setHours(timeParts[0]);
       date.setMinutes(timeParts[1]);
       
       console.log(date);
       
       this.showTimePicker(date);
       
    }
    
    /**
     * @author daoudi amine
     * @description show date time picker and work only in device
     */
    showTimePicker(date){
        DatePicker.show({
            date: date,
            mode: 'time',
            is24Hour:true
        }).then(
            date => console.log("Got date: ", date),
            err => console.log("Error occurred while getting date:", err)
        );
    }
    
    
    goToHomePage(){
        this.nav.setRoot(HomePage);
    }
}
