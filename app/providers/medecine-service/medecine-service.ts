import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";
import "rxjs/add/operator/map";
import {Configs} from "../../configurations/configs";

@Injectable()
export class MedecineService {
    data: any;
    med: any = null;

    constructor(private http: Http) {
        this.data = null;
    }

    autocomplete(kw) {//lower_unaccent
        let sql = "select pk_user_medecine_de_travail as id, libelle from user_medecine_de_travail where lower_unaccent(libelle) % lower_unaccent('" + kw + "') limit 5";
        return new Promise(resolve => {
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {

                    this.data = [];

                    if (data.data) {
                        this.data = data.data;
                        console.log(JSON.stringify(data.data));
                    }

                    resolve(this.data);
                });
        });
    }

    getMedecine(id) {
        let sql = "select pk_user_medecine_de_travail as id, libelle, adresse, cp.code as code_postal from user_medecine_de_travail, user_code_postal cp where user_medecine_de_travail.fk_user_code_postal=cp.pk_user_code_postal and pk_user_medecine_de_travail in (select fk_user_medecine_de_travail from user_entreprise where pk_user_entreprise=" + id + ")";
        console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {

                    this.med = null;
                    console.log(JSON.stringify(data));
                    if (data.data && data.data.length > 0) {
                        this.med = data.data[0];
                    }

                    resolve(this.med);
                });
        });
    }
}

