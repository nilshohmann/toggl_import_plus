import $ = require("jquery");
import Rx = require("rxjs");
import Views = require("../views");

import { ProjectListViewModel } from "./projectlist";

export type System = ("soncoso" | "toggl");

export class ProjectItemViewModel extends Views.ViewModel {

    public assignedJobs: ProjectListViewModel;
    public onDrop = new Rx.Subject<[number, string]>();

    constructor(public type: System, public id: string, public name: string, public info: string, public color: string = "#999") {
        super();

        if (type === "soncoso") {
            this.assignedJobs = new ProjectListViewModel();
        }
    }

    public assign(projectId: number) {
        if (this.type === "soncoso") {
            this.onDrop.next([projectId, this.id]);
        }
    }
}

class ProjectItemView extends Views.View {

    private isDragOver: Rx.BehaviorSubject<boolean>;

    constructor(public viewModel: ProjectItemViewModel) {
        super(viewModel);

        this.isDragOver = new Rx.BehaviorSubject(false);

        this.build = this.build.bind(this);
        this.dragstart = this.dragstart.bind(this);
        this.dragover = this.dragover.bind(this);
        this.dragleave = this.dragleave.bind(this);
        this.drop = this.drop.bind(this);
    }

    public build() {
        const draggable = this.viewModel.type === "toggl";
        const events = draggable
            ? { dragstart: this.dragstart }
            : { dragover: this.dragover, dragleave: this.dragleave, drop: this.drop };
        const classObservable = this.isDragOver.map((f) => f ? "drag-over" : "");

        return Views.create("li", {},
            Views.create("a", { href: "#",  class: classObservable, draggable, events, style: `color: ${this.viewModel.color};` },
                Views.create("img", { src: `assets/img/${this.viewModel.type}_small.png`, style: "vertical-align: middle;" }),
                Views.create("span", { text: this.viewModel.name, style: "line-height: 24px;" },
                    Views.create("span", { text: `(${this.viewModel.info})`, style: "font-size: 0.8em;" }),
                ),
                Views.build(this.viewModel.assignedJobs),
            ),
        );
    }

    public dragstart(event: BaseJQueryEventObject) {
        const dragEvent = event.originalEvent as DragEvent;
        dragEvent.dataTransfer.effectAllowed = "link";
        dragEvent.dataTransfer.setData("projectId", this.viewModel.id.toString());
    }

    public dragover(event: BaseJQueryEventObject) {
        event.preventDefault();
        const dragEvent = event.originalEvent as DragEvent;

        this.isDragOver.next(true);
        dragEvent.dataTransfer.dropEffect = "link";
    }

    public dragleave(event: BaseJQueryEventObject) {
        this.isDragOver.next(false);
    }

    public drop(event: BaseJQueryEventObject) {
        event.stopPropagation();
        this.isDragOver.next(false);
        const dragEvent = event.originalEvent as DragEvent;

        const projectId = dragEvent.dataTransfer.getData("projectId") as any - 0;
        this.viewModel.assign(projectId);
    }
}

Views.register(ProjectItemView, ProjectItemViewModel);
