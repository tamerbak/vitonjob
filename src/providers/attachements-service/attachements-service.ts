import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import "rxjs/add/operator/map";
import {Configs} from "../../configurations/configs";
import {Utils} from "../../utils/utils";

@Injectable()
export class AttachementsService {
    data: any;
    attachement: any;

    constructor(private http: Http) {
        this.data = null;
    }

    removeLastFileVersion(user, fileName){
        let userId = user.id;

        let entreprise : any = null;
        if (user && Utils.isEmpty(user.employer.entreprises) === false && user.employer.entreprises.length > 0) {
        entreprise = user.employer.entreprises[0];
        }

        if(fileName.indexOf("'") > -1){
            fileName = fileName.replace("'","''");
        }

        let sql = "update user_pieces_justificatives set dirty='Y' where " +
        "fk_user_account="+userId+" " +
        (entreprise ? "and fk_user_entreprise=" + entreprise.id + " " : "") +
        "and nom_fichier='"+fileName+"' ; "; // remove previous version
        return new Promise(resolve => {
        // We're using Angular Http provider to request the data,
        // then on the response it'll map the JSON data to a parsed JS object.
        // Next we process the data and resolve the promise with the new data.
        let headers = Configs.getHttpTextHeaders();
        this.http.post(Configs.sqlURL, sql, {headers: headers})
            .map(res => res.json())
            .subscribe(data => {
            resolve(data);
            });
        });
    }

    uploadFileByFolder(user, fileName, scanUri, fileFolder) {

        let userId = user.id;
        let d = new Date();
        this.removeLastFileVersion(user, fileName);

        let entreprise : any = null;
        if (user && Utils.isEmpty(user.employer.entreprises) === false && user.employer.entreprises.length > 0) {
        entreprise = user.employer.entreprises[0];
        }

        if(fileName.indexOf("'") > -1){
            fileName = fileName.replace("'","''");
        }

        let sql = "insert into user_pieces_justificatives (" +
        "fk_user_account" +
        ", nom_fichier" +
        ", dossier" +
        ", date_mise_a_jour" +
        (entreprise ? ",fk_user_entreprise" : "") +
        ") values (" +
        userId +
        ",'" + fileName +
        "','" + fileFolder +
        "','" + this.sqlfyDate(d) +
        (entreprise ? "','" + entreprise.id : "") +
        "') returning pk_user_pieces_justificatives";
        ////console.log(sql);
        return new Promise(resolve => {
        // We're using Angular Http provider to request the data,
        // then on the response it'll map the JSON data to a parsed JS object.
        // Next we process the data and resolve the promise with the new data.
        let headers = Configs.getHttpTextHeaders();
        this.http.post(Configs.sqlURL, sql, {headers: headers})
            .map(res => res.json())
            .subscribe(data => {
            this.attachement = null;
            if(data.data){
                this.attachement = {
                id : data.data[0].pk_user_pieces_justificatives,
                fileName : fileName,
                uploadDate : this.parseDate(this.sqlfyDate(d)),
                fileFolder: ''
                };
                this.updateAttachementsByFolder(userId, this.attachement.id, fileName, scanUri, fileFolder);
            }

            resolve(this.attachement);
            });
        });
  }

