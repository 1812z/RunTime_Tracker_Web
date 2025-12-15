<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['error', 'success'].includes(value)
  }
});
</script>

<template>
  <div v-if="show" class="fixed top-4 right-4 z-50 w-auto transition-all duration-300">
    <div class="px-4 py-3 rounded-lg shadow-lg" :class="{
        'bg-red-50 border border-red-200 text-red-700': type === 'error',
        'bg-green-50 border border-green-200 text-green-700': type === 'success'
      }">
      <div class="flex items-start">
        <svg v-if="type === 'error'" class="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <svg v-else class="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="text-sm">{{ message }}</span>
      </div>
    </div>
  </div>
</template>
