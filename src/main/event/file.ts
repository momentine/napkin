import { bridgeKey } from "@/common/bridge";
import { ResultInfo } from "@/common/interface";
import { app, ipcMain, IpcMainEvent, nativeImage } from "electron";
import path from 'path'
import { getImagePath } from "../manager/file";

// get image file
ipcMain.addListener(bridgeKey.getImg, (e: IpcMainEvent, p: string) => {
    e.returnValue = nativeImage.createFromPath(getImagePath(p))
})
// get file path
ipcMain.addListener(bridgeKey.getFilePath, (e: IpcMainEvent, filePath: string) => {
    e.returnValue = ResultInfo.success(path.resolve(app.getAppPath(), filePath));
})

export default null;