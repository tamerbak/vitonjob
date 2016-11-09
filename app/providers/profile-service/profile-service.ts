import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Storage, SqlStorage, Platform} from "ionic-angular";

@Injectable()
export class ProfileService {
    configuration;
    projectTarget;
    storage: Storage;
    profilPictureVar: string;
    http : any;

    constructor(http: Http, gc: GlobalConfigs, private platform: Platform) {
        this.http = http;
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        this.configuration = Configs.setConfigs(this.projectTarget);
        this.storage = new Storage(SqlStorage);
        this.profilPictureVar = this.configuration.profilPictureVar;
    }

    countEntreprisesByRaisonSocial(companyname: string) {
        var sql = "select count(*) from user_entreprise where nom_ou_raison_sociale='" + companyname + "';";
        console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(this.configuration.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    console.log(data);
                    resolve(data);
                });
        });
    }

    deleteEmployerAccount(accountId, employerId) {
        var sql = "delete from user_entreprise where fk_user_account = '" + accountId + "';"
        sql = sql + " delete from user_employeur where pk_user_employeur = '" + employerId + "';"
        sql = sql + " delete from user_account where pk_user_account = '" + accountId + "';";
        console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(this.configuration.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    console.log(data);
                    resolve(data);
                });
        });
    }

    countEntreprisesBySIRET(siret) {
        var sql = "select count(*) from user_entreprise where siret='" + siret + "';";
        console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(this.configuration.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    console.log(data);
                    resolve(data);
                });
        });
    }

    copyFileLocally(imgUri, accountId) {
        this.platform.ready().then(() => {
            var ft = new FileTransfer();
            var filename = accountId + ".jpg";
            var options = new FileUploadOptions();

            options.fileKey = "file";
            options.fileName = filename;
            options.mimeType = "image/jpeg";
            options.chunkedMode = false;
            options.headers = {
                'Content-Type': undefined,
                'Authorization': 'Bearer ' + localStorage.getItem('id_token') // this should send through the JWT
            };
            options.params = {
                questionId: this.question.key,
                taskId: this.taskID,
                fileName: filename
            };

            ft.upload(imageData, "http://thisthing.com/api/v1/image/save", this.success.bind(this), this.failed, options);

        }, (err) => {
            this.imageProcess = "Camera Error";
            setTimeout(() => {
                this.imageProcess = null;
            }, 2000);
        });
    }

    uploadProfilePictureInServer(imgUri, accountId) {
        var sql = "update user_account set photo_de_profil ='" + imgUri + "' where pk_user_account = '" + accountId + "';";
        console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(this.configuration.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    console.log(data);
                    resolve(data);
                });
        });
    }

    loadProfilePicture(accountId, tel, role) {
        var sql;
        if (!this.isEmpty(accountId)) {
            sql = "select encode(photo_de_profil::bytea, 'escape') from user_account where pk_user_account = '" + accountId + "';";
        } else {
            sql = "select encode(photo_de_profil::bytea, 'escape') from user_account where telephone = '" + tel + "' and role = '" + role + "';";
        }
        console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(this.configuration.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    console.log(data);
                    resolve(data);
                });
        });
    }

    uploadProfilePictureInLocal(imgUri) {
        this.storage.set(this.profilPictureVar, imgUri);
    }

    /*
     Qualities management
     */
    getUserQualities(id: any, projectTarget: string) {
        let table = projectTarget == 'jobyer' ? 'user_qualite_du_jobyer' : 'user_qualite_employeur';
        let foreignKey = projectTarget == 'jobyer' ? 'fk_user_jobyer' : 'fk_user_entreprise';
        let sql = "select pk_user_indispensable as id, libelle from user_indispensable as i, " + table + " as t where i.pk_user_indispensable = t.fk_user_indispensable and t." + foreignKey + " = '" + id + "'";

        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data.data);
                });
        });
    }

    getUserLanguages(id: any, projectTarget: string) {
        let table = projectTarget == 'jobyer' ? 'user_langue_jobyer' : 'user_langue_employeur';
        let foreignKey = projectTarget == 'jobyer' ? 'fk_user_jobyer' : 'fk_user_entreprise';
        let sql = "select pk_user_langue as id, libelle from user_langue as i, " + table + " as t where i.pk_user_langue = t.fk_user_langue and t." + foreignKey + " = '" + id + "'";

        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data.data);
                });
        });
    }

    saveQualities(qualities, id, projectTarget) {
        let table = projectTarget == 'jobyer' ? 'user_qualite_du_jobyer' : 'user_qualite_employeur';
        let foreignKey = projectTarget == 'jobyer' ? 'fk_user_jobyer' : 'fk_user_entreprise';
        this.deleteQualities(id, table, foreignKey).then(data => {
            if(data && qualities && qualities.length != 0)
                this.attachQualities(qualities, id, table, foreignKey);
        });
    }

    saveLanguages(languages, id, projectTarget){
        let table = projectTarget == 'jobyer' ? 'user_langue_jobyer' : 'user_langue_employeur';
        let foreignKey = projectTarget == 'jobyer' ? 'fk_user_jobyer' : 'fk_user_entreprise';
        this.deleteLanguages(id, table, foreignKey).then(data => {
            if(data && languages && languages.length != 0)
                this.attachLanguages(languages, id, table, foreignKey);
        })
    }

    deleteQualities(id, table, foreignKey) {
        let sql = "delete from " + table + " where " + foreignKey + "=" + id;
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                });
        });
    }

    attachQualities(qualities, id, table, foreignKey) {
        let sql = "";
        for (let i = 0; i < qualities.length; i++) {
            let q = qualities[i];
            sql = sql + " insert into " + table + " (" + foreignKey + ", fk_user_indispensable) values (" + id + ", " + q.id + "); ";
        }
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                });
        });
    }

    deleteLanguages(id, table, foreignKey) {
        let sql = "delete from " + table + " where " + foreignKey + "=" + id;
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                });
        });
    }

    attachLanguages(languages, id, table, foreignKey) {
        let sql = "";
        for (let i = 0; i < languages.length; i++) {
            let q = languages[i];
            sql = sql + " insert into " + table + " (" + foreignKey + ", fk_user_langue) values (" + id + ", " + q.id + "); ";
        }
        return new Promise(resolve => {
            let headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                });
        });
    }

    isEmpty(str) {
        if (str == '' || str == 'null' || !str)
            return true;
        else
            return false;
    }
}