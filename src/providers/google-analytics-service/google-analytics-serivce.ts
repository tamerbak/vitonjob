import {Injectable} from '@angular/core';
import {GoogleAnalytics} from 'ionic-native';
import 'rxjs/add/observable/forkJoin';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";

@Injectable()
export class GoogleAnalyticsService {

    eventsNotSent:any[] = new Array();
    trackerInitialized:boolean = false;

    public static initialize(gc: GlobalConfigs){
        //if (GlobalConfigs.env === 'PROD'){
            console.log('Initializing Google analytics with ID : '+gc.googleAnalyticsID);
            GoogleAnalytics.enableUncaughtExceptionReporting(true);
            GoogleAnalytics.debugMode();
            GoogleAnalytics.startTrackerWithId(gc.googleAnalyticsID);
            GoogleAnalytics.setAllowIDFACollection(true);
            Configs.GA_INITIALIZED = true;
        //}
    }

    public static trackView(screen:string):void{
        //  Using timeout as a workaround
        if(Configs.GA_INITIALIZED){
            setTimeout(function () {
                GoogleAnalytics.trackView(screen).then(() => {
                    console.log("trackView : "+screen);
                });
            }, 20000);
        }

    }

}