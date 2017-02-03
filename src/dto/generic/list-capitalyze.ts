import {AbstractGCallout} from "./../generium/abstract-gcallout";

export class ListCapitalyze extends AbstractGCallout {

  id: number;

  constructor(className: string) {
    super(className);
    this.id = 0;
  }
}
