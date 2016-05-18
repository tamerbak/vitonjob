import { Injectable } from 'angular2/core';
//import { DOM } from 'angular2/src/platform/dom/dom_adapter';
import {BrowserDomAdapter} from 'angular2/platform/browser';

@Injectable()
export class ValidationDataService {
	dom:BrowserDomAdapter;
	constructor() {
		this.dom = new BrowserDomAdapter();
	}
	
	checkEmail(id) {
      var EMAIL_REGEXP = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
	  //console.log(id);
	  //console.log(document.querySelector('#' + id));
      //elm = angular.element(document.querySelector('#' + id));
	  //var elm = DOM.query($('#' + id));
      //console.log(elm);
      var isMatchRegex = EMAIL_REGEXP.test(id);
      console.log("Email : " + id);

      if (isMatchRegex) {
		this.dom.removeClass(this.dom.query("email"), 'has-warning').addClass(this.dom.query("email"), 'has-success');
        //elm.parent().removeClass('has-warning').addClass('has-success');
      }
      else if (isMatchRegex == false || id == '') {
        this.dom.removeClass(this.dom.query("email"), 'has-success').addClass(this.dom.query("email"), 'has-warning');
        //elm.parent().removeClass('has-success').addClass('has-warning');
      }
    }
}