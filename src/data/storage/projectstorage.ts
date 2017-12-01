import Rx = require("rxjs");
import { Require, Service } from "typedi";

import ProjectModel = require("../../domain/model/project");
import { BaseStorage } from "./basestorage";

@Service()
export class ProjectStorage extends BaseStorage {

    private readonly assignKey = "assignments";
    private currentAssignmentSubject: Rx.BehaviorSubject<ProjectModel.Assignment[]> = null;

    /**
     * Constructor
     *
     * @param storage Storage
     */
    public constructor(@Require("node-persist") storage: any) {
        super(storage);

        this.getAssignments = this.getAssignments.bind(this);
        this.assignProjectToJob = this.assignProjectToJob.bind(this);
    }

    /**
     * Return and observe all job to project assignments
     */
    public getAssignments(): Rx.Observable<ProjectModel.Assignment[]> {
        if (this.currentAssignmentSubject !== null) {
            return this.currentAssignmentSubject;
        }
        return this.get<ProjectModel.Assignment[]>(this.assignKey).flatMap((assignments) => {
            this.currentAssignmentSubject = new Rx.BehaviorSubject(assignments);
            return this.currentAssignmentSubject;
        });
    }

    /**
     * Assign a job to a project
     *
     * @param projectId: Id of the toggl project
     * @param job: Description of the soncoso job
     */
    public assignProjectToJob(projectId: number, job: string): Rx.Observable<void> {
        return this.get<ProjectModel.Assignment[]>(this.assignKey).flatMap((assignments) => {
            assignments = assignments || [];
            const before = assignments.length;
            assignments = assignments.filter((a) => a.job !== job || a.projectId !== projectId);
            if (before === assignments.length) {
                assignments.push({ job, projectId });
            }

            return this.set(this.assignKey, assignments);
        }).map((assignements) => { this.currentAssignmentSubject.next(assignements); return; });
    }
}
