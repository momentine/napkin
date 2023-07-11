import { bridgeKey } from "@/common/bridge";
import { ResultInfo, StatusModel, TodoModel } from "@/common/interface";
import { BrowserWindow, ipcMain, IpcMainEvent } from "electron";
import { removeTipTodo } from "../manager/tip";
import { addTodo, cancelComplateTodo, clearTodo, complateTodo, delTodo, editTodo, getDelList, getTodo, permanentDelTodo, getComplateList, restoreTodo, getFutureList } from "../manager/todo";
import { broadCast } from "../manager/windows";

// Add todo
ipcMain.addListener(bridgeKey.addTodo, (event: IpcMainEvent, todo: TodoModel) => {
    event.returnValue = addTodo(todo);
    broadCast(bridgeKey.refresh);
});

// Delete todo
ipcMain.addListener(bridgeKey.delTodo, (event: IpcMainEvent, id: number) => {
    event.returnValue = delTodo(id);
    broadCast(bridgeKey.refresh);
});

// Permanently delete todo
ipcMain.addListener(bridgeKey.permanentDelTodo, (event: IpcMainEvent, id: number) => {
    event.returnValue = permanentDelTodo(id);
    broadCast(bridgeKey.refresh);
});

// Clear todo
ipcMain.addListener(bridgeKey.clearTodo, (event: IpcMainEvent) => {
    event.returnValue = clearTodo();
    broadCast(bridgeKey.refresh);
});

// Edit todo
ipcMain.addListener(bridgeKey.editTodo, (event: IpcMainEvent, todo: TodoModel) => {
    event.returnValue = editTodo(todo);
    // Remove unfinished reminders from Tip
    removeTipTodo(todo.id);
    broadCast(bridgeKey.refresh);
});

// Restore todo
ipcMain.addListener(bridgeKey.restoreTodo, (event: IpcMainEvent, id: number) => {
    event.returnValue = restoreTodo(id);
    broadCast(bridgeKey.refresh);
});

// Complete todo
ipcMain.addListener(bridgeKey.complateTodo, (event: IpcMainEvent, id: number) => {
    event.returnValue = complateTodo(id);
    // Remove unfinished reminders from Tip
    removeTipTodo(id);
    broadCast(bridgeKey.refresh);
});

// Cancel completion of todo
ipcMain.addListener(bridgeKey.cancelComplateTodo, (event: IpcMainEvent, id: number) => {
    event.returnValue = cancelComplateTodo(id);
    broadCast(bridgeKey.refresh);
});

// Get todo list
ipcMain.addListener(bridgeKey.getTodo, (event: IpcMainEvent) => {
    event.returnValue = getTodo();
});

// Get completed list (sorted by creation time)
ipcMain.addListener(bridgeKey.complateList, (event: IpcMainEvent) => {
    event.returnValue = getComplateList();
});

// Get deleted list (sorted by creation time)
ipcMain.addListener(bridgeKey.delList, (event: IpcMainEvent) => {
    event.returnValue = getDelList();
});

// Get future list (sorted by reminder time)
ipcMain.addListener(bridgeKey.futureList, (event: IpcMainEvent, overdue: boolean) => {
    event.returnValue = getFutureList(overdue);
});

export default null;
