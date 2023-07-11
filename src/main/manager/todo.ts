import { IResultDataInfoArray, RemindWayModel, ResultInfo, StatusModel, TodoModel, WeekModel } from "@/common/interface";
import { IpcMainEvent } from "electron";
import { SnowflakeIdv1 } from 'simple-flakeid'
import { DB, getDB } from "../utils/db";
import _ from 'lodash'
import moment, { Moment } from "moment";
import { getAllHaveTodoIds } from "./tip";
import { timeReverse } from "@/common/utils/time";

let snow = new SnowflakeIdv1({ workerId: 1 });
// Default database
let db = getDB<TodoModel>('todo');
// Deleted database
let remDb = getDB<TodoModel>('remTodo');
// Completed database
let complateDb = getDB<TodoModel>('complateTodo');

// Filter TodoModel
export const filterTodoModel = (todo: TodoModel): TodoModel => {
    let keys = Object.keys(todo).filter(m => m.startsWith('_'));
    keys.forEach(key => {
        delete todo[key];
    });
    return todo;
};

/**
 * Set the reminder time based on the specified rules
 * @param todo Todo
 * @param add Add one day to the reminder time
 */
export const changeRemindInfo = (todo: TodoModel, add: boolean = false) => {
    if (todo.remind) {
        let now = moment();
        if (add) {
            now.add(1, 'day');
        }
        let lastDay = moment().endOf('month').date();
        let time: moment.Moment;
        switch (todo.remind.way) {
            case RemindWayModel.Once:
            case RemindWayModel.Yearly:
                time = moment(todo.remind.ms).set('year', todo.remind.waySetting.year).set('month', todo.remind.waySetting.month - 1).set('date', todo.remind.waySetting.day);
                break;
            case RemindWayModel.Weekly:
            case RemindWayModel.Daily:
                if (todo.remind.way == RemindWayModel.Weekly) {
                    while (now.weekday() != todo.remind.waySetting.week) {
                        now.add(1, 'day');
                    }
                }
                time = moment(todo.remind.ms).set('year', now.year()).set('month', now.month()).set('date', now.date());
                break;
            case RemindWayModel.Monthly:
                if (todo.remind.waySetting.day == 0) {
                    // Last day of the month
                    time = moment(todo.remind.ms).set('year', now.year()).set('month', now.month()).set('date', lastDay);
                } else {
                    time = moment(todo.remind.ms).set('year', now.year()).set('month', now.month()).set('date', todo.remind.waySetting.day);
                    if (time.date() != todo.remind.waySetting.day) {
                        time = moment(todo.remind.ms).set('year', now.year()).set('month', now.month() + 1).set('date', todo.remind.waySetting.day);
                    }
                }
                break;
        }
        if (time) {
            todo.remind.ms = time.toDate().getTime();
            todo.remind.msDate = time.format('MM-DD-YYYY');
            todo.remind.msStr = time.format('MM-DD-YYYY HH:mm:ss');
        }
    }
};

/**
 * Add a new Todo
 * @param todo Todo
 * @returns ResultInfo
 */
export const addTodo = (todo: TodoModel): ResultInfo => {
    todo = filterTodoModel(todo);
    let id = snow.NextId();
    while (db.data.find(m => m.id == id)) {
        id = snow.NextId();
    }
    todo.id = id as number;
    const now = moment();
    todo.createTime = now.unix();
    todo.createDate = now.format('MM-DD-YYYY');
    // Set reminder time based on rules
    changeRemindInfo(todo);
    db.insert(todo);
    return ResultInfo.success();
};

/**
 * Restore a Todo
 * @param id Todo id
 * @returns ResultInfo
 */
export const restoreTodo = (id: number): ResultInfo => {
    let model = remDb.data.find(m => m.id == id);
    let index = remDb.data.findIndex(m => m.id == id);
    if (model) {
        model.status = StatusModel.Incomplete;
        remDb.remove(index);
        db.insert(model);
        return ResultInfo.success();
    }
    return ResultInfo.faild('Does not exist');
};

/**
 * Delete a Todo
 * @param id Todo id
 * @returns ResultInfo
 */
