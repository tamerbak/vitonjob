/**
 * Created by tim on 01/02/2017.
 */
import {ListCapitalyze} from "./generic/list-capitalyze";

export class Quality extends ListCapitalyze {

    libelle: string;
    level: number;

    constructor() {
        super('com.vitonjob.callouts.offer.model.QualityData');
        this.libelle = '';
        this.level = 1;
    }
}