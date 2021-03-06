import {AbstractGCallout} from "./generium/abstract-gcallout";
import {Adress} from "./adress";
import {ConventionCollective} from "./conventionCollective";

export class Entreprise extends AbstractGCallout {

  id: number;
  nom: string;
  siret: string;
  naf: string;
  urssaf: string;
  siegeAdress: Adress;
  workAdress: Adress;
  correspondanceAdress: Adress;
  conventionCollective: ConventionCollective;
  // private List<OfferData> offers = new ArrayList<OfferData>();

  constructor() {
    super('com.vitonjob.callouts.auth.model.Entreprise');

    this.id = 0;
    this.nom = "";
    this.siret = "";
    this.naf = "";
    this.urssaf = "";
    this.siegeAdress = new Adress();
    this.workAdress = new Adress();
    this.correspondanceAdress = new Adress();
    this.conventionCollective = new ConventionCollective();
  }
}
