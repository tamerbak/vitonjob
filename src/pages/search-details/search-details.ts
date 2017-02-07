import {Component, OnInit} from "@angular/core";
import {NavController, NavParams, AlertController, Platform, ModalController} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {isUndefined} from "../../../node_modules/ionic-angular/util/util";
import {CivilityPage} from "../civility/civility";
import {PhonePage} from "../phone/phone";
import {UserService} from "../../providers/user-service/user-service";
import {GlobalService} from "../../providers/global-service/global-service";
import {OffersService} from "../../providers/offers-service/offers-service";
import {AddressService} from "../../providers/address-service/address-service";
import {NotationService} from "../../providers/notation-service/notation-service";
import {Configs} from "../../configurations/configs";
import {ModalOffersPage} from "../modal-offers/modal-offers";
import {OfferAddPage} from "../offer-add/offer-add";
import {NotificationContractPage} from "../notification-contract/notification-contract";
import {Storage} from "@ionic/storage";
import {AccountReferencesService} from "../../providers/account-references-service/account-references-service";
import {ProfileService} from "../../providers/profile-service/profile-service";
import {InfoModalPage} from "../info-modal/info-modal";
import {AdvertService} from "../../providers/advert-service/advert-service";

declare let google: any;
declare let sms;
declare let startApp;

@Component({
  templateUrl: 'search-details.html',
  selector:'search-details'
})
export class SearchDetailsPage implements OnInit {
  public isEmployer: boolean = false;
  public fullTitle: string = '';
  public fullName: string = '';
  public matching: string = '';
  public telephone: string = '';
  public email: string = '';
  public projectTarget: any;
  public result: any;
  public userService: UserService;
  public isUserAuthenticated: boolean;
  public employer: any;
  public contratsAttente: any = [];

  public offersService: OffersService;
  public languages: any = [];
  public qualities: any = [];
  public map: any;
  public availability: any;
  public addressService: AddressService;
  public videoPresent: boolean = false;
  public videoLink: string;
  public starsText: string = '';
  public rating: any = 0;
  public platform: any;
  public isRecruteur: boolean = false;
  public avatar: string;
  public backgroundImage: string;
  public themeColor: string;
  public inversedThemeColor:string;
  public jobyerInterested: boolean;
  public jobyerInterestLabel: string;
  public currentUser: any;

  /*
   * References
   */
  public references : any = [];

