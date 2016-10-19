import {Component} from "@angular/core";
import {Alert, NavController, Events, Loading, Storage, SqlStorage} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {AuthenticationService} from "../../providers/authentication.service";
import {LoadListService} from "../../providers/load-list.service";
import {DataProviderService} from "../../providers/data-provider.service";
import {GlobalService} from "../../providers/global.service";
import {ValidationDataService} from "../../providers/validation-data.service";
import {HomePage} from "../home/home";
import {InfoUserPage} from "../info-user/info-user";
import {SMS} from "ionic-native";
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
    public phone;
    public index;
    public pays = [];
    showPhoneField: boolean
    email: string;
    libelleButton: string;
    password1: string;
    password2: string;
    storage: any;
    isPhoneNumValid = true;
    retrievedPhone: string;

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
        this.authService.authenticate(this.email, indPhone, pwd, this.projectTarget)
            .then(data => {
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
                    if (!this.showPhoneField) {
                        this.globalService.showAlertValidation("VitOnJob", "Votre mot de passe est incorrect.");
                    } else {
                        console.log("used phone error");
                        this.globalService.showAlertValidation("VitOnJob", "Ce numéro de téléphone a été déjà utilisé. Veuillez choisir un autre.");
                    }
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
                this.events.publish('user:login', data);

                //user is connected, then change the name of connexion btn to deconnection
                this.gc.setCnxBtnName("Déconnexion");
                loading.dismiss();

                //if user is connected for the first time, redirect him to the page 'civility', else redirect him to the home page
                var isNewUser = data.newAccount;
                if (isNewUser) {
                    this.globalService.showAlertValidation("VitOnJob", "Bienvenue dans votre espace VitOnJob!");
                    this.nav.push(InfoUserPage, {
                        currentUser: data
                    });
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
            return (!this.index || !this.phone || !this.isPhoneNumValid || !this.password1 || this.showPassword1Error() || !this.password2 || this.showPassword2Error() || !this.email || this.showEmailError())
        } else {
            //connection
            return (!this.index || !this.email || this.showEmailError() || !this.password1 || this.showPassword1Error())
        }
    }

    /**
     * @description function called on change of the email input to validate it
     */
    watchEmail(e) {
        if (this.validationDataService.checkEmail(this.email)) {
            this.isRegistration();
        }
    }

    /**
     * @description show error msg if phone is not valid
     */
    watchPhone(e) {
        if (this.phone) {
            this.isPhoneNumValid = false;
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
                this.isPhoneNumValid = true;
            }
        }
    }

    showPhoneError() {
        return !this.isPhoneNumValid;
    }

    /**
     * @description function called when the email input is valid to decide if the form is for inscription or authentication
     */
    isRegistration() {
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
                this.retrievedPhone = data.data[0]["telephone"];
                this.libelleButton = "Se connecter";
                this.showPhoneField = false;
            }
        })
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
        if (this.email)
            return !(this.validationDataService.checkEmail(this.email));
        else
            return false
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


    /**
     * @description return to the home page
     */
    goBack() {
        this.nav.rootNav.setRoot(HomePage)
    }

    passwordForgotten() {
        let loading = Loading.create({
            content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
            spinner: 'hide'
        });
        this.nav.present(loading);
        this.authService.setNewPassword(this.email).then((data) => {
            if (!data) {
                loading.dismiss();
                this.globalService.showAlertValidation("VitOnJob", "Serveur non disponible ou problème de connexion.");
                return;
            }
            if (data && data.password.length != 0) {
                this.authService.updatePasswordByMail(this.email, md5(data.password));
                console.log('Sending SMS');
                var message = "Votre nouveau mot de passe est: " + data.password;
                this.sendSMS(this.retrievedPhone, message);
                loading.dismiss();
                this.globalService.showAlertValidation("VitOnJob", "Votre mot de passe a été rénitialisé. Vous allez le recevoir par SMS.");
            }
        });
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
        if (!this.email || this.showEmailError()) {
            this.globalService.showAlertValidation("VitOnJob", "Veuillez saisir une adresse email valide.");
            return;
        }
        if (this.email && !this.showEmailError() && this.showPhoneField) {
            this.globalService.showAlertValidation("VitOnJob", "Aucun compte ne correspond à cet adresse email.");
            return;
        }
        let confirm = Alert.create({
            title: "VitOnJob",
            message: "Votre mot de passe est sur le point d'être rénitialisé. Voulez vous continuer?",
            buttons: [
                {
                    text: 'Non',
                    handler: () => {
                        console.log('No clicked');
                    }
                },
                {
                    text: 'Oui',
                    handler: () => {
                        console.log('Yes clicked');
                        this.passwordForgotten();
                    }
                }
            ]
        });
        this.nav.present(confirm);
    }

}