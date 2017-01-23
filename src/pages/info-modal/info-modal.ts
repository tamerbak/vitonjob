import { Component } from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';

@Component({
    selector: 'page-info-modal',
    templateUrl: 'info-modal.html'
})
export class InfoModalPage {

    reference: any;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public viewCtrl: ViewController) {
        this.reference = navParams.get('reference');
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad InfoModalPage');
    }

    closeModal(){
        this.viewCtrl.dismiss();
    }

    call() {
        window.location.href = 'tel:' + this.reference.phone;
    }

    sendEmail() {
        window.location.href = 'mailto:' + this.reference.email;
    }
}
