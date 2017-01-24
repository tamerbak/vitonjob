import {NavController, ModalController,LoadingController, ViewController, NavParams, AlertController} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {ModalSelectionPage} from "../modal-selection/modal-selection";
import {OffersService} from "../../providers/offers-service/offers-service";
import {Component} from "@angular/core";

/*
 Generated class for the ModalQualityPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  templateUrl: 'modal-quality.html'
})
export class ModalQualityPage {

  public qualities: Array<{
    'class': "com.vitonjob.callouts.auth.model.LanguageData",
    idQuality: number,
    libelle: string
  }>;
  public projectTarget: string;
  public themeColor: string;
  public viewCtrl: any;
  public isEmployer: boolean;
  public params: any;
  public offerService: any;
  public qualityList = [];

  constructor(public nav: NavController,
              gc: GlobalConfigs,
              viewCtrl: ViewController,
              params: NavParams,
              os: OffersService,
              public loading: LoadingController,
              public alert: AlertController, 
              public modal: ModalController) {
    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);
    // Set local variables
    this.themeColor = config.themeColor;
    this.isEmployer = (this.projectTarget === 'employer');
    this.viewCtrl = viewCtrl;
    this.params = params;
    this.offerService = os;

    this.initializeQualityList(params);
  }

  /**
   * @Description : Initializing qualities list
   */
  initializeQualityList(params: NavParams) {
    let qualities = params.get('qualities');
    if (qualities && qualities.length > 0)
      this.qualities = qualities;
    else
      this.qualities = [];
  }

  /**
   * @Description : loads quality list
   */
  showQualityList() {
    let loading = this.loading.create({content:"Merci de patienter..."});
    loading.present();
    /*if (this.qualityList && this.qualityList.length > 0)
     return;*/
    this.offerService.loadQualities(this.projectTarget).then((data: any) => {
      loading.dismiss();
      this.qualityList = data;
      let selectionModel = this.modal.create(ModalSelectionPage,
        {type: 'qualité', items: this.qualityList, selection: this});
      selectionModel.present();
    });
  }

  /**
   * @description : Closing the modal page :
   */
  closeModal() {
    this.viewCtrl.dismiss(this.qualities);
  }

  /**
   * @Description : Validating quality modal
   */
  validateQuality() {

    this.viewCtrl.dismiss(this.qualities);
  }

  /**
   * @Description : removing slected quality
   */
  removeQuality(item) {

    let confirm = this.alert.create({
      title: 'Êtes-vous sûr?',
      message: 'Voulez-vous supprimer cette qualité?',
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
            this.qualities.splice(this.qualities.indexOf(item), 1);
          }
        }
      ]
    });
    confirm.present();
  }
}
