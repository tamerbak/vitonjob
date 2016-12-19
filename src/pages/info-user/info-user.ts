import {Component} from "@angular/core";
import {NavController, NavParams} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {CivilityPage} from "../civility/civility";
import {PersonalAddressPage} from "../personal-address/personal-address";
import {JobAddressPage} from "../job-address/job-address";

/**
 * @author Amal ROCHD
 * @description tabs of user information entry : civility, personal address and job address
 * @module Authentication
 */
@Component({
  templateUrl: 'info-user.html'
})
export class InfoUserPage {
  public civilityRoot: any;
  public pAddressRoot: any;
  public jAddressRoot: any;
  public civilityTabTitle: string;
  public pAddressTabTitle: string;
  public jAddressTabTitle: string;
  public projectTarget: string;
  public selectedTab: number;
  public navParams: any;
  public dataParams: any;
  public isEmployer: boolean;

  /**
   * @description While constructing the tabs, we bind each tab to its page
   */
  constructor(public nav: NavController, public gc: GlobalConfigs,
              navParams: NavParams) {
    // set the root pages for each tab
    this.civilityRoot = CivilityPage;
    this.pAddressRoot = PersonalAddressPage;
    this.jAddressRoot = JobAddressPage;

    this.nav = nav;
    this.navParams = navParams;
    this.dataParams = this.navParams.data;
    this.selectedTab = this.dataParams.selectedTab;

    // Set global configs
    this.projectTarget = gc.getProjectTarget();
    // get config of selected target
    //let config = Configs.setConfigs(this.projectTarget);
    // Set local variables and messages
    this.isEmployer = (this.projectTarget == 'employer');

    this.civilityTabTitle = this.isEmployer ? "Fiche entreprise" : "Profil";
    this.pAddressTabTitle = this.isEmployer ? "A. siège" : "A. personnelle";
    this.jAddressTabTitle = this.isEmployer ? "A. mission" : "A. départ au travail";
  }
}
