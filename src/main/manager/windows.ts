import { BrowserWindow } from "electron";
import { SnowflakeIdv1 } from 'simple-flakeid';

const snow = new SnowflakeIdv1({ workerId: 1 });

// Collection of all windows created through the interface
let allWindows: Map<number, BrowserWindow> = new Map();

/**
 * Add a window to the collection
 * @param win BrowserWindow
 * @returns Window ID
 */
export const addWindow = (win: BrowserWindow): number => {
    let id = win.id;
    // Listen for the close event
    win.addListener('close', () => {
        if (allWindows.has(id)) {
            win.removeAllListeners();
            allWindows.delete(id);
        }
    });
    allWindows.set(id, win);
    return id;
};

/**
 * Broadcast a message to all windows
 * @param key Message key
 * @param value Message value
 */
export const broadCast = (key: string, ...value: any[]) => {
    BrowserWindow.getAllWindows().forEach(item => {
        item.webContents.send(key, value);
    });
};
