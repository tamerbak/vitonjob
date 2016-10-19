import {Component} from "@angular/core";
import {NavController, NavParams, ViewController} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";

/*
 Generated class for the PopoverOfferDetailPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/popover-offer-detail/popover-offer-detail.html',
    providers: [GlobalConfigs]
})
export class PopoverOfferDetailPage {

    themeColor: string;
    isEmployer: boolean;
    projectTarget: string;
    ctrlView: any;
    visibility: boolean;
    autoSearch: boolean;

    constructor(private nav: NavController, gc: GlobalConfigs, ctrlView: ViewController, params: NavParams) {
        this.projectTarget = gc.getProjectTarget();
        let config = Configs.setConfigs(this.projectTarget);
        this.themeColor = config.themeColor;
        this.ctrlView = ctrlView;
        this.visibility = params.get('visibility');
        this.autoSearch = params.get('autoSearch');
        this.isEmployer = (this.projectTarget === 'employer');
    }

    /**
     * Copy current offer
     */
    copyOffer() {
        this.ctrlView.dismiss({option: 1});
    }

    changePrivacy() {
        this.ctrlView.dismiss({option: 2});
    }

    launchSearch() {
        this.ctrlView.dismiss({option: 3});
    }

    autoSearchMode() {
        this.ctrlView.dismiss({option: 4});
    }

    showQuote() {
        this.ctrlView.dismiss({option: 5});
    }

    deleteOffer() {
        this.ctrlView.dismiss({option: 6});
    }
}