import {Page, NavController,NavParams, ActionSheet, Loading} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {MissionService} from '../../providers/mission-service/mission-service';
import {DatePicker} from 'ionic-native';
import {HomePage} from '../home/home';
import {DateConverter} from '../../pipes/date-converter/date-converter';
import {TimeConverter} from '../../pipes/time-converter/time-converter';
import {GlobalService} from "../../providers/global.service";

/*
	Generated class for the MissionDetailsPage page.
	
	See http://ionicframework.com/docs/v2/components/#navigation for more info on
	Ionic pages and navigation.
*/
@Page({
	templateUrl: 'build/pages/mission-details/mission-details.html',
	pipes: [DateConverter, TimeConverter],
	providers: [GlobalService]
})
export class MissionDetailsPage {
    projectTarget:string;
    isEmployer:boolean;
    themeColor:string;
	
    contract:any;
    missionDetailsTitle:string;
    
    missionIndex:number;
    missionDayIndex:number;
    missionTimeIsFirst:boolean;
    missionTimeIsStart:boolean;
	//records of user_heure_mission of a contract
	missionHours = [];
	//two dimensional array of pauses of mission days
	startPauses = [['']]
	endPauses = [['']]
	
    constructor(public gc: GlobalConfigs, 
	public nav: NavController,
	public navParams:NavParams, 
	private missionService:MissionService, 
	private globalService: GlobalService) {
        
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        
        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        
        // Set local variables and messages
        this.themeColor = config.themeColor;
        this.missionDetailsTitle = "Gestion de la mission";
        this.isEmployer = (this.projectTarget=='employer');
        //get missions
        var contract = navParams.get('contract');
		this.missionService.listMissionHours(contract).then((data) => {
			if(data.data){
				this.missionHours = data.data;
				//initiate pauses array
				this.renitializePauseArray();
			}
		});
	}
	
	renitializePauseArray(){
		var i = 0;
		for(var s in this.missionHours){
			this.startPauses[i] = [];
			this.endPauses[i] = [];
			i++;
		}	
	}
	
	onCardClick(dayIndex){
		//open action sheet menu
		let actionSheet = ActionSheet.create({
			title: 'Actions',
			cssClass: 'action-sheets-basic-page',
			buttons: [
				{
					text: 'Ajouter une pause',
					icon: 'add-circle',
					handler: () => {
						this.addPause(dayIndex);
					}
				},
				{
					text: 'Annuler',
					role: 'cancel', // will always sort to be on the bottom
					icon: 'close',
					handler: () => {
						console.log('Cancel clicked');
					}
				}
			]
		});
		this.nav.present(actionSheet);
	}
	
	onPauseClick(dayIndex, pauseIndex){
		//open action sheet menu
		let actionSheet = ActionSheet.create({
			title: 'Actions',
			cssClass: 'action-sheets-basic-page',
			buttons: [
				{
					text: 'Supprimer la pause',
					icon: 'trash',
					handler: () => {
						this.deletePause(dayIndex, pauseIndex);
					}
				},
				{
					text: 'Annuler',
					role: 'cancel', // will always sort to be on the bottom
					icon: 'close',
					handler: () => {
						console.log('Cancel clicked');
					}
				}
			]
		});
		this.nav.present(actionSheet);
	}
	
	addPause(dayIndex){
		this.startPauses[dayIndex].push("");
		this.endPauses[dayIndex].push("");
	}
	
	deletePause(dayIndex, pauseIndex){
		this.startPauses[dayIndex].splice(pauseIndex, 1);
		this.endPauses[dayIndex].splice(pauseIndex, 1);
	}
	
	validatePauses(){
		let loading = Loading.create({
			content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
			spinner : 'hide'
		});
		this.nav.present(loading);
		this.missionService.addPauses(this.missionHours, this.startPauses, this.endPauses).then((data) => {
			if (!data || data.status == "failure") {
				console.log(data.error);
				loading.dismiss();
				this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde des données");
				return;
				}else{
				// data saved
				console.log("pauses saved successfully : " + data.status);
				loading.dismiss();
				this.nav.pop();
			}					
		});
	}
    
	checkPauseHour(i, j, isStartPause){
		if(isStartPause){
			//start pause should be greater than start mission
			var startPause = this.missionService.convertHoursToMinutes(this.startPauses[i][j]);
			if(this.missionHours[i].heure_debut >= startPause){
				this.globalService.showAlertValidation("VitOnJob", "L'heure de début de pause doit être supérieure à l'heure de début du travail");
				this.startPauses[i][j] = '';
				return;
			}
			//start pause should be less than end mission
			if(this.missionHours[i].heure_fin <= startPause){
				this.globalService.showAlertValidation("VitOnJob", "L'heure de début de pause doit être inférieur à l'heure de fin de travail");
				this.startPauses[i][j] = '';
				return;
			}
			}else{
			var endPause = this.missionService.convertHoursToMinutes(this.endPauses[i][j])			
			//end pause should be greater than start mission 
			if(this.missionHours[i].heure_debut >= endPause){
				this.globalService.showAlertValidation("VitOnJob", "L'heure de fin de pause doit être supérieure à l'heure de début du travail");
				this.endPauses[i][j] = '';
				return;
			}
			//end pause should be less than end mission
			if(this.missionHours[i].heure_fin <= endPause){
				this.globalService.showAlertValidation("VitOnJob", "L'heure de fin de pause doit être inférieur à l'heure de fin de travail");
				this.endPauses[i].splice(j, 1);
				return;
			}
		}
		//start pause should be less than end pause
		if((this.startPauses[i][j]) && (this.endPauses[i][j]) &&(this.endPauses[i][j] <= this.startPauses[i][j])){
			this.globalService.showAlertValidation("VitOnJob", "L'heure de début de pause doit être inférieur à l'heure de fin de pause");
			if(isStartPause)
			this.startPauses[i][j] = '';
			else
			this.endPauses[i][j] = '';
			return;
		}
	}
	
	resetForm(){
		this.renitializePauseArray();
	}
	
	goBack(){
		this.nav.pop();	
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
