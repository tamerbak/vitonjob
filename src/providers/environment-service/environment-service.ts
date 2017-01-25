import {Injectable} from "@angular/core";
import {Configs} from "../../configurations/configs";
import {GlobalConfigs} from "../../configurations/globalConfigs";
import {Http} from "@angular/http";
import {Utils} from "../../utils/utils";
import {Storage} from "@ionic/storage";


@Injectable()
export class EnvironmentService {
  environment: any[];

  constructor(private http: Http, private _globalConfig: GlobalConfigs,private storage: Storage) {
    this.reload();
  }

  loadUserEnvironment(accountId) {
    let bean = {
      'class': 'com.vitonjob.api.CalloutConfiguration',
      'idUser': accountId,
    };
    let beanStr = JSON.stringify(bean);
    let encodedBean = btoa(beanStr);
    let data = {
      'class': 'fr.protogen.masterdata.model.CCallout',
      'id': 60000,
      'args': [{
        'class': 'fr.protogen.masterdata.model.CCalloutArguments',
        label: 'Recuperation environnement du compte',
        value: encodedBean
      }]
    };
    let stringData = JSON.stringify(data);
    return new Promise(resolve => {
      let headers = Configs.getHttpJsonHeaders();
      this.http.post(Configs.calloutURL, stringData, {headers: headers})
        .subscribe((data: any) => {
          if (data && data._body) {
            this.environment = JSON.parse(data._body);
          }
          resolve(this.environment);
        });
    });
  }

  /**
   * Return the value of the given key from environment
   * @param variableName
   */
  get(variableName: string) {
    if (Utils.isEmpty(this.environment) == false) {
      let value = this.environment[variableName];
      if (Utils.isEmpty(value) == false) {
        return value;
      }
    }
    return null;
  }

  reload() {
      let projectTarget = this._globalConfig.getProjectTarget();
      let config = Configs.setConfigs(projectTarget);
      this.storage.get(config.currentUserVar).then((value) => {
        if (value) {
            let currentUser = JSON.parse(value);
            console.log("cusr",currentUser)
            if (Utils.isEmpty(currentUser) == false) {
                this.loadUserEnvironment(currentUser.id).then((data: any) => {
                    this.environment = data;
                });
            } else {
                this.environment = [];
            }
        }
      });

      
    
  }

  clear(): void {
    this.environment = [];
  }
}
