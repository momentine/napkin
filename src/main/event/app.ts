import { bridgeKey } from "@/common/bridge";
import { app, BrowserWindow, ipcMain } from "electron";

// exit the program
ipcMain.addListener(bridgeKey.quit, () => {
    BrowserWindow.getAllWindows().forEach(item => {
        item.close();
    })
    app.quit();
})
