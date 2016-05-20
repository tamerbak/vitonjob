import {Injectable} from 'angular2/core';
import {Http, Headers, RequestOptions} from 'angular2/http';

/**
	* @author Amal ROCHD
	* @description web service access point for loading data from server
	* @module Authentication
*/

@Injectable()
export class LoadListService {
	constructor(http: Http) {
		this.http = http;
	}
	
	/**
		* @description load a list of countries with their codes
		* @return JSON results in the form of {country name, country code}
	*/
	loadCountries(){
		let url = 'http://vps259989.ovh.net:8080/vitonjobv1/api/sql';
        var sql = "SELECT nom, indicatif_telephonique FROM user_pays ORDER BY nom";


	    /*
	    * Performing search directly on server
	    */
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
	            // we've got back the raw data, now generate the core schedule data
	            // and save the data for later reference
	            this.data = data;
	            console.log("Newly loaded data" + this.data);
	            resolve(this.data);
	          });
	    });
	}
}