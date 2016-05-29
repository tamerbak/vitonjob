import {Page, NavController} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {SearchService} from "../../providers/search-service/search-service";
import {Configs} from "../../configurations/configs";
import {OfferAddPage} from "../offer-add/offer-add";
import {OfferDetailPage} from "../offer-detail/offer-detail";
import {OffersService} from "../../providers/offers-service/offers-service";
import {isUndefined} from "ionic-angular/util";

/*
 Generated class for the OfferListPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Page({
    templateUrl: 'build/pages/offer-list/offer-list.html',
    providers: [SearchService, GlobalConfigs, OffersService]
})
export class OfferListPage {

    offerList = [];
    offerService: OffersService;
    projectTarget: string;

    constructor(public nav:NavController,
                public gc:GlobalConfigs,
                public search:SearchService,
                public offersService : OffersService) {

        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(this.projectTarget);

        // Set local variables and messages
        this.isEmployer = (this.projectTarget == 'employer');
        this.phoneTitle = "Téléphone";
        this.themeColor = config.themeColor;
        this.listMode = true;
        this.okButtonName = "add";
        this.isEmployer = (this.projectTarget === 'employer');
        //this.cancelButtonName = "";
        //this.loadPeople();

        // jQuery code for dragging components
        // console.log($( "#draggable" ).draggable());

        this.offerService = offersService;
        this.offerService.loadOfferList(this.projectTarget).then(data => {
            debugger;
            this.offerList = data;
            for (var i = 0; i < this.offerList.length; i++) {
                let offer = this.offerList[i];
                offer.correspondantsCount = 0;
                if (isUndefined(offer) || !offer || !offer.jobData) {
                    continue;
                }
                this.offerService.getCorrespondingOffers(offer, this.projectTarget).then(data => {
                    console.log('getCorrespondingOffers result : ' + data);
                    offer.correspondantsCount = data.length;
                });
            }
        });
    }

    // Testing a web service call
    /*loadPeople() {
        this.search.load()
            .then(data => {
                this.people = data.results;
            });
    }*/

    onAddOffer() {
        this.listMode = (!this.listMode);
        if (this.mode)
            this.okButtonName = "add";
        else
            this.okButtonName = "checkmark-circle";
    }

    /**
     * @Description: Navigating to new offer page
     */
    goToNewOffer() {
        this.nav.push(OfferAddPage);
    }

    /**
     * @Description: Navigating to detail offer page
     */
    goToDetailOffer(offer) {
        this.nav.push(OfferDetailPage, {selectedOffer: offer});
    }

    getOfferBadge(item){

        if( isUndefined(item) || !item || !item.pricticesJob || item.pricticesJob.length == 0){
            item.correspondantsCount = 0;
            return;
        }

        this.offersService.getBadgeCount(item.pricticesJob[0].pricticeJobId, this.projectTarget).then(count => {
            console.log(count);
            item.correspondantsCount = count;
        });
    }

}
