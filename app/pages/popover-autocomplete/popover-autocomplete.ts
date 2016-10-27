import {Component} from "@angular/core";
import {NavController, NavParams, ViewController, Alert} from "ionic-angular";

/*
 Generated class for the PopoverAutocompletePage page.
 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/popover-autocomplete/popover-autocomplete.html',

})
export class PopoverAutocompletePage {
    list: any;
    viewCtrl: any;
    searchQuery: string;
    searchPlaceholder: string;
    cancelText: string = " ";
    label: string;
    nav: any;

    constructor(private navParams: NavParams, viewCtrl: ViewController, nav: NavController) {
        this.viewCtrl = viewCtrl;
        this.nav = nav;
        this.searchQuery = "";
        this.label = navParams.get('type');
        this.searchPlaceholder = 'Un ' + this.label + '...';
    }

    ngOnInit() {

        if (this.navParams.data) {
            this.list = this.navParams.data.list;
        }
    }

    itemSelection(item) {
        if (this.navParams.data) {
            this.viewCtrl.dismiss({libelle: item.libelle, id: item.id});
        }
    }

    addNewLabel() {
        if (this.navParams.data) {

            if (this.navParams.data.idSector) {
                //this.service.addNewJob(this.searchQuery, this.navParams.data.idSector);
                this.viewCtrl.dismiss({libelle: this.searchQuery, id: ''});
            } else {
                let alert = Alert.create({
                    title: 'Attention!',
                    subTitle: 'Vous ne pouvez pas créer un job sans préciser le secteur auquel il appartient.',
                    buttons: ['OK']
                });
                this.nav.present(alert);
                alert.onDismiss(() => {
                    this.viewCtrl.dismiss({libelle: '', id: ''});
                })
            }
        }
    }

    cancelNewLabel() {
        this.searchQuery = '';
        this.viewCtrl.dismiss({libelle: '', id: ''});
    }

    /**
     * @Description : searching typed text in selection items
     * @param searchbar : search value
     */
    getItems(searchbar) {
        // Reset items back to all of the items
        this.list = this.navParams.data.list;

        // set q to the value of the searchbar
        let q = searchbar.value;

        // if the value is an empty string don't filter the items
        if (q.trim() == '') {
            return;
        }

        this.list = this.list.filter((v) => {
            return (v.libelle.toLowerCase().indexOf(q.toLowerCase()) > -1);
        })
    }


}