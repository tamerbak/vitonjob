import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {HttpRequestHandler} from "../../http/http-request-handler";
import {SqliteDBService} from "../sqlite-db-service/sqlite-db-service";
import {Utils} from "../../utils/utils";


@Injectable()
export class SporadicService {

  constructor(public httpRequest : HttpRequestHandler,
              public db : SqliteDBService) {

  }

  public loadNewJobyers(){

    let sql = "select max(j1.id_voj) as ido, max(j2.id_jobyer) as idj from offre_jobyer j1, offre_jobyer j2";

    this.db.executeSelect(sql).then((rawdata : any)=>{

      let data = [];
      for (let i = 0; i < rawdata.rows.length; i++) {
        let item = rawdata.rows.item(i);
        data.push(item);
      }


      let lastID = 0;
      let lastJobyer = 0;
      if(data && data.length>0){
        if(data[0].ido)
          lastID = data[0].ido;
        if(data[0].idj)
          lastJobyer = data[0].idj;
      }

      let query = {
        "class" : 'com.vitonjob.sporadic.dto.Query',
        lastVOJID : lastID,
        lastJobyerID : lastJobyer,
        role : 'jobyer',
        operation : 'load'
      };
      let encodedArg = btoa(JSON.stringify(query));
      let payload = {
        class: 'fr.protogen.masterdata.model.CCallout',
        'id': 92000,
        'args': [
          {
            class: 'fr.protogen.masterdata.model.CCalloutArguments',
            value: encodedArg
          }
        ]
      };
      return new Promise(resolve => {
        this.httpRequest.sendCallOut(payload, this, true).subscribe((data: any) => {
          
          if(data && data.length>0){
            for(let i = 0 ; i < data.length ; i++){
              let o = data[i];
              sql = "";
              if(o.idVOJ && o.idVOJ>0)
                sql = "insert into offre_jobyer " +
                    "(id_voj, titre, id_secteur, id_job, mots_cles, taux, nom_jobyer)" +
                    " values " +
                    "("+o.idVOJ+", '"+Utils.sqlfyText(o.title) +"', "+o.idSector+", "+o.idJob+", '"+Utils.sqlfyText(o.keyWords)+"', "+o.rate+", '"+Utils.sqlfyText(o.jobyer)+"')";
              else if(o.idJobyer && o.idJobyer>0)
                sql = "insert into offre_jobyer " +
                    "(id_jobyer, titre, id_secteur, id_job, mots_cles, taux, nom_jobyer)" +
                    " values " +
                    "("+o.idJobyer+", '"+Utils.sqlfyText(o.title)+"', "+o.idSector+", "+o.idJob+", '"+Utils.sqlfyText(o.keyWords)+"', "+o.rate+", '"+Utils.sqlfyText(o.jobyer)+"')";
              this.db.execute(sql).then((resp:boolean)=>{
                if(i == data.length - 1){
                  console.log("DONE INSERTING DATA");
                  resolve(true);
                }
              });
            }
          } else{
            console.log("DONE INSERTING DATA");
            resolve(true);
          }

        });
      });
    });
  }

  fetchDeletedJobyerOffers(){
    
    let sql = "select id_voj from offre_jobyer";
    this.db.executeSelect(sql).then((rawdata : any)=>{
      let data = [];
      for (let i = 0; i < rawdata.rows.length; i++) {
        let item = rawdata.rows.item(i);
        data.push(item);
      }

      let ids = "";
      for(let i = 0 ; i < data.length ; i++)
        ids=ids+","+(data[i].id_voj);
      if(ids != "")
        ids = ids.substring(1);
      let query = {
        "class" : 'com.vitonjob.sporadic.dto.Query',
        ids : ids,
        role : 'jobyer',
        operation : 'obsolete'
      };
      let encodedArg = btoa(JSON.stringify(query));
      let payload = {
        class: 'fr.protogen.masterdata.model.CCallout',
        'id': 92000,
        'args': [
          {
            class: 'fr.protogen.masterdata.model.CCalloutArguments',
            value: encodedArg
          }
        ]
      };
      console.log(JSON.stringify(query));

      return new Promise(resolve => {
        this.httpRequest.sendCallOut(payload, this, true).subscribe((data: any) => {
          
          if(data && data.length>0){
            for(let i = 0 ; i < data.length ; i++){
              let o = data[i];
              sql = "";
              if(o.idVOJ && o.idVOJ>0)
                sql = "delete from offre_jobyer " +
                    "where id_voj="+o.idVOJ;
              else if(o.idJobyer && o.idJobyer>0)
                sql ="delete from offre_jobyer " +
                    "where id_jobyer="+o.idJobyer;
              this.db.execute(sql).then((resp:boolean)=>{
                if(i == data.length - 1){
                  console.log("DONE INSERTING DATA");
                  resolve(true);
                }
              });
            }
          }else{
            console.log("DONE INSERTING DATA");
            resolve(true);
          }

        });
      });

    });
  }

