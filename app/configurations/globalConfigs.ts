/**
 * Created by tim on 06/05/2016.
 */

import {Injectable} from 'angular2/core';

@Injectable()
export class GlobalConfigs {

    //Project Target : employer or jobyer
    private projectTarget;
    //Name of the connexion button : Connexion or Deconnexion
    private cnxBtnName: string;

    constructor() {
        this.projectTarget = "jobyer";
        this.cnxBtnName = "Se connecter / S'inscrire";
    }

    setProjectTarget(value) {
        this.projectTarget = value;
    }

    getProjectTarget() {
        return this.projectTarget;
    }
    
    setCnxBtnName(value) {
        this.cnxBtnName = value;
    }

    getCnxBtnName() {
        return this.cnxBtnName;
    }

}