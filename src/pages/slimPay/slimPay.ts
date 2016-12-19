import {NavController} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Component} from "@angular/core";


@Component({
  templateUrl: 'slimPay.html',
})
export class SlimPayPage {

  public projectTarget: string;
  public isEmployer: boolean;
  public slimPayTitle: string;
  public themeColor: string;

  constructor(public nav: NavController, gc: GlobalConfigs) {

    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);

    // Set local variables and messages
    this.isEmployer = (this.projectTarget == 'employer');
    this.slimPayTitle = "SlimPay";
    this.themeColor = config.themeColor;
    this.nav = nav;
  }


}
