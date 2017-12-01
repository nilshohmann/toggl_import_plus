import $ = require("jquery");
import Rx = require("rxjs");
import Views = require("../views");

import { ProjectItemViewModel } from "./projectitem";

export class ProjectListViewModel extends Views.ViewModel {

    public subItems: ProjectItemViewModel[];

    constructor() {
        super();

        this.subItems = [];
    }

    public append(projectItem: ProjectItemViewModel): void {
        this.subItems.push(projectItem);
    }
}

class ProjectListView extends Views.View {
    constructor(public viewModel: ProjectListViewModel) {
        super(viewModel);
    }

    public build() {
        return Views.create("ul", { class: "project-list" },
            ...Views.children(...this.viewModel.subItems),
        );
    }
}

Views.register(ProjectListView, ProjectListViewModel);
