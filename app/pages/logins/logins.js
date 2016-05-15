var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", 'ionic-angular', '../../configurations/configs', '../../configurations/globalConfigs', '../phone/phone', '../mail/mail'], function (require, exports, ionic_angular_1, configs_1, globalConfigs_1, phone_1, mail_1) {
    "use strict";
    let LoginsPage = class LoginsPage {
        constructor(nav, app, navParams, gc) {
            this.nav = nav;
            // set the root pages for each tab
            this.phoneRoot = phone_1.PhonePage;
            this.mailRoot = mail_1.MailPage;
            let test = app._config;
            this.nav = nav;
            // If we navigated to this page, we will have an item available as a nav param
            this.selectedItem = navParams.get('item');
            // Set global configs
            // Get target to determine configs
            this.projectTarget = gc.getProjectTarget();
            // get config of selected target
            let config = configs_1.Configs.setConfigs(this.projectTarget);
            // Set local variables and messages
            this.isEmployer = (this.projectTarget == 'employer');
            this.phoneTabTitle = "Téléphone";
            this.mailTabTitle = "E-mail";
        }
    };
    LoginsPage = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/logins/logins.html',
            providers: [globalConfigs_1.GlobalConfigs]
        })
    ], LoginsPage);
    exports.LoginsPage = LoginsPage;
});
//# sourceMappingURL=logins.js.map