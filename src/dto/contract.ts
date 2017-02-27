export class Contract {

  id: number;
  num: String;
  numero: String;
  centreMedecineEntreprise: String;
  adresseCentreMedecineEntreprise: String;
  centreMedecineETT: String;
  adresseCentreMedecineETT: String;
  contact: String;
  indemniteFinMission: String;
  indemniteCongesPayes: String;
  moyenAcces: String;
  numeroTitreTravail: String;
  debutTitreTravail: String;
  finTitreTravail: String;
  periodesNonTravaillees: String;
  debutSouplesse: String;
  finSouplesse: String;
  equipements: String;

  interim: String;
  missionStartDate: String;
  missionEndDate: String;
  trialPeriod: number;
  termStartDate: String;
  termEndDate: String;
  motif: String;
  justification: String;
  qualification: String;
  characteristics: String;
  workTimeHours: number;
  workTimeVariable: number;
  usualWorkTimeHours: String;
  workHourVariable: String;
  postRisks: String;
  medicalSurv: String;
  epi: boolean;
  baseSalary: number;
  MonthlyAverageDuration: String;
  salaryNHours: String;
  salarySH35: String;
  salarySH43: String;
  restRight: String;
  interimAddress: String;
  customer: String;
  primes: number;
  headOffice: String;
  missionContent: String;
  category: String;
  sector: String;
  companyName: String;
  titreTransport: String;
  zonesTitre: String;
  risques: String;
  elementsCotisation: number;
  elementsNonCotisation: number;
  titre: String;
  periodicite: String;
  epiProvidedBy : String;
  isScheduleFixed: String;
  workStartHour: any;
  workEndHour: any;
  workAdress: String;
  jobyerBirthDate: String;
  adresseInterim: String;
  offerContact: String;
  contactPhone: String;

  partnerEmployerLink: String;
  partnerJobyerLink: String;
  demandeJobyer: String;
  demandeEmployer: String;
  enveloppeEmployeur: String;
  enveloppeJobyer: String;


  constructor(){
    this.id = 0;
    this.num = "";
    this.numero = "";
    this.centreMedecineEntreprise = "";
    this.adresseCentreMedecineEntreprise = "";
    this.centreMedecineETT = "181 - CMIE";
    this.adresseCentreMedecineETT = "80 RUE DE CLICHY 75009 PARIS";
    this.contact = "";
    this.indemniteFinMission = "10.00 %";
    this.indemniteCongesPayes = "10.00 %";
    this.moyenAcces = "";
    this.numeroTitreTravail = "";
    this.debutTitreTravail = "";
    this.finTitreTravail = "";
    this.periodesNonTravaillees = "";
    this.debutSouplesse = "";
    this.finSouplesse = "";
    this.equipements = "";

    this.interim = "HubJob.com";
    this.missionStartDate = "";
    this.missionEndDate = "";
    this.trialPeriod = 5;
    this.termStartDate = "";
    this.termEndDate = "";
    this.motif = "";
    this.justification = "";
    this.qualification = "";
    this.characteristics = "";
    this.isScheduleFixed = "true";
    this.workTimeVariable = 0;
    this.usualWorkTimeHours = "8H00/17H00 variables";
    this.workStartHour = null;
    this.workEndHour = null;
    this.workHourVariable = "";
    this.postRisks = "";
    this.medicalSurv = "NON";
    this.epi = false;
    this.epiProvidedBy  = "";
    this.baseSalary = 0;
    this.MonthlyAverageDuration = "0";
    this.salaryNHours = "00,00€ B/H";
    this.salarySH35 = "+00%";
    this.salarySH43 = "+00%";
    this.restRight = "00%";
    this.interimAddress = "";
    this.customer = "";
    this.primes = 0;
    this.headOffice = "";
    this.missionContent = "";
    this.category = "Employé";
    this.sector = "";
    this.companyName = "";
    this.titreTransport = "NON";
    this.zonesTitre = "";
    this.risques = "";
    this.elementsCotisation = 0.0;
    this.elementsNonCotisation = 10.0;
    this.titre = "";
    this.periodicite = "";

    this.workTimeHours = 0;

    this.workAdress = "";

    this.jobyerBirthDate = "";

    this.adresseInterim = "";

    this.offerContact = "";
    this.contactPhone = "";
  }
}