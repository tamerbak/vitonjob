import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {Component} from "@angular/core";
import {NavController, ViewController, NavParams} from "ionic-angular";

/*
 Generated class for the PopoverOfferDetailPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'popover-offer-detail',
  templateUrl: 'popover-offer-detail.html'
})
export class PopoverOfferDetailPage {

  public themeColor: string;
  public isEmployer: boolean;
  public projectTarget: string;
  public visibility: boolean;
  public autoSearch: boolean;

  constructor(public nav: NavController, public gc: GlobalConfigs, public ctrlView: ViewController, public params: NavParams) {
    this.projectTarget = gc.getProjectTarget();
    let config = Configs.setConfigs(this.projectTarget);
    this.themeColor = config.themeColor;
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
