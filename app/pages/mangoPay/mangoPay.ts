import {NavController} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {OfferPage} from "../offer/offer";
import {Component} from "@angular/core";

@Component({
  templateUrl: 'build/pages/mangoPay/mangoPay.html',
})
export class MangoPayPage {

  projectTarget: string;
  isEmployer: boolean;
  mangoPayTitle: string;
  themeColor: string;
  
  cardNumber:string;
  cardExpirationDate:number;
  cardCvv:string;

  constructor(public nav: NavController, gc: GlobalConfigs) {

    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);

    // Set local variables and messages
    this.isEmployer = (this.projectTarget=='employer');
    this.mangoPayTitle = "MangoPay";
    this.themeColor = config.themeColor;
    this.nav = nav;
  }
  
}
