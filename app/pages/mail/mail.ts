import {Component} from '@angular/core';
import {Alert, NavController, NavParams, Events, Loading} from 'ionic-angular';
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


/**
	* @author Amal ROCHD
	* @description authentication by mail view
	* @module Authentication
*/
@Component({
	templateUrl: 'build/pages/mail/mail.html',
	providers: [AuthenticationService, LoadListService, DataProviderService, GlobalService, ValidationDataService]
})
export class MailPage {
	projectTarget: string;
	isEmployer: boolean;
	mailTitle: string;
	themeColor: string;
	public people: any;
	public phone;
	public index;
	public pays = [];
	showPhoneField: boolean
	email: string;
	libelleButton: string;
	password1: string;
	password2: string;
	
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
		this.mailTitle = "E-mail";
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
			//case of authentication failure : server unavailable or connection probleme 
			if (!data || data.length == 0 || (data.id == 0 && data.status == "failure")) {
				console.log(data);
				this.globalService.showAlertValidation("VitOnJob", "Serveur non disponible ou problème de connexion.");
				return;
			}
			//case of authentication failure : incorrect password 
			if (data.id == 0 && data.status == "passwordError") {
				console.log("Password error");
				loading.dismiss();
				this.globalService.showAlertValidation("VitOnJob", "Votre mot de passe est incorrect");
				return;
			}
			
			//case of authentication success
			this.authService.setObj('connexion', null);
			this.authService.setObj('currentUser', null);
			var connexion = {
				'etat': true,
				'libelle': 'Se déconnecter',
				'employeID': (this.projectTarget == 'jobyer' ? data.jobyerId : data.employerId)
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
			this.events.publish('user:login');
			
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
		if (this.showPhoneField == true) {
			//inscription
			return (!this.index || !this.phone || this.showPhoneError() || !this.password1 || this.showPassword1Error() || !this.password2 || this.showPassword2Error() || !this.email || this.showEmailError())
			} else {
			//connection
			return (!this.index || !this.email || !this.password1)
		}
	}
	
	/**
		* @description function called on change of the phone input to validate it
	*/
	checkForString(e){
		if (e.keyCode < 48 || e.keyCode > 57){
			e.preventDefault();
			return;
		}
	}
	
	/**
		* @description function called on change of the email input to validate it
	*/
	watchEmail(e, el) {
		if(this.validationDataService.checkEmail(this.email)){
				this.isRegistration(el);
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
		* @description function called when the email input is valid to decide if the form is for inscription or authentication
	*/
	isRegistration(el) {
		//verify if the email exist in the database
		this.dataProviderService.getUserByMail(this.email, this.projectTarget).then((data) => {
			if (!data || data.status == "failure") {
					console.log(data);
					this.globalService.showAlertValidation("VitOnJob", "Serveur non disponible ou problème de connexion.");
					return;
				}
			if (!data || data.data.length == 0) {
				//el.setFocus();
				this.showPhoneField = true;
				this.phone = "";
				this.libelleButton = "S'inscrire";
				} else {
				//$scope.email = data.data[0]["email"];
				this.email = data.data[0]["email"];
				this.libelleButton = "Se connecter";
				this.showPhoneField = false;
			}
		})
	}
	
	/**
		* @description validate the phone format
	*/
	isPhoneValid() {
		if (this.phone != undefined) {
			var phone_REGEXP = /^0/;
			var isMatchRegex = phone_REGEXP.test(this.phone);
			console.log("isMatchRegex = " + isMatchRegex);
			if (Number(this.phone.length) >= 9 && !isMatchRegex) {
				console.log('test phone');
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
		if(this.password1 && this.showEmailField)
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
		this.nav.pop(HomePage);
	}
}	