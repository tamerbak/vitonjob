export class HeureMission{
  id: number;

  //jours de la mission
  jour_debut: Date;
  jour_fin: Date;
  //heures prévues de la mission
  heure_debut: number;
  heure_fin: number;
  //dates pointées par le jobyer
  date_debut_pointe: string;
  date_fin_pointe: string;
  //dates pointées puis modifiées par le jobyer
  date_debut_pointe_modifie: string;
  date_fin_pointe_modifie: string;
  //date pointe modifiés par l'employeur
  date_debut_pointe_corrige: string;
  date_fin_pointe_corrige: string;

  //pour determiner si la date a été pointée/modifiée
  // a été accepté par l'employeur ou non
  is_heure_debut_corrigee: string;
  is_heure_fin_corrigee: string;

  //pour determiner si le jobyer accepte la decision
  // de l'employeur concernant ses heures pointé
  est_heure_debut_aime: string;
  est_heure_fin_aime: string;

  heure_debut_new: string;
  heure_fin_new: string;


  heure_debut_temp: string;
  heure_fin_temp: string;

  constructor(){
    this.id = 0;

    this.jour_debut = new Date();
    this.jour_fin = new Date();
    this.heure_debut = 0;
    this.heure_fin = 0;

    this.date_debut_pointe = "";
    this.date_fin_pointe = "";

    this.date_debut_pointe_modifie = "";
    this.date_fin_pointe_modifie = "";

    this.date_debut_pointe_corrige = "";
    this.date_fin_pointe_corrige = "";

    this.is_heure_debut_corrigee = "NON";
    this.is_heure_fin_corrigee = "NON";

    this.est_heure_debut_aime = "";
    this.est_heure_fin_aime = "";

    this.heure_debut_new = "";
    this.heure_fin_new = "";

    this.heure_debut_temp = "";
    this.heure_fin_temp = "";
  }
}
