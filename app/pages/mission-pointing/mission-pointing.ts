import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {MissionService} from '../../providers/mission-service/mission-service';
import {DateConverter} from '../../pipes/date-converter/date-converter';
import {TimeConverter} from '../../pipes/time-converter/time-converter';

/*
	Generated class for the MissionPointingPage page.
	
	See http://ionicframework.com/docs/v2/components/#navigation for more info on
	Ionic pages and navigation.
*/
@Component({
	templateUrl: 'build/pages/mission-pointing/mission-pointing.html',
	providers: [MissionService],
	pipes: [DateConverter, TimeConverter]
})
export class MissionPointingPage {
	projectTarget:string;
    isEmployer:boolean;
    themeColor:string;
	
	contract;
	missionHours = [];
	startPauses = [['']];
    endPauses = [['']];
	startPausesPointe = [['']];
    endPausesPointe = [['']];
	idPauses = [];
	nextPointing;
	disableBtnPointing = true;
    
	constructor(private nav: NavController,
				public gc: GlobalConfigs, 
				public navParams:NavParams, 
				private missionService:MissionService) {
		// Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        
        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        
        // Set store variables and messages
        this.themeColor = config.themeColor;
        this.isEmployer = (this.projectTarget=='employer');
		this.contract = navParams.get('contract');
        //retrieve mission hours of tody
		this.missionService.listMissionHours(this.contract, true).then((data) => {
			if(data.data){
				var missionHoursTemp = data.data;
				var array = this.getTodayMission(missionHoursTemp);
				this.missionHours = array[0];
				this.startPauses = array[1];
				this.endPauses = array[2];
				this.idPauses = array[3];
				this.startPausesPointe = array[4];
				this.endPausesPointe = array[5];
				this.disableBtnPointing = this.disablePointing();
				var autoPointing = navParams.get('autoPointing');
				if(autoPointing){
					this.nextPointing = navParams.get('nextPointing')
					this.pointHour(true);
				}
			}
		});
	}
	
	getTodayMission(missionHoursTemp){
		var now = new Date().setHours(0, 0, 0, 0);
		var missionHoursToday = [];
		for(var i = 0; i < missionHoursTemp.length; i++){
			if(new Date(missionHoursTemp[i].jour_debut).setHours(0, 0, 0, 0) == now || new Date(missionHoursTemp[i].jour_fin).setHours(0, 0, 0, 0) == now){
				missionHoursToday.push(missionHoursTemp[i]);
			}
		}
		var array = this.missionService.constructMissionHoursArray(missionHoursToday, true);
		return array;
	}
	
	pointHour(autoPointing){
		if(this.nextPointing){
			var h = new Date().getHours();
			var m = new Date().getMinutes();
			var minutesNow = this.missionService.convertHoursToMinutes(h+':'+m);
			this.nextPointing.pointe = minutesNow;
			this.missionService.savePointing(this.nextPointing).then((data) => {
				if(!autoPointing){
					this.nav.pop();
				}
				else{
					
					//retrieve mission hours of tody
					this.missionService.listMissionHours(this.contract, true).then((data) => {
						if(data.data){
							var missionHoursTemp = data.data;
							var array = this.getTodayMission(missionHoursTemp);
							this.missionHours = array[0];
							this.startPauses = array[1];
							this.endPauses = array[2];
							this.idPauses = array[3];
							this.startPausesPointe = array[4];
							this.endPausesPointe = array[5];
							this.disableBtnPointing = true;
						}
					});
				}
			});
		}
	}
	
	disablePointing(){
		var disabled = true;
		var h = new Date().getHours();
		var m = new Date().getMinutes();
		var minutesNow = this.missionService.convertHoursToMinutes(h+':'+m);
		for(var i = 0; i < this.missionHours.length; i++){
			if(this.missionHours[i].heure_debut - minutesNow <=  10 && this.missionHours[i].heure_debut - minutesNow >=  0 && (this.missionHours[i].heure_debut_pointe == "null" || this.missionHours[i].heure_debut_pointe == "")){
				disabled = false;
				this.nextPointing = {id: this.missionHours[i].id, start: true};
			}
			if(this.missionHours[i].heure_fin - minutesNow <=  10 && this.missionHours[i].heure_fin - minutesNow >=  0 && (this.missionHours[i].heure_fin_pointe == "null" || this.missionHours[i].heure_fin_pointe == "")){
				disabled = false;
				this.nextPointing = {id: this.missionHours[i].id, start: false};
			}
			for(var j = 0; j < this.startPauses[i].length; j++){
				var h = (this.startPauses[i][j]).split(":")[0];
				var m = (this.startPauses[i][j]).split(":")[1];
				var minutesPause = this.missionService.convertHoursToMinutes(h+':'+m);
				if(minutesPause - minutesNow <=  10 && minutesPause - minutesNow >=  0 && !this.startPausesPointe[i][j]){
					disabled = false;
					this.nextPointing = {id: this.missionHours[i].id, start: true, id_pause: this.idPauses[j]};
				}
				var h = (this.endPauses[i][j]).split(":")[0];
				var m = (this.endPauses[i][j]).split(":")[1];
				var minutesPause = this.missionService.convertHoursToMinutes(h+':'+m);
				if(minutesPause - minutesNow <=  10 && minutesPause - minutesNow >=  0 && !this.endPausesPointe[i][j]){
					disabled = false;
					this.nextPointing = {id: this.missionHours[i].id, start: false, id_pause: this.idPauses[j]};
				}
			}
		}
		return disabled;
	}
}