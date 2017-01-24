import {Component} from '@angular/core';
import {NavController, ViewController, NavParams} from 'ionic-angular';


@Component({
  templateUrl: 'modal-help.html',
  selector: 'modal-help'
})
export class ModalHelpPage {

  public content:any;

  constructor(public nav:NavController, public viewCtrl:ViewController, public params:NavParams) {

    this.content = params.get('content');

  }

  closeModal() {
    this.viewCtrl.dismiss();
  }
}
