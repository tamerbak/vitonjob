import {Component, ElementRef, ViewChild} from "@angular/core";
import {NavController} from "ionic-angular";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Configs} from "../../configurations/configs";

declare var myCanvas;
declare var myCol;
/*
 Generated class for the ContractWizardPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    templateUrl: 'build/pages/contract-wizard/contract-wizard.html',
    providers: [GlobalConfigs]
})
export class ContractWizardPage {
    @ViewChild('myCanvas') myCanvas: ElementRef;
    @ViewChild('myCol') myCol: ElementRef;
    projectTarget: string;
    themeColor: string;
    isEmployer: boolean;
    backgroundImage: any;
    isDisabled: boolean;
    systemColor: {
        validated: string,
        inProgress: string,
        nextStep: string
    };
    stepStyle: {
        interviewColor: string,
        validationColor: string,
        signatureColor: string,
        ArchiveColor: string
    };
    step: {
        employer: {
            isValidated: boolean,
            isSigned: boolean,
            isCBRIB: boolean
        }
        jobyer: {
            isValidated: boolean,
            isSigned: boolean,
            isCBRIB: boolean
        }
    };

    constructor(private nav: NavController, gc: GlobalConfigs) {

        this.projectTarget = gc.getProjectTarget();
        let config = Configs.setConfigs(this.projectTarget);
        this.themeColor = config.themeColor;
        this.backgroundImage = config.backgroundImage;
        this.isEmployer = this.projectTarget === 'employer';
        this.isDisabled = true;
        this.stepStyle = {backgroundColor: "dodgerblue"};
        this.systemColor = {
            validated: 'green',
            inProgress: 'orange',
            nextStep: 'dodgerblue'
        }

    }

    onPageWillEnter() {

    }

    ngAfterViewInit() {

        var ctx = myCanvas.getContext("2d");

        ctx.lineWidth = 30;
        ctx.beginPath();
        ctx.moveTo(0, 75);
        ctx.lineTo(300, 75);
        ctx.strokeStyle = this.systemColor.nextStep; //deepskyblue//dodgerblue
        ctx.stroke();

        // Validation step validated
        ctx.lineWidth = 30;
        ctx.beginPath();
        ctx.moveTo(0, 75);
        ctx.lineTo(100, 75);
        ctx.strokeStyle = this.systemColor.validated;
        ctx.stroke();

        //ctx.lineWidth = 20;
        /*ctx.beginPath();
         ctx.moveTo(300,75);
         ctx.lineTo(300,150);
         ctx.stroke();*/
    }

    /**
     * Initialize Contract state
     */
    initContractState() {

        // todo: get contract informations from backend

        //test part :
        this.step.employer = {
            isValidated: false,
            isSigned: false,
            isCBRIB: false
        };
        this.step.jobyer = {
            isValidated: false,
            isSigned: false,
            isCBRIB: false
        };

        // validated part
        this.stepStyle = {
            interviewColor: this.systemColor.validated,
            validationColor: (this.step.employer.isValidated && this.step.jobyer.isValidated) ?
                this.systemColor.validated :
                this.systemColor.inProgress,
            signatureColor: (this.step.employer.isSigned && this.step.jobyer.isSigned) ?
                this.systemColor.validated :
                this.systemColor.inProgress,
            ArchiveColor: (this.step.employer.isCBRIB && this.step.jobyer.isCBRIB) ?
                this.systemColor.validated :
                this.systemColor.inProgress
        };
    }

}
