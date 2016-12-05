import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Configs} from "../configurations/configs";

/**
 * @author Amal ROCHD
 * @description web service access point for searching users by criteria
 * @module Authentication
 */

@Injectable()
export class DataProviderService {
    configuration;
    data:any;

    constructor(public http: Http) {

    }

    /**
     * @description get user information by his phone and role
     * @param phone, role
     * @return JSON results in the form of user accounts
     */
    getUserByPhone(tel, role) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(role);
        var sql = "select pk_user_account, email, role from user_account where telephone = '" + tel + "'";
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(this.configuration.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {
                    this.data = data;
                    console.log("Newly loaded data" + this.data);
                    resolve(this.data);
                });
        })
    }

    /**
     * @description get user information by his mail and role
     * @param mail, role
     * @return JSON results in the form of user accounts
     */
    getUserByMail(mail, role) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(role);

        role = (role === 'employer') ? 'employeur' : role;
        var sql = "select pk_user_account, email, telephone, role from user_account where LOWER(email) = lower_unaccent('" + mail + "')";

        // don't have the data yet
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(this.configuration.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {
                    this.data = data;
                    console.log("Newly loaded data" + this.data);
                    resolve(this.data);
                });
        })
    }

}
