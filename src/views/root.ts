import Rx = require("rxjs");
import { AppViewModel } from "./app";
import { LoginViewModel } from "./login/login";
import Views = require("./views");

import { Container, Inject, Service } from "typedi";

import { GetCurrentSoncosoUser } from "../domain/usecase/soncoso";
import { GetCurrentTogglUser } from "../domain/usecase/toggl";

@Service()
export class RootViewModel extends Views.ViewModel {

    public contentViewModel: Views.ViewModel;

    constructor(private currentSoncosoUser: GetCurrentSoncosoUser, private currentTogglUser: GetCurrentTogglUser) {
        super();

        Rx.Observable.combineLatest(
            currentSoncosoUser.build(),
            currentTogglUser.build(),
        ).take(1).subscribe(([soncosoUser, togglUser]) => {
            if (!soncosoUser || !togglUser) {
                const login = Container.get(LoginViewModel);
                login.success.subscribe(() => {
                    this.contentViewModel = Container.get(AppViewModel);
                    this.update.next();
                });

                this.contentViewModel = login;
                this.update.next();
            }
        });

    }
}

class Root extends Views.View {
    constructor(public viewModel: RootViewModel) {
        super(viewModel);
    }

    protected build() {
        return Views.build(this.viewModel.contentViewModel);
    }
}

Views.register(Root, RootViewModel);
