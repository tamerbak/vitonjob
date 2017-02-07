import {Injectable} from "@angular/core";
import {} from "ionic-angular";
import {Storage} from "@ionic/storage";

/**
 * @author Amal ROCHD
 * @description web service access point for stocking and accessing sql storage variables
 */

@Injectable()
export class SqlStorageService {


    constructor(public db:Storage) {

    }

    setObj(key, obj) {
        this.db.set(key, JSON.stringify(obj));
    }

    getObj(key) {
        return this.db.get(key).then((res) => {
            console.log(res);
        }, (err) => {
            console.log('Error: ', err);
        });
    }
}
