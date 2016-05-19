import {Page, NavController, Modal, ViewController} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {ModalSelectionPage} from "../modal-selection/modal-selection";

/*
  Generated class for the ModalQualityPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/modal-quality/modal-quality.html',
})
export class ModalQualityPage {

  qualities: Array<{id:number, libelle: string}>;

  constructor(public nav: NavController,
              gc: GlobalConfigs,
              viewCtrl : ViewController) {
    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);
    // Set local variables
    this.themeColor = config.themeColor;
    this.isEmployer = (this.projectTarget === 'employer');
    this.qualities = [];
    this.viewCtrl = viewCtrl;
  }

  /**
   * @Description : loads quality list
   */
  showQualityList() {
    this.qualityList = [{id: 1, libelle : "aaaa"}, {id:2, libelle : "bbbbb"}, {id:3, libelle : "ccccc"}];
    let selectionModel = Modal.create(ModalSelectionPage,
        {type : 'qualité', items: this.qualityList, selection : this});
    this.nav.present(selectionModel);
  }

  /**
   * @description : Closing the modal page :
   */
  closeModal() {
    this.viewCtrl.dismiss();
  }

  /**
   * @Description : Validating quality modal
   */
  validateQuality () {

    this.viewCtrl.dismiss();
  }
}
