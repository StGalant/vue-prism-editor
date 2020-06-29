<template>
  <div>
    <prism-code-editor class="prism-theme-light mx-auto max-w-6xl mt-4" style="height: 24rem; max-height: 24rem" />
  </div>
</template>

<script>
import PrismCodeEditor from '~/components/prism-code-editor.vue'

export default {
  components: {
    PrismCodeEditor,
  },
  data() {
    return {}
  },
}
</script>
