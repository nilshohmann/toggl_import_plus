import $ = require("jquery");
import Rx = require("rxjs");
import Views = require("../views");

import Soncoso = require("../../domain/model/soncoso");

export class SoncosoEntryViewModel extends Views.ViewModel {
    public timeRecord: Rx.BehaviorSubject<Soncoso.TimeRecord>;

    constructor(public time: number, timeRecord: Soncoso.TimeRecord) {
        super();

        this.timeRecord = new Rx.BehaviorSubject(timeRecord);
        this.timeRecord.pairwise()
            .filter(([p, c]) => (!!p) !== (!!c))
            .map(() => { return; })
            .subscribe(this.update);
    }
}

class SoncosoEntryView extends Views.View {
    constructor(public viewModel: SoncosoEntryViewModel) {
        super(viewModel);
    }

    protected build(): Views.ViewTree {
        if (this.viewModel.timeRecord.value == null) {
            return Views.create("div", { class: "time-record-entry empty" });
        }

        const times = this.viewModel.timeRecord.map((record) => `${record.startTime.format("HH:MM")} - ${record.endTime.format("HH:MM")}`);
        const jobName = this.viewModel.timeRecord.map((record) => record.job.label);
        const description = this.viewModel.timeRecord.map((record) => record.description);

        return Views.create("div", { class: "time-record-entry" },
            Views.create("div", { class: "main" },
                Views.create("div", { class: "info"},
                    Views.create("div", { class: "times", text: times }),
                    Views.create("div", { class: "project", css: { color: "#999" } },
                        Views.create("span", { class: "name", text: jobName}),
                    ),
                ),
                Views.create("div", { class: "description", title: description, text: description }),
            ),
            /*Views.create("div", { class: "button right"},
                Views.create("a", { title: "Delete entry", class: "fa fa-trash", style: "color: #E44;" }),
            ),*/
        );
    }
}

Views.register(SoncosoEntryView, SoncosoEntryViewModel);
