import { bridgeKey } from "@/common/bridge";
import { ResultInfo } from "@/common/interface";
import { BrowserWindow, ipcMain, IpcMainEvent } from "electron";
import { getTipTodo } from "../manager/tip";

// Get the content that needs to be prompted
ipcMain.addListener(bridgeKey.getTipContent, (e: IpcMainEvent) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    e.returnValue = ResultInfo.success(getTipTodo(win.id))
})