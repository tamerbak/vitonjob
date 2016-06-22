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
    calloutURL:string = 'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/business';
    sqlURL:string = 'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/sql';
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
        push : {
            local: true,
            remote: true
        }
    }
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
    calloutURL:string = 'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/business';
    sqlURL:string = 'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/sql';
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
        push : {
            local: true,
            remote: true
        }
    }
}


export class Configs {
    public static calloutURL:string = 'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/business';
    public static sqlURL:string = 'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/sql';
    public static yousignURL:string = 'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/business';
    public static smsURL:string = 'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/sms';
    public static emailURL:string = 'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/email';

    public static setConfigs(type:string):AbstractConfigs {
        if (type === "employer") {
            return new EmployerConfigs();
        } else if (type === "jobyer") {
            return new JobyerConfigs();
        }

        return null;
    }
}

