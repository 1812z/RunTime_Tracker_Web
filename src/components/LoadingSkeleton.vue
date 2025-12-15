<template>
  <div class="bg-gray-100 min-h-screen rounded-lg dark:bg-[#1e2022]">
    <div class="max-w-7xl mx-auto px-4">
      <!-- 标题骨架 -->
      <div class="h-12 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mx-auto w-96 mt-8 mb-8"></div>

      <div class="flex flex-col lg:flex-row gap-6 pb-6">
        <!-- 左侧骨架 -->
        <div class="space-y-6 w-full lg:w-96">
          <div class="h-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div class="h-64 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div class="h-48 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        <!-- 右侧骨架 -->
        <div class="flex-1">
          <div class="h-96 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
