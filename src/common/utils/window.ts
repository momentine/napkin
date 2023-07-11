import { BrowserWindow } from "electron";

/**
 * Solve window shake issue
 * @param win 
 */
export const solveWindowShake = (win: BrowserWindow) => {
    win.on('will-move', () => {
        BrowserWindow.getAllWindows().forEach(item => {
            if (item.webContents.getURL().indexOf('/tip') > -1)
                item.setIgnoreMouseEvents(true)
        })
    })
    win.on('moved', () => {
        BrowserWindow.getAllWindows().forEach(item => {
            if (item.webContents.getURL().indexOf('/tip') > -1)
                item.setIgnoreMouseEvents(true, { forward: true })
        })
    })
}
