<template>
  <div
    class="todo-item"
    :class="{
      'not-edit': !isEdit,
      'over-due': todo.status == StatusModel.OverdueIncomplete,
    }"
    @click.right="showMenu"
  >
    <div class="show-item" v-if="!isEdit">
      <NCheckbox
        v-if="check"
        :checked="todo.status == StatusModel.Completed || todo.lastComplateDate == moment().format('MM-DD-YYYY')"
        :on-update:checked="complateClick"
      />
      <NPopover to="#popover" trigger="hover" raw :show-arrow="false" width="trigger">
        <template #trigger>
          <div
            @dblclick.left="dbClickItem"
            class="text"
            :class="{
              'check-text': todo.status == StatusModel.Completed || todo.lastComplateDate == moment().format('MM-DD-YYYY'),
            }"
          >{{ todo?.content }}</div>
        </template>
        <!-- <div class="todo-popover-info" v-if="todo.remind">
          <div>{{ RemindWayModel[todo.remind.way] }}</div>
        </div>-->
      </NPopover>
      <div class="icons">
        <span v-if="todo.remind" class="icon-time" @click="showCycleSettingClick" />
      </div>
    </div>
    <AddTodoInfo v-else :todo="todo" @close="closeClick" @ok="okClick" />
    <CycleSetting :remind="remind" v-model:show="showCycleSetting" @ok="remindOkClick" />
  </div>
</template>

<script setup lang="ts">
import { NPopover, NCheckbox, useMessage } from 'naive-ui'
import { playComplateAudio, playRemoveAudio } from "@/app/utils/audio";
import { getTodoItemMenu, MenuCallbackType } from "@/app/utils/menu";
import remote from "@/app/utils/render";
import { cancelComplateTodo, complateTodo, editTodo, remTodo } from "@/app/utils/send";
import { RemindModel, StatusModel, TodoModel, RemindWayModel } from "@/common/interface";
import { getCurrentInstance, inject, Ref, ref, toRaw, watch } from "vue";
import AddTodoInfo from "../AddTodoInfo";
import CycleSetting from "../CycleSetting/Index.vue";
import moment from 'moment';

const message = useMessage();

const remind: Ref<RemindModel> = ref(null)

interface Props {
  todo: TodoModel;
  check?: boolean;
  menu?: (todo: TodoModel) => void;
}
const props = withDefaults(defineProps<Props>(), {
  todo: null,
  check: true,
  menu: null,
});

const emits = defineEmits<{
  (e: "refresh"): void;
}>();

// Cycle Setting (Reminder Setting)
const showCycleSetting = ref(false);
const remindOkClick = (v: RemindModel) => {
  let model = toRaw(props.todo)
  model.status = StatusModel.Incomplete;
  model.remind = v;
  okClick(model)
}

// Edit state
const isEdit = ref(false);
// Double-click to enter edit mode
const dbClickItem = (e: MouseEvent) => {
  if (!props.check) return;
  e.stopPropagation();
  isEdit.value = true;
};
// Complete
const complateClick = (check) => {
  if (check) {
    // Mark as completed
    complateTodo(props.todo.id);
    playComplateAudio();
  } else {
    // Mark as incomplete
    cancelComplateTodo(props.todo.id);
  }
};
// Close if not modified
const closeClick = () => {
  isEdit.value = false;
};
// Save if modified
const okClick = (model: TodoModel) => {
  model.id = props.todo.id;
  const result = editTodo(model);
  closeClick();
};
// Show reminder settings
const showCycleSettingClick = () => {
  remind.value = props.todo.remind;
  showCycleSetting.value = true;
}
// Show menu
const menuItemClick = (id: MenuCallbackType, todo: TodoModel) => {
  switch (id) {
    case MenuCallbackType.Delete:
      let result = remTodo(todo.id);
      if (result.code == 1) {
        playRemoveAudio();
      } else {
        message.error("Failed to delete");
      }
      break;
    case MenuCallbackType.Edit:
      isEdit.value = true;
      break;
    case MenuCallbackType.Finish:
    case MenuCallbackType.UndoComplete:
      complateClick(id == MenuCallbackType.Finish ? true : false);
      break;
    case MenuCallbackType.Copy:
      remote.clipboard.writeText(todo.content);
      message.success("Copied successfully");
      break;
    case MenuCallbackType.AddReminder:
      showCycleSettingClick()
      break;
    case MenuCallbackType.DeleteReminder:
      remindOkClick(null)
      break;
  }
};
const showMenu = () => {
  if (props.menu) {
    props.menu(props.todo)
    return;
  }
  if (isEdit.value) return;
  getTodoItemMenu(menuItemClick, props.todo);
};
</script>

<style lang="less" scoped>
.todo-popover-info {
  width: 100%;
  height: 100%;
  background: red;
  color: white;
  border: 10px;
}
.active {
  background: rgba(70, 70, 70, 0.8);
}

.not-edit {
  &:hover {
    background: rgba(70, 70, 70, 0.5);
  }
}

.todo-item {
  padding: 5px;

  .show-item {
    display: flex;
    align-items: center;
  }

  .icons {
    display: flex;
    justify-content: center;
    align-items: center;

    [class*="icon-"] {
      font-size: 12px;
      margin-left: 5px;
    }
  }

  :deep(.n-checkbox) {
    --n-color: transparent !important;
    --n-border: 1px solid @base-color !important;
    --n-border-focus: 1px solid @base-color !important;
    --n-box-shadow-focus: 1px solid @base-color !important;
    --n-border-checked: 1px solid @base-color-3 !important;
    --n-color-checked: transparent !important;
    --n-check-mark-color: @base-color-3 !important;
    --n-text-color: @base-color !important;
  }

  .check-text {
    text-decoration: line-through;
    text-decoration-color: red;
    color: @base-color-5;
  }
  .text {
    width: 80%;
    margin-left: 10px;
    margin-right: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
  }
}

.over-due {
  :deep(.n-checkbox) {
    --n-border: 1px solid red !important;
  }
  .show-item {
color: red;
  }
}
</style>
