import {Injectable} from "@angular/core";
import {Platform, ToastController} from "ionic-angular";

declare var Connection;
declare var navigator;
declare var cordova;

/**
 * @author daoudi amine
 * @description service to verify the network stat
 * @module Network
 */
@Injectable()
export class NetworkService {
    networkStat: String;
    changeDetRef:any;

    constructor(private platform: Platform, public toast:ToastController) {
        this.networkStat = "";
    }

    setNetworkStat(value) {
        this.networkStat = value;
    }

    checkInitNetwork() {
        if (!navigator.connection.type == Connection.NONE) {
            let toast = this.toast.create({
                message: "Vous n'êtes pas connectés à Internet",
                duration: 7000
            });
            toast.present();
            this.changeDetRef.detectChanges();
            //this.setNetworkStat("Vous n'êtes pas connecté.");
        } else {
            //this.setNetworkStat("");
        }
    }


    updateNetworkStat() {
        //if (cordova) {
            this.platform.ready().then(() => {

                if (!navigator.connection.type == Connection.NONE) {
                    let toast = this.toast.create({
                        message: "Vous n'êtes pas connectés à Internet",
                        duration: 7000
                    });
                    toast.present();
                    this.changeDetRef.detectChanges();
                    //this.setNetworkStat("Vous n'êtes pas connecté.");
                } else {
                    //this.setNetworkStat("");
                }
            });
        //}
    }

}

