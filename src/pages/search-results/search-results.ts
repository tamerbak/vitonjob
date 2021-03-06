import {NavController, Platform, AlertController, ModalController, NavParams, ToastController} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Component, OnInit, ViewChild} from "@angular/core";
import {SearchService} from "../../providers/search-service/search-service";
import {UserService} from "../../providers/user-service/user-service";
import {ContractPage} from "../contract/contract";
import {CivilityPage} from "../civility/civility";
import {PhonePage} from "../phone/phone";
import {isUndefined} from "../../../node_modules/ionic-angular/util/util";
import {OffersService} from "../../providers/offers-service/offers-service";
import {OfferAddPage} from "../offer-add/offer-add";
import {ModalOfferPropositionPage} from "../modal-offer-proposition/modal-offer-proposition";
import {SearchDetailsPage} from "../search-details/search-details";
import {Configs} from "../../configurations/configs";
import {ModalOffersPage} from "../modal-offers/modal-offers";
import {ProfileService} from "../../providers/profile-service/profile-service";
import {NotificationContractPage} from "../notification-contract/notification-contract";
import {LoginsPage} from "../logins/logins";
import {GlobalService} from "../../providers/global-service/global-service";
import {Storage} from "@ionic/storage";
import {AdvertService} from "../../providers/advert-service/advert-service";
import {Utils} from "../../utils/utils";
import {GoogleAnalyticsService} from "../../providers/google-analytics-service/google-analytics-serivce";
import {Offer} from "../../dto/offer";
import {CalendarSlot} from "../../dto/calendar-slot";
import {DateUtils} from "../../utils/date-utils";

/**
 * @author jakjoud abdeslam
 * @description search results view
 * @module Search
 */
declare let google: any;
declare let sms;
declare let startApp;

@Component({
    templateUrl: 'search-results.html'
})
export class SearchResultsPage implements OnInit {

    @ViewChild('map') map;

    public searchResults: any;
    public listView: boolean = false;
    public cardView: boolean = false;
    public mapView: any;
    public platform: Platform;
    //public map: any;
    //public currentCardIndex: number = 0;
    public projectTarget: any;
    public avatar: string;
    public resultsCount: number = 0;
    public isUserAuthenticated: boolean;
    public employer: any;
    public isEmployer: boolean;

    //  Attributes for offer creation proposition
    public proposedJob: any;
    public proposedLanguages: any = [];
    public proposedQualities: any = [];
    public offerProposition: boolean = false;
    public offersService: any;
    public navParams: NavParams;

    public showingToast: boolean = false;


    public contratsAttente: any = [];
    public availability: string = "green";
    public backgroundImage: string;
    public themeColor: string;

    public iconName: string;
    public isMapView: boolean;

    public jobyerInterested: boolean;
    public jobyerInterestLabel: string;
    public currentUser: any;
    public configInversed:any;
    public currentUserVar:any;

