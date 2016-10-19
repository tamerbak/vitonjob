import {Component} from "@angular/core";
import {NavController, ViewController} from "ionic-angular";

@Component({
    templateUrl: 'build/pages/popover-recruiter/popover-recruiter.html'
})
export class PopoverRecruiterPage {
    ctrlView: any;

    constructor(private nav: NavController, ctrlView: ViewController) {
        this.ctrlView = ctrlView;
    }

    blockRecruiter() {
        this.ctrlView.dismiss({option: 1});
    }

    deleteRecruiter() {
        this.ctrlView.dismiss({option: 2});
    }
}