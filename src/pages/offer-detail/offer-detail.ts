import {
  NavController,
  NavParams,
  LoadingController,
  ModalController,
  AlertController,
  PopoverController
} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";
import {SearchResultsPage} from "../../pages/search-results/search-results";
import {OffersService} from "../../providers/offers-service/offers-service";
import {SearchService} from "../../providers/search-service/search-service";
import {ModalJobPage} from "../modal-job/modal-job";
import {ModalQualityPage} from "../modal-quality/modal-quality";
import {ModalLanguagePage} from "../modal-language/modal-language";
import {ModalCalendarPage} from "../modal-calendar/modal-calendar";
import {OfferListPage} from "../offer-list/offer-list";
import {Component} from "@angular/core";
import {PopoverOfferDetailPage} from "../popover-offer-detail/popover-offer-detail";
import {DomSanitizer} from "@angular/platform-browser";
import {GlobalService} from "../../providers/global-service/global-service";
import {OfferTempQuotePage} from "../offer-temp-quote/offer-temp-quote";
import {Storage} from "@ionic/storage";

/*
 Generated class for the OfferDetailPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector:'offer-detail',
  templateUrl: 'offer-detail.html'
})
export class OfferDetailPage {
  public offer: any;
  public offerService: OffersService;
  public videoAvailable: boolean = false;
  public youtubeLink: string = '';
  public isLinkValid = true;
  public fromPage: string;
  //public originalJobData: any;
  //public adressData: any;
  public fullAdress: any;
  public idTiers: number;
  public projectTarget: string;
  public themeColor: string;
  public inversedThemeColor: string;
  public backgroundImage: any;
  public isEmployer: boolean;
  public sanitizer: any;
  public showJob: boolean;
  public jobIconName: string;
  public showQuality: boolean;
  public qualityIconName: string;
  public showLanguage: boolean;
  public languageIconName: string;
  public showCalendar: boolean;
  public calendarIconName: string;
  public modified: any;
  public jobStyle: any;
  public qualityStyle: any;
  public languageStyle: any;
  public calendarStyle: any;
  public backGroundColor:string;

  constructor(public nav: NavController,
              public gc: GlobalConfigs,
              public params: NavParams,
              public offersService: OffersService,
              public searchService: SearchService,
              public _sanitizer: DomSanitizer,
              public globalService: GlobalService,
              public alert: AlertController,
              public loading: LoadingController,
              public modal: ModalController,
              public popover: PopoverController,
              public storage:Storage) {

    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);
    // Set local variables
    this.themeColor = config.themeColor;
    this.inversedThemeColor = config.inversedThemeColor;
    this.backgroundImage = config.backgroundImage;
    this.isEmployer = (this.projectTarget === 'employer');
    this.sanitizer = _sanitizer;
    this.offerService = offersService;
    this.backGroundColor = config.backGroundColor;

    // Get Offer passed in NavParams
    this.offer = params.get('selectedOffer');
    this.fromPage = params.get('fromPage');
    this.showJob = false;
    this.jobIconName = 'add';
    this.showQuality = false;
    this.qualityIconName = 'add';
    this.showLanguage = false;
    this.languageIconName = 'add';
    this.showCalendar = false;
    this.calendarIconName = 'add';

    this.modified = {
      isJob: false,
      isQuality: false,
      isLanguage: false,
      isCalendar: false
    };

    this.jobStyle = {
      backgroundImage: {'background-image': "url('assets/img/job.png')"},
      fontColor: "white",
      buttonColor: "white",//transparent
      fontWeight: "bolder"
    };

    this.qualityStyle = {
      backgroundImage: {'background-image': "url('assets/img/quality.png')"},
      fontColor: "white",
      buttonColor: "white",//transparent
      fontWeight: "bolder"
    };

    this.languageStyle = {
      backgroundImage: {'background-image': "url('assets/img/language.png')"},
      fontColor: "white",
      buttonColor: "white",//transparent
      fontWeight: "bolder"
    };

    this.calendarStyle = {
      backgroundImage: {'background-image': "url('assets/img/calendar.png')"},
      fontColor: "white",
      buttonColor: "white",//transparent
      fontWeight: "bolder"
    };

    //let table = !this.isEmployer?'user_offre_jobyer':'user_offre_entreprise';
    if (!this.offer.videolink) {
      this.videoAvailable = false;
    } else {
      this.videoAvailable = true;
      this.youtubeLink = this.offer.videolink.replace("youtu.be", "www.youtube.com/embed").replace("watch?v=", "embed/");
    }

    this.offerService.loadOfferAdress(this.offer.idOffer, this.projectTarget).then(adr=> {
      this.fullAdress = adr;
    });


    this.storage.get(config.currentUserVar).then((value) => {
      if (value) {
        let currentUser = JSON.parse(value);
        this.idTiers = this.projectTarget == 'employer' ? currentUser.employer.entreprises[0].id : currentUser.jobyer.id;
      }
    });

    /*this.offerService.getOfferVideo(this.offer.idOffer, table).then((data:any) =>{
     this.videoAvailable = false;
     if(data && data != null && data.video && data.video != "null"){
     this.videoAvailable = true;
     this.youtubeLink = data.video;
     }

     });*/
  }

  /**
   * @Description Converts a timeStamp to date string :
   * @param date : a timestamp date
   */
  toDateString(date: number) {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  /**
   * @Description Converts a timeStamp to date string
   * @param time : a timestamp date
   */
  toHourString(time: number) {
    let minutes = (time % 60) < 10 ? "0" + (time % 60).toString() : (time % 60).toString();
    let hours = Math.trunc(time / 60) < 10 ? "0" + Math.trunc(time / 60).toString() : Math.trunc(time / 60).toString();
    return hours + ":" + minutes;
  }

  /**
   * @Description : Launch search from current offer-list
   */
  launchSearch() {
    console.log(this.offer);
    if (!this.offer)
      return;
    let loading = this.loading.create({
      content: ` 
                <div>
                    <img src='assets/img/loading.gif' />
                </div>
                `,
      spinner: 'hide'
    });
    loading.present();
    let searchFields = {
      class: 'com.vitonjob.callouts.recherche.SearchQuery',
      job: this.offer.jobData.job,
      metier: '',
      lieu: '',
      nom: '',
      entreprise: '',
      date: '',
      table: this.projectTarget == 'jobyer' ? 'user_offre_entreprise' : 'user_offre_jobyer',
      idOffre: '0'
    };
    this.searchService.criteriaSearch(searchFields, this.projectTarget).then((data: any) => {
      console.log(data);
      this.searchService.persistLastSearch(data);
      loading.dismiss();
      this.nav.push(SearchResultsPage, {currentOffer: this.offer});
    });
  }

  showQuote() {
    /*let modal = Modal.create(OfferQuotePage, {currentOffer: this.offer});
     this.nav.present(modal);*/
    this.nav.push(OfferTempQuotePage, {idOffer: this.offer.idOffer});
  }

  /**
   * Show job card
   */
  showJobCard() {
    this.showJob = !(this.showJob);
    if (this.showJob) {
      this.jobIconName = 'remove';
      this.jobStyle = {
        backgroundImage: {'background-image': ""},
        fontColor: this.backGroundColor,
        buttonColor: this.backGroundColor,
        fontWeight: "normal"
      };
    }

    else {
      this.jobIconName = 'add';
      this.jobStyle = {
        backgroundImage: {'background-image': "url('assets/img/job.png')"},
        fontColor: "white",
        buttonColor: "white",//transparent
        fontWeight: "bolder"
      };
    }

  }

  /**
   * Show quality card
   */
  showQualityCard() {
    this.showQuality = !(this.showQuality);
    if (this.showQuality) {
      this.qualityIconName = 'remove';
      this.qualityStyle = {
        backgroundImage: {'background-image': ""},
        fontColor: this.backGroundColor,
        buttonColor: this.backGroundColor,
        fontWeight: "normal"
      };
    } else {
      this.qualityIconName = 'add';
      this.qualityStyle = {
        backgroundImage: {'background-image': "url('assets/img/quality.png')"},
        fontColor: "white",
        buttonColor: "white",//transparent
        fontWeight: "bolder"
      };
    }
  }

  /**
   * Show language card
   */
  showLanguageCard() {
    this.showLanguage = !(this.showLanguage);
    if (this.showLanguage) {
      this.languageIconName = 'remove';
      this.languageStyle = {
        backgroundImage: {'background-image': ""},
        fontColor: this.backGroundColor,
        buttonColor: this.backGroundColor,
        fontWeight: "normal"
      };
    } else {
      this.languageIconName = 'add';
      this.languageStyle = {
        backgroundImage: {'background-image': "url('assets/img/language.png')"},
        fontColor: "white",
        buttonColor: "white",
        fontWeight: "bolder"
      };
    }
  }

  /**
   * Show calendar card
   */
  showCalendarCard() {
    this.showCalendar = !(this.showCalendar);
    if (this.showCalendar) {
      this.calendarIconName = 'remove';
      this.calendarStyle = {
        backgroundImage: {'background-image': ""},
        fontColor: this.backGroundColor,
        buttonColor: this.backGroundColor,
        fontWeight: "normal"
      };
    }
    else {
      this.calendarIconName = 'add';
      this.calendarStyle = {
        backgroundImage: {'background-image': "url('assets/img/calendar.png')"},
        fontColor: "white",
        buttonColor: "white",
        fontWeight: "bolder"
      };
    }
  }

  /**
   * Create Job modal
   */
  showJobModal() {
    let originalJobData = this.copyJobDataObjectByValue(this.offer.jobData);

    this.offer.jobData.adress = {
      fullAdress: this.fullAdress,
      name: '',
      street: '',
      streetNumber: '',
      zipCode: '',
      city: '',
      country: ''
    };
    let modal = this.modal.create(ModalJobPage, {jobData: this.offer.jobData});
    modal.onDidDismiss((data: any) => {
      this.modified.isJob = data.validated;
      //this.steps.isCalendar = this.validated.isJob;
      //this.localOffer.set('jobData', JSON.stringify(data));
      if (this.modified.isJob) {
        this.offer.jobData = data;
        this.offer.title = this.offer.jobData.job + ' ' + ((this.offer.jobData.level != 'junior') ? 'Expérimenté' : 'Débutant');
        this.offerService.updateOfferJob(this.offer, this.projectTarget);
        if (this.offer.jobData.adress && this.offer.jobData.adress.zipCode && this.offer.jobData.adress.zipCode.length > 0) {
          this.fullAdress = data.adress.fullAdress;
          this.offerService.saveOfferAdress(this.offer, this.offer.jobData.adress, this.offer.jobData.adress.streetNumber, this.offer.jobData.adress.street,
            this.offer.jobData.adress.city, this.offer.jobData.adress.zipCode, this.offer.jobData.adress.name, this.offer.jobData.adress.country, this.idTiers, this.projectTarget);
        }
      } else {
        this.offer.jobData = this.copyJobDataObjectByValue(originalJobData);
      }
    });
    modal.present();
  }

  /**
   * Create Qualities modal
   */
  showQualityModal() {

    let modal = this.modal.create(ModalQualityPage, {qualities: this.offer.qualityData});
    modal.present();
    modal.onDidDismiss((data: any) => {
      //this.modified.isQuality = (data.length) ? data.length > 0 : false;
      //if (this.modified.isQuality){
      this.offer.qualityData = data;
      this.offerService.updateOfferQualities(this.offer, this.projectTarget);
      //}

    })
  }

  /**
   * Create Language modal
   */
  showLanguageModal() {

    let modal = this.modal.create(ModalLanguagePage, {languages: this.offer.languageData});
    modal.present();
    modal.onDidDismiss((data: any) => {
      //this.modified.isLanguage = (data.length) ? data.length > 0 : false;
      //if (this.modified.isLanguage){
      this.offer.languageData = data;
      this.offerService.updateOfferLanguages(this.offer, this.projectTarget);
      //}

    })
  }

  /**
   * Create Calendar modal
   */
  showCalendarModal() {
    let modal = this.modal.create(ModalCalendarPage, {slots: this.offer.calendarData});
    modal.present();
    modal.onDidDismiss((data: {slots: any, isObsolete: boolean}) => {
      // this.modified.isCalendar = (data.length) ? data.length > 0 : false;
      //if (this.modified.isCalendar){
      this.offer.calendarData = data.slots;
      this.offer.obsolete = data.isObsolete;
      this.offerService.updateOfferCalendar(this.offer, this.projectTarget);
      //}

    })
  }

  /**
   * @description Delete offer
   *
   */
  deleteOffer() {
    let confirm = this.alert.create({
      title: "Supprimer l'offre",
      message: "Êtes-vous sûr de vouloir supprimer cette offre ?",
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
            this.offerService.deleteOffer(this.offer, this.projectTarget);
            this.nav.setRoot(OfferListPage);
          }
        }
      ]
    });
    confirm.present();
  }

  /**
   * Copy current offer
   */
  copyOffer() {
    let confirm = this.alert.create({
      title: "Copie d'offre",
      message: "Voulez-vous ajouter une nouvelle offre à partir de celle-ci?",
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
            let loading = this.loading.create({
              content: ` 
								<div>
									<img src='assets/img/loading.gif' />
								</div>
								`,
              spinner: 'hide',
              duration: 10000
            });
            loading.present();
            let offer = this.offer;
            offer.title = this.offer.title + " (Copie)";
            offer.idOffer = "";
            this.offerService.setOfferInLocal(offer, this.projectTarget)
              .then(()=> {
                console.log('••• Adding offer : local storing success!');

                this.offerService.setOfferInRemote(offer, this.projectTarget)
                  .then((data: any) => {
                    console.log('••• Adding offer : remote storing success!');

                    loading.dismiss();
                    this.nav.setRoot(OfferListPage);
                  })
              });
          }
        }
      ]
    });
    confirm.present();
  }

  changePrivacy() {
    let statut = this.offer.visible ? 'Non' : 'Oui';
    this.offerService.updateOfferStatut(this.offer.idOffer, statut, this.projectTarget).then(()=> {
      console.log('offer status changed successfuly');
      this.offer.visible = (statut == 'Non' ? false : true);
      this.offerService.updateOfferInLocal(this.offer, this.projectTarget);
    });
  }

  /**
   * @author TEL
   * Popover menu for offer detail options
   * @param ev
   */
  showPopover(ev) {
    let popover = this.popover.create(PopoverOfferDetailPage, {
      visibility: this.offer.visible,
      autoSearch: this.offer.rechercheAutomatique
    });
    popover.present({
      ev: ev
    });

    popover.onDidDismiss((data: any) => {
      if (!data)
        return;
      switch (data.option) {
        case 1:
          // Launch copy function
          this.copyOffer();
          break;
        case 2:
          // Launch visibility option
          this.changePrivacy();
          break;
        case 3:
          // launch search option
          this.launchSearch();
          break;
        case 4:
          // launch search option
          this.autoSearchMode();
          break;
        case 5:
          // launch devise option
          this.showQuote();
          break;
        case 6:
          // launch delete option
          this.deleteOffer();
          break;
      }
    })

  }

  updateVideo(deleteLink) {
    this.isLinkValid = true;
    if (deleteLink) {
      this.youtubeLink = "";
    } else {
      if (this.youtubeLink == "" || (this.youtubeLink.indexOf("youtu.be") == -1 && this.youtubeLink.indexOf("www.youtube.com") == -1)) {
        this.youtubeLink = "";
        this.isLinkValid = false;
        return;
      }
      this.youtubeLink = this.youtubeLink.replace("youtu.be", "www.youtube.com/embed").replace("watch?v=", "embed/");
    }
    this.offerService.updateVideoLink(this.offer.idOffer, this.youtubeLink, this.projectTarget).then(()=> {
      if (deleteLink) {
        this.videoAvailable = false;
      } else {
        this.videoAvailable = true;
      }
      console.log('offer youtube link updated successfuly');
      this.offer.videolink = this.youtubeLink;
      this.offerService.updateOfferInLocal(this.offer, this.projectTarget);
    });
  }

  videoUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.youtubeLink);
  }

  autoSearchMode() {
    let mode = this.offer.rechercheAutomatique ? "Non" : "Oui";
    this.offerService.saveAutoSearchMode(this.projectTarget, this.offer.idOffer, mode).then((data: {status: string}) => {
      if (data && data.status == "success") {
        this.offer.rechercheAutomatique = !this.offer.rechercheAutomatique;
        this.offerService.updateOfferInLocal(this.offer, this.projectTarget);
        this.nav.pop();
      } else {
        this.globalService.showAlertValidation("Vit-On-Job", "Une erreur est survenue lors de la sauvegarde des données.");
      }
    });
  }

  copyJobDataObjectByValue(originalJobData) {
    let copyedJobData = {
      idJob: originalJobData.idJob,
      job: originalJobData.job,
      idSector: originalJobData.idSector,
      sector: originalJobData.sector,
      level: originalJobData.level,
      remuneration: originalJobData.remuneration,
      currency: originalJobData.currency,
      validated: originalJobData.validated
    };
    return copyedJobData;
  }
}
