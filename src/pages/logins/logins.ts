import {Component} from "@angular/core";
import {NavController, NavParams, App} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {PhonePage} from "../phone/phone";
import {MailPage} from "../mail/mail";


@Component({
  templateUrl: 'logins.html'
})
export class LoginsPage {

  public phoneRoot: any;
  public mailRoot: any;
  public selectedItem: any;
  public projectTarget: any;
  public isEmployer: boolean;
  public phoneTabTitle: string;
  public mailTabTitle: string;

  constructor(public nav: NavController,
              app: App,
              navParams: NavParams,
              gc: GlobalConfigs) {
    // set the root pages for each tab
    this.phoneRoot = PhonePage;
    this.mailRoot = MailPage;
    //let test: any = app._config;
    this.nav = nav;
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');

    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    //let config = Configs.setConfigs(this.projectTarget);

    // Set local variables and messages
    this.isEmployer = (this.projectTarget == 'employer');
    this.phoneTabTitle = "Téléphone";
    this.mailTabTitle = "E-mail";
  }
}
