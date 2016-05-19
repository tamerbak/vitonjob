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

/*
	Generated class for the PhonePage page.

	See http://ionicframework.com/docs/v2/components/#navigation for more info on
	Ionic pages and navigation.
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
		this.loadListService.loadCountries().then((data) => {
			this.pays = data.data;
		});
	}

	//show alert of the countries list
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

	authenticate() {
		//this.gc.setCnxBtnName("Déconnexion");
		//this.nav.push(HomePage);
		var indPhone = this.index + this.phone;
		var role = (this.projectTarget == 'jobyer' ? 'jobyer' : 'employeur');
		this.authService.authenticate(this.email, indPhone, this.password1, role)
			.then(data => {
				this.onAuthenticateSuccess(data);
				console.log(data[0]['value']);
			});
	}

	onAuthenticateSuccess(data) {
		if (!data) {
			console.log(data);
			this.globalService.showAlertValidation("Serveur non disponible ou problème de connexion.");
			return;
		}
		data = data[0]['value'];
		console.log(data);
		if (data.length == 0) {
			console.log(data);
			this.globalService.showAlertValidation("Serveur non disponible ou problème de connexion.");
			return;
		}
		data = JSON.parse(data);
		if (data.id == 0 && data.status == "failure") {
			console.log(data);
			this.globalService.showAlertValidation("Serveur non disponible ou problème de connexion.");
			return;
		}
		if (data.id == 0 && data.status == "passwordError") {
			console.log("Password error");
			this.globalService.showAlertValidation("Votre mot de passe est incorrect");
			return;
		}

		this.authService.setObj('connexion', null);
		this.authService.setObj('currentEmployer', null);
		var connexion = {
			'etat': true,
			'libelle': 'Se déconnecter',
			'employeID' : (this.projectTarget == 'jobyer' ? data.jobyerId : data.employerId)
		};

		//Load device token to current account :
		var token = this.authService.getObj('deviceToken');
		console.log(token);
		var accountId = data.id;
		console.log(accountId);

		if (token) {
			console.log("insertion du token : " + token);
			this.authService.insertToken(token, accountId);
		}
		this.authService.setObj('connexion', connexion);
		this.authService.setObj('currentEmployer', data);
		console.log("a" + this.gc.getCnxBtnName());
		this.gc.setCnxBtnName("Déconnexion");
		console.log("b" + this.gc.getCnxBtnName());

		var isNewUser = data.new;
		if (isNewUser == 'true') {
			this.globalService.showAlertValidation("Bienvenue dans votre espace VitOnJob!");
			this.nav.push(InfoUserPage);
		} else {
			//todo : change HomePage by the correct page
			this.nav.push(HomePage);
			//$state.go("menu.app");
		}
	}

	//function called to decide if the auth/inscr button should be disabled
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

	//function called on change of the phone input : validation
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

	//function called when the phone input is valid
	//to decide if the form is for inscription or authentication
	isRegistration(el) {
		if (this.isPhoneValid()) {
			//On teste si le tél existe dans la base
			var tel = "+" + this.index + this.phone;
			var role = (this.projectTarget == 'jobyer' ? 'jobyer' : 'employeur');
			this.dataProviderService.getUserByPhone(tel, role).then((data) => {
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

	//validation of the phone input
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

	//todo
	validateEmail(e) {
		//this.validationDataService.checkEmail(e);
	}

	password2IsValid() {
		return (
			this.password1 == this.password2
		)
	}

	goBack() {
		this.nav.push(HomePage);
	}
}
