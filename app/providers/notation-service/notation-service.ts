import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";
import "rxjs/add/operator/map";
import {Configs} from "../../configurations/configs";

/*
 Generated class for the NotationService provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class NotationService {
    data: any;
    score: any;

    constructor(private http: Http) {
        this.data = null;
    }

    loadNotation(user) {
        let table = user.estEmployeur ? 'user_employeur' : 'user_jobyer';
        let id = user.estEmployeur ? user.employer.id : user.jobyer.id;
        let sql = "select notes from " + table + " where pk_" + table + "=" + id;
        if (user.estEmployeur)
            sql = 'select avg(notes_employeur) as notes from user_contrat where fk_user_entreprise in (select pk_user_entreprise from user_entreprise where fk_user_employeur=' + id + ') and notes_employeur>0';
        else
            sql = 'select avg(notes_jobyer) as notes from user_contrat where fk_user_jobyer =' + id + ' and notes_jobyer>0';
        console.log(sql);
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));
                    this.score = 0;
                    if (data.data && data.data.length > 0) {
                        this.score = data.data[0].notes;
                    }
                    resolve(this.score);
                });
        });
    }

    loadContractNotation(contract, projectTarget) {
        let col = projectTarget == 'jobyer' ? 'notes_employeur' : 'notes_jobyer';
        let sql = 'select ' + col + ' as notes from user_contrat where pk_user_contrat=' + contract.pk_user_contrat;
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));
                    this.score = 0;
                    if (data.data && data.data.length > 0) {
                        this.score = Math.round(data.data[0].notes);
                    }
                    resolve(this.score);
                });
        });
    }

    saveContractNotation(contract, projectTarget, rating) {
        let col = projectTarget == 'jobyer' ? 'notes_employeur' : 'notes_jobyer';
        let sql = "update user_contrat set " + col + "=" + rating + " where pk_user_contrat=" + contract.pk_user_contrat;
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));
                    this.score = rating;

                    resolve(this.score);
                });
        });
    }

    loadSearchNotation(estEmployeur, id) {
        let sql = "";
        if (estEmployeur)
            sql = 'select avg(notes_employeur) as notes from user_contrat where fk_user_entreprise in (select fk_user_entreprise from user_offre_entreprise where pk_user_offre_entreprise=' + id + ') and notes_employeur>0';
        else
            sql = 'select avg(notes_jobyer) as notes from user_contrat where fk_user_jobyer in (select fk_user_jobyer from user_offre_jobyer where pk_user_offre_jobyer=' + id + ') and notes_jobyer>0';
        console.log(sql);
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    console.log(JSON.stringify(data));
                    this.score = 0;
                    if (data.data && data.data.length > 0) {
                        this.score = data.data[0].notes;
                    }
                    resolve(this.score);
                });
        });
    }
}

