import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {Storage, SqlStorage} from 'ionic-angular';
import {Configs} from '../configurations/configs';
import {GlobalConfigs} from '../configurations/globalConfigs';

/**
 * @author Amal ROCHD
 * @description web service access point for user authentication and inscription
 * @module Authentication
 */

@Injectable()
export class AuthenticationService {
    db : any;
    configuration;
    projectTarget;

    constructor(http: Http,gc: GlobalConfigs) {
        this.http = http;
        this.db = new Storage(SqlStorage);

        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        this.configuration = Configs.setConfigs(this.projectTarget);
    }

    /**
     * @description Insert a user_account if it does not exist
     * @param email, phone, password, role
     * @return JSON results in the form of user accounts
     */
    authenticate(email: string, phone: number, password, projectTarget: string, isRecruteur){
       //debugger;
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);

        //Prepare the request
        var login =
        {
            'class': 'com.vitonjob.callouts.auth.AuthToken',
            'email': email,
            'telephone': "+" + phone,
            'password': password,
            'role': (isRecruteur ? 'recruteur' : (projectTarget == 'employer' ? 'employeur' : projectTarget))
        };
        login = JSON.stringify(login);

        var encodedLogin = btoa(login);
        var dataLog = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            'id': 187,
            'args': [{
                'class': 'fr.protogen.masterdata.model.CCalloutArguments',
                label: 'requete authentification',
                value: encodedLogin
            }]
        };
        let body = JSON.stringify(dataLog);
        console.log(body);
       //debugger;
        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'application/json');
            this.http.post(this.configuration.calloutURL, body, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    this.data = data;
                    resolve(this.data);
                });
        })
    }

    /**
     * @description Update user_account with the new device token and accountid
     * @param token, accountId
     */
    insertToken(token, accountId, projectTarget){
        //  Init project parameters
        this.configuration = Configs.setConfigs(projectTarget);

        var sql = "Update user_account set device_token = '" + token + "' where pk_user_account = '" + accountId + "';";

        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(
                    data => console.log("device token bien inséré pour l'utilisateur " + accountId),
                    err => console.log(err)
                )
        });
    }

    sendPushNotification(){
        var token = "dzkrIrmFILU:APA91bFC68vWiF1mgcNRs1E0Y99B0c95ZfkPGZ9ibmpzQuDqZ8Or4yIP3LRnE51MjJH3VzsyVJgAjdRJRR_r9fu9Fx65rz0ppkLP7_JKRl5FzVWH9yIIIDF_o0ASQA8Jj1rjyA8sjf_3";
        var url = "https://api.ionic.io/push/notifications";
        let headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI4ZDE1NTA3Zi01YTU0LTRkNWYtODA0NC01MTljNGQ3MGI1NWEifQ.W0P2BHto56NA2UR8jvG-lfKEryMPFIu9m6b9nm21n0M");
        var body = {
            "tokens": [token],
            "profile": "vitonjob",
            "notification": {
                "message": "Hello!"
            }
        };
        return new Promise(resolve => {
            this.http.post(url, JSON.stringify(body), {headers : headers}).map(res => res.json())
                .subscribe(data => {
                        this.data = data;
                        console.log("push success", data);
                        resolve(this.data);
                    },
                    err => console.log(err));
        });
    }

    /**
     * @description update jobyer information
     * @param title, lastname, firstname, numSS, cni, nationalityId, roleId, birthdate, birthplace
     */
    updateJobyerCivility(title, lastname, firstname, numSS, cni, nationalityId, roleId, birthdate, birthplace){
        var sql = "";
        //building the sql request
        if (nationalityId){
            sql = "update user_jobyer set  " +
                "titre='" + title + "', " +
                "nom='" + lastname + "', " +
                "prenom='" + firstname + "', " +
                "numero_securite_sociale='" + numSS + "', " +
                "cni='" + cni + "', " +
                (!birthdate ? " " : "date_de_naissance ='"+ birthdate +"',") +
                "lieu_de_naissance ='" + birthplace + "', " +
                "fk_user_nationalite ='" + nationalityId + "' " +
                "where pk_user_jobyer ='" + roleId + "';";
        } else {
            sql = "update user_jobyer set  " +
                "titre='" + title + "', " +
                "nom='" + lastname + "', " +
                "prenom='" + firstname + "', " +
                "numero_securite_sociale='" + numSS + "', " +
                "cni='" + cni + "', " +
                (!birthdate ? " " : "date_de_naissance ='"+ birthdate +"',") +
                "lieu_de_naissance ='" + birthplace + "' " +
                "where pk_user_jobyer ='" + roleId + "';";
        }

        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
        })
    }

    /**
     * @description update employer and jobyer civility information
     * @param title, lastname, firstname, companyname, siret, ape, roleId, entrepriseId
     */
    updateEmployerCivility(title, lastname, firstname, companyname, siret, ape, roleId, entrepriseId,projectTarget, medecineId){
        var sql = "update user_employeur set ";
        sql = sql + " titre='" + title + "' ";
        sql = sql + ", nom='" + lastname + "', prenom='" + firstname + "' where pk_user_employeur=" + roleId + ";";
        sql = sql + " update user_entreprise set nom_ou_raison_sociale='" + companyname + "' ";
        siret = (!siret ? "" : siret);
		sql = sql + " , siret='" + siret + "' ";
        //sql = sql + "urssaf='" + numUrssaf + "', ";
       //debugger;
        if(medecineId && medecineId>0)
            sql = sql + " , fk_user_medecine_de_travail='" + medecineId+ "' ";
        ape = (!ape ? "" : ape);
		sql = sql + " , ape_ou_naf='" + ape + "' where  pk_user_entreprise=" + entrepriseId;
        console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
        })
    }

    updateRecruiterCivility(title, lastname, firstname, accountid){
        var sql = "update user_recruteur set ";
        sql = sql + " titre='" + title + "', ";
        sql = sql + " nom='" + lastname + "', prenom='" + firstname + "' where fk_user_account=" + accountid + ";";

        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
        })
    }
 
    /**
     * @description update employer and jobyer personal address
     * @param roleId, address
     */
    decorticateAddress(name, address){
        //formating the address
        var street = "";
        var cp = "";
        var ville = "";
        var pays = "";
        var adrArray = [];
        if(address){
            if(name.trim() != this.getStreetFromGoogleAddress(address).trim().replace("&#39;", "'"))
                street = name + ", " + this.getStreetFromGoogleAddress(address);
            else
                street = this.getStreetFromGoogleAddress(address);
            adrArray.push(street);
            cp = this.getZipCodeFromGoogleAddress(address);
            adrArray.push(cp);
            ville = this.getCityFromGoogleAddress(address);
            adrArray.push(ville);
            pays = this.getCountryFromGoogleAddress(address);
            adrArray.push(pays);
            return adrArray;
        }
    }

    decorticateGeolocAddress(geolocAddress){
        var adrArray = ['', '', '', ''];
        var street = "";
        for(var i = 0; i < geolocAddress.address_components.length; i++){
            if(geolocAddress.address_components[i].types[0] == "street_number"){
                street = street + geolocAddress.address_components[i].long_name + " ";
                continue;
            }
            if(geolocAddress.address_components[i].types[0] == "route"){
                street = street + geolocAddress.address_components[i].long_name + " ";
                continue;
            }
            if(geolocAddress.address_components[i].types[0] == "street_address"){
                street = street + geolocAddress.address_components[i].long_name + " ";
                continue;
            }
            if(geolocAddress.address_components[i].types[0] == "postal_code"){
                adrArray.splice(1, 1, geolocAddress.address_components[i].long_name);
                continue;
            }
            if(geolocAddress.address_components[i].types[0] == "locality"){
                adrArray.splice(2, 1, geolocAddress.address_components[i].long_name);
                continue;
            }
            if(geolocAddress.address_components[i].types[0] == "country"){
                adrArray.splice(3, 1, geolocAddress.address_components[i].long_name);
                continue;
            }
        }
        adrArray.splice(0, 1, street);
        return adrArray;
    }

    updateUserPersonalAddress(id: string, street, cp, ville, pays){
        //  Now we need to save the address
        var addressData = {
            'class': 'com.vitonjob.localisation.AdressToken',
            'street': street,
            'cp': cp,
            'ville': ville,
            'pays': pays,
            'role': (this.projectTarget == 'employer' ? 'employeur' : this.projectTarget),
            'id': id,
            'type': 'personnelle'
        };
        addressData = JSON.stringify(addressData);
        var encodedAddress = btoa(addressData);
        var data = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            'id': 138,
            'args': [{
                'class': 'fr.protogen.masterdata.model.CCalloutArguments',
                label: 'Adresse',
                value: encodedAddress
            }]
        };
        var stringData = JSON.stringify(data);
        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'application/json');
            this.http.post(this.configuration.calloutURL, stringData, {headers:headers})
                .subscribe(data => {
                    this.data = data;
                    resolve(this.data);
                });
        });
    }

    /**
     * @description update employer and jobyer job address
     * @param id  : entreprise id for employer role and role id for jobyer role, address
     */
    updateUserJobAddress(id: string, street, cp, ville, pays){
        //  Now we need to save the address
        var addressData = {
            'class': 'com.vitonjob.localisation.AdressToken',
            'street': street,
            'cp': cp,
            'ville': ville,
            'pays': pays,
            'role': (this.projectTarget == 'employer' ? 'employeur' : this.projectTarget),
            'id': id,
            'type': 'travaille'
        };
        addressData = JSON.stringify(addressData);
        var encodedAddress = btoa(addressData);
        var data = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            'id': 138,
            'args': [{
                'class': 'fr.protogen.masterdata.model.CCalloutArguments',
                label: 'Adresse',
                value: encodedAddress
            }]
        };
        var stringData = JSON.stringify(data);

        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'application/json');
            this.http.post(this.configuration.calloutURL, stringData, {headers:headers})
                .subscribe(data => {
                    this.data = data;
                    resolve(this.data);
                });
        });
    }

    getAddressByUser(id){
        var payload = {
            'class' : 'fr.protogen.masterdata.model.CCallout',
            id : 165,
            args : [
                {
                    class : 'fr.protogen.masterdata.model.CCalloutArguments',
                    label : 'Requete de recherche',
                    value : btoa(id)
                },
                {
                    class : 'fr.protogen.masterdata.model.CCalloutArguments',
                    label : 'ID Offre',
                    value : btoa(this.projectTarget == 'employer' ? 'employeur' : this.projectTarget)
                }
            ]
        }
        var stringData = JSON.stringify(payload);

        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'application/json');
            this.http.post(this.configuration.calloutURL, stringData, {headers:headers})
                .subscribe(data => {
                    this.data = JSON.parse(data._body);
                    resolve(this.data);
                });
        });
    }

    /**
     * @description function to get the street name from an address returned by the google places service
     * @param address
     */
    getStreetFromGoogleAddress(address){
        var streetIndex = address.indexOf("street-address");
        var street = '';
        if (streetIndex > 0) {
            streetIndex = streetIndex + 16;
            var sub = address.substring(streetIndex, address.length - 1);
            var endStreetIndex = sub.indexOf('</');
            street = sub.substring(0, endStreetIndex);
        }
        return street;
    }

    /**
     * @description function to get the street name from an address returned by geolocation
     * @param result
     */
    getStreetFromGeolocAddress(result){
        if(result.address_components[0].types[0] == "route"){
            return result.address_components[0].long_name;
        }else{
            return "";
        }
    }

    /**
     * @description function to get the zip code from an address returned by the google places service
     * @param address
     */
    getZipCodeFromGoogleAddress(address){
        var cpIndex = address.indexOf("postal-code");
        var cp = '';
        if (cpIndex > 0) {
            cpIndex = cpIndex + 13;
            var subcp = address.substring(cpIndex, address.length - 1);
            var endCpIndex = subcp.indexOf('</');
            cp = subcp.substring(0, endCpIndex);
        }
        return cp;
    }

    /**
     * @description function to get the city name from an address returned by the google places service
     * @param address
     */
    getCityFromGoogleAddress(address){
        var villeIndex = address.indexOf("locality");
        var ville = '';
        if (villeIndex > 0) {
            villeIndex = villeIndex + 10;
            var subville = address.substring(villeIndex, address.length - 1);
            var endvilleIndex = subville.indexOf('</');
            ville = subville.substring(0, endvilleIndex);
        }
        return ville;
    }

    /**
     * @description function to get the city name from an address returned by geolocation
     * @param result
     */
    getCityFromGeolocAddress(result){
        if(result.address_components[3].types[0] == "locality"){
            return result.address_components[3].long_name;
        }else{
            return "";
        }
    }

    /**
     * @description function to get the country name from an address returned by the google places service
     * @param address
     */
    getCountryFromGoogleAddress(address){
        var paysIndex = address.indexOf("country-name");
        var pays = '';
        if (paysIndex > 0) {
            paysIndex = paysIndex + 14;
            var subpays = address.substring(paysIndex, address.length - 1);
            var endpaysIndex = subpays.indexOf('</');
            pays = subpays.substring(0, endpaysIndex);
        }
        return pays;
    }

    /**
     * @description function to get the country name from an address returned by geolocation
     * @param result
     */
    getCountryFromGeolocAddress(result){
        if(result.address_components[6].types[0] == "country"){
            return result.address_components[6].long_name;
        }else{
            return "";
        }
    }


    /**
     * @description function for uploading the scan to the server, in the forme of base 64 string
     * @param scanUri, userId, field, action
     */
    uploadScan(scanUri, userId, field, action){
        var role = (this.projectTarget == 'employer' ? 'employeur' : this.projectTarget)
        var scanData = {
            "class":'com.vitonjob.callouts.files.DataToken',
            "table":'user_'+ role,
            "field": field,
            "id": userId,
            "operation": action,
            "encodedFile": (scanUri)? scanUri.split(';base64,')[1] : ''
        };
        scanData = JSON.stringify(scanData);
        var encodedData = btoa(scanData);

        var body = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            'id': 97,
            'args': [{
                'class': 'fr.protogen.masterdata.model.CCalloutArguments',
                label: 'Upload fichier',
                value: encodedData
            }]
        };
        var stringData = JSON.stringify(body);

        //  send request
        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'application/json');
            this.http.post(this.configuration.calloutURL, stringData, {headers:headers})
                .subscribe(data => {
                    this.data = data;
                    resolve(this.data);
                });
        });
    }

    setNewPassword(phoneOrEmail){
        let encodedArg = btoa(phoneOrEmail);

        let payload = {
            'class': 'fr.protogen.masterdata.model.CCallout',
            id: 152,
            args: [{
                'class': 'fr.protogen.masterdata.model.CCalloutArguments',
                label: 'Contact to create',
                value: encodedArg
            }]
        };
        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'application/json');
            this.http.post(this.configuration.calloutURL, JSON.stringify(payload), {headers: headers})
                .map(res => res.json())
                .subscribe(data => {
                    this.status = data;
                    resolve(this.status);
                });
        });
    }

    getPassword(tel){
        var sql = "select mot_de_passe as valeur from user_account where telephone = '" + tel + "';";

        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
        })
    }

    updatePasswd(passwd, id){
        var sql = "update user_account set mot_de_passe = '" + passwd + "' where pk_user_account = '" + id + "';";

        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
        })
    }

    setObj(key, obj){
        this.db.set(key, JSON.stringify(obj));
    }

    getObj(key) {
        return new Promise((resolve, reject) => {
            this.db.get(key).then((value) => {
                resolve(value);
            }).catch( error => {
                reject(error);
            })
        });
    }

    updatePasswordByMail(email, password){
        let sql = "update user_account set mot_de_passe = '" + password + "' where email = '" + email + "';";

        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
        })
    }

    updatePasswordByPhone(tel, password){
        let sql = "update user_account set mot_de_passe = '" + password + "' where telephone = '" + tel + "';";

        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
        })
    }

    sendPasswordBySMS(tel, passwd){
        tel = tel.replace('+', '00');
        let url = "http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/envoisms";
        let payload = "<fr.protogen.connector.model.SmsModel>"
            + 	"<telephone>"+tel+"</telephone>"
            + 	"<text>Votre mot de passe est: " + passwd +".</text>"
            + "</fr.protogen.connector.model.SmsModel>";

        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/xml');
            this.http.post(url, payload, {headers:headers})
                .subscribe(data => {
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
        })
    }
    sendPasswordByEmail(email, passwd){
        let url = "http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/envoimail";
        let payload = "<fr.protogen.connector.model.MailModel>"
            + "<sendTo>"+email+"</sendTo>"
            + 	"<title>VitOnJob - Mot de passe réinitialisé</title>"
            + 	"<content>"
            + 		"Suite à votre requête nous avons procédé à une rénitialisation de votre mot de passe."
            + 		" Votre nouveau mot de passe est : "+passwd
            + 	"</content>"
            + 	"<status></status>"
            + "</fr.protogen.connector.model.MailModel>";

        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/xml');
            this.http.post(url, payload, {headers:headers})
                .subscribe(data => {
                    this.data = data;
                    console.log(this.data);
                    resolve(this.data);
                });
        })
    }

    saveRecruiter(email, passwd, accountid, newRecruiter){
        if(newRecruiter){
            var sql = "update user_account set mot_de_passe = '" + passwd + "', email = '" + email + "' where pk_user_account = '" + accountid + "'";

            return new Promise(resolve => {
                let headers = new Headers();
                headers.append("Content-Type", 'text/plain');
                this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                    .map(res => res.json())
                    .subscribe(data => {
                        this.data = data;
                        resolve(this.data);
                    });
            })
        }else{
            return new Promise(resolve => {
                this.data = null;
                resolve(this.data);
            });
        }
    }
	
	isEmpty(str){
		if(str == '' || str == 'null' || !str)
			return true;
		else
			return false;
	}
}