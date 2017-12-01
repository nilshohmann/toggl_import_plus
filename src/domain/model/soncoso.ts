import { Credentials } from "./credentials";

/**
 * Information for an authorized user
 */
export class UserInfo {
    /** Credentials */
    public credentials: Credentials;

    /** BusinessUnit */
    public businessUnit: string;

    /** Jobs */
    public jobs: Job[];
}

/**
 * Job.
 */
export class Job {
    /** Unique ID */
    public id: number;

    /** Start time */
    public startDate: Date;

    /** End time */
    public endDate: Date;

    /** Label */
    public label: string;

    /** List of all job times */
    public jobTimes: JobTime[];

    /** Customer label */
    public customer: string;
}

/**
 * Job time.
 */
export class JobTime {
    /** Unique ID */
    public id: number;

    /** Date */
    public date: Date;

    /** Start time */
    public startTime: Date;

    /** End time */
    public endTime: Date;

    /** Job */
    public job: Job;
}

/**
 * Entry for time tracking.
 */
export class TimeRecord {
    /** Unique ID */
    public id: number;

    /** Date */
    public date: Date;

    /** Start time */
    public startTime: Date;

    /** End time */
    public endTime: Date;

    /** Is synchronized */
    public synchronized: boolean;

    /** Pause duration */
    public pauseDurationMins: number;

    /** Absence */
    public absence: string;

    /** Description */
    public description: string;

    /** Job id */
    public jobId: number;

    /** Job */
    public job: Job = null;

    /** Jome time id */
    public jobTimeId: number;
}
