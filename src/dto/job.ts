import {AbstractGCallout} from "./generium/abstract-gcallout";

export class Job  extends AbstractGCallout {
  'class': string;
  job: string;
  sector: string;
  idSector: number;
  idJob: number;
  level: string;
  remuneration: number;
  currency: string;
  validated: boolean;
  prerequisObligatoires: any[];
  epi: any[];

  constructor() {
    super('com.vitonjob.callouts.offer.model.JobData');

    this.job = "";
    this.sector = "";
    this.idSector = 0;
    this.idJob = 0;
    this.level = 'junior';
    this.remuneration = null;
    this.currency = 'euro';
    this.validated = false;
    this.prerequisObligatoires = [];
    this.epi = [];
  }
}
