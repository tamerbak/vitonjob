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
            this.projectName = 'VitOnJob Employeur';
            // Application theme color
            this.themeColor = '#757575';
            // VitOnJob Employer image
            this.imageURL = 'img/logo_employeur.png';
            this.userImageURL = 'img/employer.png';
            this.bgMenuURL = 'img/bg_employer.png';
            this.highlightSentence = 'Trouvez vos jobyers immédiatement disponibles!';
            this.calloutURL = 'http://ns389914.ovh.net/vitonjobv1/api/business';
            this.sqlURL = 'http://ns389914.ovh.net/vitonjobv1/api/sql';
        }
    }
    class JobyerConfigs {
        constructor() {
            // Application title
            this.projectName = "VitOnJob Jobyer";
            // Application theme color
            this.themeColor = "#14baa6";
            // VitOnJob Jobyer image
            this.imageURL = "img/logo_jobyer.png";
            this.userImageURL = 'img/jobyer.png';
            this.bgMenuURL = 'img/bg_jobyer.png';
            this.highlightSentence = "Des milliers d'offres à proximité!";
            this.calloutURL = 'http://ns389914.ovh.net/vitonjobv1/api/business';
            this.sqlURL = 'http://ns389914.ovh.net/vitonjobv1/api/sql';
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