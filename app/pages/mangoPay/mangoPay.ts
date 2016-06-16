import {NavController, Loading, Alert} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {Component} from "@angular/core";
import {PaylineServices} from "../../providers/payline-services/payline-services";
import {MissionListPage} from "../mission-list/mission-list";

@Component({
    templateUrl: 'build/pages/mangoPay/mangoPay.html',
    providers : [PaylineServices]
})
export class MangoPayPage {

    projectTarget: string;
    isEmployer: boolean;
    mangoPayTitle: string;
    themeColor: string;

    cardNumber:string;
    cardExpirationDate:number;
    cardCvv:string;

    service : PaylineServices;

    constructor(public nav: NavController,
                gc: GlobalConfigs,
                service : PaylineServices) {

        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        this.service = service;

        // Set local variables and messages
        this.isEmployer = (this.projectTarget=='employer');
        this.mangoPayTitle = "Prise d'empreinte";
        this.themeColor = config.themeColor;
        this.nav = nav;
    }

    openWallet(){
        let card = {
            cardNumber : this.cardNumber,
            cardType : 'CB',
            expireDate : this.cardExpirationDate,
            cvx : this.cardCvv
        };
        let loading = Loading.create({
            content: ` 
			<div>
			<img src='img/loading.gif' />
			</div>
			`,
            spinner : 'hide'
        });
        this.nav.present(loading);
        this.service.empreinteCarte(card).then(data=>{
            debugger;
            loading.dismiss();
            if(data.code == '02500'){
                this.nav.setRoot(MissionListPage);
            } else {
                let alert = Alert.create({
                    title: "Erreur de validation",
                    subTitle: "Les informations saisies ne sont pas valides, veuillez vérifier",
                    buttons: ['OK']
                });
                this.nav.present(alert);
            }

        });
    }

}
