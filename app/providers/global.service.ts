import { Injectable } from '@angular/core';
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
	showAlertValidation(title, msg){
		let alert = Alert.create({
			title: title,
			message: msg,
			buttons: ['OK']
		});
		this.nav.present(alert);
	}
}
