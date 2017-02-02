import {AbstractGCallout} from "./abstract-gcallout";

export class CCalloutArguments extends AbstractGCallout {

  label: string;
  value: string;

  constructor(label: string, value: any) {
    super('fr.protogen.masterdata.model.CCalloutArguments');
    this.label = label;
    this.value = btoa(JSON.stringify(value));
  }
}
