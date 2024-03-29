<template>
    <transition name="tip-anim" @after-enter="enterEnd" @after-leave="leaveEnd">
        <div v-if="show" class="tip-item">
            <div class="tip-flash"></div>
            <div class="content">
                <div class="title">{{ todo?.content }}</div>
                <div
                    class="overdue"
                    v-if="todo?._extend?.ms && Math.abs(todo?._extend?.ms) > 60000"
                >Overdue: {{ formatTime(Math.abs(todo?._extend.ms)) }}</div>
                <div class="btn">
                    <a @click="close">Close</a>
                    <!-- <a @click="delay">Delay</a> -->
                </div>
            </div>
            <NCheckbox class="complate" size="large" :on-update:checked="changeCheck" />
        </div>
    </transition>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, toRaw, watch } from 'vue';
import { NCheckbox } from 'naive-ui'
import { complateTodo, editTodo, getTipContent } from '@/app/utils/send';
import { StatusModel, TodoModel } from '@/common/interface';
import { playComplateAudio } from '@/app/utils/audio';
import { formatTime } from '@common/utils/time'

let show = ref(false)
interface IProps {
    todo: TodoModel;
}
const props = withDefaults(defineProps<IProps>(), {
    todo: null
})
onMounted(() => {
    show.value = true;
})
watch(() => props.todo._extend.remove, (newV, oldV) => {
    show.value = !newV;
})

const emits = defineEmits<{
    (e: 'close', id: number): void;
    (e: 'enter'): void;
    (e: 'check-clear', id: number): void
}>()

// Animation enter
const enterEnd = () => {
    emits('enter')
}
// Animation leave
const leaveEnd = () => {
    emits('check-clear', props.todo.id)
}

// Close window
const close = () => {
    let todo = toRaw(props.todo)
    todo._extend = null;
    todo.status = StatusModel.OverdueIncomplete;
    editTodo(todo)
    emits('close', props.todo.id)
}
// TODO Delay click
const delay = () => {

}
// Complete checkbox change
const changeCheck = (v) => {
    if (v) {
        complateTodo(props.todo.id)
        emits('close', props.todo.id)
        playComplateAudio();
    }
}
</script>

<style lang="less" scoped>
.tip-anim-enter-active,
.tip-anim-leave-active {
    transition: all 0.3s ease-out;
}

.tip-anim-enter-from,
.tip-anim-leave-to {
    transform: translateX(500px);
}

@keyframes flash {
    0% {
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
    100% {
        opacity: 0;
    }
}
.tip-flash {
    animation: flash 1s ease-in infinite;
    position: absolute;
    top: 0;
    left: 0;
    width: calc(100% - 4px);
    height: calc(100% - 4px);
    border-radius: 10px;
    border: 3px solid red;
}

.tip-item {
    width: 90%;
    height: 85px;
    background: white;
    color: rgb(51, 54, 57);
    border-radius: 10px;
    display: flex;
    position: relative;
    margin-bottom: 20px;
    flex-shrink: 0;
    user-select: none;

    .content {
        display: flex;
        align-items: center;
        justify-content: space-around;
        flex-direction: column;
        height: 100%;
        width: 90%;
        position: relative;
        .overdue,
        .title {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            width: 80%;

            &::before {
                content: "";
            }
        }
        .title {
            margin-top: 5px;
        }
        .overdue {
            color: red;
        }

        .btn {
            width: 80%;
            display: flex;
            justify-content: space-around;
            align-items: center;

            a {
                color: rgb(153, 153, 153);
                cursor: pointer;

                &:hover {
                    color: #4092ba;
                }
            }
        }
    }

    .complate {
        --n-border-radius: 16px !important;
    }
}
</style>
