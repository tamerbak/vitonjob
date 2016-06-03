import {Page, NavController, NavParams, Storage, LocalStorage, ViewController} from 'ionic-angular';
import {OfferAddPage} from "../offer-add/offer-add";

/*
  Generated class for the ModalOfferPropositionPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/modal-offer-proposition/modal-offer-proposition.html',
})
export class ModalOfferPropositionPage {
  proposedJob:any;
  proposedLanguages:any=[];
  proposedQualities:any=[];

  constructor(public nav: NavController,
              public navParams : NavParams,
              public viewCtrl : ViewController) {
    this.proposedJob = navParams.get('proposedJob');
    this.proposedLanguages = navParams.get('proposedLanguages');
    this.proposedQualities = navParams.get('proposedQualities');
  }

  /**
   * @description saves the job proposition in the local storage of the phone
   */
  saveProposition(){
    //  Initialize local storage
    let local = new Storage(LocalStorage);

    //  Persist the proposed job
    let jobData = {
      sector : this.proposedJob.libellemetier,
      job : this.proposedJob.libellejob,
      idSector : this.proposedJob.idmetier,
      idJob : this.proposedJob.id,
      level : "junior",
      remuneration : 0,
      validated : false
    };
    local.set('jobData', JSON.stringify(jobData));

    //  Persist languages
    let languageData = [];
    for(let i = 0 ; i < this.proposedLanguages.length ; i++){
      let l = this.proposedLanguages[i];
      languageData.push({
        id : l.id,
        libelle : l.libelle,
        idlevel : 2,
        level : "junior"
      });
    }
    local.set('languages', JSON.stringify(languageData));

    //  Persist qualities
    let qualitiesData = [];
    for(let i = 0 ; i < this.proposedQualities.length ; i++){
      let q = this.proposedQualities[i];
      qualitiesData.push(q);
    }
    local.set('qualities', JSON.stringify(qualitiesData));

    //  Offer is ready show page
    let status = {status : true};
    this.viewCtrl.dismiss(status);
  }

  cancel(){
    let status = {status : false};
    this.viewCtrl.dismiss(status);
  }
}
