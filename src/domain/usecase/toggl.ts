import Rx = require("rxjs");

import { TogglRestApi } from "../../data/api/toggl";
import { TogglStorage } from "../../data/storage/togglstorage";
import { Credentials } from "../model/credentials";
import TogglModel = require("../model/toggl");

import { Inject, Service } from "typedi";

@Service()
export class GetStoredTogglCredentials {

    public constructor(private togglStorage: TogglStorage) {
        this.build = this.build.bind(this);
    }

    public build(): Rx.Observable<Credentials> {
        return this.togglStorage.getTogglCredentials();
    }
}

@Service()
export class GetCurrentTogglUser {

    public constructor(private togglStorage: TogglStorage) {
        this.build = this.build.bind(this);
    }

    public build(): Rx.Observable<TogglModel.UserInfo> {
        return this.togglStorage.currentTogglUser();
    }
}

@Service()
export class AuthenticateTogglUser {

    public constructor(private togglStorage: TogglStorage, private api: TogglRestApi) {
        this.build = this.build.bind(this);
        this.fetchClients = this.fetchClients.bind(this);
        this.fetchProjects = this.fetchProjects.bind(this);
    }

    public build(credentials: Credentials): Rx.Observable<TogglModel.UserInfo> {
        if (!credentials.password) {
            credentials.password = "api_token";
        }

        return this.api.authenticate(credentials).flatMap((user) => {
            const apiCredentials = new Credentials(user.apiToken, "api_token");
            return this.togglStorage.setTogglCredentials(apiCredentials)
                .flatMap(() => this.fetchWorkspaces(user))
                .do(this.togglStorage.setTogglUser);
        });
    }

    private fetchWorkspaces(user: TogglModel.UserInfo): Rx.Observable<TogglModel.UserInfo> {
        return Rx.Observable
            .forkJoin(user.workspaces.map((workspace) => this.fetchClients(workspace)))
            .map(() => user);
    }

    private fetchClients(workspace: TogglModel.Workspace): Rx.Observable<TogglModel.Workspace> {
        return this.api.getClients(workspace.id).flatMap((clients) => {
            workspace.clients = clients || [];
            workspace.clients.push({
                id: 0,
                name: "[no client]",
                projects: [],
                workspace,
                workspaceId : workspace.id,
            });

            return this.fetchProjects(workspace);
        });
    }

    private fetchProjects(workspace: TogglModel.Workspace): Rx.Observable<TogglModel.Workspace> {
        return this.api.getProjects(workspace.id).map((projects) => {
            projects = projects || [];
            projects.forEach((p) => p.clientId = p.clientId || 0);

            projects.groupBy<number>((p) => p.clientId).forEach((g) => {
                const client = workspace.clients.firstOrNull((c) => c.id === g.key);
                if (!client) {
                    console.warn("Failed to find client for projects:", g);
                    return;
                }
                client.projects = g;
                g.forEach((p) => p.client = client);
            });
            return workspace;
        });
    }
}

@Service()
export class GetTogglTimeRecords {

    public constructor(private togglStorage: TogglStorage, private api: TogglRestApi) {
        this.build = this.build.bind(this);
    }

    public build(from: Date, until: Date): Rx.Observable<TogglModel.TimeRecord[]> {
        return this.togglStorage.currentTogglUser().flatMap((user) => {
            const requests = user.workspaces.map((workspace) => {
                const allProjects = workspace.clients.map((c) => c.projects || []).reduce((p, c) => p.concat(c), []);
                return this.api.getTimeRecords(workspace.id, from, until).map((records) => {
                    records.forEach((r) => {
                        r.start = r.start.round();
                        r.end = r.end.round();
                        r.project = allProjects.firstOrNull((p) => p.id === r.projectId);
                    });
                    return records;
                });
            });
            return Rx.Observable.forkJoin(requests).map((lists) => [].concat.apply([], lists));
        });
    }
}
