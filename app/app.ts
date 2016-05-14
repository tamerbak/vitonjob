import {App, Platform, IonicApp, MenuController} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {HomePage} from './pages/home/home';
import {LoginsPage} from './pages/logins/logins';
import {Configs} from './configurations/configs';
import {GlobalConfigs} from './configurations/globalConfigs';


@App({
  templateUrl: 'build/menu.html',
  config: {test: 'toto'}, // http://ionicframework.com/docs/v2/api/config/Config/
  providers : [GlobalConfigs]
})
export class MyApp {
  rootPage: any = HomePage;
  public pages: Array<{title: string, component: any}>;

  constructor(private platform: Platform,
              private app: IonicApp,
              private menu: MenuController,
              private gc: GlobalConfigs) {
    this.app = app;
    this.platform = platform;
    this.menu = menu;

    this.initializeApp();

    this.pages = [
      { title: "Lancer une recherche", component: HomePage, icon: "search" },
      { title: "Se connecter", component: LoginsPage, icon: "person" }
    ];
    this.rootPage = HomePage;

    // Set global configs
    // Get target to determine configs
    this.projectTarget = gc.getProjectTarget();

    // get config of selected target
    let config = Configs.setConfigs(this.projectTarget);

    //local menu variables
    this.isEmployer = (this.projectTarget == 'employer');
    this.bgMenuURL = config.bgMenuURL;

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
    this.nav = this.app.getComponent('nav');
    this.menu.close();
    this.nav.setRoot(page.component);
  }
}
