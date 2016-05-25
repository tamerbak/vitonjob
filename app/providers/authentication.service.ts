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
			'id': 96,
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
		* @param title, lastname, firstname, numSS, cni, nationalityId, roleId, birthdate, birthplace, projectTarget
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
		* @description update employer and jobyer civility information
		* @param title, lastname, firstname, companyname, siret, ape, roleId, entrepriseId, projectTarget
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
	
	/**
		* @description update employer and jobyer personal address
		* @param roleId, address, projectTarget
	*/
	updateEmployerPersonalAddress(roleId, address, projectTarget){
		//formating the address
		//street
		var street = this.getStreetFromGoogleAddress(address);
		//  zip code
		var cp = this.getZipCodeFromGoogleAddress(address);
		//  city
		var ville = this.getCityFromGoogleAddress(address);
		//  country
		var pays = this.getCountryFromGoogleAddress(address)
		
		//  Now we need to save the address
		var addressData = {
			'class': 'com.vitonjob.localisation.AdressToken',
			'street': street,
			'cp': cp,
			'ville': ville,
			'pays': pays,
			'role': (projectTarget == 'employer' ? 'employeur' : projectTarget),
			'id': roleId,
			'type': 'personnelle'
		};
		addressData = JSON.stringify(addressData);
		var encodedAddress = btoa(addressData);
		var data = {
			'class': 'fr.protogen.masterdata.model.CCallout',
			'id': 29,
			'args': [{
				'class': 'fr.protogen.masterdata.model.CCalloutArguments',
				label: 'Adresse',
				value: encodedAddress
			}]
		};
		var stringData = JSON.stringify(data);
		
		//  Init project parameters
		this.configuration = Configs.setConfigs(projectTarget);
		return new Promise(resolve => {
			let headers = new Headers();
			headers.append("Content-Type", 'application/json');
			this.http.post(this.configuration.calloutURL, stringData, {headers:headers})
			.map(res => res.json())
			.subscribe(data => {
	            this.data = data;
	            resolve(this.data);
			});
		});
	}
	
	/**
		* @description update employer and jobyer job address
		* @param id  : entreprise id for employer role and role id for jobyer role, address, projectTarget
	*/
	updateEmployerJobAddress(id, address, projectTarget){
		//formating the address
		//street
		var street = this.getStreetFromGoogleAddress(address);
		//  zip code
		var cp = this.getZipCodeFromGoogleAddress(address);
		//  city
		var ville = this.getCityFromGoogleAddress(address);
		//  country
		var pays = this.getCountryFromGoogleAddress(address)
		
		//  Now we need to save the address
		var addressData = {
			'class': 'com.vitonjob.localisation.AdressToken',
			'street': street,
			'cp': cp,
			'ville': ville,
			'pays': pays,
			'role': (projectTarget == 'employer' ? 'employeur' : projectTarget),
			'id': id,
			'type': 'travaille'
		};
		addressData = JSON.stringify(addressData);
		var encodedAddress = btoa(addressData);
		var data = {
			'class': 'fr.protogen.masterdata.model.CCallout',
			'id': 29,
			'args': [{
				'class': 'fr.protogen.masterdata.model.CCalloutArguments',
				label: 'Adresse',
				value: encodedAddress
			}]
		};
		var stringData = JSON.stringify(data);
		
		//  Init project parameters
		this.configuration = Configs.setConfigs(projectTarget);
		return new Promise(resolve => {
			let headers = new Headers();
			headers.append("Content-Type", 'application/json');
			this.http.post(this.configuration.calloutURL, stringData, {headers:headers})
			.map(res => res.json())
			.subscribe(data => {
	            this.data = data;
	            resolve(this.data);
			});
		});
	}
	
	/**
		* @description function to get the street name from an address returned by the google places service
		* @param address
	*/
	getStreetFromGoogleAddress(address){
		var streetIndex = address.indexOf("street-address");
		var street = '';
		if (streetIndex > 0) {
			streetIndex = streetIndex + 16;
			var sub = address.substring(streetIndex, address.length - 1);
			var endStreetIndex = sub.indexOf('</');
			street = sub.substring(0, endStreetIndex);
		}
		return street;
	}
	
	/**
		* @description function to get the zip code from an address returned by the google places service
		* @param address
	*/
	getZipCodeFromGoogleAddress(address){
		var cpIndex = address.indexOf("postal-code");
		var cp = '';
		if (cpIndex > 0) {
			cpIndex = cpIndex + 13;
			var subcp = address.substring(cpIndex, address.length - 1);
			var endCpIndex = subcp.indexOf('</');
			cp = subcp.substring(0, endCpIndex);
		}
		return cp;
	}
	
	/**
		* @description function to get the city name from an address returned by the google places service
		* @param address
	*/
	getCityFromGoogleAddress(address){
		var villeIndex = address.indexOf("locality");
		var ville = '';
		if (villeIndex > 0) {
			villeIndex = villeIndex + 10;
			var subville = address.substring(villeIndex, address.length - 1);
			var endvilleIndex = subville.indexOf('</');
			ville = subville.substring(0, endvilleIndex);
		}
		return ville;
	}
	
	/**
		* @description function to get the country name from an address returned by the google places service
		* @param address
	*/
	getCountryFromGoogleAddress(address){
		var paysIndex = address.indexOf("country-name");
		var pays = '';
		if (paysIndex > 0) {
			paysIndex = paysIndex + 14;
			var subpays = address.substring(paysIndex, address.length - 1);
			var endpaysIndex = subpays.indexOf('</');
			pays = subpays.substring(0, endpaysIndex);
		}
		return pays;
	}
	
	setObj(key, obj){
		this.db.set(key, JSON.stringify(obj));
	}
	
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