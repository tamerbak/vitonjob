import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";
import "rxjs/add/operator/map";
import {} from "ionic-angular";
import {Configs} from "../../configurations/configs";

@Injectable()
export class PaylineServices {
    data: any = null;
    walletId: any;


    constructor(public http: Http) {

    }

    empreinteCarte(card, user) {

        let bean = {
            "class": "com.vitonjob.payline.PaylineConfig",
            accountId: user.id,
            tierId: user.employer.entreprises[0].id,
            email: user.email,
            tel: user.tel,
            firstName: user.prenom,
            lastName: user.nom,
            adressName: user.prenom + ' ' + user.nom,
            tierType: 'employer',
            cardNumber: card.cardNumber,
            cardType: card.cardType,
            expireDate: card.expireDate,
            cvx: card.cvx,
            city: '',
            country: '',
            street: '',
            zipCode: '',
            contractNumber: 2508733
        };
        let encodedArg = btoa(JSON.stringify(bean));
        var payload = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            'id': 192,
            'args': [
                {
                    'class': 'fr.protogen.masterdata.model.CCalloutArguments',
                    label: 'Empreinte carte',
                    value: encodedArg
                }
            ]
        };

        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers = Configs.getHttpJsonHeaders();

            this.http.post(Configs.calloutURL, JSON.stringify(payload), {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {

                    // we've got back the raw data, now generate the core schedule data
                    // and save the data for later reference
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
        });


    }

    checkWallet(user) {
        let sql = 'select wallet_id from user_account where pk_user_account=' + user.id;
        return new Promise(resolve => {
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {
                    this.walletId = '';
                    if (data.data && data.data.length > 0) {
                        this.walletId = data.data[0].wallet_id;
                    }
                    resolve(this.walletId);
                });
        });

    }
}

