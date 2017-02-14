import {Injectable} from "@angular/core";
import {SqliteDBService} from "../providers/sqlite-db-service/sqlite-db-service";
import {HttpRequestHandler} from "../http/http-request-handler";
import {Http} from "@angular/http";

interface  AbstractDAO {
    loadData(sql : string);
}

class SqliteDAO implements AbstractDAO {
    private _db : SqliteDBService;
    constructor(_db : SqliteDBService){
        this._db = _db;
    }
    public loadData(sql : string){
        return new Promise(resolve => {
            this._db.executeSelect(sql).then((data: any) => {
                let listData = [];
                for (let i = 0; i < data.rows.length; i++) {
                    let item = data.rows.item(i);
                    listData.push(item);
                }
                resolve(listData);
            });
        });
    }
}

class GeneriumDAO implements AbstractDAO {
    _silent : boolean;
    _co : any;
    _hr :HttpRequestHandler;
    constructor(_silent : boolean, _co : any, httpRequest: HttpRequestHandler){
        this._silent = _silent;
        this._co = _co;
        this._hr = httpRequest;
    }
    public loadData(sql : string){
        return new Promise(resolve => {
            this._hr.sendSql(sql, this._co, this._silent).subscribe((data: any) => {
                if(data.data)
                    resolve(data.data);
                else
                    resolve([]);
            })
        });
    }
}

@Injectable()
export class DAOFactory{

    constructor(public _db : SqliteDBService,public http: Http, public httpRequest: HttpRequestHandler){}

    public constructDAO(mode : string, classObject?: any, silent?: boolean) : AbstractDAO{
        let obj : AbstractDAO;
        let _silent :boolean;
        if(silent !== true)
            _silent = false;
        else
            _silent = true;
        if(mode =='local')
            obj = new SqliteDAO(this._db);
        else
            obj = new GeneriumDAO(_silent, classObject, this.httpRequest);
        return obj;
    }
}