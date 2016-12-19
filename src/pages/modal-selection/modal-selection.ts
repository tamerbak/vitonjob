import {NavController, NavParams, ViewController, ToastController} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {Component} from "@angular/core";
import {ModalJobPage} from "../modal-job/modal-job";

/*
 Generated class for the ModalSelectionPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  templateUrl: 'modal-selection.html',
})
export class ModalSelectionPage {

  public list: any = [];


  public projectTarget: any;
  public themeColor: string;
  public isJobValidated: boolean;
  public isOfferValidated: boolean;
  public isEmployer: boolean;
  public searchQuery: string;
  public searchPlaceholder: string;
  public cancelButtonText: string;

  constructor(private nav: NavController,
              private gc: GlobalConfigs,
              private params: NavParams,
              private viewCtrl: ViewController,
              public toast: ToastController) {


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

    this.viewCtrl = viewCtrl;
    this.params = params;
    this.initializeItems(params.get('items'));
    this.searchQuery = "";
    this.searchPlaceholder = 'Recherchez votre ' + params.get('type');
    this.cancelButtonText = 'Annuler';

  }

  /**
   * @Description : initializing items' list
   */
  initializeItems(items: any) {
    this.list = items;
  }

  /**
   * @Description : Closing modal page
   */
  closeModal() {
    this.viewCtrl.dismiss();
  }

  /**
   * @Description : Validating selection page with one value selected..
   */
  validateModal(item) {
    let isQualityExist = false;
    let isLangExist = false;
    switch (this.params.get('type')) {
      case 'secteur' :
        this.params.get('selection').jobData.class = 'com.vitonjob.callouts.auth.model.JobData';
        this.params.get('selection').jobData.sector = item.libelle;
        this.params.get('selection').jobData.idSector = item.id;
        if (!(this.params.get('selection').jobData.job === ''))
          this.params.get('selection').jobData.job = '';
        break;
      case 'job' :
        this.params.get('selection').jobData.class = 'com.vitonjob.callouts.auth.model.JobData';
        this.params.get('selection').jobData.job = item.libelle;
        this.params.get('selection').jobData.idJob = item.id;
        if (!this.params.get('selection').jobData.sector ||
          this.params.get('selection').jobData.sector === '') {
          this.params.get('selection').jobData.sector = item.libellesector;
          this.params.get('selection').jobData.idSector = item.idsector;
        }
        break;
      case 'niveau' :
        this.params.get('selection').updateHourRateThreshold(
          this.params.get('selection').conventionFilters[ModalJobPage.CONV_FILTER_NIV],
          item
        );
        break;
      case 'echelon' :
        this.params.get('selection').updateHourRateThreshold(
          this.params.get('selection').conventionFilters[ModalJobPage.CONV_FILTER_ECH],
          item
        );
        break;
      case 'catégorie' :
        this.params.get('selection').updateHourRateThreshold(
          this.params.get('selection').conventionFilters[ModalJobPage.CONV_FILTER_CAT],
          item
        );
        break;
      case 'coéfficient' :
        this.params.get('selection').updateHourRateThreshold(
          this.params.get('selection').conventionFilters[ModalJobPage.CONV_FILTER_COEF],
          item
        );
        break;
      case 'qualité' :
        if (this.params.get('selection').qualities.filter((v) => {
            return (v.libelle.toLowerCase().indexOf(item.libelle.toLowerCase()) > -1)
          }).length == 0) {
          item.class = 'com.vitonjob.callouts.auth.model.QualityData';
          this.params.get('selection').qualities.push(item);
        } else {
          isQualityExist = true;
        }
        break;
      case 'langue' :
        if (this.params.get('selection').languages.filter((v) => {
            return (v.libelle.toLowerCase().indexOf(item.libelle.toLowerCase()) > -1)
          }).length == 0) {
          item.class = 'com.vitonjob.callouts.auth.model.LanguageData';
          this.params.get('selection').languages.push(item);
        } else {
          isLangExist = true;
        }
        break;
    }


    this.viewCtrl.dismiss().then(() => {
      if (isQualityExist) {
        let toast = this.toast.create({
          message: "Vous avez déjà choisi cette qualité! Merci d'en sélectionner une autre.",
          duration: 3000
        });

        toast.onDidDismiss(() => {
          console.log('Dismissed toast');
        });

        toast.present();
      }
      if (isLangExist) {
        let toast = this.toast.create({
          message: "Vous avez déjà choisi cette langue! Merci d'en sélectionner une autre.",
          duration: 3000
        });

        toast.onDidDismiss(() => {
          console.log('Dismissed toast');
        });

        toast.present();
      }
    });
  }

  /**
   * @Description : searching typed text in selection items
   * @param ev : search value
   */
  getItems(ev) {
    // Reset items back to all of the items
    this.initializeItems(this.params.get('items'));

    // set q to the value of the searchbar
    let q = ev.target.value;

    // if the value is an empty string don't filter the items
    if (q.trim() == '') {
      return;
    }

    this.list = this.list.filter((v) => {
      return (v.libelle.toLowerCase().indexOf(q.toLowerCase()) > -1);
    })
  }
}
