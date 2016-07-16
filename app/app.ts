import {Platform, MenuController, Nav, ionicBootstrap, App, Modal, Toast, LocalStorage, Alert} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {HomePage} from './pages/home/home';
//import {LoginsPage} from './pages/logins/logins';
import {PhonePage} from './pages/phone/phone';
import {MissionListPage} from './pages/mission-list/mission-list';
import {Configs} from './configurations/configs';
import {GlobalConfigs} from './configurations/globalConfigs';
import {SearchService} from "./providers/search-service/search-service";
import {OfferListPage} from "./pages/offer-list/offer-list";
import {UserService} from "./providers/user-service/user-service";
import {ContractService} from "./providers/contract-service/contract-service";
import {SmsService} from "./providers/sms-service/sms-service";
import {MissionService} from "./providers/mission-service/mission-service";
import {Helpers} from './providers/helpers.service.ts';
import {NetworkService} from "./providers/network-service/network-service";
import {ChangeDetectorRef} from '@angular/core/src/change_detection/change_detector_ref';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import {OfferAddPage} from "./pages/offer-add/offer-add";
import {OfferDetailPage} from "./pages/offer-detail/offer-detail";
import {ProfilePage} from "./pages/profile/profile";
import {Storage, SqlStorage} from 'ionic-angular';
import {Events} from 'ionic-angular';
import {ContractPage} from "./pages/contract/contract";
import {isUndefined} from "ionic-angular/util";
import {OffersService} from "./providers/offers-service/offers-service";
import {ViewChild, Component} from "@angular/core";
import {Push} from 'ionic-native'
import {SearchCriteriaPage} from "./pages/search-criteria/search-criteria";
import {SearchGuidePage} from "./pages/search-guide/search-guide";
import {MissionDetailsPage} from './pages/mission-details/mission-details';
import {NgZone} from '@angular/core';
import {SettingsPage} from "./pages/settings/settings";
import {AboutPage} from "./pages/about/about";
import {PendingContractsPage} from "./pages/pending-contracts/pending-contracts";
import {RecruiterListPage} from "./pages/recruiter-list/recruiter-list";
import {NotationService} from "./providers/notation-service/notation-service";
import {AttachementsPage} from "./pages/attachements/attachements";
import {LocalNotifications} from 'ionic-native';
import {MissionPointingPage} from "./pages/mission-pointing/mission-pointing";


//import {ParametersPage} from "./pages/parameters/parameters";

declare var cordova;
declare var Connection;
declare var navigator;

@Component({
    templateUrl: 'build/menu.html',
    providers:[NotationService]
})
export class Vitonjob {

    @ViewChild(Nav) nav:Nav;
    rootPage:any = HomePage;
    public pages:Array<{title:string, component:any, icon:string, isBadged:boolean}>;

    projectTarget:any;
    isEmployer:boolean;
    bgMenuURL:string;
    userImageURL:string;
    userName:string;
    userMail:string;
    themeColor:string;
    menuBackgroundImage:any;
    config:any;
    storage:Storage;
    local : Storage;
    tokens:any;

    constructor(private platform:Platform,
                private app:App,
                private menu:MenuController,
                private gc:GlobalConfigs,
                private missionService:MissionService,
                private notationService:NotationService,
                private networkService:NetworkService,
                private changeDetRef:ChangeDetectorRef,
                public events:Events,
                public offerService:OffersService,
                private zone:NgZone) {

        this.app = app;
        this.platform = platform;
        this.menu = menu;
        this.storage = new Storage(SqlStorage);
        this.local = new Storage(LocalStorage);
        // Set global configs
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();

        // get config of selected target
        this.config = Configs.setConfigs(this.projectTarget);
        this.tokens = this.config.tokenInstabug;

        this.initializeApp(gc);

        this.pages = [
            {title: "Lancer une recherche", component: HomePage, icon: "search", isBadged: false}
        ];
        this.loggedInPages = [
            {title: "Mon Profil", component: ProfilePage, icon: "person", isBadged: false},
            {title: "Mes offres", component: OfferListPage, icon: "megaphone", isBadged: true},
            {title: "Mes missions", component: MissionListPage, icon: "paper", isBadged: false},

            //{title: "Déconnexion", component: HomePage, icon: "log-out", isBadged: false}
        ];
        this.loggedOutPages = [
            {title: "Se connecter", component: PhonePage, icon: "log-in", isBadged: false},
            {title: "A propos", component: AboutPage, icon: "help-circle", isBadges: false}
        ];


        this.rootPage = HomePage;//ProfilePage;//OfferAddPage;//HomePage;//OfferDetailPage;//

        //local menu variables
        this.isEmployer = (this.projectTarget == 'employer');
        if(this.isEmployer){
            this.loggedInPages.push({title: "Contrats en attente", component: PendingContractsPage, icon: "clock", isBadged: false});
            this.loggedInPages.push({title: "Gestion des habilitations", component: RecruiterListPage, icon: "contacts", isBadged: false});
        }
        this.loggedInPages.push({title: "Coffre numérique", component: AttachementsPage, icon: "albums", isBadged: false});
        this.loggedInPages.push({title: "Mes options", component: SettingsPage, icon: "settings", isBadged: false});
        this.loggedInPages.push({title: "A propos", component: AboutPage, icon: "help-circle", isBadges: false});


        this.bgMenuURL = this.config.bgMenuURL;
        this.userImageURL = this.config.userImageURL;
        this.userName = this.isEmployer ? 'Employeur' : 'Jobyer';
        this.userMail = "";
        this.themeColor = this.config.themeColor;
        this.menuBackgroundImage = this.config.menuBackgroundImage;

        //fake call of setMissions from mission-service to fill local db with missions data for test
        //missionService.setMissions();

        this.listenToLoginEvents();

        this.offerCount = 0;
        this.isCalculating = true;

        //  Initialize sectors and job lists
        this.offerService.loadSectorsToLocal();
        this.offerService.loadJobsToLocal();
    }

