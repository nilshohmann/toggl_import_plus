import $ = require("jquery");
import Rx = require("rxjs");
import { Container, Service } from "typedi";
import Views = require("../views");

import { SoncosoLoginBoxViewModel, TogglLoginBoxViewModel } from "./loginbox";

@Service()
export class LoginViewModel extends Views.ViewModel {
    public readonly success: Rx.Observable<void>;

    constructor(public soncosoLoginBox: SoncosoLoginBoxViewModel, public togglLoginBox: TogglLoginBoxViewModel) {
        super();

        this.success = Rx.Observable.combineLatest(
            this.soncosoLoginBox.login,
            this.togglLoginBox.login)
        .map(() => { return; });
    }
}

class LoginView extends Views.View {
    constructor(public viewModel: LoginViewModel) {
        super(viewModel);
    }

    protected build() {
        return Views.create("div", { style: "display: flex; height: 100%; width: 100%; min-width: 700px; min-height: 500px;" },
            Views.build(this.viewModel.soncosoLoginBox, { style: "margin-right: 3%;" }),
            Views.build(this.viewModel.togglLoginBox, { style: "margin-left: 3%;" }),
        );
    }
}

Views.register(LoginView, LoginViewModel);
