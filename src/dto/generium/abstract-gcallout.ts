/**
 * Created by kelvin on 12/01/2017.
 */

export abstract class AbstractGCallout {
  class: string;

  constructor(className: string) {
    this.class = className;
  }

  getClass(): string {
    return this.class;
  }

  setClass(className: string): void {
    this.class = className;
  }
}
