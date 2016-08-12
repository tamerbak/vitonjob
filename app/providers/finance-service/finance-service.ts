import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {Http, Headers} from '@angular/http';
import {Configs} from '../../configurations/configs';


/*
 Generated class for the FinanceService provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class FinanceService {
    data: any;

    constructor(private http: Http) {
        this.data = null;
    }

    loadPrevQuote(id){
        let bean = {
            'class' : 'com.vitonjob.callouts.finance.DocumentQuery',
            idOffre : id,
            documentType : 'PREV'
        };
        console.log(JSON.stringify(bean));
        let encodedArg = btoa(JSON.stringify(bean));
        var payload = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            'id': 215,
            'args': [
                {
                    'class': 'fr.protogen.masterdata.model.CCalloutArguments',
                    label: 'Document query',
                    value: encodedArg
                }
            ]
        };

        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'application/json');

            this.http.post(Configs.calloutURL, JSON.stringify(payload), {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    //debugger;
                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.data = data;
                    resolve(this.data);
                });
        });
    }

}

