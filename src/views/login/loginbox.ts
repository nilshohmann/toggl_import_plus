import $ = require("jquery");
import Rx = require("rxjs");
import { Container, Inject, Service } from "typedi";
import { Credentials } from "../../domain/model/credentials";
import Views = require("../views");

import { TextBoxViewModel } from "../base/textbox";

import { AuthenticateSoncosoUser, GetStoredSoncosoCredentials } from "../../domain/usecase/soncoso";
import { AuthenticateTogglUser, GetStoredTogglCredentials } from "../../domain/usecase/toggl";

class LoginBoxViewModel extends Views.ViewModel {
    public readonly name: string;

    public readonly usernameViewModel: TextBoxViewModel;
    public readonly passwordViewModel: TextBoxViewModel;
    public readonly clickSubject: Rx.Subject<void>;

    public readonly loading: Rx.BehaviorSubject<boolean>;
    public readonly success: Rx.BehaviorSubject<boolean>;

    public login: Rx.Observable<void>;

    constructor(name: string) {
        super();

        this.name = name;
        this.usernameViewModel = new TextBoxViewModel(name + "_username", "text", "Username");
        this.passwordViewModel = new TextBoxViewModel(name + "_password", "password", "Password");
        this.clickSubject = new Rx.Subject<void>();
        this.loading = new Rx.BehaviorSubject<boolean>(true);
        this.success = new Rx.BehaviorSubject<boolean>(false);

        const doLogin = this.clickSubject.withLatestFrom(
            this.usernameViewModel.text,
            this.passwordViewModel.text,
        ).map((fields) => new Credentials(fields[1], fields[2]));

        this.login = Rx.Observable.defer(() => {
            return this.getStoredCredentials().merge(doLogin)
                .filter((c) => {
                    this.loading.next(!!c);
                    return !!c;
                })
                .flatMap((credentials) => {
                    return this.authenticate(credentials).map(() => true)
                        .catch((error: Error) => {
                            if (error.message === "unauthorized") {
                                this.passwordViewModel.error.next("Invalid credentials");
                            } else {
                                this.usernameViewModel.error.next("Unknown error");
                            }
                            return Rx.Observable.of(false);
                        });
                })
                .filter((success) => {
                    this.loading.next(false);
                    this.success.next(success);
                    return success;
                })
                .flatMap(() => Rx.Observable.of(null).delay(1000));
        });
    }

    protected getStoredCredentials(): Rx.Observable<Credentials> {
        return Rx.Observable.of(null);
    }

    protected authenticate(credentials: Credentials): Rx.Observable<any> {
        return Rx.Observable.of(null);
    }
}

@Service()
export class SoncosoLoginBoxViewModel extends LoginBoxViewModel {
    // public readonly name = "soncoso";

    constructor(
            private getStoredSoncosoCredentials: GetStoredSoncosoCredentials,
            private authenticateSoncosoUser: AuthenticateSoncosoUser) {
        super("soncoso");

        this.authenticate = this.authenticate.bind(this);
        this.getStoredCredentials = this.getStoredCredentials.bind(this);
    }

    protected getStoredCredentials(): Rx.Observable<Credentials> {
        return this.getStoredSoncosoCredentials.build();
    }

    protected authenticate(credentials: Credentials): Rx.Observable<any> {
        return this.authenticateSoncosoUser.build(credentials);
    }
}

@Service()
export class TogglLoginBoxViewModel extends LoginBoxViewModel {
    public readonly name = "toggl";

    constructor(
            private getStoredTogglCredentials: GetStoredTogglCredentials,
            private authenticateTogglUser: AuthenticateTogglUser) {
        super("toggl");

        this.usernameViewModel.id = "toggl_username";
        this.usernameViewModel.placeholder = "Username / API token";
        this.passwordViewModel.id = "toggl_password";
        this.passwordViewModel.placeholder = "Password";

        this.authenticate = this.authenticate.bind(this);
        this.getStoredCredentials = this.getStoredCredentials.bind(this);
    }

    protected getStoredCredentials(): Rx.Observable<Credentials> {
        return this.getStoredTogglCredentials.build();
    }

    protected authenticate(credentials: Credentials): Rx.Observable<any> {
        return this.authenticateTogglUser.build(credentials);
    }
}

class LoginBoxView extends Views.View {
    constructor(public viewModel: SoncosoLoginBoxViewModel | TogglLoginBoxViewModel) {
        super(viewModel);
    }

    protected build() {
        const loadingClass = this.viewModel.loading.combineLatest(this.viewModel.success)
            .map(([loading, success]) => "loading-indicator" + (success ? " load-complete" : loading ? "" : " hidden"))
            .subscribeOn(Rx.Scheduler.async);

        return Views.create("div", { class: "login-box" },
            Views.create("div", { style: "margin-bottom: 30px;" },
                Views.create("img", {
                    src: "assets/img/" + this.viewModel.name + ".png",
                    style: "width: 140px; height: 140px;",
                }),
            ),
            Views.build(this.viewModel.usernameViewModel),
            Views.build(this.viewModel.passwordViewModel),
            Views.create("div", { class: "input-box", style: "margin-top: 30px;" },
                Views.create("input", { events: { click: this.viewModel.clickSubject }, type: "button", style: "width: 100px;", value: "Login" }),
            ),
            Views.create("div", { class: loadingClass },
                Views.create("div", { class: "circle-loader", style: "margin: 167px auto 0;" },
                    Views.create("div", { class: "checkmark draw" }),
                ),
            ),
        );
    }
}

Views.register(LoginBoxView, SoncosoLoginBoxViewModel);
Views.register(LoginBoxView, TogglLoginBoxViewModel);
