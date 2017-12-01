
interface ArrayConstructor {
    zip<T>(...arrays: T[][]): T[][];
}

interface Array<T> {
    firstOrNull(query?: (item: T) => boolean): T;
    firstIndexOf(query: (item: T) => boolean): number;
    spliceQuery(query: (item: T) => boolean): T[];
    groupBy<K>(query: (item: T) => any): Array<Group<T, K>>;
    order(query: (item: T) => string | number | boolean, descending?: boolean): T[];
    unique(): T[];
}

if (!Array.zip) {
    Array.zip = function(...arrays: any[]): any[][] {
        const l = Math.max(...arrays.map((r) => r.length));
        return [...new Array(l)].map((_, c) => arrays.map((r) => r[c]));
    };
}

class Group<T, K> extends Array<T> {

    public constructor(public key: K) {
        super();
    }
}

if (!Array.prototype.firstOrNull) {
    Array.prototype.firstOrNull = function(query?: (item: any) => boolean): any {
        const a = !!query ? this.filter(query) : this;
        return a.length === 0 ? null : a[0];
    };
}

if (!Array.prototype.firstIndexOf) {
    Array.prototype.firstIndexOf = function(query: (item: any) => boolean): number {
        const indeces = this.map((e: any, i: number) => query(e) ? i : -1).filter((index: number) => index >= 0);
        return indeces.length > 0 ? indeces[0] : -1;
    };
}

if (!Array.prototype.spliceQuery) {
    Array.prototype.spliceQuery = function(query: (item: any) => boolean): any[] {
        let result: any[] = [];

        let i = 0; while (i < this.length) {
            if (query(this[i])) {
                result = result.concat(this.splice(i, 1));
            } else {
                i++;
            }
        }

        return result;
    };
}

if (!Array.prototype.groupBy) {
    Array.prototype.groupBy = function<T, K>(query: (item: T) => K): Array<Group<T, K>> {
        const result: Array<Group<T, K>> = [];

        for (const item of this) {
            const key = query(item);
            const index = result.firstIndexOf((e) => e.key === key);
            if (index < 0) {
                const group = new Group<T, K>(key);
                group.push(item);
                result.push(group);
            } else {
                result[index].push(item);
            }
        }

        return result;
    };
}

if (!Array.prototype.order) {
    Array.prototype.order = function(query: (item: any) => string | number | boolean, descending?: boolean): any[] {
        descending = !!descending;
        this.sort((a: any, b: any) => {
            a = query(a);
            b = query(b);

            if (a > b) {
                return descending ? -1 : 1;
            }
            if (a < b) {
                return descending ? 1 : -1;
            }
            return 0;
        });

        return this;
    };
}

if (!Array.prototype.unique) {
    Array.prototype.unique = function(): any[] {
        return [...new Set(this)];
    }
}
