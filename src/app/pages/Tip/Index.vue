<template>
    <div class="tip">
        <div style="height: 3%; flex-shrink: 0;"></div>
        <tip-item
            v-for="(item, index) in list"
            :key="index"
            @mouseenter="mouseEnter"
            @mouseleave="mouseLeave"
            :todo="item"
            @close="closeTip"
            @enter="itemEnter"
            @check-clear="checkClear"
        />
        <div style="height: 6%; flex-shrink: 0;"></div>
    </div>
</template>

<script setup lang="ts">
import TipItem from '@/app/components/TipItem';
import { playTipAudio } from '@/app/utils/audio';
import { needTip } from '@/app/utils/event';
import remote from '@/app/utils/render';
import { TodoModel } from '@/common/interface';
import { IpcRendererEvent } from 'electron';
import { Ref, ref } from 'vue';

let list: Ref<TodoModel[]> = ref([]);

// Listen for tip events
needTip((e: IpcRendererEvent, todo: TodoModel) => {
    let index = list.value.findIndex(m => m.id == todo.id);
    if (index >= 0) {
        list.value[index] = todo;
    } else {
        list.value.push(todo);
    }
});

// Mouse enter/leave
const mouseEnter = () => {
    remote.getCurrentWindow().setIgnoreMouseEvents(false);
};

const mouseLeave = () => {
    remote.getCurrentWindow().setIgnoreMouseEvents(true, { forward: true });
};

// Close button
const closeTip = (id: number) => {
    let todo = list.value.find(m => m.id == id);
    if (!todo._extend) todo._extend = {};
    todo._extend.remove = true;
    const have = list.value.filter(m => m._extend.remove != true);
    if (have.length <= 0) {
        // If all items are removed
        audio.pause();
        audio.src = "";
        audio = null;
    }
};

// Animation leave complete
const checkClear = () => {
    if (!audio) {
        list.value = [];
        remote.getCurrentWindow().setIgnoreMouseEvents(true, { forward: true });
    }
};

// Play audio after entering animation completes
let audio: HTMLAudioElement;
let playComplete: boolean = false;
const itemEnter = () => {
    if (!audio) {
        audio = playTipAudio();
        audio.addEventListener('ended', () => {
            playComplete = true;
        });
    } else {
        if (playComplete) {
            playComplete = false;
            audio.currentTime = 0;
            audio.play();
        }
    }
};
</script>

<style lang="less" scoped>
.tip {
    overflow-y: auto;
    overflow-x: hidden;
    width: 48%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;

    & > :deep(div:first-child) {
        margin-top: auto !important;
    }

    &::-webkit-scrollbar {
        width: 5px;
        background: transparent;
    }

    &:hover {
        &::-webkit-scrollbar {
            display: block;
            background: transparent;
            width: 5px;
        }

        &::-webkit-scrollbar-thumb {
            background: #18a058;
            border-radius: 10px;
        }
    }
}
</style>
