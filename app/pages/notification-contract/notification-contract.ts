import {Component} from "@angular/core";
import {NavController, NavParams} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {ContractPage} from "../contract/contract";

/*
 Generated class for the NotificationContarctPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/notification-contract/notification-contract.html',
    providers: [GlobalConfigs]
})
export class NotificationContractPage {

    projectTarget: string;
    isEmployer: boolean;
    backgroundImage: any;
    jobyer: any;
    offer: any;
    themeColor: string;

    constructor(private nav: NavController, gc: GlobalConfigs, navParams: NavParams) {

        this.projectTarget = gc.getProjectTarget();
        this.isEmployer = this.projectTarget === 'employer';

        let config = Configs.setConfigs(this.projectTarget);
        this.backgroundImage = config.backgroundImage;
        this.jobyer = navParams.data.jobyer;
        this.offer = navParams.data.currentOffer;
        this.themeColor = config.themeColor;

    }

    gotoContractForm() {
        this.nav.push(ContractPage, {jobyer: this.jobyer, currentOffer: this.offer});
    }


}
