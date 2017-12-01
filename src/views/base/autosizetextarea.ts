import $ = require("jquery");
import Rx = require("rxjs");
import Views = require("../views");

export class AutosizeTextAreaViewModel extends Views.ViewModel {
    public text: Rx.BehaviorSubject<string>;
    public fontSize: number = 14;
    public minRows: number = 2;
    public maxRows: number = 5;

    constructor(text: string) {
        super();
        this.text = new Rx.BehaviorSubject(text);
    }
}

class AutosizeTextAreaView extends Views.View {
    constructor(public viewModel: AutosizeTextAreaViewModel) {
        super(viewModel);
    }

    public build() {
        const lineHeight: number = Math.ceil(this.viewModel.fontSize * 1.2);
        const textSubject: Rx.Subject<Event> = new Rx.Subject();
        textSubject.map((event) => (event.target as HTMLTextAreaElement).value).subscribe(this.viewModel.text);

        const rowsObservable = textSubject.map((event: Event): number => {
            const textarea = event.target as HTMLTextAreaElement;
            textarea.rows = 0;
            const rows = Math.round(textarea.scrollHeight / lineHeight);
            return Math.max(this.viewModel.minRows, Math.min(rows, this.viewModel.maxRows));
        }).startWith(this.viewModel.minRows);

        return Views.create("textarea", {
            css: {
                "font-size": this.viewModel.fontSize + "px",
                "line-height": lineHeight + "px",
            },
            events: {
                change: textSubject,
                input: textSubject,
            },
            rows: rowsObservable,
            value: this.viewModel.text,
        });
    }
}

Views.register(AutosizeTextAreaView, AutosizeTextAreaViewModel);
