<template>
    <div class="base-setting">
        <div class="item-checkbox" v-for="(item, index) in baseSettings" :key="index">
            <NCheckbox v-model:checked="item.value">{{ item.label }}</NCheckbox>
        </div>
    </div>
    <div style="text-align: center;">
        <NButton type="success" @click="saveBase">Save</NButton>
    </div>
</template>

<script setup lang="ts">
import { changeBaseSetting } from '@/app/utils/send';
import { BaseSetting } from '@/common/setting';
import { NCheckbox, useMessage, NButton } from 'naive-ui'
import { Ref, ref, toRaw } from 'vue';
const message = useMessage()

interface IProps {
    setting: BaseSetting
}
const props = defineProps<IProps>()

interface BaseSettingInfo {
    label: string,
    key: string;
    value: boolean;
}

const baseSettings: Ref<BaseSettingInfo[]> = ref([{
    label: "Napkin as foreground",
    key: "alwaystop",
    value: props.setting.alwaystop,
}/*, {
    label: "Start Automatically on Boot",
    key: "autostart",
    value: props.setting.autostart,
}*/])

const saveBase = () => {
    let setting: BaseSetting = toRaw(props.setting)
    baseSettings.value.forEach(item => {
        setting[item.key] = item.value
    })
    console.log(setting)
    changeBaseSetting(setting)
    message.warning("Modified successfully. It will take effect on the next startup.")
}

</script>

<style lang="less" scoped>
.base-setting {
    padding: 10px;
    margin-left: 25%;

    .item-checkbox {
        margin-top: 5px;
    }
}
</style>
