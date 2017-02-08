import {ListCapitalyze} from "./generic/list-capitalyze";

export class Language extends ListCapitalyze {

    libelle: string;
    level: number;

    constructor() {
        super('com.vitonjob.callouts.offer.model.LanguageData');
        this.level = 1;
        this.libelle = '';
    }

}
