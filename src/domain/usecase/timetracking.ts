import Rx = require("rxjs");

import { SoncosoRestApi } from "../../data/api/soncoso";
import { ProjectStorage } from "../../data/storage/projectstorage";
import { SoncosoStorage } from "../../data/storage/soncosostorage";
import { TogglStorage } from "../../data/storage/togglstorage";
import { Credentials } from "../model/credentials";
import SoncosoModel = require("../model/soncoso");
import TogglModel = require("../model/toggl");

import { Inject, Service } from "typedi";

@Service()
export class CreateSoncosoTimeRecord {

    public constructor(private soncosoStorage: SoncosoStorage,
                       private togglStorage: TogglStorage,
                       private projectStorage: ProjectStorage,
                       private api: SoncosoRestApi) {
        this.build = this.build.bind(this);
    }

    public build(from: TogglModel.TimeRecord): Rx.Observable<SoncosoModel.TimeRecord> {
        if (!from) {
            return Rx.Observable.of(null);
        }

        const time = from.start.midnight().getTime();

        return this.soncosoStorage.currentSoncosoUser().flatMap((user) => {
            const jobs = user.jobs.filter((j) => j.startDate <= from.start && from.end <= j.endDate).map((job) => {
                return { name: `${job.label} (${job.customer})`, job };
            });

            return this.projectStorage.getAssignments().flatMap((assignments) => {
                const assignedJobs = (assignments || []).filter((a) => a.projectId === from.projectId).map((a) => a.job);

                const job = jobs.filter((j) => assignedJobs.indexOf(j.name) >= 0).map((j) => j.job).firstOrNull();
                if (!job) {
                    return Rx.Observable.throw(new Error("Unable to associate soncoso job"));
                }

                return Rx.Observable.of(job.jobTimes).flatMap((jobTimes) => {
                    const jobTime = (jobTimes || []).firstOrNull((t) => t.date.midnight().getTime() === time);
                    if (!!jobTime) {
                        return Rx.Observable.of(jobTime);
                    }

                    return this.api.getJobTime(job.id, from.start);
                }).flatMap((jobTime) => {
                    if (!jobTime) {
                        return Rx.Observable.throw(new Error("No job time exists for this date"));
                    }
                    if (!!job.jobTimes) {
                        job.jobTimes.push(jobTime);
                    } else {
                        job.jobTimes = [jobTime];
                    }

                    const record: SoncosoModel.TimeRecord = {
                        absence: "NORMAL",
                        date: from.start.midnight(),
                        description: from.description,
                        endTime: from.end.onlyTime(),
                        id: 0,
                        job,
                        jobId: job.id,
                        jobTimeId: jobTime.id,
                        pauseDurationMins: 0,
                        startTime: from.start.onlyTime(),
                        synchronized: true,
                    };

                    return this.api.createTimeRecord(record).map(() => record);
                });
            });
        });
    }
}
