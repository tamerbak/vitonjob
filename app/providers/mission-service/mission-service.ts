import {Injectable} from '@angular/core';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {Http, Headers} from '@angular/http';
import {Storage, SqlStorage} from 'ionic-angular';
import {LocalNotifications} from 'ionic-native';

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

    listMissionHours(contract, forPointing){
        if(forPointing){
			var sql = "SELECT h.pk_user_heure_mission as id, h.jour_debut, h.jour_fin, h.heure_debut, h.heure_fin, h.heure_debut_pointe, h.heure_fin_pointe, p.debut as pause_debut, p.fin as pause_fin, p.debut_pointe as pause_debut_pointe, p.fin_pointe as pause_fin_pointe, p.pk_user_pause as id_pause FROM user_heure_mission as h LEFT JOIN user_pause as p ON p.fk_user_heure_mission = h.pk_user_heure_mission where fk_user_contrat = '"+contract.pk_user_contrat+"'";

		}else{
			var sql = "SELECT h.pk_user_heure_mission as id, h.jour_debut, h.jour_fin, h.heure_debut, h.heure_fin, p.debut as pause_debut, p.fin as pause_fin, p.pk_user_pause as id_pause FROM user_heure_mission as h LEFT JOIN user_pause as p ON p.fk_user_heure_mission = h.pk_user_heure_mission where fk_user_contrat = '"+contract.pk_user_contrat+"'";		
		}
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

    addPauses(missionHours, startPauses, endPauses, contractId){
        //  Init project parameters
        var sql = "update user_contrat set vu = 'Oui' where pk_user_contrat = '" + contractId + "'; ";

        var pauseArrayEmpty;
        for(var i = 0; i < startPauses.length; i++){
            if(startPauses[i].length != 0){
                pauseArrayEmpty = false;
            }else{
                pauseArrayEmpty = true;
            }
        }
        if(!pauseArrayEmpty){
            var valuesString = "";
            for(var i = 0; i < missionHours.length; i++){
                for(var j = 0; j < startPauses[i].length; j++){
                    //convert startpausehour and endpausehour to minutes
                    var startMinute = this.convertHoursToMinutes(startPauses[i][j]);
                    var endMinute = this.convertHoursToMinutes(endPauses[i][j]);
                    valuesString = valuesString + "(" + missionHours[i].id + ", " + startMinute + ", " + endMinute + "),";
                }
            }
            sql = sql + " insert into user_pause (fk_user_heure_mission, debut, fin) values " + valuesString.slice(0, -1) + "; ";
        }

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

    signSchedule(contract){
		var sql;
        if(this.projectTarget == "jobyer"){
			var sql = "update user_contrat set releve_jobyer = 'OUI' where pk_user_contrat = '" + contract.pk_user_contrat + "'; ";
		}else{
			var sql = "update user_contrat set approuve = 'OUI' where pk_user_contrat = '" + contract.pk_user_contrat + "'; ";
		}
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

    validateWork(invoice){
        let payload = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            'id': 162,
            'args': [
                {
                    'class': 'fr.protogen.masterdata.model.CCalloutArguments',
                    label: 'Contrat',
                    value: btoa(JSON.stringify(invoice))
                }
            ]
        };

        console.log(JSON.stringify(payload));

        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'application/json');

            this.http.post(Configs.calloutURL, JSON.stringify(payload), {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    debugger;
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.data = data;
                    if(data.code == '00000'){
                        this.updateContractWithInvoice(invoice);
                    }
                    console.log(this.data);
                    resolve(this.data);
                });
        });
    }

    updateContractWithInvoice(invoice){

        let sql = "update user_contrat set date_paiement_client='"+this.sqlfyDate(new Date())+"', montant_a_payer_par_client="+invoice.amount+", montant_paye_par_client="+invoice.amount+" " +
            "where numero='"+invoice.contractReference+"'";
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

    signContract(contractId){
        var sql = "update user_contrat set signature_jobyer = 'Oui' where pk_user_contrat = '" + contractId + "'; ";
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
	
	updateOptionMission(selectedOption, contractId){
        var sql = "update user_contrat set option_mission = '" + selectedOption + "' where pk_user_contrat = '" + contractId + "'; ";
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
	
	schedulePointeuse(contract, missionHours, startPauses, endPauses, idsPause){
	   var notifArray = [];
	   var j = missionHours.length;
	   var l = 2 * j
	   var nextPointing;
		for(var i = 0; i < missionHours.length; i++){
			var year = new Date(missionHours[i].jour_debut).getFullYear();
			var month = new Date(missionHours[i].jour_debut).getMonth();
			var day = new Date(missionHours[i].jour_debut).getDate();
			var startH = this.convertToFormattedHour(missionHours[i].heure_debut).split(':');
			var endH = this.convertToFormattedHour(missionHours[i].heure_fin).split(':');
			
			nextPointing = {id: missionHours[i].id, start: true};
			var startNotif = {id: i + 1, text: "Vous devez pointer l'heure de début de mission planifiée pour " + startH[0] + ":" + startH[1], at: new Date(year, month, day, startH[0], startH[1]), data : {contract: contract, nextPointing: nextPointing}};
			nextPointing = {id: missionHours[i].id, start: false};
			var endNotif = {id: j + 1, text: "Vous devez pointer l'heure de fin de mission planifiée pour " + endH[0] + ":" + endH[1], at: new Date(year, month, day, endH[0], endH[1]), data : {contract: contract, nextPointing: nextPointing}};
			
			notifArray.push(startNotif);
			notifArray.push(endNotif);
			j++;
			
			for(var k = 0; k < startPauses[i].length; k++){
				var year = new Date(missionHours[i].jour_debut).getFullYear();
				var month = new Date(missionHours[i].jour_debut).getMonth();
				var day = new Date(missionHours[i].jour_debut).getDate();
				var startH = startPauses[i][k].split(':');
				var endH = endPauses[i][k].split(':');
				
				nextPointing = {id: missionHours[i].id, start: true, id_pause: idsPause[k]};
				var startNotifPause = {id: l + 1, text: "Vous devez pointer l'heure de début de pause planifiée pour " + startH[0] + ":" + startH[1], at: new Date(year, month, day, startH[0], startH[1]), data : {contract: contract, nextPointing: nextPointing}};
				nextPointing = {id: missionHours[i].id, start: false, id_pause: idsPause[k]};
				var endNotifPause = {id: l + 2, text: "Vous devez pointer l'heure de fin de pause planifiée pour " + endH[0] + ":" + endH[1], at: new Date(year, month, day, endH[0], endH[1]), data : {contract: contract, nextPointing: nextPointing}};
				
				notifArray.push(startNotifPause);
				notifArray.push(endNotifPause);
				l = l + 2;
			}
	   }
	   
	   LocalNotifications.schedule(notifArray);
	   /*LocalNotifications.schedule({
		   at:new Date(2016, 6, 12, 18, 43),
			id:1,
			text:"Vous devez pointer l'heure de début de mission planifié pour 10:30",
			title:"Notification",
			data: {hour: "10:30"}
	   });*/
    }
	
	constructMissionHoursArray(initialMissionArray, forPointing){
        //index of pause :a mission can have many pauses
        var ids = [];
        var idsPause = [];
		var missionHours = [];
		var startPauses = [['']];
		var endPauses = [['']];
		var startPausesPointe = [['']];
		var endPausesPointe = [['']];
		var k = 0;
        for(var i = 0; i < initialMissionArray.length; i++){
            var m = initialMissionArray[i];
            //if the mission is not yet pushed
            if(ids.indexOf(m.id) == -1){
                //push the mission
				m.heure_debut_pointe = this.convertToFormattedHour(m.heure_debut_pointe);
				m.heure_fin_pointe = this.convertToFormattedHour(m.heure_fin_pointe);
				missionHours.push(m);
                k = missionHours.length - 1;
				//push the id mission to not stock the same mission many time
                ids.push(m.id);
                //push the pauses
                startPauses[k] = [];
                endPauses[k] = [];
				startPausesPointe[k] = [];
				endPausesPointe[k] = [];	
				if(m.pause_debut != "null"){
                    startPauses[k][0] = this.convertToFormattedHour(m.pause_debut);
					idsPause.push(m.id_pause);
				}
				if(m.pause_debut_pointe != "null" && m.pause_debut_pointe != ""){
					startPausesPointe[k][0] = this.convertToFormattedHour(m.pause_debut_pointe);
                }
                if(m.pause_fin != "null"){
                    endPauses[k][0] = this.convertToFormattedHour(m.pause_fin);
				}
				if(m.pause_fin_pointe != "null" && m.pause_fin_pointe != ""){
					endPausesPointe[k][0] = this.convertToFormattedHour(m.pause_fin_pointe);
				}
			}else{
                //if the mission is already pushed, just push its pause
                var idExistMission = ids.indexOf(m.id);
                var j = startPauses[idExistMission].length;
                startPauses[idExistMission][j] = this.convertToFormattedHour(m.pause_debut);
                endPauses[idExistMission][j] = this.convertToFormattedHour(m.pause_fin);
				idsPause.push(m.id_pause);
				startPausesPointe[idExistMission][j] = this.convertToFormattedHour(m.pause_debut_pointe);
				endPausesPointe[idExistMission][j] = this.convertToFormattedHour(m.pause_fin_pointe);
            }
        }
			return [missionHours, startPauses, endPauses, idsPause, startPausesPointe, endPausesPointe];
    }
	
	savePointing(pointing){
		var sql;
		if(pointing.id_pause){
			if(pointing.start){
				sql = "update user_pause set debut_pointe = '" + pointing.pointe + "' where pk_user_pause = '"+pointing.id_pause +"'";
			}else{
				sql = "update user_pause set fin_pointe = '" + pointing.pointe + "' where pk_user_pause = '"+pointing.id_pause +"'";
			}
		}else{
			if(pointing.start){
				sql = "update user_heure_mission set heure_debut_pointe = '" + pointing.pointe + "' where pk_user_heure_mission = '"+pointing.id +"'";
			}else{
				sql = "update user_heure_mission set heure_fin_pointe = '" + pointing.pointe + "' where pk_user_heure_mission = '"+pointing.id +"'";
			}
		}
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
	
	saveCorrectedMissions(id, missionHours, pauseHours){
		var sql = "";
		for(var i = 0; i < missionHours.length; i++){
			var m = missionHours[i];
			var str = "";
			m.value = this.convertHoursToMinutes(m.value);
			if(m.isStart){
				str = " heure_debut_pointe = '" + m.value + "', debut_corrigee = 'OUI' ";
				
			}else{
				str = " heure_fin_pointe = '" + m.value + "', fin_corrigee = 'OUI' ";
			}
			sql = sql + " update user_heure_mission set " + str + " where pk_user_heure_mission = '"+m.id +"'; ";
		}
		for(var i = 0; i < pauseHours.length; i++){
			var p = pauseHours[i];
			var str = "";
			p.value = this.convertHoursToMinutes(p.value);
			if(p.isStart){
				str = " debut_pointe = '" + p.value + "', debut_corrigee = 'OUI' ";
			}else{
				str = " fin_pointe = '" + p.value + "', fin_corrigee = 'OUI' ";
			}
			sql = sql + " update user_pause set " + str + " where pk_user_pause = '"+p.id +"'; ";
		}
		sql = sql + " update user_contrat set releve_employeur = 'OUI' where pk_user_contrat = '" + id + "'; ";
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

	convertToFormattedHour(value){
        var hours = Math.floor(value / 60);
        var minutes = value % 60;
		if(!hours && !minutes){
			return '';
		}else{
			return ((hours < 10 ? ('0' + hours) : hours) + ':' + (minutes < 10 ? ('0' + minutes) : minutes));
		}
    }
    
	convertHoursToMinutes(hour){
		if(hour){
			var hourArray = hour.split(':');
			return 	hourArray[0] * 60 + parseInt(hourArray[1]);
		}        
    }

    sqlfyDate(date){
        let s = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':00+00';
        return s;
    }
}