<script setup>
import { computed } from 'vue';

const props = defineProps({
  devices: {
    type: Array,
    required: true
  }
});

const totalDevices = computed(() =>
  props.devices.filter(d => d.device !== 'summary').length
);

const onlineDevices = computed(() =>
  props.devices.filter(d => d.running).length
);
</script>

<template>
  <div class="bg-white rounded-lg not-dark:shadow-md p-6 dark:bg-[#181a1b]">
    <div class="grid grid-cols-2 gap-4">
      <div class="border border-gray-200 dark:border-[#384456] rounded-lg p-4 text-center not-dark:shadow-md">
        <h3 class="text-gray-500 text-sm font-medium flex items-center justify-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          总设备数
        </h3>
        <p class="text-2xl font-bold mt-2">{{ totalDevices }}</p>
      </div>
      <div class="border border-gray-200 dark:border-[#384456] rounded-lg p-4 text-center not-dark:shadow-md">
        <h3 class="text-gray-500 text-sm font-medium flex items-center justify-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
          在线设备数
        </h3>
        <p class="text-2xl font-bold mt-2 text-green-600">
          {{ onlineDevices }}
        </p>
      </div>
    </div>
  </div>
</template>
