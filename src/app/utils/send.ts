import { bridgeKey } from "@/common/bridge";
import { CreateWindowOption, ResultInfo, TodoModel } from "@/common/interface";
import { AudioSetting, BaseSetting, UserSetting } from "@/common/setting";
import remote, { ipcRenderer } from "./render";

// Quit the application
export const quit = () => {
    return ipcRenderer.sendSync(bridgeKey.quit)
}

// Open the settings panel
export const openSetting = () => {
    const s = remote.screen.getPrimaryDisplay().workAreaSize;
    const seeWidth = s.width * 0.5;
    const seeHeight = s.height * 0.5;
    let option: CreateWindowOption = {
        url: 'setting',
        dev: false,
        show: true,
        skipTaskbar: true,

        // width: seeWidth * 2,
        // minHeight: seeHeight * 2,
        x: seeWidth,
        y: seeHeight,
        maxHeight: 0,
        minWidth: 0,
        maxWidth: 0,
        height: seeHeight,
        resizable: false,
    };
    return ipcRenderer.sendSync(bridgeKey.createWindow, option)
}

// Get user settings
export const getUserSetting = (): UserSetting => {
    return ipcRenderer.sendSync(bridgeKey.getUserSetting) as UserSetting;
}

// Modify audio settings
export const changeAudioSetting = (audio: AudioSetting) => {
    return ipcRenderer.sendSync(bridgeKey.changeAudioSetting, audio)
}

// Modify base settings
export const changeBaseSetting = (base: BaseSetting) => {
    return ipcRenderer.sendSync(bridgeKey.changeBaseSetting, base);
}

// Add a todo
export const addTodo = (todo: TodoModel): ResultInfo => {
    const data = ipcRenderer.sendSync(bridgeKey.addTodo, todo);
    return data;
}

// Remove a todo
export const remTodo = (id: number): ResultInfo => {
    const data = ipcRenderer.sendSync(bridgeKey.delTodo, id);
    return data;
}

// Permanently delete a todo
export const permanentDelTodo = (id: number): ResultInfo => {
    return ipcRenderer.sendSync(bridgeKey.permanentDelTodo, id)
}

// Clear all todos
export const clearTodo = (): ResultInfo => {
    return ipcRenderer.sendSync(bridgeKey.clearTodo);
}

// Edit a todo
export const editTodo = (todo: TodoModel): ResultInfo => {
    const data = ipcRenderer.sendSync(bridgeKey.editTodo, todo);
    return data;
}

// Restore a todo
export const restoreTodo = (id: number): ResultInfo => {
    const data = ipcRenderer.sendSync(bridgeKey.restoreTodo, id);
    return data;
}

// Complete a todo
export const complateTodo = (id: number): ResultInfo => {
    return ipcRenderer.sendSync(bridgeKey.complateTodo, id);
}

// Cancel completion of a todo
export const cancelComplateTodo = (id: number): ResultInfo => {
    return ipcRenderer.sendSync(bridgeKey.cancelComplateTodo, id);
}

// Get todos
export const getTodo = (): ResultInfo => {
    const data = ipcRenderer.sendSync(bridgeKey.getTodo);
    return data;
}

// Get completed todo list
export const getComplateList = (): ResultInfo => {
    return ipcRenderer.sendSync(bridgeKey.complateList)
}

// Get deleted todo list
export const getDelList = (): ResultInfo => {
    return ipcRenderer.sendSync(bridgeKey.delList)
}

// Get future todo list
export const getFutureList = (overdue: boolean = false): ResultInfo => {
    return ipcRenderer.sendSync(bridgeKey.futureList, overdue)
}

// Get image
export const getImg = (path: string): Electron.NativeImage => {
    const img = ipcRenderer.sendSync(bridgeKey.getImg, path);
    return img;
}

// Get file path
export const getFilePath = (path: string): ResultInfo => {
    const data = ipcRenderer.sendSync(bridgeKey.getFilePath, path);
    return data;
}

// Get tip content
export const getTipContent = (): ResultInfo => {
    const data = ipcRenderer.sendSync(bridgeKey.getTipContent);
    return data;
}
