import $ = require("jquery");
import Rx = require("rxjs");
import Views = require("../views");

export class WelcomeViewModel extends Views.ViewModel {
    constructor(title: string) {
        super();
    }
}

class WelcomeView extends Views.View {
    constructor(public viewModel: WelcomeViewModel) {
        super(viewModel);
    }

    public build() {
        return Views.create("div", {},
            Views.create("div", {
                style: "width: 100%; height: 100%; background: url('assets/img/welcome.png') center center; background-repeat: no-repeat;",
            }),
        );
    }
}

Views.register(WelcomeView, WelcomeViewModel);
