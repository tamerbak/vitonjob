import { Injectable } from 'angular2/core';
import {Http, Headers, RequestOptions} from 'angular2/http';

/**
	* @author Amal ROCHD
	* @description web service access point for searching users by criteria
	* @module Authentication
*/
 
@Injectable()
export class DataProviderService {
	constructor(http: Http) {
		this.http = http;
	}
	
	/**
		* @description get user information by his phone and role
		* @param phone, role
		* @return JSON results in the form of user accounts
	*/
	getUserByPhone(tel, role){
		let url = 'http://vps259989.ovh.net:8080/vitonjobv1/api/sql';
		var sql = "select pk_user_account, email from user_account where telephone = '"+tel+"' and role = '" + role +"'";


	    if (this.data) {
	      // already loaded data
	      return Promise.resolve(this.data);
	      console.log("already loaded data" + this.data);
	    }


	    // don't have the data yet
	    return new Promise(resolve => {
	      let headers = new Headers();
	      headers.append("Content-Type", 'text/plain');
	      this.http.post(url, sql, {headers:headers})
	          .map(res => res.json())
	          .subscribe(data => {
	            this.data = data;
	            console.log("Newly loaded data" + this.data);
	            resolve(this.data);
	          });
	    })
	}
	
	/**
		* @description get user information by his mail and role
		* @param mail, role
		* @return JSON results in the form of user accounts
	*/
	getUserByMail(mail, role){
		let url = 'http://vps259989.ovh.net:8080/vitonjobv1/api/sql';
		var sql = "select pk_user_account, email from user_account where email = '"+mail+"' and role = '" + role +"'";

	    // don't have the data yet
	    return new Promise(resolve => {
	      let headers = new Headers();
	      headers.append("Content-Type", 'text/plain');
	      this.http.post(url, sql, {headers:headers})
	          .map(res => res.json())
	          .subscribe(data => {
	            this.data = data;
	            console.log("Newly loaded data" + this.data);
	            resolve(this.data);
	          });
	    })
	}
}