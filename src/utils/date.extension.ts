
interface DateConstructor {
    today(): Date;
    currentMonth(): { start: Date, end: Date};
    Granularity: number;
}

interface Date {
    round(): Date;
    today(): Date;
    midnight(): Date;
    onlyTime(): Date;
    withTimeFrom(date: Date): Date;
    addDays(days: number): Date;
    format(format: string): string;
    formatDateWithRef(): string;
    distinctDiff(date: Date): number;
}

// Granularity of 5 Minutes
Date.Granularity = 5 * 60 * 1000;

if (!Date.today) {
    Date.today = function(): Date {
        return new Date().midnight();
    };
}

if (!Date.currentMonth) {
    Date.currentMonth = function(): { start: Date, end: Date} {
        const today = Date.today();
        const start = new Date(today.setDate(1));
        today.setMonth(today.getMonth() + 1);
        const end = new Date(today.setDate(0));

        return { start, end };
    };
}

if (!Date.prototype.round) {
    Date.prototype.round = function(): Date {
        return new Date(Math.floor(this.getTime() / Date.Granularity) * Date.Granularity);
    };
}

if (!Date.prototype.today) {
    Date.prototype.today = function(): Date {
        const today = Date.today();
        today.setHours(this.getHours());
        today.setMinutes(this.getMinutes());
        today.setSeconds(this.getSeconds());
        return today;
    };
}

if (!Date.prototype.midnight) {
    Date.prototype.midnight = function(): Date {
        const date = new Date(this);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    };
}

if (!Date.prototype.onlyTime) {
    Date.prototype.onlyTime = function(): Date {
        const date = new Date(0);
        date.setHours(this.getHours());
        date.setMinutes(this.getMinutes());
        date.setSeconds(this.getSeconds());
        date.setMilliseconds(0);
        return date;
    };
}

if (!Date.prototype.withTimeFrom) {
    Date.prototype.withTimeFrom = function(date: Date): Date {
        const result = new Date(this);
        result.setHours(date.getHours());
        result.setMinutes(date.getMinutes());
        result.setSeconds(date.getSeconds());
        result.setMilliseconds(0);
        return result;
    };
}

if (!Date.prototype.addDays) {
    Date.prototype.addDays = function(days: number): Date {
        if (!days) {
            return this;
        }

        const date = new Date(this);
        date.setDate(date.getDate() + days);
        return date;
    };
}

if (!Date.prototype.format) {
    Date.prototype.format = function(format: string): string {
        const token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|'[^']*'|'[^']*'/g;

        const pad = (val: string, len: number = 2): string => {
            val = String(val);
            while (val.length < len) {
                val = "0" + val;
            }
            return val;
        };

        const self = this;

        const flags: any = {
            H:    () => self.getHours(),
            HH:   () => pad(flags.H()),
            M:    () => self.getMinutes(),
            MM:   () => pad(flags.M()),
            T:    () => flags.H() < 12 ? "A" : "P",
            TT:   () => flags.H() < 12 ? "AM" : "PM",
            d:    () => self.getDate(),
            dd:   () => pad(self.getDate()),
            h:    () => String(self.getHours() % 12),
            hh:   () => pad(flags.h()),
            l:    () => pad(self.getMilliseconds(), 3),
            m:    () => self.getMonth() + 1,
            mm:   () => pad(flags.m()),
            s:    () => self.getSeconds(),
            ss:   () => pad(flags.s()),
            t:    () => flags.H() < 12 ? "a" : "p",
            tt:   () => flags.H() < 12 ? "am" : "pm",
            yy:   () => String(self.getFullYear()).slice(2),
            yyyy: () => self.getFullYear(),
        };

        return format.replace(token, (match) => {
            if (match in flags) {
                return flags[match]();
            }
            return match.slice(1, match.length - 1);
        });
    };
}

if (!Date.prototype.formatDateWithRef) {
    Date.prototype.formatDateWithRef = function(): string {
        const time = this.midnight().getTime();
        if (time === Date.today().getTime()) {
            return "Today";
        }
        if (time === Date.today().addDays(-1).getTime()) {
            return "Yesterday";
        }
        return this.format("dd.mm.yyyy");
    };
}

if (!Date.prototype.distinctDiff) {
    Date.prototype.distinctDiff = function(date: Date): number {
        const diff = this.getTime() - date.getTime();
        return Math.floor(diff / Date.Granularity) * Date.Granularity;
    };
}
