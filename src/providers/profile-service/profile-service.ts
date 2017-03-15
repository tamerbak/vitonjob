import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Platform} from "ionic-angular";
import {Storage} from "@ionic/storage";
import {HttpRequestHandler} from "../../http/http-request-handler";
import {Utils} from "../../utils/utils";

declare let FileTransfer;
declare let FileUploadOptions;

@Injectable()
export class ProfileService {
    configuration;
    projectTarget;

    profilPictureVar: string;
    http: any;

    constructor(http: Http, gc: GlobalConfigs,
                private platform: Platform,
                public storage: Storage, public httpRequest: HttpRequestHandler) {
        this.http = http;
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        this.configuration = Configs.setConfigs(this.projectTarget);
        this.profilPictureVar = this.configuration.profilPictureVar;
    }

    loadRequirementsByJob(idjob) {

        let sql = "select distinct(p.libelle) as libelle from user_prerquis p where pk_user_prerquis in " +
            "(select fk_user_prerquis from user_prerequis_obligatoires where fk_user_offre_entreprise in " +
            "(select fk_user_offre_entreprise from user_pratique_job where fk_user_job = " + idjob + ")" +
            ")";

        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe(data => {
                resolve(data.data);
            });
        });
    }

    loadProfileJobs(idJobyer) {
        let sql = "select pk_user_job as id, user_job.libelle as libelle, fk_user_niveau as niveau from user_job, user_profil_job where user_job.pk_user_job= user_profil_job.fk_user_job and user_profil_job.dirty='N' and user_profil_job.fk_user_jobyer=" + idJobyer;
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe(data => {
                    resolve(data.data);
                });
        });
    }

    removeJob(j, idJobyer) {
        let sql = "delete from user_profil_job where fk_user_jobyer=" + idJobyer + " and fk_user_job=" + j.id;
        return new Promise(resolve => {
            
            this.httpRequest.sendSql(sql, this, true).subscribe(data => {
                    resolve(data.data);
                });
        });
    }

    attachJob(j, idJobyer) {
        let sql = "insert into user_profil_job (fk_user_jobyer,fk_user_job,fk_user_niveau) values (" + idJobyer + "," + j.id + "," + j.niveau + ")";
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe(data => {
                    resolve(data.data);
                });
        });
    }

    deleteEmployerAccount(accountId, employerId) {
        let sql = "delete from user_entreprise where fk_user_account = '" + accountId + "';"
        sql = sql + " delete from user_employeur where pk_user_employeur = '" + employerId + "';"
        sql = sql + " delete from user_account where pk_user_account = '" + accountId + "';";
        console.log(sql);
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe((data: any) => {
                    console.log(data);
                    resolve(data);
                });
        });
    }

    countEntreprisesBySIRET(siret) {
        let sql = "select count(*) from user_entreprise where siret='" + siret + "';";
        console.log(sql);
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe((data: any) => {
                    console.log(data);
                    resolve(data);
                });
        });
    }

    /*copyFileLocally(imgUri, accountId) {
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
     }*/

    uploadProfilePictureInServer(imgUri, accountId) {
        let sql = "update user_account set photo_de_profil ='" + imgUri + "' where pk_user_account = '" + accountId + "';";
        console.log(sql);
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe((data: any) => {
                    console.log(data);
                    resolve(data);
                });
        });
    }

    loadProfilePicture(accountId, tel, role) {
        let sql;
        if (!this.isEmpty(accountId) && accountId != null) {
            sql = "select encode(photo_de_profil::bytea, 'escape') from user_account where pk_user_account = '" + accountId + "';";
        } else {
            sql = "select encode(photo_de_profil::bytea, 'escape') from user_account where telephone = '" + tel + "' and role = '" + role + "';";
        }
        console.log(sql);
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe((data: any) => {
                    console.log(data);
                    resolve(data);
                });
        });
    }

    loadAccountId(tel, role) {
        let sql = "select pk_user_account as id from user_account where telephone='" + tel + "' and role='" + role + "'";
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true)
                .subscribe((data: any) => {
                    console.log(data);
                    resolve(data.data[0].id);
                });
        });
    }

    uploadProfilePictureInLocal(imgUri) {
        this.storage.set(this.profilPictureVar, imgUri);
    }

    getIdentifiantNationalityByNationality(natId) {
        let sql = "select i.* from user_identifiants_nationalite as i, user_nationalite as n where i.pk_user_identifiants_nationalite = n.fk_user_identifiants_nationalite and n.pk_user_nationalite = '" + natId + "'";

        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe((data: any) => {
                    resolve(data);
                });
        })
    }

    loadAdditionalUserInformations(id) {
        let sql = "select j.* from user_jobyer as j where j.pk_user_jobyer = '" + id + "';";
        return new Promise(resolve => {
            let headers = new Headers();
            headers = Configs.getHttpTextHeaders();
            this.http.post(Configs.sqlURL, sql, {headers: headers})
                .map(res => res.json())
                .subscribe((data: any) => {
                    resolve(data);
                });
        });
    }

    getCountryById(id, countries) {
        for (let i = 0; i < countries.length; i++) {
            if (countries[i].id == id) {
                return countries[i];
            }
        }
        return null;
    }

    getCountryByIndex(index, countries) {
        for (let i = 0; i < countries.length; i++) {
            if (countries[i].indicatif_telephonique == index) {
                return countries[i];
            }
        }
    }

    /*
     Qualities management
     */
    getUserQualities(id: any, projectTarget: string) {
        let table = projectTarget == 'jobyer' ? 'user_qualite_du_jobyer' : 'user_qualite_employeur';
        let foreignKey = projectTarget == 'jobyer' ? 'fk_user_jobyer' : 'fk_user_entreprise';
        let sql = "select pk_user_indispensable as id, libelle from user_indispensable as i, " + table + " as t where i.pk_user_indispensable = t.fk_user_indispensable and t." + foreignKey + " = '" + id + "'";

        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe((data: any) => {
                    resolve(data.data);
                });
        });
    }

    getUserLanguages(id: any, projectTarget: string) {
        let table = projectTarget == 'jobyer' ? 'user_langue_jobyer' : 'user_langue_employeur';
        let foreignKey = projectTarget == 'jobyer' ? 'fk_user_jobyer' : 'fk_user_entreprise';
        let sql = "select pk_user_langue as id, i.libelle,n.libelle as level from user_langue as i, user_niveau as n , " + table + " as t where n.pk_user_niveau = t.fk_user_niveau and i.pk_user_langue = t.fk_user_langue and t." + foreignKey + " = '" + id + "' order by i.libelle";

        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe((data: any) => {
                    resolve(data.data);
                });
        });
    }

    saveQualities(qualities, id, projectTarget) {
        let table = projectTarget == 'jobyer' ? 'user_qualite_du_jobyer' : 'user_qualite_employeur';
        let foreignKey = projectTarget == 'jobyer' ? 'fk_user_jobyer' : 'fk_user_entreprise';
        this.deleteQualities(id, table, foreignKey).then((data: any) => {
            if (data && qualities && qualities.length != 0)
                this.attachQualities(qualities, id, table, foreignKey);
        });
    }

    saveLanguages(languages, id, projectTarget) {
        let table = projectTarget == 'jobyer' ? 'user_langue_jobyer' : 'user_langue_employeur';
        let foreignKey = projectTarget == 'jobyer' ? 'fk_user_jobyer' : 'fk_user_entreprise';
        this.deleteLanguages(id, table, foreignKey).then((data: any) => {
            if (data && languages && languages.length != 0)
                this.attachLanguages(languages, id, table, foreignKey);
        })
    }

    deleteQualities(id, table, foreignKey) {
        let sql = "delete from " + table + " where " + foreignKey + "=" + id;
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe((data: any) => {
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
            this.httpRequest.sendSql(sql, this, true).subscribe((data: any) => {
                    resolve(data);
                });
        });
    }

    deleteLanguages(id, table, foreignKey) {
        let sql = "delete from " + table + " where " + foreignKey + "=" + id;
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe((data: any) => {
                    resolve(data);
                });
        });
    }

    attachLanguages(languages, id, table, foreignKey) {
        console.log(languages)
        let sql = "";
        for (let i = 0; i < languages.length; i++) {
            let q = languages[i];
            sql = sql + " insert into " + table + " (" + foreignKey + ", fk_user_langue,fk_user_niveau) values (" + id + ", " + q.id + "," + ((q.level == "Débutant") ? 1 : 2 ) + "); ";
        }
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe((data: any) => {
                    resolve(data);
                });
        });
    }

    deleteDisponibilites(id) {
        let sql = "update user_disponibilite_du_jobyer " +
            "set dirty='Y' " +
            "where fk_user_jobyer=" + id;
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe((data: any) => {
                    resolve(data);
                });
        });
    }

    saveDisponibilites(jobyerId, disponibilite) {
        let sql = "";
        for (let i = 0; i < disponibilite.length; i++) {
            let interval = (disponibilite[i].startDate == disponibilite[i].endDate) ? 'non' : 'oui';
            sql = sql + " insert into user_disponibilite_du_jobyer (" +
                "fk_user_jobyer, " +
                "jour, " +
                "date_de_debut," +
                "date_de_fin," +
                "heure_de_debut," +
                "heure_de_fin," +
                "\"interval\"" +
                ") values (" +
                jobyerId + ", " +
                "'" + new Date(disponibilite[i].startDate).toISOString() + "', " +
                "'" + new Date(disponibilite[i].startDate).toISOString() + "'," +
                "'" + new Date(disponibilite[i].endDate).toISOString() + "'," +
                (disponibilite[i].startHour) + "," +
                (disponibilite[i].endHour) + "," +
                "'" + interval + "'" +
                "); ";
        }
        console.clear();
        console.log("ADD NEW SLOTS");
        console.log(sql);
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe((data: any) => {
                    console.log(JSON.stringify(data));
                    resolve(data);
                });
        });
    }

    deleteSoftwares(id) {
        let sql = "delete from user_experience_logiciel_pharmacien " +
            "where fk_user_jobyer=" + id;
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe((data: any) => {
                    resolve(data);
                });
        });
    }

    saveSoftwares(jobyerId, softwares) {
        let sql = "";
        for (let i = 0; i < softwares.length; i++) {
            sql = sql + " insert into user_experience_logiciel_pharmacien (" +
                "fk_user_jobyer, " +
                "fk_user_logiciels_pharmaciens, " +
                "niveau" +
                ") values (" +
                jobyerId + ", " +
                "'" + softwares[i].id + "', " +
                "'" + softwares[i].niveau + "'" +
                "); ";
        }
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe((data: any) => {
                    resolve(data);
                });
        });
    }

    getUserDisponibilite(id: any) {
        let sql = "select * from user_disponibilite_du_jobyer where dirty='N' and fk_user_jobyer = '" + id + "'";

        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe((data: any) => {
                    resolve(data.data);
                });
        });
    }

    getJobyerInfo(id) {
        let jobyerData = {
            'class': 'com.vitonjob.callouts.jobyerInfo.JobyerToken',
            'jobyerId': id
        };
        let jobyerDataStr = JSON.stringify(jobyerData);
        let encodedJobyer = btoa(jobyerDataStr);
        let data = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            'id': 20020,
            'args': [{
                'class': 'fr.protogen.masterdata.model.CCalloutArguments',
                label: 'JobyerInfo',
                value: encodedJobyer
            }]
        };
        let stringData = JSON.stringify(data);
        return new Promise(resolve => {
            let headers = Configs.getHttpJsonHeaders();
            this.http.post(Configs.calloutURL, stringData, {headers: headers})
                .subscribe(data => {
                    resolve(data);
                });
        });
    }

    getUserSoftwares(jobyerId) {
        let sql = "select exp.pk_user_experience_logiciel_pharmacien as \"expId\", exp.fk_user_logiciels_pharmaciens as \"id\", exp.niveau as niveau, log.nom as libelle from user_experience_logiciel_pharmacien as exp, user_logiciels_pharmaciens as log where exp.fk_user_logiciels_pharmaciens = log.pk_user_logiciels_pharmaciens and exp.fk_user_jobyer = '" + jobyerId + "'";

        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe(data => {
                    resolve(data.data);
                });
        });
    }

    isEmpty(str) {
        if (str == '' || str == 'null' || !str)
            return true;
        else
            return false;
    }

    updateSpontaneousContact(value, accountid) {
        let sql = "update user_account set ";
        sql = sql + " accepte_candidatures='" + Utils.sqlfyText(value) + "'";
        sql = sql + " where pk_user_account=" + accountid + ";";

        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe((data: any) => {
                    resolve(data);
                });
        })

    }

    getIsSpontaneousContact(accountid) {
        let sql = "select accepte_candidatures from user_account where pk_user_account = " + accountid + ";";

        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe((data: any) => {
                    resolve(data.data[0]);
                });
        });
    }
}
