import {Injectable} from '@angular/core';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';
import {Http, Headers} from '@angular/http';

@Injectable()
export class RecruiterService{
    configuration : any;
    projectTarget:string;

    constructor(public http: Http,public gc: GlobalConfigs) {
        // Get target to determine configs
        this.projectTarget = gc.getProjectTarget();
        this.configuration = Configs.setConfigs(this.projectTarget);
    }

    loadRecruiters(id){
        //  Init project parameters
        var sql = "SELECT r.nom as lastname, r.prenom as firstname, a.telephone as phone, a.email, a.pk_user_account as accountid FROM user_recruteur as r, user_account as a where r.fk_user_employeur = '"+id+"' and r.fk_user_account = a.pk_user_account";
        console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    this.data = data;
                    resolve(this.data);
                });
        });
    }
	
	insertRecruiters(contacts, employerId, fromPage){
		var sql = "insert into user_account (role, telephone, est_employeur) values ";
		var recruiterList = [];
		for(var i = 0; i < contacts.length; i++){
			var recruiter = this.constituteRecruiterObject(contacts[i], fromPage);
			recruiterList.push(recruiter);
			var valuesStr = " ('recruteur', '" + recruiter.phone + "', 'non')";
			if(i == 0){
				sql = sql + valuesStr;
				continue;
			}
			sql = sql + ", " + valuesStr;
		}
        console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(values => {
                    this.retrieveRecruitersAccount(recruiterList).then((accounts) => {
						this.insertRecruitersInfo(accounts, employerId, recruiterList).then((data) => {
							this.data = data;
							resolve(this.data);
						});						
					});
                });
        });
	}
	
	retrieveRecruitersAccount(recruiterList){
		var str = "";
		for(var i = 0; i < recruiterList.length; i++){
			if(i == 0){
			str = "'" + recruiterList[i].phone + "'";
				continue;
			}
		str = str + ", '" + recruiterList[i].phone + "'";
		}
        var sql = "select pk_user_account, email, telephone from user_account where telephone in (" + str  + ") and role = 'recruteur'";
		console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
                    this.data = data;
					resolve(this.data);
                });
        });
	}
	
	insertRecruitersInfo(accountData, employerId, recruiterList){
		var sql = "insert into user_recruteur (nom, prenom, fk_user_account, fk_user_employeur) values ";
		for(var i = 0; i < recruiterList.length; i++){
			recruiterList[i].accountid = accountData.data[i].pk_user_account;
			var valuesStr = "('" + recruiterList[i].lastname + "', '" + recruiterList[i].firstname + "', '" + accountData.data[i].pk_user_account + "', '" + employerId + "')";
			if(i == 0){
				sql = sql + valuesStr;
				continue;
			}
			sql = sql + ", " + valuesStr;
		}
        console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
					if(!data || data.status != 'success'){
						this.data = data;
					}else{
						this.data = recruiterList;
					}
					resolve(this.data);
                });
        });	
	}
	
	splitRecruiterName(contact){
		var firstname = '';
		var lastname = '';
		if(contact.name.givenName && contact.name.givenName == contact.displayName && !contact.name.familyName){
			firstname = contact.displayName.split(' ')[0];
			lastname = (contact.displayName.split(' ').length == 1 ? '' : contact.displayName.split(' ')[1]);
		}else{
			firstname = (contact.name.givenName ? contact.name.givenName : (contact.displayName == null ? '' : contact.displayName.split(' ')[0]));
			lastname = (contact.name.familyName ? contact.name.familyName : (contact.displayName == null ? '' : contact.displayName.split(' ')[1]));				
		}
		var array = [];
		array.push(firstname);
		array.push(lastname);
		return array;
	}
	
	constituteRecruiterObject(contact, fromPage){
		var recruiter = {};
		if(fromPage == 'repertory'){
			var name = this.splitRecruiterName(contact);
			recruiter = {email: (contact.emails != null ? contact.emails[0].value : ''), phone: (contact.phoneNumbers != null ? contact.phoneNumbers[0].value : ''), firstname: name[0], lastname: name[1]};
		}
		else{
			recruiter = {email: contact.email, phone: contact.phone, firstname: contact.firstname, lastname: contact.lastname};
		}
		return recruiter;
	}
	
	updateRecruiter(recruiter, employerId){
		var sql1 = "update user_recruteur set titre = '" + recruiter.title + "', nom = '" + recruiter.lastname + "', prenom ='" + recruiter.firstname + "' where fk_user_account = '" + recruiter.accountid + "' and fk_user_employeur = '" + employerId+ "';";
		var sql2 = " update user_account set telephone = '" + recruiter.phone + "' where pk_user_account = '" + recruiter.accountid + "' and role = 'recruteur';";
		var sql = sql1 + sql2;
		console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(data => {
					this.data = data;
					resolve(this.data);
                });
        });	
	}
	
	sendNotificationBySMS(tel, user, passwd){
		tel = tel.replace('+', '00');
		let url = "http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/envoisms";
		var msg = user.titre + " " + user.nom + " " + user.prenom + " vous invite à télécharger et installer l'application VitOnJob. http://www.vitonjob.com/telecharger/telecharger-appli-employeurs/\n Votre mot de passe est " + passwd;
		let payload = "<fr.protogen.connector.model.SmsModel>"
		+ 	"<telephone>"+tel+"</telephone>"
		+ 	"<text>" + msg +"</text>"
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
	
	generatePasswd(accountid){
		var passwd = (((1+Math.random())*0x10000)|0).toString(16).substring(1) + 'MO';
		var hashedPasswd = md5(passwd);
		var sql = "update user_account set mot_de_passe = '" + hashedPasswd + "' where pk_user_account = '" + accountid + "'";
			
		return new Promise(resolve => {
			let headers = new Headers();
			headers.append("Content-Type", 'text/plain');
			this.http.post(this.configuration.sqlURL, sql, {headers:headers})
			.map(res => res.json())
			.subscribe(data => {
				this.data = passwd;
				resolve(this.data);
			});
		})
	}
}