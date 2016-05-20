import { Injectable } from 'angular2/core';
import {Alert, NavController} from 'ionic-angular';

/**
	* @author Amal ROCHD
	* @description a service for centralizing calls of different methods, like showing alerts
*/

@Injectable()
export class GlobalService {
	constructor(public nav: NavController) {
		
	}
	
	/**
		* @description show validation alerts with ok button
		* @param msg to show in the alert
	*/
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
