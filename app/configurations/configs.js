/**
 * Created by tim on 04/05/16.
 */
/*export class Configs {

 public static projectName : string = "VitOnJob Employeur" ; // "VitOnJob Jobyer"


 constructor() {

 }
 }*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    class EmployerConfigs {
        constructor() {
            this.projectName = "VitOnJob Employeur";
        }
    }
    class JobyerConfigs {
        constructor() {
            this.projectName = "VitOnJob Jobyer";
        }
    }
    class Configs {
        static setConfigs(type) {
            if (type === "employer") {
                return new EmployerConfigs();
            }
            else if (type === "jobyer") {
                return new JobyerConfigs();
            }
            return null;
        }
    }
    exports.Configs = Configs;
});
//# sourceMappingURL=configs.js.map