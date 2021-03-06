import {Component} from "@angular/core";
import {NavController, ViewController, NavParams} from "ionic-angular";
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  templateUrl: 'modal-gallery.html',
})
export class ModalGalleryPage {
  public scanUri: string;

  constructor(private nav: NavController,
              private viewCtrl: ViewController,
              params: NavParams,
              private domSanitizationService: DomSanitizer) {
    this.scanUri = params.get('scanUri');// params.data.scanUri;
  }

  /**
   * @description close modal
   */
  close() {
    this.viewCtrl.dismiss();
  }

}
