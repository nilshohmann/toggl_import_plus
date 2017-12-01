import $ = require("jquery");
import Rx = require("rxjs");
import Views = require("../views");

import { Service } from "typedi";

import SoncosoModel = require("../../domain/model/soncoso");
import TogglModel = require("../../domain/model/toggl");
import { AssignProjectToJob, GetProjectAssignments } from "../../domain/usecase/projects";
import { GetCurrentSoncosoUser } from "../../domain/usecase/soncoso";
import { GetCurrentTogglUser } from "../../domain/usecase/toggl";

import { ProjectItemViewModel } from "./projectitem";
import { ProjectListViewModel } from "./projectlist";

@Service()
export class ProjectAssignmentViewModel extends Views.ViewModel {

    public soncosoList = new ProjectListViewModel();
    public togglList = new ProjectListViewModel();

    constructor(private getCurrentSoncosoUser: GetCurrentSoncosoUser,
                private getCurrentTogglUser: GetCurrentTogglUser,
                private assignProjectToJob: AssignProjectToJob,
                private getProjectAssignments: GetProjectAssignments) {
        super();

        const buildSoncosoVM = (group: Group<SoncosoModel.Job, string>): ProjectItemViewModel => {
            const vm = new ProjectItemViewModel("soncoso", group.key, group[0].label, group[0].customer);
            vm.onDrop.flatMap(([projectId, job]) => this.assignProjectToJob.build(projectId, job)).subscribe();
            return vm;
        };

        const buildTogglVM = (project: TogglModel.Project): ProjectItemViewModel => {
            return new ProjectItemViewModel("toggl", project.id.toString(), project.name, project.client.name, project.color);
        };

        Rx.Observable.combineLatest(
            getCurrentSoncosoUser.build(),
            getCurrentTogglUser.build(),
            getProjectAssignments.build(),
        ).subscribe(([soncosoUser, toggleUser, assignments]) => {
            assignments = assignments || [];

            const toggleProjects = toggleUser.workspaces
                .map((w) => w.clients).reduce((p, c) => p.concat(c), [])
                .map((c) => c.projects).reduce((p, c) => p.concat(c), []);

            const soncosoJobs = soncosoUser.jobs.groupBy<string>((job) => `${job.label} (${job.customer})`)
                .map((job) => {
                    const projectAssignments = assignments.filter((a) => a.job === job.key);
                    const projects = toggleProjects.filter((project) => projectAssignments.filter((a) => a.projectId === project.id).length > 0);

                    const vm = buildSoncosoVM(job);
                    vm.assignedJobs.subItems = projects.map((p) => buildTogglVM(p));
                    return vm;
                });

            this.soncosoList.subItems = soncosoJobs;
            this.togglList.subItems = toggleProjects.map((job) => buildTogglVM(job));

            this.update.next();
        });
    }
}

class ProjectAssignmentView extends Views.View {

    constructor(public viewModel: ProjectAssignmentViewModel) {
        super(viewModel);
    }

    public build() {
        return Views.create("div", { style: "display: flex; padding: 0 10px;" },
            Views.build(this.viewModel.soncosoList, { style: "flex: 1; width: 50%; overflow-x: hidden; overflow-y: auto; padding: 10px 0;" }),
            Views.build(this.viewModel.togglList, { style: "flex: 1; width: 50%; overflow-x: hidden; overflow-y: auto; padding: 10px 0;" }),
        );
    }
}

Views.register(ProjectAssignmentView, ProjectAssignmentViewModel);
