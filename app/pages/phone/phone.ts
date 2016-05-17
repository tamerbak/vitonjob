import {Page, Alert, NavController} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {SearchService} from '../../providers/search-service/search-service';
import {AuthenticationService} from "../../providers/authentication.service";
import {LoadListService} from "../../providers/load-list.service";
import {DataProviderService} from "../../providers/data-provider.service";
import {HomePage} from "../home/home";
import 'rxjs/add/operator/catch';
//import { enableProdMode } from 'angular2/core';
// enable production mode and thus disable debugging information
//enableProdMode();

/*
	Generated class for the PhonePage page.
	
	See http://ionicframework.com/docs/v2/components/#navigation for more info on
	Ionic pages and navigation.
*/
@Page({
	templateUrl: 'build/pages/phone/phone.html',
	providers: [GlobalConfigs, SearchService, AuthenticationService, LoadListService, DataProviderService]
})

export class PhonePage {
	projectTarget: string;
	isEmployer: boolean;
	phoneTitle: string;
	public people: any;
	public phone;
	public index;
	public pays = [];
	showEmailField: boolean;
	email: string;
	libelleButton: string;
	password1: string;
	password2: string;
	public temp: any;
	
	
	constructor(public nav: NavController,
	public gc: GlobalConfigs, private authService: AuthenticationService, private loadListService: LoadListService, private dataProviderService: DataProviderService) {
		
		// Set global configs
		// Get target to determine configs
		this.projectTarget = gc.getProjectTarget();
		
		// get config of selected target
		let config = Configs.setConfigs(this.projectTarget);
		
		// Set local variables and messages
		this.isEmployer = (this.projectTarget=='employer');
		this.phoneTitle = "Téléphone";
		//charge la liste des pays
		this.loadListService.loadCountries().then((data) =>{
			this.pays = data.data;
		});
		this.index = 33;
	}
	
	doRadioAlert(){
		let alert = Alert.create();
		alert.setTitle('Choisissez votre pays');
		for(let p of this.pays){
			alert.addInput({
				type: 'radio',
				label: p.nom,
				value: p.indicatif_telephonique,
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
	
	authenticate(){
		var indPhone = this.index + this.phone;
		this.authService.authenticate(this.email, indPhone, this.password, 'jobyer')
		.then(data =>{
			this.temp = data;
			this.onAuthenticateSuccess(this.temp);
			console.log(this.temp);
		});
	}
	
	onAuthenticateSuccess(data){
		/*if (!data) {
			OnAuthenticateError(data);
			return;
		}*/
		//console.log(data);
		data = this.temp;
		console.log(this.temp);
		console.log(data);
		console.log("a");
		data = data[0]['value'];
		console.log("b");
		console.log("c");
		
		/*if (data.length == 0) {
			this.onAuthenticateError(data);
			return;
		}*/
		
		data = JSON.parse(data);
		console.log("d");
		
		if (data.id == 0 && data.status == "failure") {
			console.log("e");
			//this.onAuthenticateError(data);
			//return;
		}
		console.log("f");
		
		if (data.id == 0 && data.status == "passwordError") {
			console.log("g");
			//Global.showAlertPassword("Votre mot de passe est incorrect");
			//return;
		}
		console.log("h");
		
		//localStorageService.remove('connexion');
		//localStorageService.remove('currentEmployer');
		var connexion = {
			'etat': true,
			'libelle': 'Se déconnecter',
			'employeID': data.jobyerId
		};
		console.log("i");
		
		//Load device token to current account :
		var token = this.authService.getObj('deviceToken');
		console.log("j");
		var accountId = data.id;
		console.log("k");
		
		if (token) {
			
			console.log("insertion du token : "+ token);
			this.authService.insertToken(token, accountId);
			console.log("l");
		}
		console.log("m");
		this.authService.setObj('connexion', connexion);
		console.log("n");
		this.authService.setObj('currentEmployer', data);
		console.log("o");
		var isNewUser = data.new;
		console.log("p");
		if (isNewUser == 'true') {
			console.log("q");
			//Global.showAlertValidation("Bienvenue dans votre espace VitOnJob!");
			//$state.go("menu.infoTabs.saisieCiviliteEmployeur");
			} else {
			console.log("r");
			//$state.go("menu.app");
		}
	}
	
	
	watchPhone(){
		
		if (this.phone) {
			this.phone = this.phone.replace("-", "").replace(".", "").replace("+", "").replace(" ", "").replace("(", "").replace(")", "").replace("/", "").replace(",", "").replace("#", "").replace("*", "").replace(";", "").replace("N", "");
			
			//unreacheable : attribute maxlengthof input equals 9
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
				this.isRegistration();
			}
		}
	}
	
	isRegistration() {
		if (this.isPhoneValid()) {
			//On teste si le tél existe dans la base
			var tel = "+" + this.index + this.phone;
			
			this.dataProviderService.getUserByPhone(tel).then((data) =>{
				if (!data || data.data.length == 0) {
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
			this.showEmailField = true;
			//$scope.email = "";
			this.libelleButton = "S'inscrire";
			this.email = "";
		}
	};
	
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
	};
	
	validatEmail() {
		//console.log("ab" + id + "cd");
	}
	goBack(){
		this.nav.push(HomePage);
	}
}