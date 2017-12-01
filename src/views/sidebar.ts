import $ = require("jquery");
import Rx = require("rxjs");
import Views = require("./views");

import { Service } from "typedi";

@Service()
export class SidebarViewModel extends Views.ViewModel {
    public items: string[];

    public activeItem: Rx.BehaviorSubject<number>;
    public selectedItem: Rx.BehaviorSubject<number>;

    constructor() {
        super();

        this.items = [];
        this.activeItem = new Rx.BehaviorSubject(0);
        this.selectedItem = new Rx.BehaviorSubject(0);
    }
}

class SidebarView extends Views.View {
    constructor(public viewModel: SidebarViewModel) {
        super(viewModel);
    }

    public build() {
        const menuItems = this.viewModel.items.map((label, i) => {
            const classObservable = this.viewModel.activeItem.map((a) => "sidebar-item" + (a === i ? " active" : ""));
            return Views.create("a", {
                class: classObservable,
                events: { click: () => this.viewModel.selectedItem.next(i) },
                href: "#",
                text: label,
            });
        });

        return Views.create("div", { class: "sidebar" },
            Views.create("div", { class: "header-image", style: "text-align: center; height: 80px" },
                Views.create("img", { src: "assets/img/lmis.png" }),
            ),
            Views.create("div", { style: "width: 100%; height: 100%; overflow-x: hidden; overflow-y: auto;" },
                ...menuItems,
            ),
        );
    }
}

Views.register(SidebarView, SidebarViewModel);
