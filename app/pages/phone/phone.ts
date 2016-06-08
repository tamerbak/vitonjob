import {Component} from '@angular/core';
import {Alert, NavController, Events, Loading} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {AuthenticationService} from "../../providers/authentication.service";
import {LoadListService} from "../../providers/load-list.service";
import {DataProviderService} from "../../providers/data-provider.service";
import {GlobalService} from "../../providers/global.service";
import {ValidationDataService} from "../../providers/validation-data.service";
import {HomePage} from "../home/home";
import {InfoUserPage} from "../info-user/info-user";
import {Storage, SqlStorage} from 'ionic-angular';
import {enableProdMode} from '@angular/core'; 
enableProdMode();

/**
	* @author Amal ROCHD
	* @description authentication by phone view
	* @module Authentication
*/
@Component({
	templateUrl: 'build/pages/phone/phone.html',
	providers: [AuthenticationService, LoadListService, DataProviderService, GlobalService, ValidationDataService]
})

export class PhonePage {
	projectTarget: string;
	isEmployer: boolean;
	phoneTitle: string;
	themeColor:string;
	public people: any;
	public phone;
	public index;
	public pays = [];
	showEmailField: boolean;
	email: string;
	libelleButton: string;
	password1: string;
	password2: string;
	temp: any;
	
	/**
		* @description While constructing the view, we load the list of countries to display their codes
	*/
	constructor(public nav: NavController,
	public gc: GlobalConfigs, private authService: AuthenticationService, private loadListService: LoadListService, private dataProviderService: DataProviderService, private globalService: GlobalService, private validationDataService: ValidationDataService, public events: Events) {
		// Set global configs
		// Get target to determine configs
		this.projectTarget = gc.getProjectTarget();
		this.storage = new Storage(SqlStorage);
		
		// get config of selected target
		let config = Configs.setConfigs(this.projectTarget);
		
		// Set local variables and messages
		this.themeColor = config.themeColor;
		this.isEmployer = (this.projectTarget == 'employer');
		this.phoneTitle = "Téléphone";
		this.index = 33;
		this.libelleButton = "Se connecter";
		
		//load countries list
		this.loadListService.loadCountries(this.projectTarget).then((data) => {
			this.pays = data.data;
		});
	}
	
	/**
		* @description Display the list of countries in an alert
	*/
	doRadioAlert() {
		let alert = Alert.create();
		alert.setTitle('Choisissez votre pays');
		for (let p of this.pays) {
			alert.addInput({
				type: 'radio',
				label: p.nom,
				value: p.indicatif_telephonique,
				//france code by default checked
				checked: p.indicatif_telephonique == '33'
			});
		}
		alert.addButton('Annuler');
		alert.addButton({
			text: 'Ok',
			handler: data => {
				console.log('Radio data:', data);
				this.testRadioOpen = false;
				this.testRadioResult = data;
				this.index = data;
			}
		});
		
		this.nav.present(alert).then(() => {
			this.testRadioOpen = true;
		});
	}
	
	/**
		* @description function called to authenticate a user
	*/
	authenticate() {
		//this.gc.setCnxBtnName("Déconnexion");
		//this.nav.push(HomePage);
		var indPhone = this.index + this.phone;
		let loading = Loading.create({
			content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
			spinner : 'hide'
		});
		this.nav.present(loading);
		//call the service of autentication
		this.authService.authenticate(this.email, indPhone, this.password1, this.projectTarget)
		.then(data => {
			console.log(data);
			//case of authentication failure : server unavailable or connection probleme 
			if (!data || data.length == 0 || (data.id == 0 && data.status == "failure")) {
				console.log(data);
				loading.dismiss();
				this.globalService.showAlertValidation("VitOnJob", "Serveur non disponible ou problème de connexion.");
				return;
			}
			//case of authentication failure : incorrect password 
			if (data.id == 0 && data.status == "passwordError") {
				console.log("Password error");
				loading.dismiss();
				if(!this.showEmailField){
					this.globalService.showAlertValidation("VitOnJob", "Votre mot de passe est incorrect.");
					}else{
					console.log("used email error");
					this.globalService.showAlertValidation("VitOnJob", "Cette adresse email a été déjà utilisé. Veuillez choisir une autre.");
				}
				return;
			}
			
			//case of authentication success
			this.authService.setObj('connexion', null);
			this.authService.setObj('currentUser', null);
			var connexion = {
				'etat': true,
				'libelle': 'Se déconnecter',
				'employeID' : (this.projectTarget == 'jobyer' ? data.jobyerId : data.employerId)
				//'employeID' : data.jobyerId
			};
			
			//load device token to current account
			var token;
			this.authService.getObj('deviceToken').then(val => {
				token = val;
			});
			var accountId = data.id;
			if (token) {
				console.log("insertion du token : " + token);
				this.authService.insertToken(token, accountId, this.projectTarget);
			}
			
			this.storage.set('connexion', JSON.stringify(connexion));
			this.storage.set('currentUser', JSON.stringify(data));
			this.events.publish('user:login', data);
			
			//user is connected, then change the name of connexion btn to deconnection
			this.gc.setCnxBtnName("Déconnexion");
			loading.dismiss();
			
			//if user is connected for the first time, redirect him to the page 'civility', else redirect him to the home page
			var isNewUser = data.newAccount;
			if (isNewUser) {
				this.globalService.showAlertValidation("VitOnJob", "Bienvenue dans votre espace VitOnJob!");
				this.nav.push(InfoUserPage, {
				currentUser: data});
				} else {
				this.nav.rootNav.setRoot(HomePage);
				//this.nav.push(InfoUserPage, {
				//currentUser: data});
			}
		});
	}
	
