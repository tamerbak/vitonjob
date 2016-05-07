var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", 'ionic-angular', 'ionic-native', './pages/home/home'], function (require, exports, ionic_angular_1, ionic_native_1, home_1) {
    "use strict";
    let MyApp = class MyApp {
        constructor(platform) {
            this.rootPage = home_1.HomePage;
            platform.ready().then(() => {
                // Okay, so the platform is ready and our plugins are available.
                // Here you can do any higher level native things you might need.
                // target:string = "employer"; //Jobyer
                ionic_native_1.StatusBar.styleDefault();
            });
        }
    };
    MyApp = __decorate([
        ionic_angular_1.App({
            template: '<ion-nav [root]="rootPage"></ion-nav>',
            config: {
                projectName: "VitOnJob Employeur",
                tabbarPlacement: 'bottom'
            } // http://ionicframework.com/docs/v2/api/config/Config/
        })
    ], MyApp);
    exports.MyApp = MyApp;
});
//# sourceMappingURL=app.js.map