  constructor(public nav: NavController,
              public params: NavParams,
              public globalConfig: GlobalConfigs,
              userService: UserService,
              private globalService: GlobalService,
              platform: Platform,
              offersService: OffersService,
              addressService: AddressService,
              private notationService: NotationService,
              public alert: AlertController,
              public modal: ModalController,
              public referenceService : AccountReferencesService,
              public profileService : ProfileService,
              public db: Storage, public advertService: AdvertService) {

    // Get target to determine configs
    this.projectTarget = globalConfig.getProjectTarget();
    let configInversed = (this.projectTarget === 'employer') ? Configs.setConfigs('jobyer') : Configs.setConfigs('employer');
    let config = Configs.setConfigs(this.projectTarget);
    this.themeColor = config.themeColor;
    this.inversedThemeColor = "#208EA3";
    this.backgroundImage = config.backgroundImage;
    //this.avatar = configInversed.avatars[0].url;
    this.isEmployer = this.projectTarget == 'employer';
    this.platform = platform;
    this.result = params.data.searchResult;

    let role = this.isEmployer ? "jobyer" : "employeur";
    this.profileService.loadAccountId(this.result.tel, role).then((id:any)=>{
      this.referenceService.loadReferences(id).then((results : any)=>{
        this.references = results;
      });
    });

    this.result.rate = Number(this.result.rate).toFixed(2);
    this.avatar = (this.result.avatar) ? this.result.avatar : configInversed.avatars[0].url;
    if (this.result.titreOffre)
      this.fullTitle = this.result.titreOffre;
    if (this.result.titreoffre)
      this.fullTitle = this.result.titreoffre;

    if (!this.isEmployer)
      this.fullName = this.result.entreprise;
    else
      this.fullName = this.result.titre + ' ' + this.result.prenom + ' ' + this.result.nom;
    this.email = this.result.email;
    this.telephone = this.result.tel;
    this.matching = this.result.matching + "%";

    this.availability = {
      duree: 0,
      code: 'vert'
    };

    //get the currentEmployer
    this.userService = userService;
    this.addressService = addressService;
    this.userService.getCurrentUser(this.projectTarget).then(results => {

      if (results && !isUndefined(results)) {

        let currentEmployer = JSON.parse(results);
        if (currentEmployer) {
          this.employer = currentEmployer;
          if (this.employer.estRecruteur)
            this.isRecruteur = this.employer.estRecruteur;
        }
        console.log(currentEmployer);
      }
    });

    //get currentuser
    this.db.get(config.currentUserVar).then((value) => {
      if (value) {
        this.currentUser = JSON.parse(value);
        if(!this.isEmployer){
          this.setInterestButtonLabel();
        }
      }
    });

    console.log(JSON.stringify(this.result));


    this.db.get('PENDING_CONTRACTS').then(contrats => {

      if (contrats) {
        this.contratsAttente = JSON.parse(contrats);
      } else {
        this.contratsAttente = [];
        this.db.set('PENDING_CONTRACTS', JSON.stringify(this.contratsAttente));
      }
    });

    this.offersService = offersService;
    let table = this.isEmployer ? 'user_offre_jobyer' : 'user_offre_entreprise';
    let idOffers = [];
    idOffers.push(this.result.idOffre);
    this.languages = [];
    this.qualities = [];
    this.offersService.getOffersLanguages(idOffers, table).then((data: any) => {
      if (data)
        this.languages = data;
    });
    this.offersService.getOffersQualities(idOffers, table).then((data: any) => {
      if (data)
        this.qualities = data;
    });
    this.offersService.getOfferVideo(this.result.idOffre, table).then((data: any) => {
      this.videoPresent = false;
      if (data && data != null && data.video && data.video != "null") {
        this.videoPresent = true;
        this.videoLink = data.video;
      }

    });

    //  Loading score
    let resultType = !this.isEmployer;
    //let id = this.result.idOffre;
    let id = (!this.isEmployer ? this.result.entrepriseId : this.result.idJobyer);
    this.notationService.loadSearchNotationByProfil(resultType, id).then(score => {

      this.rating = score;
      this.starsText = this.writeStars(this.rating);
    });

    //if redirected from another page
    let fromPage = this.params.data.fromPage;
    let index = this.params.data.searchIndex;
    let jobyer = this.params.data.jobyer ? this.params.data.jobyer : this.params.data.searchResult
    let obj = this.params.data.obj;
    let currentOffer = this.params.data.currentOffer;
    if (currentOffer && obj == "profileInompleted") {
      this.nav.push(NotificationContractPage, {
        jobyer: jobyer,
        currentOffer: currentOffer
      });
      return;
    }
    if ((fromPage == "phone" && index != -1) || (obj == "forRecruitment") || (!currentOffer && obj == "profileInompleted")) {
      this.selectOffer(jobyer).then(offer => {
        if (offer) {
          this.nav.push(NotificationContractPage, {
            jobyer: jobyer,
            currentOffer: offer
          });
          return;
        } else {
          return;
        }
      });
    }
  }

  ionViewWillEnter() {
    //get the connexion object and define if the there is a user connected
    this.userService.getConnexionObject().then(results => {
      if (results && !isUndefined(results)) {
        let connexion = JSON.parse(results);
        if (connexion && connexion.etat) {
          this.isUserAuthenticated = true;
        } else {
          this.isUserAuthenticated = false;
        }
        console.log(connexion);
      }
    });
  }

  writeStars(number: number): string {
    let starText = '';
    for (let i = 0; i < number; i++) {
      starText += '\u2605'
    }
    return starText;
  }

  ngOnInit() {
    //get the currentEmployer
    this.userService.getCurrentUser(this.projectTarget).then(results => {

      this.loadMap();

      if (results) {
        let user = JSON.parse(results);
        let addressOffer = this.result.address;
        let addressUser = '';
        if (this.isEmployer)
          addressUser = user.employer.entreprises[0].workAdress.fullAdress;
        else
          addressUser = user.jobyer.workAdress.fullAdress;

        this.addressService.getDistance(addressOffer, addressUser).then((data: any) => {
          this.availability = data;
        });
      }
    });

    if(this.projectTarget == 'jobyer' && this.currentUser) {
      this.setInterestButtonLabel();
    }
  }

  loadMap() {
    //call the google maps plugin inside a promise :
    this.userService.getConnexionObject().then(results => {
      let latLng = new google.maps.LatLng(48.855168, 2.344813);

      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      let mapElement = document.getElementById("map_canvas");
      this.map = new google.maps.Map(mapElement, mapOptions);

      let addresses = [];

      if ((this.result.latitude == "0" && this.result.longitude == "0") ||
          this.result.latitude  == null || isUndefined(this.result.latitude  == null) ||
          this.result.longitude  == null || isUndefined(this.result.longitude  == null))
        return;

      let latlng = new google.maps.LatLng(this.result.latitude, this.result.longitude);
      console.log(JSON.stringify(latlng));
      addresses.push(latlng);

      let bounds = new google.maps.LatLngBounds();
      this.addMarkers(addresses, bounds);
      this.map.setZoom(9);
    });
  }