    /**
     * @description While constructing the view we get the last results of the search from the user
     */
    constructor(public globalConfig: GlobalConfigs,
                public nav: NavController,
                navParams: NavParams,
                public searchService: SearchService,
                private userService: UserService,
                offersService: OffersService,
                platform: Platform,
                private profileService: ProfileService,
                public toast: ToastController,
                public modal: ModalController,
                public alert: AlertController,
                public globalService: GlobalService,
                private _gaService: GoogleAnalyticsService,
                public db: Storage, public advertService: AdvertService) {

        //  TrackScreen
        GoogleAnalyticsService.trackView("Résultats de la recherche");

        // Get target to determine configs
        this.projectTarget = globalConfig.getProjectTarget();
        this.configInversed = this.projectTarget != 'jobyer' ? Configs.setConfigs('jobyer') : Configs.setConfigs('employer');
        let config = Configs.setConfigs(this.projectTarget);
        this.backgroundImage = config.backgroundImage;
        this.themeColor = config.themeColor;
        this.avatar = this.projectTarget != 'jobyer' ? 'jobyer_avatar' : 'employer_avatar';
        this.platform = platform;
        this.isEmployer = this.projectTarget == 'employer';
        this.navParams = navParams;
        this.iconName = 'list';
        this.currentUserVar = config.currentUserVar;

        this.offersService = offersService;


        this.db.get('IS_MAP_VIEW').then((data: any) => {
            if (data) {
                data = JSON.parse(data);
            } else {
                data = {isMapView: true};
                this.db.set('IS_MAP_VIEW', JSON.stringify(data));
            }
            this.isMapView = data.isMapView;
            this.listView = !this.isMapView;
            this.mapView = (this.isMapView) ? 'block' : 'none';
        });


        //if redirected from another page
        let fromPage = this.navParams.data.fromPage;
        let index = this.navParams.data.searchIndex;
        let jobyer = this.navParams.data.jobyer;
        let obj = this.navParams.data.obj;
        let currentOffer = this.navParams.data.currentOffer;
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

    ngOnInit() {

        let mapEle = this.map.nativeElement;

        if (!mapEle) {
            console.error('Unable to initialize map, no map element with #map view reference.');
            return;
        }

        //get currentuser
        this.db.get(this.currentUserVar).then((value) => {
            if (value) {
                this.currentUser = JSON.parse(value);
            }
        });

        this.db.get('PENDING_CONTRACTS').then(contrats => {

            if (contrats) {
                this.contratsAttente = JSON.parse(contrats);
            } else {
                this.contratsAttente = [];
                this.db.set('PENDING_CONTRACTS', JSON.stringify(this.contratsAttente));
            }

            //  Retrieving last search
            this.searchService.retrieveLastSearch().then(results => {
                let jsonResults = JSON.parse(results);
                if (jsonResults) {
                    this.searchResults = [];
                    this.checkResultHealth(jsonResults).then((data: any) => {
                        this.searchResults = data;

                        this.resultsCount = this.searchResults.length;
                        if (this.resultsCount == 0) {
                            this.mapView = 'none';
                        } else if (this.isMapView) {
                            this.mapView = 'block';
                        } else {
                            this.mapView = 'none'
                        }

                        for (let i = 0; i < this.searchResults.length; i++) {
                            let r = this.searchResults[i];
                            r.jobyerInterested  = false;
                            r.jobyerInterestLabel = "Cette offre m'intéresse";
                            this.setInterestButtonLabel(r);
                            r.matching = Number(r.matching).toFixed(2);
                            r.rate = Number(r.rate).toFixed(2);
                            r.index = i + 1;
                            if (r.titre === 'M.') {
                                r.avatar = this.configInversed.avatars[0].url;
                            } else {
                                r.avatar = this.configInversed.avatars[1].url;
                            }

                        }
                        console.log(this.searchResults);

                        //  Determine constraints for proposed offer
                        this.createCriteria();
                        for (let j = 0; j < this.searchResults.length; j++) {
                            let r = this.searchResults[j];
                            r.checkedContract = false;
                            for (let i = 0; i < this.contratsAttente.length; i++) {
                                if (this.contratsAttente[i].idOffre == r.idOffre) {
                                    r.checkedContract = true;
                                    break;
                                }
                            }
                        }

                        //load profile pictures
                        for (let i = 0; i < this.searchResults.length; i++) {
                            let role = this.isEmployer ? "jobyer" : "employeur";
                            this.profileService.loadProfilePicture(null, this.searchResults[i].tel, role).then((data: any) => {
                                if (data && data.data && data.data.length>0 && !this.isEmpty(data.data[0].encode)) {
                                    this.searchResults[i].avatar = data.data[0].encode;
                                }
                            });
                        }
                    });
                } else {
                    this.mapView = 'none';
                }
                this.loadMap(mapEle);
            });
        });

        //pourquoi ce bloc?
        //get the currentEmployer
        this.userService.getCurrentUser(this.projectTarget).then(results => {

            if (results && !isUndefined(results)) {
                let currentEmployer = JSON.parse(results);
                if (currentEmployer) {
                    this.employer = currentEmployer;
                }
                console.log(currentEmployer);
            }

            /*this.searchService.retrieveLastSearch().then(results => {
                let jsonResults = JSON.parse(results);
                if (jsonResults) {
                    this.searchResults = [];
                    for (let i = 0; i < jsonResults.length; i++) {
                        let r = jsonResults[i];
                        let dirty = this.checkResultHealth(r);
                        if(!dirty){
                            this.searchResults.push(r);
                        }
                    }
                    this.resultsCount = this.searchResults.length;
                }
                this.loadMap(mapEle);
            })*/
        });

    }

    checkResultHealth(jsonResults: any[]){
        return new Promise(resolve => {
            let filteredResult = [];
            for (let i = 0; i < jsonResults.length; i++) {
                let result = jsonResults[i];
                if (isUndefined(result))
                    continue;

                if (this.isEmployer && (Utils.isEmpty(result.nom) || Utils.isEmpty(result.prenom) || result.idJobyer == 0))
                    continue;

                if (!this.isEmployer && (Utils.isEmpty(result.entreprise)))
                    continue;

                if(!this.isEmployer) {
                    this.offersService.getOfferMinCalendar(result.idOffre, this.projectTarget).then((slot: CalendarSlot) => {
                        let offerTemp = new Offer();
                        offerTemp.calendarData = [slot];
                        let obsolete = this.offersService.isOfferObsolete(offerTemp);
                        if (!obsolete) {
                            filteredResult.push(result);
                        }
                        if (i == jsonResults.length - 1) {
                            resolve(filteredResult);
                        }
                    });
                }else{
                    filteredResult.push(result);
                    if (i == jsonResults.length - 1) {
                        resolve(filteredResult);
                    }
                }
           }
        });
    }

    loadMap(mapElement) {

        let latLng = new google.maps.LatLng(48.855168, 2.344813);

        let mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        //let mapElement = document.getElementById("map");
        this.map = new google.maps.Map(mapElement, mapOptions);

        let addresses = [];
        let contentTable = [];
        let locatedResults = [];
        for (let i = 0; i < this.searchResults.length; i++) {
            let r = this.searchResults[i];
            if ((parseInt(r.latitude) == 0 && parseInt(r.longitude) == 0)
                || r.latitude == null
                || r.longitude == null
                || isUndefined(r.latitude)
                || isUndefined(r.longitude))
                continue;
            let latlng = new google.maps.LatLng(r.latitude, r.longitude);
            locatedResults.push(r);
            addresses.push(latlng);
            let matching: string = (r.matching.toString().indexOf('.') < 0) ? r.matching : r.matching.toString().split('.')[0];
            if (this.isEmployer) {
                contentTable.push("<h4>" + r.prenom + ' ' + this.substring(r.nom,0, 1) + ". <span style='background-color: #14baa6; color: white; font-size: small;border-radius: 25px;'>&nbsp;" + matching + "%&nbsp;</span></h4>" +
                    "<p>" + r.titreOffre + "</p>" +
                    "<p><span style='color: #29bb00; font-size: large;'>&#9679;</span> &nbsp; Disponible</p>" +
                    "<p style='text-decoration: underline;'>Détails</p> ");
            } else {
                contentTable.push("<h4>" + r.entreprise + " <span style='background-color: #14baa6; color: white; font-size: small;border-radius: 25px;'>&nbsp;" + matching + "%&nbsp;</span></h4>" +
                    "<p>" + r.titreOffre + "</p>" +
                    "<p><span style='color: #29bb00; font-size: large;'>&#9679;</span> &nbsp; Disponible</p>" +
                    "<p style='text-decoration: underline;'>Détails</p> ");
            }

        }
        let bounds = new google.maps.LatLngBounds();
        this.addMarkers(addresses, bounds, contentTable, locatedResults);

    }

    addMarkers(addresses: any, bounds: any, contentTable: any, locatedResults: any) {


        for (let i = 0; i < addresses.length; i++) {
            let marker = new google.maps.Marker({
                map: this.map,
                animation: google.maps.Animation.DROP,
                position: addresses[i]
            });
            bounds.extend(marker.position);
            this.addInfoWindow(marker, contentTable[i], locatedResults[i]);
        }

        this.map.fitBounds(bounds);

    }

    addInfoWindow(marker, content, r) {

        let infoWindow = new google.maps.InfoWindow({
            content: '<div id="myInfoWinDiv">' + content + '</div>'
        });

        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.open(this.map, marker);
            let nav = this.nav;
            google.maps.event.addDomListener(document.getElementById('myInfoWinDiv'), 'click', function () {
                nav.push(SearchDetailsPage, {searchResult: r});
            });
        }.bind(this));

    };


    /**
     * @description Selecting an item allows to call an action sheet for communications and contract
     * @param item the selected Employer/Jobyer
     */
    itemSelected(item) {
        let o = this.navParams.get('currentOffer');
        let rs = this.navParams.get('searchType');
        if(rs && rs == 'semantic'){
            this.searchService.retrieveLastIndexation().then((data:any)=>{
                let index = null;
                if(data){
                    index = JSON.parse(data);
                    if(index.resultsIndex && index.resultsIndex>0)
                        this.searchService.correctIndexation(index.resultsIndex, item.idJob).then(data=>{
                            index.resultsIndex = 0;
                            this.searchService.setLastIndexation(index);
                        });
                }
            });

        }
        this.nav.push(SearchDetailsPage, {searchResult: item, currentOffer: o});

    }

    /**
     * @description This function allows to select the candidate for a group recruitment
     * @param item the selected Employer/Jobyer
     */
    addGroupContract(item) {
        console.log(item);
    }

    /**
     * @description changing layout of results
     * @param mode
     */
    changeViewMode(mode) {

        if (mode == 1) {          //  List view
            this.listView = true;
            this.cardView = false;
            this.mapView = false;

            document.getElementById("map").style.height = '0px';
        } else if (mode == 2) {//  Cards view and toast
            let message;
            if (this.resultsCount <= 1) {
                message = this.resultsCount + ' offre';
            }
            else {
                message = this.resultsCount + ' offres';
            }
            let toast = this.toast.create({

                message: 'Vit-On-Job a trouvé ' + message,
                showCloseButton: true,
                closeButtonText: 'Ok',
                position: 'top'
            });
            toast.present();
            this.listView = false;
            this.cardView = true;
            this.mapView = false;
            document.getElementById("map").style.height = '0px';
        } else {                //  Map view
            this.listView = false;
            this.cardView = false;
            this.mapView = true;
            document.getElementById("map").style.height = '100%';
        }
    }

    recruiteFromMap(index) {

        let jobyer = this.searchResults[index];
        this.recruitJobyer(jobyer);
    }

    /**
     * @description verify informations of Employer/Jobyer and redirect to recruitement contract
     * @param item the selected Employer/Jobyer
     */
    recruitJobyer(jobyer) {

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

            if (isDataValid) {
                //navigate to contract page

                let o = this.navParams.get('currentOffer');
                if (o && !isUndefined(o)) {
                    this.nav.push(ContractPage, {jobyer: jobyer, currentOffer: o});
                } else {
                    this.nav.push(ContractPage, {jobyer: jobyer});
                }


            } else {
                //redirect employer to fill the missing informations
                let alert = this.alert.create({
                    title: 'Informations incomplètes',
                    subTitle: "Veuillez compléter votre profil avant d'établir votre premier contrat",
                    buttons: ['OK']
                });
                alert.onDidDismiss(() => {
                    this.nav.push(CivilityPage, {currentUser: this.employer});
                });
                alert.present();

            }
        }
        else {
            let alert = this.alert.create({
                title: 'Attention',
                message: 'Pour contacter ce jobyer, vous devez être connectés.',
                buttons: [
                    {
                        text: 'Annuler',
                        role: 'cancel',
                    },
                    {
                        text: 'Connexion',
                        handler: () => {
                            this.nav.push(LoginsPage);
                        }
                    }
                ]
            });
            alert.present();
        }

    }

    /**
     * @description Create a draggable widget to propose criteria for creating an offer from search results
     */
    createCriteria() {

        if (!this.searchResults || isUndefined(this.searchResults) || this.searchResults.length == 0)
            return;

        this.offerProposition = true;

        /*
         *  We will start by identifying the proposed job
         *  by using the first result and getting job details
         */
        let table = this.projectTarget == 'jobyer' ? 'user_offre_entreprise' : 'user_offre_jobyer';
        console.log(JSON.stringify(this.searchResults[0]));
        let idOffer = this.searchResults[0].idOffre;
        this.proposedJob = {
            id: 0,
            libellejob: '',
            idmetier: 0,
            libellemetier: 0
        };

        this.offersService.getOffersJob(idOffer, table).then((data: any) => {
            if (data && data.length > 0)
                this.proposedJob = data[0];
            else
                this.offerProposition = false;
        });

        //  To manage resources and calls we will group offers ids
        let listOffersId = [];
        for (let i = 0; i < this.searchResults.length; i++) {
            let o = this.searchResults[i];
            listOffersId.push(o.idOffre);

        }

        //  Now let us get the list of languages and qualities
        this.offersService.getOffersLanguages(listOffersId, table).then((data: any) => {
            this.proposedLanguages = data;
        });

        this.offersService.getOffersQualities(listOffersId, table).then((data: any) => {
            this.proposedQualities = data;
        });

        let toast = this.toast.create({
            message: 'Utiliser vos critères de recherches pour créer une nouvelle offre',
            showCloseButton: true,
            closeButtonText: 'Créer'
        });

        toast.onDidDismiss(() => {
            if (this.showingToast)
                this.toggleProposition();
            this.showingToast = false;
        });

        //this.nav.present(this.toast);
        this.showingToast = true;
    }

    /**
     * @description removes from the proposition list a specific language
     * @param language
     */
    deleteLanguage(language) {
        let index = this.proposedLanguages.indexOf(language);
        this.proposedLanguages.splice(index, 1);
        console.log(this.proposedLanguages);
    }

    /**
     * @description removes from the proposition list a specific quality
     * @param quality
     */
    deleteQuality(quality) {
        let index = this.proposedQualities.indexOf(quality);
        this.proposedQualities.splice(index, 1);
        console.log(this.proposedQualities);
    }

    /**
     * @description dial number of jobyer/employer
     */
    dialNumber(item) {
        console.log("dial number : " + item.tel);
        window.location.href = 'tel:' + item.tel;
    }

    /**
     * @description send sms to jobyer/employer
     */
    sendSMS(item) {
        this.isUserConnected();
        if (this.isUserAuthenticated) {
            console.log("sending SMS to : " + item.tel);
            let number = item.tel;
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

    toggleProposition() {

        let proposition = {
            proposedJob: this.proposedJob,
            proposedLanguages: this.proposedLanguages,
            proposedQualities: this.proposedQualities
        };

        let propositionModal = this.modal.create(ModalOfferPropositionPage, proposition);
        propositionModal.onDidDismiss(ret => {
            if (ret.status == true) {
                this.nav.push(OfferAddPage);
            }
        });
        propositionModal.present();
    }

    addToContracts(item) {

        item.checkedContract = true;

        this.contratsAttente.push(item);
        this.db.set('PENDING_CONTRACTS', JSON.stringify(this.contratsAttente));
    }


    selectContract(event, item) {
        item.checkedContract = event.checked;
        let o = this.navParams.get('currentOffer');
        /*let search = {
         title : "",
         result : this.result
         };*/
        if (item.checkedContract) {
            this.contratsAttente.push({jobyer: item, offer: o});
        } else {
            let index = this.contratsAttente.findIndex((elm) => {
                return (elm.jobyer.email === item.email) && (elm.jobyer.tel === item.tel);
            })
            this.contratsAttente.splice(index, 1);
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

    /**
     * @description connect to jobyer/employer via call
     * @param item
     */
    call(item) {
        this.isUserConnected();
        if (this.isUserAuthenticated)
            (<any>window).location = 'tel:' + item.tel;
    }

    /**
     * @description connect to jobyer/employer via sms
     * @param item
     */
    sendEmail(item) {
        this.isUserConnected();
        if (this.isUserAuthenticated)
            window.location.href = 'mailto:' + item.email;
    }

    /**
     * @description connect to jobyer/employer via skype
     * @param item
     */
    skype(item) {
        this.isUserConnected();
        if (this.isUserAuthenticated) {
            let sApp;
            if (this.platform.is('ios')) {
                sApp = startApp.set("skype://" + item.tel);
            } else {
                sApp = startApp.set({
                    "action": "ACTION_VIEW",
                    "uri": "skype:" + item.tel
                });
            }
            sApp.start(() => {
                console.log('starting skype');
            }, (error) => {
                this.globalService.showAlertValidation("Vit-On-Job", "Erreur lors du lancement de Skype. Vérifiez que l'application est bien installée.");
            });
        }
    }

    /**
     * @description connect to jobyer/employer via hangout
     * @param item
     */
    googleHangout(item) {
        this.isUserConnected();
        if (this.isUserAuthenticated) {
            let sApp = startApp.set({
                "action": "ACTION_VIEW",
                "uri": "gtalk:" + item.tel
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
    }

    changeView() {
        /*if (this.iconName === 'list') {
         this.listView = true;
         this.mapView = 'none';
         this.iconName = 'map';
         } else {
         this.listView = false;
         this.mapView = 'block';
         this.iconName = 'list';
         }*/
        //&& this.resultsCount >0
        //if (this.resultsCount == 0) return;
        let data = {isMapView: this.isMapView};
        this.db.set('IS_MAP_VIEW', JSON.stringify(data));
        this.listView = !this.isMapView;
        this.mapView = (this.isMapView) ? 'block' : 'none';
    }

    contract(index) {
        let itm = this.searchResults[index];
        let rs = this.navParams.get('searchType');
        if(rs && rs.type == 'semantic'){
            this.searchService.retrieveLastIndexation().then((data:any)=>{
                let sidx = null;
                if(data){
                    sidx = JSON.parse(data);
                    if(sidx.resultsIndex && sidx.resultsIndex>0)
                        this.searchService.correctIndexation(sidx.resultsIndex, itm.idJob).then(data=>{
                            sidx.resultsIndex = 0;
                            this.searchService.setLastIndexation(sidx);
                        });
                }
            });

        }
        if (this.isUserAuthenticated) {

            let currentEmployer = this.employer.employer;
            let userData = this.employer;
            console.log(currentEmployer);

            //verification of employer informations
            let redirectToCivility = (currentEmployer && currentEmployer.entreprises[0]) ?
            (userData.titre == "") ||
            (userData.prenom == "") ||
            (userData.nom == "") ||
            (currentEmployer.entreprises[0].nom == "") ||
            (currentEmployer.entreprises[0].siret == "") ||
            (currentEmployer.entreprises[0].naf == "") ||
            (currentEmployer.entreprises[0].siegeAdress.id == 0) ||
            (currentEmployer.entreprises[0].workAdress.id == 0) : true;

            let isDataValid = !redirectToCivility;

            let o = this.navParams.get('currentOffer');
            if (isDataValid) {
                //navigate to contract page
                if (o && !isUndefined(o)) {
                    this.nav.push(NotificationContractPage, {jobyer: this.searchResults[index], currentOffer: o});
                } else {
                    this.showAlertForOffers(index);
                    //this.nav.push(ContractPage, {jobyer: this.searchResults[index]});
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
                        jobyer: this.searchResults[index],
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
                message: 'Vous devez être connecté pour pouvoir procéder au recrutement de ce profil',
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
                                jobyer: this.searchResults[index], searchIndex: index
                            });
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

    showAlertForOffers(index) {
        //redirect employer to select or create an offer
        let employerOffers = this.employer.employer.entreprises[0].offers;
        let buttons = [{
            text: 'Nouvelle offre',
            handler: () => {
                this.nav.push(OfferAddPage, {
                    jobyer: this.searchResults[index],
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
                this.selectOffer(this.searchResults[index]).then(offer => {
                    if (offer) {
                        this.nav.push(NotificationContractPage, {
                            jobyer: this.searchResults[index],
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

    isEmpty(str) {
        if (str == '' || str == 'null' || !str)
            return true;
        else
            return false;
    }

    accepteCandidature(item) {
        if (this.isEmployer)
            return true;
        else if (item.accepteCandidature)
            return true;
        return false;
    }

    saveOfferInterest(item){
        let currentJobyerId = this.currentUser.jobyer.id;
        if(item.jobyerInterested){
            this.advertService.deleteOfferInterest(item.idOffre, currentJobyerId).then((data: any) => {
                if(data && data.status == 'success') {
                    item.jobyerInterestLabel = "Cette annonce m'intéresse";
                    item.jobyerInterested = false;
                }
            });
        }else{
            this.advertService.saveOfferInterest(item.idOffre, currentJobyerId).then((data: any) => {
                if(data && data.status == 'success'){
                    item.jobyerInterestLabel = "Cette annonce ne m'intéresse plus";
                    item.jobyerInterested = true;
                }
            });
        }
    }

    setInterestButtonLabel(item){
        if (!this.currentUser || !this.currentUser.jobyer) {
            return item;
        }
        return this.advertService.getInterestOffer(item.idOffre, this.currentUser.jobyer.id).then((data: any) => {
            
            if(data && data.data && data.data.length  > 0){
                item.jobyerInterested = true;
                item.jobyerInterestLabel = "Cette offre ne m'intéresse plus";
            }else{
                item.jobyerInterested = false;
                item.jobyerInterestLabel = "Cette offre m'intéresse";
            }
        });
    }

    formatNumbers (num):string {
        return Number(num).toFixed(2);
    }

    substring(text:string, start:number, number:number):string{
        if(Utils.isEmpty(text)){
            return "";
        }

        return text.substring(start, number);
    }
}
