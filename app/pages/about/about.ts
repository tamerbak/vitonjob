import {Component} from '@angular/core';
import {AppVersion} from "ionic-native/dist/index";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";


@Component({
    templateUrl: 'build/pages/about/about.html',
    providers: [GlobalConfigs]
})
export class AboutPage {

    releaseDate:string;
    appName:string;
    version:string;
    versionCode:string;
    versionNumber:string;
    logo:string;
    projectName:string;
    isEmployer:boolean;

    constructor(gc:GlobalConfigs) {
        this.releaseDate = '10 Juin 2016';
        //this.appName = AppVersion.getAppName();
        //this.version = AppVersion.getPackageName();

        let config = Configs.setConfigs(gc.getProjectTarget());
        this.logo = config.imageURL;
        this.projectName = config.projectName;
        this.isEmployer = (gc.getProjectTarget() === 'employer');

        AppVersion.getVersionNumber().then(_version => {
            this.versionNumber = _version;
            this.versionCode = '7';
            /*AppVersion.getVersionCode().then(_build => {
             this.versionCode = _build;
             });*/
        });

    }
}
