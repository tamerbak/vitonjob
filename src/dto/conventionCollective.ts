import {AbstractGCallout} from "./generium/abstract-gcallout";

export class ConventionCollective extends AbstractGCallout {

  id: number;
  code: string;
  libelle: string;

  constructor() {
    super("com.vitonjob.callouts.auth.model.ConventionCollective");

    this.id = 0;
    this.code = "";
    this.libelle = "";
  }
}
