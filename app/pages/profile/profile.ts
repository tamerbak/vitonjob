import {Page, NavController} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";

/*
 Generated class for the ProfilePage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Page({
    templateUrl: 'build/pages/profile/profile.html',
    providers: [GlobalConfigs]
})
export class ProfilePage {
    themeColor:string;
    inversedThemeColor:string;
    isEmployer:boolean;
    projectTarget: GlobalConfigs;
    userImageURL: string;

    constructor(public nav:NavController, public gc:GlobalConfigs) {

        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        //Initializing page:
        this.initializePage(config);

    }

    /**
     * @Author : TEL
     * @Description : Initializing Offer adding buttons
     */
    initializePage(config) {
        // Set local variables
        this.themeColor = config.themeColor;
        this.inversedThemeColor = config.inversedThemeColor;
        this.isEmployer = (this.projectTarget === 'employer');
        this.userImageURL = config.userImageURL;
    }
}
