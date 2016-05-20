import {Injectable} from 'angular2/core';
import {Http, Headers, RequestOptions} from 'angular2/http';
import {Storage, SqlStorage} from 'ionic-angular';
import {Configs} from '../configurations/configs';


/**
 * @author Amal ROCHD
 * @description web service access point for user authentication and inscription
 * @module Authentication
 */

@Injectable()
export class AuthenticationService {
	db : any;
	configuration;
	
	constructor(http: Http) {
		this.http = http;
		this.db = new Storage(SqlStorage);
	}
	
	/**
   * @description Insert a user_account if it does not exist
   * @param email, phone, password, role
   * @return JSON results in the form of user accounts
     */
	authenticate(email: string, phone: number, password, projectTarget: string){
		//  Init project parameters
		this.configuration = Configs.setConfigs(projectTarget);
		
		//Prepare the request
		var login =
		{
			'class': 'com.vitonjob.callouts.auth.AuthToken',
			'email': email,
			'telephone': "+" + phone,
			'password': password,
			'role': projectTarget
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
		let body = JSON.stringify(dataLog);
		
	    return new Promise(resolve => {
			let headers = new Headers();
			headers.append("Content-Type", 'application/json');
			this.http.post(this.configuration.calloutURL, body, {headers:headers})
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
	insertToken(token, accountId, projectTarget){
		//  Init project parameters
		this.configuration = Configs.setConfigs(projectTarget);
		
		var sql = "Update user_account set device_token = '" + token + "' where pk_user_account = '" + accountId + "';";
		
	    return new Promise(resolve => {
			let headers = new Headers();
			headers.append("Content-Type", 'text/plain');
			this.http.post(this.configuration.sqlURL, sql, {headers:headers})
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