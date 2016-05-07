/**
 * Created by tim on 04/05/16.
 * Here we will define all configurations of both apps.
 * This is a factory pattern that returns the configurations of given target.
 */
define(["require", "exports"], function (require, exports) {
    "use strict";
    class EmployerConfigs {
        constructor() {
            // Application title
            this.projectName = "VitOnJob Employeur";
            // Application theme color
            this.themeColor = "#757575";
        }
    }
    class JobyerConfigs {
        constructor() {
            // Application title
            this.projectName = "VitOnJob Jobyer";
            // Application theme color
            this.themeColor = "#14baa6";
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