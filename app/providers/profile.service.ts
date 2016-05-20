import { Injectable } from 'angular2/core';
import {Http, Headers, RequestOptions} from 'angular2/http';

/**
	* @author Amal ROCHD
	* @description web service access point for updating user profile information
	* @module Authentication
*/

@Injectable()
export class ProfileService {
	constructor(http: Http) {
		this.http = http;
	}
	
	/**
		* @description update user information
		* @param title, lastname, firstname, num securite social, cni, nationalityId, roleId, birthdate, birthplace
	*/
	updateEmployerCivility(title, lastname, firstname, numSS, cni, nationalityId, roleId, birthdate, birthplace){
		//split the birth date into a table to store day, month and year
		var fromStringDate = birthdate.split("/");
		var toStringDate = fromStringDate[2].toString() + "-" + (fromStringDate[1]).toString() + "-" + fromStringDate[0].toString();
		var sql = "";
		//building the sql request 
		if (nationalityId){
			sql = "update user_jobyer set  " +
			"titre='" + titile + "', " +
			"nom='" + lastname + "', " +
			"prenom='" + firstname + "', " +
			"numero_securite_sociale='" + numSS + "', " +
			"cni='" + cni + "', " +
			"date_de_naissance ='"+ toStringDate +"'," +
			"lieu_de_naissance ='" + dateplace + "', " +
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
		
		let url = 'http://vps259989.ovh.net:8080/vitonjobv1/api/sql';
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