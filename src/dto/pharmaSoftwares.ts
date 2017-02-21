import {ListCapitalyze} from "./generic/list-capitalyze";

export class PharmaSoftwares extends ListCapitalyze {

    libelle: string;
    level: number;

    constructor() {
        super('com.vitonjob.callouts.offer.model.PharmaSoftware');
        this.libelle = '';
        this.level = 1;
    }
}