<template>
  <transition name="slide-fade">
    <div class="cycle-setting" v-if="show">
      <NCard class="content">
        <NTabs default-value="setting" size="large" justify-content="space-evenly">
          <NTabPane name="select" tab="Reminder"></NTabPane>
          <NTabPane name="setting" tab="Settings">
            <NForm
              ref="formRef"
              size="small"
              label-width="auto"
              label-placement="left"
              :model="model"
              :rules="formRules"
            >
              <NFormItem label="Cycle Mode" path="way">
                <NSelect
                  :on-update:value="changeSelectWay"
                  :options="selectWayOptions"
                  placeholder="Select"
                  :value="model.way"
                />
              </NFormItem>
              <NFormItem
                label="Cycle Setting"
                path="waySetting.ms"
                v-if="model.way > -1 && model.way != RemindWayModel.Daily"
              >
                <!-- Date (Year, Month, Day) -->
                <NDatePicker
                  v-if="model.way == RemindWayModel.Once"
                  to="#date"
                  type="date"
                  format="MM-dd-yyyy"
                  placeholder="MM-DD-YYYY"
                  :on-update:value="selectDate"
                  :value="model.waySetting.ms"
                />
                <!-- Date (Month, Day) -->
                <NDatePicker
                  v-if="model.way == RemindWayModel.Yearly"
                  to="#date"
                  type="date"
                  format="MM-dd"
                  placeholder="MM-DD"
                  :on-update:value="selectDate"
                  :value="model.waySetting.ms"
                />
                <!-- Week Selector -->
                <NSelect
                  v-if="model.way == RemindWayModel.Weekly"
                  :on-update:value="selectWeek"
                  :options="weekOptions"
                  placeholder="Day"
                  :value="model.waySetting?.week"
                />
                <!-- Day Selector -->
                <NSelect
                  v-if="model.way == RemindWayModel.Monthly"
                  :on-update:value="selectDay"
                  :options="dayOptions"
                  :value="model.waySetting?.day"
                  placeholder="DD"
                />
              </NFormItem>
              <NFormItem label="Reminder Time" path="ms">
                <NTimePicker
                  style="width: 100%;"
                  format="HH:mm"
                  placeholder="HH:mm"
                  :on-update:value="selectTimer"
                  :value="model.ms"
                />
              </NFormItem>
            </NForm>
          </NTabPane>
        </NTabs>
        <template #footer>
          <NButton type="error" @click="cancelClick">Cancel</NButton>
          <NButton type="success" @click="sureClick">Confirm</NButton>
        </template>
      </NCard>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, Ref, toRaw, watch } from "vue";
import {
  NButton,
  NTabs,
  NTabPane,
  NCard,
  NForm,
  NFormItem,
  NSelect,
  SelectOption,
  NTimePicker,
  NDatePicker,
  FormRules,
  FormInst,
  NCalendar
} from "naive-ui";
import { RemindModel, RemindWayModel, TodoModel, WeekModel } from "@/common/interface";
import moment from 'moment'

interface Props {
  show: boolean;
  remind: RemindModel
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  remind: null
})


// Form settings
const formRef: Ref<FormInst> = ref(null)
const formRules: FormRules = {
  way: {
    required: true,
    message: "Cycle mode is required"
  },
  ms: {
    required: true,
    message: "Reminder time is required"
  },
  waySetting: {
    ms: {
      required: true,
      message: "Cycle setting is required"
    }
  }
}
let model: Ref<RemindModel> = ref({
  waySetting: {}
})

// if (props.remind) {
//   model.value = props.remind;
// }
watch(() => props.remind, (newV, oldV) => {
  model.value = newV;
})

const emits = defineEmits<{
  (e: "close"): void;
  (e: "ok", todo: RemindModel): void,
  (e: 'update:show', v: boolean): void;
}>()

// Cycle mode
const selectWayOptions: Ref<SelectOption[]> = ref([]);
for (let key in RemindWayModel) {
  if (typeof RemindWayModel[key] == "string") {
    selectWayOptions.value.push({
      label: RemindWayModel[key],
      value: Number(key) as RemindWayModel,
    });
  }
}

// Week
const weekOptions: Ref<SelectOption[]> = ref([]);
for (let key in WeekModel) {
  if (typeof WeekModel[key] == "string") {
    weekOptions.value.push({
      label: WeekModel[key],
      value: key,
    });
  }
}

// Day
const dayOptions: Ref<SelectOption[]> = ref([]);
for (let i = 1; i <= 31; i++) {
  let label;
  if (i === 1 || i === 21 || i === 31) {
    label = i + "st";
  } else if (i === 2 || i === 22) {
    label = i + "nd";
  } else if (i === 3 || i === 23) {
    label = i + "rd";
  } else {
    label = i + "th";
  }
  dayOptions.value.push({
    label,
    value: i,
  });
}
dayOptions.value.push({
  label: "Last day",
  value: 0,
});

// Change cycle mode
const changeSelectWay = (value: RemindWayModel) => {
  model.value.way = value;
  model.value.waySetting = {
    ms: undefined
  }
};
// Change reminder time
const selectTimer = (value) => {
  let time = moment(value);
  model.value.hour = time.hour();
  model.value.minute = time.minute();
  model.value.seconds = time.second();
  model.value.ms = value;
}
// Date
const selectDate = (value) => {
  let date = moment(value);
  model.value.waySetting.month = date.month() + 1;
  model.value.waySetting.day = date.date();
  model.value.waySetting.year = date.year();
  model.value.waySetting.ms = value;
}

// Day of the week
const selectWeek = (value) => {
  model.value.waySetting.week = value as WeekModel;
  model.value.waySetting.ms = 0;
}
// Day
const selectDay = (value) => {
  model.value.waySetting.day = value as number;
  model.value.waySetting.ms = 0;
}
// Click on confirm
const sureClick = () => {
  formRef.value.validate((errors) => {
    if (!errors) {
      emits('ok', toRaw(model.value))
      emits('update:show', false)
    }
  })
}
// Click on cancel
const cancelClick = () => {
  emits('update:show', false)
}


// Calendar
const today = ref(moment().milliseconds())
</script>

<style lang="less">
#date {
  .n-date-panel--date {
    transform: translateX(33px);
  }
}
</style>

<style lang="less" scoped>
/* Different duration and animation function can be set for entering and leaving animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(500px);
}

.cycle-setting {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .content {
    border-radius: 10px;
    width: 85%;
    // height: 50%;
    background: white;

    --n-padding-bottom: 0px !important;

    :deep(.n-card__footer) {
      margin-bottom: 12px;
      display: flex;
      justify-content: space-around;
    }
  }
}
</style>