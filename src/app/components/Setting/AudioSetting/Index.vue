<template>
    <div class="audio-item" v-for="(item, index) in audioSettingTips" :key="index">
        <div class="top">
            <span>{{ item.label }}</span>
            <NSwitch class="switch" v-if="!item.other" v-model:value="item.value" />
        </div>
        <div class="bottom" v-if="item.other && item.value">
            <NRadioGroup v-model:value="item.other.value">
                <NSpace>
                    <NRadio value="1">System Sound</NRadio>
                    <NRadio value="2">Custom</NRadio>
                </NSpace>
            </NRadioGroup>
            <div class="select-btn" v-if="item.other.value == '2'">
                <div>{{ item.other.custom }}</div>
                <NButton style="margin-left: 15%;" type="success" @click="selectAudio(item)">Select</NButton>
            </div>
        </div>
    </div>
    <div style="text-align: center;">
        <NButton type="success" @click="saveAudio">Save</NButton>
    </div>
</template>

<script setup lang="ts">
import { NTabs, NTabPane, NRadio, NRadioGroup, NSwitch, NSpace, NButton, useMessage } from 'naive-ui'
import CustomTopNav from '@/app/components/CustomTopNav';
import remote from '@/app/utils/render';
import { Ref, ref, toRaw } from 'vue';
import { AudioSetting } from '@/common/setting';
import { changeAudioSetting } from '@/app/utils/send';

const message = useMessage();

interface IProps {
    setting?: AudioSetting;
}
const props = defineProps<IProps>()

interface AudioSettingModel {
    label: string;
    key: string;
    value: any;
    other?: any;
}
// Sound settings
let audioSettingTips: Ref<Array<AudioSettingModel>> = ref([{
    label: "Add Sound",
    key: "haveAdd",
    value: props.setting.haveAdd
}, {
    label: "Remove Sound",
    key: "haveRemove",
    value: props.setting.haveRemove
}, {
    label: "Complete Sound",
    key: "haveComplate",
    value: props.setting.haveComplate
}, {
    label: "Clear Sound",
    key: "haveClear",
    value: props.setting.haveClear
}, {
    label: "Tip Sound",
    key: "haveTip",
    value: props.setting.haveTip,
    other: {
        value: props.setting.custom ? "2" : '1',
        custom: props.setting.custom
    }
},])
// Reminder audio
const selectAudio = (item: AudioSettingModel) => {
    const result = remote.dialog.showOpenDialogSync({
        title: "Select Audio File",
        filters: [{
            name: "Audio Files",
            extensions: ['wav', 'mp3',]
        }],
        buttonLabel: "Confirm"
    })
    item.other.custom = result[0];
}
// Save sound settings
const saveAudio = () => {
    let audioSetting: AudioSetting = toRaw(props.setting)
    audioSettingTips.value.forEach(item => {
        audioSetting[item.key] = item.value;
        if (item.other && item.value) {
            if (item.other.value == "2") {
                audioSetting['custom'] = item.other.custom;
            }
            else {
                audioSetting['custom'] = ''
            }
        }
    })
    changeAudioSetting(audioSetting)
    message.success("Saved successfully")
}

</script>

<style lang="less" scoped>
.audio-item {
    padding: 10px;
    margin-left: 25%;

    .top {
        display: flex;
        align-items: center;
    }
    .bottom {
        margin-top: 5px;
        margin-left: 20px;

        .select-btn {
            margin-top: 5px;
        }
    }

    .switch {
        margin-left: 20%;
    }
}
</style>
