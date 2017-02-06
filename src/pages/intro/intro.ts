import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {HomePage} from "../home/home";

@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html'
})
export class IntroPage {

  sliderOptions: any;

  constructor(public navCtrl: NavController) {

    this.sliderOptions = {
      pager: true
    };

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad IntroPage');
  }

  goToHome(){
    this.navCtrl.setRoot(HomePage);
  }

}