import {Injectable} from '@angular/core';
import {Storage, SqlStorage} from 'ionic-angular';

/**
 * @author Amal ROCHD
 * @description web service access point for stocking and accessing sql storage variables
 */

@Injectable()
export class SqlStorageService {
	db : any;
	
	constructor() {
		this.db = new Storage(SqlStorage);
	}
	
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
