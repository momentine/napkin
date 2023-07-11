import { app, BrowserWindow, Event, ipcMain, Menu, MenuItem, nativeImage, screen, Tray } from 'electron';
import { baseUrl } from './config';
import '@/common/load';
import { bridgeKey } from '@/common/bridge';
import './event';
import { checkIsFirstRun, createTipWindow, createWindow } from './utils/window';
import start from './manager/task';
import { getImagePath } from './manager/file';
import { StatusModel } from '@/common/interface';
import { addTodo } from './manager/todo';

// Main window
let mainWindow: BrowserWindow;
// System tray
let tray: Tray;

// Create the main window
const initMain = () => {
    mainWindow = createWindow({
        url: baseUrl,
        dev: true,
        show: true,
        skipTaskbar: true,
    });

    //#region Listen for window move events
    mainWindow.addListener('moved', (e: Electron.Event) => {
        const pos = mainWindow.getPosition();
        if (pos[1] <= 0) {
            mainWindow.webContents.send(bridgeKey.moveToZero);
        } else {
            mainWindow.webContents.send(bridgeKey.leaveToZero);
        }
    });
    mainWindow.addListener('will-move', () => {
        mainWindow.webContents.send(bridgeKey.leaveToZero);
    });
    //#endregion
};

// Create the Tip window
const initTip = () => {
    let win = createTipWindow({
        url: '',
        dev: false,
        show: true,
        skipTaskbar: true,
    });
    win.webContents.on('did-finish-load', () => {
        start(win);
    });
};

// Create the system tray
const initTray = () => {
    tray = new Tray(nativeImage.createFromPath(getImagePath('static/image/menu/logo.png')));
    let menu = [
        {
            label: 'Logout',
            click: () => app.quit(),
            icon: getImagePath('static/image/menu/quit.png'),
        },
    ];
    tray.setContextMenu(Menu.buildFromTemplate(menu));

    // Double-click to show the main window
    tray.addListener('double-click', () => {
        mainWindow.show();
    });
};

// Perform initial setup on first run
const firstRunInit = () => {
    addTodo({
        content: 'Click "Add Todo" to add a new todo.',
        status: StatusModel.Incomplete,
    });
    addTodo({
        content: 'Double-click on a todo to edit it.',
        status: StatusModel.Incomplete,
    });
    addTodo({
        content: 'Right-click on a todo to perform actions.',
        status: StatusModel.Incomplete,
    });
    addTodo({
        content: 'Drag the top of the window to move it.',
        status: StatusModel.Incomplete,
    });
    addTodo({
        content: 'Drag the top edge of the window to auto-hide it.',
        status: StatusModel.Incomplete,
    });
};

app.whenReady().then(() => {
    // Check if it is the first run
    if (checkIsFirstRun()) {
        // First run
        firstRunInit();
    }
    // Create the main window
    initMain();
    // Create the Tip window and start the timer
    initTip();
    // Create the system tray
    initTray();
});
