import {
  App,
  NavParams,
  NavController,
  LoadingController,
  ModalController,
  MenuController,
  Keyboard,
  PopoverController,
  ToastController,
  Slides,
  Events
} from "ionic-angular";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {SearchService} from "../../providers/search-service/search-service";
import {SearchResultsPage} from "../search-results/search-results";
import {SearchCriteriaPage} from "../search-criteria/search-criteria";
import {SearchGuidePage} from "../search-guide/search-guide";
import {NetworkService} from "../../providers/network-service/network-service";
import {PhonePage} from "../phone/phone";
import {Component, ViewChild, ElementRef, trigger, state, style, transition, animate} from "@angular/core";
import {PopoverSearchPage} from "../popover-search/popover-search";
import {OffersService} from "../../providers/offers-service/offers-service";
import {SearchDetailsPage} from "../search-details/search-details";
import {ProfileService} from "../../providers/profile-service/profile-service";
import {HomeService} from "../../providers/home-service/home-service";
import {ModalUpdatePassword} from "../modal-update-password/modal-update-password";
import {OfferAddPage} from "../offer-add/offer-add";
import {OfferListPage} from "../offer-list/offer-list";
import {Storage} from "@ionic/storage";
import {
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapsLatLng,
  CameraPosition,
  GoogleMapsMarkerOptions,
  GoogleMapsMarker
} from "ionic-native";

declare let SpeechRecognition;

@Component({
  selector: 'home',
  templateUrl: 'home.html',
  animations: [
    //For login button
    trigger('fadeIn', [
      state('in', style({
        opacity: 1
      })),
      transition('void => *', [
        style({opacity: 0}),
        animate('1000ms 2000ms ease-in')
      ])
    ])
  ]
})
export class HomePage {

  @ViewChild('mySlider')
  public _slider: Slides;

  public projectName: string;
  public themeColor: string;
  public isEmployer: boolean;
  public imageURL: string;
  public searchPlaceHolder: string;
  public projectTarget: string;
  public highlightSentence: string;
  public search: any;
  public selectedItem: any;
  public cnxBtnName: string;
  public scQuery: string;
  public popinCrietria: boolean = false;
  public isConnected: boolean;
  public recording: boolean;
  public recognition: any;
  public menu: any;
  public backgroundImage: string;
  public push: any;
  public currentUserVar: string;
  public currentUser: any;
  public publicOffers = [];
  public autoSearchOffers = [];
  public searchResults: any;
  public contratsAttente: any = [];
  public offerService: any;
  public profilService: any;
  public elementRef: ElementRef;

  /*
   *  HOME SCREEN LISTS
   */
  public recentOffers: any = [];
  public upcomingOffers: any = [];
  public recentUsers: any = [];
  public previousRecentOffers: any = [];
  public previousUpcomingOffers: any = [];
  public previousRecentUsers: any = [];
  public nextRecentOffers: any = [];
  public nextUpcomingOffers: any = [];
  public nextRecentUsers: any = [];
  public homeServiceData: any = [];
  public maxLines: number = 3;
  public slideOptions = {
    //loop : true,
    pager: false
  };
  public cards: Array<{id: number, title: string, icon: string, isShowed: boolean, isActive: boolean}> = [];
  public isHunter: boolean = false;
  public isHunterList: boolean = false;
  public globalConfig: any;
  public keyboard: any;
  public loading: any;
  public modal: any;
  public popover: any;
  public toast: any;
  public globalOfferList: any;
  public profilPictureVar: any;


  /*static get parameters() {
   return [[GlobalConfigs], [App], [NavController], [NavParams], [SearchService],
   [NetworkService], [Events], [Keyboard], [MenuController], [OffersService], [ProfileService], [HomeService]];
   }*/

