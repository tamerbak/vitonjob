import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Configs} from "../../configurations/configs";

@Injectable()
export class ConventionService {
  constructor(public http : Http){

  }

  loadConventionData(employeurId) {
    let sql = "select duree_collective_travail_hebdo " +
        "from user_employeur " +
        "where pk_user_employeur=" + employeurId + ";";

    return new Promise(resolve => {
      let headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
          .map(res => res.json())
          .subscribe((data: any) => {
            resolve(data.data);
          });
    });
  }
}
