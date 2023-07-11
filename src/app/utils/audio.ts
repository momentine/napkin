import { bridgeKey } from "@/common/bridge"
import { UserSetting } from "@/common/setting";
import { refreshSetting } from "./event";
import { ipcRenderer } from "./render"

// User setting
let userSetting = ipcRenderer.sendSync(bridgeKey.getUserSetting) as UserSetting;
refreshSetting(() => {
    userSetting = ipcRenderer.sendSync(bridgeKey.getUserSetting) as UserSetting;
});

// Play add audio effect
export const playAddAudio = () => {
    if (userSetting.audio.haveAdd) {
        let audio = new Audio(userSetting.audio.add)
        audio.play();
    }
}

// Play remove audio effect
export const playRemoveAudio = () => {
    if (userSetting.audio.haveRemove) {
        let audio = new Audio(userSetting.audio.remove);
        audio.play();
    }
}

// Play complete audio effect
export const playComplateAudio = () => {
    if (userSetting.audio.haveComplate) {
        let audio = new Audio(userSetting.audio.complate);
        audio.play();
    }
}

// Play tip audio effect
export const playTipAudio = (): HTMLAudioElement => {
    let audio = new Audio(userSetting.audio.custom ? userSetting.audio.custom : userSetting.audio.tip);
    audio.play();
    return audio;
}

// Play clear audio effect
export const playClearAudio = () => {
    if (userSetting.audio.haveClear) {
        let audio = new Audio(userSetting.audio.clear);
        audio.play();
    }
}