  public loadNewEnterpriseOffers(){
    let sql = "select max(id_voj) as lastID from offre_entreprise";

    this.db.executeSelect(sql).then((rawdata : any)=>{
      let data = [];
      for (let i = 0; i < rawdata.rows.length; i++) {
        let item = rawdata.rows.item(i);
        data.push(item);
      }

      let lastID = 0;
      if(data && data.length>0){
        lastID = data[0].lastID;
      }
      console.log("LAST EMPLOYER OFFER ID "+lastID);
      let query = {
        "class" : 'com.vitonjob.sporadic.dto.Query',
        lastVOJID : lastID,
        role : 'employer',
        operation : 'load'
      };
      let encodedArg = btoa(JSON.stringify(query));
      let payload = {
        class: 'fr.protogen.masterdata.model.CCallout',
        'id': 92000,
        'args': [
          {
            class: 'fr.protogen.masterdata.model.CCalloutArguments',
            value: encodedArg
          }
        ]
      };
      return new Promise(resolve => {
        this.httpRequest.sendCallOut(payload, this, true).subscribe((data: any) => {
          if(data && data.length>0){
            for(let i = 0 ; i < data.length ; i++){
              let o = data[i];
              sql = "insert into offre_entreprise " +
                  "(id_voj, titre, id_secteur, id_job, mots_cles, taux, gains, nom_entreprise)" +
                  " values " +
                  "("+o.idVOJ+", '"+Utils.sqlfyText(o.title)+"', "+o.idSector+", "+o.idJob+", '"+Utils.sqlfyText(o.keyWords)+"', "+o.rate+", "+o.gains+", '"+Utils.sqlfyText(o.enterprise)+"')";
              this.db.execute(sql).then((resp:boolean)=>{
                if(i == data.length - 1){
                  console.log("DONE INSERTING DATA");
                  resolve(true);
                }
              });
            }
          }else{
            console.log("DONE INSERTING DATA");
            resolve(true);
          }
        });
      });
    });
  }

  fetchDeletedEnterpriseOffers(){
    let sql = "select id_voj from offre_entreprise";
    this.db.executeSelect(sql).then((rawdata : any)=>{
      let data = [];
      for (let i = 0; i < rawdata.rows.length; i++) {
        let item = rawdata.rows.item(i);
        data.push(item);
      }
      let ids = "";
      for(let i = 0 ; i < data.length ; i++)
        ids=ids+","+(data[i].id_voj);

      if(ids != "")
          ids = ids.substring(1);
      let query = {
        "class" : 'com.vitonjob.sporadic.dto.Query',
        ids : ids,
        role : 'employer',
        operation : 'obsolete'
      };
      let encodedArg = btoa(JSON.stringify(query));
      let payload = {
        class: 'fr.protogen.masterdata.model.CCallout',
        'id': 92000,
        'args': [
          {
            class: 'fr.protogen.masterdata.model.CCalloutArguments',
            value: encodedArg
          }
        ]
      };


      return new Promise(resolve => {
        this.httpRequest.sendCallOut(payload, this, true).subscribe((data: any) => {
          if(data && data.length>0){
            for(let i = 0 ; i < data.length ; i++){
              let o = data[i];
              sql = "delete from offre_entreprise " +
                  "where id_voj="+o.idVOJ;
              this.db.execute(sql).then((resp:boolean)=>{
                if(i == data.length - 1){
                  console.log("DONE INSERTING DATA");
                  resolve(true);
                }
              });
            }
          }else{
            console.log("DONE INSERTING DATA");
            resolve(true);
          }

        });
      });

    });
  }

}
