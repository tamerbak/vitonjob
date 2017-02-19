import {AbstractGCallout} from "./generium/abstract-gcallout";

export class MissionAddress extends AbstractGCallout {

  id: number;
  name: string;
  streetNumber: string;
  street: string;
  cp: string;
  ville: string;
  pays: string;
  fullAdress: string;

  constructor() {
    super('com.vitonjob.callouts.offer.model.AdressData');

    this.id = 0;
    this.name = "";
    this.streetNumber = "";
    this.street = "";
    this.cp = "";
    this.ville = "";
    this.pays = "France";
    this.fullAdress = "";
  }
}
