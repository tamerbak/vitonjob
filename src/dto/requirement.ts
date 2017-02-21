import {ListCapitalyze} from "./generic/list-capitalyze";

export class Requirement extends ListCapitalyze {
  libelle: string;

  constructor() {
    super('com.vitonjob.callouts.offer.model.RequirementData');
    this.libelle = '';
  }
}
