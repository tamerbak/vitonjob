import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {HttpRequestHandler} from "../../http/http-request-handler";

@Injectable()
export class SlimPayService{

    constructor(public http: Http, public httpRequest : HttpRequestHandler) {
    }

    signSEPA(entrepriseId) {
        //Prepare the request
        let bean: any =
        {
            class: 'com.vitonjob.slimpay.model.SlimpayConfig',
            idEntreprise: entrepriseId
        };
        let encodedArg = btoa(JSON.stringify(bean));

        // Compute ID according to env
        let calloutId = 10011;
        if (GlobalConfigs.env == 'PROD') {
            calloutId = 326;
        }

        var payload = {
            class: 'fr.protogen.masterdata.model.CCallout',
            'id': calloutId,
            'args': [
                {
                    class: 'fr.protogen.masterdata.model.CCalloutArguments',
                    value: encodedArg
                }
            ]
        };

        return new Promise(resolve => {
            this.httpRequest.sendCallOut(payload, this).subscribe((data: any) => {
                    resolve(data);
                });
        });
    }

    checkSEPARequestState(entrepriseId) {
        let sql = 'select etat_demande_sepa as etat from user_coordonnees_bancaires where fk_user_entreprise=' + entrepriseId;
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this).subscribe((data: any) => {
                    resolve(data.data[0]);
                });
        });
    }
}