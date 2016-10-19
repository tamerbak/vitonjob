import {NavController, ActionSheet, Platform, Slides, Alert, Modal, NavParams, Toast} from 'ionic-angular';
import {Storage, SqlStorage, LocalStorage} from 'ionic-angular';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {ViewChild, Component, OnInit} from '@angular/core'
import {SearchService} from "../../providers/search-service/search-service";
import {UserService} from "../../providers/user-service/user-service";
import {ContractPage} from '../contract/contract';
import {CivilityPage} from '../civility/civility';
import {PhonePage} from '../phone/phone';
import {isUndefined} from "ionic-angular/util";
import {OffersService} from "../../providers/offers-service/offers-service";
import {OfferAddPage} from "../offer-add/offer-add";
import {ModalOfferPropositionPage} from "../modal-offer-proposition/modal-offer-proposition";
import {SearchDetailsPage} from "../search-details/search-details";
import {Configs} from "../../configurations/configs";
import {ModalOffersPage} from "../modal-offers/modal-offers";
import {ProfileService} from "../../providers/profile-service/profile-service";
import {NotificationContractPage} from "../notification-contract/notification-contract";

/**
 * @author jakjoud abdeslam
 * @description search results view
 * @module Search
 */
declare var google:any;

@Component({
    templateUrl: 'build/pages/search-results/search-results.html',
    providers: [OffersService, ProfileService]
})
export class SearchResultsPage implements OnInit {

    searchResults:any;
    listView:boolean = false;
    cardView:boolean = false;
    mapView:string;
    platform:Platform;
    map:any;
    currentCardIndex:number = 0;
    projectTarget:any;
    avatar:string;
    resultsCount:number = 0;
    isUserAuthenticated:boolean;
    employer:any;
    isEmployer:boolean;

    //  Attributes for offer creation proposition
    proposedJob:any;
    proposedLanguages:any = [];
    proposedQualities:any = [];
    offerProposition:boolean = false;
    offersService:any;
    navParams:NavParams;

    toast:Toast;
    showingToast:boolean = false;

    db:Storage;
    contratsAttente:any = [];
    availability:string = "green";
    backgroundImage:string;
    themeColor:string;
    searchService:any;

    iconName:string;
    isMapView:boolean;

