import Rx = require("rxjs");
import { Require, Service } from "typedi";

import { Credentials } from "../../domain/model/credentials";
import SoncosoModel = require("../../domain/model/soncoso");
import { BaseStorage } from "./basestorage";
import { KeyStorage } from "./keystorage";

@Service()
export class SoncosoStorage {

    private static USER_KEY = "soncoso_user";
    private currentUserSubject: Rx.BehaviorSubject<SoncosoModel.UserInfo> = null;

    public constructor(private keystorage: KeyStorage) {
        this.currentUserSubject = new Rx.BehaviorSubject(null);

        this.setSoncosoCredentials = this.setSoncosoCredentials.bind(this);
        this.getSoncosoCredentials = this.getSoncosoCredentials.bind(this);
        this.deleteSoncosoCredentials = this.deleteSoncosoCredentials.bind(this);
        this.setSoncosoUser = this.setSoncosoUser.bind(this);
        this.currentSoncosoUser = this.currentSoncosoUser.bind(this);
        this.deleteSoncosoUser = this.deleteSoncosoUser.bind(this);
    }

    public setSoncosoCredentials(credentials: Credentials): Rx.Observable<void> {
        return this.keystorage.storeCredentials(SoncosoStorage.USER_KEY, credentials);
    }

    public getSoncosoCredentials(): Rx.Observable<Credentials> {
        return this.keystorage.getCredentials(SoncosoStorage.USER_KEY);
    }

    public deleteSoncosoCredentials(): Rx.Observable<void> {
        return this.keystorage.deleteCredentials(SoncosoStorage.USER_KEY);
    }

    public setSoncosoUser(user: SoncosoModel.UserInfo): Rx.Observable<SoncosoModel.UserInfo> {
        this.currentUserSubject.next(user);
        return Rx.Observable.of(user);
    }

    public currentSoncosoUser(): Rx.Observable<SoncosoModel.UserInfo> {
        return this.currentUserSubject;
    }

    public deleteSoncosoUser(): Rx.Observable<SoncosoModel.UserInfo> {
        return this.currentUserSubject.map((user) => {
            this.currentUserSubject.next(null);
            return user;
        });
    }
}
