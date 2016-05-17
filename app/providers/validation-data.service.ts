import { Injectable } from 'angular2/core';
import {Http, Headers, RequestOptions} from 'angular2/http';


@Injectable()
export class ValidationDataService {
	constructor(http: Http) {
		this.http = http;
	}
	
	checkEmail(id) {
      var EMAIL_REGEXP = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
	  
      elm = angular.element(document.querySelector('#' + id));
      var isMatchRegex = EMAIL_REGEXP.test(elm.val());
      console.log("Email : " + elm.val());

      if (isMatchRegex) {
        elm.parent().removeClass('has-warning').addClass('has-success');
      }
      else if (isMatchRegex == false || elm.val() == '') {
        elm.parent().removeClass('has-success').addClass('has-warning');
      }
    };
}