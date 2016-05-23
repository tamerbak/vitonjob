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
			'role': (projectTarget == 'employer' ? 'employeur' : projectTarget) 
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
	
	/**
		* @description update jobyer information
		* @param title, lastname, firstname, num securite social, cni, nationalityId, roleId, birthdate, birthplace
	*/
	updateJobyerCivility(title, lastname, firstname, numSS, cni, nationalityId, roleId, birthdate, birthplace, projectTarget){
		//  Init project parameters
		this.configuration = Configs.setConfigs(projectTarget);
		
		//split the birth date into a table to store day, month and year
		var fromStringDate = birthdate.split("/");
		var toStringDate = fromStringDate[2].toString() + "-" + (fromStringDate[1]).toString() + "-" + fromStringDate[0].toString();
		var sql = "";
		//building the sql request 
		if (nationalityId){
			sql = "update user_jobyer set  " +
			"titre='" + title + "', " +
			"nom='" + lastname + "', " +
			"prenom='" + firstname + "', " +
			"numero_securite_sociale='" + numSS + "', " +
			"cni='" + cni + "', " +
			"date_de_naissance ='"+ toStringDate +"'," +
			"lieu_de_naissance ='" + birthplace + "', " +
			"fk_user_nationalite ='" + nationalityId + "' " +
			"where pk_user_jobyer ='" + roleId + "';";
			} else {
			sql = "update user_jobyer set  " +
			"titre='" + title + "', " +
			"nom='" + lastname + "', " +
			"prenom='" + firstname + "', " +
			"numero_securite_sociale='" + numSS + "', " +
			"cni='" + cni + "', " +
			"date_de_naissance ='"+ toStringDate +"'," +
			"lieu_de_naissance ='" + birthplace + "' " +
			"where pk_user_jobyer ='" + roleId + "';";
		}
		
		return new Promise(resolve => {
			let headers = new Headers();
			headers.append("Content-Type", 'text/plain');
			this.http.post(this.configuration.sqlURL, sql, {headers:headers})
			.map(res => res.json())
			.subscribe(data => {
	            this.data = data;
	            console.log(this.data);
	            resolve(this.data);
			});
		})
	}
	
	/**
		* @description update employer information
		* @param title, lastname, firstname, companyname, siret, ape, roleId, entrepriseId
	*/
	updateEmployerCivility(title, lastname, firstname, companyname, siret, ape, roleId, entrepriseId, projectTarget: string){
		//  Init project parameters
		this.configuration = Configs.setConfigs(projectTarget);
		
		var sql = "update user_employeur set ";
		sql = sql + " titre='" + title + "', ";
		sql = sql + " nom='" + lastname + "', prenom='" + firstname + "' where pk_user_employeur=" + roleId + ";";
		sql = sql + " update user_entreprise set nom_ou_raison_sociale='" + companyname + "', ";
		sql = sql + "siret='" + siret + "', ";
		//sql = sql + "urssaf='" + numUrssaf + "', ";
		sql = sql + "ape_ou_naf='" + ape + "' where  pk_user_entreprise=" + entrepriseId;
		
		return new Promise(resolve => {
			let headers = new Headers();
			headers.append("Content-Type", 'text/plain');
			this.http.post(this.configuration.sqlURL, sql, {headers:headers})
			.map(res => res.json())
			.subscribe(data => {
	            this.data = data;
	            console.log(this.data);
	            resolve(this.data);
			});
		})
	}
	
	
	//Not sur if this 2 methods should be here or in a separate service
	setObj(key, obj){
		this.db.set(key, JSON.stringify(obj));
	}
	
	/*getObj(key){
		return this.db.get(key).then((res) => {
		this.res = res;
		console.log(res);
		}, (err) => {
		console.log('Error: ', err);
		});
	}*/
	getObj(key) {
		return new Promise((resolve, reject) => {
			this.db.get(key).then((value) => {
				resolve(value);
				}).catch( error => {
				reject(error);
			})
		});
	}
	
}
