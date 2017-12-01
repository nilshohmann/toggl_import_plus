import Rx = require("rxjs");

import { SoncosoRestApi } from "../../data/api/soncoso";
import { SoncosoStorage } from "../../data/storage/soncosostorage";
import { Credentials } from "../model/credentials";
import SoncosoModel = require("../model/soncoso");

import { Inject, Service } from "typedi";

@Service()
export class GetStoredSoncosoCredentials {

    public constructor(private soncosoStorage: SoncosoStorage) {
        this.build = this.build.bind(this);
    }

    public build(): Rx.Observable<Credentials> {
        return this.soncosoStorage.getSoncosoCredentials();
    }
}

@Service()
export class GetCurrentSoncosoUser {

    public constructor(private soncosoStorage: SoncosoStorage) {
        this.build = this.build.bind(this);
    }

    public build(): Rx.Observable<SoncosoModel.UserInfo> {
        return this.soncosoStorage.currentSoncosoUser();
    }
}

@Service()
export class AuthenticateSoncosoUser {

    public constructor(private soncosoStorage: SoncosoStorage, private api: SoncosoRestApi) {
        this.build = this.build.bind(this);
    }

    public build(credentials: Credentials): Rx.Observable<SoncosoModel.UserInfo> {
        return this.api.authenticate(credentials).flatMap((user) => {
            return this.soncosoStorage.setSoncosoCredentials(credentials)
                .flatMap(() => this.fetchJobs(user))
                .do(this.soncosoStorage.setSoncosoUser);
        });
    }

    private fetchJobs(user: SoncosoModel.UserInfo): Rx.Observable<SoncosoModel.UserInfo> {
        return this.api.getJobs().map((jobs) => {
            user.jobs = jobs;
            return user;
        });

        /*return this.api.getJobs().flatMap((jobs) => {
            user.jobs = jobs;
            return Rx.Observable.forkJoin(jobs.map((job) => {
                return this.fetchJobTimes(job);
            })).map(() => user);
        });*/
    }

    /*private fetchJobTimes(job: SoncosoModel.Job): Rx.Observable<SoncosoModel.Job> {
        return this.api.getJobTimes(job.id).map((jobTimes) => {
            jobTimes.forEach((jobTime) => jobTime.job = job);
            job.jobTimes = jobTimes;
            return job;
        });
    }*/
}

@Service()
export class GetSoncosoTimeRecords {

    public constructor(private soncosoStorage: SoncosoStorage, private api: SoncosoRestApi) {
        this.build = this.build.bind(this);
    }

    public build(from: Date, until: Date): Rx.Observable<SoncosoModel.TimeRecord[]> {
        return this.soncosoStorage.currentSoncosoUser().flatMap((user) => {
            return this.api.getTimeRecords(from, until).map((records) => {
                records.forEach((r) => {
                    r.startTime = r.startTime.round();
                    r.endTime = r.endTime.round();
                    r.job = user.jobs.firstOrNull((j) => j.id === r.jobId);
                });
                return records;
            });

            /*const jobs = user.jobs.filter((job) => job.startDate <= until && job.endDate >= from);
            const requests = jobs.map((job) => {
                return this.fetchJobTimes(job).flatMap((jobTimes) => {
                    return this.api.getTimeRecords(job.id, from, until).map((records) => {
                        records.forEach((r) => {
                            r.startTime = r.startTime.round();
                            r.endTime = r.endTime.round();
                        });
                        return records;
                    });
                });
            });

            return Rx.Observable.forkJoin(requests).map((lists) => [].concat.apply([], lists));*/
        });
    }

    /*private fetchJobTimes(job: SoncosoModel.Job): Rx.Observable<SoncosoModel.JobTime[]> {
        if (!!job.jobTimes && job.jobTimes.length > 0) {
            return Rx.Observable.of(job.jobTimes);
        }

        return this.api.getJobTimes(job.id).map((times) => {
            times.forEach((t) => t.job = job);
            job.jobTimes = times;
            return times;
        });
    }*/
}
