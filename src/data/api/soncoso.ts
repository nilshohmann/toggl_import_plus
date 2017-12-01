import Rx = require("rxjs");
import { Credentials } from "../../domain/model/credentials";
import SoncosoModel = require("../../domain/model/soncoso");
import SoncosoMapper = require("../mapper/soncoso");
import { RestRequest } from "./restrequest";

import { Service } from "typedi";

/**
 * Interface for the Soncoso Rest-Facade
 */
@Service()
export class SoncosoRestApi {

    private static BASE_URL = "https://portal.lmis.de/mobile-proxy";

    private static START_SESSION = "/security/UserCoreRestFacade/startSession";
    private static FETCH_ALL_INDIVIDUALLY = "/security/MasterdataCoreRestFacade/fetchAllIndividually";
    private static FETCH_BY_FILTER = "/security/MasterdataCoreRestFacade/fetchByFilter";
    private static FETCH_BY_FILTER_INDIVIDUALLY = "/security/MasterdataCoreRestFacade/fetchByFilterIndividually";
    private static CREATE = "/security/MasterdataCoreRestFacade/create";
    private static UPDATE = "/security/MasterdataCoreRestFacade/update";
    private static DELETE = "/security/MasterdataCoreRestFacade/delete";

    private authString: string;
    private credentials: Credentials;
    private businessUnit: string;

    /**
     * Creates a base64 authentication string for given credentials
     *
     * @param credentials Credentials
     */
    private buildAuthString(credentials: Credentials) {
        return "Basic " + btoa(credentials.username + ":" + credentials.password);
    }

    /**
     * Creates a new request object with the given path
     *
     * @param path Relative path
     */
    private request(path: string): RestRequest {
        return new RestRequest(SoncosoRestApi.BASE_URL + path)
            .withAuthentication(this.authString)
            .withHeader("businessUnitId", this.businessUnit)
            .withHeader("maxhits", "99999");
    }

    /**
     * Executes a login with the given credentials
     *
     * @param credentials Credentials to use
     */
    public authenticate(credentials: Credentials): Rx.Observable<SoncosoModel.UserInfo> {
        const self = this;
        return new RestRequest(SoncosoRestApi.BASE_URL + SoncosoRestApi.START_SESSION)
            .withAuthentication(this.buildAuthString(credentials))
            .get()
            .map(SoncosoMapper.userInfoToModel)
            .map((userInfo) => {
                userInfo.credentials = credentials;
                self.credentials = credentials;
                self.businessUnit = userInfo.businessUnit;
                self.authString = self.buildAuthString(credentials);
                return userInfo;
            });
    }

    /**
     * Fetches all jobs for the current user
     */
    public getJobs(): Rx.Observable<SoncosoModel.Job[]> {
        return this.request(SoncosoRestApi.FETCH_BY_FILTER_INDIVIDUALLY)
            .withHeader("entityType", "JobContainer")
            .withHeader("searchString", "j.id > 0")
            // .withHeader("searchString", `j.employee.id = '${this.userInfo.credentials.username}'`)
            .get()
            .map(SoncosoMapper.jobsToModel);
    }

    /**
     * Fetches all job times for a given job and date
     *
     * @param jobId ID of the job
     * @param date Date
     */
    public getJobTime(jobId: number, date: Date): Rx.Observable<SoncosoModel.JobTime> {
        return this.request(SoncosoRestApi.FETCH_BY_FILTER)
            .withHeader("entityType", "JobTimeContainer")
            .withHeader("searchString", `j.job.id = ${jobId} AND j.date = '${date.format("yyyy-mm-dd")}'`)
            .get()
            .map(SoncosoMapper.jobTimesToModel)
            .map((t) => t.firstOrNull());
    }

    /**
     * Fetches all job times for a given job
     *
     * @param jobId ID of the job
     */
    /*public getJobTimes(jobId: number): Rx.Observable<SoncosoModel.JobTime[]> {
        return this.request(SoncosoRestApi.FETCH_BY_FILTER)
            .withHeader("entityType", "JobTimeContainer")
            .withHeader("searchString", `j.job.id = ${jobId}`)
            .get()
            .map(SoncosoMapper.jobTimesToModel);
    }*/

    /**
     * Fetches all time records
     *
     * @param startDate Start date
     * @param endDate End date
     */
    public getTimeRecords(startDate: Date, endDate: Date): Rx.Observable<SoncosoModel.TimeRecord[]> {
        const from = startDate.format("yyyy-mm-dd");
        const until = endDate.format("yyyy-mm-dd");

        return this.request(SoncosoRestApi.FETCH_BY_FILTER_INDIVIDUALLY)
            .withHeader("entityType", "TimeRecord")
            .withHeader("searchString", `t.date >= '${from}' AND t.date <= '${until}'`)
            .get()
            .map(SoncosoMapper.timeRecordsToModel);
    }

    /**
     * Create a given time record
     *
     * @param timeRecord Time record
     */
    public createTimeRecord(timeRecord: SoncosoModel.TimeRecord): Rx.Observable<void> {
        const recordDTO = SoncosoMapper.timeRecordToDto(timeRecord);
        return this.request(SoncosoRestApi.CREATE)
                .withHeader("entityType", "TimeRecord")
                .withHeader("Content-Type", "application/json")
                .withBody(JSON.stringify(recordDTO))
                .post();
    }

    /**
     * Create a given list of time records
     *
     * @param timeRecords Time records
     */
    public createTimeRecords(timeRecords: SoncosoModel.TimeRecord[]): Rx.Observable<void> {
        const requests = timeRecords.map((timeRecord) => this.createTimeRecord(timeRecord));
        return Rx.Observable.forkJoin(requests).map(() => { return; });
    }

    /**
     * Deletes a range of time records with the given ids
     *
     * @param ids Ids of the time records
     */
    public deleteTimeRecords(...ids: number[]): Rx.Observable<void> {
        return this.request(SoncosoRestApi.FETCH_BY_FILTER_INDIVIDUALLY)
            .withHeader("entityType", "TimeRecord")
            .withHeader("ids", ids.join(","))
            .get()
            .map(() => { return; });
    }
}
