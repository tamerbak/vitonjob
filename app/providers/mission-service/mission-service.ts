import {Injectable} from '@angular/core';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {Http, Headers} from '@angular/http';
import {Storage, SqlStorage} from 'ionic-angular';


/**
	* @author daoudi amine
	* @description ???
	* @module Mission
*/
@Injectable()
export class MissionService {
    configuration : any;
    projectTarget:string;
    db:any;
    
    constructor(public http: Http,public gc: GlobalConfigs) {
        this.db = new Storage(SqlStorage);
		// Get target to determine configs
		this.projectTarget = gc.getProjectTarget();
		this.configuration = Configs.setConfigs(this.projectTarget);
	}
	
	listMissionHours(contract){
		//  Init project parameters
		var sql = "SELECT h.pk_user_heure_mission as id, h.jour_debut, h.jour_fin, h.heure_debut, h.heure_fin, p.debut as pause_debut, p.fin as pause_fin FROM user_heure_mission as h, user_pause as p where fk_user_contrat = '"+contract.pk_user_contrat+"' and p.fk_user_heure_mission = h.pk_user_heure_mission";
		
		console.log(sql);
		
	    return new Promise(resolve => {
			let headers = new Headers();
			headers.append("Content-Type", 'text/plain');
			this.http.post(this.configuration.sqlURL, sql, {headers:headers})
			.map(res => res.json())
			.subscribe(data => {
	            this.data = data;
	            resolve(this.data);
			});
		});
	}
	
	addPauses(missionHours, startPauses, endPauses){
		//  Init project parameters
		var valuesString = "";
		for(var i = 0; i < missionHours.length; i++){
			for(var j = 0; j < startPauses[i].length; j++){
				//convert startpausehour and endpausehour to minutes
				var startMinute = this.convertHoursToMinutes(startPauses[i][j]);
				var endMinute = this.convertHoursToMinutes(endPauses[i][j]);
				valuesString = valuesString + "(" + missionHours[i].id + ", " + startMinute + ", " + endMinute + "),"
			}
		}
		var sql = "insert into user_pause (fk_user_heure_mission, debut, fin) values " + valuesString.slice(0, -1);
		
		console.log(sql);
		
	    return new Promise(resolve => {
			let headers = new Headers();
			headers.append("Content-Type", 'text/plain');
			this.http.post(this.configuration.sqlURL, sql, {headers:headers})
			.map(res => res.json())
			.subscribe(data => {
	            this.data = data;
	            resolve(this.data);
			});
		});
	}
	
	convertHoursToMinutes(hour){
		var hourArray = hour.split(':');
		return 	hourArray[0] * 60 + parseInt(hourArray[1]);
	}
}