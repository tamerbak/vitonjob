import {Injectable} from '@angular/core';
import {Platform} from 'ionic-angular';
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

    getNetworkStat() {
        return this.networkStat;
    }
  
    updateNetworkStat() {
        if(window.cordova){
            this.platform.ready().then(() => {                
                if(navigator.connection.type == Connection.NONE){
                    this.setNetworkStat("Vous n'êtes pas connecté.");
                }else{
                    this.setNetworkStat("");
                }
            });
        }
    }
  
}

