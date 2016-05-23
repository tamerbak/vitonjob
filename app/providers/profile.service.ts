import { Injectable } from 'angular2/core';
import {Http, Headers, RequestOptions} from 'angular2/http';
import {Configs} from '../configurations/configs';

/**
	* @author Amal ROCHD
	* @description web service access point for updating user profile information
	* @module Authentication
*/

@Injectable()
export class ProfileService {
	configuration;
	constructor(http: Http) {
		this.http = http;
	}
	
	
}	