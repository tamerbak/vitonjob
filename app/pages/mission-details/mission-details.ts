import {
	NavController, NavParams, ActionSheet, Loading, Platform, Modal, Storage, LocalStorage,
	Picker, PickerColumnOption, SqlStorage, Alert
} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {MissionService} from '../../providers/mission-service/mission-service';
import {PushNotificationService} from '../../providers/push-notification-service/push-notification-service';
import {DatePicker} from 'ionic-native';
import {HomePage} from '../home/home';
import {Component} from "@angular/core";
import {DateConverter} from '../../pipes/date-converter/date-converter';
import {TimeConverter} from '../../pipes/time-converter/time-converter';
import {GlobalService} from "../../providers/global.service";
import {ModalInvoicePage} from "../modal-invoice/modal-invoice";
import {NotationService} from "../../providers/notation-service/notation-service";
import {ModalTrackMissionPage} from "../modal-track-mission/modal-track-mission";
import {LocalNotifications} from 'ionic-native';
import {NgZone} from '@angular/core';

/*
	Generated class for the MissionDetailsPage page.
	
	See http://ionicframework.com/docs/v2/components/#navigation for more info on
	Ionic pages and navigation.
*/
@Component({
	templateUrl: 'build/pages/mission-details/mission-details.html',
	pipes: [DateConverter, TimeConverter],
	providers: [GlobalService, PushNotificationService, NotationService]
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
	initialMissionHours = [];
	//two dimensional array of pauses of mission days
	isNewMission = true;
	contractSigned = false;
	
	store : Storage;
	invoiceReady : boolean =  false;
	
	rating : number = 0;
	starsText : string = '';
	db : Storage;
	
	contract;
	optionMission: string;
	
	constructor(private platform:Platform,
				public gc: GlobalConfigs,
				public nav: NavController,
				public navParams:NavParams,
				private missionService:MissionService,
				private globalService: GlobalService,
				private pushNotificationService: PushNotificationService,
				private notationService : NotationService,
				private zone:NgZone) {
		
		this.store = new Storage(LocalStorage);
		this.db = new Storage(SqlStorage);
		
		this.platform = platform;
		// Get target to determine configs
		this.projectTarget = gc.getProjectTarget();
		
		// get config of selected target
		let config = Configs.setConfigs(this.projectTarget);
		
		// Set store variables and messages
		this.themeColor = config.themeColor;
		this.missionDetailsTitle = "Gestion de la mission";
		this.isEmployer = (this.projectTarget=='employer');
		//get missions
		this.contract = navParams.get('contract');
		//verify if the mission has already pauses
		this.isNewMission = this.contract.vu.toUpperCase() == 'Oui'.toUpperCase() ? false : true;
		var forPointing = this.contract.option_mission != "1.0" ? true : false;
		this.missionService.listMissionHours(this.contract, forPointing).then((data) => {
			if(data.data){
				this.initialMissionHours = data.data;
				//initiate pauses array
				var array = this.missionService.constructMissionHoursArray(this.initialMissionHours);
				this.missionHours = array[0];
				this.missionPauses = array[1];
				//this.startPauses = array[1];
				//this.endPauses = array[2];
				//this.idsPauses = array[3];
				//this.startPausesPointe = array[4];
				//this.endPausesPointe = array[5];
			}
		});
		
		if(this.contract.numero_de_facture && this.contract.numero_de_facture != 'null')
		this.invoiceReady = true;
		
		if(!this.contract.option_mission || this.contract.option_mission == "null"){
			this.optionMission = "Option de suivi de mission n° 1 est activée par défaut."
			}else{
			this.optionMission = "Option de suivi de mission n° " + this.contract.option_mission.substring(0, 1) + " activée";
		}
		
		//  Getting contract score
		this.notationService.loadContractNotation(this.contract, this.projectTarget).then(score=>{
			this.rating = score;
			this.starsText = this.writeStars(this.rating);
		});
	}
	
	onCardClick(dayIndex){
		if(!this.isNewMission || !this.isEmployer || this.contract.signature_jobyer.toUpperCase() == 'Non'.toUpperCase()){
			return;
		}
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
		if(!this.isNewMission || !this.isEmployer){
			return;
		}
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
		if(!this.missionPauses[dayIndex]){
			this.missionPauses[dayIndex] = [{}];
		}else{
			this.missionPauses[dayIndex].push([{}]);
		}
	}
	
	deletePause(dayIndex, pauseIndex){
		this.missionPauses[dayIndex].splice(pauseIndex, 1);
		this.missionPauses[dayIndex].splice(pauseIndex, 1);
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
		this.nav.present(loading).then(()=> {
			this.missionService.addPauses(this.missionHours, this.missionPauses, this.contract.pk_user_contrat).then((data) => {
				if (!data || data.status == "failure") {
					console.log(data.error);
					loading.dismiss();
					this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde des données");
					return;
					}else{
					// data saved
					console.log("pauses saved successfully : " + data.status);
				}
			});
			loading.dismiss();
			var message = "Horaire du contrat n°" + this.contract.numero + " validé";
			var objectifNotif = "MissionDetailsPage";
			this.sendPushNotification(message, objectifNotif, "toJobyer");
			this.sendInfoBySMS(message, "toJobyer");
			if(this.contract.option_mission != "1.0"){
				this.missionService.schedulePointeuse(this.contract, this.missionHours, this.missionPauses);
			} 
			this.nav.pop();
		});
	}
	
	sendPushNotification(message, objectifNotif, who){
		var id = (who == "toJobyer" ? this.contract.fk_user_jobyer : this.contract.fk_user_entreprise);
		this.pushNotificationService.getToken(id, who).then(token => {
			this.pushNotificationService.sendPushNotification(token, message, this.contract, objectifNotif).then(data => {
				this.globalService.showAlertValidation("VitOnJob", "Notification envoyée.");
			});
		});
	}
	
	sendInfoBySMS(message, who){
		if(who == "toJobyer"){
			this.missionService.getTelByJobyer(this.contract.fk_user_jobyer).then((data) => {
				this.missionService.sendInfoBySMS(data.data[0]["telephone"], message);
			});
		}else{
			this.missionService.getTelByEmployer(this.contract.fk_user_entreprise).then((data) => {
				this.missionService.sendInfoBySMS(data.data[0]["telephone"], message);
			});
		}
	}
	
	checkPauseHours(i, j, isStartPause, isStartMission){
		var startMission = this.missionHours[i].heure_debut;
		var endMission = this.missionHours[i].heure_fin;
		var startPause = this.missionPauses[i][j].pause_debut;
		var endPause = this.missionPauses[i][j].pause_fin;
		
		if(isStartPause){
			if(startMission >= startPause){
				this.globalService.showAlertValidation("VitOnJob", "L'heure de début de pause doit être supérieure à l'heure de début de travail.");
				this.missionPauses[i][j].pause_debut = "";
				return;
			}
			if(endMission <= startPause){
				this.globalService.showAlertValidation("VitOnJob", "L'heure de début de pause doit être inférieure à l'heure de fin de travail.");
				this.missionPauses[i][j].pause_debut = "";
				return;
			}
			if(endPause <= startPause){
				this.globalService.showAlertValidation("VitOnJob", "L'heure de début de pause doit être inférieure à l'heure de fin de pause.");
				this.missionPauses[i][j].pause_debut = "";
				return;
			}
			for(var k = 0; k < this.missionPauses[i].length; k++){
				var startOtherPause = this.missionPauses[i][k].pause_debut;
				var endOtherPause = this.missionPauses[i][k].pause_fin;
				if(j < k && (startPause >= startOtherPause || startPause >= endOtherPause)){
					this.globalService.showAlertValidation("VitOnJob", "L'heure de début de pause doit être inférieure aux heures de pauses postérieurs.");
					this.missionPauses[i][j].pause_debut = "";
					return;
				}
				if(j > k && (startPause <= startOtherPause || startPause <= endOtherPause)){
					this.globalService.showAlertValidation("VitOnJob", "L'heure de début de pause doit être supérieure aux heures de pauses antérieurs.");
					this.missionPauses[i][j].pause_debut = "";
					return;
				}
			}
		}else{
			if(j >= 0){
				if(startMission >= endPause){
					this.globalService.showAlertValidation("VitOnJob", "L'heure de fin de pause doit être supérieure à l'heure de début de travail.");
					this.missionPauses[i][j].pause_fin = "";
					return;
				}
				if(endMission <= endPause){
					this.globalService.showAlertValidation("VitOnJob", "L'heure de fin de pause doit être inférieure à l'heure de fin de travail.");
					this.missionPauses[i][j].pause_fin = "";
					return;
				}
				if(endPause <= startPause){
					this.globalService.showAlertValidation("VitOnJob", "L'heure de fin de pause doit être supérieure à l'heure de début de pause.");
					this.missionPauses[i][j].pause_fin = "";
					return;
				}
				for(var k = 0; k < this.missionPauses[i].length; k++){
					var startOtherPause = this.missionPauses[i][k].pause_debut;
					var endOtherPause = this.missionPauses[i][k].pause_fin;
					if(j < k && (endPause >= startOtherPause || endPause >= endOtherPause)){
						this.globalService.showAlertValidation("VitOnJob", "L'heure de fin de pause doit être inférieure aux heures de pauses postérieurs.");
						this.missionPauses[i][j].pause_fin = "";
						return;
					}
					if(j > k && (endPause <= startOtherPause || endPause <= endOtherPause)){
						this.globalService.showAlertValidation("VitOnJob", "L'heure de fin de pause doit être supérieure aux heures de pauses antérieurs.");
						this.missionPauses[i][j].pause_fin = "";
						return;
					}
				}
			}
		}
	}
	
	checkPointedHours(i, j, isStartPause, isStartMission){
		var startMission = this.missionHours[i].heure_debut_pointe;
		var endMission = this.missionHours[i].heure_fin_pointe;
		if(j >= 0){
			var startPause = this.missionPauses[i][j].pause_debut_pointe;
			var endPause = this.missionPauses[i][j].pause_fin_pointe;
		}
		
		if(isStartPause){
			if(startMission >= startPause && startMission != ""){
				this.globalService.showAlertValidation("VitOnJob", "L'heure de début de pause doit être supérieure à l'heure de début de travail.");
				this.missionPauses[i][j].pause_debut_pointe = "";
				return;
			}
			if(endMission <= startPause  && endMission != ""){
				this.globalService.showAlertValidation("VitOnJob", "L'heure de début de pause doit être inférieure à l'heure de fin de travail.");
				this.missionPauses[i][j].pause_debut_pointe = "";
				return;
			}
			if(endPause <= startPause && endPause != ""){
				this.globalService.showAlertValidation("VitOnJob", "L'heure de début de pause doit être inférieure à l'heure de fin de pause.");
				this.missionPauses[i][j].pause_debut_pointe = "";
				return;
			}
			for(var k = 0; k < this.missionPauses[i].length; k++){
				var startOtherPause = this.missionPauses[i][k].pause_debut_pointe;
				var endOtherPause = this.missionPauses[i][k].pause_fin_pointe;
				if(j < k && ((startPause >= startOtherPause && startOtherPause != "") || (startPause >= endOtherPause && endOtherPause != ""))){
					this.globalService.showAlertValidation("VitOnJob", "L'heure de début de pause doit être inférieure aux heures de pauses postérieurs.");
					this.missionPauses[i][j].pause_debut_pointe = "";
					return;
				}
				if(j > k && ((startPause <= startOtherPause && startOtherPause != "") || (startPause <= endOtherPause && endOtherPause != ""))){
					this.globalService.showAlertValidation("VitOnJob", "L'heure de début de pause doit être supérieure aux heures de pauses antérieurs.");
					this.missionPauses[i][j].pause_debut_pointe = "";
					return;
				}
			}
		}else{
			if(j >= 0){
				if(startMission >= endPause && startMission != ""){
					this.globalService.showAlertValidation("VitOnJob", "L'heure de fin de pause doit être supérieure à l'heure de début de travail.");
					this.missionPauses[i][j].pause_fin_pointe = "";
					return;
				}
				if(endMission <= endPause && endMission != ""){
					this.globalService.showAlertValidation("VitOnJob", "L'heure de fin de pause doit être inférieure à l'heure de fin de travail.");
					this.missionPauses[i][j].pause_fin_pointe = "";
					return;
				}
				if(endPause <= startPause && startPause != ""){
					this.globalService.showAlertValidation("VitOnJob", "L'heure de fin de pause doit être supérieure à l'heure de début de pause.");
					this.missionPauses[i][j].pause_fin_pointe = "";
					return;
				}
				for(var k = 0; k < this.missionPauses[i].length; k++){
					var startOtherPause = this.missionPauses[i][k].pause_debut_pointe;
					var endOtherPause = this.missionPauses[i][k].pause_fin_pointe;
					if(j < k && ((endPause >= startOtherPause && startOtherPause != "") || (endPause >= endOtherPause && endOtherPause != ""))){
						this.globalService.showAlertValidation("VitOnJob", "L'heure de fin de pause doit être inférieure aux heures de pauses postérieurs.");
						this.missionPauses[i][j].pause_fin_pointe = "";
						return;
					}
					if(j > k && ((endPause <= startOtherPause && startOtherPause != "") || (endPause <= endOtherPause && endOtherPause != ""))){
						this.globalService.showAlertValidation("VitOnJob", "L'heure de fin de pause doit être supérieure aux heures de pauses antérieurs.");
						this.missionPauses[i][j].pause_fin_pointe = "";
						return;
					}
				}
			}
		}
		if(isStartMission){
			if(startMission >= endMission && endMission != ""){
				this.globalService.showAlertValidation("VitOnJob", "L'heure de début de travail doit être inférieure à l'heure de fin de travail.");
				this.missionHours[i].heure_debut_pointe = "";
				return;
			}
			for(var k = 0; k < this.missionPauses[i].length; k++){
				var startOtherPause = this.missionPauses[i][k].pause_debut_pointe;
				var endOtherPause = this.missionPauses[i][k].pause_fin_pointe;
				if((startMission >= startOtherPause && startOtherPause != "") || (startMission >= endOtherPause && endOtherPause != "")){
					this.globalService.showAlertValidation("VitOnJob", "L'heure de début de travail doit être inférieure aux heures de pauses.");
					this.missionHours[i].heure_debut_pointe = "";
					return;
				}
			}		
		}else{
			if((!j && j!= 0) || j < 0){
				if(startMission >= endMission && startMission != ""){
					this.globalService.showAlertValidation("VitOnJob", "L'heure de fin de travail doit être supérieure à l'heure de début de travail.");
					this.missionHours[i].heure_fin_pointe = "";
					return;
				}
				for(var k = 0; k < this.missionPauses[i].length; k++){
					var startOtherPause = this.missionPauses[i][k].pause_debut_pointe;
					var endOtherPause = this.missionPauses[i][k].pause_fin_pointe;
					if((endMission <= startOtherPause && startOtherPause != "") || (endMission <= endOtherPause && endOtherPause != "")){
						this.globalService.showAlertValidation("VitOnJob", "L'heure de fin de travail doit être supérieure aux heures de pauses.");
						this.missionHours[i].heure_fin_pointe = "";
						return;
					}
				}
			}
		}
	}	
	
	saveCorrectedHours(i, j, isStartPause, isStartMission){
		if(isStartPause){
				this.missionPauses[i][j].pause_debut_corrigee = this.missionPauses[i][j].pause_debut_pointe;
				return;
			}else{
				if(j >= 0){
					this.missionPauses[i][j].pause_fin_corrigee = this.missionPauses[i][j].pause_fin_pointe;
					return;
				}
			}
			if(isStartMission){
				this.missionHours[i].heure_debut_corrigee = this.missionHours[i].heure_debut_pointe;
				return;
			}else{
				if(!j){
					this.missionHours[i].heure_fin_corrigee = this.missionHours[i].heure_fin_pointe;
					return;
				}
			}
	}
	
	checkHour(i, j, isStartPause, pointing, isStartMission){
		if(pointing){
			//after checking hour validity, save corrected hours
			this.checkPointedHours(i, j, isStartPause, isStartMission);
			this.saveCorrectedHours(i, j, isStartPause, isStartMission);
		}else{
			this.checkPauseHours(i, j, isStartPause, isStartMission);
		}
	}
	
	generateTimesheet(){
		this.missionService.saveCorrectedMissions(this.contract.pk_user_contrat, this.missionHours, this.missionPauses).then((data) => {
			if(data && data.status == "success"){
				console.log("timesheet saved");
				var message = "Vous avez reçu le relevé d'heure de contrat n°" + this.contract.numero;
				var objectifNotif = "MissionDetailsPage";
				this.sendPushNotification(message, objectifNotif, "toJobyer");
				this.sendInfoBySMS(message, "toJobyer");
				this.nav.pop();
			}
		});
	}
	
	signSchedule(){
		let loading = Loading.create({
			content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
			spinner : 'hide',
			duration: 10000
		});
		
		this.nav.present(loading).then(()=> {
			this.missionService.signSchedule(this.contract).then((data) => {
				if (!data || data.status == "failure") {
					console.log(data.error);
					loading.dismiss();
					this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde des données");
					return;
					}else{
					// data saved
					console.log("schedule signed : " + data.status);
					if(this.contract.option_mission == "2.0" && !this.isEmployer){
						var message = "Le relevé d'heure du contrat n° " + this.contract.numero + " a été signé.";
						var objectifNotif = "MissionDetailsPage";
						this.sendPushNotification(message, objectifNotif, "toEmployer");
						this.sendInfoBySMS(message, "toEmployer");
					}
				}
			});
			loading.dismiss();
			this.nav.pop();
		});
	}
		
	displaySignAlert(){
		let confirm = Alert.create({
			title: "VitOnJob",
			message: "Signature fin de mission",
			buttons: [
				{
					text: 'Annuler',
					handler: () => {
						console.log('No clicked');
					}
				},
				{
					text: 'Signer',
					handler: () => {
						console.log('Yes clicked');	
						confirm.dismiss().then(() => {
							this.signSchedule();
						})
					}
				}
			]
		});
		this.nav.present(confirm);
	}
	
	validateWork(){
		this.store.set('CONTRACT_INVOICE', JSON.stringify(this.contract)).then(data => {
			this.nav.push(ModalInvoicePage);
		});
		
	}
	
	resetForm(){
		var array = this.missionService.constructMissionHoursArray(this.initialMissionHours);
		this.missionHours = array[0];
		this.missionPauses = array[1];
	}
	
	goBack(){
		this.nav.pop();
	}
	
	convertToFormattedHour(value){
		var hours = Math.floor(value / 60);
		var minutes = value % 60;
		return ((hours < 10 ? ('0' + hours) : hours) + ':' + (minutes < 10 ? ('0' + minutes) : minutes));
	}
	
	watchSignedToggle(e){
		let loading = Loading.create({
			content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
			spinner : 'hide',
			duration: 10000
		});
		this.nav.present(loading).then(()=> {
			this.missionService.signContract(this.contract.pk_user_contrat).then((data) => {
				if (!data || data.status == "failure") {
					console.log(data.error);
					loading.dismiss();
					this.globalService.showAlertValidation("VitOnJob", "Erreur lors de la sauvegarde des données");
					return;
					}else{
					// data saved
					console.log("contract signed : " + data.status);
					this.contract.signature_jobyer = 'Oui';
				}
			});
			if(this.contract.option_mission != "1.0"){
				this.missionService.schedulePointeuse(this.contract, this.missionHours, this.missionPauses);
			} 
			loading.dismiss();
		});
	}
	
	launchContractPage() {
		this.platform.ready().then(() => {
			cordova.InAppBrowser.open(this.contract.lien_jobyer, "_system", "location=true");
		});
	}
	
	disableTimesheetButton(){
		var disable;
		var k = 0;
		for(var i = 0; i < this.missionHours.length; i++){
			var m = this.missionHours[i];
			if(!m.heure_debut_pointe || m.heure_debut_pointe == "null" || !m.heure_fin_pointe || m.heure_fin_pointe == "null"){
				disable = true;
				return disable;
			}else{
				disable = false;
			}
			if(this.missionPauses[i]){
				for(var j = 0; j < this.missionPauses[i].length; j++){
					if(this.missionPauses[i][j].pause_debut_pointe == "" || this.missionPauses[i][j].pause_fin_pointe == ""){
						disable = true;
						return disable;
					}else{
						disable = false;
					}
				}
			}
		}
		return disable;
	}
	
	changeOption(){
		let modal = Modal.create(ModalTrackMissionPage);
		this.nav.present(modal);
		modal.onDismiss(selectedOption => {
			if(selectedOption){
				this.missionService.updateOptionMission(selectedOption, this.contract.pk_user_contrat).then((data) => {
					if(!data || data.status == 'failure'){
						this.globalService.showAlertValidation("VitOnJob", "Une erreur est survenue lors de la sauvegarde des données.");
						}else{
						console.log("option mission saved successfully");
						this.contract.option_mission = selectedOption;
						this.optionMission = "Option de suivi de mission n°" + selectedOption + " activée";
					}
				});
			}
		});
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
	
	/**
		* Stars picker
	*/
	setStarPicker() {
		
		let picker = Picker.create();
		let options:PickerColumnOption[] = new Array<PickerColumnOption>();
		for (let i = 1; i <= 5; i++) {
			options.push({
				value: i,
				text: this.writeStars(i)
			})
		}
		
		let column = {
			selectedIndex: this.rating,
			options: options
		};
		picker.addColumn(column);
		picker.addButton('Annuler');
		picker.addButton({
			text: 'OK',
			handler: data => {
				debugger;
				this.rating = data.undefined.value;
				this.starsText = this.writeStars(this.rating);
				this.notationService.saveContractNotation(this.contract, this.projectTarget, this.rating);
			}
		});
		this.nav.present(picker);
	}
	
	/**
		* writing stars
		* @param number of stars writed
	*/
	writeStars(number:number):string {
		let starText = '';
		for (let i = 0; i < number; i++) {
			starText += '\u2605'
		}
		return starText;
	}
}