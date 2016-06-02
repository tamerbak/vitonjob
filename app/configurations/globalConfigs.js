/**
 * Created by tim on 06/05/2016.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", '@angular/core'], function (require, exports, core_1) {
    "use strict";
    let GlobalConfigs = class GlobalConfigs {
        constructor() {
            this.projectTarget = "jobyer";
        }
        setProjectTarget(value) {
            this.projectTarget = value;
        }
        getProjectTarget() {
            return this.projectTarget;
        }
    };
    GlobalConfigs = __decorate([
        core_1.Injectable()
    ], GlobalConfigs);
    exports.GlobalConfigs = GlobalConfigs;
});
//# sourceMappingURL=globalConfigs.js.map