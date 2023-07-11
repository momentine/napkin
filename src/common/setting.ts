import { app } from 'electron';
import Store from 'electron-store';
import path from 'path';

const store = new Store({
    name: "user-setting"
});

//#region Setting Information
// Audio Setting
export interface AudioSetting {
    // Sound for adding a new item
    add: string;
    haveAdd: boolean;
    // Sound for removing an item
    remove: string;
    haveRemove: boolean;
    // Sound for completing an item
    complate: string;
    haveComplate: boolean;
    // Sound for clearing all items
    clear: string;
    haveClear: boolean;
    // Sound for reminders
    tip: string;
    haveTip: boolean;
    custom?: string;
}

// Reminder Setting
export interface TipSetting {
    // Default delay in seconds
    delay: number;
    // Maximum number of reminders for each item
}

// Base Setting
export interface BaseSetting {
    alwaystop: boolean;
    autostart: boolean;
}

// User Setting
export class UserSetting {
    _key: string;
    // Base Setting
    base: BaseSetting;
    // Audio Setting
    audio: AudioSetting;
    // Reminder Setting
    tip: TipSetting;

    // Initialize
    constructor(key: string = "user-setting") {
        this._key = key;
        this.init();
    }

    // Initial setup
    private init() {
        this.audio = {
            add: path.resolve(app.getAppPath(), 'static/audio/notice.wav'),
            haveAdd: true,
            remove: path.resolve(app.getAppPath(), "static/audio/delete.mp3"),
            haveRemove: true,
            complate: path.resolve(app.getAppPath(), "static/audio/complete.mp3"),
            haveComplate: true,
            clear: path.resolve(app.getAppPath(), 'static/audio/empty.wav'),
            haveClear: true,
            tip: path.resolve(app.getAppPath(), 'static/audio/canon.mp3'),
            haveTip: true
        };

        this.base = {
            alwaystop: true,
            autostart: true
        };

        let data = store.get(this._key) as UserSetting;
        if (data) {
            this.audio = Object.assign(this.audio, data.audio);
            this.base = Object.assign(this.base, data.base);
        } else {
            // First-time initialization
            app.setLoginItemSettings({
                openAtLogin: true,
            });
        }
        this.write();
    }

    // Write settings to storage
    write() {
        store.set(this._key, this);
    }
}
//#endregion
