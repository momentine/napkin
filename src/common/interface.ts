import { BrowserWindowConstructorOptions } from "electron";

//#region Result Information
export interface IResultDataInfoArray<T> {
    key?: string;
    value?: T[];
}

export class ResultInfo {
    code: number;
    msg: any;

    constructor(code: number, msg?: any) {
        this.code = code;
        this.msg = msg;
    }

    static success(msg?: any): ResultInfo {
        return new ResultInfo(1, msg);
    }

    static faild(msg: any): ResultInfo {
        return new ResultInfo(0, msg);
    }
}
//#endregion

//#region TO-DO Information
// TO-DO Information
export interface TodoModel {
    // Unique ID
    id?: number;
    // Content
    content: string;
    // Status: 0 for incomplete, 1 for completed, 2 for deleted, 4 for overdue incomplete
    status: StatusModel;
    // Reminder
    remind?: RemindModel;
    // Creation time
    createTime?: number;
    createDate?: string;
    // Completion time
    complateTime?: number;
    complateDate?: string;
    // Last completion time
    lastComplateDate?: string;
    // Parent ID
    parentId?: number;
    // Extended information
    _extend?: TodoExtendModel;
}
// Extended information
export interface TodoExtendModel {
    // Milliseconds since last completion
    ms?: number;
    // Temporary mark as deleted
    remove?: boolean;
}
// Recurring modes
export enum RemindWayModel {
    Once,
    Daily,
    Weekly,
    Monthly,
    Yearly,
}
// Recurring settings
export interface RemindWaySettingModel {
    // Date timestamp
    ms?: number;
    // Month
    month?: number;
    // Day
    day?: number;
    // Year
    year?: number;
    // Weekday
    week?: WeekModel;
}
export enum WeekModel {
    Sunday,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
}
// Reminder information
export interface RemindModel {
    // Recurring mode
    way?: RemindWayModel;
    // Recurring settings
    waySetting?: RemindWaySettingModel;
    // Reminder time (timestamp)
    ms?: number;
    // Reminder time (date)
    msDate?: string;
    msStr?: string;
    // Hour
    hour?: number;
    // Minute
    minute?: number;
    // Second
    seconds?: number;
}
// Status
export enum StatusModel {
    Incomplete,
    OverdueIncomplete,
    Completed,
    Deleted,
}
//#endregion

//#region 

/**
 * Configuration information for creating a window
 */
export interface CreateWindowOption extends BrowserWindowConstructorOptions {
    // URL to load
    url: string;
    // Open dev tools
    dev: boolean;
    // Show window
    show: boolean;
}
//#endregion
