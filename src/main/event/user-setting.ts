import { bridgeKey } from "@/common/bridge";
import { ResultInfo } from "@/common/interface";
import { AudioSetting, BaseSetting, UserSetting } from "@/common/setting";
import { app, ipcMain, IpcMainEvent } from "electron";
import { broadCast } from "../manager/windows";

const userSettingKey = "user-setting";

// Get user settings
ipcMain.addListener(bridgeKey.getUserSetting, (event: IpcMainEvent) => {
    event.returnValue = new UserSetting(userSettingKey);
});

// Change audio settings
ipcMain.addListener(bridgeKey.changeAudioSetting, (event: IpcMainEvent, audio: AudioSetting) => {
    let setting = new UserSetting(userSettingKey);
    setting.audio = audio;
    setting.write();
    event.returnValue = ResultInfo.success();
    broadCast(bridgeKey.refreshSetting);
});

// Change basic settings
ipcMain.addListener(bridgeKey.changeBaseSetting, (event: IpcMainEvent, base: BaseSetting) => {
    let setting = new UserSetting(userSettingKey);
    setting.base = base;
    setting.write();
    event.returnValue = ResultInfo.success();
    broadCast(bridgeKey.refreshSetting);
    if (base.autostart) {
        app.setLoginItemSettings({
            openAtLogin: true
        });
    } else {
        app.setLoginItemSettings({
            openAtLogin: false
        });
    }
});

export default null;