  constructor(public _globalConfig: GlobalConfigs,
              private app: App,
              private nav: NavController,
              private navParams: NavParams,
              private searchService: SearchService,
              public networkService: NetworkService,
              public events: Events, private kb: Keyboard, menu: MenuController,
              private offersService: OffersService,
              private profileService: ProfileService,
              private homeService: HomeService,
              private _elementRef: ElementRef,
              private _modal: ModalController,
              private _popover: PopoverController,
              private _toast: ToastController,
              private _loading: LoadingController, public storage: Storage) {
    // Get target to determine configs
    this.projectTarget = _globalConfig.getProjectTarget();
    this.loading = _loading;
    this.modal = _modal;
    this.popover = _popover;
    this.toast = _toast;
    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);
    this.storage.get(config.currentUserVar).then((value) => {
      if (value) {
        let currentUser = JSON.parse(value);
        this.isHunter = _globalConfig.getHunterMask() || currentUser.hunterFlag;
      }
    });

    this.keyboard = kb;
    // page push
    this.push = SearchCriteriaPage;
    this.globalConfig = _globalConfig;

    //menu.enable(true, 'rightOnMenu');

    //Initialize controller variables :
    this.projectName = config.projectName;
    this.themeColor = config.themeColor;
    this.imageURL = config.imageURL;
    this.backgroundImage = config.backgroundImage;
    this.highlightSentence = (this.isHunter) ? "Vous êtes sur le point de concrétiser l'opportunité que vous avez capturée" : config.highlightSentence;
    this.currentUserVar = config.currentUserVar;
    this.isEmployer = this.projectTarget === 'employer';
    this.searchPlaceHolder = "Veuillez saisir votre recherche...";
    this.recording = false;
    this.nav = nav;
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');
    // this.currentUser = navParams.get('currentUser');

    this.search = searchService;
    this.offerService = offersService;
    this.profilService = profileService;

    let card = {id: 0, title: "Alertes enregistrées", icon: "alert", isShowed: false, isActive: false};
    this.cards.push(card);
    card = {id: 1, title: "Offres récemment créées", icon: "megaphone", isShowed: false, isActive: false};
    this.cards.push(card);
    card = {id: 2, title: "Offres imminentes", icon: "md-flame", isShowed: false, isActive: false};
    this.cards.push(card);
    card = {
      id: 3,
      title: this.projectTarget === 'employer' ? 'Nouveaux jobyers' : 'Nouvelles entreprises',
      icon: "md-contacts",
      isShowed: false,
      isActive: false
    };
    this.cards.push(card);

