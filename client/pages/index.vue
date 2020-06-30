<template>
  <div>
    <prism-code-editor
      class="prism-theme-light mx-auto max-w-6xl mt-4"
      style="height: 24rem; max-height: 24rem"
      @input="changeText"
    />
    <p class="mx-auto max-w-6xl mt-8" style="white-space: pre-wrap;">{{ text }}</p>
  </div>
</template>

<script>
import PrismCodeEditor from '~/components/prism-code-editor.vue'

export default {
  components: {
    PrismCodeEditor,
  },
  data() {
    return {
      text: '',
    }
  },
  methods: {
    changeText(newText) {
      this.text = newText
    },
  },
}
</script>
