/**
 * Created by tim on 04/05/16.
 * Here we will define all configurations of both apps.
 * This is a factory pattern that returns the configurations of given target.
 */

interface AbstractConfigs {
    projectName:string;
    themeColor: string;
    imageURL: string;
    highlightSentence : string;
    bgMenuURL: string;
    calloutURL : string;
    sqlURL : string;
}

class EmployerConfigs implements AbstractConfigs {

    // Application title
    projectName:string = 'VitOnJob Employeur';
    // Application theme color
    themeColor: string = '#757575';
    // VitOnJob Employer image
    imageURL: string = 'img/logo_employeur.png';
    bgMenuURL: string = 'img/bg_employer.png';
    highlightSentence : string = 'Trouvez vos jobyers immédiatement disponibles!';
    calloutURL : string = 'http://ns389914.ovh.net/vitonjobv1/api/business';
    sqlURL : string = 'http://ns389914.ovh.net/vitonjobv1/api/sql';
}

class JobyerConfigs implements AbstractConfigs {

    // Application title
    projectName:string = "VitOnJob Jobyer";
    // Application theme color
    themeColor: string = "#14baa6";
    // VitOnJob Jobyer image
    imageURL: string = "img/logo_jobyer.png";
    bgMenuURL: string = 'img/bg_jobyer.png';
    highlightSentence : string = "Des milliers d'offres à proximité!";
    calloutURL : string = 'http://ns389914.ovh.net/vitonjobv1/api/business';
    sqlURL : string = 'http://ns389914.ovh.net/vitonjobv1/api/sql';
}


export class Configs {
    public static setConfigs(type:string):AbstractConfigs {
        if (type === "employer") {
            return new EmployerConfigs();
        } else if (type === "jobyer") {
            return new JobyerConfigs();
        }

        return null;
    }
}