import {Component, enableProdMode} from "@angular/core";
import {
	Alert,
	NavController,
	NavParams,
	Events,
	Loading,
	Toast,
	Keyboard,
	ViewController,
	Platform,
	Storage,
	SqlStorage
} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {AuthenticationService} from "../../providers/authentication.service";
import {LoadListService} from "../../providers/load-list.service";
import {DataProviderService} from "../../providers/data-provider.service";
import {GlobalService} from "../../providers/global.service";
import {ValidationDataService} from "../../providers/validation-data.service";
import {HomePage} from "../home/home";
import {CivilityPage} from "../civility/civility";
import {SMS} from "ionic-native";
import {ProfileService} from "../../providers/profile-service/profile-service";
import {GeneralConditionsPage} from "../general-conditions/general-conditions";
import {SearchResultsPage} from "../search-results/search-results";
//import {InfoUserPage} from "../info-user/info-user";
enableProdMode();

/**
 * @author Amal ROCHD
 * @description authentication by phone view
 * @module Authentication
 */
@Component({
    templateUrl: 'build/pages/phone/phone.html',
    providers: [AuthenticationService, LoadListService, DataProviderService, GlobalService, ValidationDataService, Keyboard, ProfileService]
})

export class PhonePage {
    projectTarget: string;
    isEmployer: boolean;
    phoneTitle: string;
    themeColor: string;
    public phone;
    public index;
    public pays = [];
    showEmailField: boolean;
    email: string;
    libelleButton: string;
    password1: string;
    password2: string;
    isPhoneNumValid = true;
    backgroundImage: any;
    emailExist = false;
    isRecruteur: boolean = false;
    keyboard: any;
    //isNewRecruteur = false;
    //accountid: int;
    isIndexValid = true;
    currentUserVar: string;
    showHidePasswdLabel: string;
    showHidePasswdConfirmLabel: string;
    fromPage: string;
    defaultImage: string;

