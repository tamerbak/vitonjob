import {Headers} from "@angular/http";
import {GlobalConfigs} from "./globalConfigs";
/**
 * Created by tim on 04/05/16.
 * Here we will define all configurations of both apps.
 * This is a factory pattern that returns the configurations of given target.
 */

interface AbstractConfigs {
    projectName: string;
    themeColor: string;
    inversedThemeColor: string;
    imageURL: string;
    highlightSentence: string;
    backgroundImage: any;
    menuBackgroundImage: any;
    fontColor: any;
    bgMenuURL: string;
    calloutURL: string;
    sqlURL: string;
    userImageURL: string;
    calendarTheme: number;
    avatars: any;
    options: any;
    tokenInstabug: any;
    currentUserVar: string;
    profilPictureVar: string;
    backGroundColor: string;
}

class EmployerConfigs implements AbstractConfigs {

    // Application title
    projectName: string = 'Vit-On-Job Employeur';
    // Application theme color
    themeColor: string = 'vojgrey';
    // Application opposite theme color
    inversedThemeColor: string = 'vojgreen';
    // Vit-On-Job Employer image
    imageURL: string = 'assets/img/logo_employeur.png';
    // User employer image
    userImageURL = 'assets/img/employer.png';
    bgMenuURL: string = 'assets/img/bg_employer.png';
    menuBackgroundImage = {'background-image': "url('assets/img/bg_menu_employer.png')"};
    highlightSentence: string = 'Trouvez vos jobyers immédiatement disponibles!';
    calloutURL: string = Configs.calloutURL;
    sqlURL: string = Configs.sqlURL;
    calendarTheme: number = 4;
    backgroundImage = {'background-image': "url('assets/img/bg_employer.png')"};
    fontColor = "white";
    backGroundColor = '#757575';
    avatars = [
        {
            url: 'assets/img/employer.png'
        },
        {
            url: 'assets/img/employer2.png'
        },
        {
            url: 'assets/img/employer3.png'
        }
    ];
    options = {
        push: {
            local: true,
            remote: true
        }
    };

    tokenInstabug = {
        android: '848700bc8ccff3bb4be3fd54dabbf020',
        ios: '746f8d62a4d8220383315f38c0999418'
    };
    currentUserVar: string = "currentEmployer";
    profilPictureVar: string = "pictuteEmployer";
}

class JobyerConfigs implements AbstractConfigs {

    // Application title
    projectName: string = "Vit-On-Job Jobyer";
    // Application theme color
    themeColor: string = "vojgreen";
    // Application opposite theme color
    inversedThemeColor: string = "vojgrey";
    // Vit-On-Job Jobyer image
    imageURL: string = "assets/img/logo_jobyer.png";
    fontColor: string = '#757575';
    // User employer image
    userImageURL = 'assets/img/jobyer.png';
    menuBackgroundImage = {'background-image': "url('assets/img/bg_menu_jobyer.png')"};
    backgroundImage = {'background-image': "url('assets/img/bg_jobyer.png')"};
    bgMenuURL: string = 'assets/img/bg_jobyer.png';
    highlightSentence: string = "Des milliers d'offres à proximité!";
    calloutURL: string = Configs.calloutURL;
    sqlURL: string = Configs.sqlURL;
    calendarTheme: number = 5;
    backGroundColor = '#14baa6';
    avatars = [
        {
            url: 'assets/img/jobyer.png'
        },
        {
            url: 'assets/img/jobyer2.png'
        },
        {
            url: 'assets/img/jobyer3.png'
        },
        {
            url: '.assets/img/jobyer4.png'
        }
    ];
    options = {
        push: {
            local: true,
            remote: true
        }
    };

    tokenInstabug = {
        android: '8638bb86054b6354141c9a07d8317d26',
        ios: 'a79265adfebcc922588a989ab0a07557'
    };
    currentUserVar: string = "currentJobyer";
    profilPictureVar: string = "pictuteJobyer";
}


export class Configs {

    public static calloutURL: string = (GlobalConfigs.env === 'DEV') ?
        'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/business' :
        'https://app.vitonjob.com/api/business';
    public static sqlURL: string = (GlobalConfigs.env === 'DEV') ?
        'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/sql':
        'https://app.vitonjob.com/api/sql';
    public static yousignURL: string = (GlobalConfigs.env === 'DEV') ?
        'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/business':
        'https://app.vitonjob.com/api/business';
    public static smsURL: string = (GlobalConfigs.env === 'DEV') ?
        'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/envoisms':
        'https://app.vitonjob.com/api/envoisms';
    public static emailURL: string = (GlobalConfigs.env === 'DEV') ?
        'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/envoimail':
        'https://app.vitonjob.com/api/envoimail';
    public static fssURL: string = (GlobalConfigs.env === 'DEV') ?
        'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/fssjs':
        'https://app.vitonjob.com/api/fssjs';

    public static GA_INITIALIZED:boolean=false;

    public static getHttpJsonHeaders() {
        let headers = new Headers();
        headers.append("Content-Type", 'application/json');
        if (GlobalConfigs.env === 'PROD')
            headers.append("Authorization", 'Basic aGFkZXM6NWV0Y2Fy');
        return headers;
    }

    public static getHttpTextHeaders() {
        let headers = new Headers();
        headers.append("Content-Type", 'text/plain');
        if (GlobalConfigs.env === 'PROD')
            headers.append("Authorization", 'Basic aGFkZXM6NWV0Y2Fy');
        return headers;
    }

    public static getHttpXmlHeaders() {
        let headers = new Headers();
        headers.append("Content-Type", 'text/xml');
        if (GlobalConfigs.env === 'PROD')
            headers.append("Authorization", 'Basic aGFkZXM6NWV0Y2Fy');
        return headers;
    }

    public static setConfigs(type: string): AbstractConfigs {
        if (type === "employer") {
            return new EmployerConfigs();
        } else if (type === "jobyer") {
            return new JobyerConfigs();
        }

        return null;
    }


}

