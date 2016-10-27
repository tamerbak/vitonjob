import {Component} from "@angular/core";
import {NavController, ViewController, NavParams} from "ionic-angular";


@Component({
    templateUrl: 'build/pages/modal-gallery/modal-gallery.html',
})
export class ModalGalleryPage {
    scanUri: string;

    constructor(private nav: NavController, private viewCtrl: ViewController, params: NavParams) {
        this.scanUri = params.get('scanUri');// params.data.scanUri;
    }

    /**
     * @description close modal
     */
    close() {
        this.viewCtrl.dismiss();
    }

}
