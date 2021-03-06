import {Component, ViewChild} from "@angular/core";
import {
    Platform,
    Nav,
    ModalController,
    ToastController,
    Events,
    MenuController,
    App,
    AlertController,
    LoadingController
} from "ionic-angular";
import {StatusBar, Splashscreen, Deeplinks, BackgroundMode} from "ionic-native";
import {HomePage} from "../pages/home/home";
import {OffersService} from "../providers/offers-service/offers-service";
import {NgZone} from "../../node_modules/@angular/core/src/zone/ng_zone";
import {ChangeDetectorRef} from "../../node_modules/@angular/core/src/change_detection/change_detector_ref";
import {NetworkService} from "../providers/network-service/network-service";
import {NotationService} from "../providers/notation-service/notation-service";
import {GlobalConfigs} from "../configurations/globalConfigs";
import {SearchGuidePage} from "../pages/search-guide/search-guide";
import {SearchCriteriaPage} from "../pages/search-criteria/search-criteria";
import {AboutPage} from "../pages/about/about";
import {SettingsPage} from "../pages/settings/settings";
import {AttachementsPage} from "../pages/attachements/attachements";
import {RecruiterListPage} from "../pages/recruiter-list/recruiter-list";
import {SearchAutoPage} from "../pages/search-auto/search-auto";
import {Storage} from "@ionic/storage";
import {Configs} from "../configurations/configs";
import {PhonePage} from "../pages/phone/phone";
import {OfferListPage} from "../pages/offer-list/offer-list";
import {MissionListPage} from "../pages/mission-list/mission-list";
import {ProfilePage} from "../pages/profile/profile";
import {PendingContractsPage} from "../pages/pending-contracts/pending-contracts";
import {ContractListPage} from "../pages/contract-list/contract-list"
import {Observable} from "rxjs/Rx";
import {IntroPage} from "../pages/intro/intro";
import {SqliteDBService} from "../providers/sqlite-db-service/sqlite-db-service";
import {OfferAddPage} from "../pages/offer-add/offer-add";
import {CivilityPage} from "../pages/civility/civility";
import {SporadicService} from "../providers/sporadic-service/sporadic-service";
import {MissionListJobyerPage} from "../pages/mission-list-jobyer/mission-list-jobyer";
import {ContractListJobyerPage} from "../pages/contract-list-jobyer/contract-list-jobyer";
//import {isUndefined} from "ionic-angular/util/util";

//declare let cordova;
declare let Connection;
declare let navigator;

@Component({
    templateUrl: 'app.html',
    selector: 'app'
})
export class Vitonjob {
    public rootPage: any = HomePage;
    @ViewChild(Nav) nav: Nav;
    public pages: Array<any>;
    public projectTarget: any;
    public isEmployer: boolean;
    public userImageURL: string;
    public themeColor: string;
    public config: any;
    public currentUserVar: string;
    public profilPictureVar: string;
    public loggedOutPages: any;
    public loggedInPages: any;
    public alert: any;
    public toast: any;
    public modal: any;
    public tokens: any;
    public bgMenuURL: any;
    public userName: any;
    public userMail: any;
    public menuBackgroundImage: any;
    public offerCount: any;
    public isCalculating: boolean;
    public userPhone: any;
    public backGroundColor: string;
    public userEnterprise: string;

    constructor(private platform: Platform,
                private menu: MenuController,
                private gc: GlobalConfigs,
                private notationService: NotationService,
                private networkService: NetworkService,
                private changeDetRef: ChangeDetectorRef,
                public events: Events,
                public offerService: OffersService,
                public sqliteDb: SqliteDBService,
                public sporadicService : SporadicService,
                private zone: NgZone,
                private _alert: AlertController,
                private _toast: ToastController,
                private _modal: ModalController,
                public storage: Storage,
                public app: App,
                public loading: LoadingController) {
        //this.app = app;
        this.platform = platform;
        this.menu = menu;
        this.alert = _alert;
        this.toast = _toast;
        this.modal = _modal;
        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        this.config = Configs.setConfigs(this.projectTarget);
        this.tokens = this.config.tokenInstabug;
        this.currentUserVar = this.config.currentUserVar;
        this.profilPictureVar = this.config.profilPictureVar;

        this.initializeApp(gc);

        this.pages = [
            {
                title: "Accueil",
                description: "Lancer une recherche - écouter le marché...",
                component: HomePage,
                icon: "home",
                isBadged: false
            }
        ];
        this.constituteDefaultMenu();
        this.loggedOutPages = [
            //{title: "Accueil", description: "Lancer une recherche - écouter le marché...", component: HomePage, icon: "home", isBadged: false},
            {
                title: "Se connecter",
                description: "Connexion/inscription",
                component: PhonePage,
                icon: "log-in",
                isBadged: false
            },
            {
                title: "A propos",
                description: "A propos de l'application Vit-On-Job",
                component: AboutPage,
                icon: "help-circle",
                isBadges: false
            }
        ];


        //this.rootPage = HomePage;//ContractWizardPage;//
        //this.getRootPage();
        this.bgMenuURL = this.config.bgMenuURL;
        this.userImageURL = this.config.userImageURL;
        this.userName = this.isEmployer ? 'Employeur' : 'Jobyer';
        this.userEnterprise = "";
        this.userMail = "";
        this.themeColor = this.config.themeColor;
        this.menuBackgroundImage = this.config.menuBackgroundImage;
        this.backGroundColor = this.config.backGroundColor;

        this.listenToLoginEvents();

        this.offerCount = 0;
        this.isCalculating = true;


    }

