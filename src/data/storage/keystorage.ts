import Rx = require("rxjs");
import { Require, Service } from "typedi";

import { Credentials } from "../../domain/model/credentials";

@Service()
export class KeyStorage {

    private static readonly SERVICE = "SoncosoTogglImport";

    public constructor(@Require("keytar") private keytar: any) {
        this.storeCredentials = this.storeCredentials.bind(this);
        this.getCredentials = this.getCredentials.bind(this);
        this.deleteCredentials = this.deleteCredentials.bind(this);
    }

    public storeCredentials(key: string, credentials: Credentials): Rx.Observable<void> {
        const jsonCredentials = JSON.stringify(credentials);
        return Rx.Observable.fromPromise(this.keytar.setPassword(KeyStorage.SERVICE, key, jsonCredentials));
    }

    public getCredentials(key: string): Rx.Observable<Credentials> {
        return Rx.Observable.fromPromise(this.keytar.getPassword(KeyStorage.SERVICE, key))
            .map((json: string) => !json ? null : JSON.parse(json) as Credentials)
            .catch((error) => {
                console.error(`Failed to load credentials for "${key}":`, error);
                return this.deleteCredentials(key).map(() => null);
            });
    }

    public deleteCredentials(key: string): Rx.Observable<void> {
        return Rx.Observable.fromPromise(this.keytar.deletePassword(KeyStorage.SERVICE, key));
    }
}
