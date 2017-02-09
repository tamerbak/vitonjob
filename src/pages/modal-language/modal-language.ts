import {NavController, ModalController, ViewController, AlertController, NavParams, LoadingController} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {ModalSelectionPage} from "../modal-selection/modal-selection";
import {OffersService} from "../../providers/offers-service/offers-service";
import {Component} from "@angular/core";

/*
 Generated class for the ModalLanguagePage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  templateUrl: 'modal-language.html',
  selector:'modal-language'
})
export class ModalLanguagePage {

  public languages: Array<{
    'class': "com.vitonjob.callouts.auth.model.LanguageData",
    idLanguage: number,
    libelle: string,
    idlevel: number,
    level: string
  }>;
  public projectTarget: string;
  public themeColor: string;
  public inversedThemeColor: string;
  public isEmployer: boolean;
  public viewCtrl: any;
  public offerService: any;
  public languageList: any;

  constructor(public nav: NavController,
              gc: GlobalConfigs,
              viewCtrl: ViewController,
              params: NavParams,
              os: OffersService,
              public modal: ModalController,
              public alert: AlertController,
              public loading: LoadingController) {
    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);
    // Set local variables
    this.themeColor = config.themeColor;
    this.inversedThemeColor = config.inversedThemeColor;
    this.isEmployer = (this.projectTarget === 'employer');
    this.viewCtrl = viewCtrl;
    this.offerService = os;
    this.initializeLanguageList(params)
  }

  /**
   * @Description : Initializing qualities list
   */
  initializeLanguageList(params: NavParams) {
    let languages = params.get('languages');
    if (languages && languages.length > 0) {
      this.languages = languages;
    } else {
      this.languages = [];
    }
  }

  /**
   * @Description : loads language list
   */
  showLanguageList() {
    let loading = this.loading.create({content: "Merci de patienter..."});
    loading.present();

    this.offerService.loadLanguages(this.projectTarget).then((data: any) => {
      this.languageList = data;
      let selectionModel = this.modal.create(ModalSelectionPage,
        {type: 'langue', items: this.languageList, selection: this});
      selectionModel.present();
      loading.dismiss();
    });
  }

  /**
   * @description : Closing the modal page :
   */
  closeModal() {
    this.viewCtrl.dismiss(this.languages);
  }

  /**
   * @Description : Validating language modal
   */
  validateLanguage() {

    this.viewCtrl.dismiss(this.languages);
  }

  /**
   * @Description : removing slected language
   */
  removeLanguage(item) {

    let confirm = this.alert.create({
      title: 'Êtes-vous sûr?',
      message: 'Voulez-vous supprimer cette Langue?',
      buttons: [
        {
          text: 'Non',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Oui',
          handler: () => {
            console.log('Agree clicked');
            this.languages.splice(this.languages.indexOf(item), 1);
          }
        }
      ]
    });
    confirm.present();
  }
}
