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


@App({
  templateUrl: 'build/menu.html',
  config: {backButtonText: 'Retour'}, // http://ionicframework.com/docs/v2/api/config/Config/
  providers : [GlobalConfigs, SearchService,UserService,ContractService,SmsService,MissionService]
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
              private missionService:MissionService) {
    this.app = app;
    this.platform = platform;
    this.menu = menu;

    this.initializeApp();

    this.pages = [
      { title: "Se connecter", component: LoginsPage, icon: "log-in", isBadged: false },
      { title: "Lancer une recherche", component: HomePage, icon: "search", isBadged: false },
      { title: "Mes offres", component: OfferListPage, icon: "list", isBadged: true },
      { title: "Gestion des missions", component: MissionListPage, icon: "list", isBadged: false },
    ];
    this.rootPage = HomePage;//OfferAddPage;//

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


  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      // target:string = "employer"; //Jobyer

      StatusBar.styleDefault();
    });
  }

  openPage(page) {
    let nav = this.app.getComponent('nav');
    this.menu.close();
    if(page.title == 'Gestion des missions' ){
        nav.push(page.component);
    }
    else
    {
        nav.setRoot(page.component);
    }
    
  }
}
