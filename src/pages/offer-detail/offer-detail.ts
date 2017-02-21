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
import {EnvironmentService} from "../../providers/environment-service/environment-service";
//import {LoadListService} from "../../providers/load-list-service/load-list-service";
//import {Utils} from "../../utils/utils";
import {AdvertService} from "../../providers/advert-service/advert-service";
//import {AdvertDetailsPage} from "../advert-details/advert-details";
import {AdvertEditPage} from "../advert-edit/advert-edit";
import {AdvertJobyerListPage} from "../advert-jobyer-list/advert-jobyer-list";
import {Job} from "../../dto/job";
import {Offer} from "../../dto/offer";
import {Utils} from "../../utils/utils";
import {CalendarSlot} from "../../dto/calendar-slot";
import {Quality} from "../../dto/quality";
import {Language} from "../../dto/language";

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
  public offer: Offer;
  public videoAvailable: boolean = false;
  public youtubeLink: string = '';
  public isLinkValid = true;
  public fromPage: string;
  //public originalJobData: any;
  //public adressData: any;
  public fullAddress: any;
  public loading:any;
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
  public nbInterest: number = 0;

  //advert management
  public advert:any;
  public canModify: boolean = false;
  public isAdvertAttached:boolean = false;
  public isAdvertRequestLoaded:boolean = false;

  public isObsolete: boolean;

  constructor(public nav: NavController,
              public gc: GlobalConfigs,
              public params: NavParams,
              public offerService: OffersService,
              public searchService: SearchService,
              public _sanitizer: DomSanitizer,
              public globalService: GlobalService,
              public alert: AlertController,
              public _loading: LoadingController,
              public modal: ModalController,
              public popover: PopoverController,
              public environmentService:EnvironmentService,
              public storage:Storage,
              public advertService: AdvertService) {

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
    this.backGroundColor = config.backGroundColor;
    this.loading = _loading;

    // Get Offer passed in NavParams
    this.offer = params.get('selectedOffer');

    this.fromPage = params.get('fromPage');
    this.canModify = (params.get('modifyOffer') == false ? false : true);

    this.showJob = false;
    this.jobIconName = 'add';
    this.showQuality = false;
    this.qualityIconName = 'add';
    this.showLanguage = false;
    this.languageIconName = 'add';
    this.showCalendar = false;
    this.calendarIconName = 'add';
    this.environmentService.reload();
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

    /*if (!Utils.isEmpty(this.offer.qualityData)) {
      this.listService.loadList("qualite", this.offer.qualityData).then((data: any) => {
        this.offer.qualityData = data;
      });
    }*/

    this.languageStyle = {
      backgroundImage: {'background-image': "url('assets/img/language.png')"},
      fontColor: "white",
      buttonColor: "white",//transparent
      fontWeight: "bolder"
    };
    /*if (!Utils.isEmpty(this.offer.languageData)) {
      this.listService.loadList("langue", this.offer.languageData).then((data: any) => {
        this.offer.languageData = data;
      });
    }*/

    this.calendarStyle = {
      backgroundImage: {'background-image': "url('assets/img/calendar.png')"},
      fontColor: "white",
      buttonColor: "white",//transparent
      fontWeight: "bolder"
    };

    //let table = !this.isEmployer?'user_offre_jobyer':'user_offre_entreprise';

    /*this.offerService.loadOfferAdress(this.offer.idOffer, this.projectTarget).then(adr=> {
      this.fullAddress = adr;
    });*/


    /*this.storage.get(config.currentUserVar).then((value) => {
      if (value) {
        let currentUser = JSON.parse(value);
        this.idTiers = this.projectTarget == 'employer' ? currentUser.employer.entreprises[0].id : currentUser.jobyer.id;
      }
    });*/

    // this.advertService.getAdvertByIdOffer(this.offer.idOffer).then((res:any)=>{
    //   //debugger;
    //   if (res) {
    //     this.advert = res;
    //     this.isAdvertAttached = true;
    //   } else
    //     this.isAdvertAttached = false;
    //   this.isAdvertRequestLoaded = true;
    // });

    this.offerService.countInterestedJobyers(this.offer.idOffer).then((data: any) => {
      this.nbInterest = data.nbInterest;
    });

    /*this.offerService.getOfferVideo(this.offer.idOffer, table).then((data:any) =>{
     this.videoAvailable = false;
     if(data && data != null && data.video && data.video != "null"){
     this.videoAvailable = true;
     this.youtubeLink = data.video;
     }

     });*/
    this.isObsolete = this.offer.obsolete;
    this.offerService.getOffer(this.offer.idOffer, this.projectTarget).then((data: any) => {
      this.offer = data;
      this.offer.obsolete = this.isObsolete;
      this.setVideoLink();
    });
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
    let offer = this.offer;
    console.log(offer);
    if (!offer)
      return;
      let loading = this.loading.create({content:"Merci de patienter..."});
    loading.present();

    let searchQuery = {
      class: 'com.vitonjob.recherche.model.SearchQuery',
      queryType: 'OFFER',
      idOffer: offer.idOffer,
      resultsType: this.projectTarget=='jobyer'?'employer':'jobyer'
    };
    this.searchService.advancedSearch(searchQuery).then((data:any)=>{
      this.searchService.persistLastSearch(data);
      loading.dismiss();
      this.nav.push(SearchResultsPage, {currentOffer: offer});
    });

    /*console.log(this.offer);
    if (!this.offer)
      return;
    let loadingCtrl = this.loadingCtrl.create({
      content: ` 
                <div>
                    <img src='assets/img/loadingCtrl.gif' />
                </div>
                `,
      spinner: 'hide'
    });
    loadingCtrl.present();
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
      loadingCtrl.dismiss();
      this.nav.push(SearchResultsPage, {currentOffer: this.offer});
    });*/
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
    let jobData = JSON.parse(JSON.stringify(this.offer.jobData));
    let modal = this.modal.create(ModalJobPage, {jobData: jobData});
    modal.onDidDismiss((data: Job) => {
      if(Utils.isEmpty(data)){
        return;
      }
      //data.validated sert à vérifier si les données de la modale on été valide
      this.modified.isJob = data.validated;
      if (this.modified.isJob) {
        let offerTemp: Offer = JSON.parse(JSON.stringify(this.offer));
        offerTemp.jobData = data;
        offerTemp.title = data.job + ' ' + ((data.level != 'junior') ? 'Expérimenté' : 'Débutant');
        this.offerService.saveOffer(offerTemp, this.projectTarget).then((data: any) => {
          this.offer = data;
          this.offer.obsolete = this.isObsolete;
        });
      } else {
        return;
      }
    });
    modal.present();
  }

  /**
   * Create Calendar modal
   */
  showCalendarModal() {
    let slots: CalendarSlot = JSON.parse(JSON.stringify(this.offer.calendarData));

    let modal = this.modal.create(ModalCalendarPage, {slots: slots});
    modal.onDidDismiss((data: {slots: CalendarSlot[], isObsolete: boolean}) => {
      if(Utils.isEmpty(data)){
        return;
      }else{
        this.offer.calendarData = data.slots;
        this.offer.obsolete = data.isObsolete;
        this.offerService.saveOffer(this.offer, this.projectTarget).then((data: any) => {
          this.offer = data;
          this.isObsolete = this.offerService.isOfferObsolete(this.offer);
          this.offer.obsolete = this.isObsolete;
        });
      }
    });
    modal.present();
  }

  /**
   * Create Qualities modal
   */
  showQualityModal() {
    let qualities: Quality[] = JSON.parse(JSON.stringify(this.offer.qualityData));

    let modal = this.modal.create(ModalQualityPage, {qualities: qualities});
    modal.onDidDismiss((data: Quality[]) => {
      if(Utils.isEmpty(data)){
        return;
      }
      this.offer.qualityData = data;
      this.offerService.saveOffer(this.offer, this.projectTarget).then((data: any) => {
        this.offer = data;
        this.offer.obsolete = this.isObsolete;
      });
    });
    modal.present();
  }

  /**
   * Create Language modal
   */
  showLanguageModal() {
    let languages: Language[] = JSON.parse(JSON.stringify(this.offer.languageData));

    let modal = this.modal.create(ModalLanguagePage, {languages: languages});
    modal.onDidDismiss((data: Language[]) => {
      if(Utils.isEmpty(data)){
        return;
      }
      this.offer.languageData = data;
      this.offerService.saveOffer(this.offer, this.projectTarget).then((data: any) => {
        this.offer = data;
        this.offer.obsolete = this.isObsolete;
      });
    });
    modal.present();
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
            this.offerService.deleteOffer(this.offer, this.projectTarget).then((data: any) => {
              if(data && data.status == "success"){
                this.nav.setRoot(OfferListPage);
                this.globalService.showAlertValidation("Vit-On-Job", "L'offre " + this.offer.title + " a été bien supprimé.");
              }else{
              this.globalService.showAlertValidation("Vit-On-Job", "Une erreur est survenue lors de la sauvegarde des données.");
              }
            })
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
            let offer = JSON.parse(JSON.stringify(this.offer));
            offer.title = this.offer.title + " (Copie)";
            offer.idOffer = 0;
            this.offerService.saveOffer(offer, this.projectTarget).then((data: any) => {
                console.log('••• Adding offer : remote storing success!');
                this.nav.setRoot(OfferListPage);
            });
          }
        }
      ]
    });
    confirm.present();
  }

  changePrivacy() {
    let statut = this.offer.visible ? 'Non' : 'Oui';
    let loading = this.loading.create({content:"Merci de patienter..."});
    loading.present();
    this.offerService.updateOfferStatut(this.offer.idOffer, statut, this.projectTarget).then(()=> {
      loading.dismiss();
      console.log('offer status changed successfuly');
      this.offer.visible = (statut == 'Non' ? false : true);
      //this.offerService.updateOfferInLocal(this.offer, this.projectTarget);
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
    });
  }

  videoUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.youtubeLink);
  }

  autoSearchMode() {
    let mode = this.offer.rechercheAutomatique ? "Non" : "Oui";
    let loading = this.loading.create({content:"Merci de patienter..."});
    loading.present();
    this.offerService.saveAutoSearchMode(this.projectTarget, this.offer.idOffer, mode).then((data: {status: string}) => {
      loading.dismiss();
      if (data && data.status == "success") {
        this.offer.rechercheAutomatique = !this.offer.rechercheAutomatique;
        //this.offerService.updateOfferInLocal(this.offer, this.projectTarget);
        //this.nav.pop();
      } else {
        this.globalService.showAlertValidation("Vit-On-Job", "Une erreur est survenue lors de la sauvegarde des données.");
      }
    });
  }

  copyJobDataObjectByValue(originalJobData) {
    let copyedJobData = {
      idJob: originalJobData.idJob,
      job: originalJobData.job,
      idsector: originalJobData.idsector,
      sector: originalJobData.sector,
      level: originalJobData.level,
      remuneration: originalJobData.remuneration,
      currency: originalJobData.currency,
      validated: originalJobData.validated
    };
    return copyedJobData;
  }

  goToAdvertDetails() {
    let loading = this.loading.create({content: "Merci de patienter..."});
    loading.present(loading);
    this.advertService.getAdvertByIdOffer(this.offer.idOffer).then((res: any) => {
      //debugger;
      loading.dismiss();
      if (res) {
        this.advert = res;
        this.nav.push(AdvertEditPage, {fromPage: "offer-details", advert: this.advert});
      } else {
        this.nav.push(AdvertEditPage, {fromPage: "offer-details", idOffer: this.offer.idOffer});
      }
    });
  }

  gotoJobyerInterestList(){
    this.nav.push(AdvertJobyerListPage, {offer: this.offer});
  }

  setVideoLink(){
    if (!this.offer.videolink) {
      this.videoAvailable = false;
    } else {
      this.videoAvailable = true;
      this.youtubeLink = this.offer.videolink.replace("youtu.be", "www.youtube.com/embed").replace("watch?v=", "embed/");
    }
  }
}