    this.homeService.loadHomeData(this.projectTarget).then((data: any) => {
      this.homeServiceData = data;
      this.initHomeList();
      // TEL 21092016 : Hunter offer management
      if (this.isHunter) {
        if (this.projectTarget === 'employer') {
          if (this.currentUser.employer &&
            this.currentUser.employer.entreprises[0] &&
            this.currentUser.employer.entreprises[0].offers.length > 0) {
            let hunterOffers: Array<any> = this.currentUser.employer.entreprises[0].offers.filter((o) => {
              return !(o.idHunter = 0);
            });
            this.isHunterList = (hunterOffers.length > 0);
          }
        } else {
          if (this.currentUser.jobyer && this.currentUser.jobyer.offers.length > 0) {
            let hunterOffers: Array<any> = this.currentUser.offers.offers.filter((o) => {
              return !(o.idHunter = 0);
            });
            this.isHunterList = (hunterOffers.length > 0);
          }
        }
      }
    });
  }

  /*/ Load map only after view is initialize
   ngAfterViewInit() {
   //debugger;
   this.loadMap();
   }*/

  loadMap() {
    // make sure to create following structure in your view.html file
    // <ion-content>
    //  <div #map id="map"></div>
    // </ion-content>

    // create a new map by passing HTMLElement
    let element: HTMLElement = document.getElementById('map');

    let map = new GoogleMap(element);

    // listen to MAP_READY event
    map.one(GoogleMapsEvent.MAP_READY).then(() => console.log('Map is ready!'));

    // create LatLng object
    let ionic: GoogleMapsLatLng = new GoogleMapsLatLng(43.0741904, -89.3809802);

    // create CameraPosition
    let position: CameraPosition = {
      target: ionic,
      zoom: 18,
      tilt: 30
    };

    // move the map's camera to position
    map.moveCamera(position);

    // create new marker
    let markerOptions: GoogleMapsMarkerOptions = {
      position: ionic,
      title: 'Ionic'
    };

    map.addMarker(markerOptions)
      .then((marker: GoogleMapsMarker) => {
        marker.showInfoWindow();
      });
  }

  initHomeList() {
    if (!this.homeServiceData || this.homeServiceData.length == 0)
      return;

    //  Let us start with recent offers

    let data: any = this.homeServiceData.recentOffers;
    let max = data.length > this.maxLines ? this.maxLines : data.length;
    for (let i = 0; i < max; i++) {
      this.recentOffers.push(data[i]);
    }

    this.cards[1].isShowed = this.recentOffers.length > 0;

    for (let i = this.maxLines; i < data.length; i++) {
      this.nextRecentOffers.push(data[i]);
    }

    //  Now we deal with upcoming offers

    data = this.homeServiceData.upcomingOffers;
    max = data.length > this.maxLines ? this.maxLines : data.length;
    for (let i = 0; i < max; i++) {
      this.upcomingOffers.push(data[i]);
    }

    this.cards[2].isShowed = this.upcomingOffers.length > 0;

    for (let i = this.maxLines; i < data.length; i++) {
      this.nextUpcomingOffers.push(data[i]);
    }

    //  Finally new users

    data = this.homeServiceData.users;
    max = data.length > this.maxLines ? this.maxLines : data.length;
    for (let i = 0; i < max; i++) {
      this.recentUsers.push(data[i]);
    }

    this.cards[3].isShowed = this.recentUsers.length > 0;

    for (let i = this.maxLines; i < data.length; i++) {
      this.nextRecentUsers.push(data[i]);
    }

    // load first card:
    // TEL: Loaded on request from floating menu
    //this.loadFirstCard();
  }

  searchOffer(o) {
    let jobTitle = o.jobTitle;
    let searchFields = {
      class: 'com.vitonjob.callouts.recherche.SearchQuery',
      job: jobTitle,
      metier: '',
      lieu: '',
      nom: '',
      entreprise: '',
      date: '',
      table: this.projectTarget == 'jobyer' ? 'user_offre_entreprise' : 'user_offre_jobyer',
      idOffre: '0'
    };

    let loading = this.loading.create({content:"Merci de patienter..."});
    loading.present();
    this.searchService.criteriaSearch(searchFields, this.projectTarget).then((data: Array<any>) => {
      console.log(data);
      loading.dismiss();
      for (let i = 0; i < data.length; i++) {
        let r = data[i];
        if (r.idOffre == o.idOffer) {
          this.nav.push(SearchDetailsPage, {searchResult: r});
          break;
        }
      }
    });
  }

  rollingCards() {

    let index = 0;
    for (index; index < this.cards.length; index++) {
      if (this.cards[index].isShowed) {
        if (this.cards[index].isActive) {
          this.cards[index].isActive = false;
          break;
        }
      }
    }
    index = index + 1;
    if (index === this.cards.length)
      index = 0;
    for (index; index <= this.cards.length; index++) {
      if (index === this.cards.length) {
        index = 0
      }
      if (this.cards[index].isShowed) {
        this.cards[index].isActive = true;
        break;
      }
      else
        continue;
    }

  }

  loadFirstCard() {
    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i].isShowed) {
        this.cards[i].isActive = true;
        break;
      }
    }
  }

  generalNext() {
    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i].isShowed && this.cards[i].isActive) {
        switch (i) {
          case 0 :
            return;
          case 1 : {
            this.nextOffers();
            break;
          }
          case 2 : {
            this.nextOffers();
            break;
          }
          case 3 : {
            this.nextUsers();
            break;
          }
        }

      }
    }
  }

  generalPrevious() {
    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i].isShowed && this.cards[i].isActive) {
        switch (i) {
          case 0 :
            return;
          case 1 : {
            this.previousOffers();
            break;
          }
          case 2 : {
            this.previousOffers();
            break;
          }
          case 3 : {
            this.previousUsers();
            break;
          }
        }

      }
    }
  }

  generalNextCondition() {
    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i].isShowed && this.cards[i].isActive) {
        switch (i) {
          case 0 :
            return false;
          case 1 :
            return !(this.nextRecentOffers.length === 0);
          case 2 :
            return !(this.nextUpcomingOffers.length === 0);
          case 3 :
            return !(this.nextRecentUsers.length === 0);
        }
      }
    }
  }

  generalPreviousCondition() {
    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i].isShowed && this.cards[i].isActive) {
        switch (i) {
          case 0 :
            return false;
          case 1 :
            return !(this.previousRecentOffers.length === 0);
          case 2 :
            return !(this.previousUpcomingOffers.length === 0);
          case 3 :
            return !(this.previousRecentUsers.length === 0);
        }
      }
    }
  }

  previousUsers() {
    this.nextRecentUsers = [];
    for (let i = 0; i < this.recentUsers.length; i++)
      this.nextRecentUsers.push(this.recentUsers[i]);

    this.recentUsers = [];
    for (let i = 0; i < this.previousRecentUsers.length; i++) {
      this.recentUsers.push(this.previousRecentUsers[i]);
    }

    this.previousRecentUsers = [];
    let offset = this.homeServiceData.query.startIndex - this.homeServiceData.query.resultCapacity;

    if (offset <= 0) {
      offset = 0;
      this.homeServiceData.query.startIndex = offset;
      return;
    }

    this.homeServiceData.query.startIndex = offset;
    this.homeService.loadMore(this.projectTarget, this.homeServiceData.query.startIndex, this.homeServiceData.query.startIndexOffers).then((data: {users: any}) => {
      let newData = data.users;
      let max = newData.length > this.maxLines ? this.maxLines : newData.length;
      for (let i = 0; i < max; i++) {
        this.previousRecentUsers.push(newData[i]);
      }
    });

  }

  nextUsers() {

    this.previousRecentUsers = [];
    for (let i = 0; i < this.recentUsers.length; i++)
      this.previousRecentUsers.push(this.recentUsers[i]);

    this.recentUsers = [];
    for (let i = 0; i < this.nextRecentUsers.length; i++) {
      this.recentUsers.push(this.nextRecentUsers[i]);
    }

    this.nextRecentUsers = [];
    let offset = this.homeServiceData.query.startIndex + this.homeServiceData.query.resultCapacity;
    this.homeServiceData.query.startIndex = offset;
    this.homeService.loadMore(this.projectTarget, this.homeServiceData.query.startIndex, this.homeServiceData.query.startIndexOffers).then((data: {users: any}) => {

      let newData = data.users;
      let max = newData.length > this.maxLines ? this.maxLines : newData.length;
      for (let i = 0; i < max; i++) {
        this.nextRecentUsers.push(newData[i]);
      }
    });

  }

  nextOffers() {

    this.previousRecentOffers = [];
    for (let i = 0; i < this.recentOffers.length; i++)
      this.previousRecentOffers.push(this.recentOffers[i]);

    this.recentOffers = [];
    for (let i = 0; i < this.nextRecentOffers.length; i++)
      this.recentOffers.push(this.nextRecentOffers[i]);

    this.previousUpcomingOffers = [];
    for (let i = 0; i < this.upcomingOffers.length; i++)
      this.previousUpcomingOffers.push(this.upcomingOffers[i]);

    this.upcomingOffers = [];
    for (let i = 0; i < this.nextUpcomingOffers.length; i++)
      this.upcomingOffers.push(this.nextUpcomingOffers[i]);

    this.nextRecentOffers = [];
    this.nextUpcomingOffers = [];
    let offset = this.homeServiceData.query.startIndexOffers + this.homeServiceData.query.resultCapacityOffers;
    this.homeServiceData.query.startIndexOffers = offset;
    this.homeService.loadMore(this.projectTarget, this.homeServiceData.query.startIndex, this.homeServiceData.query.startIndexOffers).then((data: {recentOffers: any, upcomingOffers: any}) => {
      let newData = data.recentOffers;
      let max = newData.length > this.maxLines ? this.maxLines : newData.length;
      for (let i = 0; i < max; i++) {
        this.nextRecentOffers.push(newData[i]);
      }
      newData = data.upcomingOffers;
      max = newData.length > this.maxLines ? this.maxLines : newData.length;
      for (let i = 0; i < max; i++) {
        this.nextUpcomingOffers.push(newData[i]);
      }
    });
  }

  previousOffers() {
    this.nextRecentOffers = [];
    for (let i = 0; i < this.recentOffers.length; i++)
      this.nextRecentOffers.push(this.recentOffers[i]);

    this.recentOffers = [];
    for (let i = 0; i < this.previousRecentOffers.length; i++)
      this.recentOffers.push(this.previousRecentOffers[i]);

    this.nextUpcomingOffers = [];
    for (let i = 0; i < this.upcomingOffers.length; i++)
      this.nextUpcomingOffers.push(this.upcomingOffers[i]);

    this.upcomingOffers = [];
    for (let i = 0; i < this.previousUpcomingOffers.length; i++)
      this.upcomingOffers.push(this.previousUpcomingOffers[i]);

    this.previousRecentOffers = [];
    this.previousUpcomingOffers = [];
    let offset = this.homeServiceData.query.startIndexOffers - this.homeServiceData.query.resultCapacityOffers;
    if (offset <= 0) {
      offset = 0;
      this.homeServiceData.query.startIndexOffers = offset;
      return;
    }

    this.homeServiceData.query.startIndexOffers = offset;
    this.homeService.loadMore(this.projectTarget, this.homeServiceData.query.startIndex, this.homeServiceData.query.startIndexOffers).then((data: {recentOffers: any, upcomingOffers: any}) => {
      let newData = data.recentOffers;
      let max = newData.length > this.maxLines ? this.maxLines : newData.length;
      for (let i = 0; i < max; i++) {
        this.previousRecentOffers.push(newData[i]);
      }
      newData = data.upcomingOffers;
      max = newData.length > this.maxLines ? this.maxLines : newData.length;
      for (let i = 0; i < max; i++) {
        this.previousUpcomingOffers.push(newData[i]);
      }
    });
  }

  ionViewWillEnter() {
    this.autoSearchOffers = [];
    this.publicOffers = [];
    //verify if the user is already connected
    this.storage.get(this.currentUserVar).then((value) => {
      var isConnected = false;
      if (!value || value == "null") {
        if (!this.currentUser || this.currentUser == "null") {
          isConnected = false;
        } else {
          isConnected = true;
        }
      } else {
        this.currentUser = JSON.parse(value);
        isConnected = true;
      }
      if (isConnected) {
        let data0 = this.currentUser;
        if (data0.mot_de_passe_reinitialise === "Oui") {
          this.showResetPasswordModal();
        }
        this.cnxBtnName = "Déconnexion";
        //debugger;
        this.isConnected = true;
        this.getOffers();
      } else {
        this.cnxBtnName = "Se connecter / S'inscrire";
        this.isConnected = false;
      }
    });
  }

  /**
   * @description Launching semantic search from voice recognition
   */
  launchVoiceRecognition() {

    this.recognition = new SpeechRecognition();
    this.recording = true;
    this.recognition.lang = 'fr';
    this.recognition.onresult = function (event) {

      this.recording = false;
      if (event.results.length > 0) {
        this.scQuery = event.results[0][0].transcript;
        this.doSemanticSearch();
      }
    }.bind(this);

    this.recognition.start();
  }

  stopRecognition() {

    this.recognition.stop();
    this.recording = false;
    this.recognition.onend = function (event) {
      this.recording = false;
    }.bind(this);
    this.recognition.onerror = function (event) {
      this.recording = false;
    }.bind(this);
    this.recognition.onnomatch = function (event) {
      this.recording = false;
    }.bind(this);
  }

  onFocus() {
    if (this.projectTarget == 'employer')
      this.searchPlaceHolder = "Ex : Je cherche un serveur";// débutant disponible demain sur Villepinte";
    else
      this.searchPlaceHolder = "Ex : Je suis un serveur";//Je cherche une offre d'emploi pour serveur débutant demain sur Villepinte";
  }

  onBlur() {
    this.searchPlaceHolder = "Veuillez saisir votre recherche...";
  }

  openLoginsPage() {
    if (this.isConnected) {
      this.storage.set(this.currentUserVar, null);
      this.cnxBtnName = "Se connecter / S'inscrire";
      this.isConnected = false;
      this.events.publish('user:logout');
    } else {
      //this.nav.push(LoginsPage);
      this.nav.push(PhonePage);
    }
  }

  /**
   * @author abdeslam jakjoud
   * @description perform semantic search and pushes the results view
   */
  doSemanticSearch() {
    if (this.scQuery == "" || this.scQuery == " " || !this.scQuery) {
      this.presentToast("Veuillez saisir un job à rechercher avant de lancer la recherche", 5);
      return;
    }
    let loading = this.loading.create({content:"Merci de patienter..."});
    loading.present();
    console.log('Initiating search for ' + this.scQuery);
    this.searchService.semanticSearch(this.scQuery, 0, this.projectTarget).then((results: any) => {
      let data = [];
      if(this.projectTarget == 'jobyer')
        data = results.offerEnterprise;
      else
        data = results.offerJobyers;

      this.searchService.setLastIndexation({resultsIndex : results.indexation});
      this.searchService.persistLastSearch(data);
      loading.dismiss();
      this.nav.push(SearchResultsPage,{searchType:'semantic'});
    });
  }

  /**
   * @author abdeslam jakjoud
   * @description checking whether the user used the enter button to startup the semantic search
   * @param e Key Up javascript event allowing us to access the keyboard used key
   */
  checkForEnterKey(e) {
    if (e.code != "Enter")
      return;

    this.doSemanticSearch();
  }

  /**
   * @description this method allows to render the multicriteria modal component
   */
  showCriteriaModal() {
    this.nav.push(SearchCriteriaPage);
  }

  /**
   * @description this method allows to render the guided search modal component
   */
  showGuideModal() {
    let dismissedModal = function () {
      this.popinCrietria = false;
    };

    if (this.popinCrietria)
      return;
    let m = this.modal.create(SearchGuidePage);
    m.onDidDismiss(dismissedModal.bind(this));
    this.popinCrietria = true;
    m.present();
  }

  /**
   * @author TEL
   * Popover menu for search options
   * @param ev
   */
  showSearchPopover(ev) {
    let popover = this.popover.create(PopoverSearchPage);
    popover.present({
      ev: ev
    })

  }

  showAdvencedSearch(ev) {
    let advanced = this.popover.create(PopoverSearchPage);
    advanced.present({
      ev: ev
    })

  }

  presentToast(message: string, duration?: number, position?: string) {
    if (!duration)
      duration = 3;
    let toast = this.toast.create({
      message: message,
      position: position,
      dismissOnPageChange: true,
      showCloseButton: true,
      closeButtonText: "Ok",
      duration: duration * 1000
    });
    toast.present();
  }

  getOffers() {
    let offers = this.isEmployer ? this.currentUser.employer.entreprises[0].offers : this.currentUser.jobyer.offers;
    for (let i = 0; i < offers.length; i++) {
      let offer = offers[i];
      if (offer.visible && offer.rechercheAutomatique) {
        offer.arrowLabel = "arrow-dropright";
        offer.isResultHidden = true;
        offer.correspondantsCount = -1;
        this.autoSearchOffers.push(offer);
        continue;
      }
      /*if(offer.visible && !offer.rechercheAutomatique){
       offer.correspondantsCount = -1;
       this.publicOffers.push(offer);
       }*/
    }

    this.cards[0].isShowed = this.autoSearchOffers.length > 0;

    for (let i = 0; i < this.autoSearchOffers.length; i++) {
      let offer = this.autoSearchOffers[i];
      let searchFields = {
        class: 'com.vitonjob.callouts.recherche.SearchQuery',
        job: offer.jobData.job,
        metier: '',
        lieu: '',
        nom: '',
        entreprise: '',
        date: '',
        table: this.projectTarget == 'jobyer' ? 'user_offre_entreprise' : 'user_offre_jobyer',
        idOffre: '0'
      };
      this.searchService.criteriaSearch(searchFields, this.projectTarget).then((data: Array<any>) => {
        offer.correspondantsCount = data.length;
        this.globalOfferList[0].list.sort((a, b) => {
          return b.correspondantsCount - a.correspondantsCount;
        })
      });
    }
  }

  launchSearch(offer, noRedirect) {
    if (!offer)
      return;
    if (noRedirect) {
      //switch the accordion arrow icon
      if (offer.arrowLabel == "arrow-dropdown") {
        offer.arrowLabel = "arrow-dropright";
        offer.isResultHidden = true;
        return;
      } else {
        for (let i = 0; i < this.autoSearchOffers.length; i++) {
          let offerTemp = this.autoSearchOffers[i];
          offerTemp.arrowLabel = "arrow-dropright";
          offerTemp.isResultHidden = true;
        }
        offer.arrowLabel = "arrow-dropdown";
      }
    }
    let loading = this.loading.create({content:"Merci de patienter..."});
    loading.present();
    let searchFields = {
      class: 'com.vitonjob.callouts.recherche.SearchQuery',
      job: offer.jobData.job,
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
      if (!noRedirect) {
        loading.dismiss();
        this.nav.push(SearchResultsPage, {currentOffer: offer});
      } else {
        this.showResult(offer);
        offer.isResultHidden = false;
        loading.dismiss();
      }
    });
  }

  showResult(offer) {
    //get search results for this offer
    let configInversed = this.projectTarget != 'jobyer' ? Configs.setConfigs('jobyer') : Configs.setConfigs('employer');
    this.searchService.retrieveLastSearch().then(results => {
      let jsonResults = JSON.parse(results);
      if (jsonResults) {
        this.searchResults = jsonResults;
        for (let i = 0; i < this.searchResults.length; i++) {
          let r = this.searchResults[i];
          r.matching = Number(r.matching).toFixed(2);
          r.index = i + 1;
          if (r.titre === 'M.') {
            r.avatar = configInversed.avatars[0].url;
          } else {
            r.avatar = configInversed.avatars[1].url;
          }

          let role = this.isEmployer ? "jobyer" : "employeur";
          this.profilService.loadProfilePicture(null, r.tel, role).then((data: any) => {
            if (data && data.data && !this.isEmpty(data.data[0].encode)) {
              r.avatar = data.data[0].encode;
            }
          });
        }
        console.log(this.searchResults);
      }
    });
  }


  showResetPasswordModal() {
    let m = this.modal.create(ModalUpdatePassword, {enableBackdropDismiss: false, showBackdrop: false});
    m.present();
  }

  itemSelected(item, offer) {
    this.nav.push(SearchDetailsPage, {searchResult: item, currentOffer: offer});
  }

  isEmpty(str) {
    if (str == '' || str == 'null' || !str)
      return true;
    else
      return false;
  }

  gotoAddOffer() {
    this.nav.push(OfferAddPage);
  }

  gotoOfferList() {
    this.nav.push(OfferListPage);
  }

  hunterValidation() {
    this.homeService.validateHunterOperation(this.currentUser.id).then((result: {status: string}) => {
      if (result && result.status === "success") {
        let toast = this.toast.create({
          message: 'Votre opération est traitée avec succès, merci de votre collaboration.',
          duration: 5000
        });
        toast.present();
        this.globalConfig.setHunterMask(false);
        this.logOut();
      }
    })
  }

  logOut() {
    this.storage.set('connexion', null);
    this.storage.set(this.currentUserVar, null);
    this.storage.set(this.profilPictureVar, null);
    this.storage.set("RECRUITER_LIST", null);
    this.storage.set('OPTION_MISSION', null);
    this.storage.set('PROFIL_PICTURE', null);
    this.events.publish('user:logout');
    this.nav.setRoot(HomePage);
  }

  simplifyDate(time) {
    let d = new Date(time);
    let str = d.getDate() + "/";
    str = str + (d.getMonth() + 1) + "/";
    str = str + d.getFullYear();
    return str;
  }

  pressEvent(e) {
    this.presentToast("Ce menu donne accès aux différentes nouvelles concernant les offres et les nouveaux inscrits!", 5, 'middle')
  }

  showCorrespondantCard(i: number) {
    // activated card mustn't be shown
    this.disapearCurrentCard();
    // activating the new card:
    this.cards[i].isActive = true;
  }

  disapearCurrentCard() {
    // activated card mustn't be shown
    let activeCards: any = this.cards.filter(elem => {
      return elem.isActive;
    });
    if (activeCards.length > 0)
      activeCards[0].isActive = false;
  }

}
