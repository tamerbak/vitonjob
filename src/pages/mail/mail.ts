import {Component} from "@angular/core";
import {
  AlertController, NavController, Events, LoadingController,
  App
} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {AuthenticationService} from "../../providers/authentication-service/authentication-service";
import {LoadListService} from "../../providers/load-list-service/load-list-service";
import {DataProviderService} from "../../providers/data-provider-service/data-provider-service";
import {GlobalService} from "../../providers/global-service/global-service";
import {ValidationDataService} from "../../providers/validation-data-service/validation-data-service";
import {HomePage} from "../home/home";
import {InfoUserPage} from "../info-user/info-user";
import {SMS} from "ionic-native";
import {Storage} from "@ionic/storage";

declare let md5;

/**
 * @author Amal ROCHD
 * @description authentication by mail view
 * @module Authentication
 */
@Component({
  templateUrl: 'mail.html'
})
export class MailPage {
  public projectTarget: string;
  public isEmployer: boolean;
  public mailTitle: string;
  public themeColor: string;
  public phone;
  public index;
  public pays = [];
  public showPhoneField: boolean;
  public email: string;
  public libelleButton: string;
  public password1: string;
  public password2: string;
  public isPhoneNumValid = true;
  public retrievedPhone: string;

  /**
   * @description While constructing the view, we load the list of countries to display their codes
   */
  constructor(public nav: NavController,
              public gc: GlobalConfigs,
              private authService: AuthenticationService,
              private loadListService: LoadListService,
              private dataProviderService: DataProviderService,
              private globalService: GlobalService,
              private validationDataService: ValidationDataService,
              public events: Events,
              public alert: AlertController,
              public loading: LoadingController, public app: App, public storage:Storage) {
    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();


    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);

    // Set local variables and messages
    this.themeColor = config.themeColor;
    this.isEmployer = (this.projectTarget == 'employer');
    this.mailTitle = "E-mail";
    this.index = 33;
    this.libelleButton = "Se connecter";

    //load countries list
    this.loadListService.loadCountries(this.projectTarget).then((data: {data: any}) => {
      this.pays = data.data;
    });
  }

  /**
   * @description Display the list of countries in an alert
   */
  doRadioAlert() {
    let alert = this.alert.create();
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

    alert.present().then(() => {
    });
  }

  /**
   * @description function called to authenticate a user
   */
  authenticate() {
    let indPhone = this.index + this.phone;
      let loading = this.loading.create({content:"Merci de patienter..."});
    loading.present();
    //call the service of autentication
    let pwd = md5(this.password1);
    this.authService.authenticate(this.email, indPhone, pwd, this.projectTarget, false) //?????
      .then((data: {
        length: number,
        id: number,
        status: string,
        jobyerId: number,
        employerId: number,
        newAccount: boolean
      }) => {
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
          if (!this.showPhoneField) {
            this.globalService.showAlertValidation("Vit-On-Job", "Votre mot de passe est incorrect.");
          } else {
            console.log("used phone error");
            this.globalService.showAlertValidation("Vit-On-Job", "Ce numéro de téléphone a été déjà utilisé. Veuillez choisir un autre.");
          }
          return;
        }

        //case of authentication success
        this.authService.setObj('connexion', null);
        this.authService.setObj('currentUser', null);
        let connexion = {
          'etat': true,
          'libelle': 'Se déconnecter',
          'employeID': (this.projectTarget == 'jobyer' ? data.jobyerId : data.employerId)
        };

        //load device token to current account
        let token;
        this.authService.getObj('deviceToken').then(val => {
          token = val;
        });
        let accountId = data.id;
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
        let isNewUser = data.newAccount;
        if (isNewUser) {
          this.globalService.showAlertValidation("Vit-On-Job", "Bienvenue dans votre espace Vit-On-Job!");
          this.nav.push(InfoUserPage, {
            currentUser: data
          });
        } else {
          this.app.getRootNav().setRoot(HomePage);
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
    this.dataProviderService.getUserByMail(this.email, this.projectTarget).then((data: {status: string,data: Array<any>}) => {
      if (!data || data.status == "failure") {
        console.log(data);
        this.globalService.showAlertValidation("Vit-On-Job", "Serveur non disponible ou problème de connexion.");
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
      let phone_REGEXP = /^0/;
      //check if the phone number start with a zero
      let isMatchRegex = phone_REGEXP.test(tel);
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
    this.app.getRootNav().setRoot(HomePage)
  }

  passwordForgotten() {
      let loading = this.loading.create({content:"Merci de patienter..."});
    loading.present();
    this.authService.setNewPassword(this.email).then((data: {password: string}) => {
      if (!data) {
        loading.dismiss();
        this.globalService.showAlertValidation("Vit-On-Job", "Serveur non disponible ou problème de connexion.");
        return;
      }
      if (data && data.password.length != 0) {
        this.authService.updatePasswordByMail(this.email, md5(data.password), 'Oui');
        console.log('Sending SMS');
        let message = "Votre nouveau mot de passe est: " + data.password;
        this.sendSMS(this.retrievedPhone, message);
        loading.dismiss();
        this.globalService.showAlertValidation("Vit-On-Job", "Votre mot de passe a été rénitialisé. Vous allez le recevoir par SMS.");
      }
    });
  }

  sendSMS(number, message) {
    let options = {
      replaceLineBreaks: true,
      android: {
        intent: ''
      }
    };
    SMS.send(number, message, options);
  }

  displayPasswordAlert() {
    if (!this.email || this.showEmailError()) {
      this.globalService.showAlertValidation("Vit-On-Job", "Veuillez saisir une adresse email valide.");
      return;
    }
    if (this.email && !this.showEmailError() && this.showPhoneField) {
      this.globalService.showAlertValidation("Vit-On-Job", "Aucun compte ne correspond à cet adresse email.");
      return;
    }
    let confirm = this.alert.create({
      title: "Vit-On-Job",
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
    confirm.present();
  }

}
