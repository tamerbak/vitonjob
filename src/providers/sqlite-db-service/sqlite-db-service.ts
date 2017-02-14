import {Injectable} from "@angular/core";
import { SQLite } from 'ionic-native';

@Injectable()
export class SqliteDBService{
    private _db : SQLite;
    private _energized : boolean = false;
    constructor(){
        this._db = new SQLite();
    }

    initialize(){
        this._db.openDatabase({
            name: "voj.db",
            location: "default",
            createFromLocation : 1
        }).then(() => {
            this._energized = true;
            console.log("SQLITE ENERGIZED");
        }, (err) => {
            console.error('Unable to open database: ', err);
        });
    }

    public executeSelect(sql : string) : any {
        if(this._energized)
            return new Promise(resolve=>{
                this._db.executeSql(sql, {}).then((data:any) => {
                    resolve(data);
                }, (err) => {
                    console.error('Unable to execute sql: ', err);
                    resolve([]);
                });
            });
        else
            return new Promise(resolve=>{
                this._db.openDatabase({
                    name: "voj.db",
                    location: "default",
                    createFromLocation : 1
                }).then(() => {
                    this._energized = true;
                    console.log("SQLITE ENERGIZED");
                    this._db.executeSql(sql, {}).then((data:any) => {
                        resolve(data);
                    }, (err) => {
                        console.error('Unable to execute sql: ', err);
                        resolve([]);
                    });
                }, (err) => {
                    console.error('Unable to open database: ', err);
                    resolve([]);
                });
            });

    }
}