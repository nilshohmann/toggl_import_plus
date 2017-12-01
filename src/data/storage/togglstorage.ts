import Rx = require("rxjs");
import { Require, Service } from "typedi";

import { Credentials } from "../../domain/model/credentials";
import TogglModel = require("../../domain/model/toggl");
import { KeyStorage } from "./keystorage";

@Service()
export class TogglStorage {

    private static USER_KEY = "toggl_user";
    private currentUserSubject: Rx.BehaviorSubject<TogglModel.UserInfo> = null;

    public constructor(private keystorage: KeyStorage) {
        this.currentUserSubject = new Rx.BehaviorSubject(null);

        this.setTogglCredentials = this.setTogglCredentials.bind(this);
        this.getTogglCredentials = this.getTogglCredentials.bind(this);
        this.deleteTogglCredentials = this.deleteTogglCredentials.bind(this);
        this.setTogglUser = this.setTogglUser.bind(this);
        this.currentTogglUser = this.currentTogglUser.bind(this);
        this.deleteTogglUser = this.deleteTogglUser.bind(this);
    }

    public setTogglCredentials(credentials: Credentials): Rx.Observable<void> {
        return this.keystorage.storeCredentials(TogglStorage.USER_KEY, credentials);
    }

    public getTogglCredentials(): Rx.Observable<Credentials> {
        return this.keystorage.getCredentials(TogglStorage.USER_KEY);
    }

    public deleteTogglCredentials(): Rx.Observable<void> {
        return this.keystorage.deleteCredentials(TogglStorage.USER_KEY);
    }

    public setTogglUser(user: TogglModel.UserInfo): Rx.Observable<TogglModel.UserInfo> {
        this.currentUserSubject.next(user);
        return Rx.Observable.of(user);
    }

    public currentTogglUser(): Rx.Observable<TogglModel.UserInfo> {
        return this.currentUserSubject;
    }

    public deleteTogglUser(): Rx.Observable<TogglModel.UserInfo> {
        return this.currentUserSubject.map((user) => {
            this.currentUserSubject.next(null);
            return user;
        });
    }
}
