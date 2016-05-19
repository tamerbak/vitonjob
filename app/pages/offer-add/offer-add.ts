import {Page, NavController, Toast, Modal} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {ModalJobPage} from "../modal-job/modal-job";
import {ModalQualityPage} from "../modal-quality/modal-quality";
import {ModalLanguagePage} from "../modal-language/modal-language";
import {ModalCalendarPage} from "../modal-calendar/modal-calendar";

/*
  Generated class for the OfferAddPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/offer-add/offer-add.html',
  providers: [GlobalConfigs]
})
export class OfferAddPage {
  constructor(public nav: NavController, private gc: GlobalConfigs) {

    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);
    // Set local variables
    this.themeColor = config.themeColor;
    this.isJobValidated = false;
    this.isOfferValidated = false;
    this.isEmployer = (this.projectTarget === 'employer');

  }

  /** ########### Toast #############*/

  /**
   *  Present the global toast that validate offer-list insertion
   */
  presentToast(message: string) {
    let toast = Toast.create({
      message: message,//"Agenda bien insérée, Votre offre est valide",
      duration: 3000
    });

    toast.onDismiss(() => {
      console.log('Dismissed toast');
      this.isOfferValidated = (!this.isOfferValidated);
    });

    this.nav.present(toast);
  }

  /**########## Modals #############*/

  /**
   * Create Job modal
   */
  showJobModal() {
    let modal = Modal.create(ModalJobPage);
    this.nav.present(modal);
  }

  /**
   * Create Qualities modal
   */
  showQualityModal() {
    let modal = Modal.create(ModalQualityPage);
    this.nav.present(modal);
  }

  /**
   * Create Lanuage modal
   */
  showLanguageModal() {
    let modal = Modal.create(ModalLanguagePage);
    this.nav.present(modal);
  }

  /**
   * Create Calendar modal
   */
  showCalendarModal() {
    let modal = Modal.create(ModalCalendarPage);
    this.nav.present(modal);
  }

}
