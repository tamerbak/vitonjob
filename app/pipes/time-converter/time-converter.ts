import {Pipe} from '@angular/core';

@Pipe({
	name: 'timeConverter'
})
export class TimeConverter {
	transform(value, args) {
		if(args == 'minute'){
			var hours = value / 60;
			var minutes = value % 60;
			return (hours + ':' + (minutes < 10 ? ('0' + minutes) : minutes));
		}
	}
}