import {Injectable} from '@angular/core';
import {Platform, Toast} from 'ionic-angular';
import {Http, Headers} from '@angular/http';



/**
 * @author daoudi amine
 * @description service to verify the network stat
 * @module Network
 */
@Injectable()
export class NetworkService {
    networkStat:String;
    constructor(private platform:Platform) {
        this.networkStat = "";
    }

    setNetworkStat(value) {
        this.networkStat = value;
    }

   checkInitNetwork(){
        if(!navigator.connection.type == Connection.NONE){
            let toast = Toast.create({
                message: "Vous n'êtes pas connectés à Internet",
                duration: 5000
            });
            this.nav.present(toast);
            this.changeDetRef.detectChanges();
            //this.setNetworkStat("Vous n'êtes pas connecté.");
        }else{
            //this.setNetworkStat("");
        }
    }


    updateNetworkStat() {
        if(window.cordova){
            this.platform.ready().then(() => {
                debugger;
                if(!navigator.connection.type == Connection.NONE){
                    let toast = Toast.create({
                        message: "Vous n'êtes pas connectés à Internet",
                        duration: 5000
                    });
                    this.nav.present(toast);
                    this.changeDetRef.detectChanges();
                    //this.setNetworkStat("Vous n'êtes pas connecté.");
                }else{
                    //this.setNetworkStat("");
                }
            });
        }
    }
  
}

