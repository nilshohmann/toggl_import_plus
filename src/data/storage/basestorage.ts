import Rx = require("rxjs");

export class BaseStorage {

    public constructor(private storage: any) {
        storage.initSync({ logging: false });
    }

    public clear(): Rx.Observable<void> {
        return Rx.Observable.fromPromise(this.storage.clear());
    }

    public set<Type>(key: string, value: Type): Rx.Observable<Type> {
        const rawValue = JSON.stringify({ value });
        return Rx.Observable.fromPromise(this.storage.setItem(key, rawValue))
            .map((result: any) => value);
    }

    public get<Type>(key: string): Rx.Observable<Type> {
        return Rx.Observable.fromPromise(this.storage.getItem(key))
            .map((value: any) => !value ? null : JSON.parse(value).value as Type);
    }

    public remove<Type>(key: string): Rx.Observable<Type> {
        return Rx.Observable.fromPromise(this.storage.removeItem(key))
            .map((value: any) => !value ? null : JSON.parse(value).value as Type);
    }
}
