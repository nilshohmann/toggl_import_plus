import Rx = require("rxjs");
import Views = require("./views");

import { ContentViewModel } from "./content";
import { HeaderViewModel } from "./header";
import { ProjectAssignmentViewModel } from "./projects/projectassignment";
import { SidebarViewModel } from "./sidebar";
import { TimeTrackingViewModel } from "./timetracking/timetracking";
import { WelcomeViewModel } from "./welcome/welcome";

import { Container, Service } from "typedi";

class Page {
    public viewModel: Views.ViewModel = null;

    public constructor(public shortTitle: string, public title: string, private viewModelFactory: () => Views.ViewModel) {
        this.create = this.create.bind(this);
    }

    public create() {
        if (this.viewModel == null) {
            this.viewModel = this.viewModelFactory();
        }
    }
}

@Service()
export class AppViewModel extends Views.ViewModel {

    public sidebar: SidebarViewModel;
    public header: HeaderViewModel;
    public content: ContentViewModel;

    public pages: Page[];
    public pageIndex: Rx.BehaviorSubject<number>;

    constructor() {
        super();

        this.pages = [
            new Page("Welcome", "Welcome to Toggl import", () => Container.get(WelcomeViewModel)),
            new Page("Projects / Jobs", "Project to job assignment", () => Container.get(ProjectAssignmentViewModel)),
            new Page("Tracking", "Time tracking", () => Container.get(TimeTrackingViewModel)),
        ];

        this.sidebar = Container.get(SidebarViewModel);
        this.sidebar.items = this.pages.map((p) => p.shortTitle);
        this.header = new HeaderViewModel(this.pages[0].title);
        this.content = new ContentViewModel();

        this.pageIndex = new Rx.BehaviorSubject(0);

        this.pageIndex.map((i) => {
            this.sidebar.activeItem.next(i);
            const page = this.pages[i];
            this.header.title.next(page.title);
            page.create();
            return page.viewModel;
        }).subscribe(this.content.item);

        this.sidebar.selectedItem.subscribe(this.pageIndex);
    }
}

class App extends Views.View {
    constructor(public viewModel: AppViewModel) {
        super(viewModel);
    }

    protected build() {
        return Views.create("div", { style: "display: flex;" },
            Views.build(this.viewModel.sidebar),

            Views.create("div", { class: "test-class", style: "flex-grow: 1; display: flex; flex-direction: column;" },
                Views.build(this.viewModel.header),
                Views.build(this.viewModel.content),
            ),
        );
    }
}

Views.register(App, AppViewModel);
