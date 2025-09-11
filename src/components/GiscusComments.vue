<template>
  <div class="giscus-container">
    <div ref="giscusElement" class="giscus"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

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