    /**
     * @description While constructing the view, we load the list of countries to display their codes
     */
    constructor(public nav: NavController,
                params: NavParams,
                public gc: GlobalConfigs,
                private authService: AuthenticationService,
                private loadListService: LoadListService,
                private dataProviderService: DataProviderService,
                private globalService: GlobalService,
                private validationDataService: ValidationDataService,
                public events: Events, keyboard: Keyboard,
                private viewCtrl: ViewController,
                private platform: Platform,
                private profileService: ProfileService) {
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
        this.backgroundImage = config.backgroundImage;
        this.currentUserVar = config.currentUserVar;
        this.keyboard = keyboard;
        this.platform = platform;
        this.showHidePasswdLabel = "Afficher le mot de passe";
        this.showHidePasswdConfirmLabel = "Afficher le mot de passe";
        this.params = params;
        this.fromPage = this.params.data.fromPage;
        this.defaultImage = config.userImageURL;

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
                this.index = data;
            }
        });

        this.nav.present(alert).then(() => {
        });
    }

    /**
     * @description function called to authenticate a user
     */
    authenticate() {
        //in case email was changed just before validate button is clicked
        if (this.isAuthDisabled()) {
            return;
        }
        var indPhone = this.index + this.phone;
        let loading = Loading.create({
            content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
            spinner: 'hide'
        });
        this.nav.present(loading);
        //call the service of autentication
        let pwd = md5(this.password1);

        if (this.email == null || this.email == 'null')
            this.email = '';
        var reverseRole = this.projectTarget == "jobyer" ? "employer" : "jobyer";
        this.authService.getUserByPhoneAndRole("+" + indPhone, reverseRole).then(data0 => {
            if (data0 && data0.data.length != 0 && (data0.data[0].mot_de_passe !== pwd)) {
                this.globalService.showAlertValidation("Vit-On-Job", "Votre mot de passe est incorrect.");
                loading.dismiss();
                return;
            }
            this.authService.authenticate(this.email, indPhone, pwd, this.projectTarget, this.isRecruteur).then(data => {
                console.log(data);
                //case of authentication failure : server unavailable or connection probleme 
                if (!data || data.length == 0 || (data.id == 0 && data.status == "failure")) {
                    console.log(data);
                    loading.dismiss();
                    this.globalService.showAlertValidation("Vit-On-Job", "Serveur non disponible ou problème de connexion.");
                    return;
                }
                //case of authentication failure : incorrect password 
                if (data.id == 0 && data.status == "passwordError") {
                    console.log("Password error");
                    loading.dismiss();
                    if (!this.showEmailField) {
                        this.globalService.showAlertValidation("Vit-On-Job", "Votre mot de passe est incorrect.");
                    } else {
                        console.log("used email error");
                        this.globalService.showAlertValidation("Vit-On-Job", "Cette adresse email a été déjà utilisé. Veuillez en choisir une autre.");
                    }
                    return;
                }

                this.authService.getPasswordStatus("+" + indPhone,this.projectTarget).then((dataPwd: any) => {
                    
                    data.mot_de_passe_reinitialise = dataPwd.data[0].mot_de_passe_reinitialise;
                    this.afterAuthSuccess(data);
                    let toast = Toast.create({
                            message: "Bienvenue "+ data.prenom +" vous venez de vous connecter !",
                            duration: 2000,
                         });
                        
                    loading.dismiss().then(() => { 
                        if(data.titre != null && data.titre !== "" ){
                            this.nav.present(toast);
                        }
                    });
                    
                    
                    //if user is connected for the first time, redirect him to the page 'civility' after removing phone page from the nav stack, otherwise redirect him to the home page
                    var isNewUser = data.newAccount;
                    var connexion = {
                        'etat': true,
                        'libelle': 'Se déconnecter',
                        'employeID': (this.projectTarget == 'jobyer' ? data.jobyerId : data.employerId)
                    };
                    this.storage.set('connexion', JSON.stringify(connexion)).then(() => {
                        
                        let jobyer = this.params.data.jobyer;
                        let searchIndex = this.params.data.searchIndex;
                        let obj = this.params.data.obj;
                        if (isNewUser || this.isNewRecruteur) {
                                this.nav.push(GeneralConditionsPage, {currentUser: data, jobyer: jobyer, obj: obj, searchIndex: searchIndex});
                        } else {
                            if (this.fromPage == "Search") {
                                this.nav.push(SearchResultsPage, {jobyer: jobyer, fromPage: "phone", searchIndex: searchIndex}).then(() => {
                                    // first we find the index of the current view controller:
                                    const index = this.viewCtrl.index;
                                    // then we remove it from the navigation stack
                                    this.nav.remove(index);
                                })
                            } else {                          
                                this.nav.rootNav.setRoot(HomePage, {currentUser: data});
                            }
                        }
                    });
                });
            });
        });
    }

    afterAuthSuccess(data) {
        //case of authentication success
        this.authService.setObj('connexion', null);
        this.authService.setObj(this.currentUserVar, null);
        //load device token to current account
        var accountId = data.id;
        var token;
        this.storage.get("deviceToken").then(token => {
            if (token) {
                console.log("insertion du token : " + token);
                this.authService.insertToken(token, accountId, this.projectTarget);
            }
        });        
        
        this.storage.set(this.currentUserVar, JSON.stringify(data));
        this.events.publish('user:login', data);

        //load profile picture
        this.profileService.loadProfilePicture(data.id).then(pic => {
            var userImageURL;
            if (!this.isEmpty(pic.data[0].encode)) {
                userImageURL = pic.data[0].encode;
                this.profileService.uploadProfilePictureInLocal(pic.data[0].encode);
            } else {
                userImageURL = this.defaultImage;
            }
            this.events.publish('picture-change', userImageURL);
        });
        //user is connected, then change the name of connexion btn to deconnection
        this.gc.setCnxBtnName("Déconnexion");
    }

    /**
     * @description function called to decide if the auth/inscr button should be disabled
     */
    isAuthDisabled() {
        if (this.showEmailField == true) {
            //inscription
            return (!this.index || !this.isIndexValid || !this.phone || !this.isPhoneNumValid || !this.password1 || this.showPassword1Error() || !this.password2 || this.showPassword2Error() || !this.email || this.showEmailError() || this.emailExist)
        } else {
            //connection
            return (!this.index || !this.isIndexValid || !this.phone || !this.isPhoneNumValid || !this.password1 || this.showPassword1Error())
        }
    }

    /**
     * @description validate phone data field and call the function that search for it in the server
     */
    watchPhone(e) {
        if (this.phone) {
            if (e.target.value.substring(0, 1) == '0') {
                e.target.value = e.target.value.substring(1, e.target.value.length);
            }
            if (e.target.value.indexOf('.') != -1) {
                e.target.value = e.target.value.replace('.', '');
            }
            if (e.target.value.length > 9) {
                e.target.value = e.target.value.substring(0, 9);
            }
            if (e.target.value.length == 9) {
                this.isRegistration(this.index, e.target.value);
                this.isPhoneNumValid = true;
            }
        }
    }

    /**
     * @description show error msg if phone is not valid
     */
    showPhoneError() {
        return !this.isPhoneNumValid;
    }

    /**
     * @description function called when the phone input is valid to decide if the form is for inscription or authentication
     */
    isRegistration(index, phone) {

        if (this.isPhoneValid(phone)) {
            //On teste si le tél existe dans la base
            var tel = "+" + index + phone;
            this.dataProviderService.getUserByPhone(tel, this.projectTarget).then((data) => {
                if (!data || data.status == "failure") {
                    console.log(data);
                    this.globalService.showAlertValidation("Vit-On-Job", "Serveur non disponible ou problème de connexion.");
                    return;
                }
                if (!data || data.data.length == 0) {
                    this.showEmailField = true;
                    this.email = "";
                    this.libelleButton = "S'inscrire";
                    this.isNewRecruteur = false;
                } else {
                    this.email = data.data[0]["email"];
                    this.libelleButton = "Se connecter";
                    this.showEmailField = false;
                    if (data.data[0]["role"] == "recruteur" && this.isEmployer) {
                        this.isRecruteur = true;
                        this.email = "";
                    }
                }
            });
        } else {
            //ça sera toujours une connexion
            this.showEmailField = true;
            this.libelleButton = "S'inscrire";
            this.email = "";
            this.isRecruteur = false;
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

    validatePhone(e) {
        if (e.target.value.length == 9) {
            this.isPhoneNumValid = true;
        } else {
            this.isPhoneNumValid = false;
        }
    }

    /**
     * @description validate the email format
     */
    showEmailError() {
        if (this.isRecruteur)
            return false;
        if (this.email)
            return !(this.validationDataService.checkEmail(this.email));
        else
            return false;
    }

    /**
     * @description show error msg if password is not valid
     */
    showPassword1Error() {
        if (this.password1)
            return this.password1.length < 6;
    }

    /**
     * @description check if the password and its confirmation are the same
     */
    showPassword2Error() {
        if (this.password2)
            return this.password2 != this.password1;
    }

    isEmailExist(e) {
        //verify if the email exist in the database
        this.dataProviderService.getUserByMail(this.email, this.projectTarget).then((data) => {
            if (!data || data.status == "failure") {
                console.log(data);
                this.globalService.showAlertValidation("Vit-On-Job", "Serveur non disponible ou problème de connexion.");
                return;
            }
            if (data && data.data.length != 0) {
                this.emailExist = true;
            } else {
                this.emailExist = false;
            }
        });
    }

    isIndexExist(e) {
        for (var i = 0; i < this.pays.length; i++) {
            if (this.pays[i].indicatif_telephonique == e.target.value) {
                this.isIndexValid = true;
                if (this.phone && this.phone.length == 9 && this.isPhoneNumValid)
                    this.isRegistration(e.target.value, this.phone);
                return;
            } else {
                this.isIndexValid = false;
            }
        }
    }

    watchIndex(e) {
        if (this.index) {
            if (e.target.value.substring(0, 1) == '0') {
                e.target.value = e.target.value.substring(1, e.target.value.length);
            }
            if (e.target.value.indexOf('.') != -1) {
                e.target.value = e.target.value.replace('.', '');
            }
            if (e.target.value.length > 4) {
                e.target.value = e.target.value.substring(0, 4);
            }
            if (e.target.value == this.index && !this.isIndexValid) {
                this.isIndexValid = false;
            }
            if (this.index && !this.isIndexValid) {
                this.isIndexExist(e);
            }
        }
    }

    /**
     * @description return to the home page
     */
    goBack() {
        this.nav.rootNav.setRoot(HomePage);
    }

    passwordForgotten(canal, email) {
        let loading = Loading.create({
            content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
            spinner: 'hide'
        });
        this.nav.present(loading);
        var tel = "+" + this.index + this.phone;
        this.authService.setNewPassword(tel).then((data) => {
            if (!data) {
                loading.dismiss();
                this.globalService.showAlertValidation("Vit-On-Job", "Serveur non disponible ou problème de connexion.");
                return;
            }
            if (data && data.password.length != 0) {
                let newPasswd = data.password;
                if (canal == 'sms') {
                    this.authService.updatePasswordByPhone(tel, md5(newPasswd),"Oui").then((data) => {
                        if (!data) {
                            loading.dismiss();
                            this.globalService.showAlertValidation("Vit-On-Job", "Serveur non disponible ou problème de connexion.");
                            return;
                        }
                        this.authService.sendPasswordBySMS(tel, newPasswd).then((data) => {
                            if (!data || data.status != 200) {
                                loading.dismiss();
                                this.globalService.showAlertValidation("Vit-On-Job", "Serveur non disponible ou problème de connexion.");
                                return;
                            }
                            loading.dismiss();
                            //this.globalService.showAlertValidation("Vit-On-Job", "Votre mot de passe a été réinitialisé. Vous allez le recevoir par SMS.");
                        });
                    });
                }
                else {
                    this.authService.updatePasswordByMail(email, md5(newPasswd),"Oui").then((data) => {
                        if (!data) {
                            loading.dismiss();
                            this.globalService.showAlertValidation("Vit-On-Job", "Serveur non disponible ou problème de connexion.");
                            return;
                        }
                        this.authService.sendPasswordByEmail(email, newPasswd).then((data) => {
                            if (!data || data.status != 200) {
                                loading.dismiss();
                                this.globalService.showAlertValidation("Vit-On-Job", "Serveur non disponible ou problème de connexion.");
                                return;
                            }
                            loading.dismiss();
                            //this.globalService.showAlertValidation("Vit-On-Job", "Votre mot de passe a été réinitialisé. Vous allez le recevoir par email.");
                        });
                    });
                }
            }
        })
    }

    sendSMS(number, message) {
        var options = {
            replaceLineBreaks: true,
            android: {
                intent: ''
            }
        };
        SMS.send(number, message, options);
    }

    displayPasswordAlert() {
        if (!this.phone || !this.isPhoneValid(this.phone)) {
            this.globalService.showAlertValidation("Vit-On-Job", "Veuillez saisir un numéro de téléphone valide.");
            return;
        }
        if (this.phone && this.isPhoneValid(this.phone) && this.showEmailField) {
            this.globalService.showAlertValidation("Vit-On-Job", "Le numéro que vous avez saisi ne correspond à aucun compte enregistré. Veuillez créer un compte.");
            return;
        }
        if (this.isRecruteur) {
            let confirm = Alert.create({
                title: "Vit-On-Job",
                message: "Votre mot de passe est sur le point d'être réinitialisé. Voulez-vous continuer?",
                buttons: [
                    {
                        text: 'Recevoir par SMS',
                        handler: () => {
                            console.log('SMS selected');
                            this.passwordForgotten("sms");
                            let toast = Toast.create({
                                message: "Votre mot de passe a été réinitialisé. Vous recevrez un SMS avec un nouveau mot de passe d'ici peu.",
                                duration: 5000
                            });
                            this.nav.present(toast);
                        }
                    },
                ]
            });
            this.nav.present(confirm);
        } else {
            let confirm = Alert.create({
                title: "Vit-On-Job",
                message: "Votre mot de passe est sur le point d'être réinitialisé. Voulez-vous le recevoir par SMS ou par email?",
                buttons: [
                    {
                        text: 'SMS',
                        handler: () => {
                            console.log('SMS selected');
                            this.passwordForgotten("sms");
                            let toast = Toast.create({
                                message: "Votre mot de passe a été réinitialisé. Vous recevrez un SMS avec un nouveau mot de passe d'ici peu.",
                                duration: 5000
                            });
                            this.nav.present(toast);
                        }
                    },
                    {
                        text: 'Email',
                        handler: () => {
                            console.log('Email selected');
                            this.passwordForgotten("email", this.email);
                            let toast = Toast.create({
                                message: "Votre mot de passe a été réinitialisé. Vous recevrez un courrier électronique avec un nouveau mot de passe d'ici peu.",
                                duration: 5000
                            });
                            this.nav.present(toast);
                        }
                    }
                ]
            });
            this.nav.present(confirm);
        }

    }

    showHidePasswd() {
        let divHide = document.getElementById('hidePasswd');
        let divShow = document.getElementById('showPasswd');

        if (divHide.style.display == 'none') {
            divHide.style.display = 'block';
            divShow.style.display = 'none';
            this.showHidePasswdLabel = "Afficher le mot de passe";
        }
        else {
            divHide.style.display = 'none';
            divShow.style.display = 'block';
            this.showHidePasswdLabel = "Cacher le mot de passe";
        }
    }

    showHidePasswdConfirm() {
        let divHide = document.getElementById('hidePasswdConfirm');
        let divShow = document.getElementById('showPasswdConfirm');

        if (divHide.style.display == 'none') {
            divHide.style.display = 'block';
            divShow.style.display = 'none';
            this.showHidePasswdConfirmLabel = "Afficher le mot de passe";
        }
        else {
            divHide.style.display = 'none';
            divShow.style.display = 'block';
            this.showHidePasswdConfirmLabel = "Cacher le mot de passe";
        }
    }

    isEmpty(str) {
        if (str == '' || str == 'null' || !str)
            return true;
        else
            return false;
    }
}