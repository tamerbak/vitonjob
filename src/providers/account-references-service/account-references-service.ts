import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import {Configs} from "../../configurations/configs";

/**
 * THIS CLASS MANAGES ALL BUSINESS LOGIC OF USER REFERENCES
 */
@Injectable()
export class AccountReferencesService {

    constructor(public http: Http) {

    }

    /**
     * LOADS ALL REFERENCES ASSOCIATED WITH A SPECIFIC ACCOUNT
     * @param idAccount
     * @returns {Promise<T>|Promise}
     */
    loadReferences(idAccount){
        let bean = {
            class : 'com.vitonjob.references.dto.Query',
            action : 'GET',
            mock :{
                class : 'com.vitonjob.references.dto.AccountReference',
                idAccount : idAccount
            }
        };

        let encodedArg = btoa(JSON.stringify(bean));
        let payload = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            'id': 11200,
            'args': [{
                'class': 'fr.protogen.masterdata.model.CCalloutArguments',
                value: encodedArg
            }]
        };

        let body = JSON.stringify(payload);


        return new Promise(resolve => {
            let headers = Configs.getHttpJsonHeaders();
            this.http.post(Configs.calloutURL, body, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    resolve(data);
                });
        });
    }

    /**
     * Add a new reference
     * @param reference
     * @returns {Promise<T>|Promise}
     */
    addReference(reference){
        let bean = {
            class : 'com.vitonjob.references.dto.Query',
            action : 'PUT',
            mock :reference
        };

        let encodedArg = btoa(JSON.stringify(bean));
        let payload = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            'id': 11200,
            'args': [{
                'class': 'fr.protogen.masterdata.model.CCalloutArguments',
                value: encodedArg
            }]
        };

        let body = JSON.stringify(payload);



        return new Promise(resolve => {
            let headers = Configs.getHttpJsonHeaders();
            this.http.post(Configs.calloutURL, body, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    resolve(data);
                });
        });
    }

    /**
     * Add a new reference
     * @param reference
     * @returns {Promise<T>|Promise}
     */
    deleteReference(reference){
        let bean = {
            class : 'com.vitonjob.references.dto.Query',
            action : 'DELETE',
            mock :reference
        };

        let encodedArg = btoa(JSON.stringify(bean));
        let payload = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            'id': 11200,
            'args': [{
                'class': 'fr.protogen.masterdata.model.CCalloutArguments',
                value: encodedArg
            }]
        };

        let body = JSON.stringify(payload);



        return new Promise(resolve => {
            let headers = Configs.getHttpJsonHeaders();
            this.http.post(Configs.calloutURL, body, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    resolve(data);
                });
        });
    }
}
