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
	data : any;
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
		var sql = "SELECT pk_user_heure_mission as id, " +
			"jour_debut, " +
			"jour_fin, " +
			"heure_debut, " +
			"heure_fin " +
			"FROM user_heure_mission  " +
			"WHERE fk_user_contrat ="+contract.pk_user_contrat;
		
		console.log(sql);
		
	    return new Promise(resolve => {
			let headers = new Headers();
			headers.append("Content-Type", 'text/plain');
			this.http.post(this.configuration.sqlURL, sql, {headers:headers})
			.map(res => res.json())
			.subscribe(data => {
	            this.data = data.data;
				for(let i = 0 ; i < this.data.length ; i++){
					let date = this.parseDate(this.data[i].jour_debut);
					this.data[i].jour_debut = date;
				}
	            resolve(this.data);
			});
		});
	}

	parseDate(sdate){
		if(sdate.length == 0)
			return '';

		sdate = sdate.split(' ')[0];
		let d = new Date(sdate);

		return d;
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