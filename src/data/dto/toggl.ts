/**
 * DTO for user information
 */
export interface UserInfoDTO {
    since: number; // Unix-Timestamp

    data: {
        achievements_enabled: boolean;
        api_token: string;
        at: string; // UTC-Date
        beginning_of_week: number;
        created_at: string; // UTC-Date
        date_format: string;
        default_wid: number;
        duration_format: string;
        email: string;
        fullname: string;
        id: number;
        image_url: string;
        language: string;
        retention: number;
        timeofday_format: string;
        timezone: string;
        workspaces: WorkspaceDTO[];
    };
}

/**
 * DTO for the workspace
 */
export interface WorkspaceDTO {
    admin: boolean;
    at: string; // UTC-Date
    default_currency: string;
    default_hourly_rate: number;
    id: number;
    logo_url: string;
    name: string;
    only_admins_may_create_projects: boolean;
    only_admins_see_billable_rates: boolean;
    rounding: number;
    rounding_minutes: number;
    premium: boolean;
}

/**
 * DTO for a client
 */
export interface ClientDTO {
    at: string; // UTC-Date
    cur: string;
    hrate: number;
    id: number;
    name: string;
    notes: string;
    wid: number;
}

/**
 * DTO for a project
 */
export interface ProjectDTO {
    active: boolean;
    at: string; // UTC-Date
    billable: boolean;
    cid: number;
    id: number;
    is_private: boolean;
    name: string;
    wid: number;
    hex_color: string;
}

/**
 * DTO for the detailed report
 */
export interface DetailedReportDTO {
    data: TimeRecordDTO[];
    per_page: number;
    total_billable: number;
    total_count: number;
    total_currencies: any[];
    total_grand: number;
}

/**
 * DTO for a time record
 */
export interface TimeRecordDTO {
    billable: number;
    description: string;
    client: string;
    cur: string;
    dur: number;
    end: string; // UTC-Date
    id: number;
    is_billable: boolean;
    pid: number;
    project: string;
    start: string; // UTC-Date
    tags: string[];
    task: string;
    tid: number;
    uid: number;
    updated: string; // UTC-Date
    user: string;
    use_stop: boolean;
}
