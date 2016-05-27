import {App, Platform, IonicApp, MenuController} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {HomePage} from './pages/home/home';
import {LoginsPage} from './pages/logins/logins';
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
import {ChangeDetectorRef} from 'angular2/src/core/change_detection/change_detector_ref';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import {OfferAddPage} from "./pages/offer-add/offer-add";
import {OfferDetailPage} from "./pages/offer-detail/offer-detail";
import {ProfilePage} from "./pages/profile/profile";
import {Storage, SqlStorage} from 'ionic-angular';
import {Events} from 'ionic-angular';
import {ContractPage} from "./pages/contract/contract";

@App({
  templateUrl: 'build/menu.html',
  config: {backButtonText: 'Retour'}, // http://ionicframework.com/docs/v2/api/config/Config/
  providers : [GlobalConfigs, SearchService,UserService,ContractService,SmsService,MissionService,NetworkService,Helpers]
})
export class MyApp {
	rootPage: any = HomePage;
	public pages: Array<{title: string, component: any, icon: string, isBadged: boolean}>;
	
	projectTarget : any;
	isEmployer : boolean;
	bgMenuURL : string;
	userImageURL: string;
	userName: string;
	userMail:string;
	themeColor: string;
	
	constructor(private platform: Platform,
	private app: IonicApp,
	private menu: MenuController,
	private gc: GlobalConfigs,
	private missionService:MissionService,
	private networkService:NetworkService,
	private changeDetRef: ChangeDetectorRef, 
	public events: Events) {
		this.app = app;
		this.platform = platform;
		this.menu = menu;
		this.storage = new Storage(SqlStorage);
		
		this.initializeApp();
		
		this.pages = [
			{ title: "Lancer une recherche", component: HomePage, icon: "search", isBadged: false }
		];
		this.loggedInPages = [
			{ title: "Mon Profil", component: ProfilePage, icon: "person", isBadged: false },
			{ title: "Mes offres", component: OfferListPage, icon: "list", isBadged: true },
			{ title: "Gestion des missions", component: MissionListPage, icon: "list", isBadged: false },
			{ title: "Déconnexion", component: HomePage, icon: "log-out", isBadged: false }
		];
		this.loggedOutPages = [
			{ title: "Se connecter", component: LoginsPage, icon: "log-in", isBadged: false }
		];
		
		
		this.rootPage = HomePage;//ProfilePage;//OfferDetailPage;//OfferAddPage;//
		
		// Set global configs
		// Get target to determine configs
		this.projectTarget = gc.getProjectTarget();
		
		// get config of selected target
		let config = Configs.setConfigs(this.projectTarget);
		
		//local menu variables
		this.isEmployer = (this.projectTarget == 'employer');
		this.bgMenuURL = config.bgMenuURL;
		this.userImageURL = config.userImageURL;
		this.userName = "Nom d'utilisateur";
		this.userMail = "mail@compte.com";
		this.themeColor = config.themeColor;
		
		//fake call of setMissions from mission-service to fill local db with missions data for test
		missionService.setMissions();
		
		this.listenToLoginEvents();
	}
	
	initializeApp() {
		this.platform.ready().then(() => {
			// Okay, so the platform is ready and our plugins are available.
			// Here you can do any higher level native things you might need.
			// target:string = "employer"; //Jobyer
			
			this.networkService.updateNetworkStat();
			
			var offline = Observable.fromEvent(document, "offline");
			var online = Observable.fromEvent(document, "online");
			
			
			
			offline.subscribe(() => {
				this.networkService.setNetworkStat("Vous n'êtes pas connecté.");
				this.changeDetRef.detectChanges();
			});
			
			online.subscribe(()=>{
				this.networkService.setNetworkStat("");
				this.changeDetRef.detectChanges();
			});
			
			StatusBar.styleDefault();
		});
	}
	
	listenToLoginEvents() {
		this.events.subscribe('user:login', () => {
			this.enableMenu(true);
		});
		
		this.events.subscribe('user:logout', () => {
			this.enableMenu(false);
		});
	}
	
	enableMenu(loggedIn) {
		this.menu.enable(loggedIn, "loggedInMenu");
		this.menu.enable(!loggedIn, "loggedOutMenu");
	}
	
	openPage(page) {
		let nav = this.app.getComponent('nav');
		this.menu.close();
		
		if(page.title == 'Déconnexion' ){
			this.storage.set("currentUser", null);
			this.events.publish('user:logout');
		}
		
		if(page.title == 'Gestion des missions' ){
			nav.push(page.component);
		}
		else
		{
			nav.setRoot(page.component);
		}
	}
}

