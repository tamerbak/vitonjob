import { Injectable } from 'angular2/core';
import {Alert, NavController} from 'ionic-angular';



@Injectable()
export class GlobalService {
	constructor(public nav: NavController) {
		
	}
	
	showAlertValidation(msg){
		let alert = Alert.create({
			//title: "<div class='vimgBar'><img src='img/vit1job-mini2.png'></div>",
			title: "",
			subTitle: msg,
			buttons: ['OK']
		});
		this.nav.present(alert);
	}
}