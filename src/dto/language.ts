import {ListCapitalyze} from "./generic/list-capitalyze";

export class Language extends ListCapitalyze {

    level: number;

    constructor() {
        super('com.vitonjob.callouts.offer.model.LanguageData');
        this.level = 1;
    }

}
