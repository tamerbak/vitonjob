import {AbstractGCallout} from "./abstract-gcallout";
import {CCalloutArguments} from "./ccallout-arguments";

export class CCallout extends AbstractGCallout {

  id: number;
  args: CCalloutArguments[];

  constructor(id: number, args: CCalloutArguments[]) {
    super('fr.protogen.masterdata.model.CCallout');

    this.setId(id);
    this.setArgs(args);
  }

  forge(): string {
    return JSON.stringify(this);
  }

  setId(id: number): void {
    this.id = id;
  }

  getId(): number {
    return this.id;
  }

  setArgs(args: CCalloutArguments[]): void {
    this.args = args;
  }

  getArgs(): CCalloutArguments[] {
    return this.args;
  }
}
