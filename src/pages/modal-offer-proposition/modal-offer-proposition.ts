import {NavController, NavParams, ViewController} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Component} from "@angular/core";
import {Storage} from "@ionic/storage";
import {Configs} from "../../configurations/configs";

/*
 Generated class for the ModalOfferPropositionPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  templateUrl: 'modal-offer-proposition.html'
})
export class ModalOfferPropositionPage {
  public proposedJob: any;
  public proposedLanguages: any = [];
  public proposedQualities: any = [];
  public projectTarget: string;
  public isEmployer: boolean;
  public themeColor: string;

  constructor(public nav: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController, gc: GlobalConfigs, public storage: Storage) {
    this.proposedJob = navParams.get('proposedJob');
    this.proposedLanguages = navParams.get('proposedLanguages');
    this.proposedQualities = navParams.get('proposedQualities');
    this.projectTarget = gc.getProjectTarget();
    this.isEmployer = this.projectTarget === 'employer';
    let config = Configs.setConfigs(this.projectTarget);
    this.themeColor = config.themeColor;
  }

  /**
   * @description saves the job proposition in the local storage of the phone
   */
  saveProposition() {
    //  Initialize local storage

    //  Persist the proposed job
    let jobData = {
      sector: this.proposedJob.libellemetier,
      job: this.proposedJob.libellejob,
      idSector: this.proposedJob.idmetier,
      idJob: this.proposedJob.id,
      level: "junior",
      remuneration: 0,
      validated: false
    };
    this.storage.set('jobData', JSON.stringify(jobData));

    //  Persist languages
    let languageData = [];
    for (let i = 0; i < this.proposedLanguages.length; i++) {
      let l = this.proposedLanguages[i];
      languageData.push({
        id: l.id,
        libelle: l.libelle,
        idlevel: 2,
        level: "junior"
      });
    }
    this.storage.set('languages', JSON.stringify(languageData));

    //  Persist qualities
    let qualitiesData = [];
    for (let i = 0; i < this.proposedQualities.length; i++) {
      let q = this.proposedQualities[i];
      qualitiesData.push(q);
    }
    this.storage.set('qualities', JSON.stringify(qualitiesData));

    //  Offer is ready show page
    let status = {status: true};
    this.viewCtrl.dismiss(status);
  }

  deleteLanguage(item) {
    let i = 0;
    for (i = 0; i < this.proposedLanguages.length; i++)
      if (this.proposedLanguages[i].id == item.id)
        break;
    this.proposedLanguages.splice(i, 1);
  }

  deleteQuality(item) {
    let i = 0;
    for (i = 0; i < this.proposedQualities.length; i++)
      if (this.proposedQualities[i].id == item.id)
        break;
    this.proposedQualities.splice(i, 1);
  }

  cancel() {
    let status = {status: false};
    this.viewCtrl.dismiss(status);
  }

  /**
   * @description : Closing the modal page :
   */
  closeModal() {
    this.viewCtrl.dismiss();
  }
}
