import { Injectable } from 'angular2/core';
//import { DOM } from 'angular2/src/platform/dom/dom_adapter';
import {BrowserDomAdapter} from 'angular2/platform/browser';

/**
	* @author Amal ROCHD
	* @description service for validating different data
*/

@Injectable()
export class ValidationDataService {
	dom:BrowserDomAdapter;
	constructor() {
		this.dom = new BrowserDomAdapter();
	}
	
	/**
		* @description check if an email is valid
		* @param id of the email component
	*/
	checkEmail(email) {
      var EMAIL_REGEXP = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
      var isMatchRegex = EMAIL_REGEXP.test(email);
      console.log("Email : " + email);
	  console.log("is valid : " + isMatchRegex);
	  return isMatchRegex;
    }
}
