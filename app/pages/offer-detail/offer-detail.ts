import {Page, NavController, NavParams} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";

/*
 Generated class for the OfferDetailPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Page({
    templateUrl: 'build/pages/offer-detail/offer-detail.html',
})
export class OfferDetailPage {
    constructor(public nav:NavController, gc:GlobalConfigs, params:NavParams) {

        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        // Set local variables
        this.themeColor = config.themeColor;
        this.isEmployer = (this.projectTarget === 'employer');

        // Get Offer passed in NavParams
        // params.get('selectedOffer')...
        // 

    }

    /**
     * @Description : Launch search from current offer-list
     */
    launchSearch () {}
}
