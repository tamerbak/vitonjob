import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {HttpRequestHandler} from "../../http/http-request-handler";

@Injectable()
export class MessagePoolService {

  public listMessage : any = [];

  constructor(public httpRequest : HttpRequestHandler) {

  }

  /**
   * Checking available messages from backoffic
   * @param canal employer/jobyer/any
   * @returns {Promise<T>|Promise}
   */
  public checkMessages(canal : string){
    let sql = "select pk_user_message as id, titre, contenu, " +
          "type_de_message as mtype, priorite " +
        "from user_message " +
        "where lower(actif)='oui' and canal in ('"+canal+"','any') " +
        "order by priorite asc";

    return new Promise(resolve => {
      this.httpRequest.sendSql(sql, this, true).subscribe((data : any)=>{
        this.listMessage = [];
        if(data && data.data && data.data.length>0){
          for(let i = 0 ; i < data.data.length ; i++){
            this.listMessage.push(data.data[i]);
          }
        }

        resolve(this.listMessage);
      });
    });

  }
}