    /**
     * @description While constructing the view we get the last results of the search from the user
     * @param nav Navigation controller of the application
     * @param searchService the provider that allows us to get data from search service
     */
    constructor(public globalConfig:GlobalConfigs,
                public nav:NavController,
                navParams:NavParams,
                private searchService:SearchService,
                private userService:UserService,
                offersService:OffersService,
                platform:Platform,
                private profileService:ProfileService) {
        // Get target to determine configs
        this.projectTarget = globalConfig.getProjectTarget();
        let configInversed = this.projectTarget != 'jobyer' ? Configs.setConfigs('jobyer') : Configs.setConfigs('employer');
        let config = Configs.setConfigs(this.projectTarget);
        this.backgroundImage = config.backgroundImage;
        this.themeColor = config.themeColor;
        this.avatar = this.projectTarget != 'jobyer' ? 'jobyer_avatar' : 'employer_avatar';
        this.platform = platform;
        this.isEmployer = this.projectTarget == 'employer';
        this.navParams = navParams;
        this.searchService = searchService;
        this.iconName = 'list';

        this.offersService = offersService;

        this.db = new Storage(SqlStorage);

        this.db.get('IS_MAP_VIEW').then(data => {
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

        this.db.get('PENDING_CONTRACTS').then(contrats => {

            if (contrats) {
                this.contratsAttente = JSON.parse(contrats);
            } else {
                this.contratsAttente = [];
                this.db.set('PENDING_CONTRACTS', JSON.stringify(this.contratsAttente));
            }

            //  Retrieving last search
            searchService.retrieveLastSearch().then(results => {

                let jsonResults = JSON.parse(results);
                if (jsonResults) {
                    this.searchResults = jsonResults;
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
                        r.matching = Number(r.matching).toFixed(2);
                        r.index = i + 1;
                        if (r.titre === 'M.') {
                            r.avatar = configInversed.avatars[0].url;
                        } else {
                            r.avatar = configInversed.avatars[1].url;
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
                        var role = this.isEmployer ? "jobyer" : "employeur";
                        this.profileService.loadProfilePicture(null, this.searchResults[i].tel, role).then(data => {
                            if (data && data.data && !this.isEmpty(data.data[0].encode)) {
                                this.searchResults[i].avatar = data.data[0].encode;
                            }
                        });
                    }
                } else {
                    this.mapView = 'none';
                }
            });
        });
    }

    onPageWillEnter() {
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

        //get the currentEmployer
        this.userService.getCurrentUser(this.projectTarget).then(results => {

            if (results && !isUndefined(results)) {
                let currentEmployer = JSON.parse(results);
                if (currentEmployer) {
                    this.employer = currentEmployer;
                }
                console.log(currentEmployer);
            }

            this.searchService.retrieveLastSearch().then(results => {

                let jsonResults = JSON.parse(results);
                if (jsonResults) {
                    this.searchResults = jsonResults;
                    this.resultsCount = this.searchResults.length;
                }
                this.loadMap();
            })
        });

    }

    loadMap() {

        let latLng = new google.maps.LatLng(48.855168, 2.344813);

        let mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        let mapElement = document.getElementById("map");
        this.map = new google.maps.Map(mapElement, mapOptions);

        let addresses = [];
        let contentTable = [];
        let locatedResults = [];
        for (let i = 0; i < this.searchResults.length; i++) {
            let r = this.searchResults[i];
            if (parseInt(r.latitude) == 0 && parseInt(r.longitude) == 0)
                continue;
            let latlng = new google.maps.LatLng(r.latitude, r.longitude);
            locatedResults.push(r);
            addresses.push(latlng);
            let matching:string = (r.matching.toString().indexOf('.') < 0) ? r.matching : r.matching.toString().split('.')[0];
            if (this.isEmployer) {
                contentTable.push("<h4>" + r.prenom + ' ' + r.nom.substring(0, 1) + ". <span style='background-color: #14baa6; color: white; font-size: small;border-radius: 25px;'>&nbsp;" + matching + "%&nbsp;</span></h4>" +
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

    addMarkers(addresses:any, bounds:any, contentTable:any, locatedResults:any) {


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
            //this.itemSelected(r);
        }.bind(this));


        /*google.maps.event.addListener(infoWindow,'domready',function() {

         document.getElementById('myInfoWinDiv').click(function () {
         //Do your thing
         this.itemSelected(r);
         })
         });*/

    };


    /**
     * @description Selecting an item allows to call an action sheet for communications and contract
     * @param item the selected Employer/Jobyer
     */
    itemSelected(item) {
        let o = this.navParams.get('currentOffer');
        this.nav.push(SearchDetailsPage, {searchResult: item, currentOffer: o});
        /*let actionSheet = ActionSheet.create({
         title: 'Options',
         buttons: [
         {
         text: 'Envoyer SMS',
         icon: 'md-mail',
         handler: () => {
         this.sendSMS(item);
         }
         },{
         text: 'Appeler',
         icon: 'md-call',
         handler: () => {
         this.dialNumber(item);
         }
         },{
         text: 'Annuler',
         role: 'cancel',
         icon: 'md-close',
         handler: () => {

         }
         }
         ]
         });
         this.nav.present(actionSheet);*/

    }

    contract(item) {
        console.log('Contract');
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
            let toast = Toast.create({

                message: 'Vitonjob a trouvé ' + message,
                showCloseButton: true,
                closeButtonText: 'Ok',
                position: 'top'
            });
            this.nav.present(toast);
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


        //init local database

        let storage = new Storage(SqlStorage);

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
                let alert = Alert.create({
                    title: 'Informations incomplètes',
                    subTitle: "Veuillez compléter votre profil avant d'établir votre premier contrat",
                    buttons: ['OK']
                });
                alert.onDismiss(()=> {
                    this.nav.push(CivilityPage, {currentUser: this.employer});
                });
                this.nav.present(alert);

            }
        }
        else {
            let alert = Alert.create({
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
            this.nav.present(alert);
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

        this.offersService.getOffersJob(idOffer, table).then(data => {
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
        this.offersService.getOffersLanguages(listOffersId, table).then(data => {
            this.proposedLanguages = data;
        });

        this.offersService.getOffersQualities(listOffersId, table).then(data => {
            this.proposedQualities = data;
        });

        this.toast = Toast.create({
            message: 'Utiliser vos critères de recherches pour créer une nouvelle offre',
            showCloseButton: true,
            closeButtonText: 'Créer'
        });

        this.toast.onDismiss(() => {
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
        window.location = 'tel:' + item.tel;
    }

    /**
     * @description send sms to jobyer/employer
     */
    sendSMS(item) {
        this.isUserConnected();
        if (this.isUserAuthenticated) {
            console.log("sending SMS to : " + item.tel);
            var number = item.tel;
            var options = {
                replaceLineBreaks: false, // true to replace \n by a new line, false by default
                android: {
                    intent: 'INTENT'  // send SMS with the native android SMS messaging
                }
            };
            var success = function () {
                console.log('Message sent successfully');
            };
            var error = function (e) {
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

        let propositionModal = Modal.create(ModalOfferPropositionPage, proposition);
        propositionModal.onDismiss(ret => {
            if (ret.status == true) {
                this.nav.push(OfferAddPage);
            }
        });
        this.nav.present(propositionModal);
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

            this.contratsAttente.splice(this.contratsAttente.findIndex((element) => {
                return (element.jobyer.email === item.jobyer.email) && (element.jobyer.tel === item.jobyer.tel);
            }), 1);
        }
        this.db.set('PENDING_CONTRACTS', JSON.stringify(this.contratsAttente));
    }

    isUserConnected() {
        if (!this.isUserAuthenticated) {
            let alert = Alert.create({
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
                            this.nav.push(PhonePage, {fromPage: "Search"});
                        }
                    }
                ]
            });
            this.nav.present(alert);
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
            window.location = 'mailto:' + item.email;
    }

    /**
     * @description connect to jobyer/employer via skype
     * @param item
     */
    skype(item) {
        this.isUserConnected();
        if (this.isUserAuthenticated) {
            var sApp;
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
                this.globalService.showAlertValidation("VitOnJob", "Erreur lors du lancement de Skype. Vérifiez que l'application est bien installée.");
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
            var sApp = startApp.set({
                "action": "ACTION_VIEW",
                "uri": "gtalk:" + item.tel
            });
            sApp.check((values) => { /* success */
                console.log("OK");
            }, (error) => { /* fail */
                this.globalService.showAlertValidation("VitOnJob", "Hangout n'est pas installé.");
            });
            sApp.start(() => {
                console.log('starting hangout');
            }, (error) => {
                this.globalService.showAlertValidation("VitOnJob", "Erreur lors du lancement de Hangout.");
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

            if (isDataValid) {
                let o = this.navParams.get('currentOffer');
                //navigate to contract page
                if (o && !isUndefined(o)) {
                    this.nav.push(NotificationContractPage, {jobyer: this.searchResults[index], currentOffer: o});
                } else {
                    //redirect employer to select or create an offer
                    let alert = Alert.create({
                        title: 'Sélection de l\'offre',
                        subTitle: "Veuillez sélectionner une offre existante, ou en créer une nouvelle pour pouvoir recruter ce jobyer",
                        buttons: [
                            {
                                text: 'Liste des offres',
                                handler: () => {
                                    this.selectOffer().then(offer => {
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
                            },
                            {
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
                            }
                        ]
                    });
                    this.nav.present(alert);
                    //this.nav.push(ContractPage, {jobyer: this.searchResults[index]});
                }
            } else {
                //redirect employer to fill the missing informations
                let alert = Alert.create({
                    title: 'Informations incomplètes',
                    subTitle: "Veuillez compléter votre profil avant d'établir votre premier contrat",
                    buttons: ['OK']
                });
                alert.onDismiss(()=> {
                    this.nav.push(CivilityPage, {currentUser: this.employer});
                });
                this.nav.present(alert);

            }
        }
        else {
            let alert = Alert.create({
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
                            this.nav.push(PhonePage, {fromPage: "Search"});
                        }
                    }
                ]
            });
            this.nav.present(alert);
        }
    }

    selectOffer() {
        return new Promise(resolve => {
            let m = new Modal(ModalOffersPage);
            m.onDismiss(data => {
                //return selected offer
                resolve(data);
            });
            this.nav.present(m);
        });
    }

    isEmpty(str) {
        if (str == '' || str == 'null' || !str)
            return true;
        else
            return false;
    }
}