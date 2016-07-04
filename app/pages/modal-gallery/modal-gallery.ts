import { Component } from '@angular/core';
import {Modal, NavController,ViewController, NavParams} from 'ionic-angular';

/*
  Generated class for the ModalGalleryPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/modal-gallery/modal-gallery.html',
})
export class ModalGalleryPage {
  scanUri:string;
  constructor(private nav: NavController,  private viewCtrl: ViewController, params: NavParams) {
    this.scanUri = params.get('scanUri');// params.data.scanUri;
  }

/**
    * @description close modal 
 */
close() {
    this.viewCtrl.dismiss();
  }

}
