import Rx = require("rxjs");

import { ProjectStorage } from "../../data/storage/projectstorage";
import ProjectModel = require("../model/project");
import TogglModel = require("../model/toggl");

import { Inject, Service } from "typedi";

@Service()
export class GetProjectAssignments {

    public constructor(private projectStorage: ProjectStorage) {
        this.build = this.build.bind(this);
    }

    public build(): Rx.Observable<ProjectModel.Assignment[]> {
        return this.projectStorage.getAssignments();
    }
}

@Service()
export class AssignProjectToJob {

    public constructor(private projectStorage: ProjectStorage) {
        this.build = this.build.bind(this);
    }

    public build(projectId: number, job: string): Rx.Observable<void> {
        return this.projectStorage.assignProjectToJob(projectId, job);
    }
}
