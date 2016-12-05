import {Storage, SqlStorage} from "ionic-angular";
import {Injectable} from "@angular/core";
import {Configs} from "../../configurations/configs";
import {Headers, Http} from "@angular/http";
import {GlobalConfigs} from "../../configurations/globalConfigs";

/**
 * @author daoudi amine
 * @description services for user
 * @module User
 */
@Injectable()
export class UserService {
    data: any = null;
    db: any;
    projectTarget:string;
    configuration: any;


    constructor(public http: Http, public gc: GlobalConfigs) {
        this.db = new Storage(SqlStorage);
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        this.configuration = Configs.setConfigs(this.projectTarget);
    }

    /**
     * @description get the connexion object
     * @return promise
     */
    getConnexionObject() {
        return this.db.get('connexion');
    }

    /**
     * @description get the current connected employer
     * @return promise
     */
    getCurrentUser(projectTarget) {
        this.configuration = Configs.setConfigs(projectTarget);
        let currentUserVar = this.configuration.currentUserVar;
        return this.db.get(currentUserVar);
    }

    updateGCStatus(status, contacted, userid) {
        let sql = "update user_account set accepte_les_cgu='" + status + "', contacte_pour_refus='" + contacted + "' " +
            "where pk_user_account='" + userid + "'";
        console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(this.configuration.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {
                    this.data = data;
                    resolve(this.data);
                });
        });
    }

}

