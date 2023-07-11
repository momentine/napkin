<template>
  <div class="home" :class="{ leave: leave }">
    <NMessageProvider>
        <NConfigProvider :locale="enUS" :date-locale="dateEnUS">
        <TopNav v-model:lock="lock" />
        <Content />
        <BottomNav />
        <button class="sticker-button" @click="showStickerPicker">
          <span class="sticker-button-text">+ Background</span>
        </button>
        <div class="sticker-picker" v-show="stickerPickerVisible">
          <div class="sticker-picker-header">
            <button class="reset-button" @click="resetBackground">
              <span class="reset-icon">&#8634;</span>
            </button>
            <button class="close-button" @click="closeStickerPicker">
              <span class="close-icon">×</span>
            </button>
          </div>
          <div class="sticker-list">
            <div v-for="sticker in stickers" :key="sticker" class="sticker-item" @click="applySticker(sticker)">
              <img :src="getStickerPath(sticker)" alt="Sticker" class="sticker-image" />
            </div>
          </div>
        </div>
        <div class="overlay" v-if="selectedSticker">
          <img :src="getStickerPath(selectedSticker)" alt="Selected Sticker" class="selected-sticker" />
        </div>
      </NConfigProvider>
    </NMessageProvider>
  </div>
</template>

<script setup lang="ts">
import { NMessageProvider, NConfigProvider, enUS, dateEnUS } from "naive-ui";
import { computed, onMounted, ref, watch } from "vue";
import TopNav from "@app/components/TopNav";
import Content from "@app/components/Content";
import BottomNav from "@app/components/BottomNav";
import { leaveToZero, moveToZero } from "@/app/utils/event";
import remote from "@/app/utils/render";

const win = remote.getCurrentWindow();
win.setIgnoreMouseEvents(false);

// lock
const lock = ref(false);
watch(lock, (newV) => {
  if (newV) {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  } else {
    if (win.getPosition()[1] <= 0) {
      initInfo();
    }
  }
});

// hide
const leave = ref(false);
let intervalId;
const checkShowOrHidden = () => {
  const cursorPos = remote.screen.getCursorScreenPoint();
  if (!leave.value) {
    if ((cursorPos.x < posXMin || cursorPos.x > posXMax) || (cursorPos.y > posYMax)) {
      leave.value = true;
      win.setIgnoreMouseEvents(true, { forward: true });
    }
  } else {
    if (cursorPos.x >= posXMin && cursorPos.x <= posXMax && cursorPos.y < posYMaxHidden) {
      leave.value = false;
      remote.getCurrentWindow().setIgnoreMouseEvents(false);
    }
  }
};

// Whether it is possible to hide the edge
const canHidden = ref(true);
let posXMin = 0;
let posXMax = 0;
let posYMin = win.getPosition()[1];
let posYMax = 0;
let posYMaxHidden = 2;
const initInfo = () => {
  let size = win.getSize();
  posXMin = win.getPosition()[0];
  posXMax = posXMin + size[0]; 
  posYMin = 0;
  posYMax = size[1];
  canHidden.value = true;
  win.setResizable(false);
  if (!intervalId) intervalId = setInterval(checkShowOrHidden, 300);
};

// Stickers
const stickers = ["bear.png", "bunny.png","sheep.png"];
const selectedSticker = ref(null);
const stickerPickerVisible = ref(false);
function showStickerPicker() {
  stickerPickerVisible.value = true;
}
function closeStickerPicker() {
  stickerPickerVisible.value = false;
}
function applySticker(sticker) {
  selectedSticker.value = sticker;
  stickerPickerVisible.value = false;
}
function getStickerPath(sticker) {
  return `/public/${sticker}`;
}

function resetBackground() {
  selectedSticker.value = null;
  // Additional logic to remove or reset the background
}

if (posYMin <= 0) initInfo();
moveToZero(initInfo);
leaveToZero(() => {
  win.setResizable(true);
  canHidden.value = false;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
});
</script>

<style lang="less" scoped>
.home {
  position: relative;
  width: 100%;
  height: 100%;
  background: fade(#414141, 50%);
  transition: all 0.3s ease-out;
}

.sticker-button {
  position: fixed;
  bottom: 10px;
  right: 20px;
  z-index: 10;
  background-color: transparent;
  border: none;
  padding: 0;
  font-size: 12px;
  color: rgb(157, 157, 157);
  cursor: pointer;
}

.sticker-button:hover,
.sticker-button:focus {
  color: #fff;
}

.sticker-button-text {
  background-color: transparent;
}

.sticker-picker {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 10;
  background-color: #474747;
  border-radius: 4px;
  padding: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sticker-picker-header {
  background-color: #474747;
  padding: 0.5px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  position: sticky;
  top: 0;
  z-index: 1;
}

.reset-button {
  background-color: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  margin-right: 8px;
}

.reset-icon {
  color: #b3b3b3;
  font-size: 16px;
}

.close-button {
  background-color: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
}

.close-icon {
  color: #b3b3b3;
  font-size: 20px;
}

.sticker-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
  gap: 8px;
  flex: 1;
  max-height: 160px;
  overflow-y: auto;
}

.sticker-item {
  cursor: pointer;
}
.sticker-image {
  width: 64px;
  height: 64px;
  object-fit: contain;
  transform: scale(2); /* Adjust the desired zoom level */
  transform-origin: center;
}


.overlay {
  position: absolute;
  top: 50%;
 left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.selected-sticker {
  opacity: 0.5;
}

.leave {
  transform: translateY(-100%);
}

</style>


