import { bridgeKey } from "@/common/bridge";
import { RemindWayModel, TodoModel } from "@/common/interface";
import { getNowMomentDate } from "@/common/utils/time";
import { BrowserWindow } from "electron";
import moment from "moment";
import { createTipWindow } from "../utils/window";
import { addTipTodo, clearTipTodo } from "./tip";
import { getCurrentDayTodoList, getOverdueTodoList } from "./todo";
import { broadCast } from "./windows";

let tipWin: BrowserWindow;
// Timer
let timer;
let refreshDate: string[] = [];

/**
 * Calculate if it's time to show reminders
 * @param time 
 * @param list 
 */
const calcTimeByData = (time: moment.Moment, list: Array<TodoModel>): Array<TodoModel> => {
    if (list.length <= 0) return [];
    let data: Array<TodoModel> = [];
    list.forEach(item => {
        let itemTime = moment(item.remind.ms).set('year', time.year()).set('month', time.month()).set('date', time.date());
        let msTime = itemTime.diff(time, 'milliseconds');
        if (msTime <= 0) {
            // Time has already passed, show reminder
            data.push({
                ...item,
                _extend: {
                    ms: msTime
                }
            });
        }
    });
    return data;
};

/**
 * Check if there are reminders to show
 */
const checkToTip = () => {
    // Get current time
    let time = moment();
    // Get all overdue tasks
    let list = getOverdueTodoList(time).msg as Array<TodoModel>;
    list = calcTimeByData(time, list);
    if (list && list.length > 0) {
        for (var i in list) {
            let todo = list[i];
            // Trigger reminder
            tipWin.webContents.send(bridgeKey.needTip, todo);
            addTipTodo(todo);
        }
    }
};

/**
 * Check if it's a new day
 */
const checkIsTomorrow = () => {
    let time = getNowMomentDate().format('MM-DD-YYYY');
    if (refreshDate.includes(time)) return;
    refreshDate.push(time);
    broadCast(bridgeKey.refresh);
};

// Start the timer to check if reminders should be shown at the current time
const start = () => {
    // Check reminders
    checkToTip();
    // Check if it's a new day
    checkIsTomorrow();

    timer = setTimeout(() => {
        start();
    }, 1000);
};

export default (win: BrowserWindow) => {
    tipWin = win;
    // Clear all tips
    clearTipTodo();
    // Start if there is no active timer
    if (!timer)
        start();
};
