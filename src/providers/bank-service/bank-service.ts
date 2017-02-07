import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import "rxjs/add/operator/map";
import {Configs} from "../../configurations/configs";

/*
 Generated class for the BankService provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class BankService {
    data: any = null;

    constructor(public http: Http) {
    }

    loadBankAccount(id, table, projectTarget) {
        let sql = "select nom_de_banque, detenteur_du_compte, iban, bic " +
            "from user_coordonnees_bancaires where " + table + "=" + id;
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.data = data.data;
                    resolve(this.data);
                });
        });
    }

    saveBankAccount(id, table, voidAccount, bank) {
        let sql = "";
        let estEmployeur = table == "fk_user_jobyer" ? "NON" : "OUI";
        if (voidAccount)
            sql = "insert into user_coordonnees_bancaires (iban, bic, nom_de_banque, detenteur_du_compte, est_employeur, " + table + ") values " +
                "('" + bank.iban + "', '" + bank.bic + "', '" + bank.nom_de_banque + "', '" + bank.detenteur_du_compte + "', '" + estEmployeur + "', " + id + ")";
        else
            sql = "update user_coordonnees_bancaires set iban='" + bank.iban + "', bic='" + bank.bic + "', nom_de_banque='" + bank.nom_de_banque + "', detenteur_du_compte='" + bank.detenteur_du_compte + "' where " + table + "=" + id;

        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.data = data;
                    resolve(this.data);
                });
        });
    }

}

