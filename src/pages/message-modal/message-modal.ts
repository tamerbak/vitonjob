import { Component } from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {GMessage} from "../../dto/gmessage";

@Component({
  selector: 'page-message-modal',
  templateUrl: 'message-modal.html'
})
export class MessageModalPage {
  
  private title : string;
  private content : string;
  
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController) {
    let msg : GMessage = navParams.get('message');
    this.title = msg.titre;
    this.content = msg.contenu;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MessageModalPage');
  }

  close(){
    this.viewCtrl.dismiss();
  }
}
