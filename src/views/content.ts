import $ = require("jquery");
import Rx = require("rxjs");
import Views = require("./views");

export class ContentViewModel extends Views.ViewModel {
    public item: Rx.BehaviorSubject<Views.ViewModel>;

    constructor() {
        super();
        this.item = new Rx.BehaviorSubject(null);
        this.item.map(() => { return; }).subscribe(this.update);
    }
}

class ContentView extends Views.View {
    constructor(public viewModel: ContentViewModel) {
        super(viewModel);
    }

    public build() {
        return Views.create("div", { style: "flex-grow: 1; display: flex;" },
            Views.build(this.viewModel.item.value, { css: { "flex-grow": 1 } }),
        );
    }
}

Views.register(ContentView, ContentViewModel);
