/**
 * DTO for the permissions for a entity
 */
export interface EntityPermission {
    entityType: string;
    crudPermission: boolean[];
}

/**
 * DTO for the information of an user
 */
export interface UserInfoDTO {
    businessUnit: {
        id: string;
        expensesItemTemplates: any[];
        vats: any[];
        taskCategories: string[];
        addressLine1: string;
        addressLine2: string;
        addressLine3: string;
        zipCode: string;
        city: string;
        country: string;
        state: string;
        website: string;
        email: string;
        tel1: string;
        fax1: string;
        tel2: string;
        version: number;
        additionalInfo: string;
        label: string;
        createdBy: string;
        createdOn: string; // UTC-Date
        modifiedOn: string; // UTC-Date
        modifiedBy: string;
    };
    loginname: string;
    sessionStarted: number;
    level: string;
    teamLead: false;
    employees: string[];
    teamEmployees: string[];
    entityPermissions: EntityPermission[];
    workflowExecutePermissions: string[];
}

/**
 * DTO for a job
 */
export interface JobDTO {
    id: number;
    amount: number;
    designatedAmount: number;
    pricePerUnit: number;
    netAssignedHourBasedCosts: number;
    netAssignedTurnover: number;
    coverage1: number;
    currency: string;
    unit: string;
    grossPrice: number;
    netPrice: number;
    netCostsPerUnit: number;
    netCostsPerUnitIsSalary: boolean;
    businessUnitId: string;
    internal: boolean;
    netRelativeFee: number;
    startDate: string;
    endDate: string;
    jobType: string;
    status: string;
    internalStatus: string;
    employeeId: string;
    responsibleEmployeeId: string;
    customerContactId: number;
    customerContactLabel: string;
    endCustomerContactId: number;
    endCustomerContactLabel: string;
    customerId: number;
    customerLabel: string;
    endCustomerId: number;
    endCustomerLabel: string;
    addressLine: string;
    addressCity: string;
    addressZipCode: string;
    addressState: string;
    addressCountry: string;
    notes: string[];
    version: number;
    additionalInfo: string;
    label: string;
    createdBy: string;
    createdOn: string;
    modifiedOn: string;
    modifiedBy: string;
}

/**
 * DTO for a job time
 */
export interface JobTimeDTO {
    id: number;
    date: string; // UTC-Date-Format
    endTime: string; // UTC-Date-Format
    startTime: string; // UTC-Date-Format
    timeType: string;
    version: number;
    label: string;
    createdBy: string;
    createdOn: string; // UTC-Date-Format
}

/**
 * DTO for a time record
 */
export interface TimeRecordDTO {
    id: number;
    date: string;
    endTime: string; // UTC-Date-Format
    pauseDurationMins: number;
    calculatedDuration: number;
    startTime: string; // UTC-Date-Format
    jobId: number;
    jobLabel: string;
    jobTimeId: number;
    timeSigned: boolean;
    absence: string;
    jobEmployeeId: string;
    version: number;
    label: string;
    additionalInfo: string;
    createdBy: string;
    createdOn: string; // UTC-Date-Format
}
