import {Pipe} from "@angular/core";
import {DateUtils} from "../../utils/date-utils";

@Pipe({
    name: 'dateConverter'
})
export class DateConverter {

    longDateOptions:any;
    shortDateOptions:any;

    transform(value, args) {
        this.longDateOptions = {
            weekday: "long", month: "long", year: "numeric",
            day: "numeric"
        };
        this.shortDateOptions = {
            month: "numeric", year: "numeric", day: "numeric"
        };
        if (args == 'long') {
            return new Date(value.replace(' ', 'T')).toLocaleDateString('fr-FR', this.longDateOptions);
        }
        if (args == 'short') {
            return new Date(value.replace(' ', 'T')).toLocaleDateString('fr-FR', this.shortDateOptions);
        }
        if(args == 'dateHour'){
            return DateUtils.convertToFormattedDateHour(new Date(value));
        }
    }
}