import $ = require("jquery");
import Rx = require("rxjs");
import Views = require("./views");

export class HeaderViewModel extends Views.ViewModel {
    public title: Rx.BehaviorSubject<string>;

    constructor(title: string) {
        super();
        this.title = new Rx.BehaviorSubject(title);
    }
}

class HeaderView extends Views.View {
    constructor(public viewModel: HeaderViewModel) {
        super(viewModel);

        this.viewModel.title.subscribe((title) => document.title = title);
    }

    public build() {
        return Views.create("header", { style: "height: 80px; flex-shrink: 0; overflow-x: hidden;" },
            Views.create("h1", { text: this.viewModel.title }),
        );
    }
}

Views.register(HeaderView, HeaderViewModel);
