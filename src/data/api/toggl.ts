import Rx = require("rxjs");
import { Credentials } from "../../domain/model/credentials";
import TogglModel = require("../../domain/model/toggl");
import TogglDTO = require("../dto/toggl");
import TogglMapper = require("../mapper/toggl");
import { RestRequest } from "./restrequest";

import { Service } from "typedi";

/**
 * Interface for the Toggl Rest-Facade
 */
@Service()
export class TogglRestApi {

    private static AGENT = "TogglImport";

    private static ME = "/api/v8/me";
    private static WORKSPACES = "/api/v8/workspaces";
    private static CLIENTS = "/api/v8/workspaces/{0}/clients";
    private static PROJECTS = "/api/v8/clients/{0}/projects";
    private static DETAILS = "/reports/api/v2/details";

    private authString: string = null;
    private credentials: Credentials = null;

    /**
     * Creates a base64 authentication string for given API token or credentials
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
     * @returns {RestRequest} -
     */
    private request(path: string): RestRequest {
        return new RestRequest("https://www.toggl.com" + path)
            .withAuthentication(this.authString);
    }

    public authenticate(credentials: Credentials): Rx.Observable<TogglModel.UserInfo> {
        const self = this;
        return new RestRequest("https://www.toggl.com" + TogglRestApi.ME)
            .withAuthentication(this.buildAuthString(credentials))
            .get()
            .map(TogglMapper.userInfoToModel)
            .do((userInfo) => {
                self.credentials = new Credentials(userInfo.apiToken, "api_token");
                self.authString = self.buildAuthString(self.credentials);
            });
    }

    /**
     * Fetches all workspaces for the current user
     */
    public getWorkspaces(): Rx.Observable<TogglModel.Workspace[]> {
        return this.request(TogglRestApi.WORKSPACES)
            .get()
            .map(TogglMapper.workspacesToModel);
    }

    /**
     * Fetches all clients for a given workspace
     *
     * @param workspaceId Workspace id
     */
    public getClients(workspaceId: number): Rx.Observable<TogglModel.Client[]> {
        return this.request(TogglRestApi.CLIENTS.format(workspaceId))
            .get()
            .map(TogglMapper.clientsToModel);
    }

    /**
     * Fetches all projects for a given client
     *
     * @param clientId Client id
     */
    public getProjects(clientId: number): Rx.Observable<TogglModel.Project[]> {
        return this.request(TogglRestApi.PROJECTS.format(clientId))
            .get()
            .map(TogglMapper.projectsToModel);
    }

    /**
     * Fetches all time records for the given workspace and time range
     *
     * @param workspaceId Workspace id
     * @param startDate Start date
     * @param endDate End date
     */
    public getTimeRecords(workspaceId: number, startDate: Date, endDate: Date): Rx.Observable<TogglModel.TimeRecord[]> {
        const self = this;
        const params = "?workspace_id=" + workspaceId +
            "&since=" + startDate.format("yyyy-mm-dd") +
            "&until=" + endDate.format("yyyy-mm-dd") +
            "&user_agent=" + TogglRestApi.AGENT;

        return this.request(TogglRestApi.DETAILS + params)
            .get()
            .flatMap((report: TogglDTO.DetailedReportDTO) => {
                const pageCount = Math.ceil(report.total_count / report.per_page);
                if (pageCount <= 1) {
                    return Rx.Observable.of(report.data);
                }

                const requests = [...Array(pageCount - 1).keys()].map((p) => p + 2).map((page) =>
                    self.request(TogglRestApi.DETAILS + params + "&page=" + page)
                        .get()
                        .map((r: TogglDTO.DetailedReportDTO) => r.data));
                return Rx.Observable.forkJoin(requests).map((list) => [].concat.apply(report.data, list));
            })
            .map(TogglMapper.timeRecordsToModel);
    }
}
