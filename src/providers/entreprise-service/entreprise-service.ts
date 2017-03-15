import {Injectable} from "@angular/core";
import {Configs} from "../../configurations/configs";
import {Http} from "@angular/http";
import {Utils} from "../../utils/utils";


@Injectable()
export class EntrepriseService {
  http: any;

  constructor(http: Http) {
    this.http = http;
  }

  loadEntreprises(employerId: number){
    let sql = "select nom_ou_raison_sociale as nom from user_entreprise where fk_user_employeur = " + employerId + ";";

    return new Promise(resolve => {
      let headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .subscribe(data => {
          if(data && !Utils.isEmpty(data._body) && data.status == 200){
            let parsedData = JSON.parse(data._body);
            if(parsedData.data){
              resolve(parsedData.data);
            }
          }
        });
    });
  }

  countEntreprisesByRaisonSocial(companyname: string) {
    let sql = "select count(*) from user_entreprise where nom_ou_raison_sociale='" + companyname + "';";
    console.log(sql);

    return new Promise(resolve => {
      let headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe((data: any) => {
          resolve(data);
        });
    });
  }

  createEntreprise(accountId, employerId, companyname, ape, conventionId) {
    let sql = "insert into user_entreprise (" +
      "fk_user_account," +
      "fk_user_employeur," +
      "nom_ou_raison_sociale," +
      "ape_ou_naf," +
      "fk_user_convention_collective" +
      ") VALUES (" +
      "'" + accountId + "'," +
      "'" + employerId + "'," +
      "'" + companyname + "'," +
      "'" + ape + "'," +
      "" + conventionId +
      ") returning pk_user_entreprise";

    return new Promise(resolve => {
      let headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        });
    });
  }
}
