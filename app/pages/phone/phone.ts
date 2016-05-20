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
	* @description authentication by phone view
	* @module Authentication
*/
@Page({
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
		//call the service of autentication
		this.authService.authenticate(this.email, indPhone, this.password1, this.projectTarget)
		.then(data => {
			console.log(data);
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
			this.authService.setObj('currentEmployer', null);
			var connexion = {
				'etat': true,
				'libelle': 'Se déconnecter',
				'employeID' : (this.projectTarget == 'jobyer' ? data.jobyerId : data.employerId)
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
			this.authService.setObj('connexion', connexion);
			this.authService.setObj('currentEmployer', data);
			
			//user is connected, then change the name of connexion btn to deconnection
			console.log("a" + this.gc.getCnxBtnName());
			this.gc.setCnxBtnName("Déconnexion");
			console.log("b" + this.gc.getCnxBtnName());
			
			//if user is connected for the first time, redirect him to the page 'civility', else redirect him to the home page
			var isNewUser = data.new;
			if (isNewUser == 'true') {
				this.globalService.showAlertValidation("Bienvenue dans votre espace VitOnJob!");
				this.nav.push(InfoUserPage);
				} else {
				this.nav.pop(HomePage);
			}
		});
	}
	
	/**
		* @description function called to decide if the auth/inscr button should be disabled
	*/
	isAuthDisabled() {
		if (this.showEmailField == true) {
			//inscription
			return (!this.index || !this.phone || !this.password1
			|| !this.password2 || !this.email) && !this.password2IsValid()
			} else {
			//connection
			return (!this.index || !this.phone || !this.password1)
		}
	}
	
	/**
		* @description function called on change of the phone input to validate it
	*/
	watchPhone(e, el) {
		if (this.phone) {
			this.phone = this.phone.replace("-", "").replace(".", "").replace("+", "").replace(" ", "").replace("(", "").replace(")", "").replace("/", "").replace(",", "").replace("#", "").replace("*", "").replace(";", "").replace("N", "");
			
			//todo : unreacheable : attribute maxlengthof input equals 9
			if (this.phone.length == 10) {
				if (this.phone.substring(0, 1) == '0') {
					this.phone = this.phone.substring(1, 10);
					} else {
					this.phone = this.phone.substring(0, 9);
				}
			}
			/*$scope.showEmailField = true;
				$scope.formData.email = "";
			$scope.libelleButton = "Se connecter";*/
			if (this.phone.length == 9) {
				this.isRegistration(el);
			}
		}
	}
	
	/**
		* @description function called when the phone input is valid to decide if the form is for inscription or authentication
	*/
	isRegistration(el) {
		if (this.isPhoneValid()) {
			//On teste si le tél existe dans la base
			var tel = "+" + this.index + this.phone;
			this.dataProviderService.getUserByPhone(tel, this.projectTarget).then((data) => {
				if (!data || data.data.length == 0) {
					//el.setFocus();
					this.showEmailField = true;
					//$scope.email = "";
					this.email = "";
					this.libelleButton = "S'inscrire";
					} else {
					//$scope.email = data.data[0]["email"];
					this.email = data.data[0]["email"];
					this.libelleButton = "Se connecter";
					this.showEmailField = false;
				}
			})
			} else {
			//ça sera toujours une connexion
			//el.setFocus();
			this.showEmailField = true;
			//$scope.email = "";
			this.libelleButton = "S'inscrire";
			this.email = "";
		}
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
