<template>
    <teleport to="body">
        <transition name="todo-list">
            <div class="todo-list-modal" v-if="show">
                <span class="icon-close" @click="closeClick" />
                <div class="content">
                    <div class="todo-list-item" v-for="(item, index) in data" :key="index">
                        <div class="title">{{ item.key }}</div>
                        <div class="todo-list">
                            <todo-item
                                v-for="(todo, index) in item.value"
                                :key="index"
                                :menu="showMenu"
                                :check="false"
                                :todo="todo"
                            />
                        </div>
                    </div>
                </div>

                <div class="btns">
                    <n-button type="error" v-if="type == 3" @click="clear">Clear All</n-button>
                </div>
            </div>
        </transition>
    </teleport>
</template>

<script setup lang="ts">
import { NButton, useMessage } from 'naive-ui'
import { cancelComplateTodo, clearTodo, getComplateList, getDelList, getFutureList, permanentDelTodo, remTodo, restoreTodo } from '@/app/utils/send';
import { IResultDataInfoArray, TodoModel } from '@/common/interface';
import { onMounted, onUnmounted, Ref, ref, watch } from 'vue';
import TodoItem from '../Content/components/TodoItem';
import { getTodoItemMenuByDel, MenuCallbackType } from '@/app/utils/menu';
import remote from '@/app/utils/render';
import { refresh } from '@/app/utils/event';
import { playClearAudio, playRemoveAudio } from '@/app/utils/audio';
const message = useMessage();

const data: Ref<IResultDataInfoArray<TodoModel>[]> = ref([])

interface IProps {
    show: boolean;
    type: number;
}
const props = withDefaults(defineProps<IProps>(), {
    show: false,
    type: -1
})
const emits = defineEmits<{
    (e: 'update:show', v: boolean): void
    (e: 'update:type', v: number): void
}>();

const changeValue = (type) => {
    switch (type) {
        case 1: // Completed
            data.value = getComplateList().msg;
            break;
        case 2: // Not Due Yet
            data.value = getFutureList().msg
            break;
        case 3: // Deleted
            data.value = getDelList().msg;
            break;
        case 4: // Overdue
            data.value = getFutureList(true).msg
            break;
    }
}
watch(() => props.type, (newV, oldV) => {
    changeValue(newV)
})
onMounted(() => {
    changeValue(props.type)
    refresh(() => {
        changeValue(props.type)
    })
})

// Close button click
const closeClick = () => {
    emits('update:show', false)
    emits('update:type', -1)
    data.value = []
}
// Right-click menu click event
const menuClick = (id: MenuCallbackType, todo: TodoModel) => {
    switch (id) {
        case MenuCallbackType.PermanentDelete:
            permanentDelTodo(todo.id);
            playRemoveAudio();
            break;
        case MenuCallbackType.Delete:
            remTodo(todo.id);
            playRemoveAudio();
            break;
        case MenuCallbackType.Copy:
            remote.clipboard.writeText(todo.content)
            message.success("Copied successfully");
            break;
        case MenuCallbackType.Restore:
            restoreTodo(todo.id)
            break;
        case MenuCallbackType.UndoComplete:
            cancelComplateTodo(todo.id);
            break;
    }
}
// Right-click menu
const showMenu = (todo: TodoModel) => {
    getTodoItemMenuByDel(menuClick, todo);
}
// Clear button click
const clear = () => {
    clearTodo()
    playClearAudio();
}
</script>

<style lang="less" scoped>
.todo-list-enter-active,
.todo-list-leave-active {
    transition: all 0.3s ease-out;
}

.todo-list-enter-from {
    transform: translateX(-500px);
}
.todo-list-leave-to {
    transform: translateX(500px);
}

.todo-list-modal {
    position: fixed;
    top: 50px;
    left: 10px;
    right: 10px;
    bottom: 50px;
    background: #474747;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    user-select: none;

    // Close button
    .icon-close {
        position: absolute;
        right: 10px;
        top: 5px;
        font-size: 15px;
    }

    .content {
        overflow: hidden;
        overflow-y: auto;
        max-height: 90%;
        height: 90%;

        &::-webkit-scrollbar {
            width: 5px;
            display: none;
            background: rgba(65, 65, 65, 0.5);
        }

        &:hover {
            &::-webkit-scrollbar {
                display: block;
            }

            &::-webkit-scrollbar-thumb {
                background: rgba(0, 0, 0, 0.4);
                border-radius: 20px;
            }
        }

        .todo-list-item {
            margin: 10px;
            background: rgba(65, 65, 65, 0.5);
            padding: 10px;
            .title {
                font-weight: bold;
                margin-top: 10px;
                padding-left: 8px;
            }

            :deep(.not-edit:hover) {
                background: rgb(124 124 124 / 50%);
                border-radius: 10px;
            }
        }
    }

    .btns {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>
