/**
 * Created by tim on 04/05/16.
 */
/*export class Configs {

 public static projectName : string = "VitOnJob Employeur" ; // "VitOnJob Jobyer"


 constructor() {

 }
 }*/


interface AbstractConfigs {
    projectName:string;
    /*method(param?:any):void;
    getProjectName():string;*/
}

class EmployerConfigs implements AbstractConfigs {
    projectName:string = "VitOnJob Employeur";
    /*method = (param?:any) => {
        this.projectName = "VitOnJob Employeur";
    };

    public getProjectName = function ():string {
        return this.projectName;
    };

    private setProjectName = function (name:string):void {
        this.projectName = name;
    }*/
}

class JobyerConfigs implements AbstractConfigs {
    projectName:string = "VitOnJob Jobyer";
    /*method = (param?:any) => {
     this.projectName = "VitOnJob Jobyer";
     };

     public getProjectName = function ():string {
     return this.projectName;
     }*/
}


export class Configs {
    public static setConfigs(type:string):AbstractConfigs {
        if (type === "employer") {
            return new EmployerConfigs();
        } else if (type === "jobyer") {
            return new JobyerConfigs();
        }

        return null;
    }
}