    getRootPage() {
        let noPublicOffer = true;
        this.storage.get(this.currentUserVar).then((value) => {
            if (value && value != "null") {
                let currentUser = JSON.parse(value);
                let offers = this.isEmployer ? currentUser.employer.entreprises[0].offers : currentUser.jobyer.offers;
                for (let i = 0; i < offers.length; i++) {
                    let offer = offers[i];
                    if (offer.visible) {
                        noPublicOffer = false;
                        this.rootPage = SearchAutoPage;
                        break;
                    }
                }
                if (noPublicOffer) {
                    this.rootPage = HomePage;
                }
            } else {
                this.rootPage = HomePage;
            }
        });
    }

    updateCachedData(gc){
        console.log("FIRING UP UPDATE SPORADIC SERVER");
        if(this.projectTarget == 'jobyer'){
            this.sporadicService.loadNewEnterpriseOffers();
            this.sporadicService.fetchDeletedEnterpriseOffers();
        } else {
            this.sporadicService.loadNewJobyers();
            this.sporadicService.fetchDeletedJobyerOffers();
        }
    }

    initializeApp(gc: any) {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            // target:string = "employer"; //Jobyer

            this.sqliteDb.initialize();
            //  Initialize sectors and job lists
            this.offerService.loadSectorsToLocal();
            this.offerService.loadJobsToLocal();

            //  Let us initialize the background process
            BackgroundMode.setDefaults({
                title:"Vit-On-Job",
                ticker:"Mise à jour des données de l'application",
                silent:true
            });

            this.updateCachedData(gc);
            BackgroundMode.onactivate().subscribe(()=>{
                console.log("BG ACTIVATED");
                setInterval(this.updateCachedData(gc),1800000);//1800000
            });

            BackgroundMode.ondeactivate().subscribe(()=>{
                console.log("BG DEACTIVATED");
                setInterval(this.updateCachedData(gc),1800000);//1800000
            });

            if(BackgroundMode.isEnabled()){
             BackgroundMode.disable();
             BackgroundMode.enable();
             }else {
                BackgroundMode.enable();
            }

            if(BackgroundMode.isActive()){
                console.log("BG MODE IS ACTIVE");
            }

            //if (GlobalConfigs.env === 'DEV'){
            let loader = this.loading.create({content: "Merci de patienter..."});
            loader.present();
            this.storage.get('introShown').then((result) => {
                if (result) {
                    this.rootPage = HomePage;
                } else {
                    this.rootPage = IntroPage;
                    this.storage.set('introShown', true);
                }
                loader.dismiss();
            });
            //}

            //	We will initialize the new offer
            this.storage.remove('jobData');
            this.storage.remove('languages');
            this.storage.remove('qualities');
            this.storage.remove('slots');

            // Deeplinking for hunter requests
            Deeplinks.routeWithNavController(this.nav, {
                '/add-new-account/:hunterAccess': CivilityPage,
                '/add-offer/:hunterAccess': OfferAddPage
                //'/products/:productId': ProductPage
            }).subscribe((match) => {
                debugger;
                console.log('Successfully routed ', match);
                console.log('parameter ', match.$args.hunterAccess);
                if (typeof match.$args.hunterAccess != 'undefined') {
                    console.log('parameter ', match.$args.hunterAccess);
                    console.log('decoded parameter ', decodeURIComponent(match.$args.hunterAccess));

                }
            }, (nomatch) => {
                console.warn('Unmatched Route', nomatch);
            });

            // Instabug integration
            //let cordova = require('cordova');
            /*if (window.cordova) {

             //gc.setInstabug(cordova.plugins.instabug);
             if (!cordova.plugins.cordova) {
             cordova.plugins.instabug.activate(
             {
             android: this.tokens.android,
             ios: this.tokens.ios
             },
             'button',
             {
             commentRequired: true,
             emailRequired: true,
             shakingThresholdAndroid: '1.5',
             shakingThresholdIPhone: '1.5',
             shakingThresholdIPad: '0.6',
             enableIntroDialog: false,
             floatingButtonOffset: '200',
             setLocale: 'french',
             colorTheme: 'light'
             },
             function () {
             console.log('Instabug initialized.');
             },
             function (error) {
             console.log('Instabug could not be initialized - ' + error);
             }
             )
             }
             }

             //for push notification
             let push = Push.init({
             android: {
             senderID: "693415120998"
             },
             ios: {
             alert: "true",
             badge: true,
             sound: 'false'
             },
             windows: {}
             });
             push.on('registration', (data:any) => {
             console.log(data.registrationId);
             this.storage.set('deviceToken', data.registrationId);
             });
             push.on('notification', (data:any) => {
             console.log(data);
             if (data.additionalData.data.objectNotif == "MissionDetailsPage") {
             this.zone.run(()=> {
             this.nav.push(MissionDetailsPage, {contract: JSON.parse(data.additionalData.data.contract)});
             });
             }
             });
             push.on('error', (e) => {
             console.log(e.message);
             });
             */

            //local notification
            /*LocalNotifications.on("click", (notification, state) => {
             let alert = this.alert.create({
             title: "Notification",
             message: notification.text,
             buttons: [
             {
             text: 'Annuler',
             handler: () => {
             console.log('No clicked');
             }
             },
             {
             text: 'Pointer',
             handler: () => {
             console.log('pointer clicked');
             alert.dismiss().then(() => {
             let data = JSON.parse(notification.data);
             this.nav.push(MissionPointingPage, {
             contract: data.contract,
             autoPointing: true,
             nextPointing: data.nextPointing
             });
             })
             }
             }
             ]
             });
             alert.present();
             });*/


            //	Initialize network control
            /*if (navigator.connection) {
             if (navigator.connection.type == Connection.NONE) {
             let toast = this.toast.create({
             message: "La connexion à Internet est perdu",
             showCloseButton: true,
             closeButtonText: 'Fermer'
             });
             toast.present();
             }
             }*/


            //this.networkService.updateNetworkStat();

            let offline = Observable.fromEvent(document, "offline");
            let online = Observable.fromEvent(document, "online");


            offline.subscribe(() => {
                let toast = this.toast.create({
                    message: "La connexion à Internet est perdu",
                    showCloseButton: true,
                    closeButtonText: 'Fermer'
                });
                toast.present();
                this.changeDetRef.detectChanges();
            });

            online.subscribe(() => {
                let toast = this.toast.create({
                    message: "La connexion à Internet a été restaurée",
                    showCloseButton: true,
                    closeButtonText: 'Fermer'
                });
                toast.present();

                this.networkService.setNetworkStat("");
                this.changeDetRef.detectChanges();
            });

            StatusBar.styleDefault();

            //display user info in menu
            this.storage.get(this.currentUserVar).then((value) => {
                if (value) {
                    value = JSON.parse(value);
                    this.displayInfoUser(value);
                }
            });

            //display profile picture-change
            this.storage.get(this.profilPictureVar).then((value) => {
                if (value) {
                    this.userImageURL = value;
                }
            });

            //  Hide splash screen
            if (Splashscreen) {
                setTimeout(() => {
                    Splashscreen.hide();
                }, 100);
            }
        });
    }

    constituteDefaultMenu() {
        this.isEmployer = (this.projectTarget == 'employer');

        this.loggedInPages = [
            {
                title: "Mon compte",
                description: "Profil, options et coordonnées bancaires",
                component: ProfilePage,
                icon: "person",
                isBadged: false
            },
            {
                title: "Mes offres",
                description: "Gestion des offres, liste, ajout, modification...",
                component: OfferListPage,
                icon: "megaphone",
                isBadged: true
            },
            {
                title: "Mes missions",
                description: "Gestion des missions, horaires...",
                component: (this.isEmployer ? MissionListPage : MissionListJobyerPage),
                icon: "paper",
                isBadged: false
            }
            //{title: "Déconnexion", component: HomePage, icon: "log-out", isBadged: false}
        ];

        this.loggedInPages.push({
            title: "Contrat en attente",
            description: "Liste des contrats en attente de signature",
            component: (this.isEmployer ? ContractListPage: ContractListJobyerPage),
            icon: "logo-buffer",
            isBadged: false
        });
        if (this.isEmployer) {
            this.loggedInPages.push({
                title: "Recrutement groupé",
                description: "Recruter un groupe de Jobyers",
                component: PendingContractsPage,
                icon: "logo-buffer",
                isBadged: false
            });
            this.loggedInPages.push({
                title: "Gestion des habilitations",
                description: "Ajouter des recruteurs qui géreront le recrutement",
                component: RecruiterListPage,
                icon: "contacts",
                isBadged: false
            });
        }
        this.loggedInPages.push({
            title: "Coffre numérique",
            description: "Tous vos documents dans un coffre sécurisé",
            component: AttachementsPage,
            icon: "cube",
            isBadged: false
        });
        this.loggedInPages.push({
            title: "Mes options",
            description: "Configurations de compte, mission...",
            component: SettingsPage,
            icon: "settings",
            isBadged: false
        });
        this.loggedInPages.push({
            title: "A propos",
            description: "A propos de l'application Vit-On-Job",
            component: AboutPage,
            icon: "help-circle",
            isBadges: false
        });
    }

    constituteRecruiterMenu() {
        this.loggedInPages = [
            {
                title: "Mon compte",
                description: "Profil, options et coordonnées bancaires",
                component: ProfilePage,
                icon: "person",
                isBadged: false
            },
            {
                title: "Mes offres",
                description: "Gestion des offres, liste, ajout, modification...",
                component: OfferListPage,
                icon: "megaphone",
                isBadged: true
            },
            {
                title: "Mes missions",
                description: "Gestion des missions, horaires...",
                component: MissionListPage,
                icon: "paper",
                isBadged: false
            },

            //{title: "Déconnexion", component: HomePage, icon: "log-out", isBadged: false}
        ];
        this.loggedInPages.push({
            title: "Mes options",
            description: "Configurations de compte, mission...",
            component: SettingsPage,
            icon: "settings",
            isBadged: false
        });
        this.loggedInPages.push({
            title: "A propos",
            description: "A propos de l'application Vit-On-Job",
            component: AboutPage,
            icon: "help-circle",
            isBadges: false
        });
    }

    listenToLoginEvents() {
        //verify if the user is already connected
        this.storage.get(this.currentUserVar).then((value) => {
            this.storage.set("SCORE", "0");
            if (value) {
                var currentUser = JSON.parse(value);
                if (currentUser.estRecruteur) {
                    this.constituteRecruiterMenu();
                } else {
                    this.constituteDefaultMenu();
                }
                this.enableMenu(true);
                this.notationService.loadNotation(JSON.parse(value)).then((score) => {
                    this.storage.set("SCORE", score);
                });
            } else {
                this.enableMenu(false);
            }
        });
        this.events.subscribe('user:login', (data: any) => {
            if (data.estRecruteur) {
                this.constituteRecruiterMenu();
            } else {
                this.constituteDefaultMenu();
            }
            this.enableMenu(true);
            this.displayInfoUser(data);
        });

        this.events.subscribe('user:logout', () => {
            this.enableMenu(false);
        });

        this.events.subscribe('picture-change', (newURL) => {
            this.userImageURL = newURL;
        });

        this.events.subscribe('user:civility', (data: any) => {
            this.enableMenu(true);
            this.displayInfoUser(data);
        });

    }

    displayInfoUser(data) {
        if (data.titre) {
            this.userName = data.titre + ' ' + data.nom + ' ' + data.prenom;
        } else {
            this.userName = data.estRecruteur ? 'Recruteur' : (this.isEmployer ? 'Employeur' : 'Jobyer');
        }

        this.userEnterprise = (data.estEmployeur && data.employer.entreprises.length > 0) ? data.employer.entreprises[0].nom : '';

        this.userMail = data.email;
        this.userPhone = data.tel;
    }

    enableMenu(loggedIn) {
        this.menu.enable(loggedIn, "loggedInMenu");
        this.menu.enable(!loggedIn, "loggedOutMenu");
    }

    openPage(page) {
        //let nav = this.app.getComponent('nav');
        //let nav = this.app.getActiveNav();
        this.menu.close();

        if (page.title == 'Déconnexion') {
            this.storage.set(this.currentUserVar, null);
            this.events.publish('user:logout');
        }

        if ((page.title === 'A propos') || (page.title === 'Mes options')) {
            this.nav.push(page.component);
        }
        else {
            this.nav.setRoot(page.component);
        }
    }

    gotoAccountPage() {
        this.menu.close();
        this.nav.setRoot(ProfilePage);
    }

    /**
     * @description this method allows to render the multicriteria modal component
     */
    showCriteriaModal() {
        let m = this.modal.create(SearchCriteriaPage);
        this.menu.close();
        m.present();
    }

    /**
     * @description this method allows to render the guided search modal component
     */
    showGuideModal() {
        let m = this.modal.create(SearchGuidePage);
        this.menu.close();
        m.present();
    }

    logOut() {
        this.storage.set('connexion', null);
        this.storage.set(this.currentUserVar, null);
        this.storage.set(this.profilPictureVar, null);
        this.storage.set("RECRUITER_LIST", null);
        this.storage.set('OPTION_MISSION', null);
        this.storage.set('PROFIL_PICTURE', null);
        this.events.publish('user:logout');
        //this.nav.setRoot(HomePage);
    }


}
