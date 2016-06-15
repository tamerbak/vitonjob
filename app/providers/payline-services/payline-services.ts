import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import {Storage, SqlStorage} from "ionic-angular";

import {Configs} from '../../configurations/configs';

@Injectable()
export class PaylineServices {
    data: any = null;
    storage : Storage;
    constructor(public http: Http) {
        this.storage = new Storage(SqlStorage);
    }

    empreinteCarte(card){
        this.storage.get("currentUser").then(data =>{
            debugger;
            let user = JSON.parse(data);
            let bean = {
                "class" : "com.vitonjob.payline.PaylineConfig",
                accountId : user.id,
                tierId : user.employer.entreprises[0].id,
                email : user.email,
                tel : user.tel,
                firstName : user.prenom,
                lastName : user.nom,
                adressName : user.prenom+' '+user.nom,
                tierType : 'employer',
                cardNumber : card.cardNumber,
                cardType : card.cardType,
                expireDate : card.expireDate,
                cvx : card.cvx,
                city : '',
                country : '',
                street : '',
                zipCode:''
            };
            let encodedArg = btoa(JSON.stringify(bean));
            var payload = {
                'class': 'fr.protogen.masterdata.model.CCallout',
                'id': 153,
                'args': [
                    {
                        'class': 'fr.protogen.masterdata.model.CCalloutArguments',
                        label: 'Signature electronique',
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
                        debugger;
                        // we've got back the raw data, now generate the core schedule data
                        // and save the data for later reference
                        this.data = data;
                        console.log(this.data);
                        resolve(this.data);
                    });
            });
        });



    }
}

