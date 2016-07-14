import {Pipe} from '@angular/core';

@Pipe({
	name: 'timeConverter'
})
export class TimeConverter {
	transform(value, args) {
		if(args == 'minute'){
			var hours = Math.floor(value / 60);
			var minutes = value % 60;
			if(!hours && !minutes){
				return '';
			}else{
				return ((hours < 10 ? ('0' + hours) : hours) + ':' + (minutes < 10 ? ('0' + minutes) : minutes));
			}

		}
	}
}