  addMarkers(addresses: any, bounds: any) {

    for (let i = 0; i < addresses.length; i++) {
      let marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: addresses[i]
      });
      bounds.extend(marker.position);
    }

    this.map.fitBounds(bounds);
  }

  call() {
    this.isUserConnected();
    if (this.isUserAuthenticated)
      window.location.href = 'tel:' + this.telephone;
  }

  sendEmail() {
    this.isUserConnected();
    if (this.isUserAuthenticated)
      window.location.href = 'mailto:' + this.email;
  }

  sendSMS() {
    this.isUserConnected();
    if (this.isUserAuthenticated) {
      let number = this.telephone;
      let options = {
        replaceLineBreaks: false, // true to replace \n by a new line, false by default
        android: {
          intent: 'INTENT'  // send SMS with the native android SMS messaging
        }
      };
      let success = function () {
        console.log('Message sent successfully');
      };
      let error = function (e) {
        console.log('Message Failed:' + e);
      };

      sms.send(number, "", options, success, error);
    }
  }

  skype() {
    this.isUserConnected();
    if (this.isUserAuthenticated) {
      let sApp;
      if (this.platform.is('ios')) {
        sApp = startApp.set("skype://" + this.telephone);
      } else {
        sApp = startApp.set({
          "action": "ACTION_VIEW",
          "uri": "skype:" + this.telephone
        });
      }
      sApp.start(() => {
        console.log('starting skype');
      }, (error) => {
        this.globalService.showAlertValidation("Vit-On-Job", "Erreur lors du lancement de Skype. Vérifiez que l'application est bien installée.");
      });
    }
  }

  googleHangout() {
    let sApp = startApp.set({
      "action": "ACTION_VIEW",
      "uri": "gtalk:" + this.telephone
    });
    sApp.check((values) => { /* success */
      console.log("OK");
    }, (error) => { /* fail */
      this.globalService.showAlertValidation("Vit-On-Job", "Hangout n'est pas installé.");
    });
    sApp.start(() => {
      console.log('starting hangout');
    }, (error) => {
      this.globalService.showAlertValidation("Vit-On-Job", "Erreur lors du lancement de Hangout.");
    });
  }

  contract() {

    if (this.isUserAuthenticated) {

      let currentEmployer = this.employer.employer;
      console.log(currentEmployer);

      //verification of employer informations
      let redirectToCivility = (currentEmployer && currentEmployer.entreprises[0]) ?
      (currentEmployer.titre == "") ||
      (currentEmployer.prenom == "") ||
      (currentEmployer.nom == "") ||
      (currentEmployer.entreprises[0].name == "") ||
      (currentEmployer.entreprises[0].siret == "") ||
      (currentEmployer.entreprises[0].naf == "") ||
      (currentEmployer.entreprises[0].siegeAdress.id == 0) ||
      (currentEmployer.entreprises[0].workAdress.id == 0) : true;

      let isDataValid = !redirectToCivility;
      let o = this.params.get('currentOffer');

      if (isDataValid) {
        //navigate to contract page
        if (o && !isUndefined(o)) {
          this.nav.push(NotificationContractPage, {jobyer: this.result, currentOffer: o});
        } else {
          this.showAlertForOffers();
          //this.nav.push(ContractPage, {jobyer: this.result});
        }
      } else {
        //redirect employer to fill the missing informations
        let alert = this.alert.create({
          title: 'Informations incomplètes',
          subTitle: "Veuillez compléter votre profil avant d'établir votre premier contrat",
          buttons: ['OK']
        });
        alert.onDidDismiss(() => {
          this.nav.push(CivilityPage, {
            currentUser: this.employer,
            fromPage: "Search",
            jobyer: this.result,
            obj: "profileInompleted",
            currentOffer: o
          });
        });
        alert.present();

      }
    }
    else {
      let alert = this.alert.create({
        title: 'Attention',
        message: 'Pour contacter ce profil, vous devez être connecté.',
        buttons: [
          {
            text: 'Annuler',
            role: 'cancel',
          },
          {
            text: 'Connexion',
            handler: () => {
              this.nav.push(PhonePage, {
                fromPage: "Search",
                jobyer: this.result
              });
            }
          }
        ]
      });
      alert.present();
    }
  }

  close() {
    this.nav.pop();
  }

  selectContract(event) {
    this.result.checkedContract = event.checked;

    if (this.result.checkedContract) {
      /*let search = {
       title : "",
       result : this.result
       };*/
      this.contratsAttente.push(this.result);
    } else {

      this.contratsAttente.splice(this.contratsAttente.findIndex((element) => {
        return (element.email === this.result.email) && (element.tel === this.result.tel);
      }), 1);
    }
    this.db.set('PENDING_CONTRACTS', JSON.stringify(this.contratsAttente));

  }

  isUserConnected() {
    if (!this.isUserAuthenticated) {
      let alert = this.alert.create({
        title: 'Attention',
        message: 'Pour contacter ce profil, vous devez être connecté.',
        buttons: [
          {
            text: 'Annuler',
            role: 'cancel',
          },
          {
            text: 'Connexion',
            handler: () => {
              this.nav.push(PhonePage, {fromPage: "Search", searchIndex: -1});
            }
          }
        ]
      });
      alert.present();
    }
  }

  selectOffer(jobyer) {
    return new Promise(resolve => {
      let m = this.modal.create(ModalOffersPage, {fromPage: "Search", jobyer: jobyer});
      m.onDidDismiss((data: any) => {
        if (data)
        //return selected offer
          resolve(data);
      });
      m.present();
    });
  }

  showAlertForOffers() {
    //redirect employer to select or create an offer
    let employerOffers = this.employer.employer.entreprises[0].offers;
    let buttons = [{
      text: 'Nouvelle offre',
      handler: () => {
        this.nav.push(OfferAddPage, {
          jobyer: this.result,
          fromPage: "Search"
        });
      }
    },
      {
        text: 'Annuler',
        role: 'cancel',
      }];
    let listOfferButton = {
      text: 'Liste des offres',
      handler: () => {
        this.selectOffer(this.result).then(offer => {
          if (offer) {
            this.nav.push(NotificationContractPage, {
              jobyer: this.result,
              currentOffer: offer
            });
          } else {
            return;
          }
        });
      }
    }
    if (employerOffers && employerOffers.length > 0) {
      buttons.splice(0, 0, listOfferButton);
    }
    let alert = this.alert.create({
      title: 'Sélection de l\'offre',
      subTitle: (employerOffers && employerOffers.length > 0 ? "Veuillez sélectionner une offre existante, ou en créer une nouvelle pour pouvoir recruter ce jobyer" : "Veuillez créer une nouvelle offre pour pouvoir recruter ce jobyer"),
      buttons: buttons
    });
    alert.present();
  }

  showReferenceDetails(reference){
    let modal = this.modal.create(InfoModalPage, {reference : reference});
    modal.present();
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

  saveOfferInterest(){
    let currentJobyerId = this.currentUser.jobyer.id;
    if(this.jobyerInterested){
      this.advertService.deleteOfferInterest(this.result.idOffre, currentJobyerId).then((data: any) => {
        if(data && data.status == 'success') {
          this.jobyerInterestLabel = "Cette annonce m'intéresse";
          this.jobyerInterested = false;
        }
      });
    }else{
      this.advertService.saveOfferInterest(this.result.idOffre, currentJobyerId).then((data: any) => {
        if(data && data.status == 'success'){
          this.jobyerInterestLabel = "Cette annonce ne m'intéresse plus";
          this.jobyerInterested = true;
        }
      });
    }
  }

  /*setInterestButtonLabel(){
    let currentJobyerId = this.currentUser.jobyer.id;
    this.advertService.getInterestAnnonce(this.result.idOffre, currentJobyerId).then((data: any) => {
      if(data && data.data && data.data.length  == 1){
        this.jobyerInterested = true;
        this.jobyerInterestLabel = "Cette annonce ne m'intéresse plus";
      }else{
        this.jobyerInterested = false;
        this.jobyerInterestLabel = "Cette annonce m'intéresse";
      }
    });
  }*/


  setInterestButtonLabel(){
    if (!this.currentUser || !this.currentUser.jobyer) {
      return;
    }
    this.advertService.getInterestOffer(this.result.idOffre, this.currentUser.jobyer.id).then((data: any) => {
      if(data && data.data && data.data.length > 0){
        this.jobyerInterested = true;
        this.jobyerInterestLabel = "Cette offre ne m'intéresse plus";
      }else{
        this.jobyerInterested = false;
        this.jobyerInterestLabel = "Cette offre m'intéresse";
      }
    });
  }

  callRef(item:any) {
    window.location.href = 'tel:' + item.phone;
  }

  sendEmailRef(item:any) {
    window.location.href = 'mailto:' + item.email;
  }

}