  updateAttachementsByFolder(userId, idAttachment, fileName, scanUri, fileFolder){

    let today = this.sqlfyDate(new Date());
    let storageId = "{\"class\":\"com.vitonjob.callouts.AttachementDownload\",\"idBean\":<<DBID>>,\"idAttachement\":"+idAttachment+"}";
    let rowId = userId;
    let sql =  "insert into row_document " +
      "(" +
      "file_name, " +
      "file_folder, " +
      "file_extension, " +
      "date_creation, " +
      "file_version, " +
      "storage_identifier, " +
      "storage_callout_id, " +
      "id_row, " +
      "id_window, " +
      "id_type, " +
      "id_folder, " +
      "id_user," +
      "text_content" +
      ") values (" +
      "'"+fileName+"'," +
      "'"+Utils.sqlfyText(fileFolder)+"'," +
      "'jpg'," +
      "'"+today+"'," +
      "1," +
      "'"+storageId+"'," +
      "0,"+
      ""+rowId+"," +
      "2538," +
      "2," +
      "5," +
      "210," +
      "'"+scanUri+"');";
    sql = sql+"insert into row_document " +
      "(" +
      "file_name, " +
      "file_folder, " +
      "file_extension, " +
      "date_creation, " +
      "file_version, " +
      "storage_identifier, " +
      "storage_callout_id, " +
      "id_row, " +
      "id_window, " +
      "id_type, " +
      "id_folder, " +
      "id_user," +
      "text_content" +
      ") values (" +
      "'"+fileName+"'," +
      "'"+Utils.sqlfyText(fileFolder)+"'," +
      "'jpg'," +
      "'"+today+"'," +
      "1," +
      "'"+storageId+"'," +
      "0,"+
      ""+rowId+"," +
      "2606," +
      "2," +
      "5," +
      "210," +
      "'"+scanUri+"');";
    ////console.log(sql);

    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      let headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe(data => {
          resolve(this.data);
        });
    });
  }

    loadAttachementsByFolder(user, folder) {

        let entreprise : any = null;
        if (user && Utils.isEmpty(user.employer.entreprises) === false && user.employer.entreprises.length > 0) {
        entreprise = user.employer.entreprises[0];
        }

        let sql = "SELECT pj.pk_user_pieces_justificatives, pj.nom_fichier, pj.date_mise_a_jour, pj.dossier " +
        "FROM user_pieces_justificatives pj " +
        "WHERE fk_user_account=" + user.id +
        ((entreprise) ? " AND pj.fk_user_entreprise=" + entreprise.id : "") +
        ((Utils.isEmpty(folder) == false && folder != '*') ? " AND pj.dossier ILIKE '" + Utils.sqlfyText(folder) + "'" : "")  +
        " AND pj.dirty='N'";

        return new Promise(resolve => {
        let headers = Configs.getHttpTextHeaders();
        this.http.post(Configs.sqlURL, sql, {headers: headers})
            .map(res => res.json())
            .subscribe(data => {
            this.data = [];
            if(data.data){
                for(let i = 0 ; i < data.data.length ; i++){
                this.data.push({
                    id : data.data[i].pk_user_pieces_justificatives,
                    fileName : data.data[i].nom_fichier,
                    uploadDate : this.parseDate(data.data[i].date_mise_a_jour),
                    fileFolder: data.data[i].dossier,
                });
                }
            }

            resolve(this.data);
            });
        });
    }

    loadAttachements(user) {
        let sql = "select pk_user_pieces_justificatives, nom_fichier, date_mise_a_jour from user_pieces_justificatives where fk_user_account=" + user.id + " and dirty='N'";
        console.log(sql);
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {
                    this.data = [];
                    if (data.data) {
                        for (let i = 0; i < data.data.length; i++) {
                            this.data.push({
                                id: data.data[i].pk_user_pieces_justificatives,
                                fileName: data.data[i].nom_fichier,
                                uploadDate: this.parseDate(data.data[i].date_mise_a_jour)
                            });
                        }
                    }

                    resolve(this.data);
                });
        });
    }

    uploadFile(user, fileName, scanUri) {
        if(fileName.indexOf("'") > -1){
            fileName = fileName.replace("'","''");
        }

        let d = new Date();
        let sql = "insert into user_pieces_justificatives (fk_user_account, nom_fichier, date_mise_a_jour) values (" + user.id + ",'" + fileName + "','" + this.sqlfyDate(d) + "') returning pk_user_pieces_justificatives";
        console.log(sql);
        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {

                    this.attachement = null;
                    if (data.data) {
                        this.attachement = {
                            id: data.data[0].pk_user_pieces_justificatives,
                            fileName: fileName,
                            uploadDate: this.parseDate(this.sqlfyDate(d))
                        };
                        this.uploadActualFile(this.attachement.id, fileName, scanUri);
                        this.updateAttachements(user, this.attachement.id, fileName, scanUri);
                    }

                    resolve(this.attachement);
                });
        });
    }

    updateAttachements(user, idAttachment, fileName, scanUri) {
        if(fileName.indexOf("'") > -1){
            fileName = fileName.replace("'","''");
        }

        if (user.estRecruteur || user.estEmployeur)
            return;
        let today = this.sqlfyDate(new Date());
        let storageId = "{	\"class\":\"com.vitonjob.callouts.AttachementDownload\", \"idBean\" : <<DBID>>,	\"idAttachement\" : " + idAttachment + "}";
        let rowId = user.jobyer.id;
        let sql = "insert into row_document " +
            "(" +
            "file_name, " +
            "file_extension, " +
            "date_creation, " +
            "file_version, " +
            "storage_identifier, " +
            "storage_callout_id, " +
            "id_row, " +
            "id_window, " +
            "id_type, " +
            "id_folder, " +
            "id_user," +
            "text_content" +
            ") values (" +
            "'" + fileName + "'," +
            "'jpg'," +
            "'" + today + "'," +
            "1," +
            "'" + storageId + "'," +
            "0," +
            "" + rowId + "," +
            "2538," +
            "2," +
            "5," +
            "210," +
            "'" + scanUri + "');";
        sql = sql + "insert into row_document " +
            "(" +
            "file_name, " +
            "file_extension, " +
            "date_creation, " +
            "file_version, " +
            "storage_identifier, " +
            "storage_callout_id, " +
            "id_row, " +
            "id_window, " +
            "id_type, " +
            "id_folder, " +
            "id_user," +
            "text_content" +
            ") values (" +
            "'" + fileName + "'," +
            "'jpg'," +
            "'" + today + "'," +
            "1," +
            "'" + storageId + "'," +
            "0," +
            "" + rowId + "," +
            "2606," +
            "2," +
            "5," +
            "210," +
            "'" + scanUri + "');";
        console.log(sql);

        return new Promise(resolve => {
            // We're using Angular Http provider to request the data,
            // then on the response it'll map the JSON data to a parsed JS object.
            // Next we process the data and resolve the promise with the new data.
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {


                    resolve(data);
                });
        });
    }

    uploadActualFile(id, fileName, scanUri) {
        if(fileName.indexOf("'") > -1){
            fileName = fileName.replace("'","''");
        }

        let payload = {
            'class': 'fr.protogen.connector.model.StreamedFile',
            fileName: fileName,
            table: 'user_pieces_justificatives',
            identifiant: id,
            stream: scanUri,
            operation: 'PUT'
        };

        var stringData = JSON.stringify(payload);
        //console.log(stringData);
        return new Promise(resolve => {
            let headers = Configs.getHttpJsonHeaders();
            this.http.post(Configs.fssURL, stringData, {headers: headers})
                .subscribe((data:any) => {

                    resolve(data);
                });
        });
    }

    downloadActualFile(id, fileName) {
        let payload = {
            'class': 'fr.protogen.connector.model.StreamedFile',
            fileName: fileName,
            table: 'user_pieces_justificatives',
            identifiant: id,
            stream: '',
            operation: 'GET'
        };

        var stringData = JSON.stringify(payload);
        console.log(stringData);
        return new Promise(resolve => {
            let headers = Configs.getHttpJsonHeaders();
            this.http.post(Configs.fssURL, stringData, {headers: headers})
                .subscribe((data:any) => {

                    let v = data._body;
                    v = JSON.parse(v);
                    resolve(v);
                });
        });
    }

    deleteAttachement(attachement) {
        let sql = "update user_pieces_justificatives set dirty='Y' where pk_user_pieces_justificatives=" + attachement.id;

        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data:any) => {

                    console.log(JSON.stringify(data));

                    resolve(data);
                });
        });
    }

    parseDate(strdate) {
        if (!strdate)
            return '';
        let d = strdate.split(' ')[0];
        let date = d.split('-')[2] + '/' + d.split('-')[1] + '/' + d.split('-')[0];
        return date;
    }

    sqlfyDate(d) {
        let str = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '+00';
        return str;
    }
}

