import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Configs} from "../../configurations/configs";


@Injectable()
export class PartnersService {
    constructor(public http: Http) {
    }

    getAPropos(partnerCode, projectTarget) {
        let role = (projectTarget == 'jobyer' ? 'jobyer' : 'employeur');
        let sql = "select a_propos, a_propos_" + role + " from user_partenaire where  code = '" + partnerCode + "';";
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

