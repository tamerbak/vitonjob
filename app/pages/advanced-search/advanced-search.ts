import {Component} from "@angular/core";
import {NavController, PickerColumnOption, Picker, SqlStorage, Storage, Platform} from "ionic-angular";
import {OffersService} from "../../providers/offers-service/offers-service";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {DatePicker} from "ionic-native/dist/index";

/*
 Generated class for the AdvancedSearchPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/advanced-search/advanced-search.html',
    providers: [OffersService]
})
export class AdvancedSearchPage {
    private slot: any;
    showedSlot: any;
    private db: any;
    private service: any;
    private listSectors: any;
    private listJobs: any;
    private projectTarget: any;
    private idSector: number;
    private sector: string;
    private job: string;
    private idJob: number;
    private dateEvent: any;
    isAndroid4: boolean;
    platform: any;


    constructor(private nav: NavController, _service: OffersService, gc: GlobalConfigs, platform: Platform) {
        this.service = _service;
        this.db = new Storage(SqlStorage);
        this.projectTarget = gc.getProjectTarget();
        this.isAndroid4 = (platform.version('android').major < 5);
        this.platform = platform;
        _service.loadSectors(this.projectTarget).then(listSectors => {
            if (listSectors) {
                this.listSectors = listSectors;
                this.db.set('listSectors', JSON.stringify(listSectors));
            }
        });
        _service.loadJobs(this.projectTarget, this.idSector).then(listJobs => {
            if (listJobs) {
                this.listSectors = listJobs;
                this.db.set('listJobs', JSON.stringify(listJobs));
            }
        });
        this.slot = {
            date: new Date()

        };
        if (this.isAndroid4) {
            this.showedSlot = {
                date: this.toDateString(new Date().getTime())
            };
        } else {
            this.showedSlot = {
                date: new Date().toISOString()
            };
        }


    }


    setSectorsPicker() {
        let rating = 0;
        let picker = Picker.create();
        let options: PickerColumnOption[] = new Array<PickerColumnOption>();
        this.db.get('listSectors').then(listSectors => {
            if (listSectors) {
                listSectors = JSON.parse(listSectors);

                for (let i = 1; i < listSectors.length; i++) {
                    options.push({
                        value: listSectors[i].id,
                        text: listSectors[i].libelle
                    })
                }
            }
            let column = {
                selectedIndex: 0,
                options: options
            };

            picker.addColumn(column);
            picker.addButton('Annuler');
            picker.addButton({
                text: 'Valider',
                handler: data => {
                    this.sector = data.undefined.text;
                    this.idSector = data.undefined.value;
                    this.filterJobList();
                    this.job = '';
                    this.idJob = 0;
                }
            });
            picker.setCssClass('sectorPicker');
            this.nav.present(picker);

        });
    }

    /**
     * Sectors picker
     */
    setJobsPicker() {
        let rating = 0;
        let picker = Picker.create();
        let options: PickerColumnOption[] = new Array<PickerColumnOption>();


        this.db.get('listJobs').then(
            list => {
                if (list) {
                    list = JSON.parse(list);
                    let q = this.idSector;

                    // if the value is an empty string don't filter the items
                    if (!(q === '')) {
                        list = list.filter((v) => {
                            return (v.idsector == q);
                        });
                    }

                    this.listJobs = list;
                    for (let i = 1; i < this.listJobs.length; i++) {
                        options.push({
                            value: this.listJobs[i].id,
                            text: this.listJobs[i].libelle
                        })
                    }
                    let column = {
                        selectedIndex: 0,
                        options: options
                    };

                    picker.addColumn(column);
                    picker.addButton('Annuler');
                    picker.addButton({
                        text: 'Valider',
                        handler: data => {
                            this.job = data.undefined.text;
                            this.idJob = data.undefined.value;
                        }
                    });
                    picker.setCssClass('jobPicker');
                    this.nav.present(picker);

                }
            }
        );
    }

    filterSectorList(ev) {
        var q = ev.target.value;

        // if the value is an empty string don't filter the items
        if (q.trim() == '') {
            return;
        }

        this.listSectors = this.listSectors.filter((v) => {
            return (v.label.toLowerCase().indexOf(q.toLowerCase()) > -1);
        })
    }

    filterJobList() {

        this.db.get('listJobs').then(
            list => {
                if (list) {
                    list = JSON.parse(list);
                    let q = this.idSector;

                    // if the value is an empty string don't filter the items
                    if (!(q === '')) {
                        list = list.filter((v) => {
                            return (v.idsector == q);
                        });
                        this.listJobs = list;
                    }

                }
            }
        );

    }

    /**
     * launching dateTimePicker component for slot selection
     */
    launchDateTimePicker(type, flag) {

        DatePicker.show({
            date: new Date(),
            mode: type,
            minuteInterval: 15, androidTheme: this.calendarTheme, is24Hour: true,
            allowOldDates: false, doneButtonLabel: 'Ok', cancelButtonLabel: 'Annuler', locale: 'fr_FR'
        }).then(
            date => {
                console.log("Got date: ", date);

                switch (flag) {
                    case 'start' :
                        this.slot.startHour = date.getHours() * 60 + date.getMinutes();
                        this.showedSlot.startHour = this.toHourString(this.slot.startHour);
                        break;
                    case 'end' :
                        this.slot.endHour = date.getHours() * 60 + date.getMinutes();
                        this.showedSlot.endHour = this.toHourString(this.slot.endHour);
                        break;
                    default :
                        this.slot.date = date.getTime();
                        this.showedSlot.date = this.toDateString(this.slot.date.getTime(), '');
                        this.showedSlot.angular4Date = this.toDateString(this.slot.date.getTime(), '');
                        break;
                }
            },
            err => console.log("Error occurred while getting date:", err)
        );
    }

    /**
     * @Description Converts a timeStamp to date string :
     * @param date : a timestamp date
     * @param options Date options
     */
    toDateString(date: number, options: any) {
        let d = new Date(date);
        return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
    }


}
