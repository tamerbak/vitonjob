import {AbstractGCallout} from "./generium/abstract-gcallout";

export class CalendarSlot extends AbstractGCallout {
  'class': string;
  idCalendar: number;
  date: any; // Date
  dateEnd: any; // Date
  startHour: any; // minute
  endHour: any; // minute
  type: string;
  pause: boolean;

  constructor() {
    super('com.vitonjob.callouts.offer.model.CalendarData');

    this.idCalendar = 0;
    this.date = 0;
    this.dateEnd = 0;
    this.startHour = 0;
    this.endHour = 0;
    this.type = '';
    this.pause = false;
  }
}
