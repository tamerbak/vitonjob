import {Component, OnInit} from '@angular/core';
import {NavController, NavParams, Alert, Storage, SqlStorage, Platform, Modal} from 'ionic-angular';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {isUndefined} from "ionic-angular/util";
import {ContractPage} from "../contract/contract";
import {CivilityPage} from "../civility/civility";
import {PhonePage} from "../phone/phone";
import {UserService} from "../../providers/user-service/user-service";
import {GlobalService} from "../../providers/global.service";
import {OffersService} from "../../providers/offers-service/offers-service";
import {AddressService} from "../../providers/address-service/address-service";
import {NotationService} from "../../providers/notation-service/notation-service";
import {Configs} from "../../configurations/configs";
import {ModalOffersPage} from "../modal-offers/modal-offers";
import {OfferAddPage} from "../offer-add/offer-add";

declare var google:any;

@Component({
    templateUrl: 'build/pages/search-details/search-details.html',
    providers: [GlobalService, OffersService, AddressService, NotationService]
})
export class SearchDetailsPage implements OnInit {
    isEmployer:boolean = false;
    fullTitle:string = '';
    fullName:string = '';
    matching:string = '';
    telephone:string = '';
    email:string = '';
    projectTarget:any;
    result:any;
    userService:UserService;
    isUserAuthenticated:boolean;
    employer:any;
    contratsAttente:any = [];
    db:Storage;
    offersService:OffersService;
    languages:any[];
    qualities:any[];
    map:any;
    availability:any;
    addressService:AddressService;
    videoPresent:boolean = false;
    videoLink:string;
    starsText:string = '';
    rating:number = 0;
    platform:any;
    isRecruteur:boolean = false;
    avatar:string;
    backgroundImage:string;
    themeColor:string;

    constructor(public nav:NavController,
                public params:NavParams,
                public globalConfig:GlobalConfigs,
                userService:UserService,
                private globalService:GlobalService,
                platform:Platform,
                offersService:OffersService,
                addressService:AddressService,
                private notationService:NotationService) {

        // Get target to determine configs
        this.projectTarget = globalConfig.getProjectTarget();
        let configInversed = (this.projectTarget === 'employer') ? Configs.setConfigs('jobyer') : Configs.setConfigs('employer');
        let config = Configs.setConfigs(this.projectTarget);
        this.themeColor = config.themeColor;
        this.backgroundImage = config.backgroundImage;
        //this.avatar = configInversed.avatars[0].url;
        this.isEmployer = this.projectTarget == 'employer';
        this.platform = platform;
        this.result = params.data.searchResult;
        this.avatar = (this.result.avatar)? this.result.avatar : configInversed.avatars[0].url;
        if (this.result.titreOffre)
            this.fullTitle = this.result.titreOffre;
        if (this.result.titreoffre)
            this.fullTitle = this.fullTitle + this.result.titreoffre;

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
                //debugger;
                let currentEmployer = JSON.parse(results);
                if (currentEmployer) {
                    this.employer = currentEmployer;
                    if (this.employer.estRecruteur)
                        this.isRecruteur = this.employer.estRecruteur;
                }


                console.log(currentEmployer);
            }

        });

        console.log(JSON.stringify(this.result));

        this.db = new Storage(SqlStorage);
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
        this.offersService.getOffersLanguages(idOffers, table).then(data=> {
            if (data)
                this.languages = data;
        });
        this.offersService.getOffersQualities(idOffers, table).then(data=> {
            if (data)
                this.qualities = data;
        });
        this.offersService.getOfferVideo(this.result.idOffre, table).then(data=> {
            this.videoPresent = false;
            if (data && data != null && data.video && data.video != "null") {
                this.videoPresent = true;
                this.videoLink = data.video;
            }

        });

        //  Loading score
        let resultType = !this.isEmployer;
        let id = this.result.idOffre;
        this.notationService.loadSearchNotation(resultType, id).then(score=> {
            //debugger;
            this.rating = score;
            this.starsText = this.writeStars(this.rating);
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

    writeStars(number:number):string {
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

                this.addressService.getDistance(addressOffer, addressUser).then(data=> {
                    this.availability = data;
                });
            }
        });

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

            if (this.result.latitude == "0" && this.result.longitude == "0")
                return;

            let latlng = new google.maps.LatLng(this.result.latitude, this.result.longitude);
            console.log(JSON.stringify(latlng));
            addresses.push(latlng);

            let bounds = new google.maps.LatLngBounds();
            this.addMarkers(addresses, bounds);
            this.map.setZoom(9);
        });
    }

    addMarkers(addresses:any, bounds:any) {

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
            window.location = 'tel:' + this.telephone;
    }

    sendEmail() {
        this.isUserConnected();
        if (this.isUserAuthenticated)
            window.location = 'mailto:' + this.email;
    }

    sendSMS() {
        this.isUserConnected();
        if (this.isUserAuthenticated) {
            var number = this.telephone;
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

    skype() {
        this.isUserConnected();
        if (this.isUserAuthenticated) {
            var sApp;
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
                this.globalService.showAlertValidation("VitOnJob", "Erreur lors du lancement de Skype. Vérifiez que l'application est bien installée.");
            });
        }
    }

    googleHangout() {
        var sApp = startApp.set({
            "action": "ACTION_VIEW",
            "uri": "gtalk:" + this.telephone
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

            if (isDataValid) {
                let o = this.params.get('currentOffer');
                //navigate to contract page
                if (o && !isUndefined(o)) {
                    this.nav.push(ContractPage, {jobyer: this.result, currentOffer: o});
                } else {
                    //redirect employer to select or create an offer
                    let alert = Alert.create({
                        title: 'Séléction de l\'offre',
                        subTitle: "Veuillez sélectionner une offre existante, ou en créer une nouvelle pour pouvoir recruter ce jobyer",
                        buttons: [
                            {
                                text: 'Annuler',
                                role: 'cancel',
                            },
                            {
                                text: 'Liste des offres',
                                handler: () => {
                                    this.selectOffer().then(offer => {
                                        if (offer) {
                                            this.nav.push(ContractPage, {jobyer: this.result, currentOffer: offer});
                                        } else {
                                            return;
                                        }
                                    });
                                }
                            },
                            {
                                text: 'Nouvelle offre',
                                handler: () => {
                                    this.nav.push(OfferAddPage, {jobyer: this.result, fromPage: "Search"});
                                }
                            }
                        ]
                    });
                    this.nav.present(alert);
                    //this.nav.push(ContractPage, {jobyer: this.result});
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
            //debugger;
            this.contratsAttente.splice(this.contratsAttente.findIndex((element) => {
                return (element.email === this.result.email) && (element.tel === this.result.tel);
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
}
