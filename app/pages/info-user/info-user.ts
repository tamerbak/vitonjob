import {NavController, Page, IonicApp, NavParams} from 'ionic-angular';
import {CivilityPage} from '../civility/civility';
import {PersonalAddressPage} from '../personal-address/personal-address';
import {JobAddressPage} from '../job-address/job-address';


@Page({
  templateUrl: 'build/pages/info-user/info-user.html'
})
export class InfoUserPage {

  civilityRoot: any;
  pAddressRoot: any;
  jAddressRoot: any;
  civilityTabTitle : string;
  pAddressTabTitle: string;
  jAddressTabTitle: string;

  constructor(public nav: NavController,
              app: IonicApp,
              navParams: NavParams) {
    // set the root pages for each tab
    this.civilityRoot = CivilityPage;
    this.pAddressRoot = PersonalAddressPage;
    this.jAddressRoot = JobAddressPage;

    this.nav = nav;

    this.civilityTabTitle = "Civilité";
    this.pAddressTabTitle = "A. personnelle";
    this.jAddressTabTitle = "A. départ au travail";
  }
}