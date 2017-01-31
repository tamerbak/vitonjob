import {Injectable} from '@angular/core';
import {GoogleAnalytics, AppVersion} from 'ionic-native';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";

@Injectable()
export class GoogleAnalyticsService {

    eventsNotSent:any[] = new Array();
    trackerInitialized:boolean = false;

    public static initialize(gc: GlobalConfigs){
        console.log('Initializing Google analytics with ID : '+gc.googleAnalyticsID);
        GoogleAnalytics.enableUncaughtExceptionReporting(true);
        GoogleAnalytics.debugMode();
        GoogleAnalytics.startTrackerWithId(gc.googleAnalyticsID);
        GoogleAnalytics.setAllowIDFACollection(true);
        Configs.GA_INITIALIZED = true;
            /*.then(() => {
                try{
                    console.log('Google analytics is starting up');
                    AppVersion.getVersionNumber().then(_version => {
                        GoogleAnalytics.setAppVersion(_version);

                    });
                    Configs.GA_INITIALIZED = true;
                    console.log('Google analytics is ready');

                }catch(e){
                   console.log(e);
                };

            })
            .catch(e => {
                console.log('Error starting Google Analytics', e);
            });*/
    }

    public static trackView(screen:string):void{
        if(Configs.GA_INITIALIZED){
            setTimeout(function () {
                GoogleAnalytics.trackView(screen).then(() => {
                    console.log("trackView : "+screen);
                });
            }, 20000);
        }

        /*if (Configs.GA_INITIALIZED){
            GoogleAnalytics.trackView(screen);
        }*/
    }

}