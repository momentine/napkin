<template>
  <div class="bottom-nav">
  <div class="left">
  <span class="icon-check" :class="{ active: type === 1 }" @click="showModal(1)" />
  <span class="icon-future" :class="{ active: type === 2 }" @click="showModal(2)" />
  <span class="icon-delete" :class="{ active: type === 3 }" @click="showModal(3)" />
  <span class="icon-overdue" :class="{ active: type === 4 }" @click="showModal(4)" />
  </div>
  <div class="right"></div>
  </div>
  <todo-list-modal v-model:show="show" v-model:type="type" />
  </template>
  
  
  <script setup lang="ts">
  import moment from "moment";
  import { NPopover, NBadge, NSpace } from "naive-ui";
  import { reactive, ref } from "vue";
  import TodoListModal from "../TodoListModal";
  
  
  const show = ref(false)
  const type = ref(-1);
  
  
  const showModal = (t: number) => {
  type.value = t;
  show.value = true;
  }
  
  
  </script>
  
  
  <style lang="less" scoped>
  .bottom-nav {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 40px;
  display: flex;
  border-top: 1px solid rgba(132, 131, 131, 0.8);
  
  
  [class*="icon-"] {
  -webkit-app-region: no-drag;
  cursor: pointer;
  font-size: 18px;
  
  
  &:hover {
  color: @base-active-color;
  }
  }
  
  
  & > div {
  width: 50%;
  }
  
  
  .left,
  .right {
  [class*="icon-"] {
  margin: 0 5px;
  }
  }
  
  
  .custom-dot {
  :deep(.n-badge-sup) {
  left: 70%;
  bottom: 60%;
  }
  }
  // left
  .left {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-left: 10px;
  & > div {
  color: @base-color;
  }
  }
  // right
  .right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 10px;
  }
  }
  
  
  /* Updated icon classes */
  .icon-check:before {
  content: "✓";
  color: rgb(157, 157, 157); /* Set the default color */
  }
  
  
  .icon-future:before {
  content: "→";
  color: rgb(157, 157, 157); /* Set the default color */
  }
  
  
  .icon-delete:before {
  content: "⌫";
  color: rgb(157, 157, 157); /* Set the default color */
  }
  
  
  .icon-overdue:before {
  content: "⚠";
  color: rgb(157, 157, 157); /* Set the default color */
  }
  
  
  /* Updated icon classes for active tab */
  .icon-check.active:before,
  .icon-check:hover:before {
  color: white; /* Set the white color for active tab and hover */
  }
  
  
  .icon-future.active:before,
  .icon-future:hover:before {
  color: white; /* Set the white color for active tab and hover */
  }
  
  
  .icon-delete.active:before,
  .icon-delete:hover:before {
  color: white; /* Set the white color for active tab and hover */
  }
  
  
  .icon-overdue.active:before,
  .icon-overdue:hover:before {
  color: white; /* Set the white color for active tab and hover */
  }
  </style>
  
  
  
  