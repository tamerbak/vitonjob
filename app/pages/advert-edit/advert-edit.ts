import {Component} from "@angular/core";
import {NavController, NavParams, Storage, SqlStorage, Loading} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {isUndefined} from "ionic-angular/util";
import {GlobalService} from "../../providers/global.service";
import {AdvertService} from "../../providers/advert.service";
import {Utils} from "../../utils/utils";
import {OfferDetailPage} from "../offer-detail/offer-detail";

@Component({
    templateUrl: 'build/pages/advert-edit/advert-edit.html',
    providers: [GlobalService, AdvertService]
})
export class AdvertEditPage {

    projectTarget: string;
    backgroundImage: any;
    db: Storage;
    isHunter:boolean = false ;
    advert: any;
    isEmployer : boolean;
    themeColor : any;

    constructor(public nav: NavController,
                public navParams: NavParams,
                public gc: GlobalConfigs,
                private globalService: GlobalService,
                private advertService: AdvertService) {

        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);
        this.isHunter = gc.getHunterMask();

        // Set local variables and messages
        this.isEmployer = (this.projectTarget == 'employer');
        this.themeColor = config.themeColor;
        this.backgroundImage = config.backgroundImage;
        this.db = new Storage(SqlStorage);
        this.advert = navParams.get('advert');
        this.advert.hasOffer = (this.advert.offerId != 0 && !Utils.isEmpty(this.advert.offerId) ? true : false);
    }

    goToOffer(){
        this.advertService.getOfferById(this.advert.offerId).then((data: any) => {
            this.nav.push(OfferDetailPage, {selectedOffer: data});
        })
    }
}