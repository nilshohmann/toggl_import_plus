import { Credentials } from "./credentials";

/**
 * Information for an authorized user
 */
export class UserInfo {

    /** Credentials */
    public credentials: Credentials;

    /** Full name */
    public fullname: string;

    /** API token */
    public apiToken: string;

    /** ID for the default workspace */
    public defaultWorkspaceId: number;

    /** Workspaces */
    public workspaces: Workspace[];
}

/**
 * Workspace
 */
export class Workspace {

    /** Unique id */
    public id: number;

    /** Name */
    public name: string;

    /** Clients */
    public clients: Client[];
}

/**
 * Client
 */
export class Client {

    /** Unique id */
    public id: number;

    /** Workspace */
    public workspace: Workspace;

    /** Workspace id */
    public workspaceId: number;

    /** Projects */
    public projects: Project[];

    /** Name */
    public name: string;
}

/**
 * Project
 */
export class Project {

    /** Unique id */
    public id: number;

    /** Workspace */
    public workspace: Workspace;

    /** Workspace id */
    public workspaceId: number;

    /* Client */
    public client: Client;

    /** Client id */
    public clientId: number;

    /** Name */
    public name: string;

    /* Color code */
    public color: string;
}

/**
 * Time record
 */
export class TimeRecord {

    /** Unique id */
    public id: number;

    /* Project */
    public project: Project;

    /** Project id */
    public projectId: number;

    /** Unique id */
    public userId: number;

    /** Description */
    public description: string;

    /** Start time */
    public start: Date;

    /** End time */
    public end: Date;
}
