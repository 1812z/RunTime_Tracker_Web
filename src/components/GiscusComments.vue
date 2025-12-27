<template>
  <div class="bg-white rounded-lg not-dark:shadow-md p-6 dark:bg-[#181a1b]">
    <div class=" flex justify-between items-center">
      <h2 class="text-xl font-semibold flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        在线互动
      </h2>
      <!-- 添加开关按钮 -->
      <label class="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" v-model="showComments" class="sr-only peer" aria-label="切换评论显示">
        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 dark:peer-focus:ring-1 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-500 after:border-gray-300 not-dark:after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:bg-[#25282a] dark:peer-checked:bg-blue-900"></div>
        <span class="sr-only">切换评论显示</span>
      </label>
    </div>
    <div v-show="showComments" class="overflow-y-auto h-[64vh] mt-4">
      <div class="giscus-container">
        <div ref="giscusElement" class="giscus"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const showComments = ref(false);
const props = defineProps({
  repo: {
    type: String,
    default: '1812z/Comment'
  },
  repoId: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'General'
  },
  categoryId: {
    type: String,
    default: ''
  },
  mapping: {
    type: String,
    default: 'pathname'
  },
  reactionsEnabled: {
    type: String,
    default: '1'
  },
  emitMetadata: {
    type: String,
    default: '0'
  },
  inputPosition: {
    type: String,
    default: 'bottom'
  },
  theme: {
    type: String,
    default: 'preferred_color_scheme'
  },
  lang: {
    type: String,
    default: 'zh-CN'
  }
})

const giscusElement = ref(null)

const loadGiscus = () => {
  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'
  script.setAttribute('data-repo', props.repo)
  script.setAttribute('data-repo-id', props.repoId)
  script.setAttribute('data-category', props.category)
  script.setAttribute('data-category-id', props.categoryId)
  script.setAttribute('data-mapping', props.mapping)
  script.setAttribute('data-strict', '1')
  script.setAttribute('data-reactions-enabled', props.reactionsEnabled)
  script.setAttribute('data-emit-metadata', props.emitMetadata)
  script.setAttribute('data-input-position', props.inputPosition)
  script.setAttribute('data-theme', props.theme)
  script.setAttribute('data-lang', props.lang)

  // 清除旧的评论容器内容
  while (giscusElement.value.firstChild) {
    giscusElement.value.removeChild(giscusElement.value.firstChild)
  }

  // 添加新的脚本
  giscusElement.value.appendChild(script)
}

onMounted(() => {
  loadGiscus()
})

// 如果属性变化，重新加载
watch(props, () => {
  loadGiscus()
})
</script>

<style scoped>
</style>
