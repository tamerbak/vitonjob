var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", 'ionic-angular', '../../configurations/configs', '../../configurations/globalConfigs'], function (require, exports, ionic_angular_1, configs_1, globalConfigs_1) {
    "use strict";
    let HomePage = class HomePage {
        constructor(gc) {
            // Get target to determine configs
            let projectTarget = gc.getProjectTarget();
            // get config of selected target
            let config = configs_1.Configs.setConfigs(projectTarget);
            //Initialize controller variables :
            this.projectName = config.projectName;
            this.themeColor = config.themeColor;
            if (projectTarget == 'employer')
                this.isEmployer = false;
            else
                this.isEmployer = true;
        }
    };
    HomePage = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/home/home.html',
            providers: [globalConfigs_1.GlobalConfigs]
        })
    ], HomePage);
    exports.HomePage = HomePage;
});
//# sourceMappingURL=home.js.map