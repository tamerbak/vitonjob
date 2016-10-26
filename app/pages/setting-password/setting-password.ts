import {Component} from "@angular/core";
import {NavController, Loading, Storage, SqlStorage} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {AuthenticationService} from "../../providers/authentication.service";
import {GlobalService} from "../../providers/global.service";

/*
 Generated class for the SettingPasswordPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/setting-password/setting-password.html',
    providers: [AuthenticationService, GlobalService]
})
export class SettingPasswordPage {
    options: any;
    projectTarget: string;
    isEmployer: boolean;
    oldPassword: string;
    password1: string;
    password2: string;
    isOldPasswordCorrect:boolean;
    currentUser;
    currentUserVar: string;


    constructor(public nav: NavController, gc: GlobalConfigs, private authService: AuthenticationService, private globalService: GlobalService) {
        this.projectTarget = gc.getProjectTarget();
        let config = Configs.setConfigs(this.projectTarget);
        this.options = config.options;
        this.isEmployer = (this.projectTarget === 'employer');
        this.themeColor = config.themeColor;
        this.currentUserVar = config.currentUserVar;
        this.storage = new Storage(SqlStorage);
        this.isOldPasswordCorrect = true;
    }

    modifyPasswd() {
        let loading = Loading.create({
            content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
            spinner: 'hide'
        });
        this.nav.present(loading);
        
        this.storage.get(this.currentUserVar).then((value) => {
            if (value) {
                this.currentUser = JSON.parse(value);
                let pwd = md5(this.password1);
                let oldPwd = md5(this.oldPassword);
                this.authService.authenticate(this.currentUser.email,this.currentUser.tel,oldPwd,this.projectTarget,false).then(data0 => {
                    if (!data0 || data0.length == 0 || (data0.id == 0 && data0.status == "failure")) {
                        console.log(data0);
                        loading.dismiss();
                        this.globalService.showAlertValidation("VitOnJob", "Serveur non disponible ou problème de connexion.");
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
                    
                    this.authService.updatePasswordByPhone(this.currentUser.tel, pwd,"Non")
                        .then(data => {
                        console.log(data);
                        //case of authentication failure : server unavailable or connection probleme
                        if (!data || data.length == 0 || data.status == "failure") {
                            console.log(data);
                            loading.dismiss();
                            this.globalService.showAlertValidation("VitOnJob", "Serveur non disponible ou problème de connexion.");
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
