import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import {Configs} from "../../configurations/configs";


@Injectable()
export class ParametersService {
    data: any = null;

    constructor(public http: Http) {}

    getRates(){
        let sql = "select libelle, taux_horaire, coefficient from user_coefficient_aiv order by taux_horaire asc";
        return new Promise(resolve => {
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    this.data = data.data;
                    resolve(this.data);
                });
        });
    }
}

