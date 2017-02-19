import {AbstractGCallout} from "./generium/abstract-gcallout";
import {Requirement} from "./requirement";
import {PharmaSoftwares} from "./pharmaSoftwares";
import {MissionAddress} from "./missionAddress";

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
  requirementData: Requirement[];
  equipmentData: any[];
  pharmaSoftwareData: PharmaSoftwares[];
  adress: MissionAddress;

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
    this.requirementData = [];
    this.equipmentData = [];
    this.pharmaSoftwareData = [];
    this.adress = new MissionAddress();
  }
}
