import $ = require("jquery");
import Rx = require("rxjs");
import Views = require("../views");

import Soncoso = require("../../domain/model/soncoso");
import Toggl = require("../../domain/model/toggl");
import { CreateSoncosoTimeRecord } from "../../domain/usecase/timetracking";

import { SoncosoEntryViewModel } from "./soncosoentry";
import { TogglEntryViewModel } from "./togglentry";

class TimeRange {
    public constructor(public start: Date, public end: Date) {}
}

export class TimeEntryListViewModel extends Views.ViewModel {
    public soncosoTimeRecords: Rx.BehaviorSubject<Soncoso.TimeRecord[]>;
    public soncosoEntries: SoncosoEntryViewModel[] = [];
    public togglTimeRecords: Rx.BehaviorSubject<Toggl.TimeRecord[]>;
    public togglEntries: TogglEntryViewModel[] = [];

    public dateString: string;
    public soncosoTotalTime: Rx.Observable<string>;
    public togglTotalTime: Rx.Observable<string>;

    constructor(private createTimeRecord: CreateSoncosoTimeRecord,
                public date: Date,
                soncosoTimeRecords: Soncoso.TimeRecord[],
                togglTimeRecords: Toggl.TimeRecord[]) {
        super();

        soncosoTimeRecords = soncosoTimeRecords || [];
        togglTimeRecords = togglTimeRecords || [];

        this.dateString = date.formatDateWithRef();
        this.soncosoTimeRecords = new Rx.BehaviorSubject(soncosoTimeRecords);
        this.togglTimeRecords = new Rx.BehaviorSubject(togglTimeRecords);

        Rx.Observable.combineLatest(
            this.soncosoTimeRecords,
            this.togglTimeRecords,
        ).subscribe(([soncosoRecords, togglRecords]) => {
            soncosoRecords.forEach((r) => {
                r.startTime = r.date.withTimeFrom(r.startTime).round();
                r.startTime = r.date.withTimeFrom(r.startTime).round();
            });
            togglRecords.forEach((r) => {
                r.start = r.start.round();
                r.end = r.end.round();
            });

            const times = soncosoRecords.map((r) => r.startTime.getTime())
                .concat(togglRecords.map((r) => r.start.getTime()))
                .unique().order((e) => e, true);

            let needsUpdate = false;

            this.soncosoEntries = times.map((t) => {
                const record = soncosoRecords.firstOrNull((r) => r.startTime.getTime() === t);
                let vm = (this.soncosoEntries || []).firstOrNull((e) => e.time === t);
                if (!!vm) {
                    vm.timeRecord.next(record);
                } else {
                    needsUpdate = true;
                    vm = new SoncosoEntryViewModel(t, record);
                }
                return vm;
            });

            this.togglEntries = times.map((t, i) => {
                const record = togglRecords.firstOrNull((r) => r.start.getTime() === t);
                let vm = (this.togglEntries || []).firstOrNull((e) => e.time === t);

                if (!!vm) {
                    vm.timeRecord.next(record);
                } else {
                    needsUpdate = true;
                    vm = new TogglEntryViewModel(t, record);
                    vm.doSync.flatMap(() => vm.timeRecord).take(1).flatMap(this.createTimeRecord.build).subscribe((r) => {
                        const records = this.soncosoTimeRecords.value;
                        records.push(r);
                        this.soncosoTimeRecords.next(records);

                        // const time = record.date.withTimeFrom(record.startTime).round().getTime();
                        // this.soncosoEntries.filter((entry) => entry.time === time).forEach((entry) => entry.timeRecord.next(record));
                    });
                }

                vm.isSynced.next(!!this.soncosoEntries[i].timeRecord.value);
                return vm;
            });

            if (needsUpdate) {
                this.update.next();
            }
        });

        this.soncosoTotalTime = this.soncosoTimeRecords.map((records) =>
            this.formatTotalTime(records.map((r) => new TimeRange(r.startTime, r.endTime))));
        this.togglTotalTime = this.togglTimeRecords.map((records) =>
            this.formatTotalTime(records.map((r) => new TimeRange(r.start, r.end))));
    }

    private formatTotalTime(times: TimeRange[]): string {
        const totalTime = times.map((t) => t.end.distinctDiff(t.start)).reduce((p, c, i) => p + c, 0);
        return new Date(Date.today().setMilliseconds(totalTime)).format("HH:MM:00");
    }
}

class TimeEntryListView extends Views.View {
    constructor(public viewModel: TimeEntryListViewModel) {
        super(viewModel);
    }

    protected build() {
        return Views.create("div", { class: "time-tracking open" },
            Views.create("div", { class: "daily-list-wrapper" },
                Views.create("div", { class: "daily-list" },
                    Views.create("div", { class: "daily-list-header" },
                        Views.create("span", { style: "min-width: 100px; font-weight: bold;", text: this.viewModel.dateString }),
                        Views.create("span", { style: "margin-left: auto;" },
                            Views.create("img", {
                                src: "assets/img/soncoso_small.png",
                                style: "vertical-align: middle; height: 20px; position: relative; top: -2px; margin-right: 8px;",
                            }),
                            Views.create("span", { text : this.viewModel.soncosoTotalTime }),
                        ),
                    ),
                    ...Views.children(...this.viewModel.soncosoEntries),
                ),
            ),
            Views.create("div", { class: "daily-list-wrapper" },
                Views.create("div", { class: "daily-list" },
                    Views.create("div", { class: "daily-list-header" },
                        Views.create("span", { style: "margin-left: auto;" },
                            Views.create("img", {
                                src: "assets/img/toggl_small.png",
                                style: "vertical-align: middle; height: 20px; position: relative; top: -2px; margin-right: 8px;",
                            }),
                            Views.create("span", { text : this.viewModel.togglTotalTime }),
                        ),
                    ),
                    ...Views.children(...this.viewModel.togglEntries),
                ),
            ),
        );
    }
}

Views.register(TimeEntryListView, TimeEntryListViewModel);
