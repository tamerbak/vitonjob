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
			var sql = "SELECT h.pk_user_heure_mission as id, h.jour_debut, h.jour_fin, h.heure_debut, h.heure_fin, h.heure_debut_pointe, h.heure_fin_pointe, p.debut as pause_debut, p.fin as pause_fin, p.debut_pointe as pause_debut_pointe, p.fin_pointe as pause_fin_pointe, p.pk_user_pause as id_pause FROM user_heure_mission as h LEFT JOIN user_pause as p ON p.fk_user_heure_mission = h.pk_user_heure_mission where fk_user_contrat = '"+contract.pk_user_contrat+"' order by h.jour_debut, p.debut";

		}else{
			var sql = "SELECT h.pk_user_heure_mission as id, h.jour_debut, h.jour_fin, h.heure_debut, h.heure_fin, p.debut as pause_debut, p.fin as pause_fin, p.pk_user_pause as id_pause FROM user_heure_mission as h LEFT JOIN user_pause as p ON p.fk_user_heure_mission = h.pk_user_heure_mission where fk_user_contrat = '"+contract.pk_user_contrat+"' order by h.jour_debut, p.debut";		
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

    addPauses(missionHours, missionPauses, contractId){
        //  Init project parameters
        var sql = "update user_contrat set vu = 'Oui' where pk_user_contrat = '" + contractId + "'; ";

		var valuesString = "";
		for(var i = 0; i < missionHours.length; i++){
			if(missionPauses[i]){
				for(var j = 0; j < missionPauses[i].length; j++){
					//convert startpausehour and endpausehour to minutes
					var startMinute = this.convertHoursToMinutes(missionPauses[i][j].pause_debut);
					var endMinute = this.convertHoursToMinutes(missionPauses[i][j].pause_fin);
					valuesString = valuesString + "(" + missionHours[i].id + ", " + startMinute + ", " + endMinute + "),";
					
				}
			}
		}
		if(valuesString != ""){
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
			var sql = "update user_contrat set releve_jobyer = 'Oui' where pk_user_contrat = '" + contract.pk_user_contrat + "'; ";
		}else{
			var sql = "update user_contrat set approuve = 'Oui' where pk_user_contrat = '" + contract.pk_user_contrat + "'; ";
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
            'id': 194,
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
	
	schedulePointeuse(contract, missionHours, missionPauses){
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
			
			if(missionPauses[i]){
				for(var k = 0; k < missionPauses[i].length; k++){
					var year = new Date(missionHours[i].jour_debut).getFullYear();
					var month = new Date(missionHours[i].jour_debut).getMonth();
					var day = new Date(missionHours[i].jour_debut).getDate();
					var startH = missionPauses[i][k].pause_debut.split(':');
					var endH = missionPauses[i][k].pause_fin.split(':');
					
					nextPointing = {id: missionHours[i].id, start: true, id_pause: missionPauses[i][k].id};
					var startNotifPause = {id: l + 1, text: "Vous devez pointer l'heure de début de pause planifiée pour " + startH[0] + ":" + startH[1], at: new Date(year, month, day, startH[0], startH[1]), data : {contract: contract, nextPointing: nextPointing}};
					nextPointing = {id: missionHours[i].id, start: false, id_pause: missionPauses[i][k].id};
					var endNotifPause = {id: l + 2, text: "Vous devez pointer l'heure de fin de pause planifiée pour " + endH[0] + ":" + endH[1], at: new Date(year, month, day, endH[0], endH[1]), data : {contract: contract, nextPointing: nextPointing}};
					
					notifArray.push(startNotifPause);
					notifArray.push(endNotifPause);
					l = l + 2;
				}
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
	
	constructMissionHoursArray(initialMissionArray){
        //index of pause :a mission can have many pauses
        var ids = [];
		var missionHours = [];
		var missionPauses = [[]];
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
				if(m.id_pause != "null"){
					missionPauses[k] = [{}];
					missionPauses[k][0].id = m.id_pause;
					missionPauses[k][0].pause_debut = this.convertToFormattedHour(m.pause_debut);
					missionPauses[k][0].pause_fin = this.convertToFormattedHour(m.pause_fin);
					missionPauses[k][0].pause_debut_pointe = this.convertToFormattedHour(m.pause_debut_pointe);
					missionPauses[k][0].pause_fin_pointe = this.convertToFormattedHour(m.pause_fin_pointe);
				}
			}else{
                //if the mission is already pushed, just push its pause
                var idExistMission = ids.indexOf(m.id);
                var j = missionPauses[idExistMission].length;
				if(m.id_pause != "null"){
					missionPauses[idExistMission][j] = {};
					missionPauses[idExistMission][j].id = m.id_pause;
					missionPauses[idExistMission][j].pause_debut = this.convertToFormattedHour(m.pause_debut);
					missionPauses[idExistMission][j].pause_fin = this.convertToFormattedHour(m.pause_fin);
					missionPauses[idExistMission][j].pause_debut_pointe = this.convertToFormattedHour(m.pause_debut_pointe);
					missionPauses[idExistMission][j].pause_fin_pointe = this.convertToFormattedHour(m.pause_fin_pointe);
				}				
            }
        }
			return [missionHours, missionPauses];
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
			if(m.heure_debut_corrigee && m.heure_debut_corrigee != ""){
				str = " heure_debut_pointe = '" +this.convertHoursToMinutes(m.heure_debut_corrigee) + "', debut_corrigee = 'Oui' ";
				sql = sql + " update user_heure_mission set " + str + " where pk_user_heure_mission = '"+m.id +"'; ";
			}
			
			if(m.heure_fin_corrigee && m.heure_fin_corrigee != ""){
				str = " heure_fin_pointe = '" + this.convertHoursToMinutes(m.heure_fin_corrigee) + "', fin_corrigee = 'Oui' ";
				sql = sql + " update user_heure_mission set " + str + " where pk_user_heure_mission = '"+m.id +"'; ";
			}
			
			//sql request for pauses
			if(pauseHours[i]){
				for(var j = 0; j < pauseHours[i].length; j++){
					var p = pauseHours[i][j];
					var str = "";
					if(p.pause_debut_corrigee && p.pause_debut_corrigee != ""){
						str = " debut_pointe = '" + this.convertHoursToMinutes(p.pause_debut_corrigee) + "', debut_corrigee = 'Oui' ";
						sql = sql + " update user_pause set " + str + " where pk_user_pause = '"+p.id +"'; ";
					}
					if(p.pause_fin_corrigee && p.pause_fin_corrigee != ""){
						str = " fin_pointe = '" + this.convertHoursToMinutes(p.pause_fin_corrigee) + "', fin_corrigee = 'Oui' ";
						sql = sql + " update user_pause set " + str + " where pk_user_pause = '"+p.id +"'; ";
					}
				}
			}
		}
		
		sql = sql + " update user_contrat set releve_employeur = 'Oui' where pk_user_contrat = '" + id + "'; ";
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
	
	sendInfoBySMS(tel, message){
        tel = tel.replace('+', '00');
        let url = "http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/envoisms";
        let payload = "<fr.protogen.connector.model.SmsModel>"
            + 	"<telephone>"+tel+"</telephone>"
            + 	"<text>" + message + "</text>"
            + "</fr.protogen.connector.model.SmsModel>";

        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/xml');
            this.http.post(url, payload, {headers:headers})
                .subscribe(data => {
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
        })
    }

	getTelByJobyer(id){
		var sql = "select a.telephone from user_account as a, user_jobyer as j where a.pk_user_account = j.fk_user_account and j.pk_user_jobyer = '" + id + "'";
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
	
	getTelByEmployer(id){
		var sql = "select a.telephone from user_account as a, user_entreprise as e where a.pk_user_account = e.fk_user_account and e.pk_user_entreprise = '" + id + "'";
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