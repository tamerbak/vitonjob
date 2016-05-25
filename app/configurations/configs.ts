/**
 * Created by tim on 04/05/16.
 * Here we will define all configurations of both apps.
 * This is a factory pattern that returns the configurations of given target.
 */

interface AbstractConfigs {
    projectName:string;
    themeColor: string;
    inversedThemeColor : string;
    imageURL: string;
    highlightSentence : string;
    bgMenuURL: string;
    calloutURL : string;
    sqlURL : string;
    userImageURL: string;
    calendarTheme : number;
}

class EmployerConfigs implements AbstractConfigs {

    // Application title
    projectName:string = 'VitOnJob Employeur';
    // Application theme color
    themeColor: string = '#757575';
    // Application opposite theme color
    inversedThemeColor: string = '#14baa6';
    // VitOnJob Employer image
    imageURL: string = 'img/logo_employeur.png';
    // User employer image
    userImageURL = 'img/employer.png';
    bgMenuURL: string = 'img/bg_employer.png';
    highlightSentence : string = 'Trouvez vos jobyers immédiatement disponibles!';
    calloutURL : string = 'http://ns389914.ovh.net/vitonjobv1/api/business';
    sqlURL : string = 'http://ns389914.ovh.net/vitonjobv1/api/sql';
    calendarTheme: number = 4;
}

class JobyerConfigs implements AbstractConfigs {

    // Application title
    projectName:string = "VitOnJob Jobyer";
    // Application theme color
    themeColor: string = "#14baa6";
    // Application opposite theme color
    inversedThemeColor: string = '#757575';
    // VitOnJob Jobyer image
    imageURL: string = "img/logo_jobyer.png";
    // User employer image
    userImageURL = 'img/jobyer.png';
    bgMenuURL: string = 'img/bg_jobyer.png';
    highlightSentence : string = "Des milliers d'offres à proximité!";
    calloutURL : string = 'http://ns389914.ovh.net/vitonjobv1/api/business';
    sqlURL : string = 'http://ns389914.ovh.net/vitonjobv1/api/sql';
    calendarTheme: number = 5;
}


export class Configs {
    public static calloutURL : string = 'http://ns389914.ovh.net/vitonjobv1/api/business';
    public static sqlURL : string = 'http://ns389914.ovh.net/vitonjobv1/api/sql';
    public static yousignURL : string = 'http://ns389914.ovh.net:8080/vitonjobv1/api/business';
    public static smsURL : string = 'http://ns389914.ovh.net/vitonjobv1/api/sms';
    public static emailURL : string = 'http://ns389914.ovh.net/vitonjobv1/api/email';

    public static setConfigs(type:string):AbstractConfigs {
        if (type === "employer") {
            return new EmployerConfigs();
        } else if (type === "jobyer") {
            return new JobyerConfigs();
        }

        return null;
    }
}