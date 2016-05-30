import {Page, NavController, ViewController} from 'ionic-angular';
import {OffersService} from "../../providers/offers-service/offers-service";
import {SearchService} from "../../providers/search-service/search-service";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {isUndefined} from "ionic-angular/util";
import {Configs} from "../../configurations/configs";

/**
 * @author Abdeslam Jakjoud
 * @description modal popup showing offers list
 * @module Contract signature
 */
@Page({
  templateUrl: 'build/pages/modal-offers/modal-offers.html',
})
export class ModalOffersPage {
  projectTarget : any;
  offerList : any = [];
  offerService : any;
  constructor(private viewCtrl: ViewController,
              public nav:NavController,
              public gc:GlobalConfigs,
              public search:SearchService,
              public offerService : OffersService) {

    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);

    // Load offers
    this.offerService = offerService;
    this.offerService.loadOfferList(this.projectTarget).then(data => {
      debugger;
      this.offerList = data;
    });
  }

  /**
   * @description Sets the default current offer
   * @param offer
   */
  chooseOffer(offer){
    this.viewCtrl.dismiss(offer);
  }
}
