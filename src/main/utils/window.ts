import { CreateWindowOption } from '@/common/interface';
import { UserSetting } from '@/common/setting';
import { solveWindowShake } from '@/common/utils/window';
import { BrowserWindow, BrowserWindowConstructorOptions, screen } from 'electron';
import { baseUrl } from '../config';
import { addWindow } from '../manager/windows';
import injectRemote from './injectRemote';
import fs from 'fs-extra';
import path from 'path';

// Create a window
export const createWindow = (option: CreateWindowOption): BrowserWindow => {
    const setting = new UserSetting();
    option = Object.assign(
        {
            width: 320,
            height: 700,
            maxWidth: 320,
            minHeight: 500,
            minimizable: false,
            maximizable: false,
            transparent: true,
            frame: false,
            useContentSize: true,
            alwaysOnTop: setting.base.alwaystop,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true,
                webSecurity: false,
            },
        },
        option
    );
    const window = new BrowserWindow({ ...option });
    window.loadURL(option.url);
    if (option.dev) {
        window.webContents.openDevTools({ mode: "detach" });
    }
    if (option.show) {
        window.show();
    }
    injectRemote(window);
    addWindow(window);
    solveWindowShake(window);
    return window;
};

/**
 * Create a tip window
 * @param option Basic information
 * @param widthSize Width size as a percentage of the screen
 * @returns 
 */
export const createTipWindow = (option: CreateWindowOption, widthSize: number = 0.25): BrowserWindow => {
    const screenSize = screen.getPrimaryDisplay().workAreaSize;
    const seeWidth = screenSize.width * widthSize;
    option = Object.assign(option, {
        url: baseUrl + '#/tip',
        width: seeWidth * 2,
        x: screenSize.width - Math.round(seeWidth),
        y: 0,
        minHeight: screenSize.height,
        maxHeight: 0,
        minWidth: 0,
        maxWidth: 0,
        height: screenSize.height,
        resizable: false,
    } as CreateWindowOption);
    const window = createWindow(option);
    window.setIgnoreMouseEvents(true, { forward: true });
    return window;
};

/**
 * Check if it is the first run
 * @returns boolean
 */
export const checkIsFirstRun = (): boolean => {
    const runPath = path.resolve(process.cwd(), 'resources/run');
    if (!fs.pathExistsSync(runPath)) {
        fs.mkdirSync(runPath, { recursive: true });
        return true;
    }
    return false;
};