    initializeApp(gc:any) {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            // target:string = "employer"; //Jobyer

            //	We will initialize the new offer
            this.local.remove('jobData');
            this.local.remove('languages');
            this.local.remove('qualities');
            this.local.remove('slots');

            // Instabug integration 
            if ((<any>window).cordova) {
                
                //gc.setInstabug(cordova.plugins.instabug);
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
                );


                //for push notification

                var push = Push.init({
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
                push.on('registration', (data) => {
                    console.log(data.registrationId);
                    this.storage.set('deviceToken', data.registrationId);
                });
                push.on('notification', (data) => {
                    console.log(data);
                    if(data.additionalData.data.objectNotif == "MissionDetailsPage") {
                        this.zone.run(()=> {
                            this.nav.push(MissionDetailsPage, {contract: JSON.parse(data.additionalData.data.contract)});
                        });
                    }
                });
                push.on('error', (e) => {
                    console.log(e.message);
                });
            }

			//local notification
			LocalNotifications.on("click", (notification, state) => {
				let alert = Alert.create({
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
									var data = JSON.parse(notification.data)
									this.nav.push(MissionPointingPage,{contract: data.contract, autoPointing: true, nextPointing: data.nextPointing});
								})
							}
						}
					]
				});
				this.nav.present(alert);
			});
			
            //	Initialize network control
            if (navigator.connection) {
                if(navigator.connection.type == Connection.NONE){
                    let toast = Toast.create({
                        message: "Vous n'êtes pas connectés à Internet",
                        showCloseButton : true,
                        closeButtonText : 'Fermer'
                    });
                    this.nav.present(toast);
                }
            }


            this.networkService.updateNetworkStat();

            var offline = Observable.fromEvent(document, "offline");
            var online = Observable.fromEvent(document, "online");


            offline.subscribe(() => {
                let toast = Toast.create({
                    message: "Vous n'êtes pas connectés à Internet",
                    showCloseButton : true,
                    closeButtonText : 'Fermer'
                });
                this.nav.present(toast);
                this.changeDetRef.detectChanges();
            });

            online.subscribe(()=> {
                let toast = Toast.create({
                    message: "La connection à Internet a été restaurée",
                    showCloseButton : true,
                    closeButtonText : 'Fermer'
                });
                this.nav.present(toast);

                this.networkService.setNetworkStat("");
                this.changeDetRef.detectChanges();
            });

            StatusBar.styleDefault();
        });
    }

    listenToLoginEvents() {
        //verify if the user is already connected
        this.storage.get("currentUser").then((value) => {
            this.storage.set("SCORE", "0");
            if (value) {
                this.enableMenu(true);
                this.notationService.loadNotation(JSON.parse(value)).then((score)=>{
                    this.storage.set("SCORE", score);
                });
            } else {
                this.enableMenu(false);
            }
        });
        this.events.subscribe('user:login', (data) => {
            this.enableMenu(true);
            if(data[0].titre){
                this.userName = data[0].titre +' '+data[0].nom +' '+data[0].prenom;
            }
            this.userMail = data[0].email;
        });

        this.events.subscribe('user:logout', () => {
            this.enableMenu(false);
        });

        this.events.subscribe('picture-change', (newURL)=> {
            this.userImageURL = newURL;
        });

        this.events.subscribe('user:civility', (data) => {
            this.enableMenu(true);
            this.userName = data[0].titre +' '+data[0].nom +' '+data[0].prenom;
            this.userMail = data[0].email;
        });

    }

    enableMenu(loggedIn) {
        this.menu.enable(loggedIn, "loggedInMenu");
        this.menu.enable(!loggedIn, "loggedOutMenu");
    }

    openPage(page) {
        //let nav = this.app.getComponent('nav');
        this.menu.close();

        if (page.title == 'Déconnexion') {
            this.storage.set("currentUser", null);
            this.events.publish('user:logout');
        }

        if ((page.title === 'A propos') || (page.title === 'Mes options')) {
            this.nav.push(page.component);
        }
        else {
            this.nav.setRoot(page.component);
        }
    }

    /**
     * @description this method allows to render the multicriteria modal component
     */
    showCriteriaModal() {
        let m = new Modal(SearchCriteriaPage);
        this.menu.close();
        this.nav.present(m);
    }

    /**
     * @description this method allows to render the guided search modal component
     */
    showGuideModal() {
        let m = new Modal(SearchGuidePage);
        this.menu.close();
        this.nav.present(m);
    }
}

ionicBootstrap(Vitonjob, [GlobalConfigs, SearchService, UserService, ContractService, SmsService,
    MissionService, NetworkService, Helpers, OffersService], {
    backButtonText: "",
    monthNames: ['Janvier', 'F\u00e9vrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Ao\u00fbt', 'Septembre', 'Octobre', 'Novembre', 'D\u00e9cembre'],
    monthShortNames: ['Jan', 'F\u00e9v', 'Mar', 'Avr', 'Jui', 'Juil', 'Ao\u00fb', 'Sept', 'Oct', 'Nov', 'D\u00e9c'],
    dayNames: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
    dayShortNames: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
});



