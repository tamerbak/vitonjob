import {AbstractGCallout} from "./../generium/abstract-gcallout";

export class ListElem extends AbstractGCallout {

  id: number;

  constructor() {
    super('com.vitonjob.callouts.offer.model.ListElem');
    this.id = 0;
  }
}
