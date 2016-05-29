import {Page, Alert, NavController} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {AuthenticationService} from "../../providers/authentication.service";
import {LoadListService} from "../../providers/load-list.service";
import {DataProviderService} from "../../providers/data-provider.service";
import {GlobalService} from "../../providers/global.service";
import {ValidationDataService} from "../../providers/validation-data.service";
import {HomePage} from "../home/home";
import {InfoUserPage} from "../info-user/info-user";

/**
	* @author Amal ROCHD
	* @description authentication by mail view
	* @module Authentication
*/
@Page({
	templateUrl: 'build/pages/mail/mail.html',
	providers: [GlobalConfigs, AuthenticationService, LoadListService, DataProviderService, GlobalService, ValidationDataService]
})
export class MailPage {
	projectTarget: string;
	isEmployer: boolean;
	public people: any;
	public phone;
	public index;
	public pays = [];
	email: string;
	libelleButton: string;
	password1: string;
	password2: string;
	mailTitle: string;
	themeColor: string;
	showPhoneField: boolean
	
	/**
		* @description While constructing the view, we load the list of countries to display their codes
	*/
	constructor(public nav: NavController,
    public gc: GlobalConfigs, private authService: AuthenticationService, private loadListService: LoadListService, private dataProviderService: DataProviderService, private globalService: GlobalService, private validationDataService: ValidationDataService) {
		
		// Set global configs
		// Get target to determine configs
		this.projectTarget = gc.getProjectTarget();
		
		// get config of selected target
		let config = Configs.setConfigs(this.projectTarget);
		
		// Set local variables and messages
		this.isEmployer = (this.projectTarget == 'employer');
		this.mailTitle = "E-mail";
		this.themeColor = config.themeColor;
		this.nav = nav;
		this.index = 33;
		this.libelleButton = "Se connecter";
		
		//load countrie list
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
		//call the service of autentication
		this.authService.authenticate(this.email, indPhone, this.password1, this.projectTarget)
		.then(data => {
			//case of authentication failure : server unavailable or connection probleme 
			if (!data || data.length == 0 || (data.id == 0 && data.status == "failure")) {
				console.log(data);
				this.globalService.showAlertValidation("Serveur non disponible ou problème de connexion.");
				return;
			}
			//case of authentication failure : incorrect password 
			if (data.id == 0 && data.status == "passwordError") {
				console.log("Password error");
				this.globalService.showAlertValidation("Votre mot de passe est incorrect");
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
			var token = this.authService.getObj('deviceToken');
			console.log(token);
			var accountId = data.id;
			console.log(accountId);
			
			if (token) {
				console.log("insertion du token : " + token);
				this.authService.insertToken(token, accountId, this.projectTarget);
			}
			
			//user is connected, then change the name of connexion btn to deconnection
			this.authService.setObj('connexion', JSON.stringify(connexion));
			this.authService.setObj('currentUser', JSON.stringify(data));
			this.gc.setCnxBtnName("Déconnexion");
			
			//if user is connected for the first time, redirect him to the page 'civility', else redirect him to the home page
			var isNewUser = data.newAccount;
			if (isNewUser) {
				this.globalService.showAlertValidation("Bienvenue dans votre espace VitOnJob!");
				this.nav.push(InfoUserPage, {
				currentEmployer: data});
				} else {
				this.nav.pop(HomePage);
			}
		});
	}
	
	/**
		* @description function called to decide if the auth/inscr button should be disabled
	*/
	isAuthDisabled() {
		if (this.showPhoneField == true) {
			//inscription
			return (!this.index || !this.phone || !this.password1
			|| !this.password2 || !this.email) && !this.password2IsValid()
			} else {
			//connection
			return (!this.email || !this.password1)
		}
	}
	
	/**
		* @description function called on change of the email input to validate it
	*/
	watchEmail(e, el) {
		var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		if (!re.test(this.email)) {
			let alert = Alert.create({
				title: 'Email incorrect',
				buttons: ['OK']
			});
			this.nav.present(alert);
			} else {
			this.isRegistration(el);
		}
	}
	
	/**
		* @description function called when the email input is valid to decide if the form is for inscription or authentication
	*/
	isRegistration(el) {
		//verify if the email exist in the database
		this.dataProviderService.getUserByMail(this.email, this.projectTarget).then((data) => {
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
	validateEmail(e) {
		//this.validationDataService.checkEmail(e);
	}
	
	/**
		* @description check if the password and its confirmation are the same 
	*/
	password2IsValid() {
		return (
		this.password1 == this.password2
		)
	}
	
	/**
		* @description return to the home page
	*/
	goBack() {
		this.nav.pop(HomePage);
	}
}	