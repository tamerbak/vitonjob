import {Page} from 'ionic-angular';
import {Configs} from '../../configurations/configs';
import {GlobalConfigs} from '../../configurations/globalConfigs';

@Page({
    templateUrl: 'build/pages/home/home.html',
    providers: [GlobalConfigs]
})
export class HomePage {
    private projectName;
    private themeColor;
    private isEmployer;

    constructor(gc:GlobalConfigs) {
        // Get target to determine configs
        let projectTarget:string = gc.getProjectTarget();

        // get config of selected target
        let config = Configs.setConfigs(projectTarget);

        //Initialize controller variables :
        this.projectName = config.projectName;
        this.themeColor = config.themeColor;

        if (projectTarget == 'employer')
            this.isEmployer = false;
        else
            this.isEmployer = true;


    }
}
