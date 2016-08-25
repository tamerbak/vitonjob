import {Headers} from "@angular/http";
/**
 * Created by tim on 04/05/16.
 * Here we will define all configurations of both apps.
 * This is a factory pattern that returns the configurations of given target.
 */

interface AbstractConfigs {
    projectName:string;
    themeColor:string;
    inversedThemeColor:string;
    imageURL:string;
    highlightSentence:string;
    backgroundImage:any;
    menuBackgroundImage:any;
    fontColor:any;
    bgMenuURL:string;
    calloutURL:string;
    sqlURL:string;
    userImageURL:string;
    calendarTheme:number;
    avatars:any;
    options:any;
    tokenInstabug :any;
	currentUserVar: string;
	profilPictureVar: string;
}

class EmployerConfigs implements AbstractConfigs {

    // Application title
    projectName:string = 'VitOnJob Employeur';
    // Application theme color
    themeColor:string = '#757575';
    // Application opposite theme color
    inversedThemeColor:string = '#14baa6';
    // VitOnJob Employer image
    imageURL:string = 'img/logo_employeur.png';
    // User employer image
    userImageURL = 'img/employer.png';
    bgMenuURL:string = 'img/bg_employer.png';
    menuBackgroundImage = {'background-image': "url('img/bg_menu_employer.png')"};
    highlightSentence:string = 'Trouvez vos jobyers immédiatement disponibles!';
    calloutURL:string = Configs.calloutURL;
    sqlURL:string = Configs.sqlURL;
    calendarTheme:number = 4;
    backgroundImage = {'background-image': "url('img/bg_employer.png')"};
    fontColor = "white";
    avatars = [
        {
            url: 'img/employer.png'
        },
        {
            url: 'img/employer2.png'
        },
        {
            url: 'img/employer3.png'
        }
    ];
    options = {
        push: {
            local: true,
            remote: true
        }
    };

    tokenInstabug = {
        android:'848700bc8ccff3bb4be3fd54dabbf020',
        ios:'746f8d62a4d8220383315f38c0999418'
    }
	currentUserVar: string = "currentEmployer";
	profilPictureVar: string = "pictuteEmployer";
}

class JobyerConfigs implements AbstractConfigs {

    // Application title
    projectName:string = "VitOnJob Jobyer";
    // Application theme color
    themeColor:string = "#14baa6";
    // Application opposite theme color
    inversedThemeColor:string = '#757575';
    // VitOnJob Jobyer image
    imageURL:string = "img/logo_jobyer.png";
    fontColor:string = '#757575';
    // User employer image
    userImageURL = 'img/jobyer.png';
    menuBackgroundImage = {'background-image': "url('img/bg_menu_jobyer.png')"};
    backgroundImage = {'background-image': "url('img/bg_jobyer.png')"};
    bgMenuURL:string = 'img/bg_jobyer.png';
    highlightSentence:string = "Des milliers d'offres à proximité!";
    calloutURL:string = Configs.calloutURL;
    sqlURL:string = Configs.sqlURL;
    calendarTheme:number = 5;
    avatars = [
        {
            url: 'img/jobyer.png'
        },
        {
            url: 'img/jobyer2.png'
        },
        {
            url: 'img/jobyer3.png'
        },
        {
            url: 'img/jobyer4.png'
        }
    ];
    options = {
        push: {
            local: true,
            remote: true
        }
    };

    tokenInstabug = {
        android:'8638bb86054b6354141c9a07d8317d26',
        ios:'a79265adfebcc922588a989ab0a07557'
    }
	currentUserVar: string = "currentJobyer";
	profilPictureVar: string = "pictuteJobyer";
}



export class Configs {
    public static calloutURL:string = 'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/business';
    public static sqlURL:string = 'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/sql';
    public static yousignURL:string = 'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/business';
    public static smsURL:string = 'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/envoisms';
    public static emailURL:string = 'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/envoimail';
    public static fssURL:string = 'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/fssjs';

    /*
     public static calloutURL:string = 'https://app.vitonjob.com/api/business';
     public static sqlURL:string = 'https://app.vitonjob.com/api/sql';
     public static yousignURL:string = 'https://app.vitonjob.com/api/business';
     public static smsURL:string = 'https://app.vitonjob.com/api/sms';
     public static emailURL:string = 'https://app.vitonjob.com/api/email';
     public static fssURL:string = 'https://app.vitonjob.com/api/fssjs';
     */

    public static getHttpJsonHeaders(){
        let headers = new Headers();
        headers.append("Content-Type", 'application/json');
        //headers.append("Authorization", 'Basic aGFkZXM6NWV0Y2Fy');
        return headers;
    }
    public static getHttpTextHeaders(){
        let headers = new Headers();
        headers.append("Content-Type", 'text/plain');
        //headers.append("Authorization", 'Basic aGFkZXM6NWV0Y2Fy');
        return headers;
    }
    public static getHttpXmlHeaders(){
        let headers = new Headers();
        headers.append("Content-Type", 'text/xml');
        //headers.append("Authorization", 'Basic aGFkZXM6NWV0Y2Fy');
        return headers;
    }

    public static setConfigs(type:string):AbstractConfigs {
        if (type === "employer") {
            return new EmployerConfigs();
        } else if (type === "jobyer") {
            return new JobyerConfigs();
        }

        return null;
    }
}