	/**
		* @description function called to decide if the auth/inscr button should be disabled
	*/
	isAuthDisabled() {
		if (this.showEmailField == true) {
			//inscription
			return (!this.index || !this.phone || this.showPhoneError() || !this.password1 || this.showPassword1Error() || !this.password2 || this.showPassword2Error() || !this.email || this.showEmailError())
			} else {
			//connection
			return (!this.index || !this.phone || this.showPhoneError() || !this.password1 || this.showPassword1Error())
		}
	}
	
	/**
		* @description validate phone data field and call the function that search for it in the server
	*/
	watchPhone(e) {
		//8 is the keyCode of back
		if(e.keyCode == 8){
			return;
		}
		//190 is the keyCode of dot"."
		if(e.keyCode == 190){
			e.preventDefault();
			return;
		}
		if (this.phone) {
			if (this.phone.length == 8) {
				//get the 9th entered character
				var lastChar = String.fromCharCode(e.keyCode)
				var tempPhone = this.phone + lastChar;
				this.isRegistration(tempPhone);
			}
			if(this.phone.length > 8){
				e.preventDefault();
				return;
			}
		}
	}
	
	/**
		* @description show error msg if phone is not valid
	*/
	showPhoneError(){
		if(this.phone)
		return (this.phone.length != 9);
	}
	
	/**
		* @description function called when the phone input is valid to decide if the form is for inscription or authentication
	*/
	isRegistration(phone) {
		if (this.isPhoneValid(phone)) {
			//On teste si le tél existe dans la base
			var tel = "+" + this.index + phone;
			this.dataProviderService.getUserByPhone(tel, this.projectTarget).then((data) => {
				if (!data || data.status == "failure") {
					console.log(data);
					this.globalService.showAlertValidation("VitOnJob", "Serveur non disponible ou problème de connexion.");
					return;
				}
				if (!data || data.data.length == 0) {
					this.showEmailField = true;
					this.email = "";
					this.libelleButton = "S'inscrire";
					} else {
					this.email = data.data[0]["email"];
					this.libelleButton = "Se connecter";
					this.showEmailField = false;
				}
			});
			} else {
			//ça sera toujours une connexion
			this.showEmailField = true;
			this.libelleButton = "S'inscrire";
			this.email = "";
		}
	}
	
	/**
		* @description validate the phone format
	*/
	isPhoneValid(tel) {
		if (this.phone) {
			var phone_REGEXP = /^0/;
			//check if the phone number start with a zero
			var isMatchRegex = phone_REGEXP.test(tel);
			if (Number(tel.length) == 9 && !isMatchRegex) {
				console.log('phone number is valid');
				return true;
			}
			else
			return false;
		} else
		return false;
	}
	
	/**
		* @description validate the email format
	*/
	showEmailError() {
		if(this.email)
		return !(this.validationDataService.checkEmail(this.email));
		else
		return false
	}
	
	/**
		* @description show error msg if password is not valid
	*/
	showPassword1Error(){
		if(this.password1)
		return this.password1.length < 6;
	}
	
	/**
		* @description check if the password and its confirmation are the same 
	*/
	showPassword2Error(){
		if(this.password2)
		return this.password2 != this.password1;
	}
	
	
	
	/**
		* @description return to the home page
	*/
	goBack() {
		this.nav.rootNav.setRoot(HomePage)
	}
	
	/*passwordForgotten(){
		if(!this.phone || !this.isPhoneValid(this.phone)){
			this.globalService.showAlertValidation("VitOnJob", "Veuillez saisir un numéro de téléphone valide.");
			return;
		}
		let loading = Loading.create({
			content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
			spinner : 'hide'
		});
		this.nav.present(loading);
		var tel = "+" + this.index + this.phone;
		this.authService.setNewPassword(tel).then((data) => {
			if (data && data.status.includes("no account found")) {
				console.log(data);
				loading.dismiss();
				this.globalService.showAlertValidation("VitOnJob", "Aucun compte ne correspond à ce numéro de téléphone.");
				return;
			}
			if (!data || data.status == "failure") {
				console.log(data);
				loading.dismiss();
				this.globalService.showAlertValidation("VitOnJob", "Serveur non disponible ou problème de connexion.");
				return;
			}
			if (!data || data.status == "OK") {
				loading.dismiss();
				this.globalService.showAlertValidation("VitOnJob", "Votre mot de passe a été rénitialisé. Veuillez consulter votre boite email pour le récupérer.");
			}
		});
	}*/
}

