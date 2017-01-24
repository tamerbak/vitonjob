import {Component} from "@angular/core";
import {NavController, LoadingController} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {AuthenticationService} from "../../providers/authentication-service/authentication-service";
import {GlobalService} from "../../providers/global-service/global-service";
import {Storage} from "@ionic/storage";

declare let md5;

/*
 Generated class for the SettingPasswordPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  templateUrl: 'setting-password.html'
})
export class SettingPasswordPage {
  public options: any;
  public projectTarget: string;
  public isEmployer: boolean;
  public oldPassword: string;
  public password1: string;
  public password2: string;
  public isOldPasswordCorrect: boolean;
  public currentUser;
  public currentUserVar: string;
  public themeColor: string;

  public showHidePasswdLabel: string;
  public showHideOldPasswdLabel: string;
  public showHidePasswdConfirmLabel: string;


  constructor(public nav: NavController, gc: GlobalConfigs,
              private authService: AuthenticationService,
              private globalService: GlobalService,
              public loading: LoadingController, public storage: Storage) {
    this.projectTarget = gc.getProjectTarget();
    let config = Configs.setConfigs(this.projectTarget);
    this.options = config.options;
    this.isEmployer = (this.projectTarget === 'employer');
    this.themeColor = config.themeColor;
    this.currentUserVar = config.currentUserVar;

    this.showHideOldPasswdLabel = "Afficher le mot de passe";
    this.showHidePasswdLabel = "Afficher le mot de passe";
    this.showHidePasswdConfirmLabel = "Afficher le mot de passe";

    this.isOldPasswordCorrect = true;
  }

  showHidePasswd() {
    let divHide = document.getElementById('hidePasswd');
    let divShow = document.getElementById('showPasswd');

    if (divHide.style.display == 'none') {
      divHide.style.display = 'block';
      divShow.style.display = 'none';
      //this.showHidePasswdLabel = "Afficher le mot de passe";
    }
    else {
      divHide.style.display = 'none';
      divShow.style.display = 'block';
      //this.showHidePasswdLabel = "Cacher le mot de passe";
    }
  }

  showHideOldPasswd() {
    let divHide = document.getElementById('hideOldPasswd');
    let divShow = document.getElementById('showOldPasswd');

    if (divHide.style.display == 'none') {
      divHide.style.display = 'block';
      divShow.style.display = 'none';
      //this.showHidePasswdLabel = "Afficher le mot de passe";
    }
    else {
      divHide.style.display = 'none';
      divShow.style.display = 'block';
      //this.showHidePasswdLabel = "Cacher le mot de passe";
    }
  }

  showHidePasswdConfirm() {
    let divHide = document.getElementById('hidePasswdConfirm');
    let divShow = document.getElementById('showPasswdConfirm');

    if (divHide.style.display == 'none') {
      divHide.style.display = 'block';
      divShow.style.display = 'none';
      //this.showHidePasswdConfirmLabel = "Afficher le mot de passe";
    }
    else {
      divHide.style.display = 'none';
      divShow.style.display = 'block';
      //this.showHidePasswdConfirmLabel = "Cacher le mot de passe";
    }
  }

  modifyPasswd() {
      let loading = this.loading.create({content:"Merci de patienter..."});
    loading.present();

    this.storage.get(this.currentUserVar).then((value) => {
      if (value) {
        this.currentUser = JSON.parse(value);
        let pwd = md5(this.password1);
        let oldPwd = md5(this.oldPassword);
        this.authService.authenticate(this.currentUser.email, this.currentUser.tel, oldPwd, this.projectTarget, false).then((data0: any) => {
          if (!data0 || data0.length == 0 || (data0.id == 0 && data0.status == "failure")) {
            console.log(data0);
            loading.dismiss();
            this.globalService.showAlertValidation("Vit-On-Job", "Serveur non disponible ou problème de connexion.");
            return;
          }
          //case of authentication failure : incorrect password
          if (data0.id == 0 && data0.status == "passwordError") {
            console.log("Password error");
            loading.dismiss();
            this.isOldPasswordCorrect = false;
            this.showOldPasswordError();
            return;
          }

          this.isOldPasswordCorrect = true;
          this.showOldPasswordError();

          this.authService.updatePasswordByPhone(this.currentUser.tel, pwd, "Non")
            .then((data: any) => {
              console.log(data);
              //case of authentication failure : server unavailable or connection probleme
              if (!data || data.length == 0 || data.status == "failure") {
                console.log(data);
                loading.dismiss();
                this.globalService.showAlertValidation("Vit-On-Job", "Serveur non disponible ou problème de connexion.");
                return;
              }
              this.currentUser.mot_de_passe_reinitialise = "Non";
              console.log(this.currentUser);
              this.storage.set(this.currentUserVar, JSON.stringify(this.currentUser));
              loading.dismiss();
              this.nav.pop();
            });
        });
      }
    });
  }

  /**
   * @description show error msg if password is not valid
   */
  showOldPasswordError() {
    return !this.isOldPasswordCorrect;
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

  isBtnDisabled() {
    return (!this.password1 || this.showPassword1Error() || !this.password2 || this.showPassword2Error() || !this.oldPassword)
  }
}
