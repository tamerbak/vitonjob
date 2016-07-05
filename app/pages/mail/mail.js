var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", 'ionic-angular', '../../configurations/configs', '../../configurations/globalConfigs', "../offer-list/offer-list"], function (require, exports, ionic_angular_1, configs_1, globalConfigs_1, offer_1) {
    "use strict";
    /*
      Generated class for the MailPage page.
    
      See http://ionicframework.com/docs/v2/components/#navigation for more info on
      Ionic pages and navigation.
    */
    let MailPage = class MailPage {
        constructor(nav, gc) {
            this.nav = nav;
            // Set global configs
            // Get target to determine configs
            this.projectTarget = gc.getProjectTarget();
            // get config of selected target
            let config = configs_1.Configs.setConfigs(this.projectTarget);
            // Set local variables and messages
            this.isEmployer = (this.projectTarget == 'employer');
            this.mailTitle = "E-mail";
            this.themeColor = config.themeColor;
            this.nav = nav;
        }
        openOfferPage() {
            this.nav.push(offer_1.OfferListPage);
        }
    };
    MailPage = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/mail/mail.html',
            prividers: [globalConfigs_1.GlobalConfigs]
        })
    ], MailPage);
    exports.MailPage = MailPage;
});
//# sourceMappingURL=mail.js.map