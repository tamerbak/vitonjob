import {Injectable} from "@angular/core";
import {AlertController} from "ionic-angular";

/**
 * @author Amal ROCHD
 * @description a service for centralizing calls of different methods, like showing alerts
 */

@Injectable()
export class GlobalService {
    constructor(public alert:AlertController) {

    }

    /**
     * @description show validation alerts with ok button
     * @param msg to show in the alert
     */
    showAlertValidation(title, msg) {
        let alert = this.alert.create({
            title: title,
            message: msg,
            buttons: ['OK']
        });
        alert.present();
    }
}
