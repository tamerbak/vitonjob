import {Injectable} from 'angular2/core';
import {Http, Headers, RequestOptions} from 'angular2/http';
import {Storage, SqlStorage} from 'ionic-angular';

/**
 * @author Amal ROCHD
 * @description web service access point for user authentication and inscription
 * @module Authentication
 */

@Injectable()
export class AuthenticationService {
	db : any;
	
	constructor(http: Http) {
		this.http = http;
		this.db = new Storage(SqlStorage);
	}
	
	/**
   * @description Insert a user_account if it does not exist
   * @param email, phone, password, role
   * @return JSON results in the form of user accounts
     */
	authenticate(email: string, phone: number, password, role: string){
		//Prepare the request
		var login =
		{
			'class': 'com.vitonjob.callouts.auth.AuthToken',
			'email': email,
			'telephone': "+" + phone,
			'password': password,
			'role': role
		};
		login = JSON.stringify(login);
		var encodedLogin = btoa(login);
		var dataLog = {
			'class': 'fr.protogen.masterdata.model.CCallout',
			'id': 96,//95,//74,//71,//70,//67,//49,
			'args': [{
				'class': 'fr.protogen.masterdata.model.CCalloutArguments',
				label: 'requete authentification',
				value: encodedLogin
			}]
		};
		let url = 'http://vps259989.ovh.net:8080/vitonjobv1/api/callout';
        let body = JSON.stringify(dataLog);
		
	    return new Promise(resolve => {
			let headers = new Headers();
			headers.append("Content-Type", 'application/json');
			this.http.post(url, body, {headers:headers})
			.map(res => res.json())
			.subscribe(data => {
	            this.data = data;
	            console.log(this.data);
	            resolve(this.data);
			});
		})
	}
	
	/**
		* @description Update user_account with the new device token and accountid
		* @param token, accountId
	*/
	insertToken(token, accountId){
		let url = 'http://vps259989.ovh.net:8080/vitonjobv1/api/sql';
        var sql = "Update user_account set device_token = '" + token + "' where pk_user_account = '" + accountId + "';";
		
	    // don't have the data yet
	    return new Promise(resolve => {
			// We're using Angular Http provider to request the data,
			// then on the response it'll map the JSON data to a parsed JS object.
			// Next we process the data and resolve the promise with the new data.
			let headers = new Headers();
			headers.append("Content-Type", 'text/plain');
			this.http.post(url, sql, {headers:headers})
			.map(res => res.json())
			.subscribe(
			data => console.log("device token bien inséré pour l'utilisateur " + accountId),
			err => console.log(err)
			)
			});
	}
	
	
	//Not sur if this 2 methods should be here or in a separate service
	setObj(key, obj){
		this.db.set(key, JSON.stringify(obj));
	}
	
	getObj(key){
		return this.db.get(key).then((res) => {
			console.log(res);
			}, (err) => {
			console.log('Error: ', err);
		});
	}
}
