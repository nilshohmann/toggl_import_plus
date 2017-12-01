import $ = require("jquery");
import Rx = require("rxjs");
import Views = require("../views");

import SoncosoModel = require("../../domain/model/soncoso");
import TogglModel = require("../../domain/model/toggl");

import { GetSoncosoTimeRecords } from "../../domain/usecase/soncoso";
import { CreateSoncosoTimeRecord } from "../../domain/usecase/timetracking";
import { GetTogglTimeRecords } from "../../domain/usecase/toggl";

import { TimeEntryListViewModel } from "./timeentrylist";

import { Service } from "typedi";

@Service()
export class TimeTrackingViewModel extends Views.ViewModel {

    private currentDate: Rx.BehaviorSubject<Date>;
    public entryLists: TimeEntryListViewModel[] = [];

    public isLoading: Rx.BehaviorSubject<boolean>;
    public doLoadMore: Rx.Subject<void>;

    constructor(private soncosoTimeRecords: GetSoncosoTimeRecords,
                private togglTimeRecords: GetTogglTimeRecords,
                private createTimeRecord: CreateSoncosoTimeRecord) {
        super();

        const currentMonth = Date.currentMonth();
        this.currentDate = new Rx.BehaviorSubject(currentMonth.end.addDays(1));
        this.isLoading = new Rx.BehaviorSubject(true);
        this.doLoadMore = new Rx.Subject();

        this.currentDate.pairwise().flatMap(([until, from]) => {
            until = until.addDays(-1);
            this.isLoading.next(true);
            console.log(`fetching time entries from ${from} to ${until}`);

            return Rx.Observable.combineLatest(
                soncosoTimeRecords.build(from, until).catch((error) => Rx.Observable.of([])).do(console.log),
                togglTimeRecords.build(from, until).catch((error) => Rx.Observable.of([])).do(console.log),
            );
        }).subscribe((entries) => {
            this.isLoading.next(false);
            const soncosoEntries = (entries[0] as SoncosoModel.TimeRecord[]).order((r) => r.date.getTime(), true);
            const togglEntries = (entries[1] as TogglModel.TimeRecord[]).order((r) => r.start.getTime(), true);

            const soncosoGroups = soncosoEntries.groupBy<number>((record) => record.date.midnight().getTime());
            const togglGroups = togglEntries.groupBy<number>((record) => record.start.midnight().getTime());
            const keys = [...new Set(soncosoGroups.map((g) => g.key).concat(togglGroups.map((g) => g.key)))].order((e) => e, true);

            this.entryLists = this.entryLists.concat(keys.map((key) => {
                const sArray = soncosoGroups.filter((g) => g.key === key).firstOrNull();
                const tArray = togglGroups.filter((g) => g.key === key).firstOrNull();

                return new TimeEntryListViewModel(createTimeRecord, new Date(key), sArray, tArray);
            }));

            this.update.next();
        });
        this.currentDate.next(currentMonth.start);

        this.doLoadMore.flatMap(() => this.isLoading.take(1)).filter((f) => !f).subscribe(() => {
            const date = this.currentDate.value.addDays(-1);
            date.setDate(1);
            this.currentDate.next(date);
        });
    }
}

class TimeTrackingView extends Views.View {
    constructor(public viewModel: TimeTrackingViewModel) {
        super(viewModel);
    }

    public build() {
        const loadingClass = this.viewModel.isLoading.map((f) => "load-more" + (f ? " loading" : ""));

        return Views.create("div", { css: { "overflow-x": "hidden", "overflow-y": "auto" } },
            ...Views.children(...this.viewModel.entryLists),
            Views.create("div", { class: "load-more-container" },
                Views.create("button", { class: loadingClass, events: { click: this.viewModel.doLoadMore } },
                    Views.create("span", { text: "Load more" }),
                    Views.create("div", { class: "spinner" }),
                ),
            ),
        );
    }
}

Views.register(TimeTrackingView, TimeTrackingViewModel);
