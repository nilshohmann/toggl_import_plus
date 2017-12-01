import $ = require("jquery");
import Rx = require("rxjs");
import { Service } from "typedi";
import Views = require("../views");

@Service()
export class TextBoxViewModel extends Views.ViewModel {
    public text: Rx.BehaviorSubject<string>;
    public error: Rx.BehaviorSubject<string>;

    constructor(public id: string, public type: string = "text", public placeholder: string = "") {
        super();
        this.text = new Rx.BehaviorSubject("");
        this.error = new Rx.BehaviorSubject("");
    }
}

class TextBoxView extends Views.View {
    constructor(public viewModel: TextBoxViewModel) {
        super(viewModel);
    }

    protected build() {
        const changeEvent: Rx.Subject<Event> = new Rx.Subject();
        changeEvent.map((event) => (event.target as HTMLInputElement).value).subscribe(this.viewModel.text);

        const classObs = Rx.Observable.merge(
            this.viewModel.error.map((msg) => !!msg && msg.length > 0),
            this.viewModel.text.map(() => false),
        ).map((showError) => "input-box" + (showError ? " error" : ""));

        return Views.create("div", {
            class: classObs,
            events: {
                change: changeEvent,
                input: changeEvent,
            },
        },
            Views.create("input", { type: this.viewModel.type, id: this.viewModel.id }),
            Views.create("label", { for: this.viewModel.id, class: "text-label", text: this.viewModel.placeholder }),
            Views.create("span", { text: this.viewModel.error }),
        );
    }
}

Views.register(TextBoxView, TextBoxViewModel);
