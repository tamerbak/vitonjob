var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", 'ionic-angular', 'ionic-native', './pages/home/home', './pages/logins/logins', './configurations/configs', './configurations/globalConfigs'], function (require, exports, ionic_angular_1, ionic_native_1, home_1, logins_1, configs_1, globalConfigs_1) {
    "use strict";
    let MyApp = class MyApp {
        constructor(platform, app, menu, gc) {
            this.platform = platform;
            this.app = app;
            this.menu = menu;
            this.gc = gc;
            this.rootPage = home_1.HomePage;
            this.app = app;
            this.platform = platform;
            this.menu = menu;
            this.initializeApp();
            this.pages = [
                { title: "Lancer une recherche", component: home_1.HomePage, icon: "search" },
                { title: "Se connecter", component: logins_1.LoginsPage, icon: "person" }
            ];
            this.rootPage = home_1.HomePage;
            // Set global configs
            // Get target to determine configs
            this.projectTarget = gc.getProjectTarget();
            // get config of selected target
            let config = configs_1.Configs.setConfigs(this.projectTarget);
            //local menu variables
            this.isEmployer = (this.projectTarget == 'employer');
            this.bgMenuURL = config.bgMenuURL;
        }
        initializeApp() {
            this.platform.ready().then(() => {
                // Okay, so the platform is ready and our plugins are available.
                // Here you can do any higher level native things you might need.
                // target:string = "employer"; //Jobyer
                ionic_native_1.StatusBar.styleDefault();
            });
        }
        openPage(page) {
            this.nav = this.app.getComponent('nav');
            this.menu.close();
            this.nav.setRoot(page.component);
        }
    };
    MyApp = __decorate([
        ionic_angular_1.App({
            templateUrl: 'build/menu.html',
            config: { test: 'toto' },
            providers: [globalConfigs_1.GlobalConfigs]
        })
    ], MyApp);
    exports.MyApp = MyApp;
});
//# sourceMappingURL=app.js.map