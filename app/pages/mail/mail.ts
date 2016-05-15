import {Page, NavController} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {OfferPage} from "../offer/offer";

/*
  Generated class for the MailPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/mail/mail.html',
  prividers: [GlobalConfigs]
})
export class MailPage {

  projectTarget: string;
  isEmployer: boolean;
  mailTitle: string;
  themeColor: string;

  constructor(public nav: NavController, gc: GlobalConfigs) {

    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);

    // Set local variables and messages
    this.isEmployer = (this.projectTarget=='employer');
    this.mailTitle = "E-mail";
    this.themeColor = config.themeColor;
    this.nav = nav;
  }

  openOfferPage() {
    this.nav.push(OfferPage);
  }
}
