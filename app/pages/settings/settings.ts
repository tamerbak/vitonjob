import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";

/*
  Generated class for the SettingsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/settings/settings.html',
})
export class SettingsPage {
  options:any;
  projectTarget:string;
  isEmployer:boolean;

  constructor(public nav: NavController, gc: GlobalConfigs) {
    this.projectTarget = gc.getProjectTarget();
    let config = Configs.setConfigs(this.projectTarget);
    this.options = config.options;
    this.isEmployer = (this.projectTarget === 'employer');
  }
  
}
