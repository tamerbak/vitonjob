import {Injectable} from 'angular2/core';
import {Http, Headers, RequestOptions} from 'angular2/http';


@Injectable()
export class LoadListService {
	constructor(http: Http) {
		this.http = http;
	}
	
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
	      // We're using Angular Http provider to request the data,
	      // then on the response it'll map the JSON data to a parsed JS object.
	      // Next we process the data and resolve the promise with the new data.
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