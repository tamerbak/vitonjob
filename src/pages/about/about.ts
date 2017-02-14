import {Component} from "@angular/core";
import {AppVersion} from "ionic-native";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {HomePage} from "../home/home";
import {Platform} from "ionic-angular/index";


@Component({
  templateUrl: 'about.html',
  selector:'about'
})
export class AboutPage {

  public releaseDate: string;
  //appName: string;
  public version: string;
  public versionCode: string;
  public versionNumber: string;
  public logo: string;
  public projectName: string;
  public isEmployer: boolean;
  public themeColor: string;
  public push: any;

  constructor(gc: GlobalConfigs, platform: Platform) {
    /*let monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];*/
    //let date = new Date();
    this.releaseDate = "30 Janv 2017"; //date.getDate() + ' ' + monthNames[date.getMonth()] + ' ' + date.getFullYear();
    //this.appName = AppVersion.getAppName();
    //this.version = AppVersion.getPackageName();
    this.push = HomePage;

    let config = Configs.setConfigs(gc.getProjectTarget());
    this.themeColor = config.themeColor;
    this.logo = config.imageURL;
    this.projectName = config.projectName;
    this.isEmployer = (gc.getProjectTarget() === 'employer');

    AppVersion.getVersionNumber().then(_version => {
      this.versionNumber = _version;
      this.versionCode = '';
      if (platform.is('ios')) {
        AppVersion.getVersionCode().then(_build => {
          this.versionCode = ' (' + _build + ')';
        });
      }
    });

  }
}
