import {AbstractGCallout} from "./generium/abstract-gcallout";

export class Adress extends AbstractGCallout {

  id: number;
  name: string;
  streetNumber: string;
  street: string;
  zipCode: string;
  city: string;
  country: string;
  fullAdress: string;

  constructor() {
    super('com.vitonjob.callouts.auth.model.Adress');

    this.id = 0;
    this.streetNumber = "";
    this.name = "";
    this.fullAdress = "";
    this.street = "";
    this.zipCode = "";
    this.city = "";
    this.country = "France";
  }
}
