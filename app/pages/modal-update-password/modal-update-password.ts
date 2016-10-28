import {Component} from "@angular/core";
import {NavController, Loading, Storage, SqlStorage} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {AuthenticationService} from "../../providers/authentication.service";
import {GlobalService} from "../../providers/global.service";


@Component({
    templateUrl: 'build/pages/modal-update-password/modal-update-password.html',
    providers: [AuthenticationService, GlobalService]
})
export class ModalUpdatePassword {
        options: any;
    projectTarget: string;
    isEmployer: boolean;
    password1: string;
    password2: string;
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
                this.authService.updatePasswordByPhone(this.currentUser.tel, pwd,"Non")
                    .then(data => {
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
            }
        });
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
        return (!this.password1 || this.showPassword1Error() || !this.password2 || this.showPassword2Error())
    }
}
