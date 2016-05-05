import {Page, Config} from 'ionic-angular';
//import {Config} from 'ionic';
import {Configs} from '../../configurations/configs';
import {myApp} from '../../app';

@Page({
    templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
    private projectName;

    constructor() {

        //var config = new Config();
        myApp.
        let config = Configs.setConfigs("employer");
        this.projectName = config.get('projectName');
        //let test:string = Page.name;
    }
}
