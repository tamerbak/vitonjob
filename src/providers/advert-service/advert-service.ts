import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {DateUtils} from "../../utils/date-utils";
import {Utils} from "../../utils/utils";
import {HttpRequestHandler} from "../../http/http-request-handler";

@Injectable()
export class AdvertService {
    constructor(public http: Http, public httpRequest: HttpRequestHandler) {

    }

    deleteAdvert(advertId) {
        let sql = "update user_annonce_entreprise set dirty = 'Y' where pk_user_annonce_entreprise="+advertId;

        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this).subscribe(data => {
                resolve(data);
            });
        });
    }

    loadAdverts(offset, limit) {
        let sql = "select " +
            "pk_user_annonce_entreprise as id" +
            ", titre as titre" +
            ", contenu as content" +
            ", thumbnail" +
            ", created " +
            ", fk_user_offre_entreprise as \"offerId\" " +
            " from user_annonce_entreprise " +
            " where dirty='N' order by created desc " +
            " limit " + limit + " offset " + offset;

        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this).subscribe((data: any) => {
                let adverts = [];
                if (data && data.data) {
                    for (let i = 0; i < data.data.length; i++) {
                        let r = data.data[i];
                        let adv = {
                            id: r.id,
                            'class': 'com.vitonjob.annonces.Annonce',
                            titre: r.titre,
                            description: this.prepareContent(r.content),
                            briefContent: this.prepareBriefContent(r.content),
                            thumbnail: {
                                'class': 'com.vitonjob.annonces.Attachement',
                                code: 0,
                                status: '',
                                fileContent: this.prepareImage(r.thumbnail),
                            },
                            created: this.parseDate(r.created),
                            offerId: r.offerId
                        };
                        adverts.push(adv);
                    }
                }
                resolve(adverts);
            });
        });
    }

    loadAdvertsByEntreprise(idEntreprise, offset, limit) {
        let sql = "SELECT " +
            "uae.pk_user_annonce_entreprise as id" +
            ", uae.titre as titre" +
            ", uae.contenu as content" +
            ", uae.thumbnail" +
            ", uae.created " +
            ", uae.fk_user_offre_entreprise as \"offerId\" " +
            ", count(uija.fk_user_jobyer) as \"nbInterest\" " +
            " FROM user_annonce_entreprise uae LEFT JOIN user_interet_jobyer_annonces uija " +
            " ON uae.pk_user_annonce_entreprise = uija.fk_user_annonce_entreprise " +
            " WHERE uae.dirty='N' and uae.fk_user_entreprise=" + idEntreprise + "" +
            " GROUP BY uae.pk_user_annonce_entreprise " +
            " ORDER BY uae.created DESC " +
            " LIMIT " + limit + " OFFSET " + offset;

        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this).subscribe(data => {
                let adverts = [];
                if (data && data.data) {
                    for (let i = 0; i < data.data.length; i++) {
                        let r = data.data[i];
                        let adv = {
                            id: r.id,
                            'class': 'com.vitonjob.annonces.Annonce',
                            idEntreprise: idEntreprise,
                            titre: r.titre,
                            description: this.prepareContent(r.content),
                            briefContent: this.prepareBriefContent(r.content),
                            thumbnail: {
                                'class': 'com.vitonjob.annonces.Attachement',
                                code: 0,
                                status: '',
                                fileContent: this.prepareImage(r.thumbnail),
                                fileName: this.getImageName(r.thumbnail)
                            },
                            isThumbnail: r.thumbnail && r.thumbnail.length > 0,
                            rubriques: [],
                            created: this.parseDate(r.created),
                            offerId: r.offerId,
                            nbInterest: r.nbInterest
                        };

                        adverts.push(adv);
                    }
                }
                resolve(adverts);
            });
        });
    }

    loadAdvert(advert) {
        let sql = "select " +
            "piece_jointe as attachement" +
            ", image_principale as imgbg" +
            ", forme_contrat" +
            " from user_annonce_entreprise " +
            "where dirty='N' and pk_user_annonce_entreprise=" + advert.id;

        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this).subscribe((data: any) => {
                if (data && data.data && data.data.length != 0) {
                    let r = data.data[0];
                    advert.attachement = {
                        'class': 'com.vitonjob.annonces.Attachement',
                        code: 0,
                        status: '',
                        fileContent: r.attachement,
                        fileName: ''
                    };
                    advert.imgbg = {
                        'class': 'com.vitonjob.annonces.Attachement',
                        code: 0,
                        status: '',
                        fileContent: this.prepareImage(r.imgbg),
                        fileName: this.getImageName(r.imgbg)
                    };
                    advert.contractForm = r.forme_contrat;
                }
                resolve(advert);
            });
        });
    }

    getOfferById(offerId) {
        let args =
            {
                'class': 'com.vitonjob.callouts.offerInfo.OfferToken',
                'offerId': offerId
            };
        let argStr = JSON.stringify(args);
        let encodedArgs = btoa(argStr);

        let dataLog = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            'id': 20012,
            'args': [{
                'class': 'fr.protogen.masterdata.model.CCalloutArguments',
                value: encodedArgs
            }]
        };
        let body = JSON.stringify(dataLog);

        return new Promise(resolve => {
            this.httpRequest.sendCallOut(body, this).subscribe((data: any) => {
                resolve(JSON.parse(data._body));
            });
        });
    }

    saveAdvertInterest(advertId, jobyerId) {
        let sql = "insert into user_interet_jobyer_annonces (date, fk_user_annonce_entreprise, fk_user_jobyer) values ('" + DateUtils.sqlfy(new Date()) + "', " + advertId + ", " + jobyerId + ")";

        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this).subscribe(data => {
                resolve(data);
            });
        });
    }

    saveOfferInterest(offerId, jobyerId) {
        let sql = "insert into user_candidatures_aux_offres (date, fk_user_offre_entreprise, fk_user_jobyer) values ('" + DateUtils.sqlfy(new Date()) + "', " + offerId + ", " + jobyerId + ")";

        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this).subscribe(data => {
                resolve(data);
            });
        });
    }

    deleteAdvertInterest(advertId, jobyerId) {
        let sql = "delete from user_interet_jobyer_annonces where fk_user_annonce_entreprise = " + advertId + " and fk_user_jobyer = " + jobyerId;
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this).subscribe(data => {
                resolve(data);
            });
        });
    }

    deleteOfferInterest(offerId, jobyerId) {
        let sql = "delete from user_candidatures_aux_offres where fk_user_offre_entreprise = " + offerId + " and fk_user_jobyer = " + jobyerId;
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this).subscribe(data => {
                resolve(data);
            });
        });
    }

    getInterestAnnonce(advertId, jobyerId) {
        let sql = "select * from user_interet_jobyer_annonces where fk_user_annonce_entreprise = " + advertId + " and fk_user_jobyer = " + jobyerId;

        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe(data => {
                resolve(data);
            });
        });
    }

    getInterestOffer(offerId, jobyerId) {
        let sql = "select * from user_candidatures_aux_offres where fk_user_offre_entreprise = " + offerId + " and fk_user_jobyer = " + jobyerId;
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe(data => {
                resolve(data);
            });
        });
    }

    prepareContent(content: string) {
        if (!content || content.length == 0)
            return "";
        let val = "";
        try {
            val = atob(content);
        } catch (exc) {
            val = content;
        }
        return val;
    }

    prepareBriefContent(content: string) {
        let cnt = this.prepareContent(content);
        if (cnt.length > 128)
            return cnt.substr(0, 128) + '...';
        return cnt;
    }

    parseDate(dateStr: string) {
        if (!dateStr || dateStr.length == 0 || dateStr.split('-').length == 0)
            return '';
        dateStr = dateStr.split(' ')[0];
        return dateStr.split('-')[2] + '/' + dateStr.split('-')[1] + '/' + dateStr.split('-')[0];
    }

    prepareImage(strImg: string) {
        if (!strImg || strImg.length == 0)
            return "";

        let file = strImg.split(';')[0];
        let enc = strImg.split(';')[1];
        if (file.split('.').length <= 1)
            return enc;

        enc = "data:image/" + file.split('.')[1] + ";base64," + enc;
        return enc;
    }

    getImageName(strImg) {
        if (!strImg || strImg.length == 0)
            return "";

        let file = strImg.split(';')[0];
        return file;
    }

    updateAdvert(advert: any) {
        let sql = "UPDATE user_annonce_entreprise " +
                "SET " +
                "titre = '" + Utils.sqlfyText(advert.titre) + "', " +
                "contenu = '" + Utils.sqlfyText(advert.description) + "', " +
                "piece_jointe = '" + Utils.sqlfyText(advert.attachement.fileContent) + "', " +
                "thumbnail = '" + Utils.sqlfyText(advert.thumbnail.fileContent) + "', " +
                "forme_contrat = '" + Utils.sqlfyText(advert.contractForm) + "', " +
                "image_principale = '" + Utils.sqlfyText(advert.imgbg.fileContent) + "' " +
                "WHERE " +
                "pk_user_annonce_entreprise = " + advert.id + ";"
            ;
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe(data => {
                resolve(data);
            });
        });
    }

    saveAdvert(advert: any) {
        let sql = "insert into user_annonce_entreprise " +
            "(titre, contenu, created, fk_user_entreprise) " +
            "values " +
            "('" + Utils.sqlfyText(advert.titre) + "', '" +
            Utils.sqlfyText(advert.description) + "', " + "'" +
            new Date().toISOString() + "', " +
            advert.idEntreprise + ")" +
            " returning pk_user_annonce_entreprise";
        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this).subscribe(data => {
                let res = {
                    id: 0
                };
                if (data && data.data && data.data.length > 0) {
                    res.id = data.data[0].pk_user_annonce_entreprise;
                }
                resolve(res);
            });
        });
    }

    updateOfferWithAdvert(advertId, offerId) {
        let sql = "UPDATE user_offre_entreprise " +
            "SET " +
            "fk_user_annonce_entreprise = '" + advertId + "' " +
            "WHERE " +
            "pk_user_offre_entreprise = " + offerId + ";";

        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this).subscribe(data => {
                resolve(data);
            });
        });
    }

    getInterestedJobyers(advertId) {
        let sql = "SELECT " +
            "j.*, j.pk_user_jobyer as jobyerid, a.pk_user_account as accountid " +
            //", encode(a.photo_de_profil::bytea, 'escape') as photo" +
            " FROM user_jobyer j, user_interet_jobyer_annonces uija, user_account as a " +
            " WHERE j.pk_user_jobyer = uija.fk_user_jobyer " +
            " and j.dirty='N' " +
            " and a.pk_user_account=j.fk_user_account " +
            " and uija.fk_user_annonce_entreprise=" + advertId + ";"

        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this).subscribe(data => {
                resolve(data);
            });
        });
    }

    getAdvertByIdOffer(offerId) {
        let sql = "select " +
            " pk_user_annonce_entreprise as id" +
            ", titre as titre" +
            ", lien as link" +
            ", contenu as content" +
            ", thumbnail" +
            ", created " +
            ", temps_partiel as \"tempsPartiel\" " +
            ", piece_jointe as attachement" +
            ", image_principale as imgbg" +
            ", temps_partiel as \"tempsPartiel\" " +
            ", forme_contrat" +
            " from user_annonce_entreprise " +
            " where dirty='N' and pk_user_annonce_entreprise in (select fk_user_annonce_entreprise from user_offre_entreprise " +
            " where pk_user_offre_entreprise = " + offerId + ");";

        return new Promise(resolve => {
            this.httpRequest.sendSql(sql, this, true).subscribe(data => {
                let advert: any;
                if (data && data.data && data.data.length != 0) {
                    let r = data.data[0];
                    advert = {
                        id: r.id,
                        'class': 'com.vitonjob.annonces.Annonce',
                        titre: r.titre,
                        link: r.link,
                        description: this.prepareContent(r.content),
                        briefContent: this.prepareBriefContent(r.content),
                        thumbnail: {
                            'class': 'com.vitonjob.annonces.Attachement',
                            code: 0,
                            status: '',
                            fileContent: this.prepareImage(r.thumbnail),
                            fileName: this.getImageName(r.thumbnail)
                        },
                        isThumbnail: r.thumbnail && r.thumbnail.length > 0,
                        rubriques: [],
                        created: this.parseDate(r.created),
                        offerId: r.offerId,
                        nbInterest: r.nbInterest,
                        isPartialTime: (r.tempsPartiel.toUpperCase() == 'OUI'),
                        attachement: {
                            'class': 'com.vitonjob.annonces.Attachement',
                            code: 0,
                            status: '',
                            fileContent: r.attachement,
                            fileName: ''
                        },
                        imgbg: {
                            'class': 'com.vitonjob.annonces.Attachement',
                            code: 0,
                            status: '',
                            fileContent: this.prepareImage(r.imgbg),
                            fileName: this.getImageName(r.imgbg)
                        },
                        contractForm: r.forme_contrat
                    };
                }
                resolve(advert);
            });
        });
    }
}
