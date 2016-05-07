/**
 * Created by tim on 06/05/2016.
 */

import {Injectable} from 'angular2/core';

@Injectable()
export class GlobalConfigs {

    //Project Target : employer or jobyer
    private projectTarget;

    constructor() {
        this.projectTarget = "jobyer";
    }

    setProjectTarget(value) {
        this.projectTarget = value;
    }

    getProjectTarget() {
        return this.projectTarget;
    }

}