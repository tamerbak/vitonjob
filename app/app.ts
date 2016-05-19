import {App, Platform, IonicApp, MenuController} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {HomePage} from './pages/home/home';
import {LoginsPage} from './pages/logins/logins';
import {Configs} from './configurations/configs';
import {GlobalConfigs} from './configurations/globalConfigs';
import {SearchService} from "./providers/search-service/search-service";
import {OfferListPage} from "./pages/offer-list/offer-list";


@App({
  templateUrl: 'build/menu.html',
  config: {backButtonText: 'Retour'}, // http://ionicframework.com/docs/v2/api/config/Config/
  providers : [GlobalConfigs, SearchService]
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
              private gc: GlobalConfigs) {
    this.app = app;
    this.platform = platform;
    this.menu = menu;

    this.initializeApp();

    this.pages = [
      { title: "Se connecter", component: LoginsPage, icon: "log-in", isBadged: false },
      { title: "Lancer une recherche", component: HomePage, icon: "search", isBadged: false },
      { title: "Mes offres", component: OfferListPage, icon: "list", isBadged: true }
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
    nav.setRoot(page.component);
  }
}
