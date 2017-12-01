import TogglModel = require("../../domain/model/toggl");
import TogglDTO = require("../dto/toggl");

export function userInfoToModel(dto: TogglDTO.UserInfoDTO): TogglModel.UserInfo {
    if (!dto || !dto.data) {
        return null;
    }

    const workspaces = workspacesToModel(dto.data.workspaces);

    return {
        apiToken: dto.data.api_token,
        credentials: { username: dto.data.email, password: null},
        defaultWorkspaceId: dto.data.default_wid,
        fullname: dto.data.fullname,
        workspaces,
    };
}

export function workspaceToModel(dto: TogglDTO.WorkspaceDTO): TogglModel.Workspace {
    return !dto ? null : {
        clients: [],
        id: dto.id,
        name: dto.name,
    };
}

export function workspacesToModel(dtos: TogglDTO.WorkspaceDTO[]): TogglModel.Workspace[] {
    return !dtos ? null : dtos.map(workspaceToModel);
}

export function clientToModel(dto: TogglDTO.ClientDTO): TogglModel.Client {
    return !dto ? null : {
        id: dto.id,
        name: dto.name,
        projects: [],
        workspace: null,
        workspaceId: dto.wid,
    };
}

export function clientsToModel(dtos: TogglDTO.ClientDTO[]): TogglModel.Client[] {
    return !dtos ? null : dtos.map(clientToModel);
}

export function projectToModel(dto: TogglDTO.ProjectDTO): TogglModel.Project {
    return !dto ? null : {
        client: null,
        clientId: dto.cid,
        color: dto.hex_color,
        id: dto.id,
        name: dto.name,
        workspace: null,
        workspaceId: dto.wid,
    };
}

export function projectsToModel(dtos: TogglDTO.ProjectDTO[]): TogglModel.Project[] {
    return !dtos ? null : dtos.map(projectToModel);
}

export function timeRecordToModel(dto: TogglDTO.TimeRecordDTO): TogglModel.TimeRecord {
    return !dto ? null : {
        description: dto.description,
        end: new Date(dto.end),
        id: dto.id,
        project: null,
        projectId: dto.pid,
        start: new Date(dto.start),
        userId: dto.uid,
    };
}

export function timeRecordsToModel(dtos: TogglDTO.TimeRecordDTO[]): TogglModel.TimeRecord[] {
    return !dtos ? null : dtos.map(timeRecordToModel);
}
