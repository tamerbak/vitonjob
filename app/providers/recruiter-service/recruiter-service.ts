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
        var sql = "SELECT r.nom, r.prenom, a.telephone as phone, a.email, a.pk_user_account as accountid FROM user_recruteur as r, user_account as a where r.fk_user_employeur = '"+id+"' and r.fk_user_account = a.pk_user_account";
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
	
	insertRecruiters(contacts, employerId){
		var sql = "insert into user_account (email, role, telephone, est_employeur) values ";
		var recruiterList = [];
		var recruiter;
		for(var i = 0; i < contacts.length; i++){
			recruiter = {email: (contacts[i].emails != null ? contacts[i].emails[0].value : ''), phone: (contacts[i].phoneNumbers != null ? contacts[i].phoneNumbers[0].value : '')};
			recruiterList.push(recruiter);
			if(i == 0){
				sql = sql + " ('" + recruiter.email + "', 'recruteur', '" + recruiter.phone + "', 'non')";
				continue;
			}
			sql = sql + ", ('" + recruiter.email + "', 'recruteur', '" + recruiter.phone + "', 'non')";
		}
        console.log(sql);
        return new Promise(resolve => {
            let headers = new Headers();
            headers.append("Content-Type", 'text/plain');
            this.http.post(this.configuration.sqlURL, sql, {headers:headers})
                .map(res => res.json())
                .subscribe(values => {
                    this.retrieveRecruitersAccount(contacts).then((accounts) => {
						this.insertRecruitersInfo(contacts, accounts, employerId, recruiterList).then((data) => {
							this.data = data;
							resolve(this.data);
						});						
					});
                });
        });
	}
	
	insertRecruitersInfo(contacts, accountData, employerId, recruiterList){
		var sql = "insert into user_recruteur (nom, prenom, fk_user_account, fk_user_employeur) values ";
		for(var i = 0; i < contacts.length; i++){
			var name = this.splitRecruiterName(contacts[i]);
			recruiterList[i].nom = name[1];
			recruiterList[i].prenom = name[0];
			recruiterList[i].accountid = accountData.data[i].pk_user_account;
			if(i == 0){
				sql = sql + "('" + name[1] + "', '" + name[0] + "', '" + accountData.data[i].pk_user_account + "', '" + employerId + "')";
				continue;
			}
			sql = sql + ", ('" + name[1] + "', '" + name[0] + "', '" + accountData.data[i].pk_user_account + "', '" + employerId + "')";
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
	
	retrieveRecruitersAccount(contacts){
		var str = "";
		for(var i = 0; i < contacts.length; i++){
			if(i == 0){
				str = "'" + contacts[i].phoneNumbers[0].value + "'";
				continue;
			}
			str = str + ", '" + contacts[i].phoneNumbers[0].value + "'";
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
}