import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Configs} from "../configurations/configs";

@Injectable()
export class AdvertService {
  constructor(public http : Http){

  }

  loadAdverts(){
    let sql = "select " +
      "pk_user_annonce_entreprise as id" +
      ", titre as titre" +
      ", contenu as content" +
      //", thumbnail" +
      ", created " +
      ", fk_user_offre_entreprise as \"offerId\" " +
      "from user_annonce_entreprise " +
      "where dirty='N' order by created desc";

    return new Promise(resolve => {
      let headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe(data => {
          let adverts = [];
          if(data && data.data){
            for(let i = 0 ; i < data.data.length ; i++){
              let r = data.data[i];
              let adv = {
                id : r.id,
                'class' : 'com.vitonjob.annonces.Annonce',
                //idEntreprise : idEntreprise,
                titre : r.titre,
                description : this.prepareContent(r.content),
                briefContent : this.prepareBriefContent(r.content),
                thumbnail : {
                  'class':'com.vitonjob.annonces.Attachement',
                  code : 0,
                  status : '',
                  fileContent : this.prepareImage(r.thumbnail),
                  fileName: this.getImageName(r.thumbnail)
                },
                created : this.parseDate(r.created),
                offerId: r.offerId
              };
              adverts.push(adv);
            }
          }
          resolve(adverts);
        });
    });
  }

  loadAdvert(advert){
    let sql = "select " +
      "piece_jointe as attachement" +
      ", image_principale as imgbg" +
      " from user_annonce_entreprise " +
      "where dirty='N' and pk_user_annonce_entreprise=" + advert.id;

    return new Promise(resolve => {
      let headers = Configs.getHttpTextHeaders();
      this.http.post(Configs.sqlURL, sql, {headers: headers})
        .map(res => res.json())
        .subscribe(data => {
          if(data && data.data && data.data.length != 0){
              let r = data.data[0];
              advert.attachement = {
                  'class':'com.vitonjob.annonces.Attachement',
                  code : 0,
                  status : '',
                  fileContent : r.attachement,
                  fileName : ''
                };
                advert.imgbg = {
                  'class':'com.vitonjob.annonces.Attachement',
                  code : 0,
                  status : '',
                  fileContent : this.prepareImage(r.imgbg),
                  fileName: this.getImageName(r.imgbg)
                };
              }
          resolve(advert);
        });
    });
  }

  getOfferById(offerId){
    let args =
      {
        'class': 'com.vitonjob.callouts.offerInfo.OfferToken',
        'offerId': offerId
      };
    let args = JSON.stringify(args);
    let encodedArgs = btoa(args);

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
      let headers = Configs.getHttpJsonHeaders();
      this.http.post(Configs.calloutURL, body, {headers: headers})
        .map(res => res.json())
        .subscribe((data : any) => {
          resolve(JSON.parse(data));
        });
    });
  }

  prepareContent(content : string){
    if(!content || content.length == 0)
      return "";
    let val = "";
    try{
      val = atob(content);
    }catch(exc){
      val = content;
    }
    return val;
  }

  prepareBriefContent(content : string){
    let cnt = this.prepareContent(content);
    if(cnt.length>128)
      return cnt.substr(0, 128)+'...';
    return cnt;
  }

  parseDate(dateStr: string) {
    if (!dateStr || dateStr.length == 0 || dateStr.split('-').length == 0)
      return '';
    dateStr = dateStr.split(' ')[0];
    return dateStr.split('-')[2] + '/' + dateStr.split('-')[1] + '/' + dateStr.split('-')[0];
  }

  prepareImage(strImg : string){
    if(!strImg || strImg.length == 0)
      return "";

    let file = strImg.split(';')[0];
    let enc = strImg.split(';')[1];
    if(file.split('.').length<=1)
      return enc;

    enc = "data:image/"+file.split('.')[1]+";base64,"+enc;
    return enc;
  }

  getImageName(strImg) {
    if(!strImg || strImg.length == 0)
      return "";

    let file = strImg.split(';')[0];
    return file;
  }

  sqlfy(d) {
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " 00:00:00+00";
  }

  sqlfyText(text) {
    if (!text || text.length == 0)
      return "";
    return text.replace(/'/g, "''")
  }
}
