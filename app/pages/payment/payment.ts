import {NavController, Page, IonicApp, NavParams} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {MangoPayPage} from '../mangoPay/mangoPay';
import {SlimPayPage} from '../slimPay/slimPay';


@Page({
  templateUrl: 'build/pages/payment/payment.html',
  providers: [GlobalConfigs]
})
export class PaymentPage {

  mangoPayRoot: any;
  slimPayRoot: any;
  nav: any;
  selectedItem: any;
  projectTarget: any;
  isEmployer: boolean;
  mangoPayTabTitle : string;
  slimPayTabTitle: string;

  constructor(public nav: NavController,
              app: IonicApp,
              navParams: NavParams,
              gc:GlobalConfigs) {
    // set the root pages for each tab
    this.mangoPayRoot = MangoPayPage;
    this.slimPayRoot = SlimPayPage;
    this.nav = nav;
    

    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);

    // Set local variables and messages
    this.isEmployer = (this.projectTarget=='employer');
    this.mangoPayTabTitle = "MangoPay";
    this.slimPayTabTitle = "SlimPay";
  }
}
