import { Injectable } from 'angular2/core';

/**
	* @author amine daoudi
	* @description a service for global helpers functions
*/

@Injectable()
export class Helpers {
	constructor() {
		
	}
    
    /**
		* @description convert date String to sql Timestamp format
		* @param dateStr 'dd/MM/yyyy'
	*/
    dateStrToSqlTimestamp(dateStr:string){
        var dateParts = dateStr.split('/');
        var day = dateParts[0];
        var month = dateParts[1];
        var year = dateParts[2];
        
        var date = new Date(year,month,day);
        var sqlTimestamp = date.getUTCFullYear() + '-' +
            ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
            ('00' + date.getUTCDate()).slice(-2) + ' ' + 
            ('00' + date.getUTCHours()).slice(-2) + ':' + 
            ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
            ('00' + date.getUTCSeconds()).slice(-2);
        return sqlTimestamp;
    }
    
    
    /**
		* @description convert date to sql Timestamp format
		* @param date Date
	*/
    dateToSqlTimestamp(date:Date){
        var sqlTimestamp = date.getUTCFullYear() + '-' +
            ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
            ('00' + date.getUTCDate()).slice(-2) + ' ' + 
            ('00' + date.getUTCHours()).slice(-2) + ':' + 
            ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
            ('00' + date.getUTCSeconds()).slice(-2);
        return sqlTimestamp;
    }
    
    
    /**
		* @description convert time String to minutes
		* @param timeStr 'hh:mm'
	*/
    timeStrToMinutes(timeStr:string){
        var timeParts = timeStr.split(':');
        var hours = parseInt(timeParts[0]);
        var minutes = parseInt(timeParts[1]);
        
        var totalMinutes = minutes + hours * 60;
        return totalMinutes;
    }
    
    
    
}
