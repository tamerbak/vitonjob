import { Injectable } from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import {Configs} from "../../configurations/configs";

@Injectable()
export class AttachementsService {
    data: any;
    attachement : any;
    constructor(private http: Http) {
        this.data = null;
    }

    loadAttachements(user){
        let sql = "select pk_user_pieces_justificatives, nom_fichier, date_mise_a_jour from user_pieces_justificatives where fk_user_account="+user.id +" and dirty='N'";
        console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    this.data = [];
                    if(data.data){
                        for(let i = 0 ; i < data.data.length ; i++){
                            this.data.push({
                                id : data.data[i].pk_user_pieces_justificatives,
                                fileName : data.data[i].nom_fichier,
                                uploadDate : this.parseDate(data.data[i].date_mise_a_jour)
                            });
                        }
                    }

                    resolve(this.data);
                });
        });
    }

    uploadFile(user, fileName, scanUri){
        let d = new Date();
        let sql = "insert into user_pieces_justificatives (fk_user_account, nom_fichier, date_mise_a_jour) values ("+user.id+",'"+fileName+"','"+this.sqlfyDate(d)+"') returning pk_user_pieces_justificatives";
        console.log(sql);
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                   //debugger;
                    this.attachement = null;
                    if(data.data){
                        this.attachement = {
                            id : data.data[0].pk_user_pieces_justificatives,
                            fileName : fileName,
                            uploadDate : this.parseDate(this.sqlfyDate(d))
                        };
                        this.uploadActualFile(this.attachement.id, fileName, scanUri);
                    }

                    resolve(this.attachement);
                });
        });
    }

    uploadActualFile(id, fileName, scanUri){
        let payload = {
            'class': 'fr.protogen.connector.model.StreamedFile',
            fileName : fileName,
            table : 'user_pieces_justificatives',
            identifiant : id,
            stream : scanUri,
            operation : 'PUT'
        };

        var stringData = JSON.stringify(payload);
        //console.log(stringData);
        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'application/json');
            this.http.post(Configs.fssURL, stringData, {headers:headers})
                .subscribe(data => {
                   //debugger;
                    resolve(data);
                });
        });
    }

    downloadActualFile(id, fileName){
        let payload = {
            'class': 'fr.protogen.connector.model.StreamedFile',
            fileName : fileName,
            table : 'user_pieces_justificatives',
            identifiant : id,
            stream : '',
            operation : 'GET'
        };

        var stringData = JSON.stringify(payload);
        console.log(stringData);
        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'application/json');
            this.http.post(Configs.fssURL, stringData, {headers:headers})
                .subscribe(data => {

                    let v = data._body;
                    v = JSON.parse(v);
                    resolve(v);
                });
        });
    }

    deleteAttachement(attachement){
        let sql = "update user_pieces_justificatives set dirty='Y' where pk_user_pieces_justificatives="+attachement.id;

        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {

                    console.log(JSON.stringify(data));

                    resolve(data);
                });
        });
    }

    parseDate(strdate){
        if(!strdate)
            return '';
        let d = strdate.split(' ')[0];
        let date = d.split('-')[2]+'/'+d.split('-')[1]+'/'+d.split('-')[0];
        return date;
    }

    sqlfyDate(d){
        let str = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()+'+00';
        return str;
    }
}

