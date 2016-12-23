import {NavController, ToastController, LoadingController, AlertController} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {SearchService} from "../../providers/search-service/search-service";
import {Configs} from "../../configurations/configs";
import {OfferAddPage} from "../offer-add/offer-add";
import {OfferDetailPage} from "../offer-detail/offer-detail";
import {OffersService} from "../../providers/offers-service/offers-service";
import {Component} from "@angular/core";
import {GlobalService} from "../../providers/global-service/global-service";
import {SearchResultsPage} from "../search-results/search-results";
import {Storage} from "@ionic/storage";
import {isUndefined} from "ionic-angular/util/util";

/*
 Generated class for the OfferListPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  templateUrl: 'offer-list.html',
  selector: 'offer-list'
})
export class OfferListPage {

  public offerList: any;
  public offerService: OffersService;
  public projectTarget: string;
  public backgroundImage: any;
  public isNewUser = true;
  public globalOfferList = [];
  public showPublishedOffers = false;
  public showUnpublishedOffers = false;
  public showHunterOffers = false;
  public detailsIconName1: string = "add";
  public detailsIconName2: string = "add";
  public detailsIconName3: string = "add";
  public isHunter: boolean = false;
  public isEmployer: boolean;
  public phoneTitle: string;
  public themeColor: string;
  public listMode: boolean;
  public okButtonName: string;
  public mode: any;
  public backGroundColor:string;

  constructor(public nav: NavController,
              public gc: GlobalConfigs,
              public search: SearchService,
              public offersService: OffersService,
              public globalService: GlobalService,
              public searchService: SearchService,
              public loading: LoadingController,
              public toast: ToastController,
              public alert: AlertController,
              public db: Storage) {

    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);
    this.isHunter = gc.getHunterMask();

    // Set local variables and messages
    this.isEmployer = (this.projectTarget == 'employer');
    this.phoneTitle = "Téléphone";
    this.themeColor = config.themeColor;
    this.listMode = true;
    this.okButtonName = "add";
    this.backgroundImage = config.backgroundImage;
    this.backGroundColor = config.backGroundColor;
    //this.cancelButtonName = "";
    //this.loadPeople();

    // jQuery code for dragging components
    // console.log($( "#draggable" ).draggable());
    this.offerService = offersService;

    let currentUserVar = config.currentUserVar;
    this.db.get(currentUserVar).then(value => {
      if (value && value != "null") {
        let currentUser = JSON.parse(value);
        if (!currentUser.titre) {
          this.isNewUser = true;
        } else {
          this.isNewUser = false;
        }
      }
    });

  }

  ionViewWillEnter() {

    this.offerService.loadOfferList(this.projectTarget).then((data: any) => {
      // TEL26082016 ref : http://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
      this.globalOfferList.length = 0;
      this.globalOfferList.push({header: 'Mes offres en ligne', list: []});
      this.globalOfferList.push({header: 'Mes brouillons', list: []});
      this.globalOfferList.push({header: 'Mes opportunités capturées', list: []});
      this.offerList = data;
      //debugger;
      for (var i = 0; i < this.offerList.length; i++) {
        let offer = this.offerList[i];
        if (isUndefined(offer) || !offer || !offer.jobData) {
          continue;
        }
        if (offer.visible) {
          offer.color = 'black';//'darkgreen';
          offer.correspondantsCount = -1;
          //publishedList.push(offer);

          //verify if offer is obsolete
          for (var j = 0; j < offer.calendarData.length; j++) {
            let slotDate = offer.calendarData[j].date;
            let startH = this.offersService.convertToFormattedHour(offer.calendarData[j].startHour);
            slotDate = new Date(slotDate).setHours(Number(startH.split(':')[0]), Number(startH.split(':')[1]));
            let dateNow = new Date().getTime();
            if (slotDate <= dateNow) {
              offer.obsolete = true;
              break;
            } else {
              offer.obsolete = false;
            }
          }

          if (offer.idHunter && !(offer.idHunter === 0)) {
            //debugger;
            this.globalOfferList[2].list.push(offer);
          } else {
            //debugger;
            this.globalOfferList[0].list.push(offer);
          }

          let searchQuery = {
            class: 'com.vitonjob.recherche.model.SearchQuery',
            queryType: 'COUNT',
            idOffer: offer.idOffer,
            resultsType: this.projectTarget=='jobyer'?'employer':'jobyer'
          };
          this.searchService.advancedSearch(searchQuery).then((data:any)=>{
            offer.correspondantsCount = data.count;
            this.globalOfferList[0].list.sort((a, b) => {
              return b.correspondantsCount - a.correspondantsCount;
            })
          });


        } else {
          offer.color = 'grey';
          offer.correspondantsCount = -1;
          //unpublishedList.push (offer);
          this.globalOfferList[1].list.push(offer);
          /*this.offerService.getCorrespondingOffers(offer, this.projectTarget).then((data:any) => {
           console.log('getCorrespondingOffers result : ' + data);
           offer.correspondantsCount = data.length;
           // Sort offers corresponding to their search results :
           this.globalOfferList[1].list.sort((a, b) => {
           return b.correspondantsCount - a.correspondantsCount;
           })
           });*/
        }
      }
    });
  }

  // Testing a web service call
  /*loadPeople() {
   this.search.load()
   .then((data:any) => {
   this.people = data.results;
   });
   }*/

  onAddOffer() {
    this.listMode = (!this.listMode);
    if (this.mode)
      this.okButtonName = "add";
    else
      this.okButtonName = "checkmark-circle";
  }

  /**
   * @Description: Navigating to new offer page
   */
  goToNewOffer() {
    if (this.isNewUser) {
      this.presentToast("Veuillez remplir les informations de votre profil avant de créer une offre.", 5);
      return;
    } else {
      this.nav.push(OfferAddPage);
    }
  }

  /**
   * @Description: Navigating to detail offer page
   */
  goToDetailOffer(offer) {
    this.nav.push(OfferDetailPage, {selectedOffer: offer});
  }

  getOfferBadge(item) {

    if (isUndefined(item) || !item || !item.pricticesJob || item.pricticesJob.length == 0) {
      item.correspondantsCount = 0;
      return;
    }

    this.offersService.getBadgeCount(item.pricticesJob[0].pricticeJobId, this.projectTarget).then(count => {
      console.log(count);
      item.correspondantsCount = count;
    });
  }

  presentToast(message: string, duration: number) {
    let toast = this.toast.create({
      message: message,
      duration: duration * 1000
    });
    toast.present();
  }

  autoSearchMode(offer) {
    let mode = offer.rechercheAutomatique ? "Non" : "Oui";
    this.offerService.saveAutoSearchMode(this.projectTarget, offer.idOffer, mode).then((data: {status: string}) => {
      if (data && data.status == "success") {
        offer.rechercheAutomatique = !offer.rechercheAutomatique;
        this.offerService.updateOfferInLocal(offer, this.projectTarget);
        //this.nav.pop();
      } else {
        this.globalService.showAlertValidation("Vit-On-Job", "Une erreur est survenue lors de la sauvegarde des données.");
      }
    });
  }

  showOfferList(type) {

    if (type == 'Mes offres en ligne') {
      this.showPublishedOffers = !(this.showPublishedOffers);
      this.detailsIconName1 = (this.showPublishedOffers) ? 'remove' : 'add';

    } else if (type == 'Mes brouillons') {
      this.showUnpublishedOffers = !(this.showUnpublishedOffers);
      this.detailsIconName2 = (this.showUnpublishedOffers) ? 'remove' : 'add';
    } else if (type == 'Mes opportunités capturées') {
      this.showHunterOffers = !(this.showHunterOffers);
      this.detailsIconName3 = (this.showHunterOffers) ? 'remove' : 'add';
    }


  }

  /**
   * @Description : Launch search from current offer-list
   */
  launchSearch(offer) {
    console.log(offer);
    if (!offer)
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

  }
}