export const delTodo = (id: number): ResultInfo => {
    let tempDb = db;
    let model = db.data.find(m => m.id == id);
    let index = db.data.findIndex(m => m.id == id);
    // If not found, check the completed database
    if (!model) {
        model = complateDb.data.find(m => m.id == id);
        index = complateDb.data.findIndex(m => m.id == id);
        tempDb = complateDb;
        // Check if the deleted record is the last completion
        if (model && model.parentId) {
            let temp = db.data.find(m => m.id == model.parentId);
            if (temp) {
                temp.remind = model.remind;
                delete temp.lastComplateDate;
                db.update();
            }
        }
    }
    if (model) {
        model.status = StatusModel.Deleted;
        remDb.insert(model);
        tempDb.remove(index, 1);
        return ResultInfo.success();
    }
    // Handle deletion failure logic
    return ResultInfo.faild("Deletion failed");
};

/**
 * Permanently delete a Todo
 * @param id Todo id
 * @returns ResultInfo
 */
export const permanentDelTodo = (id: number): ResultInfo => {
    let tempDb = remDb;
    let index = remDb.data.findIndex(m => m.id == id);
    // If not found, check the completed database
    if (index < 0) {
        index = complateDb.data.findIndex(m => m.id == id);
        tempDb = complateDb;
        // Check if the deleted record is the last completion
        if (index > -1) {
            let parent = complateDb.data.find(m => m.id == id);
            if (parent.parentId) {
                let temp = db.data.find(m => m.id == parent.parentId);
                if (temp) {
                    temp.remind = parent.remind;
                    delete temp.lastComplateDate;
                    db.update();
                }
            }
        }
    }
    if (index > -1) {
        tempDb.remove(index, 1);
        return ResultInfo.success();
    }
    return ResultInfo.faild("Does not exist");
};

/**
 * Clear all todos
 * @returns ResultInfo
 */
export const clearTodo = (): ResultInfo => {
    remDb.clear();
    return ResultInfo.success();
};

/**
 * Edit a Todo
 * @param todo Todo
 * @returns ResultInfo
 */
export const editTodo = (todo: TodoModel): ResultInfo => {
    todo = filterTodoModel(todo);
    changeRemindInfo(todo);
    let index = db.data.findIndex(m => m.id == todo.id);
    if (index > -1) {
        db.change(index, todo, ['id']);
        return ResultInfo.success();
    }
    return ResultInfo.faild('Does not exist');
};

/**
 * Complete a Todo
 * @param id Todo id
 * @returns ResultInfo
 */
export const complateTodo = (id: number): ResultInfo => {
    let model = db.data.find(m => m.id == id);
    let index = db.data.findIndex(m => m.id == id);
    if (model) {
        const now = moment();
        if (!model.remind || model.remind.way == RemindWayModel.Once) {
            // Logic for completing without reminder
            model.status = StatusModel.Completed;
            model.complateTime = now.unix();
            model.complateDate = now.format('MM-DD-YYYY');
            db.remove(index, 1);
            complateDb.insert(model);
            return ResultInfo.success();
        } else {
            let complateModel = _.cloneDeep(model);
            complateModel.status = StatusModel.Completed;
            complateModel.complateTime = now.unix();
            complateModel.complateDate = now.format('MM-DD-YYYY');
            model.id = snow.NextId() as number;
            complateModel.parentId = model.id;
            complateDb.insert(complateModel);
            model.status = StatusModel.Incomplete;
            model.lastComplateDate = complateModel.complateDate;
            changeRemindInfo(model, true);
            db.update();
        }
    }
    return ResultInfo.faild('Does not exist');
};

/**
 * Cancel completion of a Todo
 * @param id Todo id
 * @returns ResultInfo
 */
export const cancelComplateTodo = (id: number): ResultInfo => {
    let model = complateDb.data.find(m => m.id == id);
    let index = complateDb.data.findIndex(m => m.id == id);
    if (model) {
        // Logic for canceling completion without reminder
        model.status = StatusModel.Incomplete;
        delete model.complateTime;
        delete model.complateDate;
        complateDb.remove(index, 1);
        db.insert(model);
        return ResultInfo.success();
    } else {
        // Other reminder methods
        model = db.data.find(m => m.id == id);
        let complateModel = complateDb.data.find(m => m.parentId == id);
        index = complateDb.data.findIndex(m => m.id == id);
        complateModel.status = model.status;
        delete complateModel.complateTime;
        delete complateModel.complateDate;
        delete complateModel.parentId;
        model = Object.assign(model, complateModel);
        model.status = StatusModel.Incomplete;
        delete model.lastComplateDate;
        changeRemindInfo(model);
        db.update();
        complateDb.remove(index, 1);
    }
    return ResultInfo.faild('Does not exist');
};

/**
 * Get all Todos
 * @returns ResultInfo
 */
