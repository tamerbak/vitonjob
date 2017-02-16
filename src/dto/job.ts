import {AbstractGCallout} from "./generium/abstract-gcallout";
import {Requirement} from "./requirement";
import {PharmaSoftwares} from "./pharmaSoftwares";

export class Job  extends AbstractGCallout {
  'class': string;
  job: string;
  sector: string;
  idsector: number;
  idJob: number;
  level: string;
  remuneration: number;
  currency: string;
  telephone: string;
  contact: string;
  status: string;
  nbPoste: number;
  validated: boolean;
  prerequisObligatoires: Requirement[];
  epi: any[];
  pharmaSoftwares: PharmaSoftwares[];
  adress: any;

  constructor() {
    super('com.vitonjob.callouts.offer.model.JobData');

    this.job = "";
    this.sector = "";
    this.idsector = 0;
    this.idJob = 0;
    this.level = 'junior';
    this.remuneration = null;
    this.currency = 'euro';
    this.nbPoste = 1;
    this.telephone = "";
    this.contact = "";
    this.validated = false;
    this.prerequisObligatoires = [];
    this.epi = [];
    this.pharmaSoftwares = [];
  }
}
