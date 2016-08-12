import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';

@Injectable()
export class ProfileService {
    configuration;
    projectTarget;

    constructor(http: Http,gc: GlobalConfigs) {
        this.http = http;        
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        this.configuration = Configs.setConfigs(this.projectTarget);
    }

    countEntreprisesByRaisonSocial(companyname: string){
        var sql = "select count(*) from user_entreprise where nom_ou_raison_sociale='" + companyname + "';";
        console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    console.log(data);
                    resolve(data);
                });
        });
    }
	
	deleteEmployerAccount(accountId, employerId){
		var sql = "delete from user_entreprise where fk_user_account = '" + accountId + "';"
		sql = sql + " delete from user_employeur where pk_user_employeur = '" + employerId + "';"
		sql = sql + " delete from user_account where pk_user_account = '" + accountId + "';";
        console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    console.log(data);
                    resolve(data);
                });
        });
	}
	
	countEntreprisesBySIRET(siret){
		var sql = "select count(*) from user_entreprise where siret='" + siret + "';";
        console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    console.log(data);
                    resolve(data);
                });
        });
	}
}