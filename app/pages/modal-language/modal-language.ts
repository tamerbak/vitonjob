import {Page, NavController, Modal, ViewController} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {ModalSelectionPage} from "../modal-selection/modal-selection";

/*
 Generated class for the ModalLanguagePage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Page({
  templateUrl: 'build/pages/modal-language/modal-language.html',
})
export class ModalLanguagePage {

  languages: Array<{id:number, libelle: string}>;

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
    this.languages = [];
    this.viewCtrl = viewCtrl;
  }

  /**
   * @Description : loads language list
   */
  showLanguageList() {
    this.languageList = [{id: 1, libelle : "aaaa"}, {id:2, libelle : "bbbbb"}, {id:3, libelle : "ccccc"}];
    let selectionModel = Modal.create(ModalSelectionPage,
        {type : 'langue', items: this.languageList, selection : this});
    this.nav.present(selectionModel);
  }

  /**
   * @description : Closing the modal page :
   */
  closeModal() {
    this.viewCtrl.dismiss();
  }

  /**
   * @Description : Validating language modal
   */
  validateLanguage () {

    this.viewCtrl.dismiss();
  }
}
