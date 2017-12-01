import SoncosoModel = require("../../domain/model/soncoso");
import SoncosoDTO = require("../dto/soncoso");

export function userInfoToModel(dto: SoncosoDTO.UserInfoDTO): SoncosoModel.UserInfo {
    return !dto ? null : {
        businessUnit: dto.businessUnit.id,
        credentials: {
            password: null,
            username: dto.loginname,
        },
        jobs: null,
    };
}

export function jobToModel(dto: SoncosoDTO.JobDTO): SoncosoModel.Job {
    return !dto ? null : {
        customer: dto.customerLabel,
        endDate: new Date(dto.endDate),
        id: dto.id,
        jobTimes: null,
        label: dto.label,
        startDate: new Date(dto.startDate),
    };
}

export function jobsToModel(dtos: SoncosoDTO.JobDTO[]): SoncosoModel.Job[] {
    return !dtos ? null : dtos.map(jobToModel);
}

export function jobTimeToModel(dto: SoncosoDTO.JobTimeDTO): SoncosoModel.JobTime {
    return !dto ? null : {
        date: new Date(dto.date),
        endTime: new Date(dto.endTime),
        id: dto.id,
        job: null,
        startTime: new Date(dto.startTime),
    };
}

export function jobTimesToModel(dtos: SoncosoDTO.JobTimeDTO[]): SoncosoModel.JobTime[] {
    return !dtos ? null : dtos.map(jobTimeToModel);
}

export function timeRecordToModel(dto: SoncosoDTO.TimeRecordDTO): SoncosoModel.TimeRecord {
    return !dto ? null : {
        absence: dto.absence,
        date: new Date(dto.date),
        description: dto.additionalInfo,
        endTime: new Date(dto.endTime),
        id: dto.id,
        job: null,
        jobId: dto.jobId,
        jobTimeId: dto.jobTimeId,
        pauseDurationMins: dto.pauseDurationMins,
        startTime: new Date(dto.startTime),
        synchronized: true,
    };
}

export function timeRecordsToModel(dtos: SoncosoDTO.TimeRecordDTO[]): SoncosoModel.TimeRecord[] {
    return !dtos ? null : dtos.map(timeRecordToModel);
}

function getJobTimeId(timeRecord: SoncosoModel.TimeRecord): number {
    for (const jobTime of timeRecord.job.jobTimes) {
        if (jobTime.date.getTime() === timeRecord.date.getTime()) {
            return jobTime.id;
        }
    }
    throw new Error("No jobtime found for the given date.");
}

function formatDate(date: Date): string {
    return date.toISOString().replace("Z", "+0000");
}

export function timeRecordToDto(model: SoncosoModel.TimeRecord): SoncosoDTO.TimeRecordDTO {
    return !model ? null : {
        absence: model.absence,
        additionalInfo: model.description,
        calculatedDuration: Math.floor(((model.endTime.getTime() - model.startTime.getTime()) / 1000) / 60),
        createdBy: "",
        createdOn: "",
        date: formatDate(model.date),
        endTime: formatDate(model.endTime),
        id: 0,
        jobEmployeeId: "",
        jobId: model.jobId,
        jobLabel: model.job.label,
        jobTimeId: getJobTimeId(model),
        label: "",
        pauseDurationMins: model.pauseDurationMins,
        startTime: formatDate(model.startTime),
        timeSigned: false,
        version: 0,
    };
}
