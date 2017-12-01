import $ = require("jquery");
import Rx = require("rxjs");
import Views = require("../views");

import Toggl = require("../../domain/model/toggl");

export class TogglEntryViewModel extends Views.ViewModel {
    public timeRecord: Rx.BehaviorSubject<Toggl.TimeRecord>;
    public isSynced: Rx.BehaviorSubject<boolean>;
    public doSync: Rx.Subject<void>;

    constructor(public time: number, timeRecord: Toggl.TimeRecord) {
        super();

        this.doSync = new Rx.Subject();
        this.isSynced = new Rx.BehaviorSubject(false);

        this.timeRecord = new Rx.BehaviorSubject(timeRecord);
        this.timeRecord.pairwise()
            .filter(([p, c]) => (!!p) !== (!!c))
            .map(() => { return; })
            .subscribe(this.update);
    }
}

class TogglEntryView extends Views.View {
    constructor(public viewModel: TogglEntryViewModel) {
        super(viewModel);
    }

    protected build(): Views.ViewTree {
        if (this.viewModel.timeRecord.value == null) {
            return Views.create("div", { class: "time-record-entry empty" });
        }

        const times = this.viewModel.timeRecord.map((record) => `${record.start.format("HH:MM")} - ${record.end.format("HH:MM")}`);
        const projectColor = this.viewModel.timeRecord.map((record) => record.project.color);
        const projectName = this.viewModel.timeRecord.map((record) => record.project.name);
        const clientName = this.viewModel.timeRecord.map((record) => record.project.client.name);
        const description = this.viewModel.timeRecord.map((record) => record.description);
        const buttonDisplay = this.viewModel.isSynced.map((f) => f ? "display: none;" : "");

        return Views.create("div", { class: "time-record-entry" },
            Views.create("div", { class: "button left", style: buttonDisplay },
                Views.create("a", {
                    class: "fa fa-arrow-left",
                    events: { click: this.viewModel.doSync },
                    style: "color: #58B;",
                    title: "Apply entry",
                }),
            ),
            Views.create("div", { class: "main" },
                Views.create("div", { class: "info"},
                    Views.create("div", { class: "times", text: times }),

                    Views.create("div", { class: "project", css: { color: projectColor } },
                        Views.create("span", { class: "name", text: projectName }),
                        Views.create("span", { class: "client", text: clientName }),
                    ),
                ),
                Views.create("div", { class: "description", title: description, text: description }),
            ),
        );
    }
}

Views.register(TogglEntryView, TogglEntryViewModel);
