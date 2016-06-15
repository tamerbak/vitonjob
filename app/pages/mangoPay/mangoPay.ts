import {NavController} from 'ionic-angular';
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
        debugger;
        this.service.empreinteCarte(card).then(data=>{
            this.nav.setRoot(MissionListPage);
        });
    }

}