export const getTodo = (): ResultInfo => {
    let allData = db.data.concat(complateDb.data);
    let data = _.chain(allData)
        .filter(m => !m.parentId)
        .sortBy((o) => o.status)
        .sortBy(o => o.lastComplateDate ? 1 : 0)
        .value();
    return ResultInfo.success(data);
};

/**
 * Get data list from a database
 * @param db Database
 * @param date Date field to sort by
 * @returns Array of IResultDataInfoArray<TodoModel>
 */
export const getDataList = (db: DB<TodoModel>, date: string = "createDate"): Array<IResultDataInfoArray<TodoModel>> => {
    let data = new Map<string, TodoModel[]>();
    let keys = [];
    db.data.forEach(todo => {
        if (data.has(todo[date])) {
            data.get(todo[date]).push(todo);
        } else {
            data.set(todo[date], [todo]);
        }
        if (!keys.includes(todo[date])) {
            keys.push(todo[date]);
        }
    });
    keys = keys.sort(timeReverse);
    let result: Array<IResultDataInfoArray<TodoModel>> = [];
    keys.forEach(item => {
        result.push({
            key: item,
            value: data.get(item)
        });
    });
    return result;
};

/**
 * Get the list of all deleted Todos (sorted by creation date)
 * @returns ResultInfo
 */
export const getDelList = (): ResultInfo => {
    let data = getDataList(remDb);
    return ResultInfo.success(data);
};

/**
 * Get the list of all completed Todos (sorted bycompletion date)
 * @returns ResultInfo
 */
export const getComplateList = (): ResultInfo => {
    let data = getDataList(complateDb, "complateDate");
    return ResultInfo.success(data);
};

/**
 * Get the list of all future Todos
 * @param overdue Whether to include overdue Todos
 * @returns ResultInfo
 */
export const getFutureList = (overdue: boolean = false): ResultInfo => {
    let tempData: TodoModel[];
    if (overdue) {
        tempData = _.chain(db.data).filter(m => m.remind && m.status == StatusModel.OverdueIncomplete).value();
    } else {
        let now = moment().add(1, 'day').set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
        tempData = _.chain(db.data).filter(m => m.remind && m.remind.ms > now.toDate().getTime()).value();
    }

    let data = new Map<string, TodoModel[]>();
    let keys = [];
    tempData.forEach(todo => {
        if (data.has(todo.remind.msDate)) {
            data.get(todo.remind.msDate).push(todo);
        } else {
            data.set(todo.remind.msDate, [todo]);
        }
        if (!keys.includes(todo.remind.msDate)) {
            keys.push(todo.remind.msDate);
        }
    });
    keys = keys.sort(timeReverse);
    let result: Array<IResultDataInfoArray<TodoModel>> = [];
    keys.forEach(item => {
        result.push({
            key: item,
            value: data.get(item)
        });
    });
    return ResultInfo.success(result);
};

/**
 * Get all Todo items for the current date that need to be notified
 * @param time Current time
 * @returns ResultInfo
 */
export const getCurrentDayTodoList = (time: moment.Moment): ResultInfo => {
    let allData = getTodo().msg as Array<TodoModel>;
    let lastDay = moment().endOf('month').date();
    let data = _.chain(allData).filter(m => m.status == StatusModel.Incomplete && m.remind != null)
        .filter(m =>
            m.remind.way == RemindWayModel.Daily
            || (m.remind.way == RemindWayModel.Weekly && m.remind.waySetting.week == time.weekday())
            || (m.remind.way == RemindWayModel.Yearly && m.remind.waySetting.month == time.month() + 1 && m.remind.waySetting.day == time.date())
            || (m.remind.way == RemindWayModel.Once && m.remind.waySetting.year == time.year() && m.remind.waySetting.month == time.month() + 1 && m.remind.waySetting.day == time.date())
            || (m.remind.way == RemindWayModel.Monthly && m.remind.waySetting.day == time.date())
            || (m.remind.way == RemindWayModel.Monthly && m.remind.waySetting.day == 0 && time.date() == lastDay)
        )
        .filter(m => getAllHaveTodoIds().indexOf(m.id) < 0)
        .value();
    return ResultInfo.success(data);
};

/**
 * Get all unfinished Todo items before the current date
 * @param time Current time
 * @returns ResultInfo
 */
export const getOverdueTodoList = (time: moment.Moment): ResultInfo => {
    let allData = getTodo().msg as Array<TodoModel>;
    let data = _.chain(allData).filter(m => m.status == StatusModel.Incomplete && m.remind != null && m.remind.ms < time.toDate().getTime() && getAllHaveTodoIds().indexOf(m.id) < 0)
        .value();
    return ResultInfo.success(data);
};
