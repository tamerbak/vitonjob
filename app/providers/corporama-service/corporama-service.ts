import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
/**
 * @author Amal ROCHD
 * @description Service for corporama api management
 */

@Injectable()
export class CorporamaService {
    configuration;
    projectTarget;

    constructor(public http: Http, gc: GlobalConfigs) {
        this.http = http;
        this.projectTarget = gc.getProjectTarget();
        this.configuration = Configs.setConfigs(this.projectTarget);
    }

    searchCompany(type: string, value: String) {
        let args =
        {
            'class': 'com.vitonjob.corporama.search.CorporamaToken',
            'type': type,
            'value': value
        };
        args = JSON.stringify(args);

        let encodedArgs = btoa(args);
        let dataLog = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            'id': 20005,
            'args': [{
                'class': 'fr.protogen.masterdata.model.CCalloutArguments',
                value: encodedArgs
            }]
        };
        let body = JSON.stringify(dataLog);

        return new Promise(resolve => {
            let headers = Configs.getHttpJsonHeaders();
            this.http.post(Configs.calloutURL, body, {headers: headers})
                .map(res => res)
                .subscribe(data => {
                    resolve(data);
                });
        });
    }

    convertSearchResponse(response){
        let companies: any [] = [];
        if(response.response.operation == "search") {
            let results = response.response.results.legal;
            for (let i = 0; i < results.length; i++) {
                let company: any = {};
                company.naf = results[i].NAF;
                company.siren = results[i].SIREN;
                company.name = results[i].name;
                company.zip = results[i].zip;
                companies.push(company);
            }
        }else{
            let result = response.response.legal;
            let company: any = {};
            company.siren = response.response.query.siren;
            company.naf = result.NAF;
            company.name = result.name;
            if(result.establishments && result.establishments.length > 0) {
                company.hasAddress = true;
                company.placename = result.establishments[0].name;
                company.street = result.establishments[0].street;
                company.zip = result.establishments[0].zip;
                company.city = result.establishments[0].city;
            }
            if(result.leaders && result.leaders.length > 0) {
                company.hasLeader = true;
                company.firstname = result.leaders[0].firstname;
                company.lastname = result.leaders[0].lastname;
                company.title = result.leaders[0].gender;
            }
            companies.push(company);
        }
        return companies;
    }
}