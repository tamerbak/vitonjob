import {Storage, SqlStorage} from "ionic-angular";
import {Injectable} from "@angular/core";
import {Configs} from "../../configurations/configs";

/**
 * @author daoudi amine
 * @description services for user
 * @module User
 */
@Injectable()
export class UserService {
    data: any = null;
    db: any;


    constructor() {
        this.db = new Storage(SqlStorage);
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

}

