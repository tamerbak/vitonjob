import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Configs} from "../configurations/configs";

/**
 * @author Amal ROCHD
 * @description web service access point for loading data from server
 * @module Authentication
 */

@Injectable()
export class LoadListService {
    configuration;
    data: any;
    http: any;

    constructor(http: Http) {
        this.http = http;
    }

    /**
     * @description load a list of countries with their codes
     * @return JSON results in the form of {country name, country code}
     */
    loadCountries(projectTarget) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);
        var sql = "SELECT pk_user_pays as id, nom, indicatif_telephonique FROM user_pays ORDER BY nom";

        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();

            this.http.post(this.configuration.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {
                    this.data = data;
                    resolve(this.data);
                });
        });
    }

    /**
     * @description load a list of nationalities
     * @return JSON results
     */
    loadNationalities(projectTarget) {
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);
        var sql = "select pk_user_nationalite, libelle from user_nationalite where dirty='N' order by libelle asc";

        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();

            this.http.post(this.configuration.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
        })
    }

    loadConventions() {
        let sql = "select pk_user_convention_collective as id, code, libelle from user_convention_collective";
        console.clear();
        console.log(sql);
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();

            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {
                    this.data = [];
                    if (data.data)
                        this.data = data.data;
                    resolve(this.data);
                });
        });
    }

    loadQualities(type: string) {
        //  Init project parameters
        var sql = "select pk_user_indispensable as id, libelle as libelle from user_indispensable where UPPER(dirty) ='N' and type='" + type + "'";
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {
                    resolve(data);
                });
        });
    }

    loadLanguages(){
        var sql = "select pk_user_langue as id, libelle from user_langue where UPPER(dirty) ='N'";
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {
                    resolve(data);
                });
        });
    }
}
