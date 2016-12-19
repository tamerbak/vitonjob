import {Component} from "@angular/core";
import {NavController, ModalController} from "ionic-angular";
import {SearchCriteriaPage} from "../search-criteria/search-criteria";
import {SearchGuidePage} from "../search-guide/search-guide";

/*
 Generated class for the PopoverSearchPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  templateUrl: 'popover-search.html',
})
export class PopoverSearchPage {

  public popInCriteria: boolean = false;

  constructor(public nav: NavController, public modal: ModalController) {
  }

  /**
   * @description this method allows to render the multicriteria modal component
   */
  showCriteriaModal() {
    let dismissedModal = function () {
      this.popInCriteria = false;
    };

    if (this.popInCriteria)
      return;
    let m = this.modal.create(SearchCriteriaPage);
    m.onDidDismiss(dismissedModal.bind(this));
    this.popInCriteria = true;
    m.present();
  }

  /**
   * @description this method allows to render the guided search modal component
   */
  showGuideModal() {
    let dismissedModal = function () {
      this.popInCriteria = false;
    };

    let m: any;
    if (this.popInCriteria)
      m = this.modal.create(SearchGuidePage);
    m.onDidDismiss(dismissedModal.bind(this));
    this.popInCriteria = true;
    m.present(m);
  }


}
